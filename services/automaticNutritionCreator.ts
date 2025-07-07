import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  NutritionChallenge, 
  NutritionChallengeDay, 
  CreateNutritionChallengeRequest,
  NutritionMeal 
} from '../types/nutritionChallenges';
import { getDeepSeekAdvice } from './deepSeekService';
import { AIPersona } from '../types';
import { validateAndRecordAction } from './abuseProtectionService';
import { validateNewChallengeCreation } from './limitsValidationService';
import { 
  getNutritionChallengeMemoryContext, 
  formatMemoryContextForAI 
} from './aiMemoryService';
import AnalyticsService from './analyticsService';

/**
 * Helper function to get user email from Firestore
 */
const getUserEmail = async (userId: string): Promise<string | undefined> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data()?.email : undefined;
  } catch (error) {
    console.error('Error fetching user email:', error);
    return undefined;
  }
};

/**
 * Crea automáticamente un reto nutricional completo con todos sus días en Firestore
 * Estructura: nutrition_challenges/{challengeId}/days/{dayId}
 * Incluye protecciones contra abuso y spam
 */
export const crearRetoNutricionalCompletoAutomatico = async (
  userId: string,
  datosRetoBase: CreateNutritionChallengeRequest,
  isPremium: boolean = false
): Promise<string> => {
  try {
    console.log('🥗 Iniciando creación automática del reto nutricional...');
    
    // Paso 0: Validar límites y protección contra abuso
    const limitValidation = await validateNewChallengeCreation(
      userId, 
      datosRetoBase.totalDays, 
      isPremium
    );
    
    if (!limitValidation.isValid) {
      throw new Error(limitValidation.error || 'Límites de creación excedidos');
    }
    
    // Obtener email del usuario para alertas
    const userEmail = await getUserEmail(userId);
    
    // Validar rate limiting
    const rateLimitResult = await validateAndRecordAction(userId, 'challenge_creation', {
      totalDays: datosRetoBase.totalDays,
      challengeType: datosRetoBase.challengeType,
      difficulty: datosRetoBase.difficulty,
    }, userEmail);
    
    if (!rateLimitResult.allowed) {
      throw new Error(rateLimitResult.reason || 'Demasiadas solicitudes. Inténtalo más tarde.');
    }
    
    // Paso 1: Crear el documento del reto principal
    const challengeId = await crearRetoNutricionalPrincipal(userId, datosRetoBase);
    console.log(`✅ Reto nutricional creado con ID: ${challengeId}`);
    
    // Paso 2: Generar y crear todos los días automáticamente
    await crearTodosLosDiasRetoNutricionalIA(userId, challengeId, datosRetoBase, userEmail);
    console.log(`✅ Todos los ${datosRetoBase.totalDays} días del reto nutricional creados exitosamente`);
    
    // 📊 Track challenge creation en Analytics
    AnalyticsService.trackChallengeCreation(
      datosRetoBase.challengeType,
      datosRetoBase.totalDays,
      datosRetoBase.difficulty
    );
    
    return challengeId;
  } catch (error) {
    console.error('❌ Error creando reto nutricional automático:', error);
    throw error;
  }
};

/**
 * Paso 1: Crear el documento del reto nutricional principal
 */
const crearRetoNutricionalPrincipal = async (
  userId: string, 
  datosRetoBase: CreateNutritionChallengeRequest
): Promise<string> => {
  const challengeRef = doc(collection(db, 'nutrition_challenges'));
  const challengeId = challengeRef.id;

  const challengeData: NutritionChallenge = {
    id: challengeId,
    userId,
    name: datosRetoBase.name,
    description: datosRetoBase.description,
    totalDays: datosRetoBase.totalDays,
    currentDay: 1,
    status: 'active',
    challengeType: datosRetoBase.challengeType,
    difficulty: datosRetoBase.difficulty,
    userProfile: datosRetoBase.userProfile,
    settings: datosRetoBase.settings,
    progress: {
      completedDays: 0,
      totalMealsCompleted: 0,
      waterIntakeAverage: 0,
      weightProgress: {
        startWeight: datosRetoBase.userProfile.weight,
        currentWeight: datosRetoBase.userProfile.weight,
        targetWeight: null,
        weightEntries: [],
      },
      averageRating: 0,
      streakDays: 0,
      lastCompletedDate: null,
    },
    aiMemory: {
      preferredMeals: [],
      dislikedMeals: [],
      successfulRecipes: [],
      energyLevelPattern: 'consistent',
      adherencePattern: 'excellent',
      adaptationHistory: [],
      macroPreferences: {
        protein: 'moderate',
        carbs: 'moderate',
        fats: 'moderate',
      },
    },
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  };

  await setDoc(challengeRef, challengeData);
  return challengeId;
};

