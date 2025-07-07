import React from 'react';
import FortiMindPremiumFeature from './FortiMindPremiumFeature';
import useFortiMindPremium from '../hooks/useFortiMindPremium';
import { PremiumFeaturesService } from '../services/premiumFeatures';

const PremiumTestComponent: React.FC = () => {
  const { 
    isPremium, 
    featureAccess, 
    incrementUsage, 
    premiumStatus 
  } = useFortiMindPremium('ai_chat');

  const handleTestFeature = async () => {
    try {
      await incrementUsage('ai_chat');
      alert('Función premium utilizada correctamente!');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al usar función premium');
    }
  };

  const handleCheckAllFeatures = async () => {
    try {
      const features = await PremiumFeaturesService.getAvailableFeatures();
      console.log('Funciones disponibles:', features);
      alert(`Funciones disponibles: ${features.available.length} premium, ${features.limited.length} limitadas, ${features.locked.length} bloqueadas`);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="premium-test-container p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🧪 Prueba de Funciones Premium</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Estado Premium */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Estado Premium</h2>
          <div className="space-y-2">
            <p><strong>Usuario Premium:</strong> {isPremium ? '✅ Sí' : '❌ No'}</p>
            {featureAccess && (
              <>
                <p><strong>Puede acceder:</strong> {featureAccess.canAccess ? '✅ Sí' : '❌ No'}</p>
                <p><strong>Usos actuales:</strong> {featureAccess.currentUsage || 0}</p>
                <p><strong>Límite:</strong> {featureAccess.limit || 'Ilimitado'}</p>
                <p><strong>Restantes:</strong> {featureAccess.remaining || 'Ilimitado'}</p>
              </>
            )}
          </div>
        </div>

        {/* Acciones de Prueba */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Acciones de Prueba</h2>
          <div className="space-y-3">
            <button 
              onClick={handleTestFeature}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Probar Función Premium
            </button>
            <button 
              onClick={handleCheckAllFeatures}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Verificar Todas las Funciones
            </button>
          </div>
        </div>
      </div>

      {/* Prueba de Funciones Premium */}
      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold">Pruebas de Funciones Específicas</h2>
        
        {/* Chat con IA */}
        <FortiMindPremiumFeature featureId="ai_chat">
          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 dark:text-green-200">✅ Chat con IA - Acceso Permitido</h3>
            <p className="text-green-700 dark:text-green-300">Esta función está disponible para usuarios premium</p>
          </div>
        </FortiMindPremiumFeature>

        {/* Retos de 30 días */}
        <FortiMindPremiumFeature featureId="challenges_30_days">
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">✅ Retos de 30 Días - Acceso Permitido</h3>
            <p className="text-blue-700 dark:text-blue-300">Acceso completo a retos de 30 días</p>
          </div>
        </FortiMindPremiumFeature>

        {/* Múltiples hábitos */}
        <FortiMindPremiumFeature featureId="multiple_habits_goals">
          <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 dark:text-purple-200">✅ Múltiples Hábitos - Acceso Permitido</h3>
            <p className="text-purple-700 dark:text-purple-300">Puedes crear múltiples hábitos y metas</p>
          </div>
        </FortiMindPremiumFeature>

        {/* Meditaciones */}
        <FortiMindPremiumFeature featureId="unlimited_meditation">
          <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 dark:text-orange-200">✅ Meditaciones - Acceso Permitido</h3>
            <p className="text-orange-700 dark:text-orange-300">Acceso completo a sesiones de meditación</p>
          </div>
        </FortiMindPremiumFeature>

        {/* Análisis AI del diario */}
        <FortiMindPremiumFeature featureId="ai_diary_analysis">
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 dark:text-red-200">✅ Análisis AI del Diario - Acceso Permitido</h3>
            <p className="text-red-700 dark:text-red-300">Análisis automático de tu día por IA</p>
          </div>
        </FortiMindPremiumFeature>

        {/* Estadísticas avanzadas */}
        <FortiMindPremiumFeature featureId="advanced_statistics">
          <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-800 dark:text-indigo-200">✅ Estadísticas Avanzadas - Acceso Permitido</h3>
            <p className="text-indigo-700 dark:text-indigo-300">Análisis detallado por categorías</p>
          </div>
        </FortiMindPremiumFeature>
      </div>

      {/* Información de Debug */}
      {premiumStatus && (
        <div className="mt-8 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Información de Debug</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(premiumStatus, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PremiumTestComponent; 