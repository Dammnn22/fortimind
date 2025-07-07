import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { 
  UserExerciseChallenge, 
  UserNutritionChallenge, 
  WorkoutRoutine, 
  DailyMealPlan
} from '../types';

// Collection names
const USERS_COLLECTION = 'users';
const EXERCISE_CHALLENGES_COLLECTION = 'exerciseChallenges';
const NUTRITION_CHALLENGES_COLLECTION = 'nutritionChallenges';
const WORKOUT_ROUTINES_COLLECTION = 'workoutRoutines';
const MEAL_PLANS_COLLECTION = 'mealPlans';
const FITNESS_CHALLENGES_COLLECTION = 'fitness_challenges';

// Exercise Challenge Data Management
export interface ExerciseChallengeData extends UserExerciseChallenge {
  userId: string;
  lastUpdated: Timestamp;
  totalXP?: number;
  streakDays?: number;
  currentRoutine?: WorkoutRoutine;
}

export const saveExerciseChallengeData = async (
  userId: string, 
  challengeData: UserExerciseChallenge
): Promise<void> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId, EXERCISE_CHALLENGES_COLLECTION, 'current');
    const dataToSave: ExerciseChallengeData = {
      ...challengeData,
      userId,
      lastUpdated: serverTimestamp() as Timestamp,
    };
    
    await setDoc(docRef, dataToSave);
    console.log('Exercise challenge data saved successfully');
  } catch (error) {
    console.error('Error saving exercise challenge data:', error);
    throw new Error('Failed to save exercise challenge data');
  }
};

export const loadExerciseChallengeData = async (
  userId: string
): Promise<UserExerciseChallenge | null> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId, EXERCISE_CHALLENGES_COLLECTION, 'current');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as ExerciseChallengeData;
      // Remove Firestore-specific fields before returning
      const { userId: _, lastUpdated: __, ...challengeData } = data;
      return challengeData as UserExerciseChallenge;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading exercise challenge data:', error);
    return null;
  }
};

export const saveWorkoutRoutine = async (
  userId: string,
  day: number,
  routine: WorkoutRoutine
): Promise<void> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId, WORKOUT_ROUTINES_COLLECTION, `day_${day}`);
    await setDoc(docRef, {
      ...routine,
      userId,
      savedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving workout routine:', error);
    throw new Error('Failed to save workout routine');
  }
};

export const loadWorkoutRoutine = async (
  userId: string,
  day: number
): Promise<WorkoutRoutine | null> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId, WORKOUT_ROUTINES_COLLECTION, `day_${day}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const { userId: _, savedAt: __, ...routine } = data;
      return routine as WorkoutRoutine;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading workout routine:', error);
    return null;
  }
};

// Nutrition Challenge Data Management
export interface NutritionChallengeData extends UserNutritionChallenge {
  userId: string;
  lastUpdated: Timestamp;
  totalXP?: number;
  streakDays?: number;
}

export const saveNutritionChallengeData = async (
  userId: string, 
  challengeData: UserNutritionChallenge
): Promise<void> => {
  try {
    console.log('Attempting to save nutrition challenge data for user:', userId);
    console.log('Data to save:', challengeData);
    
    const docRef = doc(db, USERS_COLLECTION, userId, NUTRITION_CHALLENGES_COLLECTION, 'current');
    const dataToSave: NutritionChallengeData = {
      ...challengeData,
      userId,
      lastUpdated: serverTimestamp() as Timestamp,
    };
    
    console.log('Document reference:', docRef.path);
    console.log('Data to save with metadata:', dataToSave);
    
    // Add retry logic for network issues
    let retries = 3;
    while (retries > 0) {
      try {
        await setDoc(docRef, dataToSave);
        console.log('Nutrition challenge data saved successfully');
        return;
      } catch (networkError: any) {
        retries--;
        if (networkError.code === 'unavailable' && retries > 0) {
          console.log(`Network error, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          continue;
        }
        throw networkError;
      }
    }
  } catch (error) {
    console.error('Error saving nutrition challenge data:', error);
    console.error('Error details:', {
      code: (error as any)?.code,
      message: (error as any)?.message,
      userId,
      collectionPath: `${USERS_COLLECTION}/${userId}/${NUTRITION_CHALLENGES_COLLECTION}/current`
    });
    
    // Don't throw error for network issues, just log them
    if ((error as any)?.code === 'unavailable' || (error as any)?.code === 'deadline-exceeded') {
      console.log('Network error, data will be saved when connection is restored');
      return;
    }
    
    throw new Error('Failed to save nutrition challenge data');
  }
};

