import { WorkoutRoutine, ExerciseLevel, WorkoutLocation, AIPersona } from '../types';
import { getDeepSeekAdvice } from './deepSeekService';
import { 
  saveWorkoutRoutine, 
  loadWorkoutRoutine,
  saveExerciseChallengeData,
  loadExerciseChallengeData,
  saveFitnessChallengeData,
  loadFitnessChallengeData,
  saveFitnessChallengeDay,
  loadFitnessChallengeDay,
  getAllFitnessChallengeDays,
  resetFitnessChallenge
} from './challengeDataService';
import { 
  getPredefinedRoutine, 
  getRandomPredefinedRoutine,
  getMuscleGroupForDay 
} from '../data/exerciseRoutines';
import { ExerciseChallengeFormData } from '../components/ExerciseChallengeForm';

// Función mejorada para parsear respuestas JSON de la IA
export const parseJsonResponse = <T>(jsonResponse: string | null): T | null => {
    if (!jsonResponse) {
        console.error("DeepSeek API returned no response.");
        return null;
    }

    // Check for standardized error message before parsing
    if (jsonResponse.startsWith("Error:")) {
        console.error("Received an error from DeepSeek service:", jsonResponse);
        return null;
    }

    console.log("Raw AI response:", jsonResponse);

    // Multiple parsing strategies
    const parsingStrategies = [
        // Strategy 1: Direct JSON parse
        () => {
            try {
                return JSON.parse(jsonResponse.trim());
            } catch (e) {
                return null;
            }
        },
        
        // Strategy 2: Remove markdown code blocks
        () => {
            try {
                let jsonStr = jsonResponse.trim();
                // Remove ```json and ``` markers
                jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '');
                return JSON.parse(jsonStr);
            } catch (e) {
                return null;
            }
        },
        
        // Strategy 3: Extract JSON using regex
        () => {
            try {
                const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
                return null;
            } catch (e) {
                return null;
            }
        },
        
        // Strategy 4: Try to fix common JSON issues
        () => {
            try {
                let jsonStr = jsonResponse.trim();
                // Fix common issues
                jsonStr = jsonStr.replace(/,\s*}/g, '}'); // Remove trailing commas
                jsonStr = jsonStr.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
                jsonStr = jsonStr.replace(/\\"/g, '"'); // Fix escaped quotes
                return JSON.parse(jsonStr);
            } catch (e) {
                return null;
            }
        }
    ];

    // Try each strategy
    for (let i = 0; i < parsingStrategies.length; i++) {
        try {
            const result = parsingStrategies[i]();
            if (result) {
                console.log(`Successfully parsed JSON using strategy ${i + 1}`);
                return result as T;
            }
        } catch (e) {
            console.log(`Strategy ${i + 1} failed:`, e);
        }
    }

    console.error("All parsing strategies failed. Raw response:", jsonResponse);
    return null;
};

// This function provides a hardcoded routine for Day 1 as a quick-loading fallback
// or for users who might have AI features disabled.
const getDay1BeginnerHomeRoutine = (): WorkoutRoutine => ({
    id: 'day_1_home_beginner_static',
    day: 1,
    level: 'beginner',
    location: 'home',
    muscleGroup: 'Full Body Foundations',
    estimatedTime: '20-30 min',
    exercises: [
        { name: 'Jumping Jacks', sets: 3, reps: '30 seconds', description: 'A great cardio warm-up to get your heart rate up.' },
        { name: 'Bodyweight Squats', sets: 3, reps: '10-12', description: 'Focus on form, keeping your back straight and chest up.' },
        { name: 'Push-ups (on knees if needed)', sets: 3, reps: 'As many as possible', description: 'Lower your chest to the floor while keeping your core tight.' },
        { name: 'Plank', sets: 3, reps: '30 seconds', description: 'Maintain a straight line from your head to your heels.' },
        { name: 'Glute Bridges', sets: 3, reps: '15', description: 'Squeeze your glutes at the top of the movement.'},
    ]
});

