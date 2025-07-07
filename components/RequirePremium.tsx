import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePremiumFeatures } from '../hooks/usePremiumFeatures';
import { useNavigate } from 'react-router-dom';

interface RequirePremiumProps {
  children: React.ReactNode;
  customMessage?: string;
  showBothPlans?: boolean;
  featureName?: string;
}

const RequirePremium: React.FC<RequirePremiumProps> = ({ 
  children, 
  customMessage
}) => {
  const { user, loading } = useAuth();
  const { 
    isPremium, 
    loading: premiumLoading, 
    error 
  } = usePremiumFeatures(user);
  const navigate = useNavigate();

  if (loading || premiumLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">Verificando acceso premium...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <span className="text-red-600 dark:text-red-400 font-semibold mb-4">{error}</span>
        <button
          className="px-6 py-2 rounded-lg bg-primary text-white font-bold mt-2"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Show error if there's an issue checking subscription
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Error de Suscripción</span>
        <span className="text-gray-700 dark:text-gray-200 mb-6 text-center max-w-md">
          {error}
        </span>
        <button
          className="px-6 py-2 rounded-lg bg-red-600 text-white font-bold mt-2 shadow hover:bg-red-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="text-xl font-bold text-primary dark:text-primary-light mb-4">Función Premium</span>
        <span className="text-gray-700 dark:text-gray-200 mb-6 text-center max-w-md">
          {customMessage || 'Esta función es solo para suscriptores premium. Actualiza tu cuenta para acceder a todas las funciones.'}
        </span>
        <button
          className="px-6 py-2 rounded-lg bg-primary text-white font-bold mt-2 shadow hover:bg-primary-dark transition-colors"
          onClick={() => navigate('/subscription')}
        >
          Actualizar a Premium
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequirePremium;