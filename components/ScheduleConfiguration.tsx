import React, { useState } from 'react';
import { SpecialistData } from '../types/specialists';
import { updateSpecialistData } from '../services/specialistService';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import GlassNotification from './GlassNotification';

interface ScheduleConfigurationProps {
  specialistData: SpecialistData;
  onDataUpdate: () => void;
}

const ScheduleConfiguration: React.FC<ScheduleConfigurationProps> = ({
  specialistData,
  onDataUpdate
}) => {
  const [formData, setFormData] = useState({
    diasDisponibles: specialistData.diasDisponibles || [],
    horario: specialistData.horario || { inicio: '09:00', fin: '17:00' },
    tarifa: specialistData.tarifa || 0,
    plataforma: specialistData.plataforma || 'Zoom'
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const diasSemana = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];

  const plataformas = [
    'Zoom', 'Google Meet', 'Jitsi', 'Presencial', 'Otros'
  ];

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      diasDisponibles: prev.diasDisponibles.includes(day)
        ? prev.diasDisponibles.filter(d => d !== day)
        : [...prev.diasDisponibles, day]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateSpecialistData(specialistData.uid, {
        ...formData,
        fechaActualizacion: new Date()
      });
      
      setNotification({
        type: 'success',
        message: 'Configuración guardada exitosamente'
      });
      
      onDataUpdate();
    } catch (error) {
      console.error('Error saving configuration:', error);
      setNotification({
        type: 'error',
        message: 'Error al guardar la configuración'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <GlassNotification
          title={notification.type === 'success' ? 'Éxito' : 'Error'}
          message={notification.message}
          type={notification.type}
          isVisible={!!notification}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Días Disponibles */}
      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">📅</span>
          <h3 className="text-lg font-semibold text-white">Días Disponibles</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {diasSemana.map(day => (
            <button
              key={day}
              onClick={() => handleDayToggle(day)}
              className={`
                p-3 rounded-lg text-sm font-medium transition-all duration-200
                ${formData.diasDisponibles.includes(day)
                  ? 'bg-blue-500/30 text-blue-200 border-2 border-blue-400'
                  : 'bg-white/10 text-white/70 border-2 border-white/20 hover:bg-white/20'
                }
              `}
            >
              {day}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Horario */}
      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">🕐</span>
          <h3 className="text-lg font-semibold text-white">Horario de Atención</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Hora de Inicio</label>
            <input
              type="time"
              value={formData.horario.inicio}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                horario: { ...prev.horario, inicio: e.target.value }
              }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>
          
          <div>
            <label className="block text-white/80 text-sm mb-2">Hora de Fin</label>
            <input
              type="time"
              value={formData.horario.fin}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                horario: { ...prev.horario, fin: e.target.value }
              }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>
        </div>
      </GlassCard>

      {/* Tarifa */}
      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">💰</span>
          <h3 className="text-lg font-semibold text-white">Tarifa por Sesión</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Precio (COP)</label>
            <input
              type="number"
              value={formData.tarifa}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                tarifa: parseInt(e.target.value) || 0
              }))}
              placeholder="75000"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>
          
          <div>
            <label className="block text-white/80 text-sm mb-2">Plataforma</label>
            <select
              value={formData.plataforma}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                plataforma: e.target.value as any
              }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              {plataformas.map(plataforma => (
                <option key={plataforma} value={plataforma} className="text-black">
                  {plataforma}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Información Adicional */}
      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">ℹ️</span>
          <h3 className="text-lg font-semibold text-white">Información Actual</h3>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/80">Tipo de Especialista:</span>
            <span className="text-white capitalize">{specialistData.tipo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/80">Email:</span>
            <span className="text-white">{specialistData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/80">Clientes Asignados:</span>
            <span className="text-white">{specialistData.clientes?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/80">Estado:</span>
            <span className={`
              px-2 py-1 rounded text-xs
              ${specialistData.activo ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}
            `}>
              {specialistData.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Botón de Guardar */}
      <div className="flex justify-end">
        <GlassButton
          onClick={handleSave}
          variant="primary"
          disabled={loading}
          className="min-w-[150px]"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </div>
          ) : (
            'Guardar Configuración'
          )}
        </GlassButton>
      </div>
    </div>
  );
};

export default ScheduleConfiguration;
