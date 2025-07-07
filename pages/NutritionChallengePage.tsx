import React, { useState, useEffect } from 'react';
import * as fbAuth from 'firebase/auth';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLocalization } from '../hooks/useLocalization';
import { UserNutritionChallenge, NutritionGoal, DietaryStyle, DailyMealPlan, Meal, AIPersona } from '../types';
import { Leaf, AlertCircle, Check, RefreshCw, Utensils, Wheat, Beef, Vegan, Droplets, ArrowLeft } from 'lucide-react';
import { generateDailyMealPlan, generateReplacementMeal, loadOrGenerateMealPlan, saveNutritionChallenge, loadNutritionChallenge, generateNextDayMealPlan, clearNutritionChallenge } from '../services/nutritionService';
import LoadingSpinner from '../components/LoadingSpinner';
import { XP_REWARDS } from '../constants';
import { getTranslatedMealName, getTranslatedMealDescription, getTranslatedIngredient, getPredefinedMealPlan } from '../data/nutritionPlans';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import NutritionPersonalizationForm, { NutritionPersonalizationData } from '../components/NutritionPersonalizationForm';
import { getDeepSeekAdvice } from '../services/deepSeekService';
import NutritionPlanViewer from '../components/NutritionPlanViewer';
import { useFirestoreConnection } from '../hooks/useFirestoreConnection';
import Modal from '../components/Modal';
import Confetti from 'react-confetti';

interface NutritionChallengePageProps {
  addXP: (points: number) => void;
  isGuest: boolean;
  firebaseUser: fbAuth.User | null | undefined;
}

const DEFAULT_CHALLENGE_STATE: UserNutritionChallenge = {
  status: 'inactive',
  goal: 'maintainWeight',
  dietaryStyle: 'omnivore',
  allergies: '',
  preferences: '',
  currentDay: 1,
  completedDays: [],
  lastCompletedDayDate: undefined,
  nextDayUnlockDate: undefined,
  currentDayCompletedMeals: {
    breakfast: false,
    lunch: false,
    dinner: false,
    snack1: false,
    snack2: false,
  },
  missedDays: [],
  personalizationData: undefined,
};

