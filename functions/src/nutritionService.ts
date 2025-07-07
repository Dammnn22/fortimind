import * as admin from "firebase-admin";
import { getDeepSeekAdvice } from './deepSeekService';

// Tipos básicos para Firebase Functions
interface DailyMealPlan {
  day: number;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack1?: Meal | null;
  snack2?: Meal | null;
  totalCalories?: string;
  macros?: string;
}

interface Meal {
  name: string;
  description: string;
  ingredients: string[];
  calories: string;
}

interface UserProfile {
  goal: string;
  dietaryStyle: string;
  allergies: string;
  preferences: string;
}

/**
 * Genera el siguiente día del reto nutricional con memoria contextual de días anteriores.
 * Solo genera el siguiente día si el anterior existe, manteniendo coherencia nutricional.
 */
export const generateNextDayMealPlan = async (
  userId: string,
  challengeId: string,
  profile: UserProfile,
  language: string = 'es'
): Promise<DailyMealPlan | null> => {
  try {
    // 1. Determinar el día actual (siguiente al último generado)
    const lastGeneratedDay = await getLastGeneratedDay(userId, challengeId);
    const currentDay = lastGeneratedDay + 1;
    
    // 2. Verificar que el día anterior existe (excepto para el día 1)
    if (currentDay > 1) {
      const previousDay = await loadMealPlanFromChallenge(userId, challengeId, currentDay - 1);
      if (!previousDay) {
        console.error(`No se puede generar el día ${currentDay} porque el día ${currentDay - 1} no existe`);
        return null;
      }
    }
    
    // 3. Recuperar días anteriores para contexto (últimos 3 días para no saturar el prompt)
    const previousDays = await getPreviousDaysForContext(userId, challengeId, currentDay - 1, 3);
    
    // 4. Construir el prompt con memoria contextual
    const prompt = buildContextualNutritionPrompt(currentDay, previousDays, profile);
    
    // 5. Llamar a la IA
    const jsonResponse = await getDeepSeekAdvice(prompt, 'NUTRITION_PLAN_GENERATOR', language);
    
    // 6. Limpiar y parsear la respuesta
    let parsedData: DailyMealPlan | null = null;
    if (jsonResponse && typeof jsonResponse === 'string') {
      let cleanResponse = jsonResponse.trim();
      
      // Si la respuesta es muy larga, fallback
      if (cleanResponse.length > 8000) {
        console.error('Respuesta de la IA demasiado larga, se usará fallback.');
        return getPredefinedMealPlan(currentDay, profile.goal, profile.dietaryStyle);
      }
      
      // Extraer solo el JSON usando regex
      const match = cleanResponse.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          // Asegurar que el día sea correcto
          parsed.day = currentDay;
          parsedData = parsed;
        } catch (e) {
          console.error('Error al parsear el JSON extraído:', e, match[0]);
        }
      } else {
        console.error('No se encontró un JSON válido en la respuesta de la IA.');
      }
    }
    
    // 7. Si el parseo falló, usar fallback
    if (!parsedData) {
      console.log('Usando plan predefinido como fallback');
      return getPredefinedMealPlan(currentDay, profile.goal, profile.dietaryStyle);
    }
    
    // 8. Guardar el nuevo día en Firestore solo si es válido
    if (parsedData.breakfast && parsedData.lunch && parsedData.dinner) {
      await saveMealPlanToChallenge(userId, challengeId, currentDay, parsedData);
      console.log(`Plan del día ${currentDay} guardado exitosamente`);
      return parsedData;
    } else {
      console.error('Plan generado no tiene la estructura requerida');
      return getPredefinedMealPlan(currentDay, profile.goal, profile.dietaryStyle);
    }
    
  } catch (error) {
    console.error('Error generando el siguiente día del plan nutricional:', error);
    return null;
  }
};

/**
 * Obtiene el último día generado para un usuario y reto específico
 */
const getLastGeneratedDay = async (userId: string, challengeId: string): Promise<number> => {
  try {
    const days = await getAllGeneratedDays(userId, challengeId);
    return days.length > 0 ? Math.max(...days) : 0;
  } catch (error) {
    console.error('Error obteniendo el último día generado:', error);
    return 0;
  }
};

/**
 * Obtiene todos los días generados para un usuario y reto específico
 */
const getAllGeneratedDays = async (userId: string, challengeId: string): Promise<number[]> => {
  try {
    const daysRef = admin.firestore().collection('users').doc(userId).collection('nutritionChallenges').doc(challengeId).collection('days');
    const querySnapshot = await daysRef.get();
    
    const days: number[] = [];
    querySnapshot.forEach((doc) => {
      const dayNumber = parseInt(doc.id.replace('day_', ''));
      if (!isNaN(dayNumber)) {
        days.push(dayNumber);
      }
    });
    
    return days.sort((a, b) => a - b);
  } catch (error) {
    console.error('Error obteniendo días generados:', error);
    return [];
  }
};

/**
 * Carga un plan específico de un reto nutricional
 */
const loadMealPlanFromChallenge = async (
  userId: string, 
  challengeId: string, 
  day: number
): Promise<DailyMealPlan | null> => {
  try {
    const docRef = admin.firestore().doc(`users/${userId}/nutritionChallenges/${challengeId}/days/day_${day}`);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      const data = docSnap.data();
      return data as DailyMealPlan;
    }
    
    return null;
  } catch (error) {
    console.error('Error cargando plan del reto:', error);
    return null;
  }
};

