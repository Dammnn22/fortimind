import { 
  ExerciseProgramDay, 
  ProgramExercise,
  CreateProgramRequest 
} from '../types/exercisePrograms';
import { 
  createExerciseProgram,
  createProgramDay,
  getExerciseProgram,
  getRecentCompletedDays,
  adaptExerciseProgram
} from './exerciseProgramService';
import { getDeepSeekAdvice } from './deepSeekService';
import { AIPersona } from '../types';

/**
 * Generates a complete personalized exercise program using AI
 */
export const generatePersonalizedProgram = async (
  userId: string,
  programRequest: CreateProgramRequest
): Promise<string> => {
  try {
    // Create the program structure first
    const programId = await createExerciseProgram(userId, programRequest);
    
    // Generate the initial program outline with AI
    const programOutline = await generateProgramOutline(programRequest);
    
    // Generate all days for the program with progressive difficulty
    await generateAllProgramDays(programId, programRequest, programOutline);
    
    console.log(`Personalized program generated successfully: ${programId}`);
    return programId;
  } catch (error) {
    console.error('Error generating personalized program:', error);
    throw new Error('Failed to generate personalized program');
  }
};

/**
 * Generates the overall program outline using AI
 */
const generateProgramOutline = async (
  programRequest: CreateProgramRequest
): Promise<any> => {
  const prompt = `
Crea un esquema de programa de entrenamiento personalizado de ${programRequest.totalDays} días con las siguientes características:

DATOS DEL USUARIO:
- Nivel: ${programRequest.difficulty}
- Tipo de programa: ${programRequest.programType}
- Ubicación: ${programRequest.location}
- Edad: ${programRequest.userProfile.age} años
- Peso: ${programRequest.userProfile.weight} kg
- Altura: ${programRequest.userProfile.height} cm
- Nivel de fitness: ${programRequest.userProfile.fitnessLevel}
- Objetivos: ${programRequest.userProfile.goals.join(', ')}
- Limitaciones: ${programRequest.userProfile.limitations.join(', ')}
- Equipo disponible: ${programRequest.userProfile.availableEquipment.join(', ')}

CONFIGURACIÓN:
- Días por semana: ${programRequest.settings.daysPerWeek}
- Duración por sesión: ${programRequest.settings.sessionDuration} minutos
- Días de descanso: ${programRequest.settings.restDaySchedule.join(', ')}

REQUERIMIENTOS:
1. Distribución de tipos de entrenamiento a lo largo del programa
2. Progresión gradual de intensidad y volumen
3. Periodización apropiada con semanas de descarga
4. Variación para evitar monotonía
5. Adaptación al equipo disponible

Devuelve un objeto JSON con esta estructura:
{
  "weeklyStructure": {
    "week1": { "focus": "adaptacion", "intensity": "baja", "workoutDays": [1,3,5], "themes": ["movimiento_basico", "activacion", "familiarizacion"] },
    "week2": { "focus": "construccion", "intensity": "moderada", "workoutDays": [1,2,4,6], "themes": ["fuerza_base", "resistencia", "coordinacion"] }
  },
  "trainingPhases": [
    { "days": "1-7", "phase": "adaptacion", "description": "Familiarización con movimientos básicos" },
    { "days": "8-21", "phase": "desarrollo", "description": "Construcción de fuerza y resistencia base" }
  ],
  "muscleGroupDistribution": {
    "upper_body": [2, 5, 8, 12],
    "lower_body": [1, 4, 7, 11],
    "full_body": [3, 6, 9, 13]
  },
  "restDaySchedule": [7, 14, 21, 28],
  "progressionStrategy": "linear"
}`;

  try {
    const response = await getDeepSeekAdvice(prompt, AIPersona.WORKOUT_GENERATOR, 'es');
    return JSON.parse(response || '{}');
  } catch (error) {
    console.error('Error generating program outline:', error);
    return getDefaultProgramOutline(programRequest);
  }
};

/**
 * Generates all days for the program based on the outline
 */
