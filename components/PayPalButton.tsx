import React, { useEffect, useRef } from 'react';

interface PayPalButtonProps {
  planType: 'premium_monthly' | 'premium_yearly';
  className?: string;
}

const PAYPAL_CLIENT_ID = 'AXdp6VAohHcC0NjKbgBNFhtuhoi9nEgmSpQUnsJtN8CifbYpP2ht3OyEbFMa9Mqaylo-ENqx5TSQ_UrR';
const PAYPAL_PLAN_IDS = {
  premium_monthly: 'P-6LG6825998894721SNBU3NVQ',
  premium_yearly: 'P-0LT85457VK498443GNBU3OGI'
};

const PayPalButton: React.FC<PayPalButtonProps> = ({ planType, className }) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const planId = PAYPAL_PLAN_IDS[planType];
  const containerId = `paypal-button-container-${planId}`;

  useEffect(() => {
    // Cargar el SDK solo si no está presente
    if (!(window as any).paypal) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
      script.async = true;
      script.onload = () => renderButton();
      document.body.appendChild(script);
    } else {
      renderButton();
    }

    function renderButton() {
      if ((window as any).paypal && paypalRef.current) {
        (window as any).paypal.Buttons({
          style: {
            shape: 'pill',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: function (data: any, actions: any) {
            return actions.subscription.create({
              plan_id: planId
            });
          },
          onApprove: function (data: any, actions: any) {
            alert('¡Suscripción creada! ID: ' + data.subscriptionID);
          },
          onError: function (err: any) {
            alert('Error en PayPal: ' + err);
          }
        }).render(`#${containerId}`);
      }
    }
    // Limpieza opcional
    return () => {
      if (paypalRef.current) paypalRef.current.innerHTML = '';
    };
  }, [planId, containerId]);

  return (
    <div>
      <div
        id={containerId}
        ref={paypalRef}
        className={className}
        style={{ minHeight: 50 }}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div>
      <h1>Suscríbete a nuestro plan premium</h1>
      <PayPalButton planType="premium_monthly" />
      <PayPalButton planType="premium_yearly" />
    </div>
  );
};

export default App;