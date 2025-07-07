import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { 
  ExerciseProgram, 
  ExerciseProgramDay, 
  CreateProgramRequest,
  UpdateDayRequest,
  AdaptProgramRequest,
  AdaptationEvent
} from '../types/exercisePrograms';

// Collection names
const EXERCISE_PROGRAMS_COLLECTION = 'exercise_programs';
const PROGRAM_DAYS_SUBCOLLECTION = 'days';

/**
 * Creates a new exercise program for a user
 */
export const createExerciseProgram = async (
  userId: string,
  programData: CreateProgramRequest
): Promise<string> => {
  try {
    // Create the main program document
    const programRef = doc(collection(db, EXERCISE_PROGRAMS_COLLECTION));
    const programId = programRef.id;
    
    const program: ExerciseProgram = {
      id: programId,
      userId,
      name: programData.name,
      description: programData.description,
      totalDays: programData.totalDays,
      currentDay: 1,
      status: 'active',
      difficulty: programData.difficulty,
      programType: programData.programType,
      location: programData.location,
      userProfile: programData.userProfile,
      settings: programData.settings,
      progress: {
        completedDays: 0,
        totalWorkouts: 0,
        averageRating: 0,
        adaptationEvents: 0,
        lastCompletedDate: null,
      },
      aiMemory: {
        userPerformancePattern: {
          strengthTrend: 'stable',
          enduranceTrend: 'stable',
          recoveryPattern: 'average',
          consistencyScore: 100,
        },
        adaptationHistory: [],
        preferredExerciseTypes: [],
        avoidedExerciseTypes: [],
      },
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(programRef, program);
    console.log(`Exercise program created with ID: ${programId}`);
    return programId;
  } catch (error) {
    console.error('Error creating exercise program:', error);
    throw new Error('Failed to create exercise program');
  }
};

/**
 * Gets an exercise program by ID
 */
export const getExerciseProgram = async (
  programId: string
): Promise<ExerciseProgram | null> => {
  try {
    const programRef = doc(db, EXERCISE_PROGRAMS_COLLECTION, programId);
    const programSnap = await getDoc(programRef);
    
    if (programSnap.exists()) {
      return programSnap.data() as ExerciseProgram;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting exercise program:', error);
    return null;
  }
};

/**
 * Gets all exercise programs for a user
 */
export const getUserExercisePrograms = async (
  userId: string
): Promise<ExerciseProgram[]> => {
  try {
    const programsQuery = query(
      collection(db, EXERCISE_PROGRAMS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(programsQuery);
    const programs: ExerciseProgram[] = [];
    
    querySnapshot.forEach((doc) => {
      programs.push(doc.data() as ExerciseProgram);
    });
    
    return programs;
  } catch (error) {
    console.error('Error getting user exercise programs:', error);
    return [];
  }
};

/**
 * Updates an exercise program
 */
export const updateExerciseProgram = async (
  programId: string,
  updates: Partial<ExerciseProgram>
): Promise<void> => {
  try {
    const programRef = doc(db, EXERCISE_PROGRAMS_COLLECTION, programId);
    await updateDoc(programRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log(`Exercise program ${programId} updated successfully`);
  } catch (error) {
    console.error('Error updating exercise program:', error);
    throw new Error('Failed to update exercise program');
  }
};

/**
 * Creates a new day in an exercise program
 */
export const createProgramDay = async (
  programId: string,
  dayData: Omit<ExerciseProgramDay, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const dayRef = doc(collection(db, EXERCISE_PROGRAMS_COLLECTION, programId, PROGRAM_DAYS_SUBCOLLECTION));
    const dayId = dayRef.id;
    
    const day: ExerciseProgramDay = {
      ...dayData,
      id: dayId,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(dayRef, day);
    console.log(`Program day created with ID: ${dayId}`);
    return dayId;
  } catch (error) {
    console.error('Error creating program day:', error);
    throw new Error('Failed to create program day');
  }
};

/**
 * Gets a specific day from an exercise program
 */
export const getProgramDay = async (
  programId: string,
  dayId: string
): Promise<ExerciseProgramDay | null> => {
  try {
    const dayRef = doc(db, EXERCISE_PROGRAMS_COLLECTION, programId, PROGRAM_DAYS_SUBCOLLECTION, dayId);
    const daySnap = await getDoc(dayRef);
    
    if (daySnap.exists()) {
      return daySnap.data() as ExerciseProgramDay;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting program day:', error);
    return null;
  }
};

/**
 * Gets a day by its day number
 */
export const getProgramDayByNumber = async (
  programId: string,
  dayNumber: number
): Promise<ExerciseProgramDay | null> => {
  try {
    const daysQuery = query(
      collection(db, EXERCISE_PROGRAMS_COLLECTION, programId, PROGRAM_DAYS_SUBCOLLECTION),
      where('dayNumber', '==', dayNumber)
    );
    
    const querySnapshot = await getDocs(daysQuery);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as ExerciseProgramDay;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting program day by number:', error);
    return null;
  }
};

/**
 * Gets all days for an exercise program
 */
export const getProgramDays = async (
  programId: string,
  limit?: number
): Promise<ExerciseProgramDay[]> => {
  try {
    let daysQuery = query(
      collection(db, EXERCISE_PROGRAMS_COLLECTION, programId, PROGRAM_DAYS_SUBCOLLECTION),
      orderBy('dayNumber', 'asc')
    );
    
    const querySnapshot = await getDocs(daysQuery);
    const days: ExerciseProgramDay[] = [];
    
    querySnapshot.forEach((doc) => {
      days.push(doc.data() as ExerciseProgramDay);
    });
    
    return limit ? days.slice(0, limit) : days;
  } catch (error) {
    console.error('Error getting program days:', error);
    return [];
  }
};

/**
 * Gets recent days for AI context (last N completed days)
 */
export const getRecentCompletedDays = async (
  programId: string,
  count: number = 5
): Promise<ExerciseProgramDay[]> => {
  try {
    const daysQuery = query(
      collection(db, EXERCISE_PROGRAMS_COLLECTION, programId, PROGRAM_DAYS_SUBCOLLECTION),
      where('completion.status', '==', 'completed'),
      orderBy('completion.completedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(daysQuery);
    const days: ExerciseProgramDay[] = [];
    
    querySnapshot.forEach((doc) => {
      if (days.length < count) {
        days.push(doc.data() as ExerciseProgramDay);
      }
    });
    
    return days.reverse(); // Return in chronological order
  } catch (error) {
    console.error('Error getting recent completed days:', error);
    return [];
  }
};

/**
 * Updates a program day with completion and performance data
 */
export const updateProgramDay = async (
  programId: string,
  dayId: string,
  updates: UpdateDayRequest
): Promise<void> => {
  try {
    const dayRef = doc(db, EXERCISE_PROGRAMS_COLLECTION, programId, PROGRAM_DAYS_SUBCOLLECTION, dayId);
    
    // Update the day document
    await updateDoc(dayRef, {
      completion: updates.completion,
      performance: updates.performance,
      'exercises': updates.exercisePerformance ? 
        await updateExercisePerformance(programId, dayId, updates.exercisePerformance) : 
        undefined,
      updatedAt: serverTimestamp(),
    });
    
    // If day is completed, update program progress
    if (updates.completion?.status === 'completed') {
      await updateProgramProgress(programId, updates.completion);
    }
    
    console.log(`Program day ${dayId} updated successfully`);
  } catch (error) {
    console.error('Error updating program day:', error);
    throw new Error('Failed to update program day');
  }
};

/**
 * Helper function to update exercise performance within a day
 */
const updateExercisePerformance = async (
  programId: string,
  dayId: string,
  exercisePerformance: { [exerciseId: string]: any }
): Promise<any[]> => {
  try {
    const day = await getProgramDay(programId, dayId);
    if (!day) throw new Error('Day not found');
    
    const updatedExercises = day.exercises.map(exercise => {
      if (exercisePerformance[exercise.id]) {
        return {
          ...exercise,
          actualPerformance: exercisePerformance[exercise.id]
        };
      }
      return exercise;
    });
    
    return updatedExercises;
  } catch (error) {
    console.error('Error updating exercise performance:', error);
    throw error;
  }
};

/**
 * Updates program progress when a day is completed
 */
const updateProgramProgress = async (
  programId: string,
  completion: any
): Promise<void> => {
  try {
    const program = await getExerciseProgram(programId);
    if (!program) return;
    
    const newCompletedDays = program.progress.completedDays + 1;
    const newTotalWorkouts = program.progress.totalWorkouts + 1;
    
    // Calculate new average rating if user provided rating
    let newAverageRating = program.progress.averageRating;
    if (completion.userRating && program.progress.totalWorkouts > 0) {
      newAverageRating = (
        (program.progress.averageRating * program.progress.totalWorkouts) + completion.userRating
      ) / newTotalWorkouts;
    }
    
    await updateExerciseProgram(programId, {
      currentDay: Math.min(program.currentDay + 1, program.totalDays),
      progress: {
        ...program.progress,
        completedDays: newCompletedDays,
        totalWorkouts: newTotalWorkouts,
        averageRating: newAverageRating,
        lastCompletedDate: serverTimestamp() as Timestamp,
      }
    });
  } catch (error) {
    console.error('Error updating program progress:', error);
  }
};

/**
 * Adapts a program based on user performance and feedback
 */
export const adaptExerciseProgram = async (
  programId: string,
  adaptationData: AdaptProgramRequest
): Promise<void> => {
  try {
    const program = await getExerciseProgram(programId);
    if (!program) throw new Error('Program not found');
    
    // Create adaptation event
    const adaptationEvent: AdaptationEvent = {
      date: serverTimestamp() as Timestamp,
      reason: adaptationData.reason,
      changes: [], // Will be filled by AI logic
      previousDifficulty: program.difficulty,
      newDifficulty: program.difficulty, // May change based on adaptation
    };
    
    // Update AI memory based on adaptation
    const updatedAiMemory = {
      ...program.aiMemory,
      adaptationHistory: [...program.aiMemory.adaptationHistory, adaptationEvent],
    };
    
    // Update program with new AI memory and increment adaptation events
    await updateExerciseProgram(programId, {
      aiMemory: updatedAiMemory,
      progress: {
        ...program.progress,
        adaptationEvents: program.progress.adaptationEvents + 1,
      }
    });
    
    console.log(`Program ${programId} adapted successfully`);
  } catch (error) {
    console.error('Error adapting exercise program:', error);
    throw new Error('Failed to adapt exercise program');
  }
};

/**
 * Deletes an exercise program and all its days
 */
export const deleteExerciseProgram = async (
  programId: string
): Promise<void> => {
  try {
    // First delete all days
    const days = await getProgramDays(programId);
    const deletePromises = days.map(day => 
      deleteDoc(doc(db, EXERCISE_PROGRAMS_COLLECTION, programId, PROGRAM_DAYS_SUBCOLLECTION, day.id))
    );
    await Promise.all(deletePromises);
    
    // Then delete the program
    await deleteDoc(doc(db, EXERCISE_PROGRAMS_COLLECTION, programId));
    
    console.log(`Exercise program ${programId} deleted successfully`);
  } catch (error) {
    console.error('Error deleting exercise program:', error);
    throw new Error('Failed to delete exercise program');
  }
};

/**
 * Gets the next scheduled day for a program
 */
export const getNextScheduledDay = async (
  programId: string
): Promise<ExerciseProgramDay | null> => {
  try {
    const program = await getExerciseProgram(programId);
    if (!program) return null;
    
    return await getProgramDayByNumber(programId, program.currentDay);
  } catch (error) {
    console.error('Error getting next scheduled day:', error);
    return null;
  }
};

/**
 * Marks a day as skipped and advances to next day
 */
export const skipProgramDay = async (
  programId: string,
  dayId: string,
  reason: string
): Promise<void> => {
  try {
    // Update day status to skipped
    await updateDoc(doc(db, EXERCISE_PROGRAMS_COLLECTION, programId, PROGRAM_DAYS_SUBCOLLECTION, dayId), {
      'completion.status': 'skipped',
      'performance.notes': reason,
      updatedAt: serverTimestamp(),
    });
    
    // Advance program to next day
    const program = await getExerciseProgram(programId);
    if (program) {
      await updateExerciseProgram(programId, {
        currentDay: Math.min(program.currentDay + 1, program.totalDays),
      });
    }
    
    console.log(`Program day ${dayId} skipped successfully`);
  } catch (error) {
    console.error('Error skipping program day:', error);
    throw new Error('Failed to skip program day');
  }
};
