import { useState } from 'react';
import { useAuth } from './useAuth';
import { 
  iniciarProgramaAutomatico,
  crearProgramaCompletoAutomatico 
} from '../services/automaticProgramCreator';
import { CreateProgramRequest } from '../types/exercisePrograms';

export interface ProgramCreationStatus {
  isCreating: boolean;
  progress: {
    currentStep: string;
    completedDays: number;
    totalDays: number;
    percentage: number;
  };
  error: string | null;
  programId: string | null;
}

/**
 * Hook para crear programas de ejercicio automáticamente
 * Maneja el estado de progreso y errores durante la creación
 */
export const useAutomaticProgramCreator = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<ProgramCreationStatus>({
    isCreating: false,
    progress: {
      currentStep: '',
      completedDays: 0,
      totalDays: 0,
      percentage: 0,
    },
    error: null,
    programId: null,
  });

  /**
   * Crear programa rápido con configuración mínima
   */
  const crearProgramaRapido = async (
    nombrePrograma: string,
    descripcion: string = '',
    totalDias: number = 30
  ): Promise<string | null> => {
    if (!user) {
      setStatus(prev => ({ ...prev, error: 'Usuario no autenticado' }));
      return null;
    }

    try {
      setStatus({
        isCreating: true,
        progress: {
          currentStep: 'Iniciando creación del programa...',
          completedDays: 0,
          totalDays: totalDias,
          percentage: 0,
        },
        error: null,
        programId: null,
      });

      const programId = await iniciarProgramaAutomatico(
        user.uid,
        nombrePrograma,
        descripcion,
        totalDias
      );

      setStatus({
        isCreating: false,
        progress: {
          currentStep: 'Programa creado exitosamente',
          completedDays: totalDias,
          totalDays: totalDias,
          percentage: 100,
        },
        error: null,
        programId,
      });

      return programId;
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
   * Crear programa completo con configuración personalizada
   */
  const crearProgramaPersonalizado = async (
    datosProgramaBase: CreateProgramRequest
  ): Promise<string | null> => {
    if (!user) {
      setStatus(prev => ({ ...prev, error: 'Usuario no autenticado' }));
      return null;
    }

    try {
      setStatus({
        isCreating: true,
        progress: {
          currentStep: 'Creando programa personalizado...',
          completedDays: 0,
          totalDays: datosProgramaBase.totalDays,
          percentage: 0,
        },
        error: null,
        programId: null,
      });

      // Simular progreso durante la creación
      const intervalId = setInterval(() => {
        setStatus(prev => {
          if (prev.progress.percentage < 90) {
            return {
              ...prev,
              progress: {
                ...prev.progress,
                currentStep: `Generando día ${Math.floor(prev.progress.percentage / 3)}...`,
                percentage: prev.progress.percentage + 5,
              },
            };
          }
          return prev;
        });
      }, 1000);

      const programId = await crearProgramaCompletoAutomatico(user.uid, datosProgramaBase);

      clearInterval(intervalId);

      setStatus({
        isCreating: false,
        progress: {
          currentStep: 'Programa personalizado creado exitosamente',
          completedDays: datosProgramaBase.totalDays,
          totalDays: datosProgramaBase.totalDays,
          percentage: 100,
        },
        error: null,
        programId,
      });

      return programId;
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
   * Resetear estado del hook
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
      programId: null,
    });
  };

  return {
    status,
    crearProgramaRapido,
    crearProgramaPersonalizado,
    resetStatus,
  };
};
