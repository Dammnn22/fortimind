import React, { useState } from 'react';
import { callDeepSeekFirebase } from '../services/deepSeekService';
import { callGeminiFirebase } from '../services/geminiService';

const AITestComponent: React.FC = () => {
  const [deepSeekResponse, setDeepSeekResponse] = useState<string>('');
  const [geminiResponse, setGeminiResponse] = useState<string>('');
  const [loading, setLoading] = useState<{ deepSeek: boolean; gemini: boolean }>({
    deepSeek: false,
    gemini: false
  });
  const [error, setError] = useState<{ deepSeek: string; gemini: string }>({
    deepSeek: '',
    gemini: ''
  });

  const testPrompt = "Hola, soy un usuario que está luchando con la adicción a la pornografía. ¿Puedes darme un consejo motivacional?";

  const testDeepSeek = async () => {
    setLoading((prev: { deepSeek: boolean; gemini: boolean }) => ({ ...prev, deepSeek: true }));
    setError((prev: { deepSeek: string; gemini: string }) => ({ ...prev, deepSeek: '' }));
    setDeepSeekResponse('');

    try {
      const response = await callDeepSeekFirebase(testPrompt);
      setDeepSeekResponse(response || 'No se recibió respuesta');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError((prev: { deepSeek: string; gemini: string }) => ({ ...prev, deepSeek: errorMessage }));
      console.error('Error en DeepSeek:', err);
    } finally {
      setLoading((prev: { deepSeek: boolean; gemini: boolean }) => ({ ...prev, deepSeek: false }));
    }
  };

  const testGemini = async () => {
    setLoading((prev: { deepSeek: boolean; gemini: boolean }) => ({ ...prev, gemini: true }));
    setError((prev: { deepSeek: string; gemini: string }) => ({ ...prev, gemini: '' }));
    setGeminiResponse('');

    try {
      const response = await callGeminiFirebase(testPrompt);
      setGeminiResponse(response || 'No se recibió respuesta');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError((prev: { deepSeek: string; gemini: string }) => ({ ...prev, gemini: errorMessage }));
      console.error('Error en Gemini:', err);
    } finally {
      setLoading((prev: { deepSeek: boolean; gemini: boolean }) => ({ ...prev, gemini: false }));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🧪 Prueba de Funciones de IA - Firebase Functions</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Prompt de Prueba:</h3>
        <p style={{ fontStyle: 'italic' }}>"{testPrompt}"</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* DeepSeek Test */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
          <h3>🤖 DeepSeek AI</h3>
          <button 
            onClick={testDeepSeek}
            disabled={loading.deepSeek}
            style={{
              padding: '10px 20px',
              backgroundColor: loading.deepSeek ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading.deepSeek ? 'not-allowed' : 'pointer',
              marginBottom: '10px'
            }}
          >
            {loading.deepSeek ? 'Probando...' : 'Probar DeepSeek'}
          </button>

          {error.deepSeek && (
            <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>
              ❌ Error: {error.deepSeek}
            </div>
          )}

          {deepSeekResponse && (
            <div style={{ 
              backgroundColor: '#e8f5e8', 
              padding: '10px', 
              borderRadius: '4px',
              border: '1px solid #4caf50'
            }}>
              <strong>✅ Respuesta:</strong>
              <p style={{ whiteSpace: 'pre-wrap', marginTop: '5px' }}>{deepSeekResponse}</p>
            </div>
          )}
        </div>

        {/* Gemini Test */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
          <h3>🌟 Gemini AI</h3>
          <button 
            onClick={testGemini}
            disabled={loading.gemini}
            style={{
              padding: '10px 20px',
              backgroundColor: loading.gemini ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading.gemini ? 'not-allowed' : 'pointer',
              marginBottom: '10px'
            }}
          >
            {loading.gemini ? 'Probando...' : 'Probar Gemini'}
          </button>

          {error.gemini && (
            <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>
              ❌ Error: {error.gemini}
            </div>
          )}

          {geminiResponse && (
            <div style={{ 
              backgroundColor: '#e8f5e8', 
              padding: '10px', 
              borderRadius: '4px',
              border: '1px solid #4caf50'
            }}>
              <strong>✅ Respuesta:</strong>
              <p style={{ whiteSpace: 'pre-wrap', marginTop: '5px' }}>{geminiResponse}</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
        <h4>📋 Información de las Funciones:</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><strong>DeepSeek:</strong> https://us-central1-fortimind.cloudfunctions.net/callDeepSeek</li>
          <li><strong>Gemini:</strong> https://us-central1-fortimind.cloudfunctions.net/callGemini</li>
          <li>Las funciones usan secretos de Firebase para las API keys</li>
          <li>Configuradas con Node.js 20 y funciones de 2nd Gen</li>
        </ul>
      </div>
    </div>
  );
};

export default AITestComponent; 