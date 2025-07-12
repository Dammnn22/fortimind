import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalSimpleButton: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;
    
    if (!CLIENT_ID) {
      setError('PayPal Client ID not found');
      return;
    }

    // Eliminar script existente si existe
    const existingScript = document.querySelector('script[src*="paypal.com/sdk"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&currency=USD&intent=capture&components=buttons&debug=true`;
    script.async = true;
    
    script.onload = () => {
      console.log('PayPal SDK loaded successfully');
      setIsLoaded(true);
      renderButton();
    };
    
    script.onerror = () => {
      console.error('Failed to load PayPal SDK');
      setError('Failed to load PayPal SDK');
    };
    
    document.body.appendChild(script);
    
    return () => {
      // Cleanup
      const scriptToRemove = document.querySelector('script[src*="paypal.com/sdk"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  const renderButton = () => {
    if (!window.paypal) {
      setError('PayPal not available');
      return;
    }

    const container = document.getElementById('paypal-simple-button-container');
    if (!container) {
      setError('Container not found');
      return;
    }

    container.innerHTML = '';

    try {
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'pay',
          height: 40
        },
        createOrder: function(_data: any, actions: any) {
          console.log('Creating order...');
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: '9.99',
                currency_code: 'USD'
              },
              description: 'FortiMind Premium Monthly'
            }]
          });
        },
        onApprove: function(data: any, actions: any) {
          console.log('Payment approved:', data);
          return actions.order.capture().then(function(details: any) {
            console.log('Transaction completed:', details);
            alert('¡Pago completado! ID de transacción: ' + details.id);
          });
        },
        onError: function(err: any) {
          console.error('PayPal error:', err);
          setError('Error en PayPal: ' + (err.message || 'Error desconocido'));
        },
        onCancel: function(data: any) {
          console.log('Payment cancelled:', data);
          alert('Pago cancelado');
        }
      }).render('#paypal-simple-button-container');
    } catch (err: any) {
      console.error('Error rendering PayPal button:', err);
      setError('Error rendering button: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">PayPal Simple Button</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          <strong>Estado:</strong> {isLoaded ? 'Cargado' : 'Cargando...'}
        </p>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Client ID:</strong> {process.env.REACT_APP_PAYPAL_CLIENT_ID?.substring(0, 15)}...
        </p>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Precio:</strong> $9.99 USD
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div
        id="paypal-simple-button-container"
        className="min-h-[60px] border-2 border-dashed border-gray-300 p-4 rounded-lg mb-4"
      >
        {!isLoaded && (
          <div className="text-center text-gray-500">
            Cargando botón de PayPal...
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center">
        Modo sandbox - No se procesarán pagos reales
      </div>
    </div>
  );
};

export default PayPalSimpleButton;
