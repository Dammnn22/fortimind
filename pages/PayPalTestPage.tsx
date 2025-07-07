import React from 'react';
import PayPalTestComponent from '../components/PayPalTestComponent';

const PayPalTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🧪 Pruebas PayPal Sandbox - FortiMind
          </h1>
          <p className="mt-2 text-gray-600">
            Página de prueba para verificar la integración con PayPal en modo sandbox
          </p>
        </div>

        <div className="grid gap-6">
          <PayPalTestComponent />
          
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Instrucciones de Prueba
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-medium text-blue-900">1. Crear Suscripción</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Haz clic en "Crear Suscripción PayPal" para generar una nueva suscripción.
                  Se abrirá una ventana con PayPal Sandbox para completar el pago.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <h4 className="font-medium text-green-900">2. Datos de Prueba PayPal</h4>
                <div className="text-sm text-green-700 mt-1 space-y-1">
                  <p><strong>Email:</strong> sb-buyer@business.example.com</p>
                  <p><strong>Contraseña:</strong> password123</p>
                  <p><strong>Tarjeta de Prueba:</strong> 4032032718926461</p>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-medium text-yellow-900">3. Verificar Estado</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Después de completar el pago en PayPal, usa "Verificar Estado" para 
                  confirmar que tu suscripción está activa.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                <h4 className="font-medium text-purple-900">4. Webhook Testing</h4>
                <p className="text-sm text-purple-700 mt-1">
                  Los webhooks de PayPal actualizarán automáticamente tu estado premium
                  cuando completes el pago.
                </p>
                <p className="text-sm text-purple-700 mt-1">
                  <strong>Webhook URL:</strong> https://us-central1-fortimind.cloudfunctions.net/paypalSubscriptionWebhook
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔧 Estado de Funciones Deployadas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-sm font-medium text-green-900">✅ callDeepSeek</div>
                <div className="text-xs text-green-700">API IA DeepSeek</div>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-sm font-medium text-green-900">✅ callGemini</div>
                <div className="text-xs text-green-700">API IA Gemini</div>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-sm font-medium text-green-900">✅ createPayPalSubscription</div>
                <div className="text-xs text-green-700">Crear suscripciones PayPal</div>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-sm font-medium text-green-900">✅ paypalSubscriptionWebhook</div>
                <div className="text-xs text-green-700">Webhook PayPal moderno</div>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-sm font-medium text-green-900">✅ getSubscriptionStatusAPI</div>
                <div className="text-xs text-green-700">Estado de suscripción</div>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-sm font-medium text-green-900">✅ paypalWebhook</div>
                <div className="text-xs text-green-700">Webhook PayPal legacy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayPalTestPage;
