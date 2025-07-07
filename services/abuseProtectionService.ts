import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import AbuseAlertService from './abuseAlertService';

/**
 * Servicio avanzado de protección contra abuso y spam
 * Incluye rate limiting, blacklisting, y detección de patrones sospechosos
 */

// Configuración de rate limiting por acción
export const RATE_LIMITS = {
  // Creación de programas
  PROGRAM_CREATION: {
    maxPerMinute: 2,
    maxPerHour: 5,
    maxPerDay: 20,
  },
  
  // Creación de retos nutricionales
  CHALLENGE_CREATION: {
    maxPerMinute: 2,
    maxPerHour: 5,
    maxPerDay: 20,
  },
  
  // Creación de días (subcolecciones)
  DAY_CREATION: {
    maxPerMinute: 10,
    maxPerHour: 100,
    maxPerDay: 500,
  },
  
  // Límites generales del sistema
  SYSTEM: {
    maxDocumentsPerUser: 1000,
    maxSubcollectionDocuments: 200,
    suspiciousActivityThreshold: 50, // acciones por hora que activan alerta
  }
};

// Tipos de acciones monitoreadas
export type MonitoredAction = 
  | 'program_creation' 
  | 'challenge_creation' 
  | 'day_creation' 
  | 'document_update';

// Estructura para tracking de actividad del usuario
export interface UserActivity {
  userId: string;
  action: MonitoredAction;
  timestamp: Timestamp;
  metadata?: Record<string, any>;
}

// Resultado de validación de rate limiting
export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: number; // segundos hasta que pueda intentar de nuevo
  currentCount?: number;
  limit?: number;
}

/**
 * Grabar actividad del usuario para monitoreo
 */
export const recordUserActivity = async (
  userId: string,
  action: MonitoredAction,
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    const activityRef = doc(collection(db, 'user_activity'));
    await setDoc(activityRef, {
      userId,
      action,
      timestamp: serverTimestamp(),
      metadata: metadata || {},
    });
  } catch (error) {
    console.error('Error recording user activity:', error);
    // No bloqueamos la operación si falla el logging
  }
};

/**
 * Verificar rate limiting para una acción específica
 */
export const checkRateLimit = async (
  userId: string,
  action: MonitoredAction
): Promise<RateLimitResult> => {
  try {
    const now = new Date();
    let limits;
    
    // Obtener límites según el tipo de acción
    switch (action) {
      case 'program_creation':
        limits = RATE_LIMITS.PROGRAM_CREATION;
        break;
      case 'challenge_creation':
        limits = RATE_LIMITS.CHALLENGE_CREATION;
        break;
      case 'day_creation':
        limits = RATE_LIMITS.DAY_CREATION;
        break;
      default:
        limits = { maxPerMinute: 10, maxPerHour: 50, maxPerDay: 200 };
    }
    
    // Verificar límite por minuto
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const minuteQuery = query(
      collection(db, 'user_activity'),
      where('userId', '==', userId),
      where('action', '==', action),
      where('timestamp', '>=', Timestamp.fromDate(oneMinuteAgo)),
      orderBy('timestamp', 'desc')
    );
    
    const minuteSnapshot = await getDocs(minuteQuery);
    
    if (minuteSnapshot.size >= limits.maxPerMinute) {
      return {
        allowed: false,
        reason: `Demasiadas acciones por minuto. Límite: ${limits.maxPerMinute}`,
        retryAfter: 60,
        currentCount: minuteSnapshot.size,
        limit: limits.maxPerMinute,
      };
    }
    
    // Verificar límite por hora
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const hourQuery = query(
      collection(db, 'user_activity'),
      where('userId', '==', userId),
      where('action', '==', action),
      where('timestamp', '>=', Timestamp.fromDate(oneHourAgo)),
      orderBy('timestamp', 'desc')
    );
    
    const hourSnapshot = await getDocs(hourQuery);
    
    if (hourSnapshot.size >= limits.maxPerHour) {
      return {
        allowed: false,
        reason: `Demasiadas acciones por hora. Límite: ${limits.maxPerHour}`,
        retryAfter: 3600,
        currentCount: hourSnapshot.size,
        limit: limits.maxPerHour,
      };
    }
    
    // Verificar límite por día
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const dayQuery = query(
      collection(db, 'user_activity'),
      where('userId', '==', userId),
      where('action', '==', action),
      where('timestamp', '>=', Timestamp.fromDate(oneDayAgo)),
      orderBy('timestamp', 'desc')
    );
    
    const daySnapshot = await getDocs(dayQuery);
    
    if (daySnapshot.size >= limits.maxPerDay) {
      return {
        allowed: false,
        reason: `Límite diario alcanzado. Límite: ${limits.maxPerDay}`,
        retryAfter: 86400, // 24 horas
        currentCount: daySnapshot.size,
        limit: limits.maxPerDay,
      };
    }
    
    return { allowed: true };
    
  } catch (error) {
    console.error('Error checking rate limit:', error);
    // En caso de error, permitir la acción pero registrar el error
    return { allowed: true };
  }
};

/**
 * Detectar actividad sospechosa
 */
