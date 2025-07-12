import React, { useEffect, useState } from 'react';
import { PAYPAL_CONFIG } from '../config/paypal';

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalButtonTest: React.FC = () => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setDebugLog(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  useEffect(() => {
    loadPayPalSDK();
  }, []);

  const loadPayPalSDK = async () => {
    log('Starting PayPal SDK load...');
    
    // Check if already loaded
    if (window.paypal) {
      log('PayPal SDK already loaded');
      setIsSDKLoaded(true);
      renderPayPalButton();
      return;
    }

    try {
      // Remove any existing script
      const existingScript = document.querySelector('script[src*="paypal.com/sdk"]');
      if (existingScript) {
        existingScript.remove();
        log('Removed existing PayPal script');
      }

      // Create new script
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CONFIG.CLIENT_ID}&vault=true&intent=subscription&currency=USD&components=buttons&debug=true`;
      
      log(`Loading script: ${script.src}`);

      script.onload = () => {
        log('PayPal SDK loaded successfully');
        setIsSDKLoaded(true);
        setTimeout(() => {
          renderPayPalButton();
        }, 100);
      };

      script.onerror = (err) => {
        log(`Failed to load PayPal SDK: ${err}`);
        setError('Failed to load PayPal SDK');
      };

      document.head.appendChild(script);
      log('PayPal script added to head');
    } catch (err: any) {
      log(`Error loading PayPal SDK: ${err.message}`);
      setError(`Error loading PayPal SDK: ${err.message}`);
    }
  };

  const renderPayPalButton = () => {
    log('Attempting to render PayPal button...');
    
    if (!window.paypal) {
      log('ERROR: PayPal SDK not available in window');
      setError('PayPal SDK not available');
      return;
    }

    const container = document.getElementById('paypal-test-container');
    if (!container) {
      log('ERROR: PayPal container not found');
      setError('PayPal container not found');
      return;
    }

    // Clear container
    container.innerHTML = '';
    log('Container cleared');

    try {
      log(`Using Client ID: ${PAYPAL_CONFIG.CLIENT_ID}`);
      log(`Using Plan ID: ${PAYPAL_CONFIG.PLANS.MONTHLY}`);

      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'blue',
          layout: 'vertical',
          label: 'subscribe',
          height: 40
        },
        createSubscription: function(data: any, actions: any) {
          log('createSubscription called');
          log(`Creating subscription with plan: ${PAYPAL_CONFIG.PLANS.MONTHLY}`);
          
          return actions.subscription.create({
            'plan_id': PAYPAL_CONFIG.PLANS.MONTHLY,
            'application_context': {
              'brand_name': 'FortiMind Test',
              'locale': 'en-US',
              'shipping_preference': 'NO_SHIPPING',
              'user_action': 'SUBSCRIBE_NOW',
              'return_url': `${window.location.origin}/#/subscription/success`,
              'cancel_url': `${window.location.origin}/#/subscription/cancel`
            }
          });
        },
        onApprove: function(data: any, actions: any) {
          log(`Subscription approved: ${data.subscriptionID}`);
          alert(`Success! Subscription ID: ${data.subscriptionID}`);
        },
        onError: function(err: any) {
          log(`PayPal error: ${JSON.stringify(err)}`);
          setError(`PayPal error: ${err.message || 'Unknown error'}`);
        },
        onCancel: function(data: any) {
          log('Payment cancelled');
        }
      }).render('#paypal-test-container').then(() => {
        log('PayPal button rendered successfully!');
      }).catch((renderError: any) => {
        log(`Render error: ${renderError.message}`);
        setError(`Render error: ${renderError.message}`);
      });

    } catch (err: any) {
      log(`Exception during button creation: ${err.message}`);
      setError(`Exception during button creation: ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">PayPal Test</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          <strong>Status:</strong> {isSDKLoaded ? 'SDK Loaded' : 'Loading SDK...'}
        </p>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Client ID:</strong> {PAYPAL_CONFIG.CLIENT_ID.substring(0, 20)}...
        </p>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Plan ID:</strong> {PAYPAL_CONFIG.PLANS.MONTHLY}
        </p>
      </div>

      <div
        id="paypal-test-container"
        className="min-h-[50px] border-2 border-dashed border-gray-300 p-4 rounded-lg mb-4"
      >
        {!isSDKLoaded && (
          <div className="text-center text-gray-500">
            Loading PayPal button...
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold mb-2">Debug Log:</h3>
        <div className="text-xs bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
          {debugLog.map((entry, index) => (
            <div key={index} className="mb-1">{entry}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PayPalButtonTest;
