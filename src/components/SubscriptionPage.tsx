import React, { useState, useEffect } from 'react';
import { Star, Check, CreditCard, Shield, TestTube, AlertCircle, Zap, Sparkles, Crown } from 'lucide-react';
import { PAYPAL_CONFIG, getPayPalSDKUrl } from '../config/paypal';

declare global {
  interface Window {
    paypal?: any;
  }
}

const SubscriptionPage: React.FC = () => {
  const [isPayPalLoaded, setIsPayPalLoaded] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayPalSDK();
  }, []);

  useEffect(() => {
    if (isPayPalLoaded) {
      initializePayPalButtons();
    }
  }, [selectedPlan, isPayPalLoaded]);

  const loadPayPalSDK = () => {
    console.log('Loading PayPal SDK for subscription page...');
    
    if (window.paypal) {
      console.log('PayPal SDK already loaded');
      setIsPayPalLoaded(true);
      setIsLoading(false);
      return;
    }

    const script = document.createElement('script');
    script.src = getPayPalSDKUrl();
    script.onload = () => {
      console.log('PayPal SDK loaded successfully');
      setIsPayPalLoaded(true);
      setIsLoading(false);
    };
    script.onerror = () => {
      console.error('Failed to load PayPal SDK');
      setError('Failed to load PayPal SDK');
      setIsLoading(false);
    };
    document.head.appendChild(script);
  };

  const initializePayPalButtons = () => {
    console.log('Initializing PayPal buttons...');
    
    if (!window.paypal) {
      setError('PayPal SDK not available');
      return;
    }

    const container = document.getElementById('paypal-subscription-container');
    if (!container) {
      setError('PayPal container not found');
      return;
    }

    container.innerHTML = '';
    const planId = selectedPlan === 'monthly' ? PAYPAL_CONFIG.PLANS.MONTHLY : PAYPAL_CONFIG.PLANS.YEARLY;
    
    console.log(`Using plan ID: ${planId} for ${selectedPlan} plan`);

    try {
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'black',
          layout: 'vertical',
          label: 'subscribe',
          height: 50
        },
        createSubscription: function(data: any, actions: any) {
          console.log('Creating subscription with plan:', planId);
          return actions.subscription.create({
            'plan_id': planId,
            'application_context': {
              'brand_name': 'FortiMind',
              'locale': 'en-US',
              'shipping_preference': 'NO_SHIPPING',
              'user_action': 'SUBSCRIBE_NOW',
              'return_url': `${window.location.origin}/#/subscription/success`,
              'cancel_url': `${window.location.origin}/#/subscription/cancel`
            }
          });
        },
        onApprove: function(data: any, actions: any) {
          console.log('Subscription approved:', data);
          window.location.href = `/#/subscription/success?subscriptionID=${data.subscriptionID}`;
        },
        onError: function(err: any) {
          console.error('PayPal error:', err);
          setError('Payment failed. Please try again.');
        },
        onCancel: function(data: any) {
          console.log('Payment cancelled:', data);
        }
      }).render('#paypal-subscription-container');
      
      console.log('PayPal buttons rendered successfully');
    } catch (error: any) {
      console.error('Error rendering PayPal buttons:', error);
      setError(`Error rendering PayPal buttons: ${error.message}`);
    }
  };

  const features = [
    { icon: <Zap size={20} />, text: 'Unlimited AI coaching sessions', premium: true },
    { icon: <Sparkles size={20} />, text: 'Advanced workout programs', premium: true },
    { icon: <Crown size={20} />, text: 'Personalized nutrition plans', premium: true },
    { icon: <Shield size={20} />, text: 'Priority customer support', premium: true },
    { icon: <Star size={20} />, text: 'Advanced analytics and insights', premium: true },
    { icon: <Check size={20} />, text: 'Custom goal tracking', premium: false },
    { icon: <Check size={20} />, text: 'Premium content library', premium: true },
    { icon: <Check size={20} />, text: 'No ads experience', premium: true }
  ];

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      {/* Fondo animado abstracto */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-magenta-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Crown className="text-yellow-400 mr-3 animate-pulse" size={32} />
            <h1 className="text-4xl md:text-6xl font-futuristic text-glow-cyan">
              GO PREMIUM
            </h1>
            <Crown className="text-yellow-400 ml-3 animate-pulse" size={32} />
          </div>
          <p className="text-xl md:text-2xl text-secondary mb-6 font-futuristic-light">
            Desbloquea el potencial completo de FortiMind
          </p>
          
          {/* Warning de sandbox */}
          <div className="glassmorphism glow-yellow max-w-md mx-auto p-4 mb-8">
            <div className="flex items-center justify-center mb-2">
              <TestTube className="text-yellow-400 mr-2" size={20} />
              <span className="font-futuristic text-yellow-400 text-sm">MODO SANDBOX</span>
            </div>
            <p className="text-sm text-muted">
              Entorno de prueba - sin cargos reales
            </p>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <div className={`card-futuristic transition-all duration-300 cursor-pointer ${
            selectedPlan === 'monthly' ? 'glow-cyan border-cyan-400' : 'hover:glow-blue'
          }`} onClick={() => setSelectedPlan('monthly')}>
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <Zap className="text-cyan-400 mr-2" size={24} />
                <h3 className="text-2xl font-futuristic text-cyan-400">MENSUAL</h3>
              </div>
              <div className="text-5xl font-futuristic text-glow-cyan mb-2">$9.99</div>
              <p className="text-muted font-futuristic-light">por mes</p>
            </div>
            
            <button className={`w-full py-4 px-6 rounded-xl font-futuristic transition-all duration-300 ${
              selectedPlan === 'monthly'
                ? 'btn-futuristic glow-cyan'
                : 'glass-card text-primary hover:glow-blue border border-blue-400'
            }`}>
              {selectedPlan === 'monthly' ? 'SELECCIONADO' : 'SELECCIONAR MENSUAL'}
            </button>
          </div>

          {/* Yearly Plan */}
          <div className={`card-futuristic transition-all duration-300 cursor-pointer relative ${
            selectedPlan === 'yearly' ? 'glow-green border-green-400' : 'hover:glow-yellow'
          }`} onClick={() => setSelectedPlan('yearly')}>
            {/* Badge de ahorro */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <span className="bg-gradient-to-r from-green-400 to-yellow-400 text-black px-4 py-2 rounded-full text-sm font-futuristic glow-green">
                AHORRA 20%
              </span>
            </div>
            
            <div className="text-center mb-6 pt-4">
              <div className="flex items-center justify-center mb-4">
                <Crown className="text-yellow-400 mr-2" size={24} />
                <h3 className="text-2xl font-futuristic text-yellow-400">ANUAL</h3>
              </div>
              <div className="text-5xl font-futuristic text-glow-yellow mb-2">$95.88</div>
              <p className="text-muted font-futuristic-light">por año</p>
              <p className="text-sm text-green-400 mt-1 font-futuristic">($7.99/mes)</p>
            </div>
            
            <button className={`w-full py-4 px-6 rounded-xl font-futuristic transition-all duration-300 ${
              selectedPlan === 'yearly'
                ? 'btn-futuristic-magenta glow-yellow'
                : 'glass-card text-primary hover:glow-yellow border border-yellow-400'
            }`}>
              {selectedPlan === 'yearly' ? 'SELECCIONADO' : 'SELECCIONAR ANUAL'}
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="glassmorphism glow-violet p-8 mb-12 max-w-4xl mx-auto">
          <h3 className="text-3xl font-futuristic text-glow-violet text-center mb-8">
            CARACTERÍSTICAS PREMIUM
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center p-3 glass-card hover:glow-cyan transition-all duration-300 group">
                <div className={`mr-4 p-2 rounded-lg ${
                  feature.premium 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-black'
                } group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <span className="text-primary font-medium group-hover:text-cyan-400 transition-colors duration-300">
                  {feature.text}
                </span>
                {feature.premium && (
                  <div className="ml-auto">
                    <Crown className="text-yellow-400" size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment Section */}
        <div className="glassmorphism glow-magenta p-8 text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <CreditCard className="text-magenta-400 mr-3" size={28} />
            <h3 className="text-2xl font-futuristic text-glow-magenta">
              SUSCRÍBETE CON PAYPAL
            </h3>
          </div>
          
          {error && (
            <div className="mb-6 glassmorphism border border-red-400 glow-magenta p-4 rounded-xl">
              <div className="flex items-center justify-center">
                <AlertCircle className="text-red-400 mr-3" size={20} />
                <span className="text-red-400 font-medium">{error}</span>
              </div>
            </div>
          )}
          
          <p className="text-muted mb-8 font-futuristic-light">
            Procesamiento de pago seguro y cifrado
          </p>
          
          {isLoading ? (
            <div className="max-w-md mx-auto py-8">
              <div className="glassmorphism h-16 rounded-xl mb-4 animate-pulse glow-cyan"></div>
              <p className="text-sm text-muted font-futuristic">CARGANDO PAYPAL...</p>
            </div>
          ) : (
            <div id="paypal-subscription-container" className="max-w-md mx-auto min-h-[60px] glassmorphism p-6 rounded-xl glow-blue"></div>
          )}
          
          <div className="mt-8 flex items-center justify-center text-sm text-muted">
            <Shield className="mr-2 text-green-400" size={20} />
            <span className="font-futuristic-light">SEGURO • CANCELA EN CUALQUIER MOMENTO</span>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted font-futuristic-light mb-4">
            ¿Listo para transformar tu mente y cuerpo?
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="text-cyan-400 animate-pulse" size={20} />
            <span className="font-futuristic text-glow-cyan">
              SÉ DISCIPLINADO. SÉ MÁS FUERTE. SÉ FORTIMIND.
            </span>
            <Sparkles className="text-cyan-400 animate-pulse" size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
