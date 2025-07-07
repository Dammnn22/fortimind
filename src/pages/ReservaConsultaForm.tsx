import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from '../hooks/useAuth';

export default function ReservaConsultaForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const tipoSesion = new URLSearchParams(useLocation().search).get('tipo') || 'psicologo';
  const [fecha, setFecha] = useState<Date | null>(null);
  const [hora, setHora] = useState<string>('09:00');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Debes iniciar sesión');
      return;
    }
    
    if (!fecha) {
      alert('Selecciona una fecha');
      return;
    }
    
    setLoading(true);

    try {
      const fechaCompleta = new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
        parseInt(hora.split(':')[0]),
        parseInt(hora.split(':')[1])
      );

      const response = await fetch('https://us-central1-fortimind.cloudfunctions.net/crearConsultaIndividual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
          nombre: user.displayName || 'Usuario',
          tipoSesion,
          fecha: fechaCompleta.toISOString(),
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        alert('Error al crear la consulta: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de red: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">Reservar Consulta</h2>
        <p className="text-gray-600">Debes iniciar sesión para reservar una consulta.</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <h2 className="text-xl font-bold mb-4">Reservar sesión de {tipoSesion}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de sesión</label>
          <input 
            className="w-full p-2 border rounded" 
            value={tipoSesion} 
            disabled 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Nombre completo</label>
          <input 
            className="w-full p-2 border rounded" 
            value={user.displayName || 'Sin nombre'} 
            disabled 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Correo electrónico</label>
          <input 
            className="w-full p-2 border rounded" 
            value={user.email || ''} 
            disabled 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Fecha</label>
          <Calendar 
            onChange={setFecha as any} 
            value={fecha} 
            minDate={new Date()} 
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Hora</label>
          <input
            type="time"
            className="w-full p-2 border rounded"
            value={hora}
            onChange={e => setHora(e.target.value)}
            min="08:00"
            max="18:00"
            required
          />
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">
            <strong>Resumen:</strong> {tipoSesion} el{' '}
            {fecha ? fecha.toLocaleDateString() : 'fecha por seleccionar'} a las {hora}
          </p>
          <p className="text-lg font-bold text-green-600 mt-1">Total: $15 USD</p>
        </div>
        
        <button
          type="submit"
          className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          disabled={loading || !fecha}
        >
          {loading ? 'Procesando...' : 'Pagar y Reservar ($15 USD)'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/consultas')}
          className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Volver
        </button>
      </form>
    </div>
  );
}