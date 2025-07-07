import { doc, getDoc, query, collection, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { ExerciseProgramDay, ProgramExercise } from '../types/exercisePrograms';
import { NutritionChallengeDay } from '../types/nutritionChallenges';

/**
 * Servicio para gestionar la memoria contextual de la IA entre días
 * Permite que la IA mantenga coherencia y progresión al generar días consecutivos
 */

export interface AIMemoryContext {
  previousDays: {
    dayNumber: number;
    dayType: string;
    completion: any;
    performance: any;
    userFeedback: string | null;
    exercises?: ProgramExercise[];
    meals?: any[];
  }[];
  trends: {
    difficultyTrend: 'increasing' | 'stable' | 'decreasing';
    performanceTrend: 'improving' | 'stable' | 'declining';
    consistencyPattern: 'consistent' | 'inconsistent' | 'improving';
    energyLevels: number[]; // últimos valores de energía
    recoveryLevels: number[]; // últimos valores de recuperación
  };
  adaptations: {
    exercisePreferences: string[];
    avoidedExercises: string[];
    successfulModifications: string[];
    timePreferences: {
      preferredDuration: number;
      optimalIntensity: string;
    };
  };
  recommendations: {
    nextDayFocus: string[];
    recoveryNeeds: string[];
    progressionSuggestions: string[];
    cautionAreas: string[];
  };
}

/**
 * Recuperar contexto de días anteriores para programas de ejercicio
 */
export const getExerciseProgramMemoryContext = async (
  programId: string,
  currentDay: number,
  lookBackDays: number = 5
): Promise<AIMemoryContext> => {
  try {
    console.log(`🧠 Recuperando memoria contextual para día ${currentDay}, programa ${programId}`);
    
    // Calcular rango de días a recuperar
    const startDay = Math.max(1, currentDay - lookBackDays);
    const endDay = currentDay - 1;
    
    if (endDay < 1) {
      console.log('📝 No hay días anteriores, devolviendo contexto vacío');
      return getEmptyMemoryContext();
    }
    
    // Recuperar días anteriores
    const previousDays = [];
    for (let day = endDay; day >= startDay; day--) {
      const dayData = await getExerciseProgramDay(programId, day);
      if (dayData) {
        previousDays.push({
          dayNumber: day,
          dayType: dayData.dayType,
          completion: dayData.completion,
          performance: dayData.performance,
          userFeedback: dayData.completion.userFeedback,
          exercises: dayData.exercises,
        });
      }
    }
    
    if (previousDays.length === 0) {
      console.log('📝 No se encontraron días anteriores válidos');
      return getEmptyMemoryContext();
    }
    
    // Analizar tendencias
    const trends = analyzeExerciseTrends(previousDays);
    
    // Extraer adaptaciones
    const adaptations = extractExerciseAdaptations(previousDays);
    
    // Generar recomendaciones
    const recommendations = generateExerciseRecommendations(previousDays, trends, currentDay);
    
    console.log(`✅ Contexto de memoria recuperado: ${previousDays.length} días analizados`);
    
    return {
      previousDays,
      trends,
      adaptations,
      recommendations,
    };
    
  } catch (error) {
    console.error('❌ Error recuperando memoria contextual:', error);
    return getEmptyMemoryContext();
  }
};

/**
 * Recuperar contexto de días anteriores para retos nutricionales
 */
export const getNutritionChallengeMemoryContext = async (
  challengeId: string,
  currentDay: number,
  lookBackDays: number = 5
): Promise<AIMemoryContext> => {
  try {
    console.log(`🧠 Recuperando memoria nutricional para día ${currentDay}, reto ${challengeId}`);
    
    const startDay = Math.max(1, currentDay - lookBackDays);
    const endDay = currentDay - 1;
    
    if (endDay < 1) {
      return getEmptyMemoryContext();
    }
    
    const previousDays = [];
    for (let day = endDay; day >= startDay; day--) {
      const dayData = await getNutritionChallengeDay(challengeId, day);
      if (dayData) {
        previousDays.push({
          dayNumber: day,
          dayType: dayData.dayType || 'nutrition',
          completion: dayData.completion,
          performance: dayData.performance || {},
          userFeedback: dayData.completion?.userFeedback || null,
          meals: dayData.meals,
        });
      }
    }
    
    if (previousDays.length === 0) {
      return getEmptyMemoryContext();
    }
    
    const trends = analyzeNutritionTrends(previousDays);
    const adaptations = extractNutritionAdaptations(previousDays);
    const recommendations = generateNutritionRecommendations(previousDays, trends, currentDay);
    
    console.log(`✅ Contexto nutricional recuperado: ${previousDays.length} días analizados`);
    
    return {
      previousDays,
      trends,
      adaptations,
      recommendations,
    };
    
  } catch (error) {
    console.error('❌ Error recuperando memoria nutricional:', error);
    return getEmptyMemoryContext();
  }
};

/**
 * Recuperar un día específico de programa de ejercicio
 */
const getExerciseProgramDay = async (
  programId: string,
  dayNumber: number
): Promise<ExerciseProgramDay | null> => {
  try {
    const dayId = `day${dayNumber}`;
    const dayRef = doc(db, 'exercise_programs', programId, 'days', dayId);
    const daySnap = await getDoc(dayRef);
    
    if (daySnap.exists()) {
      return { id: daySnap.id, ...daySnap.data() } as ExerciseProgramDay;
    }
    
    return null;
  } catch (error) {
    console.error(`Error recuperando día ${dayNumber}:`, error);
    return null;
  }
};

/**
 * Recuperar un día específico de reto nutricional
 */
const getNutritionChallengeDay = async (
  challengeId: string,
  dayNumber: number
): Promise<NutritionChallengeDay | null> => {
  try {
    const dayId = `day${dayNumber}`;
    const dayRef = doc(db, 'nutrition_challenges', challengeId, 'days', dayId);
    const daySnap = await getDoc(dayRef);
    
    if (daySnap.exists()) {
      return { id: daySnap.id, ...daySnap.data() } as NutritionChallengeDay;
    }
    
    return null;
  } catch (error) {
    console.error(`Error recuperando día nutricional ${dayNumber}:`, error);
    return null;
  }
};

/**
 * Analizar tendencias en ejercicios
 */
const analyzeExerciseTrends = (previousDays: any[]): AIMemoryContext['trends'] => {
  const completedWorkouts = previousDays.filter(day => 
    day.completion?.status === 'completed' && day.dayType === 'workout'
  );
  
  const energyLevels = previousDays
    .map(day => day.performance?.energyLevel)
    .filter(level => level !== null && level !== undefined);
  
  const recoveryLevels = previousDays
    .map(day => day.performance?.recoveryLevel)
    .filter(level => level !== null && level !== undefined);
  
  const userRatings = previousDays
    .map(day => day.completion?.userRating)
    .filter(rating => rating !== null && rating !== undefined);
  
  // Analizar tendencia de dificultad
  let difficultyTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
  if (userRatings.length >= 2) {
    const recentRatings = userRatings.slice(-3);
    const avgRecent = recentRatings.reduce((a, b) => a + b, 0) / recentRatings.length;
    
    if (avgRecent >= 4) difficultyTrend = 'increasing';
    else if (avgRecent <= 2) difficultyTrend = 'decreasing';
  }
  
  // Analizar tendencia de rendimiento
  let performanceTrend: 'improving' | 'stable' | 'declining' = 'stable';
  if (energyLevels.length >= 2) {
    const firstHalf = energyLevels.slice(0, Math.floor(energyLevels.length / 2));
    const secondHalf = energyLevels.slice(Math.floor(energyLevels.length / 2));
    
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    if (avgSecond > avgFirst + 0.5) performanceTrend = 'improving';
    else if (avgSecond < avgFirst - 0.5) performanceTrend = 'declining';
  }
  
  // Analizar consistencia
  const completionRate = completedWorkouts.length / previousDays.filter(d => d.dayType === 'workout').length;
  let consistencyPattern: 'consistent' | 'inconsistent' | 'improving' = 'consistent';
  
  if (completionRate < 0.6) consistencyPattern = 'inconsistent';
  else if (completionRate > 0.8) consistencyPattern = 'consistent';
  else consistencyPattern = 'improving';
  
  return {
    difficultyTrend,
    performanceTrend,
    consistencyPattern,
    energyLevels: energyLevels.slice(-5),
    recoveryLevels: recoveryLevels.slice(-5),
  };
};

/**
 * Analizar tendencias nutricionales
 */
const analyzeNutritionTrends = (previousDays: any[]): AIMemoryContext['trends'] => {
  const completedDays = previousDays.filter(day => 
    day.completion?.status === 'completed'
  );
  
  const adherenceRatings = previousDays
    .map(day => day.completion?.userRating)
    .filter(rating => rating !== null && rating !== undefined);
  
  let performanceTrend: 'improving' | 'stable' | 'declining' = 'stable';
  if (adherenceRatings.length >= 3) {
    const recent = adherenceRatings.slice(-3);
    const older = adherenceRatings.slice(0, -3);
    
    if (older.length > 0) {
      const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
      const avgOlder = older.reduce((a, b) => a + b, 0) / older.length;
      
      if (avgRecent > avgOlder + 0.5) performanceTrend = 'improving';
      else if (avgRecent < avgOlder - 0.5) performanceTrend = 'declining';
    }
  }
  
  const completionRate = completedDays.length / previousDays.length;
  let consistencyPattern: 'consistent' | 'inconsistent' | 'improving' = 'consistent';
  
  if (completionRate < 0.7) consistencyPattern = 'inconsistent';
  else if (completionRate > 0.9) consistencyPattern = 'consistent';
  else consistencyPattern = 'improving';
  
  return {
    difficultyTrend: 'stable',
    performanceTrend,
    consistencyPattern,
    energyLevels: [],
    recoveryLevels: [],
  };
};

/**
 * Extraer adaptaciones de ejercicios
 */
const extractExerciseAdaptations = (previousDays: any[]): AIMemoryContext['adaptations'] => {
  const allModifications = previousDays.flatMap(day => 
    day.performance?.modifications || []
  );
  
  const allExercises = previousDays.flatMap(day => day.exercises || []);
  
  // Ejercicios con alta calificación
  const preferredExercises = allExercises
    .filter(ex => ex.actualPerformance?.formQuality >= 8)
    .map(ex => ex.name);
  
  // Ejercicios que causaron problemas
  const avoidedExercises = allModifications
    .filter(mod => mod.reason === 'too_difficult' || mod.reason === 'injury_prevention')
    .map(mod => mod.originalExercise);
  
  // Modificaciones exitosas
  const successfulModifications = allModifications
    .filter(mod => mod.impact === 'easier' || mod.impact === 'equivalent')
    .map(mod => mod.modification);
  
  // Preferencias de tiempo
  const completedWorkouts = previousDays.filter(day => 
    day.completion?.status === 'completed' && day.completion?.actualDuration
  );
  
  const avgDuration = completedWorkouts.length > 0
    ? completedWorkouts.reduce((sum, day) => sum + day.completion.actualDuration, 0) / completedWorkouts.length
    : 45;
  
  return {
    exercisePreferences: [...new Set(preferredExercises)],
    avoidedExercises: [...new Set(avoidedExercises)],
    successfulModifications: [...new Set(successfulModifications)],
    timePreferences: {
      preferredDuration: Math.round(avgDuration),
      optimalIntensity: 'moderate',
    },
  };
};

/**
 * Extraer adaptaciones nutricionales
 */
const extractNutritionAdaptations = (previousDays: any[]): AIMemoryContext['adaptations'] => {
  const allMeals = previousDays.flatMap(day => day.meals || []);
  
  // Comidas con alta adherencia
  const preferredMeals = allMeals
    .filter(meal => meal.completion?.adherenceRating >= 4)
    .map(meal => meal.name || meal.type);
  
  // Comidas evitadas
  const avoidedMeals = allMeals
    .filter(meal => meal.completion?.adherenceRating <= 2 || meal.completion?.skipped)
    .map(meal => meal.name || meal.type);
  
  return {
    exercisePreferences: [...new Set(preferredMeals)],
    avoidedExercises: [...new Set(avoidedMeals)],
    successfulModifications: [],
    timePreferences: {
      preferredDuration: 0,
      optimalIntensity: 'moderate',
    },
  };
};

/**
 * Generar recomendaciones para ejercicios
 */
const generateExerciseRecommendations = (
  previousDays: any[],
  trends: AIMemoryContext['trends'],
  currentDay: number
): AIMemoryContext['recommendations'] => {
  const recommendations: AIMemoryContext['recommendations'] = {
    nextDayFocus: [],
    recoveryNeeds: [],
    progressionSuggestions: [],
    cautionAreas: [],
  };
  
  // Análisis de recuperación
  const lastWorkoutDay = previousDays.find(day => day.dayType === 'workout');
  if (lastWorkoutDay?.performance?.recoveryLevel < 6) {
    recommendations.recoveryNeeds.push('Priorizar recuperación activa');
    recommendations.nextDayFocus.push('Intensidad moderada');
  }
  
  // Análisis de consistencia
  if (trends.consistencyPattern === 'inconsistent') {
    recommendations.nextDayFocus.push('Ejercicios más accesibles');
    recommendations.progressionSuggestions.push('Reducir complejidad temporalmente');
  }
  
  // Análisis de tendencia de rendimiento
  if (trends.performanceTrend === 'improving') {
    recommendations.progressionSuggestions.push('Considerar incremento gradual de dificultad');
  } else if (trends.performanceTrend === 'declining') {
    recommendations.cautionAreas.push('Posible sobrecarga - evaluar volumen');
    recommendations.nextDayFocus.push('Técnica sobre intensidad');
  }
  
  // Análisis de energía
  const avgEnergy = trends.energyLevels.reduce((a, b) => a + b, 0) / trends.energyLevels.length;
  if (avgEnergy < 6) {
    recommendations.recoveryNeeds.push('Enfoque en ejercicios de baja intensidad');
  }
  
  return recommendations;
};

/**
 * Generar recomendaciones nutricionales
 */
const generateNutritionRecommendations = (
  previousDays: any[],
  trends: AIMemoryContext['trends'],
  currentDay: number
): AIMemoryContext['recommendations'] => {
  const recommendations: AIMemoryContext['recommendations'] = {
    nextDayFocus: [],
    recoveryNeeds: [],
    progressionSuggestions: [],
    cautionAreas: [],
  };
  
  if (trends.consistencyPattern === 'inconsistent') {
    recommendations.nextDayFocus.push('Comidas más simples y accesibles');
    recommendations.progressionSuggestions.push('Reducir complejidad de recetas');
  }
  
  if (trends.performanceTrend === 'improving') {
    recommendations.progressionSuggestions.push('Introducir nuevos alimentos gradualmente');
  } else if (trends.performanceTrend === 'declining') {
    recommendations.cautionAreas.push('Revisar adherencia a restricciones dietéticas');
    recommendations.nextDayFocus.push('Opciones familiares y confiables');
  }
  
  return recommendations;
};

/**
 * Contexto vacío para casos sin días anteriores
 */
const getEmptyMemoryContext = (): AIMemoryContext => ({
  previousDays: [],
  trends: {
    difficultyTrend: 'stable',
    performanceTrend: 'stable',
    consistencyPattern: 'consistent',
    energyLevels: [],
    recoveryLevels: [],
  },
  adaptations: {
    exercisePreferences: [],
    avoidedExercises: [],
    successfulModifications: [],
    timePreferences: {
      preferredDuration: 45,
      optimalIntensity: 'moderate',
    },
  },
  recommendations: {
    nextDayFocus: ['Establecer línea base'],
    recoveryNeeds: [],
    progressionSuggestions: ['Enfoque en técnica correcta'],
    cautionAreas: [],
  },
});

/**
 * Formatear contexto para uso en prompts de IA
 */
export const formatMemoryContextForAI = (context: AIMemoryContext): string => {
  if (context.previousDays.length === 0) {
    return "PRIMER DÍA DEL PROGRAMA:\n- No hay datos de días anteriores\n- Enfocar en establecer línea base\n- Priorizar técnica correcta";
  }
  
  const lastDay = context.previousDays[0];
  
  let contextString = `MEMORIA CONTEXTUAL (${context.previousDays.length} días anteriores):\n\n`;
  
  // Último día completado
  contextString += `ÚLTIMO DÍA (${lastDay.dayNumber}):\n`;
  contextString += `- Tipo: ${lastDay.dayType}\n`;
  contextString += `- Estado: ${lastDay.completion?.status || 'no completado'}\n`;
  
  if (lastDay.completion?.userRating) {
    contextString += `- Calificación usuario: ${lastDay.completion.userRating}/5\n`;
  }
  
  if (lastDay.userFeedback) {
    contextString += `- Feedback: "${lastDay.userFeedback}"\n`;
  }
  
  // Tendencias
  contextString += `\nTENDENCIAS OBSERVADAS:\n`;
  contextString += `- Rendimiento: ${context.trends.performanceTrend}\n`;
  contextString += `- Consistencia: ${context.trends.consistencyPattern}\n`;
  contextString += `- Dificultad: ${context.trends.difficultyTrend}\n`;
  
  if (context.trends.energyLevels.length > 0) {
    const avgEnergy = context.trends.energyLevels.reduce((a, b) => a + b, 0) / context.trends.energyLevels.length;
    contextString += `- Energía promedio: ${avgEnergy.toFixed(1)}/10\n`;
  }
  
  // Adaptaciones
  if (context.adaptations.exercisePreferences.length > 0) {
    contextString += `\nPREFERENCIAS IDENTIFICADAS:\n`;
    contextString += `- Le gustan: ${context.adaptations.exercisePreferences.slice(0, 3).join(', ')}\n`;
  }
  
  if (context.adaptations.avoidedExercises.length > 0) {
    contextString += `- Evitar: ${context.adaptations.avoidedExercises.slice(0, 3).join(', ')}\n`;
  }
  
  // Recomendaciones
  if (context.recommendations.nextDayFocus.length > 0) {
    contextString += `\nRECOMENDACIONES PARA HOY:\n`;
    context.recommendations.nextDayFocus.forEach(rec => {
      contextString += `- ${rec}\n`;
    });
  }
  
  if (context.recommendations.cautionAreas.length > 0) {
    contextString += `\nÁREAS DE PRECAUCIÓN:\n`;
    context.recommendations.cautionAreas.forEach(caution => {
      contextString += `- ${caution}\n`;
    });
  }
  
  return contextString;
};
