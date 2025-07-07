import React, { useState } from 'react';
import { useAutomaticProgramCreator } from '../hooks/useAutomaticProgramCreator';
import { CreateProgramRequest } from '../types/exercisePrograms';

/**
 * Componente que demuestra la creación automática de programas de ejercicio
 * Implementa la funcionalidad solicitada de crear documentos y subcolecciones automáticamente
 */
export const AutomaticProgramDemo: React.FC = () => {
  const { status, crearProgramaRapido, crearProgramaPersonalizado, resetStatus } = useAutomaticProgramCreator();
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);
  const [programaRapido, setProgramaRapido] = useState({
    nombre: 'Mi Programa de 30 Días',
    descripcion: 'Programa automático generado con IA',
    totalDias: 30,
  });

  // Configuración avanzada para programa personalizado
  const [configuracionAvanzada, setConfiguracionAvanzada] = useState<CreateProgramRequest>({
    name: 'Programa Personalizado Avanzado',
    description: 'Programa totalmente personalizado con IA contextual',
    totalDays: 45,
    difficulty: 'intermediate',
    programType: 'general_fitness',
    location: 'home',
    userProfile: {
      age: 28,
      weight: 75,
      height: 175,
      fitnessLevel: 'intermediate',
      goals: ['perder peso', 'ganar fuerza', 'mejorar resistencia'],
      limitations: ['rodilla sensible'],
      availableEquipment: ['mancuernas', 'banda elástica', 'colchoneta'],
    },
    settings: {
      daysPerWeek: 5,
      sessionDuration: 50,
      restDaySchedule: [5, 6], // Sábado y Domingo
      autoAdaptation: true,
      difficultyProgression: 'adaptive',
    },
  });

  const handleCrearProgramaRapido = async () => {
    const programId = await crearProgramaRapido(
      programaRapido.nombre,
      programaRapido.descripcion,
      programaRapido.totalDias
    );
    
    if (programId) {
      console.log('🎉 Programa rápido creado con ID:', programId);
    }
  };

  const handleCrearProgramaPersonalizado = async () => {
    const programId = await crearProgramaPersonalizado(configuracionAvanzada);
    
    if (programId) {
      console.log('🎉 Programa personalizado creado con ID:', programId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🚀 Creación Automática de Programas
        </h1>
        <p className="text-gray-600">
          Demuestra cómo crear automáticamente documentos y subcolecciones en Firestore
        </p>
        <p className="text-sm text-blue-600 mt-2">
          Estructura: <code>exercise_programs/{'{programId}'}/days/{'{dayId}'}</code>
        </p>
      </div>

      {/* Estado de Progreso */}
      {status.isCreating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900">
              Creando Programa Automáticamente...
            </h3>
            <div className="text-blue-600 font-medium">
              {status.progress.percentage}%
            </div>
          </div>
          
          <div className="w-full bg-blue-200 rounded-full h-3 mb-4">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${status.progress.percentage}%` }}
            ></div>
          </div>
          
          <div className="text-blue-700">
            <p className="font-medium">{status.progress.currentStep}</p>
            <p className="text-sm">
              Días generados: {status.progress.completedDays}/{status.progress.totalDays}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {status.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">
            <strong>Error:</strong> {status.error}
          </div>
          <button 
            onClick={resetStatus}
            className="mt-2 text-red-600 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Éxito */}
      {status.programId && !status.isCreating && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-800">
            <strong>🎉 ¡Programa creado exitosamente!</strong>
            <br />
            <span className="text-sm">ID del programa: <code>{status.programId}</code></span>
            <br />
            <span className="text-sm">
              ✅ {status.progress.totalDays} días generados automáticamente en Firestore
            </span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Programa Rápido */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            📱 Creación Rápida
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            Crea un programa básico con configuración predeterminada. 
            Ideal para usuarios que quieren empezar rápidamente.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre del Programa
              </label>
              <input
                type="text"
                value={programaRapido.nombre}
                onChange={(e) => setProgramaRapido({...programaRapido, nombre: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Mi Programa de Ejercicios"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Descripción
              </label>
              <textarea
                value={programaRapido.descripcion}
                onChange={(e) => setProgramaRapido({...programaRapido, descripcion: e.target.value})}
                className="w-full p-2 border rounded h-20"
                placeholder="Describe tu programa..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Total de Días
              </label>
              <input
                type="number"
                value={programaRapido.totalDias}
                onChange={(e) => setProgramaRapido({...programaRapido, totalDias: parseInt(e.target.value)})}
                className="w-full p-2 border rounded"
                min="7"
                max="365"
              />
            </div>

            <button
              onClick={handleCrearProgramaRapido}
              disabled={status.isCreating}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 px-4 rounded font-medium"
            >
              {status.isCreating ? 'Creando...' : '🚀 Crear Programa Rápido'}
            </button>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
            <strong>📋 Qué se crea automáticamente:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>1 documento principal en <code>exercise_programs</code></li>
              <li>{programaRapido.totalDias} documentos en subcollección <code>days</code></li>
              <li>Rutinas generadas con IA para cada día</li>
              <li>Días de descanso automáticos</li>
              <li>Progresión adaptativa</li>
            </ul>
          </div>
        </div>

        {/* Programa Personalizado */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            🎯 Creación Personalizada
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            Crea un programa completamente personalizado con todas las opciones avanzadas
            y configuración específica del usuario.
          </p>

          {!showAdvancedForm ? (
            <div>
              <div className="bg-gray-50 rounded p-4 mb-4">
                <h3 className="font-medium mb-2">Configuración Actual:</h3>
                <div className="text-sm space-y-1 text-gray-600">
                  <p><strong>Nombre:</strong> {configuracionAvanzada.name}</p>
                  <p><strong>Días:</strong> {configuracionAvanzada.totalDays}</p>
                  <p><strong>Dificultad:</strong> {configuracionAvanzada.difficulty}</p>
                  <p><strong>Tipo:</strong> {configuracionAvanzada.programType}</p>
                  <p><strong>Ubicación:</strong> {configuracionAvanzada.location}</p>
                  <p><strong>Edad:</strong> {configuracionAvanzada.userProfile.age} años</p>
                  <p><strong>Objetivos:</strong> {configuracionAvanzada.userProfile.goals.join(', ')}</p>
                  <p><strong>Equipo:</strong> {configuracionAvanzada.userProfile.availableEquipment.join(', ')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowAdvancedForm(true)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                >
                  ⚙️ Personalizar Configuración
                </button>

                <button
                  onClick={handleCrearProgramaPersonalizado}
                  disabled={status.isCreating}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 px-4 rounded font-medium"
                >
                  {status.isCreating ? 'Creando...' : '🎯 Crear Programa Personalizado'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    value={configuracionAvanzada.name}
                    onChange={(e) => setConfiguracionAvanzada({
                      ...configuracionAvanzada, 
                      name: e.target.value
                    })}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Días</label>
                  <input
                    type="number"
                    value={configuracionAvanzada.totalDays}
                    onChange={(e) => setConfiguracionAvanzada({
                      ...configuracionAvanzada, 
                      totalDays: parseInt(e.target.value)
                    })}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Dificultad</label>
                  <select
                    value={configuracionAvanzada.difficulty}
                    onChange={(e) => setConfiguracionAvanzada({
                      ...configuracionAvanzada, 
                      difficulty: e.target.value as any
                    })}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select
                    value={configuracionAvanzada.programType}
                    onChange={(e) => setConfiguracionAvanzada({
                      ...configuracionAvanzada, 
                      programType: e.target.value as any
                    })}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="general_fitness">Fitness General</option>
                    <option value="weight_loss">Pérdida de Peso</option>
                    <option value="muscle_gain">Ganancia Muscular</option>
                    <option value="strength">Fuerza</option>
                    <option value="endurance">Resistencia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ubicación</label>
                  <select
                    value={configuracionAvanzada.location}
                    onChange={(e) => setConfiguracionAvanzada({
                      ...configuracionAvanzada, 
                      location: e.target.value as any
                    })}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="home">Casa</option>
                    <option value="gym">Gimnasio</option>
                    <option value="hybrid">Híbrido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Edad</label>
                  <input
                    type="number"
                    value={configuracionAvanzada.userProfile.age}
                    onChange={(e) => setConfiguracionAvanzada({
                      ...configuracionAvanzada,
                      userProfile: {
                        ...configuracionAvanzada.userProfile,
                        age: parseInt(e.target.value)
                      }
                    })}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    value={configuracionAvanzada.userProfile.weight}
                    onChange={(e) => setConfiguracionAvanzada({
                      ...configuracionAvanzada,
                      userProfile: {
                        ...configuracionAvanzada.userProfile,
                        weight: parseFloat(e.target.value)
                      }
                    })}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Altura (cm)</label>
                  <input
                    type="number"
                    value={configuracionAvanzada.userProfile.height}
                    onChange={(e) => setConfiguracionAvanzada({
                      ...configuracionAvanzada,
                      userProfile: {
                        ...configuracionAvanzada.userProfile,
                        height: parseInt(e.target.value)
                      }
                    })}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowAdvancedForm(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded text-sm"
                >
                  ← Volver
                </button>
                <button
                  onClick={handleCrearProgramaPersonalizado}
                  disabled={status.isCreating}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded text-sm font-medium"
                >
                  {status.isCreating ? 'Creando...' : '🎯 Crear'}
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-green-50 rounded text-xs text-green-700">
            <strong>🧠 Características Avanzadas:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>IA contextual con memoria de días anteriores</li>
              <li>Adaptación automática basada en rendimiento</li>
              <li>Personalización completa del perfil</li>
              <li>Progresión inteligente por semanas</li>
              <li>Consideración de limitaciones físicas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Información Técnica */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🔧 Información Técnica</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium mb-2">Estructura en Firestore:</h4>
            <div className="bg-white p-3 rounded border font-mono text-xs">
              <div>exercise_programs/</div>
              <div className="ml-2">├── {'{programId}'}</div>
              <div className="ml-4">├── id: string</div>
              <div className="ml-4">├── userId: string</div>
              <div className="ml-4">├── name: string</div>
              <div className="ml-4">├── progress: object</div>
              <div className="ml-4">├── aiMemory: object</div>
              <div className="ml-4">└── days/</div>
              <div className="ml-6">├── day1</div>
              <div className="ml-6">├── day2</div>
              <div className="ml-6">└── ...</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Proceso Automático:</h4>
            <div className="space-y-2">
              <div className="bg-white p-2 rounded border">
                <strong>1.</strong> Crear documento principal
              </div>
              <div className="bg-white p-2 rounded border">
                <strong>2.</strong> Generar días con IA
              </div>
              <div className="bg-white p-2 rounded border">
                <strong>3.</strong> Crear subcolección days
              </div>
              <div className="bg-white p-2 rounded border">
                <strong>4.</strong> Guardar cada día automáticamente
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
