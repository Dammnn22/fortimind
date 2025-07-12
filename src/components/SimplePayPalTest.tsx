import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    paypal?: any;
  }
}

const SimplePayPalTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Iniciando...');
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    loadPayPalSDK();
  }, []);

  const loadPayPalSDK = () => {
    setStatus('Cargando SDK de PayPal...');
    
    // Verificar si ya está cargado
    if (window.paypal) {
      setStatus('SDK ya está cargado');
      setSdkLoaded(true);
      renderButton();
      return;
    }

    // Crear script
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=AXdp6VAohHcC0NjKbgBNFhtuhoi9nEgmSpQUnsJtN8CifbYpP2ht3OyEbFMa9Mqaylo-ENqx5TSQ_UrR&currency=USD&intent=capture';
    
    script.onload = () => {
      setStatus('SDK cargado exitosamente');
      setSdkLoaded(true);
      setTimeout(renderButton, 100);
    };

    script.onerror = () => {
      setStatus('Error al cargar SDK de PayPal');
    };

    document.head.appendChild(script);
  };

  const renderButton = () => {
    if (!window.paypal) {
      setStatus('PayPal no disponible');
      return;
    }

    const container = document.getElementById('simple-paypal-container');
    if (!container) {
      setStatus('Contenedor no encontrado');
      return;
    }

    container.innerHTML = '';
    setStatus('Renderizando botón...');

    try {
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'blue',
          layout: 'vertical',
          label: 'pay'
        },
        createOrder: function(data: any, actions: any) {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: '10.00',
                currency_code: 'USD'
              }
            }]
          });
        },
        onApprove: function(data: any, actions: any) {
          setStatus(`¡Pago aprobado! Order ID: ${data.orderID}`);
        },
        onError: function(err: any) {
          setStatus(`Error: ${err.message || 'Error desconocido'}`);
        }
      }).render('#simple-paypal-container').then(() => {
        setStatus('¡Botón renderizado exitosamente!');
      }).catch((error: any) => {
        setStatus(`Error al renderizar: ${error.message}`);
      });
    } catch (error: any) {
      setStatus(`Excepción: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">PayPal Test Simple</h2>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <strong>Estado:</strong> {status}
      </div>
      
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <strong>SDK Cargado:</strong> {sdkLoaded ? '✅ Sí' : '❌ No'}
      </div>

      <div 
        id="simple-paypal-container"
        className="min-h-[50px] border-2 border-dashed border-gray-300 p-4 rounded mb-4"
      >
        {!sdkLoaded && <div className="text-center text-gray-500">Esperando botón...</div>}
      </div>

      <button 
        onClick={loadPayPalSDK}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Recargar PayPal
      </button>
    </div>
  );
};

export default SimplePayPalTest;
