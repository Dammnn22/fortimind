import React, { useState, useEffect } from 'react';
import { useAutomaticNutritionCreator } from '../hooks/useAutomaticNutritionCreator';
import { useChallengeCreationProtection } from '../hooks/useAbuseProtection';
import { CreateNutritionChallengeRequest } from '../types/nutritionChallenges';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import AbuseProtectionAlert from './AbuseProtectionAlert';

/**
 * Componente completo que demuestra la creación automática de retos nutricionales
 * Incluye visualización en tiempo real de los documentos creados en Firestore
 * Incorpora protección contra abuso y límites de rate limiting
 */
export const NutritionChallengeCreationDemo: React.FC = () => {
  const { user } = useAuth();
  const { status, crearRetoNutricionalRapido, crearRetoNutricionalPersonalizado, resetStatus } = useAutomaticNutritionCreator();
  const protection = useChallengeCreationProtection();
  const [recentChallenges, setRecentChallenges] = useState<any[]>([]);
  const [selectedChallengeDays, setSelectedChallengeDays] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  // Configuración para reto rápido
  const [quickConfig, setQuickConfig] = useState({
    nombre: 'Reto Nutricional de 21 Días',
    descripcion: 'Reto de alimentación saludable generado automáticamente con IA',
    totalDias: 21,
  });

  // Configuración avanzada
  const [advancedConfig, setAdvancedConfig] = useState<CreateNutritionChallengeRequest>({
    name: 'Reto Nutricional Personalizado',
    description: 'Plan de alimentación completamente personalizado con IA adaptativa',
    totalDays: 14,
    challengeType: 'balanced_nutrition',
    difficulty: 'intermediate',
    userProfile: {
      age: 28,
      weight: 65,
      height: 165,
      activityLevel: 'moderately_active',
      goal: 'improve_health',
      dietaryStyle: 'omnivore',
      allergies: [],
      foodDislikes: ['pescado'],
      cookingSkill: 'intermediate',
      mealPrepTime: 45,
      budget: 'medium',
    },
    settings: {
      mealsPerDay: 4,
      snacksIncluded: true,
      mealPrepDay: 0, // Domingo
      waterGoal: 2500,
      supplementsIncluded: false,
      trackMacros: true,
      allowCheatMeals: true,
      groceryListGeneration: true,
    },
  });

  // Escuchar retos recientes del usuario
  useEffect(() => {
    if (!user) return;

    const challengesQuery = query(
      collection(db, 'nutrition_challenges'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(challengesQuery, (snapshot) => {
      const challenges = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentChallenges(challenges);
    });

    return () => unsubscribe();
  }, [user]);

  // Escuchar días del reto seleccionado
  useEffect(() => {
    if (!selectedChallengeId) {
      setSelectedChallengeDays([]);
      return;
    }

    const daysQuery = query(
      collection(db, 'nutrition_challenges', selectedChallengeId, 'days'),
      orderBy('dayNumber', 'asc'),
      limit(10) // Mostrar solo los primeros 10 días para el demo
    );

    const unsubscribe = onSnapshot(daysQuery, (snapshot) => {
      const days = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSelectedChallengeDays(days);
    });

    return () => unsubscribe();
  }, [selectedChallengeId]);

  const handleQuickCreate = async () => {
    // Validar protección contra abuso antes de crear
    const isAllowed = await protection.validateChallengeCreation({
      totalDays: quickConfig.totalDias,
      type: 'quick',
      name: quickConfig.nombre,
    });
    
    if (!isAllowed) {
      console.warn('🚫 Creación bloqueada por protección contra abuso');
      return;
    }
    
    const challengeId = await crearRetoNutricionalRapido(
      quickConfig.nombre,
      quickConfig.descripcion,
      quickConfig.totalDias
    );
    
    if (challengeId) {
      console.log('🎉 Reto nutricional rápido creado:', challengeId);
      setSelectedChallengeId(challengeId);
    }
  };

  const handleAdvancedCreate = async () => {
    // Validar protección contra abuso antes de crear
    const isAllowed = await protection.validateChallengeCreation({
      totalDays: advancedConfig.totalDays,
      type: 'advanced',
      challengeType: advancedConfig.challengeType,
      difficulty: advancedConfig.difficulty,
    });
    
    if (!isAllowed) {
      console.warn('🚫 Creación bloqueada por protección contra abuso');
      return;
    }
    
    const challengeId = await crearRetoNutricionalPersonalizado(advancedConfig);
    
    if (challengeId) {
      console.log('🎉 Reto nutricional avanzado creado:', challengeId);
      setSelectedChallengeId(challengeId);
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
            Por favor, inicia sesión para probar la creación automática de retos nutricionales
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
          🥗 Creación Automática de Retos Nutricionales
        </h1>
        <p className="text-gray-600 text-lg">
          Sistema completo de generación automática de planes nutricionales en Firestore
        </p>
        <div className="bg-green-50 rounded-lg p-4 mt-4">
          <p className="text-sm text-green-700 font-mono">
            📁 Estructura: <strong>nutrition_challenges/{'{challengeId}'}/days/{'{dayId}'}</strong>
          </p>
          <p className="text-sm text-green-600 mt-1">
            🍽️ Cada reto genera automáticamente todos sus días con recetas personalizadas usando IA
          </p>
        </div>
      </div>

      {/* Estado de Progreso */}
      {status.isCreating && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-green-900 flex items-center gap-2">
              <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full"></div>
              Generando Reto Nutricional...
            </h3>
            <div className="text-2xl font-bold text-green-600">
              {status.progress.percentage}%
            </div>
          </div>
          
          <div className="w-full bg-green-200 rounded-full h-4 mb-4 shadow-inner">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${status.progress.percentage}%` }}
            ></div>
          </div>
          
          <div className="space-y-2">
            <p className="font-semibold text-green-800">{status.progress.currentStep}</p>
            <p className="text-green-700">
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
      {status.challengeId && !status.isCreating && !status.error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-green-800 font-semibold mb-2 text-xl">🎉 ¡Reto Nutricional Creado Exitosamente!</h3>
          <p className="text-green-700 mb-3">
            ID del reto: <code className="bg-green-100 px-2 py-1 rounded font-mono">{status.challengeId}</code>
          </p>
          <p className="text-green-600 text-sm">
            Se crearon automáticamente {status.progress.totalDays} días con recetas personalizadas usando IA.
          </p>
        </div>
      )}

      {/* Formularios de Creación */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Reto Rápido */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            ⚡ Creación Rápida
          </h2>
          <p className="text-gray-600 mb-6">
            Genera un reto nutricional automáticamente con configuración básica
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Reto
              </label>
              <input
                type="text"
                value={quickConfig.nombre}
                onChange={(e) => setQuickConfig({...quickConfig, nombre: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {status.isCreating ? 'Creando...' : '⚡ Crear Reto Rápido'}
            </button>
          </div>
        </div>

        {/* Reto Avanzado */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🎯 Creación Avanzada
          </h2>
          <p className="text-gray-600 mb-6">
            Configuración completa con perfil nutricional y preferencias
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Reto
              </label>
              <input
                type="text"
                value={advancedConfig.name}
                onChange={(e) => setAdvancedConfig({...advancedConfig, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={status.isCreating}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Reto
                </label>
                <select
                  value={advancedConfig.challengeType}
                  onChange={(e) => setAdvancedConfig({
                    ...advancedConfig, 
                    challengeType: e.target.value as any
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={status.isCreating}
                >
                  <option value="weight_loss">Pérdida de Peso</option>
                  <option value="muscle_gain">Ganancia Muscular</option>
                  <option value="detox">Detox</option>
                  <option value="healthy_habits">Hábitos Saludables</option>
                  <option value="balanced_nutrition">Nutrición Balanceada</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estilo Dietético
                </label>
                <select
                  value={advancedConfig.userProfile.dietaryStyle}
                  onChange={(e) => setAdvancedConfig({
                    ...advancedConfig,
                    userProfile: {
                      ...advancedConfig.userProfile,
                      dietaryStyle: e.target.value as any
                    }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={status.isCreating}
                >
                  <option value="omnivore">Omnívoro</option>
                  <option value="vegetarian">Vegetariano</option>
                  <option value="vegan">Vegano</option>
                  <option value="pescatarian">Pescetariano</option>
                  <option value="keto">Keto</option>
                  <option value="paleo">Paleo</option>
                  <option value="mediterranean">Mediterráneo</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comidas por Día
                </label>
                <input
                  type="number"
                  min="3"
                  max="6"
                  value={advancedConfig.settings.mealsPerDay}
                  onChange={(e) => setAdvancedConfig({
                    ...advancedConfig,
                    settings: {
                      ...advancedConfig.settings,
                      mealsPerDay: parseInt(e.target.value)
                    }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={status.isCreating}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta de Agua (ml)
                </label>
                <input
                  type="number"
                  min="1500"
                  max="4000"
                  step="250"
                  value={advancedConfig.settings.waterGoal}
                  onChange={(e) => setAdvancedConfig({
                    ...advancedConfig,
                    settings: {
                      ...advancedConfig.settings,
                      waterGoal: parseInt(e.target.value)
                    }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={status.isCreating}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={advancedConfig.settings.snacksIncluded}
                  onChange={(e) => setAdvancedConfig({
                    ...advancedConfig,
                    settings: {
                      ...advancedConfig.settings,
                      snacksIncluded: e.target.checked
                    }
                  })}
                  className="mr-2"
                  disabled={status.isCreating}
                />
                <span className="text-sm text-gray-700">Incluir snacks</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={advancedConfig.settings.trackMacros}
                  onChange={(e) => setAdvancedConfig({
                    ...advancedConfig,
                    settings: {
                      ...advancedConfig.settings,
                      trackMacros: e.target.checked
                    }
                  })}
                  className="mr-2"
                  disabled={status.isCreating}
                />
                <span className="text-sm text-gray-700">Seguir macros</span>
              </label>
            </div>
            
            <button
              onClick={handleAdvancedCreate}
              disabled={status.isCreating}
              className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {status.isCreating ? 'Creando...' : '🎯 Crear Reto Avanzado'}
            </button>
          </div>
        </div>
      </div>

      {/* Visualización de Retos Recientes */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          📋 Retos Nutricionales Recientes
        </h2>
        
        {recentChallenges.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay retos nutricionales creados aún. ¡Crea tu primer reto arriba!
          </p>
        ) : (
          <div className="space-y-4">
            {recentChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedChallengeId === challenge.id
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => setSelectedChallengeId(
                  selectedChallengeId === challenge.id ? null : challenge.id
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {challenge.name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {challenge.description}
                    </p>
                    <div className="flex gap-4 mt-3 text-xs text-gray-500">
                      <span>🗓️ {challenge.totalDays} días</span>
                      <span>🎯 {challenge.challengeType}</span>
                      <span>🥗 {challenge.userProfile?.dietaryStyle}</span>
                      <span>📊 {challenge.progress?.completedDays || 0}/{challenge.totalDays} completados</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      challenge.status === 'active' ? 'bg-green-100 text-green-800' :
                      challenge.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {challenge.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatTimestamp(challenge.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visualización de Días del Reto Seleccionado */}
      {selectedChallengeId && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            📅 Días del Reto Nutricional
            <span className="text-sm font-normal text-gray-600">
              (Primeros 10 días)
            </span>
          </h2>
          
          {selectedChallengeDays.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-600">Cargando días del reto...</span>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {selectedChallengeDays.map((day) => (
                <div
                  key={day.id}
                  className={`border rounded-lg p-4 ${
                    day.dayType === 'prep_day' ? 'bg-orange-50 border-orange-200' :
                    day.dayType === 'detox_day' ? 'bg-purple-50 border-purple-200' :
                    'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="text-center">
                    <h4 className="font-bold text-gray-900 text-lg">
                      Día {day.dayNumber}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {day.nutritionPlan?.title}
                    </p>
                    <div className="mt-3 space-y-1">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        day.dayType === 'prep_day' ? 'bg-orange-100 text-orange-800' :
                        day.dayType === 'detox_day' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {day.dayType}
                      </span>
                      <p className="text-xs text-gray-500">
                        🍽️ {day.meals?.length || 0} comidas
                      </p>
                      <p className="text-xs text-gray-500">
                        ⚡ {day.nutritionPlan?.dailyCalories || 0} kcal
                      </p>
                      <p className="text-xs text-gray-500">
                        💧 {day.nutritionPlan?.waterGoal || 0}ml agua
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
              <code className="bg-gray-200 px-1 rounded mx-1">days</code> del reto, conteniendo recetas detalladas, información nutricional y seguimiento de progreso.
            </p>
          </div>
        </div>
      )}

      {/* Protección contra Abuso */}
      <AbuseProtectionAlert 
        type="challenge"
        showStats={true}
        onLimitReached={() => console.log('Límite de retos nutricionales alcanzado')}
      />
    </div>
  );
};

export default NutritionChallengeCreationDemo;
