import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  ExerciseProgram, 
  ExerciseProgramDay, 
  CreateProgramRequest,
  ProgramExercise 
} from '../types/exercisePrograms';
import { getDeepSeekAdvice } from './deepSeekService';
import { AIPersona } from '../types';
import { validateAndRecordAction } from './abuseProtectionService';
import { validateNewProgramCreation } from './limitsValidationService';
import { 
  getExerciseProgramMemoryContext, 
  formatMemoryContextForAI 
} from './aiMemoryService';

/**
 * Crea automáticamente un programa completo con todos sus días en Firestore
 * NUEVA VERSIÓN con memoria contextual de IA entre días
 */
export const crearProgramaCompletoAutomaticoConMemoria = async (
  userId: string,
  datosProgramaBase: CreateProgramRequest,
  isPremium: boolean = false
): Promise<string> => {
  try {
    console.log('🚀 Iniciando creación automática del programa con memoria IA...');
    
    // Validaciones iniciales
    const limitValidation = await validateNewProgramCreation(userId, datosProgramaBase.totalDays, isPremium);
    if (!limitValidation.isValid) {
      throw new Error(limitValidation.error || 'Límites de creación excedidos');
    }
    
    const rateLimitResult = await validateAndRecordAction(userId, 'program_creation', {
      totalDays: datosProgramaBase.totalDays,
      programType: datosProgramaBase.programType,
      difficulty: datosProgramaBase.difficulty,
    });
    
    if (!rateLimitResult.allowed) {
      throw new Error(rateLimitResult.reason || 'Demasiadas solicitudes. Inténtalo más tarde.');
    }
    
    // Crear programa principal
    const programId = await crearProgramaPrincipal(userId, datosProgramaBase);
    console.log(`✅ Programa creado con ID: ${programId}`);
    
    // Crear todos los días con memoria contextual
    await crearTodosLosDiasConMemoriaIA(userId, programId, datosProgramaBase);
    console.log(`✅ Todos los ${datosProgramaBase.totalDays} días creados con memoria contextual`);
    
    return programId;
  } catch (error) {
    console.error('❌ Error creando programa automático:', error);
    throw error;
  }
};

/**
 * Crear el documento del programa principal
 */
const crearProgramaPrincipal = async (
  userId: string, 
  datosProgramaBase: CreateProgramRequest
): Promise<string> => {
  const programRef = doc(collection(db, 'exercise_programs'));
  const programId = programRef.id;

  const programData: ExerciseProgram = {
    id: programId,
    userId,
    name: datosProgramaBase.name,
    description: datosProgramaBase.description,
    totalDays: datosProgramaBase.totalDays,
    currentDay: 1,
    status: 'active',
    difficulty: datosProgramaBase.difficulty,
    programType: datosProgramaBase.programType,
    location: datosProgramaBase.location,
    userProfile: datosProgramaBase.userProfile,
    settings: datosProgramaBase.settings,
    progress: {
      completedDays: 0,
      totalWorkouts: 0,
      averageRating: 0,
      adaptationEvents: 0,
      lastCompletedDate: null,
    },
    aiMemory: {
      userPerformancePattern: {
        strengthTrend: 'stable',
        enduranceTrend: 'stable',
        recoveryPattern: 'average',
        consistencyScore: 100,
      },
      adaptationHistory: [],
      preferredExerciseTypes: [],
      avoidedExerciseTypes: [],
    },
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  };

  await setDoc(programRef, programData);
  return programId;
};

/**
 * Crear todos los días del programa con memoria contextual IA
 */
