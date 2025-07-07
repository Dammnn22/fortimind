import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import PremiumFeaturesService, { PremiumFeature } from '../services/premiumFeatures';
import PayPalSubscriptionButton from './PayPalSubscriptionButton';

interface FortiMindPremiumFeatureProps {
  featureId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  onLimitReached?: () => void;
  className?: string;
}

const FortiMindPremiumFeature: React.FC<FortiMindPremiumFeatureProps> = ({
  featureId,
  children,
  fallback,
  showUpgradePrompt = true,
  onLimitReached,
  className = ''
}) => {
  const { user, loading } = useAuth();
  const [accessInfo, setAccessInfo] = useState<{
    canAccess: boolean;
    isPremium: boolean;
    currentUsage?: number;
    limit?: number;
    remaining?: number;
  } | null>(null);
  const [feature, setFeature] = useState<PremiumFeature | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setAccessInfo({ canAccess: false, isPremium: false });
        setIsLoading(false);
        return;
      }

      try {
        const access = await PremiumFeaturesService.canAccessFeature(featureId);
        const features = PremiumFeaturesService.getPremiumFeatures();
        const currentFeature = features.find(f => f.id === featureId);
        
        setAccessInfo(access);
        setFeature(currentFeature || null);

        // Si no puede acceder y hay callback, ejecutarlo
        if (!access.canAccess && onLimitReached) {
          onLimitReached();
        }
      } catch (error) {
        console.error('Error checking feature access:', error);
        setAccessInfo({ canAccess: false, isPremium: false });
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [user, featureId, onLimitReached]);

  // Mostrar loading mientras se verifica el acceso
  if (loading || isLoading) {
    return (
      <div className={`fortimind-premium-loading ${className}`}>
        <div className="loading-spinner">Verificando acceso...</div>
      </div>
    );
  }

  // Si el usuario puede acceder, mostrar el contenido
  if (accessInfo?.canAccess) {
    return <>{children}</>;
  }

  // Si no es premium y se debe mostrar el prompt de actualización
  if (showUpgradePrompt && feature) {
    return (
      <div className={`fortimind-premium-upgrade ${className}`}>
        <div className="upgrade-content">
          <div className="feature-header">
            <div className="feature-icon">🔒</div>
            <h3>{feature.name}</h3>
            <p>{feature.description}</p>
          </div>

          {accessInfo && !accessInfo.isPremium && accessInfo.limit && (
            <div className="usage-info">
              <div className="usage-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${((accessInfo.currentUsage || 0) / accessInfo.limit) * 100}%` }}
                  ></div>
                </div>
                <div className="usage-text">
                  {accessInfo.currentUsage || 0} de {accessInfo.limit} usos
                  {accessInfo.remaining && accessInfo.remaining > 0 && (
                    <span className="remaining"> ({accessInfo.remaining} restantes)</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {feature.premiumBenefit && (
            <div className="premium-benefit">
              <h4>Beneficio Premium:</h4>
              <p>{feature.premiumBenefit}</p>
            </div>
          )}

          {user ? (
            <div className="upgrade-options">
              <PayPalSubscriptionButton
                planType="monthly"
                onSuccess={(subscriptionId) => {
                  console.log('Subscription created:', subscriptionId);
                  // Recargar la página para actualizar el estado
                  window.location.reload();
                }}
                onError={(error) => {
                  console.error('Subscription error:', error);
                }}
              />
              
              <div className="plan-comparison">
                <div className="plan">
                  <h4>Mensual</h4>
                  <div className="price">$9.99/mes</div>
                </div>
                <div className="plan featured">
                  <h4>Anual</h4>
                  <div className="price">$99.99/año</div>
                  <div className="savings">¡Ahorra 2 meses!</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="login-required">
              <p>Debes iniciar sesión para acceder a las funciones premium.</p>
              <button className="login-btn">Iniciar Sesión</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Si no se debe mostrar el prompt, mostrar el fallback o nada
  return fallback ? <>{fallback}</> : null;
};

export default FortiMindPremiumFeature; 