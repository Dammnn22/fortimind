import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalRealButton: React.FC = () => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;
    
    console.log('PayPal Client ID:', CLIENT_ID);
    
    if (!CLIENT_ID) {
      setError('PayPal Client ID no encontrado');
      setLoading(false);
      return;
    }

    // Limpiar scripts existentes de PayPal
    const existingScripts = document.querySelectorAll('script[src*="paypal.com"]');
    existingScripts.forEach(script => script.remove());

    // Crear script de PayPal
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&currency=USD&intent=capture&components=buttons`;
    script.async = true;
    
    script.onload = () => {
      console.log('PayPal SDK cargado exitosamente');
      setLoading(false);
      
      if (window.paypal && paypalRef.current) {
        // Limpiar el contenedor
        paypalRef.current.innerHTML = '';
        
        // Crear botón de PayPal
        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'pay',
            height: 50
          },
          createOrder: function(_data: any, actions: any) {
            console.log('Creando orden de PayPal');
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: '9.99',
                  currency_code: 'USD'
                },
                description: 'FortiMind Premium - Suscripción Mensual'
              }]
            });
          },
          onApprove: function(data: any, actions: any) {
            console.log('Pago aprobado:', data);
            return actions.order.capture().then(function(details: any) {
              console.log('Pago completado:', details);
              
              // Aquí puedes procesar el pago exitoso
              alert(`¡Pago completado exitosamente! 
Transacción ID: ${details.id}
Nombre: ${details.payer.name.given_name}
Email: ${details.payer.email_address}`);
              
              // Aquí puedes hacer una llamada a tu backend para activar la suscripción
              // activateSubscription(details);
            });
          },
          onError: function(err: any) {
            console.error('Error de PayPal:', err);
            setError('Error al procesar el pago: ' + (err.message || 'Error desconocido'));
          },
          onCancel: function(data: any) {
            console.log('Pago cancelado:', data);
            alert('Pago cancelado por el usuario');
          }
        }).render(paypalRef.current).then(() => {
          console.log('Botón de PayPal renderizado exitosamente');
        }).catch((err: any) => {
          console.error('Error al renderizar botón:', err);
          setError('Error al cargar el botón de PayPal: ' + err.message);
        });
      }
    };
    
    script.onerror = () => {
      console.error('Error al cargar PayPal SDK');
      setError('Error al cargar PayPal SDK');
      setLoading(false);
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup
      const scriptToRemove = document.querySelector('script[src*="paypal.com"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-red-600">Error de PayPal</h2>
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p><strong>Error:</strong> {error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">FortiMind Premium</h2>
      
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold mb-2">Plan Mensual</h3>
          <p className="text-2xl font-bold">$9.99 USD</p>
          <p className="text-sm opacity-90">Facturación mensual</p>
        </div>
        
        <ul className="text-sm text-gray-600 space-y-2">
          <li>✅ Acceso completo a todas las funciones</li>
          <li>✅ Programas de ejercicio personalizados</li>
          <li>✅ Seguimiento de progreso avanzado</li>
          <li>✅ Soporte prioritario</li>
          <li>✅ Sin anuncios</li>
        </ul>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Cargando PayPal...</span>
        </div>
      ) : (
        <div 
          ref={paypalRef}
          className="min-h-[60px] w-full"
        />
      )}
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>💳 Pagos seguros procesados por PayPal</p>
        <p>🔒 Modo sandbox - Solo para pruebas</p>
      </div>
    </div>
  );
};

export default PayPalRealButton;
