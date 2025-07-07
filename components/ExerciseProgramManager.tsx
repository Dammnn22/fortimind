import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  ExerciseProgram, 
  ExerciseProgramDay, 
  CreateProgramRequest 
} from '../types/exercisePrograms';
import { 
  getUserExercisePrograms, 
  getExerciseProgram,
  getNextScheduledDay,
  updateProgramDay,
  skipProgramDay
} from '../services/exerciseProgramService';
import { generatePersonalizedProgram } from '../services/aiProgramGenerator';

interface ExerciseProgramManagerProps {
  onProgramSelect?: (programId: string) => void;
}

export const ExerciseProgramManager: React.FC<ExerciseProgramManagerProps> = ({
  onProgramSelect
}) => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<ExerciseProgram[]>([]);
  const [currentProgram, setCurrentProgram] = useState<ExerciseProgram | null>(null);
  const [todayWorkout, setTodayWorkout] = useState<ExerciseProgramDay | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserPrograms();
    }
  }, [user]);

  const loadUserPrograms = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userPrograms = await getUserExercisePrograms(user.uid);
      setPrograms(userPrograms);
      
      // Set active program as current
      const activeProgram = userPrograms.find(p => p.status === 'active');
      if (activeProgram) {
        setCurrentProgram(activeProgram);
        await loadTodayWorkout(activeProgram.id);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
      setError('Error al cargar programas de ejercicio');
    } finally {
      setLoading(false);
    }
  };

  const loadTodayWorkout = async (programId: string) => {
    try {
      const nextDay = await getNextScheduledDay(programId);
      setTodayWorkout(nextDay);
    } catch (error) {
      console.error('Error loading today workout:', error);
    }
  };

  const handleCreateProgram = async (programData: CreateProgramRequest) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const programId = await generatePersonalizedProgram(user.uid, programData);
      
      // Reload programs to include the new one
      await loadUserPrograms();
      
      // Select the new program
      const newProgram = await getExerciseProgram(programId);
      if (newProgram) {
        setCurrentProgram(newProgram);
        await loadTodayWorkout(programId);
        onProgramSelect?.(programId);
      }
      
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating program:', error);
      setError('Error al crear el programa personalizado');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async () => {
    if (!todayWorkout || !currentProgram) return;
    
    try {
      await updateProgramDay(currentProgram.id, todayWorkout.id, {
        completion: {
          status: 'in_progress',
          startedAt: new Date() as any,
        },
        performance: {},
        exercisePerformance: {},
      });
      
      // Reload today's workout
      await loadTodayWorkout(currentProgram.id);
    } catch (error) {
      console.error('Error starting workout:', error);
      setError('Error al iniciar el entrenamiento');
    }
  };

  const handleCompleteWorkout = async (rating: number, feedback?: string) => {
    if (!todayWorkout || !currentProgram) return;
    
    try {
      await updateProgramDay(currentProgram.id, todayWorkout.id, {
        completion: {
          status: 'completed',
          completedAt: new Date() as any,
          userRating: rating,
          userFeedback: feedback,
          completedExercises: todayWorkout.exercises.length,
          totalExercises: todayWorkout.exercises.length,
        },
        performance: {},
        exercisePerformance: {},
      });
      
      // Reload program and today's workout
      await loadUserPrograms();
      if (currentProgram) {
        await loadTodayWorkout(currentProgram.id);
      }
    } catch (error) {
      console.error('Error completing workout:', error);
      setError('Error al completar el entrenamiento');
    }
  };

  const handleSkipWorkout = async (reason: string) => {
    if (!todayWorkout || !currentProgram) return;
    
    try {
      await skipProgramDay(currentProgram.id, todayWorkout.id, reason);
      
      // Reload program and today's workout
      await loadUserPrograms();
      if (currentProgram) {
        await loadTodayWorkout(currentProgram.id);
      }
    } catch (error) {
      console.error('Error skipping workout:', error);
      setError('Error al saltar el entrenamiento');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Cargando programas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <div className="text-red-800">{error}</div>
        <button 
          onClick={() => setError(null)}
          className="mt-2 text-red-600 underline"
        >
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Programas de Entrenamiento
        </h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Crear Programa
        </button>
      </div>

      {/* Current Program Overview */}
      {currentProgram && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentProgram.name}
              </h2>
              <p className="text-gray-600">{currentProgram.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Progreso</div>
              <div className="text-lg font-semibold">
                {currentProgram.progress.completedDays}/{currentProgram.totalDays} días
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-500 h-2 rounded-full"
              style={{ 
                width: `${(currentProgram.progress.completedDays / currentProgram.totalDays) * 100}%` 
              }}
            ></div>
          </div>

          {/* Program Stats */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {currentProgram.currentDay}
              </div>
              <div className="text-sm text-gray-500">Día Actual</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {currentProgram.progress.completedDays}
              </div>
              <div className="text-sm text-gray-500">Completados</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">
                {currentProgram.progress.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Rating Promedio</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">
                {currentProgram.difficulty}
              </div>
              <div className="text-sm text-gray-500">Dificultad</div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Workout */}
      {todayWorkout && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            Entrenamiento de Hoy - Día {todayWorkout.dayNumber}
          </h3>
          
          <div className="mb-4">
            <h4 className="font-medium text-gray-900">
              {todayWorkout.workoutSummary.title}
            </h4>
            <p className="text-gray-600 text-sm">
              {todayWorkout.workoutSummary.description}
            </p>
          </div>

          <div className="flex gap-4 text-sm text-gray-600 mb-4">
            <span>⏱️ {todayWorkout.estimatedDuration} min</span>
            <span>📍 {todayWorkout.location}</span>
            <span>💪 {todayWorkout.workoutSummary.workoutType}</span>
            <span>🎯 {todayWorkout.workoutSummary.primaryMuscleGroups.join(', ')}</span>
          </div>

          <div className="flex gap-2">
            {todayWorkout.completion.status === 'not_started' && (
              <button
                onClick={handleStartWorkout}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Iniciar Entrenamiento
              </button>
            )}
            
            {todayWorkout.completion.status === 'in_progress' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleCompleteWorkout(5, 'Completado')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Marcar Completado
                </button>
                <button
                  onClick={() => handleSkipWorkout('No pude completarlo hoy')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Saltar Hoy
                </button>
              </div>
            )}
            
            {todayWorkout.completion.status === 'completed' && (
              <div className="text-green-600 font-medium">
                ✅ Completado - Rating: {todayWorkout.completion.userRating}/5
              </div>
            )}
            
            {todayWorkout.completion.status === 'skipped' && (
              <div className="text-orange-600 font-medium">
                ⏭️ Saltado
              </div>
            )}
          </div>
        </div>
      )}

      {/* Programs List */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Mis Programas</h3>
        {programs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tienes programas de entrenamiento creados.
            <br />
            Crea tu primer programa personalizado para comenzar.
          </div>
        ) : (
          programs.map(program => (
            <div 
              key={program.id} 
              className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-colors ${
                currentProgram?.id === program.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                setCurrentProgram(program);
                loadTodayWorkout(program.id);
                onProgramSelect?.(program.id);
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{program.name}</h4>
                  <p className="text-sm text-gray-600">{program.description}</p>
                  <div className="flex gap-4 text-xs text-gray-500 mt-2">
                    <span>{program.totalDays} días</span>
                    <span>{program.difficulty}</span>
                    <span>{program.programType}</span>
                    <span>{program.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded text-xs ${
                    program.status === 'active' ? 'bg-green-100 text-green-800' :
                    program.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    program.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {program.status}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {program.progress.completedDays}/{program.totalDays}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Program Modal */}
      {showCreateForm && (
        <CreateProgramModal
          onSubmit={handleCreateProgram}
          onClose={() => setShowCreateForm(false)}
          loading={loading}
        />
      )}
    </div>
  );
};

interface CreateProgramModalProps {
  onSubmit: (data: CreateProgramRequest) => void;
  onClose: () => void;
  loading: boolean;
}

const CreateProgramModal: React.FC<CreateProgramModalProps> = ({
  onSubmit,
  onClose,
  loading
}) => {
  const [formData, setFormData] = useState<CreateProgramRequest>({
    name: '',
    description: '',
    totalDays: 30,
    difficulty: 'beginner',
    programType: 'general_fitness',
    location: 'home',
    userProfile: {
      age: 25,
      weight: 70,
      height: 170,
      fitnessLevel: 'beginner',
      goals: [],
      limitations: [],
      availableEquipment: []
    },
    settings: {
      daysPerWeek: 3,
      sessionDuration: 45,
      restDaySchedule: [0, 6], // Sunday and Saturday
      autoAdaptation: true,
      difficultyProgression: 'adaptive'
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          Crear Programa Personalizado
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre del Programa
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Duración (días)
              </label>
              <input
                type="number"
                value={formData.totalDays}
                onChange={(e) => setFormData({...formData, totalDays: parseInt(e.target.value)})}
                className="w-full p-2 border rounded"
                min="7"
                max="365"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-2 border rounded h-20"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Dificultad
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value as any})}
                className="w-full p-2 border rounded"
              >
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Objetivo
              </label>
              <select
                value={formData.programType}
                onChange={(e) => setFormData({...formData, programType: e.target.value as any})}
                className="w-full p-2 border rounded"
              >
                <option value="general_fitness">Fitness General</option>
                <option value="weight_loss">Pérdida de Peso</option>
                <option value="muscle_gain">Ganancia Muscular</option>
                <option value="strength">Fuerza</option>
                <option value="endurance">Resistencia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Ubicación
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value as any})}
                className="w-full p-2 border rounded"
              >
                <option value="home">Casa</option>
                <option value="gym">Gimnasio</option>
                <option value="hybrid">Híbrido</option>
              </select>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Perfil Personal</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Edad</label>
                <input
                  type="number"
                  value={formData.userProfile.age}
                  onChange={(e) => setFormData({
                    ...formData, 
                    userProfile: {...formData.userProfile, age: parseInt(e.target.value)}
                  })}
                  className="w-full p-2 border rounded"
                  min="16"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Peso (kg)</label>
                <input
                  type="number"
                  value={formData.userProfile.weight}
                  onChange={(e) => setFormData({
                    ...formData, 
                    userProfile: {...formData.userProfile, weight: parseFloat(e.target.value)}
                  })}
                  className="w-full p-2 border rounded"
                  min="30"
                  max="300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Altura (cm)</label>
                <input
                  type="number"
                  value={formData.userProfile.height}
                  onChange={(e) => setFormData({
                    ...formData, 
                    userProfile: {...formData.userProfile, height: parseInt(e.target.value)}
                  })}
                  className="w-full p-2 border rounded"
                  min="120"
                  max="250"
                />
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Configuración</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Días por semana
                </label>
                <input
                  type="number"
                  value={formData.settings.daysPerWeek}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {...formData.settings, daysPerWeek: parseInt(e.target.value)}
                  })}
                  className="w-full p-2 border rounded"
                  min="2"
                  max="7"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Duración por sesión (min)
                </label>
                <input
                  type="number"
                  value={formData.settings.sessionDuration}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {...formData.settings, sessionDuration: parseInt(e.target.value)}
                  })}
                  className="w-full p-2 border rounded"
                  min="15"
                  max="120"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Generando...' : 'Crear Programa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
