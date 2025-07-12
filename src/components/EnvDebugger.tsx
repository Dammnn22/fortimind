import React from 'react';
import { PAYPAL_CONFIG } from '../config/paypal';

const EnvDebugger: React.FC = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Variables de Entorno - Debug</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">PayPal Variables de Entorno</h3>
          <div className="text-sm space-y-1">
            <div><strong>REACT_APP_PAYPAL_CLIENT_ID:</strong> {process.env.REACT_APP_PAYPAL_CLIENT_ID || 'NO DEFINIDA'}</div>
            <div><strong>REACT_APP_PAYPAL_MONTHLY_PLAN_ID:</strong> {process.env.REACT_APP_PAYPAL_MONTHLY_PLAN_ID || 'NO DEFINIDA'}</div>
            <div><strong>REACT_APP_PAYPAL_YEARLY_PLAN_ID:</strong> {process.env.REACT_APP_PAYPAL_YEARLY_PLAN_ID || 'NO DEFINIDA'}</div>
            <div><strong>REACT_APP_PAYPAL_ENV:</strong> {process.env.REACT_APP_PAYPAL_ENV || 'NO DEFINIDA'}</div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-semibold mb-2">PayPal Config Actual</h3>
          <div className="text-sm space-y-1">
            <div><strong>CLIENT_ID:</strong> {PAYPAL_CONFIG.CLIENT_ID.substring(0, 20)}...</div>
            <div><strong>MONTHLY_PLAN:</strong> {PAYPAL_CONFIG.PLANS.MONTHLY}</div>
            <div><strong>YEARLY_PLAN:</strong> {PAYPAL_CONFIG.PLANS.YEARLY}</div>
            <div><strong>SDK_URL:</strong> {PAYPAL_CONFIG.SANDBOX_SDK_URL}</div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Otras Variables</h3>
          <div className="text-sm space-y-1">
            <div><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'NO DEFINIDA'}</div>
            <div><strong>DEEPSEEK_API_KEY:</strong> {process.env.DEEPSEEK_API_KEY ? 'DEFINIDA' : 'NO DEFINIDA'}</div>
            <div><strong>API_KEY (Gemini):</strong> {process.env.API_KEY ? 'DEFINIDA' : 'NO DEFINIDA'}</div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded">
          <h3 className="font-semibold mb-2">URLs de Prueba</h3>
          <div className="text-sm space-y-1">
            <a href="/#/simple-paypal-test" className="text-blue-600 hover:underline block">• PayPal Test Simple</a>
            <a href="/#/paypal-button-test" className="text-blue-600 hover:underline block">• PayPal Button Test</a>
            <a href="/#/paypal-diagnostics" className="text-blue-600 hover:underline block">• PayPal Diagnostics</a>
            <a href="/#/paypal-test" className="text-blue-600 hover:underline block">• PayPal Test Original</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvDebugger;