/**
 * Paso 2: Crear todos los días del reto nutricional con IA
 */
const crearTodosLosDiasRetoNutricionalIA = async (
  userId: string,
  challengeId: string,
  datosRetoBase: CreateNutritionChallengeRequest,
  userEmail?: string
): Promise<void> => {
  const totalDias = datosRetoBase.totalDays;
  
  for (let dia = 1; dia <= totalDias; dia++) {
    try {
      console.log(`🍽️ Generando día nutricional ${dia}/${totalDias}...`);
      
      // Validar rate limiting para creación de días nutricionales
      const rateLimitResult = await validateAndRecordAction(userId, 'day_creation', {
        challengeId,
        dayNumber: dia,
        totalDays: totalDias,
        type: 'nutrition',
      }, userEmail);
      
      if (!rateLimitResult.allowed) {
        console.warn(`⚠️ Rate limit alcanzado en día nutricional ${dia}: ${rateLimitResult.reason}`);
        // Esperar el tiempo recomendado antes de continuar
        const retryAfter = rateLimitResult.retryAfter || 60;
        if (retryAfter < 300) { // máximo 5 minutos
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        } else {
          throw new Error(`Rate limit excedido: ${rateLimitResult.reason}`);
        }
      }
      
      // Determinar tipo de día (prep day, detox day, etc.)
      const tipoDia = determinarTipoDiaNutricional(dia, datosRetoBase);
      
      if (tipoDia === 'prep_day') {
        await crearDiaPreparacionNutricional(challengeId, dia, datosRetoBase);
      } else {
        // Generar día regular con IA
        await generarDiaNutricionalConIA(challengeId, dia, datosRetoBase, tipoDia);
      }
      
      // Pausa progresiva para evitar rate limiting
      const pauseTime = Math.min(800 + (dia * 80), 4000); // incrementa gradualmente
      if (dia % 3 === 0) {
        console.log(`⏱️ Pausa para evitar rate limiting... (${dia}/${totalDias})`);
        await new Promise(resolve => setTimeout(resolve, pauseTime));
      }
      
    } catch (error) {
      console.error(`❌ Error generando día nutricional ${dia}:`, error);
      // Crear día de fallback si la IA falla
      await crearDiaNutricionalFallback(challengeId, dia, datosRetoBase);
    }
  }
};

/**
 * Generar día nutricional con IA contextual y memoria
 */
const generarDiaNutricionalConIA = async (
  challengeId: string,
  dia: number,
  datosRetoBase: CreateNutritionChallengeRequest,
  tipoDia: string
): Promise<void> => {
  try {
    // 🧠 Obtener memoria contextual de días anteriores
    const memoryContext = await getNutritionChallengeMemoryContext(challengeId, dia);
    const contextoMemoria = formatMemoryContextForAI(memoryContext);
    
    const contextoNutricional = construirContextoNutricional(dia, datosRetoBase, contextoMemoria);
    
    const respuestaIA = await getDeepSeekAdvice(
      contextoNutricional,
      AIPersona.NUTRITION_PLAN_GENERATOR // Usar generador de planes nutricionales
    );
    
    if (respuestaIA) {
      const planNutricional = parsearRespuestaIANutricion(respuestaIA);
      await crearDiaNutricionalEnFirestore(challengeId, dia, planNutricional, datosRetoBase, tipoDia);
    } else {
      throw new Error('No response from AI');
    }
    
  } catch (error) {
    console.log(`⚠️ IA no disponible para día ${dia}, usando plan predefinido`);
    await crearDiaNutricionalFallback(challengeId, dia, datosRetoBase);
  }
};

/**
 * Construir contexto para la IA nutricional con memoria
 */
