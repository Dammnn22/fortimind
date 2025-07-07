import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Servicio para validar límites y prevenir abuso en la creación de documentos
 */

// Límites del sistema
export const SYSTEM_LIMITS = {
  // Límites por usuario
  MAX_PROGRAMS_PER_USER: 10, // máximo 10 programas activos por usuario
  MAX_CHALLENGES_PER_USER: 10, // máximo 10 retos activos por usuario
  
  // Límites por programa/reto
  MAX_DAYS_PER_PROGRAM: 60, // máximo 60 días por programa
  MAX_DAYS_PER_CHALLENGE: 60, // máximo 60 días por reto
  MIN_DAYS: 1, // mínimo 1 día
  
  // Límites de creación temporal (anti-spam)
  MAX_PROGRAMS_PER_HOUR: 5, // máximo 5 programas por hora
  MAX_CHALLENGES_PER_HOUR: 5, // máximo 5 retos por hora
  
  // Límites premium vs free (preparado para futuro)
  FREE_USER_LIMITS: {
    maxPrograms: 3,
    maxChallenges: 3,
    maxDaysPerProgram: 30,
    maxDaysPerChallenge: 30,
  },
  
  PREMIUM_USER_LIMITS: {
    maxPrograms: 20,
    maxChallenges: 20,
    maxDaysPerProgram: 90,
    maxDaysPerChallenge: 90,
  }
};

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  currentCount?: number;
  limit?: number;
}

export interface UserLimits {
  isPremium: boolean;
  maxPrograms: number;
  maxChallenges: number;
  maxDaysPerProgram: number;
  maxDaysPerChallenge: number;
}

/**
 * Obtener límites del usuario basados en su estado premium
 */
export const getUserLimits = (isPremium: boolean = false): UserLimits => {
  if (isPremium) {
    return {
      isPremium: true,
      maxPrograms: SYSTEM_LIMITS.PREMIUM_USER_LIMITS.maxPrograms,
      maxChallenges: SYSTEM_LIMITS.PREMIUM_USER_LIMITS.maxChallenges,
      maxDaysPerProgram: SYSTEM_LIMITS.PREMIUM_USER_LIMITS.maxDaysPerProgram,
      maxDaysPerChallenge: SYSTEM_LIMITS.PREMIUM_USER_LIMITS.maxDaysPerChallenge,
    };
  }
  
  return {
    isPremium: false,
    maxPrograms: SYSTEM_LIMITS.FREE_USER_LIMITS.maxPrograms,
    maxChallenges: SYSTEM_LIMITS.FREE_USER_LIMITS.maxChallenges,
    maxDaysPerProgram: SYSTEM_LIMITS.FREE_USER_LIMITS.maxDaysPerProgram,
    maxDaysPerChallenge: SYSTEM_LIMITS.FREE_USER_LIMITS.maxDaysPerChallenge,
  };
};

/**
 * Validar si el usuario puede crear un nuevo programa de ejercicio
 */
export const validateNewProgramCreation = async (
  userId: string,
  totalDays: number,
  isPremium: boolean = false
): Promise<ValidationResult> => {
  try {
    const userLimits = getUserLimits(isPremium);
    
    // Validar número de días
    if (totalDays < SYSTEM_LIMITS.MIN_DAYS) {
      return {
        isValid: false,
        error: `Un programa debe tener al menos ${SYSTEM_LIMITS.MIN_DAYS} día`,
      };
    }
    
    if (totalDays > userLimits.maxDaysPerProgram) {
      return {
        isValid: false,
        error: `Los programas están limitados a ${userLimits.maxDaysPerProgram} días. ${isPremium ? '' : 'Considera actualizar a Premium para programas más largos.'}`,
        limit: userLimits.maxDaysPerProgram,
      };
    }
    
    // Contar programas activos del usuario
    const programsQuery = query(
      collection(db, 'exercise_programs'),
      where('userId', '==', userId),
      where('status', 'in', ['active', 'paused'])
    );
    
    const programsSnapshot = await getDocs(programsQuery);
    const currentProgramCount = programsSnapshot.size;
    
    if (currentProgramCount >= userLimits.maxPrograms) {
      return {
        isValid: false,
        error: `Has alcanzado el límite de ${userLimits.maxPrograms} programas activos. ${isPremium ? 'Completa o cancela algunos programas existentes.' : 'Actualiza a Premium para más programas.'}`,
        currentCount: currentProgramCount,
        limit: userLimits.maxPrograms,
      };
    }
    
    // Validar límite por hora (anti-spam)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentProgramsQuery = query(
      collection(db, 'exercise_programs'),
      where('userId', '==', userId),
      where('createdAt', '>=', oneHourAgo),
      orderBy('createdAt', 'desc')
    );
    
    const recentProgramsSnapshot = await getDocs(recentProgramsQuery);
    
    if (recentProgramsSnapshot.size >= SYSTEM_LIMITS.MAX_PROGRAMS_PER_HOUR) {
      return {
        isValid: false,
        error: `Has creado demasiados programas recientemente. Espera un poco antes de crear otro.`,
        currentCount: recentProgramsSnapshot.size,
        limit: SYSTEM_LIMITS.MAX_PROGRAMS_PER_HOUR,
      };
    }
    
    return { isValid: true };
    
  } catch (error) {
    console.error('Error validating program creation:', error);
    return {
      isValid: false,
      error: 'Error verificando límites. Inténtalo de nuevo.',
    };
  }
};

