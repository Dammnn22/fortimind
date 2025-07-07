import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import PayPalSubscriptionButton from './PayPalSubscriptionButton';

interface PremiumFeatureProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  children,
  fallback,
  showUpgradePrompt = true
}) => {
  const { user, loading } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) {
        setIsPremium(false);
        setCheckingPremium(false);
        return;
      }

      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsPremium(userData.isPremium || false);
        } else {
          setIsPremium(false);
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
        setIsPremium(false);
      } finally {
        setCheckingPremium(false);
      }
    };

    checkPremiumStatus();
  }, [user]);

  // Mostrar loading mientras se verifica el estado premium
  if (loading || checkingPremium) {
    return (
      <div className="premium-feature-loading">
        <div className="loading-spinner">Cargando...</div>
      </div>
    );
  }

  // Si el usuario es premium, mostrar el contenido
  if (isPremium) {
    return <>{children}</>;
  }

  // Si no es premium y se debe mostrar el prompt de actualización
  if (showUpgradePrompt) {
    return (
      <div className="premium-feature-upgrade">
        <div className="upgrade-content">
          <div className="upgrade-icon">⭐</div>
          <h3>Función Premium</h3>
          <p>Esta función está disponible solo para usuarios premium.</p>
          
          {user ? (
            <div className="upgrade-options">
              <PayPalSubscriptionButton
                planType="monthly"
                onSuccess={(subscriptionId) => {
                  console.log('Subscription created:', subscriptionId);
                  // Recargar la página o actualizar el estado
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

export default PremiumFeature; 