// Provides a static routine for Day 1 Gym as a fallback.
const getDay1BeginnerGymRoutine = (): WorkoutRoutine => ({
    id: 'day_1_gym_beginner_static',
    day: 1,
    level: 'beginner',
    location: 'gym',
    muscleGroup: 'Full Body Machine Intro',
    estimatedTime: '30-45 min',
    exercises: [
        { name: 'Treadmill Walk/Jog', sets: 1, reps: '5-10 minutes', description: 'Warmup to get the blood flowing.' },
        { name: 'Leg Press Machine', sets: 3, reps: '10-12', description: 'Choose a light to moderate weight to learn the movement.' },
        { name: 'Chest Press Machine', sets: 3, reps: '10-12', description: 'Keeps the movement controlled and safe.' },
        { name: 'Lat Pulldown Machine', sets: 3, reps: '10-12', description: 'Focus on squeezing your back muscles to pull the bar down.' },
        { name: 'Abdominal Crunch Machine', sets: 3, reps: '12-15', description: 'Keep the movement slow and controlled.'},
    ]
});

/**
 * Generates a new workout routine using the DeepSeek API.
 * @param day The current day of the challenge.
 * @param level The user's selected fitness level.
 * @param location The workout location (home or gym).
 * @param userId Optional user ID for saving to Firestore.
 * @param personalizedData Optional personalized data for the exercise challenge.
 * @param language Optional language for the prompt.
 * @returns A `WorkoutRoutine` object or `null` if an error occurs.
 */
