import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const PayPalTestComponent: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testCreateSubscription = async () => {
    if (!user) {
      setError('Debes estar autenticado para probar PayPal');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Probando con:', {
        userId: user.uid,
        planType: 'premium_monthly',
        functionsUrl: process.env.REACT_APP_FIREBASE_FUNCTIONS_URL
      });

      const response = await fetch(
        `${process.env.REACT_APP_FIREBASE_FUNCTIONS_URL}/createPayPalSubscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.uid,
            planType: 'premium_monthly'
          })
        }
      );

      const responseText = await response.text();
      console.log('Respuesta raw:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      const data = JSON.parse(responseText);
      setResult(data);
      
      // Redirigir a PayPal para completar el pago
      if (data.approvalUrl) {
        window.open(data.approvalUrl, '_blank');
      }
      
    } catch (err: any) {
      console.error('Error completo:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testSubscriptionStatus = async () => {
    if (!user) {
      setError('Debes estar autenticado para probar PayPal');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const idToken = await user.getIdToken();
      
      const response = await fetch(
        `${process.env.REACT_APP_FIREBASE_FUNCTIONS_URL}/getSubscriptionStatusAPI`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.uid,
            idToken
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800">
          Prueba PayPal Sandbox
        </h3>
        <p className="mt-2 text-yellow-700">
          Debes estar autenticado para probar las funciones de PayPal
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🧪 Prueba PayPal Sandbox
      </h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-medium text-blue-900">Información de Usuario</h4>
          <p className="text-sm text-blue-700">
            UID: {user.uid}
          </p>
          <p className="text-sm text-blue-700">
            Email: {user.email}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={testCreateSubscription}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Probando...' : 'Crear Suscripción PayPal'}
          </button>
          
          <button
            onClick={testSubscriptionStatus}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Consultando...' : 'Verificar Estado'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <h4 className="font-medium text-red-900">Error</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h4 className="font-medium text-green-900">Resultado</h4>
            <pre className="text-sm text-green-700 mt-2 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
        <h4 className="font-medium text-gray-900">Información de Prueba</h4>
        <div className="text-sm text-gray-700 space-y-1 mt-2">
          <p><strong>Entorno:</strong> Sandbox</p>
          <p><strong>Cliente ID:</strong> {process.env.REACT_APP_PAYPAL_CLIENT_ID}</p>
          <p><strong>Functions URL:</strong> {process.env.REACT_APP_FIREBASE_FUNCTIONS_URL}</p>
          <p><strong>Usuario autenticado:</strong> {user ? '✅ Sí' : '❌ No'}</p>
          {user && (
            <>
              <p><strong>UID:</strong> {user.uid}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayPalTestComponent;