export const loadNutritionChallengeData = async (
  userId: string
): Promise<UserNutritionChallenge | null> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId, NUTRITION_CHALLENGES_COLLECTION, 'current');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as NutritionChallengeData;
      // Remove Firestore-specific fields before returning
      const { userId: _, lastUpdated: __, ...challengeData } = data;
      return challengeData as UserNutritionChallenge;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading nutrition challenge data:', error);
    return null;
  }
};

export const saveMealPlan = async (
  userId: string,
  day: number,
  mealPlan: DailyMealPlan
): Promise<void> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId, MEAL_PLANS_COLLECTION, `day_${day}`);
    await setDoc(docRef, {
      ...mealPlan,
      userId,
      savedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving meal plan:', error);
    throw new Error('Failed to save meal plan');
  }
};

export const loadMealPlan = async (
  userId: string,
  day: number
): Promise<DailyMealPlan | null> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId, MEAL_PLANS_COLLECTION, `day_${day}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const { userId: _, savedAt: __, ...mealPlan } = data;
      return mealPlan as DailyMealPlan;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading meal plan:', error);
    return null;
  }
};

// Analytics and Statistics
export interface ChallengeStatistics {
  totalDaysCompleted: number;
  currentStreak: number;
  longestStreak: number;
  averageCompletionRate: number;
  lastCompletedDate?: string;
}

export const getExerciseChallengeStatistics = async (
  userId: string
): Promise<ChallengeStatistics> => {
  try {
    const challengeData = await loadExerciseChallengeData(userId);
    if (!challengeData) {
      return {
        totalDaysCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageCompletionRate: 0,
      };
    }

    const completedDays = challengeData.completedDays || [];
    const totalDaysCompleted = completedDays.length;
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    const sortedDays = completedDays.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (const day of sortedDays) {
      const dayDate = new Date(day.date);
      const daysDiff = Math.floor((today.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= currentStreak + 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak (simplified)
    const longestStreak = Math.max(currentStreak, totalDaysCompleted);
    
    // Calculate average completion rate
    const startDate = challengeData.startDate ? new Date(challengeData.startDate) : new Date();
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const averageCompletionRate = daysSinceStart > 0 ? (totalDaysCompleted / daysSinceStart) * 100 : 0;

    return {
      totalDaysCompleted,
      currentStreak,
      longestStreak,
      averageCompletionRate: Math.min(averageCompletionRate, 100),
      lastCompletedDate: sortedDays[0]?.date,
    };
  } catch (error) {
    console.error('Error getting exercise challenge statistics:', error);
    return {
      totalDaysCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageCompletionRate: 0,
    };
  }
};

export const getNutritionChallengeStatistics = async (
  userId: string
): Promise<ChallengeStatistics> => {
  try {
    const challengeData = await loadNutritionChallengeData(userId);
    if (!challengeData) {
      return {
        totalDaysCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageCompletionRate: 0,
      };
    }

    const completedDays = challengeData.completedDays || [];
    const totalDaysCompleted = completedDays.length;
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    const sortedDays = completedDays.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (const day of sortedDays) {
      const dayDate = new Date(day.date);
      const daysDiff = Math.floor((today.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= currentStreak + 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak (simplified)
    const longestStreak = Math.max(currentStreak, totalDaysCompleted);
    
    // Calculate average completion rate
    const startDate = challengeData.startDate ? new Date(challengeData.startDate) : new Date();
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const averageCompletionRate = daysSinceStart > 0 ? (totalDaysCompleted / daysSinceStart) * 100 : 0;

    return {
      totalDaysCompleted,
      currentStreak,
      longestStreak,
      averageCompletionRate: Math.min(averageCompletionRate, 100),
      lastCompletedDate: sortedDays[0]?.date,
    };
  } catch (error) {
    console.error('Error getting nutrition challenge statistics:', error);
    return {
      totalDaysCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageCompletionRate: 0,
    };
  }
};

// Challenge Reset Functions
export const resetExerciseChallenge = async (userId: string): Promise<void> => {
  try {
    const defaultState: UserExerciseChallenge = {
      status: 'inactive',
      level: 'beginner',
      currentDay: 1,
      completedDays: [],
    };
    
    await saveExerciseChallengeData(userId, defaultState);
    console.log('Exercise challenge reset successfully');
  } catch (error) {
    console.error('Error resetting exercise challenge:', error);
    throw new Error('Failed to reset exercise challenge');
  }
};

export const resetNutritionChallenge = async (userId: string): Promise<void> => {
  try {
    const defaultState: UserNutritionChallenge = {
      status: 'inactive',
      goal: 'maintainWeight',
      dietaryStyle: 'omnivore',
      allergies: '',
      preferences: '',
      currentDay: 1,
      completedDays: [],
    };
    
    await saveNutritionChallengeData(userId, defaultState);
    console.log('Nutrition challenge reset successfully');
  } catch (error) {
    console.error('Error resetting nutrition challenge:', error);
    throw new Error('Failed to reset nutrition challenge');
  }
};

// Fitness Challenges Data Management (New Structure)
export interface FitnessChallengeData extends UserExerciseChallenge {
  userId: string;
  challengeId: string;
  lastUpdated: Timestamp;
  totalXP?: number;
  streakDays?: number;
  currentRoutine?: WorkoutRoutine;
}

export const saveFitnessChallengeData = async (
  userId: string,
  challengeId: string,
  challengeData: UserExerciseChallenge
): Promise<void> => {
  try {
    // Try to save to the new fitness_challenges structure first
    const docRef = doc(db, USERS_COLLECTION, userId, FITNESS_CHALLENGES_COLLECTION, challengeId);
    const dataToSave: FitnessChallengeData = {
      ...challengeData,
      userId,
      challengeId,
      lastUpdated: serverTimestamp() as Timestamp,
    };
    
    await setDoc(docRef, dataToSave);
    console.log('Fitness challenge data saved successfully to new structure');
  } catch (error) {
    console.warn('Error saving to new structure, trying fallback:', error);
    
    try {
      // Fallback to the old exerciseChallenges structure
      const fallbackDocRef = doc(db, USERS_COLLECTION, userId, EXERCISE_CHALLENGES_COLLECTION, challengeId);
      const dataToSave: FitnessChallengeData = {
        ...challengeData,
        userId,
        challengeId,
        lastUpdated: serverTimestamp() as Timestamp,
      };
      
      await setDoc(fallbackDocRef, dataToSave);
      console.log('Fitness challenge data saved successfully to fallback structure');
    } catch (fallbackError) {
      console.error('Error saving fitness challenge data (both attempts failed):', fallbackError);
      throw new Error('Failed to save fitness challenge data');
    }
  }
};

export const loadFitnessChallengeData = async (
  userId: string,
  challengeId: string
): Promise<UserExerciseChallenge | null> => {
  try {
    // Try to load from the new fitness_challenges structure first
    const docRef = doc(db, USERS_COLLECTION, userId, FITNESS_CHALLENGES_COLLECTION, challengeId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as FitnessChallengeData;
      // Remove Firestore-specific fields before returning
      const { userId: _, challengeId: __, lastUpdated: ___, ...challengeData } = data;
      console.log('Loaded fitness challenge data from new structure');
      return challengeData as UserExerciseChallenge;
    }
    
    // Fallback to the old exerciseChallenges structure
    const fallbackDocRef = doc(db, USERS_COLLECTION, userId, EXERCISE_CHALLENGES_COLLECTION, challengeId);
    const fallbackDocSnap = await getDoc(fallbackDocRef);
    
    if (fallbackDocSnap.exists()) {
      const data = fallbackDocSnap.data() as FitnessChallengeData;
      // Remove Firestore-specific fields before returning
      const { userId: _, challengeId: __, lastUpdated: ___, ...challengeData } = data;
      console.log('Loaded fitness challenge data from fallback structure');
      return challengeData as UserExerciseChallenge;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading fitness challenge data:', error);
    return null;
  }
};

export const saveFitnessChallengeDay = async (
  userId: string,
  challengeId: string,
  day: number,
  routine: WorkoutRoutine
): Promise<void> => {
  try {
    // Try to save to the new fitness_challenges structure first
    const docRef = doc(db, USERS_COLLECTION, userId, FITNESS_CHALLENGES_COLLECTION, challengeId, 'days', `day_${day}`);
    await setDoc(docRef, {
      ...routine,
      userId,
      challengeId,
      day,
      savedAt: serverTimestamp(),
    });
    console.log(`Fitness challenge day ${day} saved successfully to new structure`);
  } catch (error) {
    console.warn('Error saving to new structure, trying fallback:', error);
    
    try {
      // Fallback to the old exerciseChallenges structure
      const fallbackDocRef = doc(db, USERS_COLLECTION, userId, EXERCISE_CHALLENGES_COLLECTION, challengeId, 'days', `day_${day}`);
      await setDoc(fallbackDocRef, {
        ...routine,
        userId,
        challengeId,
        day,
        savedAt: serverTimestamp(),
      });
      console.log(`Fitness challenge day ${day} saved successfully to fallback structure`);
    } catch (fallbackError) {
      console.error('Error saving fitness challenge day (both attempts failed):', fallbackError);
      // Don't throw here - we want the user experience to continue even if saving fails
      console.warn('Continuing without saving - user can retry later');
    }
  }
};

export const loadFitnessChallengeDay = async (
  userId: string,
  challengeId: string,
  day: number
): Promise<WorkoutRoutine | null> => {
  try {
    // Try to load from the new fitness_challenges structure first
    const docRef = doc(db, USERS_COLLECTION, userId, FITNESS_CHALLENGES_COLLECTION, challengeId, 'days', `day_${day}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const { userId: _, challengeId: __, day: ___, savedAt: ____, ...routine } = data;
      console.log(`Loaded fitness challenge day ${day} from new structure`);
      return routine as WorkoutRoutine;
    }
    
    // Fallback to the old exerciseChallenges structure
    const fallbackDocRef = doc(db, USERS_COLLECTION, userId, EXERCISE_CHALLENGES_COLLECTION, challengeId, 'days', `day_${day}`);
    const fallbackDocSnap = await getDoc(fallbackDocRef);
    
    if (fallbackDocSnap.exists()) {
      const data = fallbackDocSnap.data();
      const { userId: _, challengeId: __, day: ___, savedAt: ____, ...routine } = data;
      console.log(`Loaded fitness challenge day ${day} from fallback structure`);
      return routine as WorkoutRoutine;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading fitness challenge day:', error);
    return null;
  }
};