export const generateNewRoutine = async (
  day: number, 
  level: ExerciseLevel, 
  location: WorkoutLocation,
  userId?: string,
  personalizedData?: ExerciseChallengeFormData,
  language?: string
): Promise<WorkoutRoutine | null> => {
    // First, try to load from Firestore if user ID is provided
    if (userId) {
        const savedRoutine = await loadWorkoutRoutine(userId, day);
        if (savedRoutine) {
            console.log(`Loaded saved routine for day ${day} from Firestore`);
            return savedRoutine;
        }
    }

    // For the initial day, we can provide a static, fast-loading routine.
    if (day === 1 && level === 'beginner') {
        if (location === 'home') return getDay1BeginnerHomeRoutine();
        if (location === 'gym') return getDay1BeginnerGymRoutine();
    }

    // Try to get a predefined routine
    const predefinedRoutine = getPredefinedRoutine(day, level, location);
    if (predefinedRoutine) {
        console.log(`Using predefined routine for day ${day}, level ${level}, location ${location}`);
        
        // Save to Firestore if user ID is provided
        if (userId) {
            try {
                await saveWorkoutRoutine(userId, day, predefinedRoutine);
            } catch (error) {
                console.error('Failed to save predefined routine to Firestore:', error);
            }
        }
        
        return predefinedRoutine;
    }

    // A simple muscle group rotation for the 30-day challenge
    const muscleGroup = getMuscleGroupForDay(day);

    let prompt = '';
    if (personalizedData) {
      // Prompt estructurado en español, siguiendo el ejemplo del usuario
      prompt = `Genera un plan de entrenamiento de 30 días para un usuario con las siguientes características:
- Día del reto: ${day}
- Nivel de fitness: ${personalizedData.fitnessLevel}
- Frecuencia de ejercicio actual: ${personalizedData.exerciseFrequency} días/semana
- Edad: ${personalizedData.age}, Altura: ${personalizedData.height} cm, Peso: ${personalizedData.weight} kg
- Tipo de entrenamiento preferido: ${personalizedData.trainingType}
- Lugar habitual de entrenamiento: ${personalizedData.trainingPlace}
- Tiempo disponible por sesión: ${personalizedData.sessionTime}
- Objetivos principales: ${personalizedData.mainGoals.join(', ')}
- Zonas del cuerpo a mejorar: ${personalizedData.targetAreas.join(', ')}
- Lesiones o condiciones físicas: ${personalizedData.injuries}
- Historial de actividad: ${personalizedData.activityHistory}
- Nivel de estrés/ansiedad/motivación: ${personalizedData.stressLevel}
- Autoestima/motivación: ${personalizedData.motivationLevel} (${personalizedData.motivationText})
- Horario preferido de entrenamiento: ${personalizedData.trainingSchedule}
- Días disponibles: ${personalizedData.availableDays}
- Experiencia previa: ${personalizedData.previousExperience}

El plan debe detallar los ejercicios diarios (series, repeticiones, descansos), combinar cardio, fuerza y estiramiento según los objetivos, e incluir recomendaciones para mejorar el bienestar mental y la motivación. Devuelve solo un objeto JSON con la estructura:
{
  "id": "day_${day}_${personalizedData.trainingPlace}_${personalizedData.fitnessLevel}",
  "day": ${day},
  "level": "${personalizedData.fitnessLevel}",
  "location": "${personalizedData.trainingPlace}",
  "muscleGroup": "${muscleGroup}",
  "estimatedTime": "XX-XX min",
  "exercises": [
    {
      "name": "Nombre del ejercicio",
      "sets": 3,
      "reps": "8-12",
      "description": "Breve descripción de cómo realizar el ejercicio"
    }
  ]
}`;
    } else {
      prompt = `Generate a workout routine for a user on Day ${day} of a 30-day challenge.
- Fitness Level: ${level}
- Location: ${location}
- Muscle Group Focus: ${muscleGroup}

Please return a JSON object with the following structure:
{
  "id": "day_${day}_${location}_${level}",
  "day": ${day},
  "level": "${level}",
  "location": "${location}",
  "muscleGroup": "${muscleGroup}",
  "estimatedTime": "XX-XX min",
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": 3,
      "reps": "8-12",
      "description": "Brief description of how to perform the exercise"
    }
  ]
}`;
    }

    const lang = language || 'es';
    const jsonResponse = await getDeepSeekAdvice(prompt, AIPersona.WORKOUT_GENERATOR, lang);

    if (!jsonResponse) {
        console.error("DeepSeek API returned no response for workout generation.");
        // Fallback to random predefined routine
        const fallbackRoutine = getRandomPredefinedRoutine(day, level, location);
        if (fallbackRoutine && userId) {
            try {
                await saveWorkoutRoutine(userId, day, fallbackRoutine);
            } catch (error) {
                console.error('Failed to save fallback routine to Firestore:', error);
            }
        }
        return fallbackRoutine || (location === 'home' ? getDay1BeginnerHomeRoutine() : getDay1BeginnerGymRoutine());
    }
    
    // Check for standardized error message from the AI service
    if (jsonResponse.startsWith("Error:")) {
        console.error("Received an error from DeepSeek service while generating workout:", jsonResponse);
        // Fallback to random predefined routine
        const fallbackRoutine = getRandomPredefinedRoutine(day, level, location);
        if (fallbackRoutine && userId) {
            try {
                await saveWorkoutRoutine(userId, day, fallbackRoutine);
            } catch (error) {
                console.error('Failed to save fallback routine to Firestore:', error);
            }
        }
        return fallbackRoutine || (location === 'home' ? getDay1BeginnerHomeRoutine() : getDay1BeginnerGymRoutine());
    }

    // Use improved JSON parser
    const parsedData = parseJsonResponse<WorkoutRoutine>(jsonResponse);

    if (parsedData && parsedData.exercises && Array.isArray(parsedData.exercises)) {
        const routine = parsedData as WorkoutRoutine;
        
        // Save to Firestore if user ID is provided
        if (userId) {
            try {
                await saveWorkoutRoutine(userId, day, routine);
            } catch (error) {
                console.error('Failed to save AI-generated routine to Firestore:', error);
            }
        }
        
        return routine;
    } else {
        console.error("Parsed JSON for workout is malformed or parsing failed:", parsedData);
        // Fallback to random predefined routine
        const fallbackRoutine = getRandomPredefinedRoutine(day, level, location);
        if (fallbackRoutine && userId) {
            try {
                await saveWorkoutRoutine(userId, day, fallbackRoutine);
            } catch (error) {
                console.error('Failed to save fallback routine to Firestore:', error);
            }
        }
        return fallbackRoutine || (location === 'home' ? getDay1BeginnerHomeRoutine() : getDay1BeginnerGymRoutine());
    }
};

