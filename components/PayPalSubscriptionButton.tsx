import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CreditCard, Lock, CheckCircle, Loader2 } from 'lucide-react';

interface PayPalSubscriptionButtonProps {
  planType?: 'premium_monthly' | 'premium_yearly';
  className?: string;
  onSuccess?: (subscriptionId: string) => void;
  onError?: (error: string) => void;
}

const PayPalSubscriptionButton: React.FC<PayPalSubscriptionButtonProps> = ({
  planType = 'premium_monthly',
  className = '',
  onSuccess,
  onError
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const plans = {
    premium_monthly: {
      name: 'Premium Mensual',
      price: '$4.99/mes',
      description: 'Acceso completo a todas las funciones premium',
      trialDays: 7,
      originalPrice: 4.99
    },
    premium_yearly: {
      name: 'Premium Anual',
      price: '$39.99/año',
      description: 'Acceso completo a todas las funciones premium (33% descuento)',
      trialDays: 7,
      originalPrice: 59.88,
      savings: 19.89
    }
  };

  const selectedPlan = plans[planType as keyof typeof plans] || plans.premium_monthly;

  const handleSubscribe = async () => {
    if (!user) {
      onError?.('Debes iniciar sesión para suscribirte');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://us-central1-fortimind-ai.cloudfunctions.net/createPayPalSubscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          planType: planType === 'premium_yearly' ? 'yearly' : 'monthly',
          userEmail: user.email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Error al crear la suscripción');
      }

      const data = await response.json();
      
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        onSuccess?.(data.subscriptionId);
      }
    } catch (error) {
      console.error('Error:', error);
      onError?.(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="paypal-subscription-container">
      <button
        onClick={handleSubscribe}
        disabled={isLoading}
        className={`
          relative w-full group overflow-hidden rounded-xl font-semibold transition-all duration-300
          ${planType === 'premium_yearly' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
          }
          ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
          ${className}
        `}
      >
        {/* Background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Content */}
        <div className="relative flex items-center justify-center space-x-3 py-4 px-6">
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <Lock className="w-4 h-4 opacity-80" />
              </div>
              <span className="font-bold">
                {planType === 'premium_yearly' ? 'Suscribirse Anual' : 'Suscribirse Mensual'}
              </span>
            </>
          )}
        </div>

        {/* Trial info overlay */}
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-md">
          {selectedPlan.trialDays} días gratis
        </div>
      </button>

      {/* Plan details */}
      <div className="mt-3 text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold">{selectedPlan.price}</span>
          {planType === 'premium_yearly' && (
            <span className="block text-green-600 dark:text-green-400 text-xs">
              ¡Ahorra ${plans.premium_yearly.savings.toFixed(2)} al año!
            </span>
          )}
        </div>
        
        {/* Security badges */}
        <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Lock className="w-3 h-3" />
            <span>Pago seguro</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Cancelación fácil</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayPalSubscriptionButton;