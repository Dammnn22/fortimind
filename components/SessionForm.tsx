import React, { useState } from 'react';
import { createClientSession } from '../services/specialistService';
import { SpecialistData, ClientInfo } from '../types/specialists';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import GlassNotification from './GlassNotification';

interface SessionFormProps {
  specialistData: SpecialistData;
  clients: ClientInfo[];
  onSessionCreated: () => void;
  onCancel: () => void;
}

const SessionForm: React.FC<SessionFormProps> = ({
  specialistData,
  clients,
  onSessionCreated,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    clienteUid: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
    duracion: 60,
    notas: '',
    progreso: '',
    evaluacion: 5
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clienteUid || !formData.notas) {
      setNotification({
        type: 'error',
        message: 'Por favor completa todos los campos requeridos'
      });
      return;
    }

    setLoading(true);
    try {
      const selectedClient = clients.find(c => c.uid === formData.clienteUid);
      const fechaHora = new Date(`${formData.fecha}T${formData.hora}`);
      
      const sessionData = {
        especialista: {
          uid: specialistData.uid,
          nombre: specialistData.nombre,
          tipo: specialistData.tipo
        },
        clienteUid: formData.clienteUid,
        clienteNombre: selectedClient?.displayName || 'Cliente',
        fecha: fechaHora,
        notas: formData.notas,
        progreso: formData.progreso,
        evaluacion: formData.evaluacion,
        duracion: formData.duracion
      };

      await createClientSession(formData.clienteUid, sessionData);
      
      setNotification({
        type: 'success',
        message: 'Sesión registrada exitosamente'
      });
      
      // Resetear formulario
      setFormData({
        clienteUid: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().slice(0, 5),
        duracion: 60,
        notas: '',
        progreso: '',
        evaluacion: 5
      });
      
      setTimeout(() => {
        onSessionCreated();
      }, 1500);
      
    } catch (error) {
      console.error('Error creating session:', error);
      setNotification({
        type: 'error',
        message: 'Error al registrar la sesión'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {notification && (
        <GlassNotification
          title={notification.type === 'success' ? 'Éxito' : 'Error'}
          message={notification.message}
          type={notification.type}
          isVisible={!!notification}
          onClose={() => setNotification(null)}
        />
      )}

      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-2xl">📑</span>
          <h3 className="text-xl font-semibold text-white">Nueva Sesión</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selección de Cliente */}
          <div>
            <label className="block text-white/80 text-sm mb-2">
              Cliente <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.clienteUid}
              onChange={(e) => setFormData({...formData, clienteUid: e.target.value})}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              required
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((client) => (
                <option key={client.uid} value={client.uid} className="text-black">
                  {client.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Fecha <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Hora <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({...formData, hora: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                required
              />
            </div>
          </div>

          {/* Duración */}
          <div>
            <label className="block text-white/80 text-sm mb-2">Duración (minutos)</label>
            <select
              value={formData.duracion}
              onChange={(e) => setFormData({...formData, duracion: parseInt(e.target.value)})}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value={30} className="text-black">30 minutos</option>
              <option value={45} className="text-black">45 minutos</option>
              <option value={60} className="text-black">60 minutos</option>
              <option value={90} className="text-black">90 minutos</option>
              <option value={120} className="text-black">120 minutos</option>
            </select>
          </div>

          {/* Notas de la Sesión */}
          <div>
            <label className="block text-white/80 text-sm mb-2">
              Notas de la Sesión <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({...formData, notas: e.target.value})}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white resize-none"
              rows={4}
              placeholder="Describe qué se trabajó en la sesión, temas tratados, ejercicios realizados..."
              required
            />
          </div>

          {/* Progreso Observado */}
          <div>
            <label className="block text-white/80 text-sm mb-2">Progreso Observado</label>
            <textarea
              value={formData.progreso}
              onChange={(e) => setFormData({...formData, progreso: e.target.value})}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white resize-none"
              rows={3}
              placeholder="¿Qué mejoras o cambios observaste en el cliente?"
            />
          </div>

          {/* Evaluación */}
          <div>
            <label className="block text-white/80 text-sm mb-2">
              Evaluación de la Sesión (1-5)
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({...formData, evaluacion: star})}
                    className={`
                      text-2xl transition-all duration-200
                      ${star <= formData.evaluacion ? 'text-yellow-400' : 'text-white/30'}
                      hover:text-yellow-400
                    `}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <span className="text-white/70">
                {formData.evaluacion === 1 ? 'Muy Básica' :
                 formData.evaluacion === 2 ? 'Básica' :
                 formData.evaluacion === 3 ? 'Regular' :
                 formData.evaluacion === 4 ? 'Buena' :
                 'Excelente'}
              </span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-4 pt-4">
            <GlassButton
              type="button"
              onClick={onCancel}
              variant="secondary"
              className="flex-1"
            >
              Cancelar
            </GlassButton>
            
            <GlassButton
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Registrando...</span>
                </div>
              ) : (
                'Registrar Sesión'
              )}
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default SessionForm;
