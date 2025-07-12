import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  serverTimestamp, 
  increment,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../src/firebase';

// Interfaces para tipos de datos
export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: any;
  lastLoginAt: any;
  role: 'user' | 'admin' | 'specialist';
  isActive: boolean;
  preferences: {
    theme: 'light' | 'dark';
    language: 'es' | 'en';
    notifications: boolean;
  };
  stats: {
    totalXP: number;
    level: number;
    streaks: number;
    completedChallenges: number;
    totalSessions: number;
    weeklyGoals: number;
    monthlyGoals: number;
  };
  subscription?: {
    type: 'free' | 'premium';
    expiresAt?: any;
    paypalSubscriptionId?: string;
  };
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: any;
  endDate: any;
  isCompleted: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  bestStreak: number;
  completedDates: string[];
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood: number; // 1-10 scale
  tags: string[];
  aiAnalysis?: {
    sentiment: string;
    keyTopics: string[];
    suggestions: string[];
  };
  createdAt: any;
  updatedAt: any;
}

// Servicios de Usuario
export const createUserProfile = async (userData: Partial<UserData>): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userData.uid!);
    await setDoc(userDocRef, {
      ...userData,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      role: 'user',
      isActive: true,
      preferences: {
        theme: 'light',
        language: 'es',
        notifications: true,
        ...userData.preferences
      },
      stats: {
        totalXP: 0,
        level: 1,
        streaks: 0,
        completedChallenges: 0,
        totalSessions: 0,
        weeklyGoals: 0,
        monthlyGoals: 0,
        ...userData.stats
      },
      subscription: {
        type: 'free',
        ...userData.subscription
      }
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserData | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserData>): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const addUserXP = async (userId: string, xpPoints: number): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      'stats.totalXP': increment(xpPoints),
      'stats.level': increment(Math.floor(xpPoints / 100)),
      lastActivityAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding XP:', error);
    throw error;
  }
};

// Servicios de Objetivos
export const createGoal = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const goalDocRef = await addDoc(collection(db, 'goals'), {
      ...goalData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return goalDocRef.id;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

export const getUserGoals = async (userId: string): Promise<Goal[]> => {
  try {
    const goalsQuery = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const goalsSnapshot = await getDocs(goalsQuery);
    return goalsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Goal[];
  } catch (error) {
    console.error('Error getting user goals:', error);
    throw error;
  }
};

export const updateGoal = async (goalId: string, updates: Partial<Goal>): Promise<void> => {
  try {
    const goalDocRef = doc(db, 'goals', goalId);
    await updateDoc(goalDocRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

export const deleteGoal = async (goalId: string): Promise<void> => {
  try {
    const goalDocRef = doc(db, 'goals', goalId);
    await deleteDoc(goalDocRef);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

// Servicios de Hábitos
export const createHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const habitDocRef = await addDoc(collection(db, 'habits'), {
      ...habitData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return habitDocRef.id;
  } catch (error) {
    console.error('Error creating habit:', error);
    throw error;
  }
};

export const getUserHabits = async (userId: string): Promise<Habit[]> => {
  try {
    const habitsQuery = query(
      collection(db, 'habits'),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const habitsSnapshot = await getDocs(habitsQuery);
    return habitsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Habit[];
  } catch (error) {
    console.error('Error getting user habits:', error);
    throw error;
  }
};

export const markHabitComplete = async (habitId: string, date: string): Promise<void> => {
  try {
    const habitDocRef = doc(db, 'habits', habitId);
    await updateDoc(habitDocRef, {
      completedDates: arrayUnion(date),
      streak: increment(1),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking habit complete:', error);
    throw error;
  }
};

export const unmarkHabitComplete = async (habitId: string, date: string): Promise<void> => {
  try {
    const habitDocRef = doc(db, 'habits', habitId);
    await updateDoc(habitDocRef, {
      completedDates: arrayRemove(date),
      streak: increment(-1),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error unmarking habit complete:', error);
    throw error;
  }
};

// Servicios de Diario
export const createJournalEntry = async (entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const entryDocRef = await addDoc(collection(db, 'journal'), {
      ...entryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return entryDocRef.id;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }
};

export const getUserJournalEntries = async (userId: string, limitCount: number = 10): Promise<JournalEntry[]> => {
  try {
    const entriesQuery = query(
      collection(db, 'journal'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const entriesSnapshot = await getDocs(entriesQuery);
    return entriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as JournalEntry[];
  } catch (error) {
    console.error('Error getting journal entries:', error);
    throw error;
  }
};

export const updateJournalEntry = async (entryId: string, updates: Partial<JournalEntry>): Promise<void> => {
  try {
    const entryDocRef = doc(db, 'journal', entryId);
    await updateDoc(entryDocRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
};

export const deleteJournalEntry = async (entryId: string): Promise<void> => {
  try {
    const entryDocRef = doc(db, 'journal', entryId);
    await deleteDoc(entryDocRef);
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

// Servicios de Análisis y Estadísticas
export const getUserStats = async (userId: string): Promise<any> => {
  try {
    const userDoc = await getUserProfile(userId);
    if (!userDoc) return null;

    const [goals, habits, journalEntries] = await Promise.all([
      getUserGoals(userId),
      getUserHabits(userId),
      getUserJournalEntries(userId, 30)
    ]);

    const completedGoals = goals.filter(g => g.isCompleted).length;
    const activeHabits = habits.filter(h => h.isActive).length;
    const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
    const avgMood = journalEntries.reduce((sum, e) => sum + e.mood, 0) / journalEntries.length || 0;

    return {
      profile: userDoc,
      goals: {
        total: goals.length,
        completed: completedGoals,
        active: goals.length - completedGoals
      },
      habits: {
        total: habits.length,
        active: activeHabits,
        totalStreak
      },
      journal: {
        totalEntries: journalEntries.length,
        avgMood: Math.round(avgMood * 10) / 10
      }
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

// Servicios de Gamificación
export const unlockAchievement = async (userId: string, achievementId: string): Promise<void> => {
  try {
    await addDoc(collection(db, 'achievements'), {
      userId,
      achievementId,
      unlockedAt: serverTimestamp()
    });
    
    // Añadir XP por el logro
    await addUserXP(userId, 50);
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    throw error;
  }
};

export const getUserAchievements = async (userId: string): Promise<any[]> => {
  try {
    const achievementsQuery = query(
      collection(db, 'achievements'),
      where('userId', '==', userId),
      orderBy('unlockedAt', 'desc')
    );
    const achievementsSnapshot = await getDocs(achievementsQuery);
    return achievementsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user achievements:', error);
    throw error;
  }
};
