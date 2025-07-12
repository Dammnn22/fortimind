import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import { PAYPAL_CONFIG } from '../config/paypal';
import { validatePayPalCredentials, checkPayPalPlan } from '../utils/paypalValidation';

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<{
    credentialsValid: boolean | null;
    monthlyPlanValid: boolean | null;
    yearlyPlanValid: boolean | null;
    sdkLoaded: boolean;
    errors: string[];
    loading: boolean;
  }>({
    credentialsValid: null,
    monthlyPlanValid: null,
    yearlyPlanValid: null,
    sdkLoaded: false,
    errors: [],
    loading: false
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setDiagnostics(prev => ({ ...prev, loading: true, errors: [] }));

    const errors: string[] = [];

    // Verificar si el SDK está cargado
    const sdkLoaded = !!window.paypal;
    
    try {
      // Verificar credenciales
      const credentialsResult = await validatePayPalCredentials();
      if (!credentialsResult.isValid && credentialsResult.error) {
        errors.push(credentialsResult.error);
      }

      // Verificar plan mensual
      const monthlyPlanResult = await checkPayPalPlan(PAYPAL_CONFIG.PLANS.MONTHLY);
      if (!monthlyPlanResult.isValid && monthlyPlanResult.error) {
        errors.push(`Monthly plan: ${monthlyPlanResult.error}`);
      }

      // Verificar plan anual
      const yearlyPlanResult = await checkPayPalPlan(PAYPAL_CONFIG.PLANS.YEARLY);
      if (!yearlyPlanResult.isValid && yearlyPlanResult.error) {
        errors.push(`Yearly plan: ${yearlyPlanResult.error}`);
      }

      setDiagnostics({
        credentialsValid: credentialsResult.isValid,
        monthlyPlanValid: monthlyPlanResult.isValid,
        yearlyPlanValid: yearlyPlanResult.isValid,
        sdkLoaded,
        errors,
        loading: false
      });
    } catch (error: any) {
      setDiagnostics(prev => ({
        ...prev,
        loading: false,
        errors: [...prev.errors, `Diagnostic error: ${error.message}`]
      }));
    }
  };

  const StatusIcon: React.FC<{ status: boolean | null }> = ({ status }) => {
    if (status === null) return <Loader className="animate-spin text-gray-400" size={20} />;
    return status ? 
      <CheckCircle className="text-green-500" size={20} /> : 
      <XCircle className="text-red-500" size={20} />;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">PayPal Diagnostics</h2>
        <p className="text-gray-600">Verificando configuración de PayPal</p>
      </div>

      {diagnostics.loading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
          <Loader className="animate-spin mr-3" size={20} />
          <span>Ejecutando diagnósticos...</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Configuración básica */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Configuración Básica</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Client ID:</span>
              <span className="font-mono">{PAYPAL_CONFIG.CLIENT_ID.substring(0, 20)}...</span>
            </div>
            <div className="flex justify-between">
              <span>Environment:</span>
              <span className="font-mono">Sandbox</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly Plan ID:</span>
              <span className="font-mono">{PAYPAL_CONFIG.PLANS.MONTHLY}</span>
            </div>
            <div className="flex justify-between">
              <span>Yearly Plan ID:</span>
              <span className="font-mono">{PAYPAL_CONFIG.PLANS.YEARLY}</span>
            </div>
          </div>
        </div>

        {/* Estado de verificaciones */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Estado de Verificaciones</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>SDK de PayPal cargado</span>
              <StatusIcon status={diagnostics.sdkLoaded} />
            </div>
            <div className="flex items-center justify-between">
              <span>Credenciales válidas</span>
              <StatusIcon status={diagnostics.credentialsValid} />
            </div>
            <div className="flex items-center justify-between">
              <span>Plan mensual válido</span>
              <StatusIcon status={diagnostics.monthlyPlanValid} />
            </div>
            <div className="flex items-center justify-between">
              <span>Plan anual válido</span>
              <StatusIcon status={diagnostics.yearlyPlanValid} />
            </div>
          </div>
        </div>

        {/* Errores */}
        {diagnostics.errors.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertCircle className="text-red-500 mr-2" size={20} />
              <h3 className="font-semibold text-red-800">Errores Encontrados</h3>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {diagnostics.errors.map((error, index) => (
                <li key={index} className="list-disc list-inside">{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Botón para volver a ejecutar */}
        <button
          onClick={runDiagnostics}
          disabled={diagnostics.loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {diagnostics.loading ? 'Ejecutando...' : 'Ejecutar Diagnósticos'}
        </button>
      </div>
    </div>
  );
};

export default PayPalDiagnostics;