const construirContextoNutricional = (
  dia: number,
  datosRetoBase: CreateNutritionChallengeRequest,
  contextoMemoria: string = ''
): string => {
  const { userProfile, challengeType, difficulty } = datosRetoBase;
  
  return `
Crea un plan nutricional detallado para el día ${dia} de un reto de ${datosRetoBase.totalDays} días.

PERFIL DEL USUARIO:
- Edad: ${userProfile.age} años
- Peso: ${userProfile.weight}kg, Altura: ${userProfile.height}cm
- Nivel de actividad: ${userProfile.activityLevel}
- Objetivo: ${userProfile.goal}
- Estilo dietético: ${userProfile.dietaryStyle}
- Alergias: ${userProfile.allergies.join(', ') || 'Ninguna'}
- No le gustan: ${userProfile.foodDislikes.join(', ') || 'Ninguna'}
- Nivel de cocina: ${userProfile.cookingSkill}
- Tiempo de preparación disponible: ${userProfile.mealPrepTime} minutos
- Presupuesto: ${userProfile.budget}

CONFIGURACIÓN DEL RETO:
- Tipo de reto: ${challengeType}
- Dificultad: ${difficulty}
- Comidas por día: ${datosRetoBase.settings.mealsPerDay}
- Incluir snacks: ${datosRetoBase.settings.snacksIncluded ? 'Sí' : 'No'}
- Meta de agua: ${datosRetoBase.settings.waterGoal}ml
- Seguimiento de macros: ${datosRetoBase.settings.trackMacros ? 'Sí' : 'No'}

${contextoMemoria ? `🧠 MEMORIA NUTRICIONAL:\n${contextoMemoria}\n` : ''}

INSTRUCCIONES:
1. Crea un plan nutricional completo para el día ${dia}
2. Incluye ${datosRetoBase.settings.mealsPerDay} comidas principales
3. ${datosRetoBase.settings.snacksIncluded ? 'Agrega 1-2 snacks saludables' : ''}
4. Cada receta debe incluir:
   - Nombre atractivo
   - Descripción breve
   - Lista de ingredientes con cantidades exactas
   - Instrucciones paso a paso
   - Información nutricional (calorías, proteínas, carbohidratos, grasas)
   - Tiempo de preparación y cocción
   - Etiquetas (vegetariano, alto en proteína, etc.)

5. Considera el estilo dietético y restricciones del usuario
6. Varía los sabores y tipos de cocina
7. Incluye consejos de hidratación y bienestar

Responde en formato JSON estructurado.
  `.trim();
};

/**
 * Parsear respuesta de IA para nutrición
 */
const parsearRespuestaIANutricion = (respuestaIA: string): any => {
  try {
    // Intentar extraer JSON de la respuesta
    const jsonMatch = respuestaIA.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No se encontró JSON válido en la respuesta');
  } catch (error) {
    console.log('❌ Error parseando respuesta IA, usando estructura básica');
    return null;
  }
};

/**
 * Crear día nutricional en Firestore con datos de IA
 */
