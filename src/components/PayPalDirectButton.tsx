import React, { useEffect } from 'react';

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalDirectButton: React.FC = () => {
  useEffect(() => {
    const CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;
    
    if (!CLIENT_ID) {
      console.error('PayPal Client ID no encontrado');
      return;
    }

    // Función para cargar PayPal SDK
    const loadPayPalSDK = () => {
      return new Promise((resolve, reject) => {
        if (window.paypal) {
          resolve(window.paypal);
          return;
        }

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&currency=USD`;
        script.onload = () => resolve(window.paypal);
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    // Cargar SDK y renderizar botón
    loadPayPalSDK().then((paypal: any) => {
      const container = document.getElementById('paypal-direct-container');
      if (container) {
        container.innerHTML = ''; // Limpiar contenedor
        
        paypal.Buttons({
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: '9.99'
                }
              }]
            });
          },
          onApprove: (data: any, actions: any) => {
            return actions.order.capture().then((details: any) => {
              alert('Pago completado por ' + details.payer.name.given_name);
            });
          }
        }).render('#paypal-direct-container');
      }
    }).catch((err) => {
      console.error('Error cargando PayPal:', err);
    });
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-6">FortiMind Premium</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">Plan Mensual</h3>
        <p className="text-3xl font-bold text-blue-600">$9.99</p>
        <p className="text-sm text-blue-600">USD por mes</p>
      </div>

      <div className="space-y-2 mb-6 text-sm">
        <p className="flex items-center">
          <span className="text-green-500 mr-2">✓</span>
          Acceso completo a todas las funciones
        </p>
        <p className="flex items-center">
          <span className="text-green-500 mr-2">✓</span>
          Programas de ejercicio personalizados
        </p>
        <p className="flex items-center">
          <span className="text-green-500 mr-2">✓</span>
          Seguimiento avanzado de progreso
        </p>
        <p className="flex items-center">
          <span className="text-green-500 mr-2">✓</span>
          Soporte prioritario
        </p>
      </div>

      <div id="paypal-direct-container" className="w-full min-h-[50px]">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Cargando PayPal...</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Pagos seguros procesados por PayPal
      </p>
    </div>
  );
};

export default PayPalDirectButton;
