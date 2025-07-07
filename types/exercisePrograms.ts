// Types for Exercise Programs structure in Firestore
import { Timestamp } from 'firebase/firestore';

export interface ExerciseProgram {
  id: string;
  userId: string;
  name: string;
  description: string;
  totalDays: number;
  currentDay: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  programType: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'general_fitness';
  location: 'home' | 'gym' | 'hybrid';
  
  // User personalization data
  userProfile: {
    age: number;
    weight: number;
    height: number;
    fitnessLevel: string;
    goals: string[];
    limitations: string[];
    availableEquipment: string[];
  };
  
  // Program settings
  settings: {
    daysPerWeek: number;
    sessionDuration: number; // minutes
    restDaySchedule: number[]; // days of week for rest (0=Sunday, 6=Saturday)
    autoAdaptation: boolean; // whether to adapt based on performance
    difficultyProgression: 'linear' | 'adaptive' | 'manual';
  };
  
  // Progress tracking
  progress: {
    completedDays: number;
    totalWorkouts: number;
    averageRating: number; // 1-5 scale from user feedback
    adaptationEvents: number; // how many times difficulty was adjusted
    lastCompletedDate: Timestamp | null;
  };
  
  // AI memory for adaptive programming
  aiMemory: {
    userPerformancePattern: {
      strengthTrend: 'improving' | 'stable' | 'declining';
      enduranceTrend: 'improving' | 'stable' | 'declining';
      recoveryPattern: 'good' | 'average' | 'poor';
      consistencyScore: number; // 0-100
    };
    adaptationHistory: AdaptationEvent[];
    preferredExerciseTypes: string[];
    avoidedExerciseTypes: string[];
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AdaptationEvent {
  date: Timestamp;
  reason: 'performance_decline' | 'performance_improvement' | 'user_feedback' | 'missed_sessions' | 'injury_prevention';
  changes: string[];
  previousDifficulty: string;
  newDifficulty: string;
}

export interface ExerciseProgramDay {
  id: string;
  programId: string;
  dayNumber: number;
  date: Timestamp | null; // when this day was scheduled/completed
  
  // Day configuration
  dayType: 'workout' | 'rest' | 'active_recovery' | 'assessment';
  location: 'home' | 'gym' | 'hybrid';
  estimatedDuration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // Workout details
  workoutSummary: {
    title: string;
    description: string;
    primaryMuscleGroups: string[];
    workoutType: 'strength' | 'cardio' | 'flexibility' | 'hiit' | 'circuit' | 'recovery';
    warmupDuration: number;
    workoutDuration: number;
    cooldownDuration: number;
  };
  
  // Exercise list
  exercises: ProgramExercise[];
  
  // Completion tracking
  completion: {
    status: 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'partially_completed';
    startedAt: Timestamp | null;
    completedAt: Timestamp | null;
    actualDuration: number | null; // actual time spent
    userRating: number | null; // 1-5 difficulty/enjoyment rating
    userFeedback: string | null;
    completedExercises: number;
    totalExercises: number;
  };
  
  // Performance data for AI adaptation
  performance: {
    perceivedExertion: number | null; // 1-10 RPE scale
    energyLevel: number | null; // 1-10 before workout
    recoveryLevel: number | null; // 1-10 recovery from previous day
    modifications: ExerciseModification[];
    notes: string | null;
  };
  
  // AI context for next day planning
  aiContext: {
    previousDaysSummary: string; // summary of last 3-5 days for context
    adaptationSuggestions: string[];
    nextDayPreparation: string;
    recoveryRecommendations: string[];
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProgramExercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment: string[];
  
  // Exercise parameters
  sets: number;
  reps: string; // "8-12", "30 seconds", "max", etc.
  weight: string | null; // "bodyweight", "15kg", "resistance band", etc.
  restTime: number; // seconds between sets
  tempo: string | null; // "2-1-2-1" or descriptive
  
  // Instructions and safety
  instructions: string;
  formCues: string[];
  commonMistakes: string[];
  modifications: {
    easier: string[];
    harder: string[];
    equipment_alternative: string[];
  };
  
  // Performance tracking per exercise
  targetLoad: number; // calculated difficulty score
  actualPerformance: {
    setsCompleted: number;
    repsCompleted: string | null;
    weightUsed: string | null;
    perceivedDifficulty: number | null; // 1-10
    formQuality: number | null; // 1-10
    modifications_used: string[];
  } | null;
}

export interface ExerciseModification {
  exerciseId: string;
  originalExercise: string;
  modification: string;
  reason: 'too_difficult' | 'too_easy' | 'equipment_unavailable' | 'injury_prevention' | 'user_preference';
  impact: 'easier' | 'harder' | 'equivalent';
}

// API interfaces for service functions
export interface CreateProgramRequest {
  name: string;
  description: string;
  totalDays: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  programType: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'general_fitness';
  location: 'home' | 'gym' | 'hybrid';
  userProfile: ExerciseProgram['userProfile'];
  settings: ExerciseProgram['settings'];
}

export interface UpdateDayRequest {
  completion: Partial<ExerciseProgramDay['completion']>;
  performance: Partial<ExerciseProgramDay['performance']>;
  exercisePerformance: { [exerciseId: string]: ProgramExercise['actualPerformance'] };
}

export interface AdaptProgramRequest {
  reason: AdaptationEvent['reason'];
  userFeedback?: string;
  performanceData?: {
    strugglingAreas: string[];
    excellingAreas: string[];
    energyLevels: number;
    recoveryQuality: number;
  };
}