const crearDiaNutricionalEnFirestore = async (
  challengeId: string,
  dia: number,
  planIA: any,
  datosRetoBase: CreateNutritionChallengeRequest,
  tipoDia: string
): Promise<void> => {
  const dayId = `day${dia}`;
  
  const comidasGeneradas = planIA?.meals || generarComidasFallback(datosRetoBase);
  const caloriasTotales = comidasGeneradas.reduce((total: number, meal: any) => total + (meal.nutrition?.calories || 0), 0);
  
  const diaData: NutritionChallengeDay = {
    id: dayId,
    challengeId,
    dayNumber: dia,
    date: null,
    dayType: tipoDia as any,
    theme: planIA?.theme || `Día ${dia}: Nutrición Balanceada`,
    estimatedPrepTime: planIA?.prepTime || 45,
    difficulty: datosRetoBase.difficulty,
    nutritionPlan: {
      title: planIA?.title || `Plan Nutricional - Día ${dia}`,
      description: planIA?.description || 'Plan nutricional balanceado y delicioso',
      focusAreas: planIA?.focusAreas || ['nutrición balanceada', 'hidratación', 'variedad'],
      dailyCalories: caloriasTotales,
      macros: planIA?.macros || {
        protein: Math.round(caloriasTotales * 0.25 / 4),
        carbs: Math.round(caloriasTotales * 0.45 / 4),
        fats: Math.round(caloriasTotales * 0.30 / 9),
        fiber: 25,
      },
      waterGoal: datosRetoBase.settings.waterGoal,
    },
    meals: comidasGeneradas,
    completion: {
      status: 'not_started',
      startedAt: null,
      completedAt: null,
      waterIntake: 0,
      weightRecorded: null,
      userRating: null,
      userFeedback: null,
      completedMeals: 0,
      totalMeals: comidasGeneradas.length,
      energyLevel: null,
      hungerLevel: null,
      adherenceScore: 0,
    },
    performance: {
      mealSatisfaction: {},
      cravingsLevel: null,
      digestiveWellness: null,
      moodAfterMeals: null,
      modifications: [],
      notes: null,
    },
    aiContext: {
      previousDaysSummary: dia > 1 ? `Día ${dia} del reto nutricional` : 'Primer día del reto',
      adaptationSuggestions: planIA?.suggestions || [],
      nextDayPreparation: planIA?.nextDayTips || 'Prepara ingredientes frescos',
      groceryListItems: extraerIngredientesParaCompras(comidasGeneradas),
      hydrationReminders: [
        'Bebe un vaso de agua al despertar',
        'Mantente hidratado entre comidas',
        'Bebe agua antes de sentir sed'
      ],
    },
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  };

  const dayRef = doc(db, 'nutrition_challenges', challengeId, 'days', dayId);
  await setDoc(dayRef, diaData);
  console.log(`✅ Día nutricional ${dia} creado con ${comidasGeneradas.length} comidas`);
};

/**
 * Determinar tipo de día nutricional
 */
const determinarTipoDiaNutricional = (dia: number, datosRetoBase: CreateNutritionChallengeRequest): string => {
  // Día de preparación cada domingo
  if (dia % 7 === datosRetoBase.settings.mealPrepDay) {
    return 'prep_day';
  }
  
  // Día de detox cada 10 días para retos de detox
  if (datosRetoBase.challengeType === 'detox' && dia % 10 === 0) {
    return 'detox_day';
  }
  
  // Día de evaluación al final
  if (dia === datosRetoBase.totalDays) {
    return 'assessment';
  }
  
  return 'regular';
};

/**
 * Crear día de preparación nutricional
 */
const crearDiaPreparacionNutricional = async (
  challengeId: string,
  dia: number,
  datosRetoBase: CreateNutritionChallengeRequest
): Promise<void> => {
  const dayId = `day${dia}`;
  
  const diaData: NutritionChallengeDay = {
    id: dayId,
    challengeId,
    dayNumber: dia,
    date: null,
    dayType: 'prep_day',
    theme: `Día ${dia}: Preparación y Planificación`,
    estimatedPrepTime: 120, // 2 horas para meal prep
    difficulty: 'beginner',
    nutritionPlan: {
      title: 'Día de Preparación de Comidas',
      description: 'Prepara comidas para los próximos días y organiza tu cocina',
      focusAreas: ['preparación', 'organización', 'planificación'],
      dailyCalories: 1800, // día ligero
      macros: { protein: 100, carbs: 180, fats: 60, fiber: 25 },
      waterGoal: datosRetoBase.settings.waterGoal,
    },
    meals: generarComidasPreparacion(),
    completion: {
      status: 'not_started',
      startedAt: null,
      completedAt: null,
      waterIntake: 0,
      weightRecorded: null,
      userRating: null,
      userFeedback: null,
      completedMeals: 0,
      totalMeals: 3,
      energyLevel: null,
      hungerLevel: null,
      adherenceScore: 0,
    },
    performance: {
      mealSatisfaction: {},
      cravingsLevel: null,
      digestiveWellness: null,
      moodAfterMeals: null,
      modifications: [],
      notes: null,
    },
    aiContext: {
      previousDaysSummary: '',
      adaptationSuggestions: ['Prepara proteínas en lotes', 'Corta vegetales para la semana'],
      nextDayPreparation: 'Comidas preparadas listas para consumir',
      groceryListItems: ['Contenedores de vidrio', 'Proteínas variadas', 'Vegetales frescos'],
      hydrationReminders: ['Mantente hidratado mientras cocinas'],
    },
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  };

  const dayRef = doc(db, 'nutrition_challenges', challengeId, 'days', dayId);
  await setDoc(dayRef, diaData);
  console.log(`✅ Día de preparación nutricional ${dia} creado`);
};