/**
 * Loads a workout routine for a specific day, trying Firestore first, then generating new one.
 * @param day The current day of the challenge.
 * @param level The user's selected fitness level.
 * @param location The workout location (home or gym).
 * @param userId User ID for Firestore operations.
 * @returns A `WorkoutRoutine` object or `null` if an error occurs.
 */
export const loadOrGenerateRoutine = async (
  day: number,
  level: ExerciseLevel,
  location: WorkoutLocation,
  userId: string
): Promise<WorkoutRoutine | null> => {
  try {
    // First try to load from Firestore
    const savedRoutine = await loadWorkoutRoutine(userId, day);
    if (savedRoutine) {
      return savedRoutine;
    }

    // If not found, generate a new one
    return await generateNewRoutine(day, level, location, userId);
  } catch (error) {
    console.error('Error in loadOrGenerateRoutine:', error);
    // Final fallback
    return getRandomPredefinedRoutine(day, level, location) || 
           (location === 'home' ? getDay1BeginnerHomeRoutine() : getDay1BeginnerGymRoutine());
  }
};

/**
 * Saves exercise challenge data to Firestore.
 * @param userId User ID for Firestore operations.
 * @param challengeData The challenge data to save.
 */
export const saveExerciseChallenge = async (
  userId: string,
  challengeData: any
): Promise<void> => {
  try {
    await saveExerciseChallengeData(userId, challengeData);
  } catch (error) {
    console.error('Error saving exercise challenge data:', error);
    throw error;
  }
};

/**
 * Loads exercise challenge data from Firestore.
 * @param userId User ID for Firestore operations.
 * @returns The challenge data or null if not found.
 */
export const loadExerciseChallenge = async (
  userId: string
): Promise<any | null> => {
  try {
    return await loadExerciseChallengeData(userId);
  } catch (error) {
    console.error('Error loading exercise challenge data:', error);
    return null;
  }
};

export const clearExerciseChallenge = async (
  userId: string
): Promise<void> => {
  try {
    // Usar la función existente de reset
    const { resetExerciseChallenge } = await import('./challengeDataService');
    await resetExerciseChallenge(userId);
    console.log('Exercise challenge data cleared for user:', userId);
  } catch (error) {
    console.error('Error clearing exercise challenge:', error);
    throw error;
  }
};

// New Fitness Challenge Structure Functions
export const saveFitnessChallenge = async (
  userId: string,
  challengeId: string,
  challengeData: any
): Promise<void> => {
  try {
    await saveFitnessChallengeData(userId, challengeId, challengeData);
  } catch (error) {
    console.error('Error saving fitness challenge data:', error);
    throw error;
  }
};

export const loadFitnessChallenge = async (
  userId: string,
  challengeId: string
): Promise<any | null> => {
  try {
    return await loadFitnessChallengeData(userId, challengeId);
  } catch (error) {
    console.error('Error loading fitness challenge data:', error);
    return null;
  }
};

export const clearFitnessChallenge = async (
  userId: string,
  challengeId: string
): Promise<void> => {
  try {
    await resetFitnessChallenge(userId, challengeId);
    console.log('Fitness challenge data cleared for user:', userId, 'challenge:', challengeId);
  } catch (error) {
    console.error('Error clearing fitness challenge:', error);
    throw error;
  }
};

export const saveFitnessChallengeRoutine = async (
  userId: string,
  challengeId: string,
  day: number,
  routine: WorkoutRoutine
): Promise<void> => {
  try {
    await saveFitnessChallengeDay(userId, challengeId, day, routine);
    console.log(`Fitness challenge routine for day ${day} saved successfully`);
  } catch (error) {
    console.warn('Failed to save fitness challenge routine, but continuing:', error);
    // Don't throw the error - we want the user experience to continue
    // The routine is still available in memory and can be used
  }
};

