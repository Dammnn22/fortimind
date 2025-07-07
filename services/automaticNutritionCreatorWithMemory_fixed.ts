import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  NutritionChallenge, 
  NutritionChallengeDay, 
  CreateNutritionChallengeRequest 
} from '../types/nutritionChallenges';
import { getDeepSeekAdvice } from './deepSeekService';
import { AIPersona } from '../types';
import { validateAndRecordAction } from './abuseProtectionService';
import { validateNewChallengeCreation } from './limitsValidationService';
import { 
  getNutritionChallengeMemoryContext, 
  formatMemoryContextForAI 
} from './aiMemoryService';

/**
 * Crea automáticamente un reto nutricional completo con memoria contextual de IA
 * NUEVA VERSIÓN con memoria entre días para coherencia nutricional
 */
export const crearRetoNutricionalCompletoConMemoria = async (
  userId: string,
  datosRetoBase: CreateNutritionChallengeRequest,
  isPremium: boolean = false
): Promise<string> => {
  try {
    console.log('🥗 Iniciando creación automática del reto nutricional con memoria IA...');
    
    // Validaciones iniciales
    const limitValidation = await validateNewChallengeCreation(userId, datosRetoBase.totalDays, isPremium);
    if (!limitValidation.isValid) {
      throw new Error(limitValidation.error || 'Límites de creación excedidos');
    }
    
    const rateLimitResult = await validateAndRecordAction(userId, 'challenge_creation', {
      totalDays: datosRetoBase.totalDays,
      challengeType: datosRetoBase.challengeType,
      difficulty: datosRetoBase.difficulty,
    });
    
    if (!rateLimitResult.allowed) {
      throw new Error(rateLimitResult.reason || 'Demasiadas solicitudes. Inténtalo más tarde.');
    }
    
    // Crear reto principal
    const challengeId = await crearRetoNutricionalPrincipal(userId, datosRetoBase);
    console.log(`✅ Reto nutricional creado con ID: ${challengeId}`);
    
    // Crear todos los días con memoria contextual
    await crearTodosLosDiasNutricionConMemoria(userId, challengeId, datosRetoBase);
    console.log(`✅ Todos los ${datosRetoBase.totalDays} días nutricionales creados con memoria contextual`);
    
    return challengeId;
  } catch (error) {
    console.error('❌ Error creando reto nutricional automático:', error);
    throw error;
  }
};

/**
 * Crear el documento del reto nutricional principal
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
    difficulty: datosRetoBase.difficulty,
    challengeType: datosRetoBase.challengeType,
    userProfile: datosRetoBase.userProfile,
    settings: datosRetoBase.settings,
    progress: {
      completedDays: 0,
      totalMealsCompleted: 0,
      waterIntakeAverage: 0,
      weightProgress: {
        startWeight: null,
        currentWeight: null,
        targetWeight: null,
        weightEntries: []
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
 * Crear todos los días nutricionales con memoria contextual IA
 */
const crearTodosLosDiasNutricionConMemoria = async (
  userId: string,
  challengeId: string,
  datosRetoBase: CreateNutritionChallengeRequest
): Promise<void> => {
  for (let dia = 1; dia <= datosRetoBase.totalDays; dia++) {
    try {
      console.log(`📅 Creando día nutricional ${dia}/${datosRetoBase.totalDays} con memoria IA...`);
      
      // Obtener memoria contextual de días anteriores
      const memoryContext = await getNutritionChallengeMemoryContext(challengeId, dia);
      const contextoMemoria = formatMemoryContextForAI(memoryContext);
      
      // Crear día con memoria contextual
      await crearDiaNutricionalConMemoria(userId, challengeId, dia, datosRetoBase, contextoMemoria);
      
      console.log(`✅ Día nutricional ${dia} creado con memoria contextual`);
    } catch (error) {
      console.error(`❌ Error creando día nutricional ${dia}:`, error);
      // Crear día fallback si falla la IA
      await crearDiaNutricionalFallback(userId, challengeId, dia);
    }
  }
};

/**
 * Crear un día nutricional específico con memoria contextual de IA
 */