/**
 * Crear día nutricional de fallback
 */
const crearDiaNutricionalFallback = async (
  challengeId: string,
  dia: number,
  datosRetoBase: CreateNutritionChallengeRequest
): Promise<void> => {
  const dayId = `day${dia}`;
  const comidasFallback = generarComidasFallback(datosRetoBase);
  
  const diaData: NutritionChallengeDay = {
    id: dayId,
    challengeId,
    dayNumber: dia,
    date: null,
    dayType: 'regular',
    theme: `Día ${dia}: Nutrición Equilibrada`,
    estimatedPrepTime: 30,
    difficulty: datosRetoBase.difficulty,
    nutritionPlan: {
      title: `Plan Nutricional - Día ${dia}`,
      description: 'Plan nutricional balanceado con recetas sencillas y nutritivas',
      focusAreas: ['nutrición balanceada', 'simplicidad', 'sabor'],
      dailyCalories: 1800,
      macros: { protein: 120, carbs: 200, fats: 70, fiber: 30 },
      waterGoal: datosRetoBase.settings.waterGoal,
    },
    meals: comidasFallback,
    completion: {
      status: 'not_started',
      startedAt: null,
      completedAt: null,
      waterIntake: 0,
      weightRecorded: null,
      userRating: null,
      userFeedback: null,
      completedMeals: 0,
      totalMeals: comidasFallback.length,
      energyLevel: null,
      hungerLevel: null,
      adherenceScore: 0,
    },
    performance: {
      mealSatisfaction: {},
      cravingsLevel: null,
      digestiveWellness: null,
      moodAfterMeals: null,
      modifications: [],
      notes: null,
    },
    aiContext: {
      previousDaysSummary: '',
      adaptationSuggestions: [],
      nextDayPreparation: 'Prepara ingredientes frescos',
      groceryListItems: extraerIngredientesParaCompras(comidasFallback),
      hydrationReminders: ['Bebe agua regularmente durante el día'],
    },
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  };

  const dayRef = doc(db, 'nutrition_challenges', challengeId, 'days', dayId);
  await setDoc(dayRef, diaData);
  console.log(`✅ Día nutricional fallback ${dia} creado`);
};

/**
 * Generar comidas de fallback
 */