const crearTodosLosDiasConMemoriaIA = async (
  userId: string,
  programId: string,
  datosProgramaBase: CreateProgramRequest
): Promise<void> => {
  const totalDias = datosProgramaBase.totalDays;
  
  for (let dia = 1; dia <= totalDias; dia++) {
    try {
      console.log(`🔄 Generando día ${dia}/${totalDias} con memoria contextual...`);
      
      // Validar rate limiting
      const rateLimitResult = await validateAndRecordAction(userId, 'day_creation', {
        programId, dayNumber: dia, totalDays: totalDias,
      });
      
      if (!rateLimitResult.allowed) {
        console.warn(`⚠️ Rate limit alcanzado en día ${dia}: ${rateLimitResult.reason}`);
        const retryAfter = rateLimitResult.retryAfter || 60;
        if (retryAfter < 300) { // máximo 5 minutos
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        } else {
          throw new Error(`Rate limit excedido: ${rateLimitResult.reason}`);
        }
      }
      
      // Determinar tipo de día
      const esDiaDescanso = determinarSiEsDiaDescanso(dia, datosProgramaBase.settings.restDaySchedule);
      
      if (esDiaDescanso) {
        await crearDiaDescanso(programId, dia);
      } else {
        // Crear día de entrenamiento con memoria contextual
        await crearDiaEntrenamientoConMemoria(programId, dia, datosProgramaBase);
      }
      
      // Pausa progresiva para evitar rate limiting
      if (dia % 3 === 0) {
        const pauseTime = Math.min(1000 + (dia * 100), 5000);
        console.log(`⏱️ Pausa para evitar rate limiting... (${dia}/${totalDias})`);
        await new Promise(resolve => setTimeout(resolve, pauseTime));
      }
      
    } catch (error) {
      console.error(`❌ Error generando día ${dia}:`, error);
      await crearDiaFallback(programId, dia, datosProgramaBase);
    }
  }
};

/**
 * Crear día de entrenamiento con memoria contextual de IA
 */
const crearDiaEntrenamientoConMemoria = async (
  programId: string,
  dia: number,
  datosProgramaBase: CreateProgramRequest
): Promise<void> => {
  try {
    // 🧠 RECUPERAR MEMORIA CONTEXTUAL
    console.log(`🧠 Recuperando memoria contextual para día ${dia}...`);
    const memoryContext = await getExerciseProgramMemoryContext(programId, dia, 5);
    
    // Generar rutina con IA + memoria
    const rutinaGenerada = await generarRutinaConIAYMemoria(dia, datosProgramaBase, memoryContext);
    
    // Guardar día en Firestore
    await guardarDiaEnFirestore(programId, dia, rutinaGenerada, datosProgramaBase, memoryContext);
    
    console.log(`✅ Día ${dia} creado con memoria contextual de ${memoryContext.previousDays.length} días`);
  } catch (error) {
    console.error(`⚠️ Error con memoria IA para día ${dia}, usando fallback:`, error);
    await crearDiaFallback(programId, dia, datosProgramaBase);
  }
};

/**
 * Generar rutina con IA incluyendo memoria contextual
 */
