import React, { useState } from 'react';
import { Star, X, Crown, Zap } from 'lucide-react';

interface FloatingSubscriptionButtonProps {
  variant?: 'premium' | 'upgrade' | 'trial';
  position?: 'bottom-right' | 'bottom-left' | 'top-right';
  className?: string;
}

const FloatingSubscriptionButton: React.FC<FloatingSubscriptionButtonProps> = ({
  variant = 'premium',
  position = 'bottom-right',
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const variants = {
    premium: {
      icon: Crown,
      text: 'Premium',
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'from-purple-600 to-pink-600'
    },
    upgrade: {
      icon: Star,
      text: 'Upgrade',
      color: 'from-blue-500 to-cyan-500',
      hoverColor: 'from-blue-600 to-cyan-600'
    },
    trial: {
      icon: Zap,
      text: 'Prueba',
      color: 'from-green-500 to-emerald-500',
      hoverColor: 'from-green-600 to-emerald-600'
    }
  };

  const config = variants[variant];
  const IconComponent = config.icon;

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4'
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      {/* Expanded card */}
      {isExpanded && (
        <div className="mb-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-xs sm:max-w-sm md:w-80 border border-gray-200 dark:border-slate-700 overflow-y-auto max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              ¡Desbloquea FortiMind Premium!
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <Crown className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Chat con IA ilimitado</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Mentoría personalizada 24/7</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
              <Zap className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Retos completos de 30 días</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Ejercicio y nutrición personalizados</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
              <Star className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Análisis AI del diario</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Insights personalizados</p>
              </div>
            </div>
          </div>

          <div className="mt-2 text-center">
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
              🎁 7 días de prueba gratuita <span className="mx-1">•</span> Cancelación fácil
            </p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          relative group bg-gradient-to-r ${config.color} hover:${config.hoverColor}
          text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300
          hover:scale-110 active:scale-95
        `}
      >
        <IconComponent className="w-6 h-6" />
        
        {/* Pulse animation */}
        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          {config.text} FortiMind
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </button>
    </div>
  );
};

export default FloatingSubscriptionButton; 