/**
 * Validar si el usuario puede crear un nuevo reto nutricional
 */
export const validateNewChallengeCreation = async (
  userId: string,
  totalDays: number,
  isPremium: boolean = false
): Promise<ValidationResult> => {
  try {
    const userLimits = getUserLimits(isPremium);
    
    // Validar número de días
    if (totalDays < SYSTEM_LIMITS.MIN_DAYS) {
      return {
        isValid: false,
        error: `Un reto debe tener al menos ${SYSTEM_LIMITS.MIN_DAYS} día`,
      };
    }
    
    if (totalDays > userLimits.maxDaysPerChallenge) {
      return {
        isValid: false,
        error: `Los retos están limitados a ${userLimits.maxDaysPerChallenge} días. ${isPremium ? '' : 'Considera actualizar a Premium para retos más largos.'}`,
        limit: userLimits.maxDaysPerChallenge,
      };
    }
    
    // Contar retos activos del usuario
    const challengesQuery = query(
      collection(db, 'nutrition_challenges'),
      where('userId', '==', userId),
      where('status', 'in', ['active', 'paused'])
    );
    
    const challengesSnapshot = await getDocs(challengesQuery);
    const currentChallengeCount = challengesSnapshot.size;
    
    if (currentChallengeCount >= userLimits.maxChallenges) {
      return {
        isValid: false,
        error: `Has alcanzado el límite de ${userLimits.maxChallenges} retos activos. ${isPremium ? 'Completa o cancela algunos retos existentes.' : 'Actualiza a Premium para más retos.'}`,
        currentCount: currentChallengeCount,
        limit: userLimits.maxChallenges,
      };
    }
    
    // Validar límite por hora (anti-spam)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentChallengesQuery = query(
      collection(db, 'nutrition_challenges'),
      where('userId', '==', userId),
      where('createdAt', '>=', oneHourAgo),
      orderBy('createdAt', 'desc')
    );
    
    const recentChallengesSnapshot = await getDocs(recentChallengesQuery);
    
    if (recentChallengesSnapshot.size >= SYSTEM_LIMITS.MAX_CHALLENGES_PER_HOUR) {
      return {
        isValid: false,
        error: `Has creado demasiados retos recientemente. Espera un poco antes de crear otro.`,
        currentCount: recentChallengesSnapshot.size,
        limit: SYSTEM_LIMITS.MAX_CHALLENGES_PER_HOUR,
      };
    }
    
    return { isValid: true };
    
  } catch (error) {
    console.error('Error validating challenge creation:', error);
    return {
      isValid: false,
      error: 'Error verificando límites. Inténtalo de nuevo.',
    };
  }
};

/**
 * Validar si se pueden crear días para un programa específico
 */
