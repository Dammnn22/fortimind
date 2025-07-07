import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
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
import AnalyticsService from './analyticsService';

/**
 * Crea automáticamente un programa completo con todos sus días en Firestore
 * Estructura: exercise_programs/{programId}/days/{dayId}
 * Incluye protecciones contra abuso y spam
 */
export const crearProgramaCompletoAutomatico = async (
  userId: string,
  datosProgramaBase: CreateProgramRequest,
  isPremium: boolean = false
): Promise<string> => {
  try {
    console.log('🚀 Iniciando creación automática del programa...');
    
    // Paso 0: Validar límites y protección contra abuso
    const limitValidation = await validateNewProgramCreation(
      userId, 
      datosProgramaBase.totalDays, 
      isPremium
    );
    
    if (!limitValidation.isValid) {
      throw new Error(limitValidation.error || 'Límites de creación excedidos');
    }
    
    // Obtener email del usuario para alertas
    const userEmail = await getUserEmail(userId);
    
    // Validar rate limiting
    const rateLimitResult = await validateAndRecordAction(userId, 'program_creation', {
      totalDays: datosProgramaBase.totalDays,
      programType: datosProgramaBase.programType,
      difficulty: datosProgramaBase.difficulty,
    }, userEmail);
    
    if (!rateLimitResult.allowed) {
      throw new Error(rateLimitResult.reason || 'Demasiadas solicitudes. Inténtalo más tarde.');
    }
    
    // Paso 1: Crear el documento del programa principal
    const programId = await crearProgramaPrincipal(userId, datosProgramaBase);
    console.log(`✅ Programa creado con ID: ${programId}`);
    
    // Paso 2: Generar y crear todos los días automáticamente
    await crearTodosLosDiasProgramaIA(userId, programId, datosProgramaBase, userEmail);
    console.log(`✅ Todos los ${datosProgramaBase.totalDays} días creados exitosamente`);
    
    // 📊 Track programa creation en Analytics
    AnalyticsService.trackProgramCreation(
      datosProgramaBase.programType,
      datosProgramaBase.totalDays,
      datosProgramaBase.difficulty
    );
    
    return programId;
  } catch (error) {
    console.error('❌ Error creando programa automático:', error);
    throw error;
  }
};

/**
 * Paso 1: Crear el documento del programa principal en exercise_programs
 */
