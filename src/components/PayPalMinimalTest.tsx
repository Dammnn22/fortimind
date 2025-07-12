import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalMinimalTest: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;
    
    console.log('PayPal Client ID:', CLIENT_ID);
    console.log('All env variables:', {
      REACT_APP_PAYPAL_CLIENT_ID: process.env.REACT_APP_PAYPAL_CLIENT_ID,
      REACT_APP_PAYPAL_ENV: process.env.REACT_APP_PAYPAL_ENV,
      REACT_APP_PAYPAL_MONTHLY_PLAN_ID: process.env.REACT_APP_PAYPAL_MONTHLY_PLAN_ID,
      REACT_APP_PAYPAL_YEARLY_PLAN_ID: process.env.REACT_APP_PAYPAL_YEARLY_PLAN_ID
    });

    if (!CLIENT_ID) {
      setError('PayPal Client ID not found in environment variables');
      return;
    }

    // Verificar si ya existe el script
    if (window.paypal) {
      console.log('PayPal already loaded');
      setIsLoaded(true);
      renderButton();
      return;
    }

    // Cargar el SDK de PayPal
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&currency=USD&intent=capture`;
    script.onload = () => {
      console.log('PayPal SDK loaded');
      setIsLoaded(true);
      renderButton();
    };
    script.onerror = (err) => {
      console.error('Failed to load PayPal SDK:', err);
      setError('Failed to load PayPal SDK');
    };

    document.head.appendChild(script);
  }, []);

  const renderButton = () => {
    if (!window.paypal) {
      setError('PayPal SDK not available');
      return;
    }

    const container = document.getElementById('paypal-minimal-container');
    if (!container) {
      setError('Container not found');
      return;
    }

    // Limpiar contenedor
    container.innerHTML = '';

    window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'paypal'
      },
      createOrder: function(data: any, actions: any) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: '10.00'
            }
          }]
        });
      },
      onApprove: function(data: any, actions: any) {
        return actions.order.capture().then(function(details: any) {
          alert('Transaction completed by ' + details.payer.name.given_name);
        });
      },
      onError: function(err: any) {
        console.error('PayPal Error:', err);
        setError('PayPal Error: ' + (err.message || 'Unknown error'));
      }
    }).render('#paypal-minimal-container').then(() => {
      console.log('PayPal button rendered successfully');
    }).catch((err: any) => {
      console.error('Failed to render PayPal button:', err);
      setError('Failed to render PayPal button: ' + err.message);
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">PayPal Minimal Test</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          <strong>Status:</strong> {isLoaded ? 'SDK Loaded' : 'Loading...'}
        </p>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Client ID:</strong> {process.env.REACT_APP_PAYPAL_CLIENT_ID?.substring(0, 20) || 'Not found'}...
        </p>
      </div>

      <div
        id="paypal-minimal-container"
        className="min-h-[50px] border-2 border-dashed border-gray-300 p-4 rounded-lg"
      >
        {!isLoaded && (
          <div className="text-center text-gray-500">
            Loading PayPal button...
          </div>
        )}
      </div>
    </div>
  );
};

export default PayPalMinimalTest;