const crearDiaNutricionalConMemoria = async (
  userId: string,
  challengeId: string,
  dia: number,
  datosRetoBase: CreateNutritionChallengeRequest,
  contextoMemoria: string
): Promise<void> => {
  const dayRef = doc(collection(db, `nutrition_challenges/${challengeId}/days`));
  const dayId = dayRef.id;

  // Generar prompt contextual con memoria
  const prompt = `
Crear plan nutricional para DÍA ${dia} de un reto de ${datosRetoBase.totalDays} días.

PERFIL DEL USUARIO:
- Objetivo: ${datosRetoBase.challengeType}
- Nivel de actividad: ${datosRetoBase.userProfile.activityLevel}
- Estilo alimentario: ${datosRetoBase.userProfile.dietaryStyle}
- Alergias: ${datosRetoBase.userProfile.allergies.join(', ')}
- Comidas que no le gustan: ${datosRetoBase.userProfile.foodDislikes.join(', ')}
- Presupuesto: ${datosRetoBase.userProfile.budget}
- Tiempo de preparación disponible: ${datosRetoBase.userProfile.mealPrepTime} minutos

${contextoMemoria}

ENFOQUE SEMANAL:
${dia <= 7 ? 'SEMANA 1: Adaptación y formación de hábitos' : 
  dia <= 14 ? 'SEMANA 2: Consolidación de rutinas' : 
  dia <= 21 ? 'SEMANA 3: Optimización nutricional' : 
  'SEMANA 4+: Mantenimiento y resultados'}

Generar plan nutricional detallado para el día ${dia} que incluya:
1. 3 comidas principales balanceadas
2. 2 snacks saludables
3. Hidratación adecuada
4. Consideraciones especiales del día
5. Tips nutricionales

Responder en formato JSON estructurado con: targetCalories, macros (protein, carbs, fat), meals (con ingredientes detallados, instrucciones, información nutricional), hydrationGoal, specialConsiderations, nutritionTips.
`;

  try {
    const respuestaIA = await getDeepSeekAdvice(prompt, AIPersona.NUTRITION_PLAN_GENERATOR, 'es');
    const planGenerado = respuestaIA ? JSON.parse(respuestaIA) : null;
    if (!planGenerado) {
      throw new Error('No se pudo generar plan nutricional con IA');
    }
    
    // Obtener contexto para próximo día
    const memoryContext = await getNutritionChallengeMemoryContext(challengeId, dia + 1);
    const aiContextForNextDay = {
      previousDaysSummary: `Memoria de ${memoryContext.previousDays.length} días anteriores`,
      adaptationSuggestions: memoryContext.recommendations.progressionSuggestions,
      nextDayPreparation: memoryContext.recommendations.nextDayFocus.join(', '),
      groceryListItems: [],
      hydrationReminders: [],
    };
    
    const diaData: NutritionChallengeDay = {
      id: dayId,
      challengeId,
      dayNumber: dia,
      date: null,
      dayType: 'regular',
      theme: planGenerado.theme || `Día ${dia} - Nutrición Balanceada`,
      estimatedPrepTime: planGenerado.estimatedPrepTime || 45,
      difficulty: datosRetoBase.difficulty,
      nutritionPlan: {
        title: planGenerado.title || `Plan Nutricional Día ${dia}`,
        description: planGenerado.description || 'Plan nutricional personalizado',
        focusAreas: planGenerado.focusAreas || ['hydration', 'balanced_nutrition'],
        dailyCalories: planGenerado.targetCalories || 1800,
        macros: {
          protein: planGenerado.macros?.protein || 135, // grams for 1800 cal at 30%
          carbs: planGenerado.macros?.carbs || 202, // grams for 1800 cal at 45%
          fats: planGenerado.macros?.fats || 50, // grams for 1800 cal at 25%
          fiber: planGenerado.macros?.fiber || 25,
        },
        waterGoal: planGenerado.hydrationGoal || 2000,
        supplements: planGenerado.supplements || [],
        specialInstructions: planGenerado.specialConsiderations || '',
      },
      meals: planGenerado.meals?.map((meal: any, index: number) => ({
        id: `${challengeId}_day${dia}_meal${index}`,
        type: meal.type,
        name: meal.name,
        description: meal.description,
        ingredients: meal.ingredients || [],
        instructions: meal.instructions || [],
        prepTime: meal.prepTime || 15,
        cookTime: meal.cookTime || 10,
        servings: meal.servings || 1,
        difficulty: meal.difficulty || 'medium',
        nutrition: meal.nutrition || { calories: 300, protein: 15, carbs: 30, fats: 10, fiber: 5, sugar: 10, sodium: 200 },
        tags: meal.tags || [],
        cuisineType: meal.cuisineType || 'Internacional',
        season: meal.season || ['all-year'],
        mealPrepFriendly: meal.mealPrepFriendly || false,
        budgetFriendly: meal.budgetFriendly || true,
        actualPerformance: {
          consumed: false,
          adherenceRating: 0,
          modifications: [],
          userFeedback: null,
        }
      })),
      hydrationGoal: planGenerado.hydrationGoal || 2000,
      supplements: planGenerado.supplements || [],
      specialConsiderations: planGenerado.specialConsiderations || '',
      nutritionTips: planGenerado.nutritionTips || [],
      completion: {
        status: 'not_started',
        startedAt: null,
        completedAt: null,
        waterIntake: 0,
        weightRecorded: null,
        userRating: null,
        userFeedback: null,
        completedMeals: 0,
        totalMeals: 5,
        energyLevel: null,
        hungerLevel: null,
        adherenceScore: 0,
      },
      aiContext: aiContextForNextDay, // 🧠 CONTEXTO NUTRICIONAL PARA PRÓXIMO DÍA
    };

    await setDoc(dayRef, diaData);
  } catch (error) {
    console.error(`Error en IA para día ${dia}, usando fallback:`, error);
    throw error;
  }
};