const generarRutinaConIAYMemoria = async (
  dia: number,
  datosProgramaBase: CreateProgramRequest,
  memoryContext: any
): Promise<any> => {
  const semana = Math.ceil(dia / 7);
  const diaEnSemana = ((dia - 1) % 7) + 1;
  
  // Formatear contexto de memoria para la IA
  const contextoMemoria = formatMemoryContextForAI(memoryContext);
  
  const prompt = `Genera un entrenamiento específico para el DÍA ${dia} (Semana ${semana}, Día ${diaEnSemana}) de un programa de ${datosProgramaBase.totalDays} días.

PERFIL DEL USUARIO:
- Edad: ${datosProgramaBase.userProfile.age} años
- Peso: ${datosProgramaBase.userProfile.weight}kg
- Altura: ${datosProgramaBase.userProfile.height}cm
- Nivel: ${datosProgramaBase.difficulty}
- Objetivos: ${datosProgramaBase.userProfile.goals.join(', ')}
- Ubicación: ${datosProgramaBase.location}
- Equipo disponible: ${datosProgramaBase.userProfile.availableEquipment.join(', ')}
- Duración objetivo: ${datosProgramaBase.settings.sessionDuration} minutos
- Limitaciones: ${datosProgramaBase.userProfile.limitations.join(', ')}

${contextoMemoria}

PROGRESIÓN DEL PROGRAMA:
- Semana ${semana}: ${obtenerEnfoqueSemanal(semana)}
- Día en la semana: ${diaEnSemana}

INSTRUCCIONES CRÍTICAS CON MEMORIA:
1. 🧠 USAR LA MEMORIA CONTEXTUAL para adaptar el entrenamiento
2. Si hay preferencias identificadas, incorporarlas
3. Si hay ejercicios a evitar, NO incluirlos
4. Adaptar intensidad según tendencias de rendimiento observadas
5. Considerar recomendaciones de recuperación específicas
6. Crear progresión coherente con días anteriores completados

REQUERIMIENTOS:
1. Crear un entrenamiento progresivo apropiado para el día ${dia}
2. Incluir calentamiento, ejercicios principales y enfriamiento
3. Especificar series, repeticiones y descansos exactos
4. Adaptar al equipo disponible y limitaciones
5. INTEGRAR las recomendaciones de la memoria contextual

Devuelve SOLO un objeto JSON válido:
{
  "title": "Título específico del entrenamiento del día ${dia}",
  "description": "Descripción que mencione adaptaciones basadas en días anteriores si aplica",
  "primaryMuscleGroups": ["grupo1", "grupo2"],
  "workoutType": "strength|cardio|flexibility|hiit|circuit",
  "warmupDuration": 8,
  "workoutDuration": ${datosProgramaBase.settings.sessionDuration - 15},
  "cooldownDuration": 7,
  "exercises": [
    {
      "name": "Nombre exacto del ejercicio",
      "category": "calentamiento|principal|enfriamiento",
      "muscleGroups": ["grupo1", "grupo2"],
      "equipment": ["equipo1", "equipo2"],
      "sets": 3,
      "reps": "8-12",
      "weight": "peso corporal|15kg|banda elástica",
      "restTime": 60,
      "instructions": "Instrucciones paso a paso muy detalladas",
      "formCues": ["consejo técnico 1", "consejo técnico 2"],
      "modifications": {
        "easier": ["versión más fácil"],
        "harder": ["versión más difícil"]
      }
    }
  ]
}`;

  try {
    const respuestaIA = await getDeepSeekAdvice(prompt, AIPersona.WORKOUT_GENERATOR, 'es');
    
    if (!respuestaIA) {
      throw new Error('IA no devolvió respuesta');
    }

    // Limpiar respuesta de la IA
    let jsonLimpio = respuestaIA.trim();
    
    // Remover markdown si existe
    if (jsonLimpio.includes('```')) {
      const match = jsonLimpio.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
      if (match) {
        jsonLimpio = match[1];
      }
    }
    
    // Parsear JSON
    const rutinaParseada = JSON.parse(jsonLimpio);
    return rutinaParseada;
  } catch (error) {
    console.error('Error con IA y memoria:', error);
    throw error;
  }
};

/**
 * Guardar día generado en Firestore con contexto de memoria
 */
