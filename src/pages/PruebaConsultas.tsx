import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function PruebaConsultas() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string>('');

  const probarConsulta = async () => {
    if (!user) {
      alert('Debes iniciar sesión');
      return;
    }

    setLoading(true);
    setResultado('');

    try {
      const response = await fetch('https://us-central1-fortimind.cloudfunctions.net/crearConsultaIndividual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
          nombre: user.displayName || 'Usuario Test',
          tipoSesion: 'psicologo',
          fecha: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      const data = await response.json();
      
      if (data.success && data.approvalUrl) {
        setResultado(`✅ Consulta creada exitosamente!\nID: ${data.consultaId}`);
        
        const irAPayPal = confirm('¿Quieres ir a PayPal para completar el pago?');
        if (irAPayPal) {
          window.location.href = data.approvalUrl;
        }
      } else {
        setResultado(`❌ Error: ${data.error || 'Error desconocido'}`);
      }
    } catch (error) {
      setResultado(`❌ Error de red: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">Prueba de Consultas 1:1</h2>
        <p className="text-gray-600">Debes iniciar sesión para probar esta funcionalidad.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">🧪 Prueba de Consultas 1:1</h2>
      
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <p className="text-sm"><strong>Usuario:</strong> {user.displayName || 'Sin nombre'}</p>
        <p className="text-sm"><strong>Email:</strong> {user.email}</p>
        <p className="text-sm"><strong>Tipo:</strong> Psicólogo</p>
        <p className="text-sm"><strong>Fecha:</strong> Mañana</p>
        <p className="text-sm"><strong>Precio:</strong> $15 USD</p>
      </div>

      <button
        onClick={probarConsulta}
        disabled={loading}
        className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? 'Creando consulta...' : '🚀 Probar Consulta'}
      </button>

      {resultado && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <pre className="text-sm whitespace-pre-wrap">{resultado}</pre>
        </div>
      )}
    </div>
  );
}