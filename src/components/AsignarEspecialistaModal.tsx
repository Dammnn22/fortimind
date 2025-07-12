import React, { useState } from 'react';
import { X, User, Stethoscope, Calendar, Clock, Tag, FileText, Plus, Trash2 } from 'lucide-react';
import { TipoSesion, DIAS_SEMANA, HORARIOS_COMUNES } from '../types/consultas';
import { AsignarEspecialistaData, asignarEspecialista, generateUniqueDisplayId } from '../services/userManagementService';
import LoadingSpinner from '../../components/LoadingSpinner';

interface AsignarEspecialistaModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userEmail: string;
  onSuccess: () => void;
}

const AsignarEspecialistaModal: React.FC<AsignarEspecialistaModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  userEmail,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState(false);
  const [formData, setFormData] = useState<AsignarEspecialistaData>({
    tipo: 'psicologo',
    nombre: userName.split(' ')[0] || '',
    apellido: userName.split(' ').slice(1).join(' ') || '',
    displayId: '',
    tarifa: 50,
    diasDisponibles: [],
    horario: {},
    especialidades: [],
    experiencia: '',
    biografia: '',
    certificaciones: [],
    idiomas: ['español']
  });

  const [nuevaEspecialidad, setNuevaEspecialidad] = useState('');
  const [nuevaCertificacion, setNuevaCertificacion] = useState('');
  const [nuevoIdioma, setNuevoIdioma] = useState('');

  const handleGenerateDisplayId = async () => {
    setGeneratingId(true);
    try {
      const displayId = await generateUniqueDisplayId(formData.nombre);
      setFormData(prev => ({ ...prev, displayId }));
    } catch (error) {
      console.error('Error generando Display ID:', error);
    } finally {
      setGeneratingId(false);
    }
  };

  const handleDiaChange = (dia: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        diasDisponibles: [...prev.diasDisponibles, dia],
        horario: {
          ...prev.horario,
          [dia]: []
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        diasDisponibles: prev.diasDisponibles.filter(d => d !== dia),
        horario: Object.fromEntries(
          Object.entries(prev.horario).filter(([key]) => key !== dia)
        )
      }));
    }
  };

  const handleHorarioChange = (dia: string, hora: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      horario: {
        ...prev.horario,
        [dia]: checked
          ? [...(prev.horario[dia] || []), hora].sort()
          : (prev.horario[dia] || []).filter(h => h !== hora)
      }
    }));
  };

  const addEspecialidad = () => {
    if (nuevaEspecialidad.trim()) {
      setFormData(prev => ({
        ...prev,
        especialidades: [...prev.especialidades, nuevaEspecialidad.trim()]
      }));
      setNuevaEspecialidad('');
    }
  };

  const removeEspecialidad = (index: number) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.filter((_, i) => i !== index)
    }));
  };

  const addCertificacion = () => {
    if (nuevaCertificacion.trim()) {
      setFormData(prev => ({
        ...prev,
        certificaciones: [...(prev.certificaciones || []), nuevaCertificacion.trim()]
      }));
      setNuevaCertificacion('');
    }
  };

  const removeCertificacion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certificaciones: (prev.certificaciones || []).filter((_, i) => i !== index)
    }));
  };

  const addIdioma = () => {
    if (nuevoIdioma.trim() && !formData.idiomas?.includes(nuevoIdioma.trim())) {
      setFormData(prev => ({
        ...prev,
        idiomas: [...(prev.idiomas || []), nuevoIdioma.trim()]
      }));
      setNuevoIdioma('');
    }
  };

  const removeIdioma = (index: number) => {
    setFormData(prev => ({
      ...prev,
      idiomas: (prev.idiomas || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      alert('Nombre y apellido son requeridos');
      return;
    }
    
    if (!formData.displayId.trim()) {
      alert('Display ID es requerido');
      return;
    }
    
    if (formData.diasDisponibles.length === 0) {
      alert('Debe seleccionar al menos un día disponible');
      return;
    }
    
    if (formData.especialidades.length === 0) {
      alert('Debe agregar al menos una especialidad');
      return;
    }
    
    if (!formData.experiencia.trim()) {
      alert('La experiencia es requerida');
      return;
    }

    // Verificar que cada día tenga al menos un horario
    for (const dia of formData.diasDisponibles) {
      if (!formData.horario[dia] || formData.horario[dia].length === 0) {
        alert(`Debe seleccionar al menos un horario para ${dia}`);
        return;
      }
    }
    
    setLoading(true);
    try {
      const result = await asignarEspecialista(userId, formData);
      
      if (result.success) {
        alert(`✅ ${result.message}\nDisplay ID: ${result.displayId}`);
        onSuccess();
        onClose();
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error inesperado al asignar especialista');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <Stethoscope className="text-green-600" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Asignar Rol de Especialista
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Usuario: {userName} ({userEmail})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <User size={16} className="inline mr-1" />
                Tipo de Especialista *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as TipoSesion }))}
                className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                required
              >
                <option value="psicologo">Psicólogo</option>
                <option value="nutricionista">Nutricionista</option>
                <option value="coach">Coach</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tarifa (USD) *</label>
              <input
                type="number"
                min="10"
                max="500"
                value={formData.tarifa}
                onChange={(e) => setFormData(prev => ({ ...prev, tarifa: Number(e.target.value) }))}
                className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nombre *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Apellido *</label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                required
              />
            </div>
          </div>

          {/* Display ID */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Display ID (Estilo Discord) *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.displayId}
                onChange={(e) => setFormData(prev => ({ ...prev, displayId: e.target.value }))}
                placeholder="Ej: PsicoMario#1234"
                className="flex-1 p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                required
              />
              <button
                type="button"
                onClick={handleGenerateDisplayId}
                disabled={generatingId}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {generatingId ? <LoadingSpinner size={16} /> : 'Generar'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Formato: Nombre#1234 (será único en el sistema)
            </p>
          </div>

          {/* Días y Horarios */}
          <div>
            <label className="block text-sm font-medium mb-3">
              <Calendar size={16} className="inline mr-1" />
              Días Disponibles y Horarios *
            </label>
            
            <div className="space-y-4">
              {DIAS_SEMANA.map(dia => (
                <div key={dia} className="border rounded-lg p-4 dark:border-slate-600">
                  <div className="flex items-center space-x-3 mb-3">
                    <input
                      type="checkbox"
                      id={dia}
                      checked={formData.diasDisponibles.includes(dia)}
                      onChange={(e) => handleDiaChange(dia, e.target.checked)}
                      className="w-5 h-5"
                    />
                    <label htmlFor={dia} className="font-medium capitalize">
                      {dia}
                    </label>
                  </div>
                  
                  {formData.diasDisponibles.includes(dia) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 ml-8">
                      {HORARIOS_COMUNES.map(hora => (
                        <label key={hora} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={(formData.horario[dia] || []).includes(hora)}
                            onChange={(e) => handleHorarioChange(dia, hora, e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span>{hora}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Especialidades */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Tag size={16} className="inline mr-1" />
              Especialidades *
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={nuevaEspecialidad}
                onChange={(e) => setNuevaEspecialidad(e.target.value)}
                placeholder="Ej: Ansiedad, Depresión, TCC"
                className="flex-1 p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEspecialidad())}
              />
              <button
                type="button"
                onClick={addEspecialidad}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.especialidades.map((esp, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{esp}</span>
                  <button
                    type="button"
                    onClick={() => removeEspecialidad(index)}
                    className="hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Experiencia */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <FileText size={16} className="inline mr-1" />
              Experiencia *
            </label>
            <textarea
              value={formData.experiencia}
              onChange={(e) => setFormData(prev => ({ ...prev, experiencia: e.target.value }))}
              placeholder="Describe la experiencia profesional..."
              rows={3}
              className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              required
            />
          </div>

          {/* Biografía */}
          <div>
            <label className="block text-sm font-medium mb-2">Biografía</label>
            <textarea
              value={formData.biografia}
              onChange={(e) => setFormData(prev => ({ ...prev, biografia: e.target.value }))}
              placeholder="Descripción personal del especialista..."
              rows={2}
              className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
            />
          </div>

          {/* Certificaciones */}
          <div>
            <label className="block text-sm font-medium mb-2">Certificaciones</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={nuevaCertificacion}
                onChange={(e) => setNuevaCertificacion(e.target.value)}
                placeholder="Ej: Maestría en Psicología"
                className="flex-1 p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertificacion())}
              />
              <button
                type="button"
                onClick={addCertificacion}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-1">
              {(formData.certificaciones || []).map((cert, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 p-2 rounded">
                  <span className="text-sm">{cert}</span>
                  <button
                    type="button"
                    onClick={() => removeCertificacion(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Idiomas */}
          <div>
            <label className="block text-sm font-medium mb-2">Idiomas</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={nuevoIdioma}
                onChange={(e) => setNuevoIdioma(e.target.value)}
                placeholder="Ej: Inglés, Portugués"
                className="flex-1 p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIdioma())}
              />
              <button
                type="button"
                onClick={addIdioma}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.idiomas || []).map((idioma, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{idioma}</span>
                  {formData.idiomas && formData.idiomas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIdioma(index)}
                      className="hover:text-red-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size={16} />
                  <span>Asignando...</span>
                </>
              ) : (
                <>
                  <Stethoscope size={16} />
                  <span>Asignar Especialista</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AsignarEspecialistaModal;
