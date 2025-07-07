import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import PricingCard from './PricingCard';
import SubscriptionBanner from './SubscriptionBanner';
import FloatingSubscriptionButton from './FloatingSubscriptionButton';

interface SubscriptionStatus {
  isActive: boolean;
  planType?: string;
  expiresAt?: string;
}

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga del estado de suscripción
    setTimeout(() => {
      setSubscriptionStatus({
        isActive: false,
        planType: undefined,
        expiresAt: undefined
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSubscribe = (planType: string) => {
    if (planType === 'free') {
      navigate('/dashboard');
    } else {
      console.log(`Usuario se suscribió al plan: ${planType}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="subscription-page min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Banner de suscripción */}
        <SubscriptionBanner 
          variant="premium" 
          position="top"
          className="mb-8"
        />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {subscriptionStatus?.isActive ? 'Tu Suscripción Premium' : 'Elige tu Plan Premium'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            {subscriptionStatus?.isActive 
              ? 'Disfruta de todas las funciones premium de FortiMind'
              : 'Desbloquea todo el potencial de FortiMind con nuestros planes premium'
            }
          </p>
          
          {subscriptionStatus?.isActive && (
            <div className="inline-block bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-4 py-2 rounded-full font-medium">
              ✅ Suscripción activa hasta {subscriptionStatus.expiresAt}
            </div>
          )}
        </div>

        {/* Planes de suscripción */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <PricingCard 
            plan="free" 
            onSubscribe={handleSubscribe}
          />
          <PricingCard 
            plan="premium_monthly" 
            isPopular={true}
            onSubscribe={handleSubscribe}
          />
          <PricingCard 
            plan="premium_yearly" 
            onSubscribe={handleSubscribe}
          />
        </div>

        {/* Características premium */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            ¿Por qué elegir FortiMind Premium?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Chat con IA Ilimitado
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Acceso ilimitado a mentoría personalizada con DeepSeek y Gemini
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏃‍♂️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Retos Completos
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Retos personalizados de 30 días para ejercicio y nutrición
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Análisis AI Avanzado
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Análisis profundo de tu diario y resúmenes personalizados
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧘‍♀️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Meditaciones Ilimitadas
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Acceso completo a sesiones de meditación guiada
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Estadísticas Avanzadas
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Análisis detallado de tu progreso y comparaciones
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Contenido Exclusivo
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ebooks, recursos premium y contenido exclusivo
              </p>
            </div>
          </div>
        </div>

        {/* Testimonios */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 mb-16 text-white">
          <h2 className="text-3xl font-bold text-center mb-12">
            Lo que dicen nuestros usuarios premium
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h4 className="font-semibold">María G.</h4>
                  <p className="text-sm opacity-80">Usuario Premium</p>
                </div>
              </div>
              <p className="text-sm">
                "El chat con IA me ha ayudado increíblemente. Los retos de 30 días son perfectos para mantener la motivación."
              </p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h4 className="font-semibold">Carlos R.</h4>
                  <p className="text-sm opacity-80">Usuario Premium</p>
                </div>
              </div>
              <p className="text-sm">
                "Los análisis AI del diario me han dado insights increíbles sobre mi progreso emocional."
              </p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h4 className="font-semibold">Ana L.</h4>
                  <p className="text-sm opacity-80">Usuario Premium</p>
                </div>
              </div>
              <p className="text-sm">
                "Las meditaciones ilimitadas y el contenido exclusivo han transformado mi rutina diaria."
              </p>
            </div>
          </div>
        </div>

        {/* CTA final */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ¿Listo para transformar tu bienestar mental?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Únete a miles de usuarios que ya han mejorado su vida con FortiMind Premium
          </p>
          
          <div className="flex justify-center space-x-4">
            <PricingCard 
              plan="premium_monthly" 
              onSubscribe={handleSubscribe}
            />
            <PricingCard 
              plan="premium_yearly" 
              onSubscribe={handleSubscribe}
            />
          </div>
        </div>
      </div>

      {/* Botón flotante */}
      <FloatingSubscriptionButton 
        variant="premium" 
        position="bottom-right"
      />
    </div>
  );
};

export default SubscriptionPage; 