export const loadFitnessChallengeRoutine = async (
  userId: string,
  challengeId: string,
  day: number
): Promise<WorkoutRoutine | null> => {
  try {
    return await loadFitnessChallengeDay(userId, challengeId, day);
  } catch (error) {
    console.error('Error loading fitness challenge routine:', error);
    return null;
  }
};

export const loadOrGenerateFitnessChallengeRoutine = async (
  day: number,
  level: ExerciseLevel,
  location: WorkoutLocation,
  userId: string,
  challengeId: string
): Promise<WorkoutRoutine | null> => {
  try {
    // First try to load from new fitness challenge structure
    const savedRoutine = await loadFitnessChallengeRoutine(userId, challengeId, day);
    if (savedRoutine) {
      return savedRoutine;
    }

    // If not found, generate a new one
    const newRoutine = await generateNewRoutine(day, level, location, userId);
    
    // Try to save to new structure if generated (non-blocking)
    if (newRoutine) {
      // Don't await this save operation - continue even if it fails
      saveFitnessChallengeRoutine(userId, challengeId, day, newRoutine).catch(saveError => {
        console.warn('Failed to save to fitness challenge structure, trying fallback:', saveError);
        // Fallback: try to save to old structure
        saveWorkoutRoutine(userId, day, newRoutine).catch(fallbackError => {
          console.warn('Failed to save to both new and old structures:', fallbackError);
          // Continue anyway, routine is still valid in memory
        });
      });
    }
    
    return newRoutine;
  } catch (error) {
    console.error('Error in loadOrGenerateFitnessChallengeRoutine:', error);
    // Final fallback
    return getRandomPredefinedRoutine(day, level, location) || 
           (location === 'home' ? getDay1BeginnerHomeRoutine() : getDay1BeginnerGymRoutine());
  }
};

/**
 * Genera el siguiente día del reto de ejercicios con memoria contextual de días anteriores.
 * Solo genera el siguiente día si el anterior existe, manteniendo coherencia en el entrenamiento.
 */
export const generateNextDayWorkoutRoutine = async (
  userId: string,
  challengeId: string,
  level: ExerciseLevel,
  location: WorkoutLocation,
  personalizedData?: ExerciseChallengeFormData,
  language?: string
): Promise<WorkoutRoutine | null> => {
  try {
    // 1. Determinar el día actual (siguiente al último generado)
    const lastGeneratedDay = await getLastGeneratedExerciseDay(userId, challengeId);
    const currentDay = lastGeneratedDay + 1;
    
    // 2. Verificar que el día anterior existe (excepto para el día 1)
    if (currentDay > 1) {
      const previousDay = await loadWorkoutRoutineFromChallenge(userId, challengeId, currentDay - 1);
      if (!previousDay) {
        console.error(`No se puede generar el día ${currentDay} porque el día ${currentDay - 1} no existe`);
        return null;
      }
    }
    
    // 3. Recuperar días anteriores para contexto (últimos 3 días para no saturar el prompt)
    const previousDays = await getPreviousWorkoutDaysForContext(userId, challengeId, currentDay - 1, 3);
    
    // 4. Construir el prompt con memoria contextual
    const prompt = buildContextualExercisePrompt(currentDay, previousDays, level, location, personalizedData);
    
    // 5. Llamar a la IA
    const lang = language || 'es';
    const jsonResponse = await getDeepSeekAdvice(prompt, AIPersona.WORKOUT_GENERATOR, lang);
    
    // 6. Limpiar y parsear la respuesta
    let parsedData: WorkoutRoutine | null = null;
    if (jsonResponse && typeof jsonResponse === 'string') {
      let cleanResponse = jsonResponse.trim();
      
      // Si la respuesta es muy larga, fallback
      if (cleanResponse.length > 8000) {
        console.error('Respuesta de la IA demasiado larga, se usará fallback.');
        return getPredefinedRoutine(currentDay, level, location);
      }
      
      // Extraer solo el JSON usando regex
      const match = cleanResponse.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          // Asegurar que el día sea correcto
          parsed.day = currentDay;
          parsed.id = `day_${currentDay}_${location}_${level}_contextual`;
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
      console.log('Usando rutina predefinida como fallback');
      return getPredefinedRoutine(currentDay, level, location);
    }
    
    // 8. Guardar el nuevo día en Firestore solo si es válido
    if (parsedData.exercises && parsedData.exercises.length > 0) {
      try {
        await saveWorkoutRoutineToChallenge(userId, challengeId, currentDay, parsedData);
        console.log(`Rutina del día ${currentDay} guardada exitosamente`);
      } catch (saveError) {
        console.error('Error guardando rutina, pero continuando con la rutina generada:', saveError);
        // No lanzar error aquí - la rutina sigue siendo válida aunque no se guarde
      }
      return parsedData;
    } else {
      console.error('Rutina generada no tiene la estructura requerida');
      return getPredefinedRoutine(currentDay, level, location);
    }
    
  } catch (error) {
    console.error('Error generando el siguiente día de la rutina de ejercicios:', error);
    return null;
  }
};

