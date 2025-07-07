import React, { useState, useEffect } from 'react';
import * as fbAuth from 'firebase/auth';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLocalization } from '../hooks/useLocalization';
import { UserExerciseChallenge, ExerciseLevel, WorkoutRoutine, WorkoutLocation, AppNotificationType } from '../types';
import { Dumbbell, Home, Building, Check, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { generateNewRoutine, loadOrGenerateRoutine, saveExerciseChallenge, loadExerciseChallenge, clearExerciseChallenge, saveFitnessChallenge, loadFitnessChallenge, clearFitnessChallenge, loadOrGenerateFitnessChallengeRoutine, generateNextDayWorkoutRoutine } from '../services/exerciseService';
import LoadingSpinner from '../components/LoadingSpinner';
import { XP_REWARDS } from '../constants';
import { Link } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import ExerciseChallengeForm, { ExerciseChallengeFormData } from '../components/ExerciseChallengeForm';
import { getTranslatedExerciseName, getTranslatedDescription, getTranslatedMuscleGroup } from '../data/exerciseRoutines';
import Modal from '../components/Modal';
import { useFirestoreConnection } from '../hooks/useFirestoreConnection';
import Confetti from 'react-confetti';

interface ExerciseChallengePageProps {
  addXP: (points: number) => void;
  isGuest: boolean;
  firebaseUser: fbAuth.User | null | undefined;
}

const DEFAULT_CHALLENGE_STATE: UserExerciseChallenge = {
  status: 'inactive',
  level: 'beginner',
  currentDay: 1,
  completedDays: [],
  lastCompletedDayDate: undefined,
  nextDayUnlockDate: undefined,
  currentDayCompleted: false,
  missedDays: [],
};

const ExerciseChallengePage: React.FC<ExerciseChallengePageProps> = ({ addXP, isGuest, firebaseUser }) => {
  const { t, currentLanguage } = useLocalization();
  const { addNotification } = useNotifications(isGuest, firebaseUser?.uid);
  const dataSavingDisabled = isGuest || !firebaseUser;
  const storageKey = firebaseUser ? `exerciseChallenge_${firebaseUser.uid}` : 'exerciseChallenge_guest';
  const [challengeState, setChallengeState] = useLocalStorage<UserExerciseChallenge>(storageKey, DEFAULT_CHALLENGE_STATE, { disabled: dataSavingDisabled });
  
  // Challenge ID for the new fitness_challenges structure
  const FITNESS_CHALLENGE_ID = 'exercise_challenge_2024';

  const [currentRoutine, setCurrentRoutine] = useState<WorkoutRoutine | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<WorkoutLocation>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [formData, setFormData] = useState<ExerciseChallengeFormData | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const { isConnected } = useFirestoreConnection();
  const [dayCompleteAnimation, setDayCompleteAnimation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDayCompleteMessage, setShowDayCompleteMessage] = useState(false);

  const calculateCurrentDay = () => {
    if (challengeState.status !== 'active' || !challengeState.startDate) {
      return challengeState.currentDay || 1;
    }
    const startDate = new Date(challengeState.startDate);
    const today = new Date();
    
    const startOfDay_startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const startOfDay_today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffTime = startOfDay_today.getTime() - startOfDay_startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const day = Math.max(1, diffDays + 1);
    return day > 30 ? 30 : day; // Cap at day 30
  };

  // Función para verificar si el día actual está disponible (no bloqueado)
  const isCurrentDayAvailable = (): boolean => {
    if (challengeState.status !== 'active') return false;
    
    // Si no hay fecha de desbloqueo, el día está disponible
    if (!challengeState.nextDayUnlockDate) return true;
    
    const now = new Date();
    const unlockDate = new Date(challengeState.nextDayUnlockDate);
    
    return now >= unlockDate;
  };

  // Función para calcular la fecha de desbloqueo del siguiente día (medianoche)
  const calculateNextDayUnlockDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Medianoche
    return tomorrow.toISOString();
  };

  const currentDay = calculateCurrentDay();
  const isDayMarked = challengeState.completedDays.some(d => d.day === currentDay);

  // Initialize challenge data from Firestore on component mount
  useEffect(() => {
    const initializeFromFirestore = async () => {
      if (dataSavingDisabled || !firebaseUser || isInitialized || isResetting) return;

      try {
        // Try new fitness_challenges structure first
        let firestoreData = await loadFitnessChallenge(firebaseUser.uid, FITNESS_CHALLENGE_ID);
        if (firestoreData) {
          setChallengeState(firestoreData);
          console.log('Loaded fitness challenge data from new structure');
        } else {
          // Fallback to old structure
          firestoreData = await loadExerciseChallenge(firebaseUser.uid);
          if (firestoreData) {
            setChallengeState(firestoreData);
            console.log('Loaded exercise challenge data from old structure');
          }
        }
      } catch (error) {
        console.error('Error loading from Firestore:', error);
        // Continue with localStorage data if Firestore fails
      } finally {
        setIsInitialized(true);
      }
    };

    initializeFromFirestore();
  }, [firebaseUser, dataSavingDisabled, isInitialized, isResetting, setChallengeState]);

  // Save to Firestore whenever challenge state changes
  useEffect(() => {
    const saveToFirestore = async () => {
      if (dataSavingDisabled || !firebaseUser || !isInitialized || isResetting) return;

      try {
        // Save to new fitness_challenges structure
        await saveFitnessChallenge(firebaseUser.uid, FITNESS_CHALLENGE_ID, challengeState);
        console.log('Saved to new fitness_challenges structure');
      } catch (error) {
        console.error('Error saving to new structure, trying old structure:', error);
        // Fallback to old structure
        try {
          await saveExerciseChallenge(firebaseUser.uid, challengeState);
        } catch (fallbackError) {
          console.error('Error saving to old structure:', fallbackError);
        }
      }
    };

    saveToFirestore();
  }, [challengeState, firebaseUser, dataSavingDisabled, isInitialized, isResetting]);

  useEffect(() => {
    if (challengeState.status === 'active' && isInitialized && !isResetting) {
      setIsLoading(true);
      const loadRoutine = async () => {
        try {
          let routine: WorkoutRoutine | null = null;
          if (firebaseUser) {
            // Primero intentar cargar rutina existente
            routine = await loadOrGenerateFitnessChallengeRoutine(currentDay, challengeState.level, selectedLocation, firebaseUser.uid, FITNESS_CHALLENGE_ID);
            
            // Si no existe, generar con memoria contextual
            if (!routine) {
              routine = await generateNextDayWorkoutRoutine(
                firebaseUser.uid,
                FITNESS_CHALLENGE_ID,
                challengeState.level,
                selectedLocation,
                formData || undefined,
                currentLanguage || 'es'
              );
            }
            
            // Fallback al método anterior si todo falla
            if (!routine) {
              routine = await loadOrGenerateRoutine(currentDay, challengeState.level, selectedLocation, firebaseUser.uid);
            }
          } else {
            // Fallback para invitados
            routine = await generateNewRoutine(currentDay, challengeState.level, selectedLocation, undefined, formData || undefined, currentLanguage || 'es');
          }
          setCurrentRoutine(routine);
        } catch (error) {
          console.error('Error loading routine:', error);
          // Final fallback
          const fallbackRoutine = await generateNewRoutine(currentDay, challengeState.level, selectedLocation, undefined, formData || undefined, currentLanguage || 'es');
          setCurrentRoutine(fallbackRoutine);
        } finally {
          setIsLoading(false);
        }
      };
      loadRoutine();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeState.status, currentDay, challengeState.level, selectedLocation, isInitialized, isResetting, formData]);

  // Verificar automáticamente si es medianoche para desbloquear el siguiente día
  useEffect(() => {
    if (challengeState.status !== 'active' || !challengeState.nextDayUnlockDate || isResetting) return;

    const checkMidnightUnlock = () => {
      if (!challengeState.nextDayUnlockDate) return;
      
      const now = new Date();
      const unlockDate = new Date(challengeState.nextDayUnlockDate);
      
      if (now >= unlockDate) {
        // Es medianoche, desbloquear el siguiente día
        setChallengeState(prev => {
          const nextDay = prev.currentDay + 1;
          
          // Verificar si el día anterior no se completó
          const previousDay = prev.currentDay;
          const wasPreviousDayCompleted = prev.completedDays.some(d => d.day === previousDay);
          
          let newMissedDays = [...(prev.missedDays || [])];
          if (!wasPreviousDayCompleted && !prev.currentDayCompleted) {
            // Marcar el día anterior como perdido
            newMissedDays.push(previousDay);
          }
          
          return {
            ...prev,
            currentDay: nextDay,
            nextDayUnlockDate: undefined, // Limpiar la fecha de desbloqueo
            missedDays: newMissedDays,
            currentDayCompleted: false, // Resetear para el nuevo día
          };
        });
      }
    };

    // Verificar inmediatamente
    checkMidnightUnlock();

    // Verificar cada minuto
    const interval = setInterval(checkMidnightUnlock, 60000);

    return () => clearInterval(interval);
  }, [challengeState.status, challengeState.nextDayUnlockDate, setChallengeState, isResetting]);

  // Limpiar notificaciones automáticamente
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleFindAnotherRoutine = async () => {
    setIsLoading(true);
    setCurrentRoutine(null);
    try {
      let newRoutine: WorkoutRoutine | null = null;
      if (firebaseUser) {
        // Intentar generar con memoria contextual primero
        newRoutine = await generateNextDayWorkoutRoutine(
          firebaseUser.uid,
          FITNESS_CHALLENGE_ID,
          challengeState.level,
          selectedLocation,
          formData || undefined,
          currentLanguage || 'es'
        );
        
        // Fallback al método directo si falla
        if (!newRoutine) {
          newRoutine = await generateNewRoutine(currentDay, challengeState.level, selectedLocation, firebaseUser.uid, formData || undefined, currentLanguage || 'es');
        }
      } else {
        newRoutine = await generateNewRoutine(currentDay, challengeState.level, selectedLocation, undefined, formData || undefined, currentLanguage || 'es');
      }
      setCurrentRoutine(newRoutine);
      addNotification({ type: AppNotificationType.GENERAL, message: t('generatingNewRoutine') });
    } catch (error) {
      console.error('Error generating new routine:', error);
      addNotification({ type: AppNotificationType.GENERAL, message: t('error' as any) + ': Could not generate a new routine.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkDayComplete = () => {
    if (dataSavingDisabled || isDayMarked) return;

    addXP(XP_REWARDS.EXERCISE_DAY_COMPLETED);
    setNotification(`Día ${currentDay} completado! +${XP_REWARDS.EXERCISE_DAY_COMPLETED} XP`);
    
    // Mostrar mensaje temporal
    setShowDayCompleteMessage(true);

    setChallengeState(prev => {
      const dayToMark = currentDay;
      if (prev.completedDays.some(d => d.day === dayToMark)) {
        return prev;
      }

      const newCompletedDays = [...prev.completedDays, {
        day: dayToMark,
        date: new Date().toISOString(),
        routineId: currentRoutine?.id || 'unknown',
        location: selectedLocation,
      }];
      
      const nextDayUnlockDate = calculateNextDayUnlockDate();
      
      if (dayToMark >= 30) {
        return { 
          ...prev, 
          status: 'completed', 
          completedDays: newCompletedDays,
          lastCompletedDayDate: new Date().toISOString(),
          currentDayCompleted: true
        };
      }

      return {
        ...prev,
        completedDays: newCompletedDays,
        lastCompletedDayDate: new Date().toISOString(),
        nextDayUnlockDate: nextDayUnlockDate,
        currentDayCompleted: true,
      };
    });

    // Activar animación y confeti
    setDayCompleteAnimation(true);
    setShowConfetti(true);
    
    // Desactivar animación después de 1.2 segundos
    setTimeout(() => setDayCompleteAnimation(false), 1200);
    
    // Desactivar confeti después de 3 segundos
    setTimeout(() => setShowConfetti(false), 3000);
    
    // Ocultar mensaje temporal después de 4 segundos
    setTimeout(() => setShowDayCompleteMessage(false), 4000);

    addNotification({ type: AppNotificationType.GENERAL, message: `Día ${currentDay} completado! +${XP_REWARDS.EXERCISE_DAY_COMPLETED} XP` });
  };

  const handleFormComplete = (data: ExerciseChallengeFormData) => {
    // Verificar que no se esté reseteando
    if (isResetting) {
      console.log('Ignorando formulario durante el reseteo');
      return;
    }
    
    setFormData(data);
    setChallengeState({
      ...DEFAULT_CHALLENGE_STATE,
      level: data.fitnessLevel as ExerciseLevel,
      status: 'active',
      startDate: new Date().toISOString(),
      // Aquí podrías guardar más datos personalizados si lo deseas
    });
    // Aquí puedes llamar a la IA o backend para generar el plan personalizado usando 'data'
  };

  const handleResetChallenge = async () => {
    try {
      // Marcar que estamos reseteando para evitar cargar datos de Firestore
      setIsResetting(true);
      
      // Limpiar datos de Firestore si el usuario está autenticado
      if (firebaseUser && !dataSavingDisabled) {
        // Clear from new structure
        await clearFitnessChallenge(firebaseUser.uid, FITNESS_CHALLENGE_ID);
        console.log('Datos de Firestore limpiados de la nueva estructura para el reinicio');
        
        // Also clear from old structure for compatibility
        try {
          await clearExerciseChallenge(firebaseUser.uid);
          console.log('Datos de Firestore limpiados de la estructura antigua para el reinicio');
        } catch (error) {
          console.log('No old structure data to clear');
        }
      }
      
      // Limpiar completamente el estado local
      setChallengeState({
        status: 'inactive',
        level: 'beginner',
        currentDay: 1,
        completedDays: [],
        startDate: undefined,
        lastCompletedDayDate: undefined,
        nextDayUnlockDate: undefined,
        currentDayCompleted: false,
        missedDays: [],
      });
      
      // Limpiar todos los estados relacionados
      setFormData(null);
      setCurrentRoutine(null);
      setShowResetModal(false);
      setNotification(null);
      setShowDayCompleteMessage(false);
      setDayCompleteAnimation(false);
      setShowConfetti(false);
      
      // Resetear el flag de inicialización
      setIsInitialized(false);
      
      // Desactivar el flag de reseteo después de un breve delay
      setTimeout(() => {
        setIsResetting(false);
      }, 1000);
      
      console.log('Reto de ejercicios reiniciado completamente');
    } catch (error) {
      console.error('Error al reiniciar el reto:', error);
      setShowResetModal(false);
      setIsResetting(false);
    }
  };

  if (dataSavingDisabled) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-3">
            <Dumbbell className="text-primary dark:text-primary-light w-7 h-7 md:w-8 md:h-8" />
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark dark:text-white">{t('exerciseChallengeTitle')}</h1>
        </div>
        <div className="p-4 bg-yellow-100 dark:bg-yellow-700 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 rounded-md text-sm flex items-center gap-2">
            <AlertCircle size={20} /> {t('challengeGuestModeExercise')}
        </div>
      </div>
    );
  }

  if (challengeState.status === 'inactive') {
    return (
      <div className="flex flex-col items-center justify-center text-center p-4">
        <Dumbbell size={64} className="text-primary dark:text-primary-light mb-4" />
        <h1 className="text-3xl font-bold text-neutral-dark dark:text-white">{t('exerciseChallengeTitle')}</h1>
        <p className="text-lg text-neutral-dark/80 dark:text-neutral-light/80 max-w-xl mt-2 mb-8">
          {t('exerciseChallengeDesc')}
        </p>
        <div className="w-full max-w-md">
          <ExerciseChallengeForm onComplete={handleFormComplete} />
        </div>
      </div>
    );
  }
  
  if (challengeState.status === 'completed') {
    return (
        <div className="flex flex-col items-center justify-center text-center p-4">
             <Dumbbell size={64} className="text-success dark:text-success-light mb-4" />
            <h1 className="text-3xl font-bold text-neutral-dark dark:text-white">{t('challengeCompleted', '30-Day Exercise Challenge' as any)}</h1>
            <p className="text-lg text-neutral-dark/80 dark:text-neutral-light/80 max-w-xl mt-2 mb-8">
                {t('allChallengesCompleted' as any)}
            </p>
            <button
              className="mt-4 px-6 py-3 rounded-lg bg-danger text-white font-semibold shadow hover:bg-danger-dark transition-colors"
              onClick={() => setShowResetModal(true)}
            >
              {'Reiniciar reto'}
            </button>
            <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title={'Reiniciar reto'}>
              <div className="p-4 text-center">
                <p className="mb-4 text-danger font-semibold">{'¿Seguro que quieres reiniciar el reto? Se perderán todos los datos de progreso y volverás al día 0. Deberás completar nuevamente el formulario inicial.'}</p>
                <div className="flex justify-center gap-4 mt-6">
                  <button className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white font-semibold" onClick={() => setShowResetModal(false)}>{t('cancel')}</button>
                  <button className="px-4 py-2 rounded bg-danger text-white font-bold" onClick={handleResetChallenge}>{'Reiniciar reto'}</button>
                </div>
              </div>
            </Modal>
        </div>
    );
  }


  return (
    <div className="space-y-6 md:space-y-8">
      {notification && <div className="p-4 rounded-md shadow-md text-white bg-success"><p>{notification}</p></div>}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark dark:text-white">{t('exerciseChallenge')}</h1>
            <p className="text-lg text-neutral-dark/80 dark:text-neutral-light/80">{t('dayXofY', currentDay)}</p>
            {challengeState.missedDays && challengeState.missedDays.length > 0 && (
              <p className="text-sm text-warning dark:text-warning-light">
                Días perdidos: {challengeState.missedDays.length} 
                {challengeState.missedDays.length === 1 ? ' día' : ' días'}
              </p>
            )}
        </div>
        <div className="flex items-center gap-4">
            {/* Connection Status Indicator */}
            {!isGuest && (
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{isConnected ? 'Conectado' : 'Sin conexión'}</span>
              </div>
            )}
            
            <div className="flex-shrink-0">
                 <p className="text-sm font-medium text-neutral-dark dark:text-neutral-light">{t('progressLabel')}</p>
                <div className="w-48 bg-neutral/30 dark:bg-slate-700 rounded-full h-2.5 mt-1">
                    <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${(currentDay / 30) * 100}%` }}
                    ></div>
                </div>
                <button
                  className="mt-4 px-4 py-2 rounded bg-danger text-white font-semibold shadow hover:bg-danger-dark transition-colors"
                  onClick={() => setShowResetModal(true)}
                >
                  {'Reiniciar reto'}
                </button>
            </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-neutral-dark dark:text-white">{t('todaysWorkout')}</h2>
            <div className="flex items-center gap-2 p-1 bg-neutral-light dark:bg-slate-700 rounded-lg">
                <button onClick={() => setSelectedLocation('home')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${selectedLocation === 'home' ? 'bg-primary text-white shadow' : 'text-neutral-dark dark:text-neutral-light'}`}><Home size={16}/> {t('home')}</button>
                <button onClick={() => setSelectedLocation('gym')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${selectedLocation === 'gym' ? 'bg-primary text-white shadow' : 'text-neutral-dark dark:text-neutral-light'}`}><Building size={16}/> {t('gym')}</button>
            </div>
        </div>
        
        {isLoading && (
            <div className="flex flex-col items-center justify-center text-center py-16">
                <LoadingSpinner size={48} />
                <p className="mt-4 text-neutral-dark dark:text-neutral-light">{t('loading')}...</p>
            </div>
        )}

        {!isLoading && currentRoutine && (
            <div>
                 <div className="flex items-baseline justify-between mb-4 border-b border-neutral/20 dark:border-slate-700 pb-3">
                    <h3 className="text-lg font-bold text-primary dark:text-primary-light">{getTranslatedMuscleGroup(currentRoutine.muscleGroup)}</h3>
                    <p className="text-sm text-neutral-dark/70 dark:text-neutral-light/70">{t('estimatedTime')}: {currentRoutine.estimatedTime}</p>
                </div>

                <div className="space-y-4">
                    {currentRoutine.exercises.map((ex, index) => (
                        <div key={index} className="p-4 bg-neutral-light dark:bg-slate-700/50 rounded-lg">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-md text-neutral-dark dark:text-white">{getTranslatedExerciseName(ex.name)}</h4>
                                <div className="flex gap-4 text-sm">
                                    <p><strong className="font-semibold">{t('sets')}:</strong> {ex.sets}</p>
                                    <p><strong className="font-semibold">{t('reps')}:</strong> {ex.reps}</p>
                                </div>
                            </div>
                            <p className="text-xs text-neutral-dark/80 dark:text-neutral-light/80 mt-1">{getTranslatedDescription(ex.description)}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
         {!isLoading && !currentRoutine && (
             <div className="text-center py-16">
                 <p className="text-danger">{t('error' as any)}: Could not load a workout routine.</p>
             </div>
        )}
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
            {isDayMarked ? (
                <div className="w-full flex items-center justify-center gap-2 text-center py-3 px-4 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-semibold">
                    <Check size={20} />
                    {t('exerciseCompletedForToday' as any)}
                    <span className="text-base font-normal ml-2">¡Vuelve mañana para tu nueva rutina!</span>
                </div>
            ) : !isCurrentDayAvailable() ? (
                <div className="w-full py-4 mt-4 bg-slate-500 text-white rounded-lg shadow-lg font-semibold flex flex-col items-center justify-center gap-2 text-lg">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mb-1"></div>
                  <span>Día bloqueado</span>
                  <span className="text-base font-normal mt-1">
                    Se desbloquea a medianoche
                  </span>
                  {challengeState.nextDayUnlockDate && (
                    <span className="text-sm opacity-75">
                      {new Date(challengeState.nextDayUnlockDate).toLocaleDateString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
            ) : (
                <div className="space-y-4">
                  {/* Mensaje temporal cuando se completa el día */}
                  {showDayCompleteMessage && (
                    <div className="w-full py-4 mt-4 bg-success/90 text-white rounded-lg shadow-lg font-semibold flex flex-col items-center justify-center gap-2 text-lg animate-pulse">
                      <Check size={28} className="mb-1" />
                      ¡Día completo!
                      <span className="text-base font-normal mt-1">Vuelve mañana para seguir con tu rutina</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleFindAnotherRoutine} disabled={isLoading} className="w-full sm:w-auto flex-1 justify-center items-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors disabled:opacity-50 flex gap-2">
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''}/>
                        {isLoading ? t('generatingNewRoutine') : t('findAnotherRoutine')}
                    </button>
                    <button 
                      onClick={handleMarkDayComplete} 
                      disabled={isLoading || showDayCompleteMessage} 
                      className={`w-full sm:w-auto flex-1 justify-center items-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white transition-all disabled:opacity-50 flex gap-2 ${
                        showDayCompleteMessage 
                          ? 'bg-slate-500 cursor-not-allowed' 
                          : 'bg-success hover:bg-success-dark'
                      } ${dayCompleteAnimation ? 'animate-bounce-scale' : ''}`}
                    >
                        <Check size={18} />
                        {t('markExerciseDayComplete')}
                    </button>
                  </div>
                </div>
            )}
        </div>
      </div>
      
      {challengeState.status === 'active' && (
        <div className="mt-6 text-center text-sm text-neutral-dark/70 dark:text-neutral-light/70 p-4 bg-blue-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center gap-2">
            <Info size={16} className="text-blue-500"/>
            <p>
              {t('exerciseChallengeLevelChangeNote').split('{0}')[0]}
              <Link to="/settings" className="font-semibold text-primary dark:text-primary-light hover:underline">
                {t('changeLevelInSettings' as any)}
              </Link>
              {t('exerciseChallengeLevelChangeNote').split('{0}')[1]}
            </p>
        </div>
      )}
      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title={'Reiniciar reto'}>
        <div className="p-4 text-center">
          <p className="mb-4 text-danger font-semibold">{'¿Seguro que quieres reiniciar el reto? Se perderán todos los datos de progreso y volverás al día 0. Deberás completar nuevamente el formulario inicial.'}</p>
          <div className="flex justify-center gap-4 mt-6">
            <button className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white font-semibold" onClick={() => setShowResetModal(false)}>{t('cancel')}</button>
            <button className="px-4 py-2 rounded bg-danger text-white font-bold" onClick={handleResetChallenge}>{'Reiniciar reto'}</button>
          </div>
        </div>
      </Modal>
      
      {/* Confeti cuando se completa el día */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          colors={['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']}
        />
      )}
    </div>
  );
};

export default ExerciseChallengePage;