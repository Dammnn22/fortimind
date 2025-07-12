import React, { useEffect, useRef } from 'react';

const PayPalScriptTest: React.FC = () => {
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;
    console.log('CLIENT_ID:', CLIENT_ID);
    
    if (!CLIENT_ID) {
      console.error('PayPal Client ID not found');
      return;
    }

    // Crear el script de PayPal
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&currency=USD&intent=capture`;
    script.async = true;
    
    script.onload = () => {
      console.log('PayPal script loaded');
      if (window.paypal && paypalRef.current) {
        window.paypal.Buttons({
          createOrder: function(data: any, actions: any) {
            console.log('createOrder called');
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: '10.00'
                }
              }]
            });
          },
          onApprove: function(data: any, actions: any) {
            console.log('onApprove called');
            return actions.order.capture().then(function(details: any) {
              console.log('Transaction completed:', details);
              alert('Transaction completed by ' + details.payer.name.given_name);
            });
          },
          onError: function(err: any) {
            console.error('PayPal error:', err);
          }
        }).render(paypalRef.current);
      }
    };
    
    script.onerror = () => {
      console.error('Failed to load PayPal script');
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup
      const existingScript = document.querySelector(`script[src*="paypal.com/sdk"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">PayPal Script Test</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          <strong>Client ID:</strong> {process.env.REACT_APP_PAYPAL_CLIENT_ID?.substring(0, 20) || 'Not found'}...
        </p>
      </div>

      <div
        ref={paypalRef}
        className="min-h-[50px] border-2 border-dashed border-gray-300 p-4 rounded-lg"
      >
        <div className="text-center text-gray-500">
          Loading PayPal button...
        </div>
      </div>
    </div>
  );
};

export default PayPalScriptTest;
