import React from 'react';
import { Check, Star, Zap, Crown } from 'lucide-react';
import PayPalSubscriptionButton from './PayPalSubscriptionButton';

interface PricingCardProps {
  plan: 'free' | 'premium_monthly' | 'premium_yearly';
  isPopular?: boolean;
  onSubscribe?: (planType: string) => void;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  plan, 
  isPopular = false, 
  onSubscribe 
}) => {
  const plans = {
    free: {
      name: 'Plan Gratuito',
      price: '$0',
      period: '/siempre',
      description: 'Perfecto para empezar',
      features: [
        '✅ Acceso básico a la app',
        '✅ 3 hábitos y 3 metas',
        '✅ 3 sesiones de meditación',
        '✅ 10 días de retos',
        '❌ Chat con IA',
        '❌ Análisis AI del diario',
        '❌ Resúmenes semanales/mensuales',
        '❌ Estadísticas avanzadas',
        '❌ Contenido exclusivo'
      ],
      color: 'from-gray-400 to-gray-600',
      icon: Star,
      buttonText: 'Empezar Gratis',
      buttonVariant: 'secondary' as const
    },
    premium_monthly: {
      name: 'Plan Premium',
      price: '$4.99',
      period: '/mes',
      description: 'Acceso completo a todas las funciones',
      features: [
        '✅ Chat con IA ilimitado',
        '✅ Retos completos de 30 días',
        '✅ Hábitos y metas ilimitados',
        '✅ Análisis AI del diario',
        '✅ Resúmenes semanales/mensuales',
        '✅ Meditaciones ilimitadas',
        '✅ Estadísticas avanzadas',
        '✅ Contenido exclusivo',
        '✅ Personalización extra'
      ],
      color: 'from-blue-500 to-purple-600',
      icon: Crown,
      buttonText: 'Suscribirse Mensual',
      buttonVariant: 'primary' as const
    },
    premium_yearly: {
      name: 'Plan Anual',
      price: '$39.99',
      period: '/año',
      description: 'El mejor valor',
      features: [
        '✅ Chat con IA ilimitado',
        '✅ Retos completos de 30 días',
        '✅ Hábitos y metas ilimitados',
        '✅ Análisis AI del diario',
        '✅ Resúmenes semanales/mensuales',
        '✅ Meditaciones ilimitadas',
        '✅ Estadísticas avanzadas',
        '✅ Contenido exclusivo',
        '✅ Personalización extra',
        '🎁 33% de descuento'
      ],
      color: 'from-green-500 to-emerald-600',
      icon: Zap,
      buttonText: 'Suscribirse Anual',
      buttonVariant: 'primary' as const,
      savings: '¡Ahorra $19.89 al año!'
    }
  };

  const planConfig = plans[plan];
  const IconComponent = planConfig.icon;

  return (
    <div className={`
      relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 hover:shadow-2xl
      ${isPopular 
        ? 'border-blue-400 dark:border-blue-500 transform scale-105' 
        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
      }
    `}>
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
          ⭐ Más Popular
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className={`
            p-3 rounded-full bg-gradient-to-r ${planConfig.color} text-white
          `}>
            <IconComponent className="w-8 h-8" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {planConfig.name}
        </h3>
        <div className="flex flex-col items-center justify-center mb-2">
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              {planConfig.price}
            </span>
            <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">
              {planConfig.period}
            </span>
          </div>
          {/* Etiqueta de prueba gratuita solo en premium */}
          {(plan === 'premium_monthly' || plan === 'premium_yearly') && (
            <div className="mt-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs font-semibold px-3 py-1 rounded-full inline-block shadow-sm">
              7 días de prueba gratuita
            </div>
          )}
        </div>
        {/* Ahorro solo en anual */}
        {plan === 'premium_yearly' && 'savings' in planConfig && planConfig.savings && (
          <div className="text-green-600 dark:text-green-400 font-semibold text-sm mb-2">
            {planConfig.savings}
          </div>
        )}
        <p className="text-gray-600 dark:text-gray-300 mt-3">
          {planConfig.description}
        </p>
      </div>

      {/* Features */}
      <div className="mb-8">
        <ul className="space-y-3">
          {planConfig.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Button */}
      <div className="mt-auto">
        {plan === 'free' ? (
          <button 
            className="w-full bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors text-lg shadow-md"
            onClick={() => onSubscribe?.('free')}
          >
            {planConfig.buttonText}
          </button>
        ) : (
          <div className="w-full flex flex-col items-center">
            <PayPalSubscriptionButton
              planType={plan as 'premium_monthly' | 'premium_yearly'}
              className="w-full"
              onSuccess={(subscriptionId: string) => {
                console.log(`Subscription created: ${subscriptionId}`);
                onSubscribe?.(plan);
              }}
              onError={(error: string) => {
                console.error('Subscription error:', error);
              }}
            />
          </div>
        )}
      </div>

      {/* Security info */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Pago seguro</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Cancelación fácil</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCard; 