/**
 * Crear día nutricional fallback si falla la IA
 */
const crearDiaNutricionalFallback = async (
  userId: string,
  challengeId: string,
  dia: number
): Promise<void> => {
  const dayRef = doc(collection(db, `nutrition_challenges/${challengeId}/days`));
  const dayId = dayRef.id;
  
  const diaData: NutritionChallengeDay = {
    id: dayId,
    challengeId,
    dayNumber: dia,
    date: null,
    dayType: 'regular',
    targetCalories: 1800,
    macros: { protein: 25, carbs: 45, fat: 30 },
    meals: [
      {
        id: `${challengeId}_day${dia}_fallback1`,
        type: 'breakfast',
        name: 'Desayuno Básico',
        description: 'Desayuno nutritivo y equilibrado (generado automáticamente)',
        ingredients: [
          { name: 'Avena', amount: 50, unit: 'g', calories: 190, protein: 3, carbs: 34, fats: 4, isOptional: false, category: 'carbs' },
          { name: 'Leche', amount: 200, unit: 'ml', calories: 100, protein: 7, carbs: 10, fats: 3, isOptional: false, category: 'dairy' },
          { name: 'Plátano', amount: 1, unit: 'unidad', calories: 105, protein: 1, carbs: 27, fats: 0, isOptional: false, category: 'fruits' }
        ],
        instructions: [
          'Cocinar la avena con leche',
          'Agregar plátano cortado en rodajas'
        ],
        prepTime: 10,
        cookTime: 5,
        servings: 1,
        difficulty: 'easy',
        nutrition: { calories: 350, protein: 12, carbs: 45, fats: 8, fiber: 5, sugar: 15, sodium: 150 },
        tags: ['nutritivo', 'fácil'],
        cuisineType: 'Internacional',
        season: ['all-year'],
        mealPrepFriendly: false,
        budgetFriendly: true,
        actualPerformance: {
          consumed: false,
          adherenceRating: 0,
          modifications: [],
          userFeedback: null,
        }
      }
    ],
    hydrationGoal: 2000,
    supplements: [],
    specialConsiderations: 'Plan básico generado automáticamente',
    nutritionTips: ['Mantén una hidratación adecuada', 'Come lentamente y disfruta tu comida'],
    completion: {
      completed: false,
      completedAt: null,
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
      nextDayPreparation: '',
      groceryListItems: [],
      hydrationReminders: [],
    },
  };

  await setDoc(dayRef, diaData);
};