export const getAllFitnessChallengeDays = async (
  userId: string,
  challengeId: string
): Promise<number[]> => {
  try {
    // Try to get days from the new fitness_challenges structure first
    const daysRef = collection(db, USERS_COLLECTION, userId, FITNESS_CHALLENGES_COLLECTION, challengeId, 'days');
    const querySnapshot = await getDocs(daysRef);
    
    const days: number[] = [];
    querySnapshot.forEach((doc) => {
      const dayNumber = parseInt(doc.id.replace('day_', ''));
      if (!isNaN(dayNumber)) {
        days.push(dayNumber);
      }
    });
    
    // If we found days in the new structure, return them
    if (days.length > 0) {
      console.log(`Found ${days.length} days in new structure`);
      return days.sort((a, b) => a - b);
    }
    
    // Fallback to the old exerciseChallenges structure
    const fallbackDaysRef = collection(db, USERS_COLLECTION, userId, EXERCISE_CHALLENGES_COLLECTION, challengeId, 'days');
    const fallbackQuerySnapshot = await getDocs(fallbackDaysRef);
    
    const fallbackDays: number[] = [];
    fallbackQuerySnapshot.forEach((doc) => {
      const dayNumber = parseInt(doc.id.replace('day_', ''));
      if (!isNaN(dayNumber)) {
        fallbackDays.push(dayNumber);
      }
    });
    
    console.log(`Found ${fallbackDays.length} days in fallback structure`);
    return fallbackDays.sort((a, b) => a - b);
  } catch (error) {
    console.error('Error getting fitness challenge days:', error);
    return [];
  }
};

export const resetFitnessChallenge = async (userId: string, challengeId: string): Promise<void> => {
  try {
    const defaultState: UserExerciseChallenge = {
      status: 'inactive',
      level: 'beginner',
      currentDay: 1,
      completedDays: [],
    };
    
    await saveFitnessChallengeData(userId, challengeId, defaultState);
    console.log('Fitness challenge reset successfully');
  } catch (error) {
    console.error('Error resetting fitness challenge:', error);
    throw new Error('Failed to reset fitness challenge');
  }
}; 