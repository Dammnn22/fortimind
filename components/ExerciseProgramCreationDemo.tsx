import React, { useState, useEffect } from 'react';
import { useAutomaticProgramCreator } from '../hooks/useAutomaticProgramCreator';
import { useProgramCreationProtection } from '../hooks/useAbuseProtection';
import { CreateProgramRequest } from '../types/exercisePrograms';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import AbuseProtectionAlert from './AbuseProtectionAlert';

/**
 * Componente completo que demuestra la creación automática de programas de ejercicio
 * Incluye visualización en tiempo real de los documentos creados en Firestore
 * Incorpora protección contra abuso y límites de rate limiting
 */
export const ExerciseProgramCreationDemo: React.FC = () => {
  const { user } = useAuth();
  const { status, crearProgramaRapido, crearProgramaPersonalizado, resetStatus } = useAutomaticProgramCreator();
  const protection = useProgramCreationProtection();
  const [recentPrograms, setRecentPrograms] = useState<any[]>([]);
  const [selectedProgramDays, setSelectedProgramDays] = useState<any[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  // Configuración para programa rápido
  const [quickConfig, setQuickConfig] = useState({
    nombre: 'Programa de Fitness Automático',
    descripcion: 'Programa generado automáticamente con IA contextual',
    totalDias: 30,
  });

  // Configuración avanzada
  const [advancedConfig, setAdvancedConfig] = useState<CreateProgramRequest>({
    name: 'Programa Avanzado Personalizado',
    description: 'Programa completamente personalizado con IA adaptativa',
    totalDays: 21,
    difficulty: 'intermediate',
    programType: 'general_fitness',
    location: 'home',
    userProfile: {
      age: 30,
      weight: 70,
      height: 170,
      fitnessLevel: 'intermediate',
      goals: ['perder peso', 'ganar fuerza', 'mejorar resistencia'],
      limitations: [],
      availableEquipment: ['mancuernas', 'banda elástica', 'colchoneta', 'step'],
    },
    settings: {
      daysPerWeek: 5,
      sessionDuration: 45,
      restDaySchedule: [0, 6], // Domingo y Sábado
      autoAdaptation: true,
      difficultyProgression: 'adaptive',
    },
  });

  // Escuchar programas recientes del usuario
  useEffect(() => {
    if (!user) return;

    const programsQuery = query(
      collection(db, 'exercise_programs'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(programsQuery, (snapshot) => {
      const programs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentPrograms(programs);
    });

    return () => unsubscribe();
  }, [user]);

  // Escuchar días del programa seleccionado
  useEffect(() => {
    if (!selectedProgramId) {
      setSelectedProgramDays([]);
      return;
    }

    const daysQuery = query(
      collection(db, 'exercise_programs', selectedProgramId, 'days'),
      orderBy('dayNumber', 'asc'),
      limit(10) // Mostrar solo los primeros 10 días para el demo
    );

    const unsubscribe = onSnapshot(daysQuery, (snapshot) => {
      const days = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSelectedProgramDays(days);
    });

    return () => unsubscribe();
  }, [selectedProgramId]);

  const handleQuickCreate = async () => {
    // Validar protección contra abuso antes de crear
    const isAllowed = await protection.validateProgramCreation({
      totalDays: quickConfig.totalDias,
      type: 'quick',
      name: quickConfig.nombre,
    });
    
    if (!isAllowed) {
      console.warn('🚫 Creación bloqueada por protección contra abuso');
      return;
    }
    
    const programId = await crearProgramaRapido(
      quickConfig.nombre,
      quickConfig.descripcion,
      quickConfig.totalDias
    );
    
    if (programId) {
      console.log('🎉 Programa rápido creado:', programId);
      setSelectedProgramId(programId);
    }
  };

  const handleAdvancedCreate = async () => {
    // Validar protección contra abuso antes de crear
    const isAllowed = await protection.validateProgramCreation({
      totalDays: advancedConfig.totalDays,
      type: 'advanced',
      programType: advancedConfig.programType,
      difficulty: advancedConfig.difficulty,
    });
    
    if (!isAllowed) {
      console.warn('🚫 Creación bloqueada por protección contra abuso');
      return;
    }
    
    const programId = await crearProgramaPersonalizado(advancedConfig);
    
    if (programId) {
      console.log('🎉 Programa avanzado creado:', programId);
      setSelectedProgramId(programId);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">
            Por favor, inicia sesión para probar la creación automática de programas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🚀 Creación Automática de Programas
        </h1>
        <p className="text-gray-600 text-lg">
          Sistema completo de generación automática en Firestore
        </p>
        <div className="bg-blue-50 rounded-lg p-4 mt-4">
          <p className="text-sm text-blue-700 font-mono">
            📁 Estructura: <strong>exercise_programs/{'{programId}'}/days/{'{dayId}'}</strong>
          </p>
          <p className="text-sm text-blue-600 mt-1">
            ✨ Cada programa genera automáticamente todos sus días con IA contextual
          </p>
        </div>
      </div>

      {/* Estado de Progreso */}
      {status.isCreating && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              Generando Programa...
            </h3>
            <div className="text-2xl font-bold text-blue-600">
              {status.progress.percentage}%
            </div>
          </div>
          
          <div className="w-full bg-blue-200 rounded-full h-4 mb-4 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-4 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${status.progress.percentage}%` }}
            ></div>
          </div>
          
          <div className="space-y-2">
            <p className="font-semibold text-blue-800">{status.progress.currentStep}</p>
            <p className="text-blue-700">
              Días generados: <span className="font-bold">{status.progress.completedDays}</span>/{status.progress.totalDays}
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {status.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">❌ Error en la Creación</h3>
          <p className="text-red-700">{status.error}</p>
          <button
            onClick={resetStatus}
            className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Success Display */}
      {status.programId && !status.isCreating && !status.error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-green-800 font-semibold mb-2 text-xl">🎉 ¡Programa Creado Exitosamente!</h3>
          <p className="text-green-700 mb-3">
            ID del programa: <code className="bg-green-100 px-2 py-1 rounded font-mono">{status.programId}</code>
          </p>
          <p className="text-green-600 text-sm">
            Se crearon automáticamente {status.progress.totalDays} días con ejercicios personalizados usando IA.
          </p>
        </div>
      )}

      {/* Formularios de Creación */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Programa Rápido */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            ⚡ Creación Rápida
          </h2>
          <p className="text-gray-600 mb-6">
            Genera un programa automáticamente con configuración básica
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Programa
              </label>
              <input
                type="text"
                value={quickConfig.nombre}
                onChange={(e) => setQuickConfig({...quickConfig, nombre: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={status.isCreating}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={quickConfig.descripcion}
                onChange={(e) => setQuickConfig({...quickConfig, descripcion: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={status.isCreating}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días Totales
              </label>
              <select
                value={quickConfig.totalDias}
                onChange={(e) => setQuickConfig({...quickConfig, totalDias: parseInt(e.target.value)})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={status.isCreating}
              >
                <option value={7}>1 Semana (7 días)</option>
                <option value={14}>2 Semanas (14 días)</option>
                <option value={21}>3 Semanas (21 días)</option>
                <option value={30}>1 Mes (30 días)</option>
              </select>
            </div>
            
            <button
              onClick={handleQuickCreate}
              disabled={status.isCreating}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {status.isCreating ? 'Creando...' : '⚡ Crear Programa Rápido'}
            </button>
          </div>
        </div>

        {/* Programa Avanzado */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🎯 Creación Avanzada
          </h2>
          <p className="text-gray-600 mb-6">
            Configuración completa con perfil de usuario y preferencias
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Programa
              </label>
              <input
                type="text"
                value={advancedConfig.name}
                onChange={(e) => setAdvancedConfig({...advancedConfig, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={status.isCreating}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dificultad
                </label>
                <select
                  value={advancedConfig.difficulty}
                  onChange={(e) => setAdvancedConfig({
                    ...advancedConfig, 
                    difficulty: e.target.value as any
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={status.isCreating}
                >
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación
                </label>
                <select
                  value={advancedConfig.location}
                  onChange={(e) => setAdvancedConfig({
                    ...advancedConfig, 
                    location: e.target.value as any
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={status.isCreating}
                >
                  <option value="home">Casa</option>
                  <option value="gym">Gimnasio</option>
                  <option value="hybrid">Híbrido</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días por Semana
                </label>
                <input
                  type="number"
                  min="3"
                  max="7"
                  value={advancedConfig.settings.daysPerWeek}
                  onChange={(e) => setAdvancedConfig({
                    ...advancedConfig,
                    settings: {
                      ...advancedConfig.settings,
                      daysPerWeek: parseInt(e.target.value)
                    }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={status.isCreating}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (min)
                </label>
                <input
                  type="number"
                  min="20"
                  max="120"
                  value={advancedConfig.settings.sessionDuration}
                  onChange={(e) => setAdvancedConfig({
                    ...advancedConfig,
                    settings: {
                      ...advancedConfig.settings,
                      sessionDuration: parseInt(e.target.value)
                    }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={status.isCreating}
                />
              </div>
            </div>
            
            <button
              onClick={handleAdvancedCreate}
              disabled={status.isCreating}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {status.isCreating ? 'Creando...' : '🎯 Crear Programa Avanzado'}
            </button>
          </div>
        </div>
      </div>

      {/* Visualización de Programas Recientes */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          📋 Programas Recientes
        </h2>
        
        {recentPrograms.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay programas creados aún. ¡Crea tu primer programa arriba!
          </p>
        ) : (
          <div className="space-y-4">
            {recentPrograms.map((program) => (
              <div
                key={program.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedProgramId === program.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => setSelectedProgramId(
                  selectedProgramId === program.id ? null : program.id
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {program.name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {program.description}
                    </p>
                    <div className="flex gap-4 mt-3 text-xs text-gray-500">
                      <span>📅 {program.totalDays} días</span>
                      <span>💪 {program.difficulty}</span>
                      <span>📍 {program.location}</span>
                      <span>📊 {program.progress?.completedDays || 0}/{program.totalDays} completados</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      program.status === 'active' ? 'bg-green-100 text-green-800' :
                      program.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {program.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatTimestamp(program.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visualización de Días del Programa Seleccionado */}
      {selectedProgramId && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            📅 Días del Programa
            <span className="text-sm font-normal text-gray-600">
              (Primeros 10 días)
            </span>
          </h2>
          
          {selectedProgramDays.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-600">Cargando días del programa...</span>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {selectedProgramDays.map((day) => (
                <div
                  key={day.id}
                  className={`border rounded-lg p-4 ${
                    day.dayType === 'rest' ? 'bg-gray-50 border-gray-200' :
                    day.dayType === 'active_recovery' ? 'bg-blue-50 border-blue-200' :
                    'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="text-center">
                    <h4 className="font-bold text-gray-900 text-lg">
                      Día {day.dayNumber}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {day.workoutSummary?.title}
                    </p>
                    <div className="mt-3 space-y-1">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        day.dayType === 'rest' ? 'bg-gray-100 text-gray-800' :
                        day.dayType === 'active_recovery' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {day.dayType}
                      </span>
                      <p className="text-xs text-gray-500">
                        ⏱️ {day.estimatedDuration} min
                      </p>
                      <p className="text-xs text-gray-500">
                        🏋️ {day.exercises?.length || 0} ejercicios
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              💡 <strong>Estructura Firestore:</strong> Cada día se almacena como un documento separado en la subcolección 
              <code className="bg-gray-200 px-1 rounded mx-1">days</code> del programa, permitiendo consultas eficientes y escalabilidad.
            </p>
          </div>
        </div>
      )}

      {/* Protección contra Abuso */}
      <AbuseProtectionAlert 
        type="program"
        showStats={true}
        onLimitReached={() => console.log('Límite de programas alcanzado')}
      />
    </div>
  );
};

export default ExerciseProgramCreationDemo;
