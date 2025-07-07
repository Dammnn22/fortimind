import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { crearProgramaCompletoAutomatico } from '../services/automaticProgramCreator';
import { CreateProgramRequest } from '../types/exercisePrograms';

/**
 * Componente de test avanzado para validar creación de programas de 30 días
 * Usado para QA y testing de producción
 */
export const ProgramTestComponent: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    success: boolean;
    details: string;
    programId?: string;
  }>>([]);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setIsLoading(true);
    try {
      const result = await testFn();
      setTestResults(prev => [...prev, {
        test: testName,
        success: true,
        details: `✅ Exitoso: ${JSON.stringify(result)}`,
        programId: typeof result === 'string' ? result : undefined
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: testName,
        success: false,
        details: `❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const testProgram30Days = async () => {
    if (!user) throw new Error('Usuario no autenticado');
    
    const request: CreateProgramRequest = {
      name: `Test Programa 30 Días - ${new Date().toISOString()}`,
      description: 'Programa de test para validar creación de 30 días completos',
      totalDays: 30,
      programType: 'muscle_gain',
      difficulty: 'intermediate',
      location: 'gym',
      userProfile: {
        age: 25,
        weight: 70,
        height: 175,
        fitnessLevel: 'intermediate',
        goals: ['Ganar masa muscular y fuerza'],
        limitations: [],
        availableEquipment: ['dumbbells', 'barbell', 'bench']
      },
      settings: {
        daysPerWeek: 5,
        sessionDuration: 60,
        restDaySchedule: [5, 6],
        autoAdaptation: true,
        difficultyProgression: 'adaptive'
      }
    };

    const programId = await crearProgramaCompletoAutomatico(user.uid, request, false);
    return programId;
  };

  const testProgramPremium90Days = async () => {
    if (!user) throw new Error('Usuario no autenticado');
    
    const request: CreateProgramRequest = {
      name: `Test Programa 90 Días Premium - ${new Date().toISOString()}`,
      description: 'Programa de test para validar límites premium',
      totalDays: 90,
      programType: 'strength',
      difficulty: 'advanced',
      location: 'gym',
      userProfile: {
        age: 30,
        weight: 80,
        height: 180,
        fitnessLevel: 'advanced',
        goals: ['Transformación completa'],
        limitations: [],
        availableEquipment: ['dumbbells', 'barbell', 'cable_machine']
      },
      settings: {
        daysPerWeek: 6,
        sessionDuration: 90,
        restDaySchedule: [6],
        autoAdaptation: true,
        difficultyProgression: 'adaptive'
      }
    };

    const programId = await crearProgramaCompletoAutomatico(user.uid, request, true);
    return programId;
  };

  const testRateLimiting = async () => {
    if (!user) throw new Error('Usuario no autenticado');
    
    const requests = [];
    for (let i = 0; i < 3; i++) {
      const request: CreateProgramRequest = {
        name: `Test Rate Limit ${i} - ${new Date().toISOString()}`,
        description: 'Test para validar rate limiting',
        totalDays: 7,
        programType: 'strength',
        difficulty: 'beginner',
        location: 'home',
        userProfile: {
          age: 25,
          weight: 70,
          height: 170,
          fitnessLevel: 'beginner',
          goals: ['Test'],
          limitations: [],
          availableEquipment: ['bodyweight']
        },
        settings: {
          daysPerWeek: 3,
          sessionDuration: 30,
          restDaySchedule: [0, 3, 6],
          autoAdaptation: false,
          difficultyProgression: 'linear'
        }
      };
      
      requests.push(crearProgramaCompletoAutomatico(user.uid, request, false));
    }

    const results = await Promise.allSettled(requests);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const errorCount = results.filter(r => r.status === 'rejected').length;
    
    return { successCount, errorCount, total: results.length };
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!user) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Por favor inicia sesión para ejecutar tests</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🧪 Test Avanzado de Programas
        </h2>
        <p className="text-gray-600 mb-6">
          Componente de QA para validar funcionalidad crítica antes de producción
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => runTest('Programa 30 Días (Free)', testProgram30Days)}
            disabled={isLoading}
            className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            🔴 Test Crítico: 30 Días
          </button>
          
          <button
            onClick={() => runTest('Programa 90 Días (Premium)', testProgramPremium90Days)}
            disabled={isLoading}
            className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            ⭐ Test Premium: 90 Días
          </button>
          
          <button
            onClick={() => runTest('Rate Limiting', testRateLimiting)}
            disabled={isLoading}
            className="p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            🛡️ Test Rate Limiting
          </button>
          
          <button
            onClick={clearResults}
            disabled={isLoading}
            className="p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            🗑️ Limpiar Resultados
          </button>
        </div>

        {isLoading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">⏳ Ejecutando test...</p>
          </div>
        )}

        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Resultados de Tests:</h3>
            
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <h4 className={`font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.test}
                </h4>
                <p className={`text-sm mt-1 ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.details}
                </p>
                {result.programId && (
                  <p className="text-xs text-gray-600 mt-2">
                    Program ID: {result.programId}
                  </p>
                )}
              </div>
            ))}
            
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800">Resumen:</h4>
              <p className="text-sm text-gray-600">
                ✅ Exitosos: {testResults.filter(r => r.success).length} | 
                ❌ Fallidos: {testResults.filter(r => !r.success).length} | 
                📊 Total: {testResults.length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramTestComponent;