const generateAllProgramDays = async (
  programId: string,
  programRequest: CreateProgramRequest,
  outline: any
): Promise<void> => {
  try {
    for (let day = 1; day <= programRequest.totalDays; day++) {
      // Determine if this is a rest day
      const isRestDay = outline.restDaySchedule?.includes(day) || 
                       programRequest.settings.restDaySchedule.includes(day % 7);
      
      if (isRestDay) {
        await createRestDay(programId, day);
      } else {
        await generateWorkoutDay(programId, day, programRequest, outline);
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('Error generating all program days:', error);
    throw error;
  }
};

/**
 * Creates a rest or active recovery day
 */
const createRestDay = async (
  programId: string,
  dayNumber: number
): Promise<void> => {
  const restDay: Omit<ExerciseProgramDay, 'id' | 'createdAt' | 'updatedAt'> = {
    programId,
    dayNumber,
    date: null,
    dayType: dayNumber % 7 === 0 ? 'rest' : 'active_recovery',
    location: 'home',
    estimatedDuration: dayNumber % 7 === 0 ? 0 : 20,
    difficulty: 'beginner',
    workoutSummary: {
      title: dayNumber % 7 === 0 ? 'Día de Descanso Completo' : 'Recuperación Activa',
      description: dayNumber % 7 === 0 ? 
        'Día completo de descanso para permitir la recuperación muscular.' :
        'Actividades ligeras para promover la recuperación activa.',
      primaryMuscleGroups: [],
      workoutType: 'recovery',
      warmupDuration: 0,
      workoutDuration: dayNumber % 7 === 0 ? 0 : 15,
      cooldownDuration: dayNumber % 7 === 0 ? 0 : 5,
    },
    exercises: dayNumber % 7 === 0 ? [] : getActiveRecoveryExercises(),
    completion: {
      status: 'not_started',
      startedAt: null,
      completedAt: null,
      actualDuration: null,
      userRating: null,
      userFeedback: null,
      completedExercises: 0,
      totalExercises: dayNumber % 7 === 0 ? 0 : 3,
    },
    performance: {
      perceivedExertion: null,
      energyLevel: null,
      recoveryLevel: null,
      modifications: [],
      notes: null,
    },
    aiContext: {
      previousDaysSummary: '',
      adaptationSuggestions: [],
      nextDayPreparation: '',
      recoveryRecommendations: [],
    },
  };

  await createProgramDay(programId, restDay);
};

/**
 * Generates a workout day using AI
 */
const generateWorkoutDay = async (
  programId: string,
  dayNumber: number,
  programRequest: CreateProgramRequest,
  outline: any
): Promise<void> => {
  try {
    // Get context from recent days if available
    const recentDays = await getRecentCompletedDays(programId, 3);
    const contextSummary = buildContextSummary(recentDays);
    
    // Determine workout focus for this day
    const workoutFocus = determineWorkoutFocus(dayNumber, outline);
    
    const prompt = `
Genera un entrenamiento específico para el DÍA ${dayNumber} de un programa de ${programRequest.totalDays} días.

CONTEXTO DEL PROGRAMA:
- Usuario: ${programRequest.userProfile.age} años, ${programRequest.userProfile.weight}kg, ${programRequest.userProfile.height}cm
- Nivel: ${programRequest.difficulty}
- Objetivos: ${programRequest.userProfile.goals.join(', ')}
- Ubicación: ${programRequest.location}
- Equipo: ${programRequest.userProfile.availableEquipment.join(', ')}
- Duración objetivo: ${programRequest.settings.sessionDuration} minutos
- Limitaciones: ${programRequest.userProfile.limitations.join(', ')}

ENFOQUE DEL DÍA:
${workoutFocus}

CONTEXTO DE DÍAS ANTERIORES:
${contextSummary}

REQUERIMIENTOS:
1. Crear un entrenamiento completo y específico para este día
2. Incluir calentamiento, ejercicios principales y enfriamiento
3. Especificar series, repeticiones, peso/resistencia y descansos
4. Adaptar al equipo disponible
5. Considerar la progresión del programa
6. Incluir modificaciones para diferentes niveles

Devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "workoutSummary": {
    "title": "Título del entrenamiento",
    "description": "Descripción detallada",
    "primaryMuscleGroups": ["grupo1", "grupo2"],
    "workoutType": "strength|cardio|flexibility|hiit|circuit",
    "warmupDuration": 10,
    "workoutDuration": 35,
    "cooldownDuration": 10
  },
  "exercises": [
    {
      "name": "Nombre del ejercicio",
      "category": "calentamiento|principal|enfriamiento",
      "muscleGroups": ["grupo1", "grupo2"],
      "equipment": ["equipo1", "equipo2"],
      "sets": 3,
      "reps": "8-12",
      "weight": "peso corporal",
      "restTime": 60,
      "tempo": "2-1-2-1",
      "instructions": "Instrucciones detalladas paso a paso",
      "formCues": ["consejo1", "consejo2"],
      "commonMistakes": ["error1", "error2"],
      "modifications": {
        "easier": ["modificación fácil"],
        "harder": ["modificación difícil"],
        "equipment_alternative": ["alternativa de equipo"]
      },
      "targetLoad": 7
    }
  ]
}`;

    const response = await getDeepSeekAdvice(prompt, AIPersona.WORKOUT_GENERATOR, 'es');
    const workoutData = JSON.parse(response || '{}');
    
    // Create the program day
    const programDay: Omit<ExerciseProgramDay, 'id' | 'createdAt' | 'updatedAt'> = {
      programId,
      dayNumber,
      date: null,
      dayType: 'workout',
      location: programRequest.location,
      estimatedDuration: programRequest.settings.sessionDuration,
      difficulty: programRequest.difficulty,
      workoutSummary: workoutData.workoutSummary,
      exercises: workoutData.exercises.map((ex: any, index: number) => ({
        ...ex,
        id: `${programId}_day${dayNumber}_ex${index}`,
        actualPerformance: null,
      })),
      completion: {
        status: 'not_started',
        startedAt: null,
        completedAt: null,
        actualDuration: null,
        userRating: null,
        userFeedback: null,
        completedExercises: 0,
        totalExercises: workoutData.exercises.length,
      },
      performance: {
        perceivedExertion: null,
        energyLevel: null,
        recoveryLevel: null,
        modifications: [],
        notes: null,
      },
      aiContext: {
        previousDaysSummary: contextSummary,
        adaptationSuggestions: [],
        nextDayPreparation: '',
        recoveryRecommendations: [],
      },
    };

    await createProgramDay(programId, programDay);
    console.log(`Generated workout day ${dayNumber}`);
  } catch (error) {
    console.error(`Error generating workout day ${dayNumber}:`, error);
    // Create a fallback basic workout
    await createFallbackWorkoutDay(programId, dayNumber, programRequest);
  }
};

/**
 * Builds context summary from recent completed days
 */
const buildContextSummary = (recentDays: ExerciseProgramDay[]): string => {
  if (recentDays.length === 0) {
    return 'Este es el inicio del programa, no hay días anteriores.';
  }

  return recentDays.map(day => 
    `Día ${day.dayNumber}: ${day.workoutSummary.title} - ${day.workoutSummary.workoutType} - ${day.completion.status === 'completed' ? 'Completado' : 'No completado'}`
  ).join('\n');
};

/**
 * Determines workout focus based on day number and program outline
 */
const determineWorkoutFocus = (dayNumber: number, _outline: any): string => {
  // Default focus patterns if outline doesn't provide specific guidance
  const weekNumber = Math.ceil(dayNumber / 7);
  
  if (weekNumber <= 2) {
    return 'Enfoque en adaptación y movimientos básicos. Intensidad moderada.';
  } else if (weekNumber <= 4) {
    return 'Desarrollo de fuerza base y resistencia. Aumento gradual de intensidad.';
  } else {
    return 'Consolidación y perfeccionamiento. Variaciones más avanzadas.';
  }
};

/**
 * Gets active recovery exercises
 */
const getActiveRecoveryExercises = (): ProgramExercise[] => {
  return [
    {
      id: 'recovery_1',
      name: 'Caminata Ligera',
      category: 'recuperacion',
      muscleGroups: ['piernas'],
      equipment: ['ninguno'],
      sets: 1,
      reps: '10-15 minutos',
      weight: null,
      restTime: 0,
      tempo: null,
      instructions: 'Camina a un ritmo relajado y cómodo.',
      formCues: ['Mantén una postura erguida', 'Respira profundamente'],
      commonMistakes: ['Caminar demasiado rápido'],
      modifications: {
        easier: ['Reducir tiempo a 5-10 minutos'],
        harder: ['Añadir ejercicios de respiración'],
        equipment_alternative: ['Usar cinta de correr si está disponible']
      },
      targetLoad: 2,
      actualPerformance: null,
    },
    {
      id: 'recovery_2',
      name: 'Estiramientos Suaves',
      category: 'recuperacion',
      muscleGroups: ['todo_el_cuerpo'],
      equipment: ['ninguno'],
      sets: 1,
      reps: '5-10 minutos',
      weight: null,
      restTime: 0,
      tempo: null,
      instructions: 'Realiza estiramientos suaves mantiendo cada posición 20-30 segundos.',
      formCues: ['No fuerces el estiramiento', 'Respira profundamente'],
      commonMistakes: ['Estirar demasiado fuerte'],
      modifications: {
        easier: ['Estiramientos sentado'],
        harder: ['Añadir estiramientos dinámicos'],
        equipment_alternative: ['Usar banda elástica para asistir']
      },
      targetLoad: 1,
      actualPerformance: null,
    }
  ];
};

/**
 * Creates a fallback workout day when AI generation fails
 */
const createFallbackWorkoutDay = async (
  programId: string,
  dayNumber: number,
  programRequest: CreateProgramRequest
): Promise<void> => {
  const fallbackDay: Omit<ExerciseProgramDay, 'id' | 'createdAt' | 'updatedAt'> = {
    programId,
    dayNumber,
    date: null,
    dayType: 'workout',
    location: programRequest.location,
    estimatedDuration: 30,
    difficulty: programRequest.difficulty,
    workoutSummary: {
      title: `Entrenamiento Día ${dayNumber}`,
      description: 'Entrenamiento básico de cuerpo completo',
      primaryMuscleGroups: ['todo_el_cuerpo'],
      workoutType: 'circuit',
      warmupDuration: 5,
      workoutDuration: 20,
      cooldownDuration: 5,
    },
    exercises: getFallbackExercises(programRequest.location),
    completion: {
      status: 'not_started',
      startedAt: null,
      completedAt: null,
      actualDuration: null,
      userRating: null,
      userFeedback: null,
      completedExercises: 0,
      totalExercises: 5,
    },
    performance: {
      perceivedExertion: null,
      energyLevel: null,
      recoveryLevel: null,
      modifications: [],
      notes: null,
    },
    aiContext: {
      previousDaysSummary: '',
      adaptationSuggestions: [],
      nextDayPreparation: '',
      recoveryRecommendations: [],
    },
  };

  await createProgramDay(programId, fallbackDay);
};

/**
 * Gets default program outline when AI generation fails
 */
const getDefaultProgramOutline = (_programRequest: CreateProgramRequest): any => {
  return {
    weeklyStructure: {},
    trainingPhases: [],
    muscleGroupDistribution: {},
    restDaySchedule: [7, 14, 21, 28],
    progressionStrategy: 'linear'
  };
};

/**
 * Gets fallback exercises when AI generation fails
 */
const getFallbackExercises = (_location: string): ProgramExercise[] => {
  return [
    {
      id: 'fallback_1',
      name: 'Sentadillas',
      category: 'principal',
      muscleGroups: ['piernas'],
      equipment: ['ninguno'],
      sets: 3,
      reps: '10-15',
      weight: 'peso corporal',
      restTime: 60,
      tempo: null,
      instructions: 'Realiza sentadillas manteniendo la espalda recta.',
      formCues: ['Rodillas alineadas con los pies', 'Pecho hacia arriba'],
      commonMistakes: ['Rodillas hacia adentro'],
      modifications: {
        easier: ['Sentadillas asistidas'],
        harder: ['Sentadillas con salto'],
        equipment_alternative: ['Usar silla para apoyo']
      },
      targetLoad: 5,
      actualPerformance: null,
    }
  ];
};

/**
 * Adapts the next day based on user performance
 */
export const adaptNextDay = async (
  programId: string,
  performanceData: any
): Promise<void> => {
  try {
    const program = await getExerciseProgram(programId);
    if (!program) return;
    
    // Analyze performance and adapt program
    await adaptExerciseProgram(programId, {
      reason: 'performance_improvement',
      performanceData
    });
    
    console.log(`Program ${programId} adapted based on performance`);
  } catch (error) {
    console.error('Error adapting next day:', error);
  }
};