/**
 * Obtiene el último día generado para un usuario y reto específico de ejercicios
 */
const getLastGeneratedExerciseDay = async (userId: string, challengeId: string): Promise<number> => {
  try {
    // Usar la función oficial del challengeDataService
    const days = await getAllFitnessChallengeDays(userId, challengeId);
    return days.length > 0 ? Math.max(...days) : 0;
  } catch (error) {
    console.error('Error obteniendo el último día generado:', error);
    return 0;
  }
};

/**
 * Carga una rutina específica de un reto de ejercicios
 */
const loadWorkoutRoutineFromChallenge = async (
  userId: string, 
  challengeId: string, 
  day: number
): Promise<WorkoutRoutine | null> => {
  try {
    // Usar la función oficial del challengeDataService
    const routine = await loadFitnessChallengeDay(userId, challengeId, day);
    return routine;
  } catch (error) {
    console.error('Error cargando rutina del reto:', error);
    return null;
  }
};

/**
 * Guarda una rutina específica en un reto de ejercicios
 */
const saveWorkoutRoutineToChallenge = async (
  userId: string, 
  challengeId: string, 
  day: number,
  routine: WorkoutRoutine
): Promise<void> => {
  try {
    // Usar la función oficial del challengeDataService
    await saveFitnessChallengeDay(userId, challengeId, day, routine);
    console.log(`Rutina del día ${day} guardada en Firestore (fitness_challenges)`);
  } catch (error) {
    console.error('Error guardando rutina en fitness_challenges, intentando fallback:', error);
    
    // Fallback: intentar guardar en la estructura antigua
    try {
      await saveWorkoutRoutine(userId, day, routine);
      console.log(`Rutina del día ${day} guardada en Firestore (estructura antigua)`);
    } catch (fallbackError) {
      console.error('Error guardando rutina en ambas estructuras:', fallbackError);
      throw new Error('Failed to save workout routine to any storage structure');
    }
  }
};

/**
 * Obtiene los días anteriores de entrenamiento para contexto (últimos N días)
 */
const getPreviousWorkoutDaysForContext = async (
  userId: string, 
  challengeId: string, 
  lastDay: number, 
  maxDays: number = 3
): Promise<WorkoutRoutine[]> => {
  const previousDays: WorkoutRoutine[] = [];
  const startDay = Math.max(1, lastDay - maxDays + 1);
  
  for (let day = startDay; day <= lastDay; day++) {
    const routine = await loadWorkoutRoutineFromChallenge(userId, challengeId, day);
    if (routine) {
      previousDays.push(routine);
    }
  }
  
  return previousDays;
};

/**
 * Construye el prompt con memoria contextual de días anteriores de entrenamiento
 */
