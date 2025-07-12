import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalOneTimeTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Iniciando...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayPalSDK();
  }, []);

  const loadPayPalSDK = () => {
    setStatus('Cargando SDK de PayPal...');
    setError(null);
    
    // Limpiar scripts existentes
    const existingScript = document.querySelector('script[src*="paypal.com/sdk"]');
    if (existingScript) {
      existingScript.remove();
      setStatus('Script anterior eliminado');
    }

    // Crear nuevo script - PAGO ÚNICO, no suscripción
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=AXdp6VAohHcC0NjKbgBNFhtuhoi9nEgmSpQUnsJtN8CifbYpP2ht3OyEbFMa9Mqaylo-ENqx5TSQ_UrR&currency=USD&intent=capture&components=buttons';
    
    script.onload = () => {
      setStatus('SDK cargado - Renderizando botón...');
      setTimeout(renderButton, 500);
    };

    script.onerror = () => {
      setError('Error al cargar SDK de PayPal');
      setStatus('Error en carga');
    };

    document.head.appendChild(script);
  };

  const renderButton = () => {
    if (!window.paypal) {
      setError('PayPal SDK no disponible después de cargar');
      return;
    }

    const container = document.getElementById('paypal-onetime-container');
    if (!container) {
      setError('Contenedor no encontrado');
      return;
    }

    // Limpiar contenedor
    container.innerHTML = '';
    setStatus('Configurando botón...');

    try {
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'blue',
          layout: 'vertical',
          label: 'pay',
          height: 50
        },
        createOrder: function(data: any, actions: any) {
          setStatus('Creando orden...');
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: '9.99',
                currency_code: 'USD'
              },
              description: 'FortiMind Premium - Pago de Prueba'
            }]
          });
        },
        onApprove: function(data: any, actions: any) {
          setStatus('¡Pago aprobado! Procesando...');
          return actions.order.capture().then(function(details: any) {
            setStatus(`¡Pago completado! Transacción: ${details.id}`);
            console.log('Detalles del pago:', details);
          });
        },
        onError: function(err: any) {
          const errorMsg = `Error en pago: ${err.message || JSON.stringify(err)}`;
          setError(errorMsg);
          setStatus('Error');
          console.error('PayPal Error:', err);
        },
        onCancel: function(data: any) {
          setStatus('Pago cancelado por el usuario');
          console.log('Pago cancelado:', data);
        }
      }).render('#paypal-onetime-container').then(() => {
        setStatus('¡Botón renderizado exitosamente!');
      }).catch((renderError: any) => {
        const errorMsg = `Error al renderizar: ${renderError.message}`;
        setError(errorMsg);
        setStatus('Error en renderizado');
        console.error('Render Error:', renderError);
      });
    } catch (exception: any) {
      const errorMsg = `Excepción: ${exception.message}`;
      setError(errorMsg);
      setStatus('Excepción capturada');
      console.error('Exception:', exception);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
        PayPal Pago Único Test
      </h2>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <div className="text-sm text-blue-800">
          <strong>Producto:</strong> FortiMind Premium<br/>
          <strong>Precio:</strong> $9.99 USD<br/>
          <strong>Tipo:</strong> Pago único (no suscripción)
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-100 rounded">
        <strong>Estado:</strong> 
        <span className={`ml-2 ${error ? 'text-red-600' : 'text-green-600'}`}>
          {status}
        </span>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <strong className="text-red-800">Error:</strong>
          <div className="text-sm text-red-600 mt-1">{error}</div>
        </div>
      )}

      <div 
        id="paypal-onetime-container"
        className="min-h-[60px] border-2 border-dashed border-gray-300 p-4 rounded mb-4 bg-gray-50"
      >
        <div className="text-center text-gray-500 text-sm">
          El botón de PayPal aparecerá aquí...
        </div>
      </div>

      <div className="space-y-2">
        <button 
          onClick={loadPayPalSDK}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          🔄 Recargar PayPal
        </button>
        
        <div className="text-xs text-gray-500 text-center">
          Esto es un entorno de prueba (sandbox). No se realizarán cobros reales.
        </div>
      </div>
    </div>
  );
};

export default PayPalOneTimeTest;