export const validateDayCreation = async (
  programId: string,
  dayNumber: number,
  totalDaysInProgram: number
): Promise<ValidationResult> => {
  try {
    // Validar que el día esté dentro del rango
    if (dayNumber < 1 || dayNumber > totalDaysInProgram) {
      return {
        isValid: false,
        error: `El día ${dayNumber} está fuera del rango del programa (1-${totalDaysInProgram})`,
      };
    }
    
    // Contar días existentes para evitar duplicados
    const daysQuery = query(
      collection(db, 'exercise_programs', programId, 'days'),
      where('dayNumber', '==', dayNumber),
      limit(1)
    );
    
    const daysSnapshot = await getDocs(daysQuery);
    
    if (daysSnapshot.size > 0) {
      return {
        isValid: false,
        error: `El día ${dayNumber} ya existe en este programa`,
      };
    }
    
    // Contar total de días para verificar que no exceda el límite
    const allDaysQuery = query(
      collection(db, 'exercise_programs', programId, 'days')
    );
    
    const allDaysSnapshot = await getDocs(allDaysQuery);
    
    if (allDaysSnapshot.size >= totalDaysInProgram) {
      return {
        isValid: false,
        error: `El programa ya tiene el máximo de días permitidos (${totalDaysInProgram})`,
        currentCount: allDaysSnapshot.size,
        limit: totalDaysInProgram,
      };
    }
    
    return { isValid: true };
    
  } catch (error) {
    console.error('Error validating day creation:', error);
    return {
      isValid: false,
      error: 'Error verificando creación de día. Inténtalo de nuevo.',
    };
  }
};

/**
 * Validar si se pueden crear días para un reto nutricional específico
 */
export const validateChallengeDayCreation = async (
  challengeId: string,
  dayNumber: number,
  totalDaysInChallenge: number
): Promise<ValidationResult> => {
  try {
    // Validar que el día esté dentro del rango
    if (dayNumber < 1 || dayNumber > totalDaysInChallenge) {
      return {
        isValid: false,
        error: `El día ${dayNumber} está fuera del rango del reto (1-${totalDaysInChallenge})`,
      };
    }
    
    // Contar días existentes para evitar duplicados
    const daysQuery = query(
      collection(db, 'nutrition_challenges', challengeId, 'days'),
      where('dayNumber', '==', dayNumber),
      limit(1)
    );
    
    const daysSnapshot = await getDocs(daysQuery);
    
    if (daysSnapshot.size > 0) {
      return {
        isValid: false,
        error: `El día ${dayNumber} ya existe en este reto`,
      };
    }
    
    // Contar total de días para verificar que no exceda el límite
    const allDaysQuery = query(
      collection(db, 'nutrition_challenges', challengeId, 'days')
    );
    
    const allDaysSnapshot = await getDocs(allDaysQuery);
    
    if (allDaysSnapshot.size >= totalDaysInChallenge) {
      return {
        isValid: false,
        error: `El reto ya tiene el máximo de días permitidos (${totalDaysInChallenge})`,
        currentCount: allDaysSnapshot.size,
        limit: totalDaysInChallenge,
      };
    }
    
    return { isValid: true };
    
  } catch (error) {
    console.error('Error validating challenge day creation:', error);
    return {
      isValid: false,
      error: 'Error verificando creación de día del reto. Inténtalo de nuevo.',
    };
  }
};

/**
 * Obtener estadísticas de uso del usuario
 */
export const getUserUsageStats = async (userId: string) => {
  try {
    const [programsSnapshot, challengesSnapshot] = await Promise.all([
      getDocs(query(
        collection(db, 'exercise_programs'),
        where('userId', '==', userId)
      )),
      getDocs(query(
        collection(db, 'nutrition_challenges'),
        where('userId', '==', userId)
      ))
    ]);
    
    const activeProgramsCount = programsSnapshot.docs.filter(
      doc => ['active', 'paused'].includes(doc.data().status)
    ).length;
    
    const activeChallengesCount = challengesSnapshot.docs.filter(
      doc => ['active', 'paused'].includes(doc.data().status)
    ).length;
    
    return {
      totalPrograms: programsSnapshot.size,
      activePrograms: activeProgramsCount,
      totalChallenges: challengesSnapshot.size,
      activeChallenges: activeChallengesCount,
    };
    
  } catch (error) {
    console.error('Error getting user usage stats:', error);
    return {
      totalPrograms: 0,
      activePrograms: 0,
      totalChallenges: 0,
      activeChallenges: 0,
    };
  }
};