const buildContextualExercisePrompt = (
  currentDay: number, 
  previousDays: WorkoutRoutine[], 
  level: ExerciseLevel,
  location: WorkoutLocation,
  personalizedData?: ExerciseChallengeFormData
): string => {
  let contextSection = '';
  
  if (previousDays.length > 0) {
    const resumenDias = previousDays.map((dia, idx) => {
      const dayNumber = dia.day || (previousDays.length - idx);
      const ejerciciosResumen = dia.exercises.map(ex => `${ex.name} (${ex.sets}x${ex.reps})`).join(', ');
      return `Día ${dayNumber}:
Grupo muscular: ${dia.muscleGroup}
Ejercicios realizados: ${ejerciciosResumen}
Duración estimada: ${dia.estimatedTime}`;
    }).join('\n\n');

    contextSection = `
CONTEXTO DE DÍAS ANTERIORES (para evitar repetición y mantener progresión):
${resumenDias}

IMPORTANTE: 
- NO repitas exactamente los mismos ejercicios de los días anteriores
- Mantén una progresión lógica en intensidad y volumen
- Considera el descanso muscular apropiado
- Varía los ejercicios pero mantén el enfoque del grupo muscular del día
`;
  }

  const muscleGroup = getMuscleGroupForDay(currentDay);
  
  if (personalizedData) {
    return `${contextSection}

Genera una rutina de entrenamiento personalizada para el DÍA ${currentDay} de un reto de 30 días, considerando el historial de entrenamientos anteriores.

DATOS DEL USUARIO:
- Nivel de fitness: ${level}
- Lugar de entrenamiento: ${location}
- Grupo muscular objetivo del día: ${muscleGroup}
- Edad: ${personalizedData.age}, Altura: ${personalizedData.height} cm, Peso: ${personalizedData.weight} kg
- Tipo de entrenamiento preferido: ${personalizedData.trainingType}
- Tiempo disponible por sesión: ${personalizedData.sessionTime}
- Objetivos principales: ${personalizedData.mainGoals.join(', ')}
- Zonas del cuerpo a mejorar: ${personalizedData.targetAreas.join(', ')}
- Lesiones o condiciones físicas: ${personalizedData.injuries}
- Nivel de experiencia: ${personalizedData.previousExperience}

REQUERIMIENTOS:
1. La rutina debe ser diferente a los días anteriores pero mantener progresión
2. Enfocarse en ${muscleGroup} como grupo muscular principal
3. Adaptar la intensidad al nivel ${level}
4. Considerar el equipo disponible en ${location}
5. Duración apropiada para ${personalizedData.sessionTime}

Devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "id": "day_${currentDay}_${location}_${level}_contextual",
  "day": ${currentDay},
  "level": "${level}",
  "location": "${location}",
  "muscleGroup": "${muscleGroup}",
  "estimatedTime": "XX-XX min",
  "exercises": [
    {
      "name": "Nombre del ejercicio",
      "sets": 3,
      "reps": "8-12",
      "description": "Breve descripción de cómo realizar el ejercicio"
    }
  ]
}`;
  } else {
    return `${contextSection}

Genera una rutina de entrenamiento para el DÍA ${currentDay} de un reto de 30 días, considerando el historial de entrenamientos anteriores.

PARÁMETROS:
- Nivel de fitness: ${level}
- Lugar de entrenamiento: ${location}  
- Grupo muscular objetivo: ${muscleGroup}

REQUERIMIENTOS:
1. La rutina debe ser diferente a los días anteriores pero mantener progresión
2. Enfocarse en ${muscleGroup} como grupo muscular principal
3. Adaptar la intensidad al nivel ${level}
4. Considerar el equipo disponible en ${location}

Devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "id": "day_${currentDay}_${location}_${level}_contextual",
  "day": ${currentDay},
  "level": "${level}",
  "location": "${location}",
  "muscleGroup": "${muscleGroup}",
  "estimatedTime": "XX-XX min",
  "exercises": [
    {
      "name": "Nombre del ejercicio",
      "sets": 3,
      "reps": "8-12",
      "description": "Breve descripción de cómo realizar el ejercicio"
    }
  ]
}`;
  }
};