/**
 * Obtiene los días anteriores para contexto (últimos N días)
 */
const getPreviousDaysForContext = async (
  userId: string, 
  challengeId: string, 
  lastDay: number, 
  maxDays: number = 3
): Promise<DailyMealPlan[]> => {
  const previousDays: DailyMealPlan[] = [];
  const startDay = Math.max(1, lastDay - maxDays + 1);
  
  for (let day = startDay; day <= lastDay; day++) {
    const plan = await loadMealPlanFromChallenge(userId, challengeId, day);
    if (plan) {
      previousDays.push(plan);
    }
  }
  
  return previousDays;
};

/**
 * Construye el prompt con memoria contextual de días anteriores
 */
const buildContextualNutritionPrompt = (
  currentDay: number, 
  previousDays: DailyMealPlan[], 
  profile: UserProfile
): string => {
  let contextSection = '';
  
  if (previousDays.length > 0) {
    const resumenDias = previousDays.map((dia, idx) => {
      const dayNumber = dia.day || (previousDays.length - idx);
      return `Día ${dayNumber}:
Desayuno: ${dia.breakfast?.name || ''}
Almuerzo: ${dia.lunch?.name || ''}
Cena: ${dia.dinner?.name || ''}
Snacks: ${dia.snack1?.name || ''}, ${dia.snack2?.name || ''}`;
    }).join('\n\n');
    
    contextSection = `Estás generando un plan nutricional diario como parte de un reto de 30 días. Aquí tienes el historial de los días anteriores:

${resumenDias}

Tu tarea es generar el Día ${currentDay} del reto, con las siguientes comidas:
- Desayuno
- Almuerzo
- Cena
- Snack 1
- Snack 2

Cada comida debe incluir: nombre, descripción, ingredientes, calorías aproximadas.
NO repitas recetas recientes y mantén variedad nutricional.
Considera el perfil del usuario: objetivo ${profile.goal}, dieta ${profile.dietaryStyle}, alergias: ${profile.allergies || 'ninguna'}, preferencias: ${profile.preferences || 'ninguna'}.

Formato de salida: JSON válido como este:
{
  "day": ${currentDay},
  "breakfast": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "lunch": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "dinner": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "snack1": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "snack2": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "totalCalories": "~XXXX kcal",
  "macros": "proteínas XXg, carbohidratos XXg, grasas XXg"
}

NO EXPLIQUES NADA, solo devuelve el JSON directamente.`;
  } else {
    // Para el día 1, usar el prompt original sin contexto
    contextSection = `Genera un plan de nutrición en formato JSON para el día ${currentDay} (primer día del reto), que incluya:
- desayuno
- almuerzo
- cena
- snack1
- snack2
- calorías totales
- macros (proteínas, carbohidratos, grasas)

Considera el perfil del usuario: objetivo ${profile.goal}, dieta ${profile.dietaryStyle}, alergias: ${profile.allergies || 'ninguna'}, preferencias: ${profile.preferences || 'ninguna'}.

Devuelve SOLO un JSON válido como este:
{
  "day": ${currentDay},
  "breakfast": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "lunch": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "dinner": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "snack1": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "snack2": { "name": "...", "description": "...", "ingredients": ["..."], "calories": "..." },
  "totalCalories": "~XXXX kcal",
  "macros": "proteínas XXg, carbohidratos XXg, grasas XXg"
}

NO EXPLIQUES NADA, solo devuelve el JSON directamente.`;
  }
  
  return contextSection;
};

/**
 * Guarda un plan específico en un reto nutricional
 */
const saveMealPlanToChallenge = async (
  userId: string, 
  challengeId: string, 
  day: number, 
  mealPlan: DailyMealPlan
): Promise<void> => {
  try {
    const docRef = admin.firestore().doc(`users/${userId}/nutritionChallenges/${challengeId}/days/day_${day}`);
    await docRef.set({
      ...mealPlan,
      userId,
      challengeId,
      day,
      savedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error guardando plan del reto:', error);
    throw error;
  }
};

/**
 * Plan predefinido como fallback
 */
const getPredefinedMealPlan = (day: number, goal: string, dietaryStyle: string): DailyMealPlan => {
  return {
    day,
    breakfast: {
      name: 'Desayuno saludable',
      description: 'Un desayuno nutritivo y balanceado',
      ingredients: ['Avena', 'Leche', 'Frutos secos', 'Miel'],
      calories: '~350 kcal'
    },
    lunch: {
      name: 'Almuerzo equilibrado',
      description: 'Almuerzo con proteínas y verduras',
      ingredients: ['Pollo', 'Arroz integral', 'Verduras', 'Aceite de oliva'],
      calories: '~500 kcal'
    },
    dinner: {
      name: 'Cena ligera',
      description: 'Cena nutritiva y fácil de digerir',
      ingredients: ['Pescado', 'Ensalada', 'Quinoa'],
      calories: '~400 kcal'
    },
    snack1: {
      name: 'Snack de media mañana',
      description: 'Snack saludable para mantener energía',
      ingredients: ['Yogur', 'Fruta', 'Granola'],
      calories: '~200 kcal'
    },
    snack2: {
      name: 'Snack de media tarde',
      description: 'Snack nutritivo para la tarde',
      ingredients: ['Nueces', 'Manzana'],
      calories: '~150 kcal'
    },
    totalCalories: '~1600 kcal',
    macros: 'proteínas 120g, carbohidratos 180g, grasas 60g'
  };
}; 