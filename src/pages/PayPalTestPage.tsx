import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, AlertCircle, Loader, TestTube } from 'lucide-react';
import { PAYPAL_CONFIG, getPayPalSDKUrl } from '../config/paypal';

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalTestPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    addDebugInfo('Component mounted, starting PayPal SDK load');
    loadPayPalSDK();
  }, []);

  const loadPayPalSDK = () => {
    addDebugInfo('Loading PayPal SDK...');
    
    // Remove existing PayPal script if any
    const existingScript = document.querySelector('script[src*="paypal.com/sdk"]');
    if (existingScript) {
      existingScript.remove();
      addDebugInfo('Removed existing PayPal script');
    }

    const sdkUrl = getPayPalSDKUrl();
    addDebugInfo(`SDK URL: ${sdkUrl}`);

    const script = document.createElement('script');
    script.src = sdkUrl;
    script.onload = () => {
      addDebugInfo('PayPal SDK loaded successfully');
      setIsLoading(false);
      setTimeout(() => {
        initializePayPalButton();
      }, 100);
    };
    script.onerror = () => {
      const errorMsg = 'Failed to load PayPal SDK';
      addDebugInfo(errorMsg);
      setError(errorMsg);
      setIsLoading(false);
    };
    document.head.appendChild(script);
  };

  const initializePayPalButton = () => {
    addDebugInfo('Initializing PayPal button...');
    
    if (!window.paypal) {
      const errorMsg = 'PayPal SDK not available';
      addDebugInfo(errorMsg);
      setError(errorMsg);
      return;
    }

    const container = document.getElementById('paypal-button-container');
    if (!container) {
      const errorMsg = 'PayPal button container not found';
      addDebugInfo(errorMsg);
      setError(errorMsg);
      return;
    }

    // Clear any existing content
    container.innerHTML = '';
    addDebugInfo(`Using plan ID: ${PAYPAL_CONFIG.PLANS.MONTHLY}`);
    addDebugInfo(`PayPal SDK version: ${window.paypal.version || 'unknown'}`);

    try {
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'blue',
          layout: 'vertical',
          label: 'subscribe',
          height: 55
        },
        createSubscription: function(data: any, actions: any) {
          addDebugInfo('Creating subscription...');
          addDebugInfo(`Plan ID being used: ${PAYPAL_CONFIG.PLANS.MONTHLY}`);
          return actions.subscription.create({
            'plan_id': PAYPAL_CONFIG.PLANS.MONTHLY,
            'application_context': {
              'brand_name': 'FortiMind',
              'locale': 'en-US',
              'shipping_preference': 'NO_SHIPPING',
              'user_action': 'SUBSCRIBE_NOW',
              'return_url': `${window.location.origin}/#/subscription/success`,
              'cancel_url': `${window.location.origin}/#/subscription/cancel`
            }
          });
        },
        onApprove: function(data: any, actions: any) {
          addDebugInfo(`Subscription approved: ${data.subscriptionID}`);
          setPaymentStatus('processing');
          setSubscriptionId(data.subscriptionID);
          
          setTimeout(() => {
            setPaymentStatus('success');
            addDebugInfo('Payment processing completed');
          }, 2000);
        },
        onError: function(err: any) {
          const errorMsg = `PayPal error: ${err.message || JSON.stringify(err)}`;
          addDebugInfo(errorMsg);
          setPaymentStatus('error');
          setError('Payment failed. Please try again.');
          console.error('PayPal error details:', err);
        },
        onCancel: function(data: any) {
          addDebugInfo('Payment cancelled by user');
          setPaymentStatus('idle');
        }
      }).render('#paypal-button-container').then(() => {
        addDebugInfo('PayPal button rendered successfully');
      }).catch((error: any) => {
        const errorMsg = `Failed to render PayPal button: ${error.message}`;
        addDebugInfo(errorMsg);
        setError(errorMsg);
      });
      
    } catch (error: any) {
      const errorMsg = `Error initializing PayPal button: ${error.message}`;
      addDebugInfo(errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <TestTube className="text-yellow-600 mr-2" size={32} />
            <CreditCard className="text-blue-600 ml-2" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">PayPal Sandbox Test</h1>
          <p className="text-gray-600">Test PayPal subscription integration</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <XCircle className="text-red-500 mr-3" size={20} />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-2">
              <CheckCircle className="text-green-500 mr-3" size={20} />
              <span className="text-green-700 font-semibold">Subscription Created Successfully!</span>
            </div>
            {subscriptionId && (
              <p className="text-sm text-gray-600">
                <strong>Subscription ID:</strong> {subscriptionId}
              </p>
            )}
          </div>
        )}

        {paymentStatus === 'processing' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
            <AlertCircle className="text-yellow-500 mr-3" size={20} />
            <span className="text-yellow-700">Processing payment...</span>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Subscription Plan</h2>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Monthly Premium (Test)</span>
              <span className="text-xl font-bold text-blue-600">$9.99/month</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Test subscription with all premium features enabled in sandbox environment.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <Loader className="animate-spin mx-auto mb-4" size={48} />
            <p className="text-gray-600">Loading PayPal SDK...</p>
          </div>
        ) : (
          <div id="paypal-button-container" className="mb-6 min-h-[50px] border-2 border-dashed border-gray-300 p-4 rounded-lg"></div>
        )}

        {/* Debug Information */}
        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Information:</h3>
          <div className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
            {debugInfo.map((info, index) => (
              <div key={index}>{info}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayPalTestPage;