const NutritionChallengePage: React.FC<NutritionChallengePageProps> = ({ addXP, isGuest, firebaseUser }) => {
  const { t, currentLanguage } = useLocalization();
  const { addNotification } = useNotifications(isGuest, firebaseUser?.uid);
  const dataSavingDisabled = isGuest || !firebaseUser;
  const storageKey = firebaseUser ? `nutritionChallenge_${firebaseUser.uid}` : 'nutritionChallenge_guest';
  const [challengeState, setChallengeState] = useLocalStorage<UserNutritionChallenge>(storageKey, DEFAULT_CHALLENGE_STATE, { disabled: dataSavingDisabled });
  
  const [isLoading, setIsLoading] = useState(false);
  const [mealLoading, setMealLoading] = useState<keyof Omit<DailyMealPlan, 'day'> | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [personalizationData, setPersonalizationData] = useState<NutritionPersonalizationData | null>(null);
  const [planPersonalizado, setPlanPersonalizado] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { isConnected } = useFirestoreConnection();
  const [dayCompleteAnimation, setDayCompleteAnimation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDayCompleteMessage, setShowDayCompleteMessage] = useState(false);
  
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

  // Función para verificar si una comida específica está completada
  const isMealCompleted = (mealType: keyof Omit<DailyMealPlan, 'day'>): boolean => {
    return challengeState.currentDayCompletedMeals?.[mealType] || false;
  };

  // Función para verificar si todas las comidas del día están completadas
  const areAllMealsCompleted = (): boolean => {
    if (!challengeState.currentPlan) return false;
    
    const mealTypes: (keyof Omit<DailyMealPlan, 'day'>)[] = ['breakfast', 'lunch', 'dinner'];
    if (challengeState.currentPlan.snack1) mealTypes.push('snack1');
    if (challengeState.currentPlan.snack2) mealTypes.push('snack2');
    
    return mealTypes.every(mealType => isMealCompleted(mealType));
  };

  // Función para verificar si el día actual está completado
  const isDayCompleted = challengeState.status === 'active' && challengeState.completedDays.some(d => d.day === challengeState.currentDay);

  // Initialize challenge data from Firestore on component mount
  useEffect(() => {
    const initializeFromFirestore = async () => {
      console.log('Initializing from Firestore:', {
        dataSavingDisabled,
        firebaseUser: firebaseUser ? { uid: firebaseUser.uid, email: firebaseUser.email } : null,
        isInitialized,
        isResetting
      });
      
      if (dataSavingDisabled || !firebaseUser || isInitialized || isResetting) {
        console.log('Skipping Firestore initialization - conditions not met');
        return;
      }

      try {
        console.log('Loading nutrition challenge data for user:', firebaseUser.uid);
        const firestoreData = await loadNutritionChallenge(firebaseUser.uid);
        if (firestoreData) {
          setChallengeState(firestoreData);
          console.log('Loaded nutrition challenge data from Firestore');
        } else {
          console.log('No existing data found in Firestore');
        }
      } catch (error) {
        console.error('Error loading from Firestore:', error);
        // Continue with localStorage data if Firestore fails
      } finally {
        setIsInitialized(true);
      }
    };

    initializeFromFirestore();
  }, [firebaseUser, dataSavingDisabled, isInitialized, setChallengeState]);

  // Save to Firestore whenever challenge state changes
  useEffect(() => {
    const saveToFirestore = async () => {
      console.log('Attempting to save to Firestore:', {
        dataSavingDisabled,
        firebaseUser: firebaseUser ? 'present' : 'null',
        isInitialized,
        isResetting,
        userId: firebaseUser?.uid
      });
      
      if (dataSavingDisabled || !firebaseUser || !isInitialized || isResetting) {
        console.log('Skipping Firestore save - conditions not met');
        return;
      }

      try {
        console.log('Saving nutrition challenge for user:', firebaseUser.uid);
        await saveNutritionChallenge(firebaseUser.uid, challengeState);
        console.log('Successfully saved to Firestore');
      } catch (error) {
        console.error('Error saving to Firestore:', error);
        // Continue with localStorage if Firestore fails
      }
    };

    saveToFirestore();
  }, [challengeState, firebaseUser, dataSavingDisabled, isInitialized, isResetting]);

  useEffect(() => {
    // Generate a new plan if the challenge is active and there's no plan for the current day
    if (challengeState.status === 'active' && isInitialized && !isResetting && (!challengeState.currentPlan || challengeState.currentPlan.day !== challengeState.currentDay)) {
      setIsLoading(true);
      const loadPlan = async () => {
        try {
          const { goal, dietaryStyle, allergies, preferences } = challengeState;
          let plan: DailyMealPlan | null = null;
          
          if (firebaseUser) {
            // Try to load or generate meal plan with Firestore integration
            plan = await loadOrGenerateMealPlan({ goal, dietaryStyle, allergies, preferences }, challengeState.currentDay, firebaseUser.uid, currentLanguage);
          } else {
            // Fallback to original method for guest users
            plan = await generateDailyMealPlan({ goal, dietaryStyle, allergies, preferences }, challengeState.currentDay, undefined, currentLanguage);
          }
          
          setChallengeState(prev => ({ ...prev, currentPlan: plan }));
        } catch (error) {
          console.error('Error loading meal plan:', error);
          // Final fallback
          const { goal, dietaryStyle, allergies, preferences } = challengeState;
          const fallbackPlan = await generateDailyMealPlan({ goal, dietaryStyle, allergies, preferences }, challengeState.currentDay, undefined, currentLanguage);
          setChallengeState(prev => ({ ...prev, currentPlan: fallbackPlan }));
        } finally {
          setIsLoading(false);
        }
      };
      
      loadPlan();
    }
  }, [challengeState.status, challengeState.currentDay, challengeState.currentPlan, challengeState.goal, challengeState.dietaryStyle, challengeState.allergies, challengeState.preferences, setChallengeState, isInitialized, isResetting, firebaseUser, currentLanguage]);
  
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleStartChallenge = async () => {
    setIsLoading(true);
    try {
      const { goal, dietaryStyle, allergies, preferences } = challengeState;
      let initialPlan: DailyMealPlan | null = null;
      
      if (firebaseUser) {
        // Generate initial plan with Firestore integration
        initialPlan = await generateDailyMealPlan({ goal, dietaryStyle, allergies, preferences }, 1, firebaseUser.uid, currentLanguage);
      } else {
        // Fallback for guest users
        initialPlan = await generateDailyMealPlan({ goal, dietaryStyle, allergies, preferences }, 1, undefined, currentLanguage);
      }
      
      setChallengeState({
        ...challengeState,
        status: 'active',
        currentDay: 1,
        startDate: new Date().toISOString(),
        currentPlan: initialPlan,
        completedDays: []
      });
    } catch (error) {
      console.error('Error starting challenge:', error);
      setNotification(t('error' as any) + ': Could not start challenge.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindAnotherMeal = async (mealType: keyof Omit<DailyMealPlan, 'day'>) => {
    setMealLoading(mealType);
    try {
      const { goal, dietaryStyle, allergies, preferences } = challengeState;
      let newMeal: Meal | null = null;
      
      if (firebaseUser) {
        // Generate replacement meal with Firestore integration
        newMeal = await generateReplacementMeal({ goal, dietaryStyle, allergies, preferences }, mealType, firebaseUser.uid, currentLanguage);
      } else {
        // Fallback for guest users
        newMeal = await generateReplacementMeal({ goal, dietaryStyle, allergies, preferences }, mealType, undefined, currentLanguage);
      }
      
      if (newMeal && challengeState.currentPlan) {
        setChallengeState(prev => ({
          ...prev,
          currentPlan: prev.currentPlan ? { ...prev.currentPlan, [mealType]: newMeal } : null,
        }));
      } else {
        setNotification(t('error' as any) + ": Could not generate a new meal.");
      }
    } catch (error) {
      console.error('Error generating replacement meal:', error);
      setNotification(t('error' as any) + ": Could not generate a new meal.");
    } finally {
      setMealLoading(null);
    }
  };

  // Función para marcar una comida individual como completada
  const handleMarkMealComplete = (mealType: keyof Omit<DailyMealPlan, 'day'>) => {
    if (dataSavingDisabled || isDayCompleted) return;
    
    setChallengeState(prev => ({
      ...prev,
      currentDayCompletedMeals: {
        ...prev.currentDayCompletedMeals,
        [mealType]: true
      }
    }));
    
    setNotification(`${t(mealType as any)} marcado como completado!`);
  };

  // Función para desmarcar una comida como completada
  const handleUnmarkMealComplete = (mealType: keyof Omit<DailyMealPlan, 'day'>) => {
    if (dataSavingDisabled || isDayCompleted) return;
    
    setChallengeState(prev => ({
      ...prev,
      currentDayCompletedMeals: {
        ...prev.currentDayCompletedMeals,
        [mealType]: false
      }
    }));
  };

  const handleMarkDayComplete = () => {
    if (dataSavingDisabled || isDayCompleted || !areAllMealsCompleted()) return;
    
    addXP(XP_REWARDS.NUTRITION_DAY_COMPLETED);
    setNotification(t('nutritionDayMarkedCompleteXP', challengeState.currentDay, XP_REWARDS.NUTRITION_DAY_COMPLETED));
    
    // Mostrar mensaje temporal
    setShowDayCompleteMessage(true);
    
    // Marcar el día como completado y bloquear hasta mañana
    setChallengeState(prev => {
        const newCompletedDays = [...prev.completedDays, { day: prev.currentDay, date: new Date().toISOString() }];
        const nextDayUnlockDate = calculateNextDayUnlockDate();
        
        // Si es el día 30, completar el reto
        if (prev.currentDay >= 30) {
            return { 
                ...prev, 
                status: 'completed', 
                completedDays: newCompletedDays, 
                currentPlan: null,
                lastCompletedDayDate: new Date().toISOString(),
                currentDayCompletedMeals: {
                  breakfast: false,
                  lunch: false,
                  dinner: false,
                  snack1: false,
                  snack2: false,
                }
            };
        }
        
        // Bloquear hasta mañana
        return { 
            ...prev, 
            completedDays: newCompletedDays,
            lastCompletedDayDate: new Date().toISOString(),
            nextDayUnlockDate: nextDayUnlockDate,
            currentDayCompletedMeals: {
              breakfast: false,
              lunch: false,
              dinner: false,
              snack1: false,
              snack2: false,
            }
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
  };

  // Al finalizar el formulario de personalización, generar el plan personalizado con la IA
  const handlePersonalizationComplete = async (data: NutritionPersonalizationData) => {
    // Verificar que no se esté reseteando
    if (isResetting) {
      console.log('Ignorando personalización durante el reseteo');
      return;
    }
    
    setPersonalizationData(data);
    
    // Mapear los datos del formulario detallado al estado del reto
    const goalMapping: Record<string, NutritionGoal> = {
      'pérdida de peso': 'loseWeight',
      'mantenimiento': 'maintainWeight',
      'ganancia muscular': 'gainMuscle',
      'mejorar energía': 'maintainWeight',
      'control de glucemia': 'maintainWeight',
      'mejorar salud metabólica': 'maintainWeight',
      'otro': 'maintainWeight'
    };

    const dietaryStyleMapping: Record<string, DietaryStyle> = {
      'omnivoro': 'omnivore',
      'vegetariano': 'vegetarian',
      'vegano': 'vegan',
      'cetogénico': 'omnivore',
      'paleo': 'omnivore',
      'ayuno intermitente': 'omnivore',
      'carnívoro': 'omnivore',
      'otro': 'omnivore'
    };

    // Iniciar el reto inmediatamente con los datos personalizados mapeados
    setChallengeState(prev => ({
      ...prev,
      goal: goalMapping[data.objetivo_nutricional] || 'maintainWeight',
      dietaryStyle: dietaryStyleMapping[data.tipo_dieta] || 'omnivore',
      allergies: data.alergias_intolerancias || '',
      preferences: data.restricciones_culturales || '',
      status: 'active',
      startDate: new Date().toISOString(),
      // Guardar los datos personalizados completos para referencia futura
      personalizationData: {
        objetivo_nutricional: data.objetivo_nutricional,
        tipo_dieta: data.tipo_dieta,
        habitos_alimenticios: data.habitos_alimenticios,
        nivel_actividad: data.nivel_actividad,
        nivel_actividad_detalle: data.nivel_actividad_detalle,
        biometricos: data.biometricos,
        condiciones_medicas: data.condiciones_medicas,
        alergias_intolerancias: data.alergias_intolerancias,
        restricciones_culturales: data.restricciones_culturales,
      }
    }));
    
    addNotification({ type: 'GENERAL' as any, message: t('challengeStarted') || 'Reto nutricional iniciado' });
  };

  // Función para verificar y generar automáticamente el día actual si falta
  const checkAndGenerateCurrentDay = async () => {
    if (!firebaseUser || challengeState.status !== 'active') return;
    
    try {
      const { goal, dietaryStyle, allergies, preferences } = challengeState;
      const profile = { goal, dietaryStyle, allergies, preferences };
      
      // Generar automáticamente el día actual si no existe
      const nextDayPlan = await generateNextDayMealPlan(
        firebaseUser.uid,
        'nutrition_challenge_2024', // challengeId fijo o dinámico
        profile,
        currentLanguage
      );
      
      if (nextDayPlan) {
        setChallengeState(prev => ({ ...prev, currentPlan: nextDayPlan }));
        console.log('Día actual generado automáticamente');
      }
    } catch (error) {
      console.error('Error generando día actual automáticamente:', error);
    }
  };

  // Verificar al cargar la página
  useEffect(() => {
    if (isInitialized && firebaseUser && challengeState.status === 'active' && !isResetting) {
      checkAndGenerateCurrentDay();
    }
  }, [isInitialized, firebaseUser, challengeState.status, isResetting]);

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
          if (!wasPreviousDayCompleted && !areAllMealsCompleted()) {
            // Marcar el día anterior como perdido
            newMissedDays.push(previousDay);
          }
          
          return {
            ...prev,
            currentDay: nextDay,
            nextDayUnlockDate: undefined, // Limpiar la fecha de desbloqueo
            currentPlan: null, // Forzar regeneración del plan
            missedDays: newMissedDays,
            currentDayCompletedMeals: {
              breakfast: false,
              lunch: false,
              dinner: false,
              snack1: false,
              snack2: false,
            }
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

  // Función para obtener el día actual del reto
  const getCurrentChallengeDay = () => {
    if (!challengeState.startDate) return 1;
    const startDate = new Date(challengeState.startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  // Función para verificar si el plan del día actual está completo
  const isCurrentDayComplete = () => {
    // Aquí puedes implementar lógica para verificar si el usuario completó las comidas del día
    // Por ahora, asumimos que está completo si existe el plan
    return challengeState.currentPlan && challengeState.currentPlan.day === getCurrentChallengeDay();
  };

  const handleResetChallenge = async () => {
    try {
      // Marcar que estamos reseteando para evitar cargar datos de Firestore
      setIsResetting(true);
      
      // Limpiar datos de Firestore si el usuario está autenticado
      if (firebaseUser && !dataSavingDisabled) {
        await clearNutritionChallenge(firebaseUser.uid);
        console.log('Datos de Firestore limpiados para el reinicio');
      }
      
      // Limpiar completamente el estado local
      setChallengeState({
        status: 'inactive',
        goal: 'maintainWeight',
        dietaryStyle: 'omnivore',
        allergies: '',
        preferences: '',
        currentDay: 1,
        completedDays: [],
        lastCompletedDayDate: undefined,
        nextDayUnlockDate: undefined,
        currentDayCompletedMeals: {
          breakfast: false,
          lunch: false,
          dinner: false,
          snack1: false,
          snack2: false,
        },
        missedDays: [],
        personalizationData: undefined,
        currentPlan: null, // Asegurar que no hay plan actual
        startDate: undefined, // Limpiar fecha de inicio
      });
      
      // Limpiar todos los estados relacionados
      setPersonalizationData(null);
      setPlanPersonalizado(null);
      setPlanError(null);
      setNotification(null);
      setShowDayCompleteMessage(false);
      setDayCompleteAnimation(false);
      setShowConfetti(false);
      setShowResetModal(false);
      
      // Resetear el flag de inicialización
      setIsInitialized(false);
      
      // Desactivar el flag de reseteo después de un breve delay
      setTimeout(() => {
        setIsResetting(false);
      }, 1000);
      
      console.log('Reto nutricional reiniciado completamente');
    } catch (error) {
      console.error('Error al reiniciar el reto:', error);
      setShowResetModal(false);
      setIsResetting(false);
    }
  };

  if (challengeState.status === 'inactive') {
    return (
      <div className="flex flex-col items-center justify-center text-center p-4">
        <Leaf size={64} className="text-primary dark:text-primary-light mb-4" />
        <h1 className="text-3xl font-bold text-neutral-dark dark:text-white">{t('nutritionChallengeTitle')}</h1>
        <p className="text-lg text-neutral-dark/80 dark:text-neutral-light/80 max-w-xl mt-2 mb-8">
          {t('nutritionChallengeDesc')}
        </p>
        <div className="w-full max-w-lg">
          <NutritionPersonalizationForm
            onComplete={handlePersonalizationComplete}
          />
        </div>
      </div>
    );
  }
  
  if (challengeState.status === 'completed') {
    return (
        <div className="flex flex-col items-center justify-center text-center p-4">
             <Leaf size={64} className="text-success dark:text-success-light mb-4" />
            <h1 className="text-3xl font-bold text-neutral-dark dark:text-white">{t('challengeCompleted', '30-Day Nutrition Challenge' as any)}</h1>
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
  
  // --- Render Challenge View ---
  return (
    <div className="space-y-6 md:space-y-8">
        {notification && <div className="p-4 rounded-md shadow-md text-white bg-success"><p>{notification}</p></div>}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark dark:text-white">{t('nutritionChallenge')}</h1>
                <p className="text-lg text-neutral-dark/80 dark:text-neutral-light/80">{t('dayXofY', challengeState.currentDay)}</p>
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
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(challengeState.currentDay / 30) * 100}%` }}></div>
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

        {isLoading ? (
            <div className="flex flex-col items-center justify-center text-center py-16"><LoadingSpinner size={48} /><p className="mt-4">{t('loading')}...</p></div>
        ) : !challengeState.currentPlan ? (
             <div className="text-center py-16"><p className="text-danger">{t('error' as any)}: Could not load meal plan.</p></div>
        ) : (
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-center text-neutral-dark dark:text-white">{t('todaysMealPlan')}</h2>
                {(Object.keys(challengeState.currentPlan) as Array<keyof DailyMealPlan>)
                    .filter((mealType): mealType is keyof Omit<DailyMealPlan, 'day'> => mealType !== 'day' && !!challengeState.currentPlan?.[mealType])
                    .map(mealType => (
                    <MealCard 
                        key={mealType} 
                        meal={challengeState.currentPlan![mealType] as Meal} 
                        mealType={mealType} 
                        onFindAnother={handleFindAnotherMeal} 
                        onMarkComplete={handleMarkMealComplete}
                        onUnmarkComplete={handleUnmarkMealComplete}
                        isCompleted={isMealCompleted(mealType)}
                        isDayCompleted={isDayCompleted}
                        isLoading={mealLoading === mealType} 
                    />
                ))}

                {isDayCompleted ? (
                  <div className="w-full py-4 mt-4 bg-primary/90 text-white rounded-lg shadow-lg font-semibold flex flex-col items-center justify-center gap-2 text-lg">
                    <Check size={28} className="mb-1" />
                    {t('completedToday')}
                    <span className="text-base font-normal mt-1">{t('comeBackTomorrowForNextPlan') || '¡Vuelve mañana para tu nuevo plan personalizado!'}</span>
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
                    {/* Progreso de comidas completadas */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                      <h3 className="text-lg font-semibold text-neutral-dark dark:text-white mb-3">Progreso del día</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {(['breakfast', 'lunch', 'dinner', 'snack1', 'snack2'] as const)
                          .filter(mealType => challengeState.currentPlan?.[mealType])
                          .map(mealType => (
                            <div key={mealType} className={`flex items-center gap-2 p-2 rounded-md ${
                              isMealCompleted(mealType) 
                                ? 'bg-success/20 border border-success' 
                                : 'bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600'
                            }`}>
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                isMealCompleted(mealType) ? 'bg-success text-white' : 'bg-slate-300 dark:bg-slate-600'
                              }`}>
                                {isMealCompleted(mealType) && <Check size={12} />}
                              </div>
                              <span className="text-sm font-medium text-neutral-dark dark:text-white">
                                {t(mealType as any)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                    
                    {/* Mensaje temporal cuando se completa el día */}
                    {showDayCompleteMessage && (
                      <div className="w-full py-4 mt-4 bg-success/90 text-white rounded-lg shadow-lg font-semibold flex flex-col items-center justify-center gap-2 text-lg animate-pulse">
                        <Check size={28} className="mb-1" />
                        ¡Día completo!
                        <span className="text-base font-normal mt-1">Vuelve mañana para seguir con tu plan</span>
                      </div>
                    )}
                    
                    {/* Botón para marcar día como completo */}
                    <button 
                      onClick={handleMarkDayComplete} 
                      disabled={!areAllMealsCompleted() || showDayCompleteMessage} 
                      className={`w-full py-3 mt-4 rounded-lg shadow-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                        areAllMealsCompleted() && !showDayCompleteMessage
                          ? 'bg-success hover:bg-success-dark text-white' : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                      } ${dayCompleteAnimation ? 'animate-bounce-scale' : ''}`}
                    >
                      <Check size={20} />
                      {areAllMealsCompleted() 
                        ? t('markNutritionDayComplete') 
                        : 'Completa todas las comidas para marcar el día'
                      }
                    </button>
                  </div>
                )}
            </div>
        )}

        {planPersonalizado && !planError && (
          <div className="max-w-5xl mx-auto my-12">
            <h2 className="text-2xl font-bold mb-6 text-primary text-center">{t('yourPersonalizedNutritionPlan')}</h2>
            <NutritionPlanViewer planJson={planPersonalizado} />
          </div>
        )}
        {planError && (
          <div className="max-w-2xl mx-auto my-12 p-6 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-xl text-center font-semibold">
            {planError}
          </div>
        )}
        {isLoading && !planPersonalizado && !planError && (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size={48} />
            <p className="mt-4 text-lg font-semibold">{t('generatingNutritionPlan')}...</p>
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

// --- Meal Card Component ---
interface MealCardProps {
    meal: Meal;
    mealType: keyof Omit<DailyMealPlan, 'day'>;
    onFindAnother: (mealType: keyof Omit<DailyMealPlan, 'day'>) => void;
    onMarkComplete: (mealType: keyof Omit<DailyMealPlan, 'day'>) => void;
    onUnmarkComplete: (mealType: keyof Omit<DailyMealPlan, 'day'>) => void;
    isCompleted: boolean;
    isDayCompleted: boolean;
    isLoading: boolean;
}
const MealCard: React.FC<MealCardProps> = ({ 
    meal, 
    mealType, 
    onFindAnother, 
    onMarkComplete, 
    onUnmarkComplete,
    isCompleted,
    isDayCompleted,
    isLoading 
}) => {
    const { t, currentLanguage } = useLocalization();
    const mealTitles = { breakfast: 'breakfast', lunch: 'lunch', dinner: 'dinner', snack1: 'midMorningSnack', snack2: 'midAfternoonSnack' };

    return (
        <div className={`bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden transition-all duration-300 ${isLoading ? 'opacity-60' : ''} ${isCompleted ? 'ring-2 ring-success' : ''}`}>
            {isLoading && <div className="absolute inset-0 bg-slate-500/30 flex items-center justify-center z-10"><LoadingSpinner /></div>}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div>
                        <h3 className="text-lg font-bold text-primary dark:text-primary-light">{t(mealTitles[mealType] as any)}</h3>
                        <h4 className="font-semibold text-neutral-dark dark:text-white">{getTranslatedMealName(meal.name, currentLanguage)}</h4>
                        <p className="text-xs text-neutral-dark/70 dark:text-neutral-light/70">{meal.calories}</p>
                    </div>
                    {isCompleted && (
                        <div className="flex items-center justify-center w-6 h-6 bg-success text-white rounded-full">
                            <Check size={14} />
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    {!isDayCompleted && (
                        <button 
                            onClick={() => isCompleted ? onUnmarkComplete(mealType) : onMarkComplete(mealType)} 
                            disabled={isLoading}
                            className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors disabled:opacity-50 ${
                                isCompleted 
                                    ? 'bg-warning text-white hover:bg-warning-dark' 
                                    : 'bg-success text-white hover:bg-success-dark'
                            }`}
                        >
                            {isCompleted ? (
                                <>
                                    <RefreshCw size={12} /> Desmarcar
                                </>
                            ) : (
                                <>
                                    <Check size={12} /> Completar
                                </>
                            )}
                        </button>
                    )}
                    <button 
                        onClick={() => onFindAnother(mealType)} 
                        disabled={isLoading || isDayCompleted || isCompleted} 
                        className={`text-xs px-3 py-1.5 border rounded-full flex items-center gap-1 transition-colors disabled:opacity-50 ${
                            isCompleted 
                                ? 'border-slate-300 text-slate-400 cursor-not-allowed' 
                                : 'border-secondary text-secondary hover:bg-secondary/10'
                        }`}
                    >
                        <RefreshCw size={12} /> {t('findAnotherMeal')}
                    </button>
                </div>
            </div>
            <p className="text-sm text-neutral-dark dark:text-neutral-light mb-3">{getTranslatedMealDescription(meal.description, currentLanguage)}</p>
            <div>
                <h5 className="text-sm font-semibold text-neutral-dark dark:text-neutral-light mb-1">{t('ingredients')}:</h5>
                <ul className="list-disc list-inside text-xs text-neutral-dark/80 dark:text-neutral-light/80 space-y-0.5">
                    {(meal?.ingredients || []).map((ing, i) => <li key={i}>{getTranslatedIngredient(ing, currentLanguage)}</li>)}
                </ul>
            </div>
        </div>
    )
}


export default NutritionChallengePage;