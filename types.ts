
import type { Timestamp as FirebaseTimestamp, FieldValue } from 'firebase/firestore';
import { TranslationKey } from './translations'; // Ensure TranslationKey is imported

export interface Streak {
  id: string;
  name: string;
  startDate: string; // ISO string
  lastRelapseDate?: string; // ISO string
  targetDays?: number;
}

export interface Goal {
  id: string;
  description: string;
  targetDate?: string; // ISO string
  isCompleted: boolean;
  createdAt: string; // ISO string
}

export interface JournalEntry {
  id: string;
  date: string; // ISO string
  content: string;
  mood?: Mood;
  aiAnalysis?: string; // Store AI analysis result
}

export enum Mood {
  Excellent = "Excellent",
  Good = "Good",
  Okay = "Okay",
  Bad = "Bad",
  Awful = "Awful",
}

export interface EducationalResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'audio';
  summary: string;
  content?: string; // For articles
  url?: string | Partial<Record<Language, string>>; // For videos/external audios, can be language specific
  category: string;
  videoCredits?: Partial<Record<Language, { nameKey: TranslationKey; url: string }>>; // For video credits
}

export interface SupportContact {
  id: string;
  name: string;
  description: string;
  phone?: string;
  website?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  language: Language;
  discreetMode: boolean;
}

export interface Badge {
  id: string; // Corresponds to BadgeDefinition.id
  name: string; // Translated name
  description: string; // Translated description
  icon: string; // Icon name or SVG path from BadgeDefinition
  achievedDate?: string; // ISO string
}

export interface BadgeDefinition {
  id:string;
  nameKey: TranslationKey; 
  descriptionKey: TranslationKey; 
  icon: string; // Lucide icon name string
  requiredDays?: number; // For streaks
  requiredGoals?: number; // For goals
  requiredEntries?: number; // For journal entries
}

export enum AppTheme {
    LIGHT = 'light',
    DARK = 'dark',
}

export interface Habit {
  id: string;
  name: string;
  frequency: 'daily'; 
  lastCompleted?: string; // ISO date string
  currentStreak: number;
  createdAt: string; // ISO string
  notificationTime?: string; // Optional: "HH:mm" format
}

import { translations } from './translations';
export type Language = keyof typeof translations;
export type { TranslationKey } from './translations'; // Re-export TranslationKey

export type UserXP = number;

export interface ChallengeDefinition {
  id: string;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  durationDays: number;
  xpReward: number;
  badgeToAwardId?: string; 
  rewardDescriptionKey: TranslationKey;
}

export interface UserChallenge {
  challengeId: string; 
  status: 'locked' | 'active' | 'completed';
  startDate?: string; 
  progress: number; 
  lastDayMarkedDate?: string; 
}


export enum AIPersona {
  AI_MENTOR_DEFAULT = "AI_MENTOR_DEFAULT", 
  JOURNAL_ANALYST = "JOURNAL_ANALYST",
  EMERGENCY_CHAT = "EMERGENCY_CHAT",
  FUTURE_SELF_MENTOR = "FUTURE_SELF_MENTOR",
  PERSONALIZED_RECOMMENDER = "PERSONALIZED_RECOMMENDER",
  CONTENT_MODERATOR = "CONTENT_MODERATOR",
  WORKOUT_GENERATOR = "WORKOUT_GENERATOR",
  NUTRITION_PLAN_GENERATOR = "NUTRITION_PLAN_GENERATOR",
}

export interface AiChatMessage { // This remains as it's for the AI Chat Modal
  id: string;
  text: string;
  sender: 'user' | 'ai';
  persona?: AIPersona; 
  timestamp: string;
}

// Notification System Types
export enum AppNotificationType {
  HABIT_SCHEDULED = 'habit_scheduled',
  CHALLENGE_DAY_MARKED = 'challenge_day_marked',
  CHALLENGE_COMPLETED = 'challenge_completed',
  GOAL_COMPLETED = 'goal_completed',
  GENERAL = 'general',
  PUSH_NOTIFICATION = 'push_notification',
  // Future types: AI_RESPONSE, STREAK_MILESTONE, etc.
}

export interface AppNotification {
  id: string;
  title?: string; // For raw text like push notifications
  message?: string; // For raw text
  titleKey?: TranslationKey; // For translated text
  messageKey?: TranslationKey; // For translated text
  messageArgs?: (string | number)[];
  type: AppNotificationType;
  timestamp: string; // ISO string
  isRead: boolean;
  linkTo?: string; // e.g., '/habits'
  icon?: string; // Lucide icon name string e.g., 'ClockIcon', 'AwardIcon', 'TargetIcon'
}

// Exercise Challenge Types
export type ExerciseLevel = 'beginner' | 'intermediate' | 'professional';
export type WorkoutLocation = 'home' | 'gym';

export interface Exercise {
  name: string;
  reps: string;
  sets: number;
  description: string;
}

export interface WorkoutRoutine {
  id: string;
  day: number;
  level: ExerciseLevel;
  location: WorkoutLocation;
  muscleGroup: string;
  estimatedTime: string;
  exercises: Exercise[];
}

export interface UserExerciseChallenge {
  status: 'inactive' | 'active' | 'completed';
  level: ExerciseLevel;
  currentDay: number;
  startDate?: string;
  completedDays: {
    day: number;
    date: string;
    routineId: string;
    difficulty?: number;
    location: WorkoutLocation;
  }[];
  lastCompletedDayDate?: string;
  nextDayUnlockDate?: string;
  currentDayCompleted?: boolean;
  missedDays?: number[];
}

// Nutrition Challenge Types
export type NutritionGoal = 'loseWeight' | 'maintainWeight' | 'gainMuscle';
export type DietaryStyle = 'omnivore' | 'vegetarian' | 'vegan';

export interface Meal {
  name: string;
  description: string;
  ingredients: string[];
  calories: string; // e.g., "~300-400 kcal"
}

export interface DailyMealPlan {
  day: number;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack1?: Meal | null;
  snack2?: Meal | null;
}

export interface UserNutritionChallenge {
  status: 'inactive' | 'active' | 'completed';
  goal: NutritionGoal;
  dietaryStyle: DietaryStyle;
  allergies: string;
  preferences: string;
  currentDay: number;
  startDate?: string;
  currentPlan?: DailyMealPlan | null;
  completedDays: {
    day: number;
    date: string;
  }[];
  lastCompletedDayDate?: string; // Fecha del último día completado (ISO string)
  nextDayUnlockDate?: string; // Fecha cuando se desbloquea el siguiente día (medianoche)
  currentDayCompletedMeals?: {
    breakfast?: boolean;
    lunch?: boolean;
    dinner?: boolean;
    snack1?: boolean;
    snack2?: boolean;
  };
  missedDays?: number[]; // Días que no se completaron
  personalizationData?: {
    objetivo_nutricional: string;
    tipo_dieta: string;
    habitos_alimenticios: string;
    nivel_actividad: string;
    nivel_actividad_detalle: string;
    biometricos: {
      edad: string;
      sexo: string;
      altura: string;
      peso: string;
      grasa_corporal?: string;
    };
    condiciones_medicas: string;
    alergias_intolerancias: string;
    restricciones_culturales: string;
  };
}


// Removed CommunityMessage, ChatMessage (for channels), and Channel interfaces
