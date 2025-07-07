import { useState } from 'react';
import { useAuth } from './useAuth';
import { 
  iniciarRetoNutricionalAutomatico,
  crearRetoNutricionalCompletoAutomatico 
} from '../services/automaticNutritionCreator';
import { CreateNutritionChallengeRequest } from '../types/nutritionChallenges';

export interface NutritionChallengeCreationStatus {
  isCreating: boolean;
  progress: {
    currentStep: string;
    completedDays: number;
    totalDays: number;
    percentage: number;
  };
  error: string | null;
  challengeId: string | null;
}

/**
 * Hook para crear retos nutricionales automáticamente
 * Maneja el estado de progreso y errores durante la creación
 */
export const useAutomaticNutritionCreator = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<NutritionChallengeCreationStatus>({
    isCreating: false,
    progress: {
      currentStep: '',
      completedDays: 0,
      totalDays: 0,
      percentage: 0,
    },
    error: null,
    challengeId: null,
  });

  /**
   * Crear reto nutricional rápido con configuración mínima
   */
  const crearRetoNutricionalRapido = async (
    nombreReto: string,
    descripcion: string = '',
    totalDias: number = 21
  ): Promise<string | null> => {
    if (!user) {
      setStatus(prev => ({ ...prev, error: 'Usuario no autenticado' }));
      return null;
    }

    try {
      setStatus({
        isCreating: true,
        progress: {
          currentStep: 'Iniciando creación del reto nutricional...',
          completedDays: 0,
          totalDays: totalDias,
          percentage: 0,
        },
        error: null,
        challengeId: null,
      });

      // Simular progreso durante la creación
      const interval = setInterval(() => {
        setStatus(prev => {
          if (prev.progress.completedDays < totalDias - 1) {
            const newCompletedDays = prev.progress.completedDays + 1;
            const newPercentage = Math.round((newCompletedDays / totalDias) * 100);
            return {
              ...prev,
              progress: {
                ...prev.progress,
                currentStep: `Generando plan nutricional del día ${newCompletedDays}/${totalDias}...`,
                completedDays: newCompletedDays,
                percentage: newPercentage,
              },
            };
          }
          return prev;
        });
      }, 100); // Actualizar cada 100ms para efecto visual

      const challengeId = await iniciarRetoNutricionalAutomatico(
        user.uid,
        nombreReto,
        descripcion,
        totalDias
      );

      clearInterval(interval);

      setStatus({
        isCreating: false,
        progress: {
          currentStep: 'Reto nutricional creado exitosamente',
          completedDays: totalDias,
          totalDays: totalDias,
          percentage: 100,
        },
        error: null,
        challengeId,
      });

      return challengeId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setStatus(prev => ({
        ...prev,
        isCreating: false,
        error: errorMessage,
      }));
      return null;
    }
  };

  /**
   * Crear reto nutricional completo con configuración personalizada
   */
  const crearRetoNutricionalPersonalizado = async (
    datosRetoBase: CreateNutritionChallengeRequest
  ): Promise<string | null> => {
    if (!user) {
      setStatus(prev => ({ ...prev, error: 'Usuario no autenticado' }));
      return null;
    }

    try {
      setStatus({
        isCreating: true,
        progress: {
          currentStep: 'Iniciando creación personalizada del reto...',
          completedDays: 0,
          totalDays: datosRetoBase.totalDays,
          percentage: 0,
        },
        error: null,
        challengeId: null,
      });

      // Simular progreso más detallado para creación personalizada
      const interval = setInterval(() => {
        setStatus(prev => {
          if (prev.progress.completedDays < datosRetoBase.totalDays - 1) {
            const newCompletedDays = prev.progress.completedDays + 1;
            const newPercentage = Math.round((newCompletedDays / datosRetoBase.totalDays) * 100);
            
            // Diferentes mensajes según el progreso
            let stepMessage = '';
            if (newCompletedDays <= 5) {
              stepMessage = `Generando recetas para día ${newCompletedDays} con IA...`;
            } else if (newCompletedDays <= 10) {
              stepMessage = `Creando plan de comidas del día ${newCompletedDays}...`;
            } else if (newCompletedDays <= 15) {
              stepMessage = `Calculando macronutrientes del día ${newCompletedDays}...`;
            } else {
              stepMessage = `Finalizando día ${newCompletedDays} del reto nutricional...`;
            }
            
            return {
              ...prev,
              progress: {
                ...prev.progress,
                currentStep: stepMessage,
                completedDays: newCompletedDays,
                percentage: newPercentage,
              },
            };
          }
          return prev;
        });
      }, 80); // Más rápido para retos personalizados

      const challengeId = await crearRetoNutricionalCompletoAutomatico(
        user.uid,
        datosRetoBase
      );

      clearInterval(interval);

      setStatus({
        isCreating: false,
        progress: {
          currentStep: 'Reto nutricional personalizado creado exitosamente',
          completedDays: datosRetoBase.totalDays,
          totalDays: datosRetoBase.totalDays,
          percentage: 100,
        },
        error: null,
        challengeId,
      });

      return challengeId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setStatus(prev => ({
        ...prev,
        isCreating: false,
        error: errorMessage,
      }));
      return null;
    }
  };

  /**
   * Resetear el estado del hook
   */
  const resetStatus = () => {
    setStatus({
      isCreating: false,
      progress: {
        currentStep: '',
        completedDays: 0,
        totalDays: 0,
        percentage: 0,
      },
      error: null,
      challengeId: null,
    });
  };

  return {
    status,
    crearRetoNutricionalRapido,
    crearRetoNutricionalPersonalizado,
    resetStatus,
  };
};
