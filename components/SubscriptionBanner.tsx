import React, { useState } from 'react';
import { X, Crown, Star, Zap, CheckCircle } from 'lucide-react';
import PayPalSubscriptionButton from './PayPalSubscriptionButton';

interface SubscriptionBannerProps {
  variant?: 'premium' | 'trial' | 'upgrade';
  position?: 'top' | 'bottom';
  dismissible?: boolean;
  className?: string;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({
  variant = 'premium',
  position = 'top',
  dismissible = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const variants = {
    premium: {
      title: '🚀 Desbloquea FortiMind Premium',
      subtitle: 'Accede a todas las funciones avanzadas',
      color: 'from-purple-500 to-pink-500',
      icon: Crown,
      features: [
        'Chat con IA ilimitado',
        'Retos completos de 30 días',
        'Análisis AI del diario'
      ]
    },
    trial: {
      title: '🎁 Prueba Premium Gratis',
      subtitle: '7 días de acceso completo sin compromiso',
      color: 'from-green-500 to-emerald-500',
      icon: Star,
      features: [
        'Sin tarjeta de crédito',
        'Cancelación en cualquier momento',
        'Acceso completo inmediato'
      ]
    },
    upgrade: {
      title: '⭐ Mejora tu Experiencia',
      subtitle: 'Lleva tu bienestar mental al siguiente nivel',
      color: 'from-blue-500 to-cyan-500',
      icon: Zap,
      features: [
        'Funciones ilimitadas',
        'Contenido exclusivo',
        'Soporte prioritario'
      ]
    }
  };

  const config = variants[variant];
  const IconComponent = config.icon;

  if (!isVisible) return null;

  return (
    <div className={`
      relative bg-gradient-to-r ${config.color} text-white p-4 shadow-lg
      ${position === 'top' ? 'mb-6' : 'mt-6'}
      ${className}
    `}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
      </div>

      <div className="relative flex items-center justify-between">
        {/* Content */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="p-2 bg-white/20 rounded-full">
              <IconComponent className="w-6 h-6" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">
              {config.title}
            </h3>
            <p className="text-sm opacity-90 mb-2">
              {config.subtitle}
            </p>
            
            {/* Features */}
            <div className="flex items-center space-x-4 text-xs">
              {config.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <PayPalSubscriptionButton
              planType="premium_monthly"
              className="w-full"
              onSuccess={(subscriptionId: string) => {
                console.log('Monthly subscription created:', subscriptionId);
                setIsVisible(false);
              }}
              onError={(error: string) => {
                console.error('Subscription error:', error);
              }}
            />
            
            <PayPalSubscriptionButton
              planType="premium_yearly"
              className="w-full"
              onSuccess={(subscriptionId: string) => {
                console.log('Yearly subscription created:', subscriptionId);
                setIsVisible(false);
              }}
              onError={(error: string) => {
                console.error('Subscription error:', error);
              }}
            />
          </div>

          {dismissible && (
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 text-white/70 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Trial info */}
      <div className="mt-3 pt-3 border-t border-white/20">
        <div className="flex items-center justify-center space-x-4 text-xs opacity-90">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>7 días de prueba gratuita</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Cancelación fácil</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Pago seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBanner; 