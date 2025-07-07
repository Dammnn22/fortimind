import React from 'react';
import { Crown, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePremiumFeatures } from '../hooks/usePremiumFeatures';

interface SubscriptionStatusDisplayProps {
  showDetails?: boolean;
  onUpgradeClick?: () => void;
  className?: string;
}

/**
 * Component to display user's subscription status in the profile
 */
export const SubscriptionStatusDisplay: React.FC<SubscriptionStatusDisplayProps> = ({
  showDetails = true,
  onUpgradeClick,
  className = ''
}) => {
  const { user } = useAuth();
  const { 
    subscriptionStatus, 
    loading, 
    error, 
    refreshSubscription,
    isPremium
  } = usePremiumFeatures(user);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 p-4 rounded-lg ${className}`}>
        <div className="flex items-center">
          <RefreshCw className="w-4 h-4 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-600 dark:text-gray-400">Verificando suscripción...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-300 font-medium">Error de suscripción</span>
          </div>
          <button
            onClick={refreshSubscription}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        {showDetails && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
        )}
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Crown className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-blue-700 dark:text-blue-300 font-medium">Plan Gratuito</span>
          </div>
          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-lg transition-colors"
            >
              Actualizar
            </button>
          )}
        </div>
        {showDetails && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            Actualiza a Premium para acceder a todas las funciones
          </p>
        )}
      </div>
    );
  }

  // Premium user
  const getStatusColor = () => {
    switch (subscriptionStatus?.status) {
      case 'active':
        return 'green';
      case 'suspended':
      case 'expired':
        return 'red';
      default:
        return 'yellow';
    }
  };

  const getStatusIcon = () => {
    switch (subscriptionStatus?.status) {
      case 'active':
        return <CheckCircle className="w-5 h-5" />;
      case 'suspended':
      case 'expired':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getStatusText = () => {
    switch (subscriptionStatus?.status) {
      case 'active':
        return 'Premium Activo';
      case 'suspended':
        return 'Premium Suspendido';
      case 'expired':
        return 'Premium Expirado';
      case 'inactive':
        return 'Premium Inactivo';
      default:
        return 'Estado Desconocido';
    }
  };

  const statusColor = getStatusColor();
  const bgColor = `bg-${statusColor}-50 dark:bg-${statusColor}-900/20`;
  const borderColor = `border-${statusColor}-200 dark:border-${statusColor}-800`;
  const textColor = `text-${statusColor}-700 dark:text-${statusColor}-300`;
  const iconColor = `text-${statusColor}-500`;

  return (
    <div className={`${bgColor} border ${borderColor} p-4 rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={iconColor}>
            {getStatusIcon()}
          </div>
          <span className={`${textColor} font-medium ml-2`}>
            {getStatusText()}
          </span>
        </div>
        
        <button
          onClick={refreshSubscription}
          className={`${textColor} hover:opacity-70 transition-opacity`}
          title="Actualizar estado"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {showDetails && subscriptionStatus && (
        <div className="mt-3 space-y-2 text-sm">
          {subscriptionStatus.activatedAt && (
            <div className={`${textColor} flex justify-between`}>
              <span>Activado:</span>
              <span>{subscriptionStatus.activatedAt.toLocaleDateString()}</span>
            </div>
          )}
          
          {subscriptionStatus.lastPaymentAt && (
            <div className={`${textColor} flex justify-between`}>
              <span>Último pago:</span>
              <span>{subscriptionStatus.lastPaymentAt.toLocaleDateString()}</span>
            </div>
          )}
          
          {subscriptionStatus.paypalSubscriptionId && (
            <div className={`${textColor} flex justify-between`}>
              <span>ID PayPal:</span>
              <span className="font-mono text-xs">
                {subscriptionStatus.paypalSubscriptionId.slice(-8)}
              </span>
            </div>
          )}

          {subscriptionStatus.needsReview && (
            <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded">
              <div className="flex items-center text-yellow-700 dark:text-yellow-300">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Requiere atención</span>
              </div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                {subscriptionStatus.reviewReason || 'Verifica tu método de pago'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatusDisplay;