export const detectSuspiciousActivity = async (userId: string): Promise<boolean> => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const activityQuery = query(
      collection(db, 'user_activity'),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(oneHourAgo)),
      orderBy('timestamp', 'desc')
    );
    
    const activitySnapshot = await getDocs(activityQuery);
    
    // Si hay demasiada actividad en una hora, es sospechoso
    if (activitySnapshot.size > RATE_LIMITS.SYSTEM.suspiciousActivityThreshold) {
      console.warn(`Suspicious activity detected for user ${userId}: ${activitySnapshot.size} actions in last hour`);
      return true;
    }
    
    // Detectar patrones de spam (muchas acciones en secuencia rápida)
    const actions = activitySnapshot.docs.map(doc => doc.data());
    let rapidSequenceCount = 0;
    
    for (let i = 1; i < actions.length; i++) {
      const timeDiff = actions[i-1].timestamp.toMillis() - actions[i].timestamp.toMillis();
      
      // Si hay acciones con menos de 5 segundos de diferencia
      if (timeDiff < 5000) {
        rapidSequenceCount++;
      }
    }
    
    // Si más del 50% de las acciones están muy juntas en tiempo, es sospechoso
    if (rapidSequenceCount > actions.length * 0.5 && actions.length > 10) {
      console.warn(`Rapid sequence spam detected for user ${userId}`);
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.error('Error detecting suspicious activity:', error);
    return false;
  }
};

/**
 * Validar límites de documentos en subcolecciones
 */
export const validateSubcollectionLimits = async (
  collectionPath: string
): Promise<RateLimitResult> => {
  try {
    const docsQuery = query(collection(db, collectionPath));
    const docsSnapshot = await getDocs(docsQuery);
    
    if (docsSnapshot.size >= RATE_LIMITS.SYSTEM.maxSubcollectionDocuments) {
      return {
        allowed: false,
        reason: `Límite de documentos en subcolección alcanzado: ${RATE_LIMITS.SYSTEM.maxSubcollectionDocuments}`,
        currentCount: docsSnapshot.size,
        limit: RATE_LIMITS.SYSTEM.maxSubcollectionDocuments,
      };
    }
    
    return { allowed: true };
    
  } catch (error) {
    console.error('Error validating subcollection limits:', error);
    return { allowed: true };
  }
};

/**
 * Función principal para validar y grabar una acción
 */
export const validateAndRecordAction = async (
  userId: string,
  action: MonitoredAction,
  metadata?: Record<string, any>,
  userEmail?: string
): Promise<RateLimitResult> => {
  try {
    // 1. Verificar rate limiting
    const rateLimitResult = await checkRateLimit(userId, action);
    
    if (!rateLimitResult.allowed) {
      return rateLimitResult;
    }
    
    // 2. Detectar actividad sospechosa
    const isSuspicious = await detectSuspiciousActivity(userId);
    
    if (isSuspicious) {
      return {
        allowed: false,
        reason: 'Actividad sospechosa detectada. Contacta al soporte si esto es un error.',
        retryAfter: 3600, // 1 hora
      };
    }
    
    // 3. Grabar la actividad
    await recordUserActivity(userId, action, metadata);
    
    // 4. Verificar y crear alertas automáticas si es necesario
    try {
      await AbuseAlertService.checkAndCreateAlert(userId, action, userEmail);
    } catch (alertError) {
      // No fallar la operación principal si las alertas fallan
      console.error('Error creating automatic alert:', alertError);
    }
    
    return { allowed: true };
    
  } catch (error) {
    console.error('Error in validateAndRecordAction:', error);
    // En caso de error, permitir la acción pero sin grabar
    return { allowed: true };
  }
};

/**
 * Obtener estadísticas de actividad del usuario
 */
export const getUserActivityStats = async (userId: string) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const activityQuery = query(
      collection(db, 'user_activity'),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(oneDayAgo)),
      orderBy('timestamp', 'desc')
    );
    
    const activitySnapshot = await getDocs(activityQuery);
    const activities = activitySnapshot.docs.map(doc => doc.data());
    
    // Contar por tipo de acción
    const actionCounts = activities.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalActions24h: activities.length,
      actionBreakdown: actionCounts,
      lastActivity: activities[0]?.timestamp || null,
    };
    
  } catch (error) {
    console.error('Error getting user activity stats:', error);
    return {
      totalActions24h: 0,
      actionBreakdown: {},
      lastActivity: null,
    };
  }
};

/**
 * Limpiar actividad antigua (debe ejecutarse periódicamente)
 */
export const cleanupOldActivity = async (): Promise<number> => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const oldActivityQuery = query(
      collection(db, 'user_activity'),
      where('timestamp', '<', Timestamp.fromDate(sevenDaysAgo)),
      orderBy('timestamp'),
      limit(100) // Procesar en lotes para evitar timeouts
    );
    
    const oldActivitySnapshot = await getDocs(oldActivityQuery);
    
    // En una implementación real, usarías batch deletes
    // Por ahora solo retornamos el conteo
    return oldActivitySnapshot.size;
    
  } catch (error) {
    console.error('Error cleaning up old activity:', error);
    return 0;
  }
};
