import React from 'react';
import { Link } from 'react-router-dom';

const PayPalTestIndex: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">PayPal Integration Tests</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-500">
            <h2 className="text-xl font-semibold mb-4 text-green-600">🎯 PayPal Direct Button</h2>
            <p className="text-gray-600 mb-4">
              <strong>Botón directo más simple</strong><br/>
              Enfoque minimalista con carga Promise
            </p>
            <Link 
              to="/paypal-direct-button" 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors font-semibold"
            >
              🚀 Abrir Directo
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-500">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">PayPal Real Button</h2>
            <p className="text-gray-600 mb-4">
              Botón de PayPal real y funcional con interfaz profesional
            </p>
            <Link 
              to="/paypal-real-button" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-semibold"
            >
              Abrir Botón Real
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Environment Debug</h2>
            <p className="text-gray-600 mb-4">
              View all environment variables and configuration
            </p>
            <Link 
              to="/env-debug" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Open Environment Debug
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">PayPal Simple Button</h2>
            <p className="text-gray-600 mb-4">
              Botón de PayPal simple con pago único (debería funcionar)
            </p>
            <Link 
              to="/paypal-simple-button" 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Abrir Simple Button
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">PayPal Minimal Test</h2>
            <p className="text-gray-600 mb-4">
              Simple PayPal button with basic one-time payment
            </p>
            <Link 
              to="/paypal-minimal-test" 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Open Minimal Test
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">PayPal Button Test</h2>
            <p className="text-gray-600 mb-4">
              Subscription button with detailed debugging
            </p>
            <Link 
              to="/paypal-button-test" 
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
            >
              Open Button Test
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">PayPal Diagnostics</h2>
            <p className="text-gray-600 mb-4">
              Check plan validity and configuration
            </p>
            <Link 
              to="/paypal-diagnostics" 
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
            >
              Open Diagnostics
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Simple PayPal Test</h2>
            <p className="text-gray-600 mb-4">
              Basic PayPal integration test
            </p>
            <Link 
              to="/simple-paypal-test" 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Open Simple Test
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">PayPal Test Page</h2>
            <p className="text-gray-600 mb-4">
              Main PayPal test page
            </p>
            <Link 
              to="/paypal-test" 
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors"
            >
              Open Test Page
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            to="/" 
            className="text-blue-500 hover:text-blue-700 underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PayPalTestIndex;