const generarComidasFallback = (datosRetoBase: CreateNutritionChallengeRequest): NutritionMeal[] => {
  const comidas: NutritionMeal[] = [];
  
  // Desayuno
  comidas.push({
    id: 'breakfast-1',
    type: 'breakfast',
    name: 'Avena con Frutas y Nueces',
    description: 'Desayuno energético y nutritivo para empezar el día',
    ingredients: [
      { name: 'Avena integral', amount: 50, unit: 'g', calories: 190, protein: 7, carbs: 32, fats: 3, isOptional: false, category: 'carbs' },
      { name: 'Plátano', amount: 1, unit: 'pieza', calories: 105, protein: 1, carbs: 27, fats: 0, isOptional: false, category: 'fruits' },
      { name: 'Nueces', amount: 15, unit: 'g', calories: 98, protein: 2, carbs: 2, fats: 10, isOptional: false, category: 'fats' },
      { name: 'Leche de almendras', amount: 200, unit: 'ml', calories: 26, protein: 1, carbs: 3, fats: 1, isOptional: false, category: 'dairy' }
    ],
    instructions: [
      'Cocina la avena con la leche de almendras',
      'Agrega el plátano en rodajas',
      'Espolvorea las nueces picadas por encima'
    ],
    prepTime: 10,
    cookTime: 5,
    servings: 1,
    difficulty: 'easy',
    nutrition: { calories: 419, protein: 11, carbs: 64, fats: 14, fiber: 8, sugar: 20, sodium: 50 },
    tags: ['alto-fibra', 'vegetariano', 'rápido'],
    cuisineType: 'internacional',
    season: ['all-year'],
    mealPrepFriendly: true,
    budgetFriendly: true,
    substitutions: [
      { ingredient: 'Leche de almendras', alternatives: ['Leche de avena', 'Leche descremada'], reason: 'preferencia láctea' }
    ],
    targetSatisfaction: 8,
    actualPerformance: null
  });

  // Almuerzo
  comidas.push({
    id: 'lunch-1',
    type: 'lunch',
    name: 'Ensalada de Pollo con Quinoa',
    description: 'Almuerzo completo y balanceado rico en proteínas',
    ingredients: [
      { name: 'Pechuga de pollo', amount: 100, unit: 'g', calories: 165, protein: 31, carbs: 0, fats: 4, isOptional: false, category: 'protein' },
      { name: 'Quinoa cocida', amount: 80, unit: 'g', calories: 120, protein: 4, carbs: 22, fats: 2, isOptional: false, category: 'carbs' },
      { name: 'Lechuga mixta', amount: 50, unit: 'g', calories: 10, protein: 1, carbs: 2, fats: 0, isOptional: false, category: 'vegetables' },
      { name: 'Tomates cherry', amount: 100, unit: 'g', calories: 18, protein: 1, carbs: 4, fats: 0, isOptional: false, category: 'vegetables' },
      { name: 'Aceite de oliva', amount: 10, unit: 'ml', calories: 82, protein: 0, carbs: 0, fats: 9, isOptional: false, category: 'fats' }
    ],
    instructions: [
      'Cocina la pechuga de pollo a la plancha',
      'Mezcla la quinoa con los vegetales',
      'Corta el pollo en tiras y agrégalo a la ensalada',
      'Aliña con aceite de oliva y especias'
    ],
    prepTime: 15,
    cookTime: 10,
    servings: 1,
    difficulty: 'easy',
    nutrition: { calories: 395, protein: 37, carbs: 28, fats: 15, fiber: 4, sugar: 6, sodium: 200 },
    tags: ['alto-proteína', 'sin-gluten', 'saludable'],
    cuisineType: 'mediterránea',
    season: ['all-year'],
    mealPrepFriendly: true,
    budgetFriendly: true,
    substitutions: [
      { ingredient: 'Pollo', alternatives: ['Tofu', 'Legumbres'], reason: 'vegetariano' }
    ],
    targetSatisfaction: 8,
    actualPerformance: null
  });

  // Cena
  comidas.push({
    id: 'dinner-1',
    type: 'dinner',
    name: 'Salmón con Vegetales al Vapor',
    description: 'Cena ligera y nutritiva rica en omega-3',
    ingredients: [
      { name: 'Filete de salmón', amount: 120, unit: 'g', calories: 206, protein: 22, carbs: 0, fats: 12, isOptional: false, category: 'protein' },
      { name: 'Brócoli', amount: 150, unit: 'g', calories: 34, protein: 3, carbs: 7, fats: 0, isOptional: false, category: 'vegetables' },
      { name: 'Zanahoria', amount: 100, unit: 'g', calories: 41, protein: 1, carbs: 10, fats: 0, isOptional: false, category: 'vegetables' },
      { name: 'Limón', amount: 0.5, unit: 'pieza', calories: 8, protein: 0, carbs: 2, fats: 0, isOptional: false, category: 'other' }
    ],
    instructions: [
      'Cocina el salmón a la plancha con limón',
      'Cuece los vegetales al vapor hasta que estén tiernos',
      'Sirve el salmón acompañado de los vegetales'
    ],
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    difficulty: 'medium',
    nutrition: { calories: 289, protein: 26, carbs: 19, fats: 12, fiber: 6, sugar: 12, sodium: 150 },
    tags: ['omega-3', 'bajo-carbohidratos', 'antiinflamatorio'],
    cuisineType: 'mediterránea',
    season: ['all-year'],
    mealPrepFriendly: false,
    budgetFriendly: false,
    substitutions: [
      { ingredient: 'Salmón', alternatives: ['Trucha', 'Bacalao'], reason: 'disponibilidad' }
    ],
    targetSatisfaction: 9,
    actualPerformance: null
  });

  // Agregar snacks si están habilitados
  if (datosRetoBase.settings.snacksIncluded) {
    comidas.push({
      id: 'snack-1',
      type: 'snack1',
      name: 'Yogur con Almendras',
      description: 'Snack proteico y cremoso',
      ingredients: [
        { name: 'Yogur griego natural', amount: 150, unit: 'g', calories: 100, protein: 15, carbs: 6, fats: 0, isOptional: false, category: 'dairy' },
        { name: 'Almendras', amount: 15, unit: 'g', calories: 87, protein: 3, carbs: 3, fats: 7, isOptional: false, category: 'fats' }
      ],
      instructions: ['Sirve el yogur en un bowl', 'Agrega las almendras picadas'],
      prepTime: 2,
      cookTime: 0,
      servings: 1,
      difficulty: 'easy',
      nutrition: { calories: 187, protein: 18, carbs: 9, fats: 7, fiber: 2, sugar: 6, sodium: 50 },
      tags: ['alto-proteína', 'probióticos', 'rápido'],
      cuisineType: 'internacional',
      season: ['all-year'],
      mealPrepFriendly: true,
      budgetFriendly: true,
      substitutions: [
        { ingredient: 'Yogur griego', alternatives: ['Yogur de coco', 'Queso cottage'], reason: 'intolerancia láctea' }
      ],
      targetSatisfaction: 7,
      actualPerformance: null
    });
  }

  return comidas;
};