const guardarDiaEnFirestore = async (
  programId: string,
  dia: number,
  rutinaGenerada: any,
  datosProgramaBase: CreateProgramRequest,
  memoryContext: any
): Promise<void> => {
  const dayId = `day${dia}`;
  
  // Generar contexto de IA para el siguiente día
  const aiContextForNextDay = {
    previousDaysSummary: memoryContext.previousDays.length > 0 
      ? `Últimos ${memoryContext.previousDays.length} días completados con tendencia ${memoryContext.trends.performanceTrend}`
      : 'Primer día del programa',
    adaptationSuggestions: memoryContext.recommendations.progressionSuggestions,
    nextDayPreparation: memoryContext.recommendations.nextDayFocus.join(', '),
    recoveryRecommendations: memoryContext.recommendations.recoveryNeeds,
  };
  
  const diaData: ExerciseProgramDay = {
    id: dayId,
    programId,
    dayNumber: dia,
    date: null,
    dayType: 'workout',
    location: datosProgramaBase.location === 'hybrid' ? 'home' : datosProgramaBase.location,
    estimatedDuration: datosProgramaBase.settings.sessionDuration,
    difficulty: datosProgramaBase.difficulty,
    workoutSummary: {
      title: rutinaGenerada.title,
      description: rutinaGenerada.description,
      primaryMuscleGroups: rutinaGenerada.primaryMuscleGroups || [],
      workoutType: rutinaGenerada.workoutType || 'circuit',
      warmupDuration: rutinaGenerada.warmupDuration || 5,
      workoutDuration: rutinaGenerada.workoutDuration || 30,
      cooldownDuration: rutinaGenerada.cooldownDuration || 5,
    },
    exercises: rutinaGenerada.exercises.map((ejercicio: any, index: number) => ({
      id: `${programId}_day${dia}_ex${index}`,
      name: ejercicio.name,
      category: ejercicio.category || 'principal',
      muscleGroups: ejercicio.muscleGroups || [],
      equipment: ejercicio.equipment || ['ninguno'],
      sets: ejercicio.sets || 3,
      reps: ejercicio.reps || '10-12',
      weight: ejercicio.weight || 'peso corporal',
      restTime: ejercicio.restTime || 60,
      tempo: ejercicio.tempo || null,
      instructions: ejercicio.instructions || 'Realizar con buena técnica',
      formCues: ejercicio.formCues || [],
      commonMistakes: ejercicio.commonMistakes || [],
      modifications: {
        easier: ejercicio.modifications?.easier || [],
        harder: ejercicio.modifications?.harder || [],
        equipment_alternative: ejercicio.modifications?.equipment_alternative || [],
      },
      targetLoad: calcularCargaObjetivo(ejercicio.sets, ejercicio.reps),
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
      totalExercises: rutinaGenerada.exercises.length,
    },
    performance: {
      perceivedExertion: null,
      energyLevel: null,
      recoveryLevel: null,
      modifications: [],
      notes: null,
    },
    aiContext: aiContextForNextDay, // 🧠 CONTEXTO PARA PRÓXIMO DÍA
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  };

  const dayRef = doc(db, 'exercise_programs', programId, 'days', dayId);
  await setDoc(dayRef, diaData);
};

// Funciones auxiliares básicas
const determinarSiEsDiaDescanso = (dia: number, diasDescanso: number[]): boolean => {
  const diaSemana = (dia - 1) % 7;
  return diasDescanso.includes(diaSemana) || dia % 7 === 0;
};

const crearDiaDescanso = async (programId: string, dia: number): Promise<void> => {
  const dayId = `day${dia}`;
  const esDescansoCompleto = dia % 14 === 0;
  
  const diaData: ExerciseProgramDay = {
    id: dayId,
    programId,
    dayNumber: dia,
    date: null,
    dayType: esDescansoCompleto ? 'rest' : 'active_recovery',
    location: 'home',
    estimatedDuration: esDescansoCompleto ? 0 : 20,
    difficulty: 'beginner',
    workoutSummary: {
      title: esDescansoCompleto ? `Día ${dia}: Descanso Completo` : `Día ${dia}: Recuperación Activa`,
      description: esDescansoCompleto 
        ? 'Día completo de descanso para permitir la recuperación muscular y mental.'
        : 'Actividades suaves para promover la circulación y recuperación activa.',
      primaryMuscleGroups: [],
      workoutType: 'recovery',
      warmupDuration: 0,
      workoutDuration: esDescansoCompleto ? 0 : 15,
      cooldownDuration: esDescansoCompleto ? 0 : 5,
    },
    exercises: [],
    completion: {
      status: 'not_started',
      startedAt: null,
      completedAt: null,
      actualDuration: null,
      userRating: null,
      userFeedback: null,
      completedExercises: 0,
      totalExercises: 0,
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
      recoveryRecommendations: esDescansoCompleto 
        ? ['Hidrátate bien', 'Duerme 8+ horas', 'Come proteína suficiente']
        : ['Mantente activo con movimientos suaves', 'Enfócate en la respiración'],
    },
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  };

  const dayRef = doc(db, 'exercise_programs', programId, 'days', dayId);
  await setDoc(dayRef, diaData);
  console.log(`✅ Día de descanso ${dia} creado`);
};

const crearDiaFallback = async (
  programId: string, 
  dia: number, 
  datosProgramaBase: CreateProgramRequest
): Promise<void> => {
  const dayId = `day${dia}`;
  
  const diaData: ExerciseProgramDay = {
    id: dayId,
    programId,
    dayNumber: dia,
    date: null,
    dayType: 'workout',
    location: datosProgramaBase.location === 'hybrid' ? 'home' : datosProgramaBase.location,
    estimatedDuration: 30,
    difficulty: datosProgramaBase.difficulty,
    workoutSummary: {
      title: `Día ${dia}: Entrenamiento Básico`,
      description: 'Entrenamiento básico de cuerpo completo (generado automáticamente)',
      primaryMuscleGroups: ['todo_el_cuerpo'],
      workoutType: 'circuit',
      warmupDuration: 5,
      workoutDuration: 20,
      cooldownDuration: 5,
    },
    exercises: [
      {
        id: `${programId}_day${dia}_fallback1`,
        name: 'Sentadillas',
        category: 'principal',
        muscleGroups: ['piernas'],
        equipment: ['ninguno'],
        sets: 3,
        reps: '12-15',
        weight: 'peso corporal',
        restTime: 60,
        tempo: null,
        instructions: 'Realiza sentadillas manteniendo la espalda recta.',
        formCues: ['Rodillas alineadas con los pies', 'Pecho hacia arriba'],
        commonMistakes: ['Rodillas hacia adentro', 'No bajar lo suficiente'],
        modifications: {
          easier: ['Sentadillas asistidas con silla'],
          harder: ['Sentadillas con salto'],
          equipment_alternative: ['Usar peso adicional si está disponible'],
        },
        targetLoad: 5,
        actualPerformance: null,
      }
    ],
    completion: {
      status: 'not_started',
      startedAt: null,
      completedAt: null,
      actualDuration: null,
      userRating: null,
      userFeedback: null,
      completedExercises: 0,
      totalExercises: 1,
    },
    performance: {
      perceivedExertion: null,
      energyLevel: null,
      recoveryLevel: null,
      modifications: [],
      notes: null,
    },
    aiContext: {
      previousDaysSummary: 'Fallback generado debido a error en IA',
      adaptationSuggestions: ['Intentar mejorar la respuesta de IA'],
      nextDayPreparation: 'Retomar generación normal',
      recoveryRecommendations: [],
    },
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  };

  const dayRef = doc(db, 'exercise_programs', programId, 'days', dayId);
  await setDoc(dayRef, diaData);
  console.log(`✅ Día fallback ${dia} creado`);
};

const obtenerEnfoqueSemanal = (semana: number): string => {
  const enfoques = [
    'Adaptación y técnica',
    'Incremento gradual',
    'Consolidación',
    'Intensificación',
    'Pico de rendimiento'
  ];
  return enfoques[Math.min(semana - 1, enfoques.length - 1)];
};

const calcularCargaObjetivo = (sets: number, reps: string): number => {
  const repsNum = parseInt(reps.split('-')[0]) || 10;
  return sets * repsNum * 0.1; // Fórmula simple
};

// Mantener compatibilidad con versión anterior
export const crearProgramaCompletoAutomatico = crearProgramaCompletoAutomaticoConMemoria;
