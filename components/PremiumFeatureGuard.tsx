import React, { useState, useEffect } from 'react';
import { Crown, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePremiumFeatures } from '../hooks/usePremiumFeatures';

interface PremiumFeatureGuardProps {
  children: React.ReactNode;
  featureName: string;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  onUpgradeClick?: () => void;
  className?: string;
}

/**
 * Component that guards premium features and shows upgrade prompts
 */
export const PremiumFeatureGuard: React.FC<PremiumFeatureGuardProps> = ({
  children,
  featureName,
  fallback,
  showUpgradePrompt = true,
  onUpgradeClick,
  className = ''
}) => {
  const { user } = useAuth();
  const { 
    loading, 
    error, 
    validateFeatureAccess 
  } = usePremiumFeatures(user);
  
  const [canAccess, setCanAccess] = useState<boolean>(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setCanAccess(false);
        setCheckingAccess(false);
        return;
      }

      try {
        setCheckingAccess(true);
        const hasAccess = await validateFeatureAccess(featureName, onUpgradeClick);
        setCanAccess(hasAccess);
      } catch (err) {
        console.error('Error checking feature access:', err);
        setCanAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [user, featureName, validateFeatureAccess, onUpgradeClick]);

  // Show loading state
  if (loading || checkingAccess) {
    return (
      <div className={`flex items-center justify-center p-6 ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-neutral-dark dark:text-neutral-light">
          Verificando acceso...
        </span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`flex items-center justify-center p-6 text-red-600 dark:text-red-400 ${className}`}>
        <AlertCircle className="w-6 h-6 mr-2" />
        <span>Error al verificar suscripción: {error}</span>
      </div>
    );
  }

  // User has access - show the protected content
  if (canAccess) {
    return <>{children}</>;
  }

  // User doesn't have access - show fallback or upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  if (showUpgradePrompt) {
    return (
      <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center ${className}`}>
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-full">
            <Crown className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          Función Premium
        </h3>
        
        <p className="text-yellow-700 dark:text-yellow-300 mb-4">
          Esta función requiere una suscripción Premium para acceder.
        </p>
        
        <div className="space-y-2 mb-6 text-sm text-yellow-600 dark:text-yellow-400">
          <div className="flex items-center justify-center">
            <Crown className="w-4 h-4 mr-2" />
            <span>Acceso a todas las funciones premium</span>
          </div>
          <div className="flex items-center justify-center">
            <Lock className="w-4 h-4 mr-2" />
            <span>Programas avanzados de ejercicio</span>
          </div>
          <div className="flex items-center justify-center">
            <Lock className="w-4 h-4 mr-2" />
            <span>Chat ilimitado con IA</span>
          </div>
        </div>
        
        {onUpgradeClick && (
          <button
            onClick={onUpgradeClick}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Actualizar a Premium
          </button>
        )}
      </div>
    );
  }

  // No access and no upgrade prompt - show locked state
  return (
    <div className={`bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center ${className}`}>
      <Lock className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
      <p className="text-gray-500 dark:text-gray-400 font-medium">
        Función bloqueada
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
        Suscripción Premium requerida
      </p>
    </div>
  );
};

export default PremiumFeatureGuard;
