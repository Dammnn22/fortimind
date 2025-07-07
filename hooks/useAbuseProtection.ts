import { useState, useCallback } from 'react';
import { 
  validateAndRecordAction, 
  checkRateLimit,
  getUserActivityStats,
  MonitoredAction,
  RateLimitResult 
} from '../services/abuseProtectionService';
import { useAuth } from './useAuth';

export interface AbuseProtectionHookResult {
  // Estados
  isBlocked: boolean;
  retryAfter: number | null;
  activityStats: {
    totalActions24h: number;
    actionBreakdown: Record<string, number>;
    lastActivity: any;
  } | null;
  loading: boolean;
  
  // Funciones
  validateAction: (action: MonitoredAction, metadata?: Record<string, any>) => Promise<boolean>;
  checkActionLimit: (action: MonitoredAction) => Promise<RateLimitResult>;
  refreshActivityStats: () => Promise<void>;
  getRemainingActions: (action: MonitoredAction) => Promise<{ remaining: number; limit: number }>;
}

/**
 * Hook para manejar protección contra abuso en el frontend
 */
export const useAbuseProtection = (): AbuseProtectionHookResult => {
  const { user } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [activityStats, setActivityStats] = useState<{
    totalActions24h: number;
    actionBreakdown: Record<string, number>;
    lastActivity: any;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Validar y registrar una acción antes de ejecutarla
   */
  const validateAction = useCallback(async (
    action: MonitoredAction,
    metadata?: Record<string, any>
  ): Promise<boolean> => {
    if (!user?.uid) {
      console.warn('No user authenticated for abuse protection');
      return false;
    }

    try {
      setLoading(true);
      
      const result = await validateAndRecordAction(user.uid, action, metadata);
      
      if (!result.allowed) {
        setIsBlocked(true);
        setRetryAfter(result.retryAfter || null);
        
        // Auto-limpiar el bloqueo después del tiempo especificado
        if (result.retryAfter && result.retryAfter < 3600) { // máximo 1 hora
          setTimeout(() => {
            setIsBlocked(false);
            setRetryAfter(null);
          }, result.retryAfter * 1000);
        }
        
        return false;
      }
      
      // Limpiar estados de bloqueo si la acción fue exitosa
      setIsBlocked(false);
      setRetryAfter(null);
      
      return true;
      
    } catch (error) {
      console.error('Error validating action:', error);
      // En caso de error, permitir la acción pero mostrar warning
      return true;
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  /**
   * Verificar límites sin registrar la acción
   */
  const checkActionLimit = useCallback(async (
    action: MonitoredAction
  ): Promise<RateLimitResult> => {
    if (!user?.uid) {
      return { allowed: false, reason: 'Usuario no autenticado' };
    }

    try {
      return await checkRateLimit(user.uid, action);
    } catch (error) {
      console.error('Error checking action limit:', error);
      return { allowed: true }; // En caso de error, permitir
    }
  }, [user?.uid]);

  /**
   * Obtener estadísticas de actividad del usuario
   */
  const refreshActivityStats = useCallback(async (): Promise<void> => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const stats = await getUserActivityStats(user.uid);
      setActivityStats(stats);
    } catch (error) {
      console.error('Error refreshing activity stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  /**
   * Calcular acciones restantes para un tipo específico
   */
  const getRemainingActions = useCallback(async (
    action: MonitoredAction
  ): Promise<{ remaining: number; limit: number }> => {
    if (!user?.uid) {
      return { remaining: 0, limit: 0 };
    }

    try {
      const result = await checkRateLimit(user.uid, action);
      
      if (result.allowed && result.currentCount !== undefined && result.limit !== undefined) {
        return {
          remaining: Math.max(0, result.limit - result.currentCount),
          limit: result.limit
        };
      }
      
      // Si está bloqueado, no tiene acciones restantes
      if (!result.allowed) {
        return { remaining: 0, limit: result.limit || 0 };
      }
      
      // Si no hay información específica, asumir valores por defecto
      return { remaining: 5, limit: 5 };
      
    } catch (error) {
      console.error('Error getting remaining actions:', error);
      return { remaining: 1, limit: 1 }; // Valor conservador en caso de error
    }
  }, [user?.uid]);

  return {
    isBlocked,
    retryAfter,
    activityStats,
    loading,
    validateAction,
    checkActionLimit,
    refreshActivityStats,
    getRemainingActions,
  };
};

/**
 * Hook simplificado específico para creación de programas
 */
export const useProgramCreationProtection = () => {
  const protection = useAbuseProtection();
  
  const validateProgramCreation = useCallback(async (metadata?: Record<string, any>) => {
    return await protection.validateAction('program_creation', metadata);
  }, [protection.validateAction]);
  
  const getRemainingPrograms = useCallback(async () => {
    return await protection.getRemainingActions('program_creation');
  }, [protection.getRemainingActions]);
  
  return {
    ...protection,
    validateProgramCreation,
    getRemainingPrograms,
  };
};

/**
 * Hook simplificado específico para creación de retos nutricionales
 */
export const useChallengeCreationProtection = () => {
  const protection = useAbuseProtection();
  
  const validateChallengeCreation = useCallback(async (metadata?: Record<string, any>) => {
    return await protection.validateAction('challenge_creation', metadata);
  }, [protection.validateAction]);
  
  const getRemainingChallenges = useCallback(async () => {
    return await protection.getRemainingActions('challenge_creation');
  }, [protection.getRemainingActions]);
  
  return {
    ...protection,
    validateChallengeCreation,
    getRemainingChallenges,
  };
};