const crearProgramaPrincipal = async (
  userId: string, 
  datosProgramaBase: CreateProgramRequest
): Promise<string> => {
  // Crear referencia al documento del programa
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
 * Paso 2: Crear todos los días del programa con IA
 */
const crearTodosLosDiasProgramaIA = async (
  userId: string,
  programId: string,
  datosProgramaBase: CreateProgramRequest,
  userEmail?: string
): Promise<void> => {
  const totalDias = datosProgramaBase.totalDays;
  
  for (let dia = 1; dia <= totalDias; dia++) {
    try {
      console.log(`🔄 Generando día ${dia}/${totalDias}...`);
      
      // Validar rate limiting para creación de días
      const rateLimitResult = await validateAndRecordAction(userId, 'day_creation', {
        programId,
        dayNumber: dia,
        totalDays: totalDias,
      }, userEmail);
      
      if (!rateLimitResult.allowed) {
        console.warn(`⚠️ Rate limit alcanzado en día ${dia}: ${rateLimitResult.reason}`);
        // Esperar el tiempo recomendado antes de continuar
        const retryAfter = rateLimitResult.retryAfter || 60;
        if (retryAfter < 300) { // máximo 5 minutos
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        } else {
          throw new Error(`Rate limit excedido: ${rateLimitResult.reason}`);
        }
      }
      
      // Determinar si es día de descanso
      const esDiaDescanso = determinarSiEsDiaDescanso(dia, datosProgramaBase.settings.restDaySchedule);
      
      if (esDiaDescanso) {
        await crearDiaDescanso(userId, programId, dia);
      } else {
        // Generar día de entrenamiento con IA
        await crearDiaEntrenamientoIA(userId, programId, dia, datosProgramaBase);
      }
      
      // Pausa progresiva para evitar rate limiting
      const pauseTime = Math.min(1000 + (dia * 100), 5000); // incrementa gradualmente
      if (dia % 3 === 0) {
        console.log(`⏱️ Pausa para evitar rate limiting... (${dia}/${totalDias})`);
        await new Promise(resolve => setTimeout(resolve, pauseTime));
      }
      
    } catch (error) {
      console.error(`❌ Error generando día ${dia}:`, error);
      // Crear día de fallback básico para no interrumpir el proceso
      await crearDiaFallback(userId, programId, dia, datosProgramaBase);
    }
  }
};

/**
 * Determinar si un día específico es de descanso
 */
const determinarSiEsDiaDescanso = (dia: number, diasDescanso: number[]): boolean => {
  const diaSemana = (dia - 1) % 7; // 0=Lunes, 6=Domingo
  return diasDescanso.includes(diaSemana) || dia % 7 === 0; // Domingo como descanso por defecto
};

/**
 * Crear día de descanso o recuperación activa
 */
const crearDiaDescanso = async (
  _userId: string,
  programId: string,
  dia: number
): Promise<void> => {
  const dayId = `day${dia}`;
  const esDescansoCompleto = dia % 14 === 0; // Cada 2 semanas descanso completo
  
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
    exercises: esDescansoCompleto ? [] : obtenerEjerciciosRecuperacion(),
    completion: {
      status: 'not_started',
      startedAt: null,
      completedAt: null,
      actualDuration: null,
      userRating: null,
      userFeedback: null,
      completedExercises: 0,
      totalExercises: esDescansoCompleto ? 0 : 3,
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

/**
 * Crear día de entrenamiento generado por IA con memoria contextual
 */
const crearDiaEntrenamientoIA = async (
  _userId: string,
  programId: string,
  dia: number,
  datosProgramaBase: CreateProgramRequest
): Promise<void> => {
  try {
    // Recuperar memoria contextual de días anteriores
    console.log(`🧠 Recuperando memoria contextual para día ${dia}...`);
    const memoryContext = await getExerciseProgramMemoryContext(programId, dia);
    
    // Generar rutina con IA incluyendo contexto
    const rutinaGenerada = await generarRutinaConIAConMemoria(dia, datosProgramaBase, memoryContext, programId);
    
    // Crear documento del día en Firestore
    await guardarDiaEnFirestore(_userId, programId, dia, rutinaGenerada, datosProgramaBase, memoryContext);
    
    console.log(`✅ Día de entrenamiento ${dia} creado con IA y memoria contextual`);
  } catch (error) {
    console.error(`⚠️ Error con IA para día ${dia}, usando fallback:`, error);
    await crearDiaFallback(_userId, programId, dia, datosProgramaBase);
  }
};

/**
 * Generar rutina específica con IA incluyendo memoria contextual
 */
const generarRutinaConIAConMemoria = async (
  dia: number, 
  datosProgramaBase: CreateProgramRequest,
  memoryContext: any,
  programId: string // <-- add programId
): Promise<any> => {
  const semana = Math.ceil(dia / 7);
  const diaEnSemana = ((dia - 1) % 7) + 1;
  
  // Formatear contexto de memoria para la IA
  const contextoMemoria = formatMemoryContextForAI(memoryContext);
  
  const prompt = `
Genera un entrenamiento específico para el DÍA ${dia} (Semana ${semana}, Día ${diaEnSemana}) de un programa de ${datosProgramaBase.totalDays} días.

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

INSTRUCCIONES IMPORTANTES:
1. USAR LA MEMORIA CONTEXTUAL para adaptar el entrenamiento
2. Si hay preferencias identificadas, incorporarlas
3. Si hay ejercicios a evitar, no incluirlos
4. Adaptar intensidad según tendencias de rendimiento
5. Considerar recomendaciones de recuperación
6. Crear progresión coherente con días anteriores

REQUERIMIENTOS:
1. Crear un entrenamiento progresivo apropiado para el día ${dia}
2. Incluir calentamiento, ejercicios principales y enfriamiento
3. Especificar series, repeticiones y descansos exactos
4. Adaptar al equipo disponible y limitaciones
5. Considerar la progresión del programa (más intenso conforme avanzan las semanas)
6. INTEGRAR las recomendaciones de la memoria contextual

Devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "title": "Título específico del entrenamiento del día ${dia}",
  "description": "Descripción detallada del enfoque de hoy (mencionar adaptaciones basadas en días anteriores si aplica)",
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

  const respuestaIA = await getDeepSeekAdvice(prompt, AIPersona.WORKOUT_GENERATOR, 'es');
  // Log IA quality for auditing
  try {
    const iaLogRef = doc(db, 'ia_logs', programId, 'days', `day${dia}`);
    await setDoc(iaLogRef, {
      prompt_usado: prompt,
      respuesta_IA: respuestaIA,
      evaluacion_calidad: 'pendiente',
      createdAt: new Date()
    });
  } catch (logError) {
    console.error('Error logging IA quality:', logError);
  }
  
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
  
  // Intentar parsear JSON
  try {
    const rutinaParseada = JSON.parse(jsonLimpio);
    return rutinaParseada;
  } catch (parseError) {
    console.error('Error parseando JSON de IA:', parseError);
    throw new Error('Respuesta de IA no válida');
  }
};

/**
 * Guardar día generado en Firestore con memoria contextual
 */
const guardarDiaEnFirestore = async (
  _userId: string,
  programId: string,
  dia: number,
  rutinaGenerada: any,
  datosProgramaBase: CreateProgramRequest,
  memoryContext: any = null
): Promise<void> => {
  const dayId = `day${dia}`;
  
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
    aiContext: {
      previousDaysSummary: '',
      adaptationSuggestions: [],
      nextDayPreparation: '',
      recoveryRecommendations: [],
    },
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  };

  const dayRef = doc(db, 'exercise_programs', programId, 'days', dayId);
  await setDoc(dayRef, diaData);
};

/**
 * Crear día de fallback cuando la IA falla
 */
const crearDiaFallback = async (
  _userId: string,
  programId: string,
  dia: number,
  datosProgramaBase: CreateProgramRequest
): Promise<void> => {
  const dayId = `day${dia}`;
  
  const ejerciciosFallback: ProgramExercise[] = [
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
      instructions: 'Realiza sentadillas manteniendo la espalda recta y bajando como si te sentaras en una silla.',
      formCues: ['Rodillas alineadas con los pies', 'Pecho hacia arriba'],
      commonMistakes: ['Rodillas hacia adentro', 'No bajar lo suficiente'],
      modifications: {
        easier: ['Sentadillas asistidas con silla'],
        harder: ['Sentadillas con salto'],
        equipment_alternative: ['Usar peso adicional si está disponible'],
      },
      targetLoad: 5,
      actualPerformance: null,
    },
    {
      id: `${programId}_day${dia}_fallback2`,
      name: 'Flexiones',
      category: 'principal',
      muscleGroups: ['pecho', 'brazos'],
      equipment: ['ninguno'],
      sets: 3,
      reps: 'máximo posible',
      weight: 'peso corporal',
      restTime: 60,
      tempo: null,
      instructions: 'Realiza flexiones manteniendo el cuerpo recto desde la cabeza hasta los pies.',
      formCues: ['Core activado', 'Brazos cerca del cuerpo'],
      commonMistakes: ['Cadera muy alta o muy baja', 'No hacer el rango completo'],
      modifications: {
        easier: ['Flexiones en las rodillas'],
        harder: ['Flexiones con palmada'],
        equipment_alternative: ['Flexiones inclinadas en pared'],
      },
      targetLoad: 6,
      actualPerformance: null,
    }
  ];

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
    exercises: ejerciciosFallback,
    completion: {
      status: 'not_started',
      startedAt: null,
      completedAt: null,
      actualDuration: null,
      userRating: null,
      userFeedback: null,
      completedExercises: 0,
      totalExercises: ejerciciosFallback.length,
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
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  };

  const dayRef = doc(db, 'exercise_programs', programId, 'days', dayId);
  await setDoc(dayRef, diaData);
  console.log(`✅ Día fallback ${dia} creado`);
};

/**
 * Función principal para iniciar programa automático (uso desde frontend)
 */
export const iniciarProgramaAutomatico = async (
  userId: string,
  nombrePrograma: string,
  descripcion: string,
  totalDias: number = 30,
  configuracion: Partial<CreateProgramRequest> = {}
): Promise<string> => {
  const datosProgramaBase: CreateProgramRequest = {
    name: nombrePrograma,
    description: descripcion,
    totalDays: totalDias,
    difficulty: configuracion.difficulty || 'beginner',
    programType: configuracion.programType || 'general_fitness',
    location: configuracion.location || 'home',
    userProfile: configuracion.userProfile || {
      age: 25,
      weight: 70,
      height: 170,
      fitnessLevel: 'beginner',
      goals: ['estar en forma'],
      limitations: [],
      availableEquipment: ['ninguno'],
    },
    settings: configuracion.settings || {
      daysPerWeek: 5,
      sessionDuration: 45,
      restDaySchedule: [5, 6], // Sábado y Domingo
      autoAdaptation: true,
      difficultyProgression: 'adaptive',
    },
  };

  return await crearProgramaCompletoAutomatico(userId, datosProgramaBase);
};

// Funciones auxiliares
const obtenerEnfoqueSemanal = (semana: number): string => {
  if (semana <= 2) return 'Adaptación y fundamentos';
  if (semana <= 4) return 'Construcción de base';
  if (semana <= 6) return 'Intensificación progresiva';
  return 'Consolidación y perfeccionamiento';
};

const obtenerEjerciciosRecuperacion = (): ProgramExercise[] => [
  {
    id: 'recovery_walk',
    name: 'Caminata Suave',
    category: 'recuperacion',
    muscleGroups: ['piernas'],
    equipment: ['ninguno'],
    sets: 1,
    reps: '10-15 minutos',
    weight: null,
    restTime: 0,
    tempo: null,
    instructions: 'Camina a ritmo relajado, enfócate en la respiración profunda.',
    formCues: ['Postura erguida', 'Respiración controlada'],
    commonMistakes: ['Caminar muy rápido'],
    modifications: {
      easier: ['Reducir a 5-10 minutos'],
      harder: ['Añadir estiramientos dinámicos'],
      equipment_alternative: [],
    },
    targetLoad: 2,
    actualPerformance: null,
  }
];

const calcularCargaObjetivo = (sets: number, reps: string): number => {
  // Cálculo simple de carga basado en sets y reps
  const repsNum = parseInt(reps.split('-')[0]) || 10;
  return Math.round((sets * repsNum) / 3);
};

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
