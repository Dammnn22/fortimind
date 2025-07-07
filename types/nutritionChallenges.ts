// Types for Nutrition Challenge Programs structure in Firestore
import { Timestamp } from 'firebase/firestore';

export interface NutritionChallenge {
  id: string;
  userId: string;
  name: string;
  description: string;
  totalDays: number;
  currentDay: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  challengeType: 'weight_loss' | 'muscle_gain' | 'detox' | 'healthy_habits' | 'balanced_nutrition';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // User personalization data
  userProfile: {
    age: number;
    weight: number;
    height: number;
    activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
    goal: 'lose_weight' | 'maintain_weight' | 'gain_muscle' | 'improve_health';
    dietaryStyle: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'mediterranean';
    allergies: string[];
    foodDislikes: string[];
    cookingSkill: 'beginner' | 'intermediate' | 'advanced';
    mealPrepTime: number; // minutes available for meal prep
    budget: 'low' | 'medium' | 'high';
  };
  
  // Challenge settings
  settings: {
    mealsPerDay: number; // 3-6 meals
    snacksIncluded: boolean;
    mealPrepDay: number; // day of week (0=Sunday)
    waterGoal: number; // ml per day
    supplementsIncluded: boolean;
    trackMacros: boolean;
    allowCheatMeals: boolean;
    groceryListGeneration: boolean;
  };
  
  // Progress tracking
  progress: {
    completedDays: number;
    totalMealsCompleted: number;
    waterIntakeAverage: number; // ml
    weightProgress: {
      startWeight: number | null;
      currentWeight: number | null;
      targetWeight: number | null;
      weightEntries: WeightEntry[];
    };
    averageRating: number; // 1-5 scale from user feedback
    streakDays: number;
    lastCompletedDate: Timestamp | null;
  };
  
  // AI memory for adaptive nutrition
  aiMemory: {
    preferredMeals: string[];
    dislikedMeals: string[];
    successfulRecipes: string[];
    energyLevelPattern: 'morning_high' | 'afternoon_high' | 'evening_high' | 'consistent';
    adherencePattern: 'excellent' | 'good' | 'needs_improvement';
    adaptationHistory: NutritionAdaptationEvent[];
    macroPreferences: {
      protein: 'low' | 'moderate' | 'high';
      carbs: 'low' | 'moderate' | 'high';
      fats: 'low' | 'moderate' | 'high';
    };
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WeightEntry {
  date: Timestamp;
  weight: number;
  notes?: string;
}

export interface NutritionAdaptationEvent {
  date: Timestamp;
  reason: 'poor_adherence' | 'energy_levels' | 'weight_plateau' | 'user_feedback' | 'allergic_reaction' | 'preference_change';
  changes: string[];
  previousPlan: string;
  newPlan: string;
}

export interface NutritionChallengeDay {
  id: string;
  challengeId: string;
  dayNumber: number;
  date: Timestamp | null; // when this day was scheduled/completed
  
  // Day configuration
  dayType: 'regular' | 'prep_day' | 'cheat_day' | 'detox_day' | 'assessment';
  theme: string; // "High Protein Day", "Mediterranean Monday", etc.
  estimatedPrepTime: number; // minutes for meal prep
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // Daily nutrition plan
  nutritionPlan: {
    title: string;
    description: string;
    focusAreas: string[]; // ["protein intake", "hydration", "fiber"]
    dailyCalories: number;
    macros: {
      protein: number; // grams
      carbs: number; // grams
      fats: number; // grams
      fiber: number; // grams
    };
    waterGoal: number; // ml
  };
  
  // Meals for the day
  meals: NutritionMeal[];
  
  // Completion tracking
  completion: {
    status: 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'partially_completed';
    startedAt: Timestamp | null;
    completedAt: Timestamp | null;
    waterIntake: number; // ml consumed
    weightRecorded: number | null;
    userRating: number | null; // 1-5 satisfaction rating
    userFeedback: string | null;
    completedMeals: number;
    totalMeals: number;
    energyLevel: number | null; // 1-10 energy throughout day
    hungerLevel: number | null; // 1-10 average hunger
    adherenceScore: number; // 0-100 how well they followed the plan
  };
  
  // Performance data for AI adaptation
  performance: {
    mealSatisfaction: { [mealId: string]: number }; // 1-10 rating per meal
    cravingsLevel: number | null; // 1-10
    digestiveWellness: number | null; // 1-10
    moodAfterMeals: number | null; // 1-10
    modifications: NutritionModification[];
    notes: string | null;
  };
  
  // AI context for next day planning
  aiContext: {
    previousDaysSummary: string; // summary of last 3-5 days nutrition
    adaptationSuggestions: string[];
    nextDayPreparation: string;
    groceryListItems: string[];
    hydrationReminders: string[];
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NutritionMeal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack1' | 'snack2' | 'pre_workout' | 'post_workout';
  name: string;
  description: string;
  
  // Recipe details
  ingredients: NutritionIngredient[];
  instructions: string[];
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Nutritional information
  nutrition: {
    calories: number;
    protein: number; // grams
    carbs: number; // grams
    fats: number; // grams
    fiber: number; // grams
    sugar: number; // grams
    sodium: number; // mg
  };
  
  // Meal metadata
  tags: string[]; // ["high-protein", "vegetarian", "quick", "make-ahead"]
  cuisineType: string; // "Mediterranean", "Asian", "Mexican", etc.
  season: string[]; // ["spring", "summer"] or ["all-year"]
  mealPrepFriendly: boolean;
  budgetFriendly: boolean;
  
  // Alternative options
  substitutions: {
    ingredient: string;
    alternatives: string[];
    reason: string; // "dairy-free", "lower-carb", etc.
  }[];
  
  // Performance tracking per meal
  targetSatisfaction: number; // expected satisfaction 1-10
  actualPerformance: {
    consumed: boolean;
    satisfactionRating: number | null; // 1-10
    portionConsumed: number | null; // percentage 0-100
    modifications_used: string[];
    timeToComplete: number | null; // minutes
    difficultyExperienced: number | null; // 1-10
  } | null;
}

export interface NutritionIngredient {
  name: string;
  amount: number;
  unit: string; // "g", "ml", "cups", "pieces", etc.
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  isOptional: boolean;
  category: 'protein' | 'carbs' | 'vegetables' | 'fruits' | 'fats' | 'dairy' | 'spices' | 'other';
}

export interface NutritionModification {
  mealId: string;
  originalMeal: string;
  modification: string;
  reason: 'allergic_reaction' | 'dislike' | 'ingredient_unavailable' | 'time_constraint' | 'budget_constraint' | 'preference';
  impact: 'lower_calories' | 'higher_calories' | 'different_macros' | 'equivalent';
}

// API interfaces for service functions
export interface CreateNutritionChallengeRequest {
  name: string;
  description: string;
  totalDays: number;
  challengeType: 'weight_loss' | 'muscle_gain' | 'detox' | 'healthy_habits' | 'balanced_nutrition';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  userProfile: NutritionChallenge['userProfile'];
  settings: NutritionChallenge['settings'];
}

export interface UpdateNutritionDayRequest {
  completion: Partial<NutritionChallengeDay['completion']>;
  performance: Partial<NutritionChallengeDay['performance']>;
  mealPerformance: { [mealId: string]: NutritionMeal['actualPerformance'] };
}

export interface AdaptNutritionChallengeRequest {
  reason: NutritionAdaptationEvent['reason'];
  userFeedback?: string;
  performanceData?: {
    strugglingMeals: string[];
    favoriteRecipes: string[];
    energyLevels: number;
    adherenceLevel: number;
    weightProgress: number;
  };
}