/**
 * Generar comidas para día de preparación
 */
const generarComidasPreparacion = (): NutritionMeal[] => {
  return [
    {
      id: 'prep-breakfast',
      type: 'breakfast',
      name: 'Batido Verde Energizante',
      description: 'Batido rápido para energizar durante el meal prep',
      ingredients: [
        { name: 'Espinacas', amount: 30, unit: 'g', calories: 7, protein: 1, carbs: 1, fats: 0, isOptional: false, category: 'vegetables' },
        { name: 'Plátano', amount: 1, unit: 'pieza', calories: 105, protein: 1, carbs: 27, fats: 0, isOptional: false, category: 'fruits' },
        { name: 'Proteína en polvo', amount: 25, unit: 'g', calories: 100, protein: 20, carbs: 2, fats: 1, isOptional: false, category: 'protein' }
      ],
      instructions: ['Licua todos los ingredientes con hielo'],
      prepTime: 3,
      cookTime: 0,
      servings: 1,
      difficulty: 'easy',
      nutrition: { calories: 212, protein: 22, carbs: 30, fats: 1, fiber: 4, sugar: 18, sodium: 30 },
      tags: ['proteico', 'verde', 'rápido'],
      cuisineType: 'internacional',
      season: ['all-year'],
      mealPrepFriendly: false,
      budgetFriendly: true,
      substitutions: [],
      targetSatisfaction: 8,
      actualPerformance: null
    }
    // Agregar más comidas de preparación...
  ];
};

/**
 * Extraer ingredientes para lista de compras
 */
const extraerIngredientesParaCompras = (comidas: NutritionMeal[]): string[] => {
  const ingredientes = new Set<string>();
  
  comidas.forEach(comida => {
    comida.ingredients.forEach(ingrediente => {
      if (!ingrediente.isOptional) {
        ingredientes.add(ingrediente.name);
      }
    });
  });
  
  return Array.from(ingredientes);
};

/**
 * Función rápida para crear reto nutricional con configuración mínima
 */
export const iniciarRetoNutricionalAutomatico = async (
  userId: string,
  nombreReto: string,
  descripcion: string = '',
  totalDias: number = 21
): Promise<string> => {
  const configuracionBasica: CreateNutritionChallengeRequest = {
    name: nombreReto,
    description: descripcion || 'Reto nutricional generado automáticamente',
    totalDays: totalDias,
    challengeType: 'balanced_nutrition',
    difficulty: 'beginner',
    userProfile: {
      age: 30,
      weight: 70,
      height: 170,
      activityLevel: 'moderately_active',
      goal: 'improve_health',
      dietaryStyle: 'omnivore',
      allergies: [],
      foodDislikes: [],
      cookingSkill: 'intermediate',
      mealPrepTime: 30,
      budget: 'medium',
    },
    settings: {
      mealsPerDay: 3,
      snacksIncluded: true,
      mealPrepDay: 0, // Domingo
      waterGoal: 2000,
      supplementsIncluded: false,
      trackMacros: true,
      allowCheatMeals: false,
      groceryListGeneration: true,
    },
  };

  return await crearRetoNutricionalCompletoAutomatico(userId, configuracionBasica);
};
