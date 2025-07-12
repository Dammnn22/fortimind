import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Settings,
  Users,
  Star,
  Upload,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Brain,
  Apple,
  Dumbbell
} from 'lucide-react';
import { 
  getEspecialistaByUid, 
  getCitasEspecialista, 
  updateEspecialista,
  updateEstadoCita,
  createReporteIA,
  isUserEspecialista
} from '../services/especialistasService';
import { 
  Especialista, 
  CitaEspecialista, 
  ReporteIA, 
  DIAS_SEMANA, 
  HORARIOS_COMUNES,
  TipoSesion 
} from '../types/consultas';
import LoadingSpinner from '../../components/LoadingSpinner';

interface SpecialistDashboardProps {
  firebaseUser: User;
}

const SpecialistDashboard: React.FC<SpecialistDashboardProps> = ({ firebaseUser }) => {
  const navigate = useNavigate();
  const [especialista, setEspecialista] = useState<Especialista | null>(null);
  const [citas, setCitas] = useState<CitaEspecialista[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'citas' | 'disponibilidad' | 'tarifa' | 'reportes'>('citas');
  const [isEspecialista, setIsEspecialista] = useState(false);
  
  // Estados para modales
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState<CitaEspecialista | null>(null);
  const [reporteText, setReporteText] = useState('');
  const [reporteRecomendaciones, setReporteRecomendaciones] = useState('');
  const [reportePrivacidad, setReportePrivacidad] = useState<'privado' | 'contextual'>('contextual');

  useEffect(() => {
    loadData();
  }, [firebaseUser.uid]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Verificar si es especialista
      const esEspecialista = await isUserEspecialista(firebaseUser.uid);
      setIsEspecialista(esEspecialista);
      
      if (!esEspecialista) {
        return;
      }

      // Cargar datos del especialista
      const especialistaData = await getEspecialistaByUid(firebaseUser.uid);
      setEspecialista(especialistaData);

      if (especialistaData) {
        // Cargar citas del especialista
        const citasData = await getCitasEspecialista(especialistaData.uid);
        setCitas(citasData);
      }
    } catch (error) {
      console.error('Error loading specialist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (tipo: TipoSesion) => {
    switch (tipo) {
      case 'psicologo': return <Brain className="w-6 h-6" />;
      case 'nutricionista': return <Apple className="w-6 h-6" />;
      case 'coach': return <Dumbbell className="w-6 h-6" />;
      default: return <Users className="w-6 h-6" />;
    }
  };

  const getTypeColor = (tipo: TipoSesion) => {
    switch (tipo) {
      case 'psicologo': return 'from-blue-500 to-purple-600';
      case 'nutricionista': return 'from-green-500 to-emerald-600';
      case 'coach': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleUpdateDisponibilidad = async (dia: string, horas: string[]) => {
    if (!especialista) return;
    
    try {
      const newHorario = { ...especialista.horario, [dia]: horas };
      await updateEspecialista(especialista.uid, { horario: newHorario });
      setEspecialista({ ...especialista, horario: newHorario });
    } catch (error) {
      console.error('Error updating disponibilidad:', error);
    }
  };

  const handleUpdateTarifa = async (newTarifa: number) => {
    if (!especialista) return;
    
    try {
      await updateEspecialista(especialista.uid, { tarifa: newTarifa });
      setEspecialista({ ...especialista, tarifa: newTarifa });
    } catch (error) {
      console.error('Error updating tarifa:', error);
    }
  };

  const handleCompletarCita = async (cita: CitaEspecialista) => {
    try {
      await updateEstadoCita(cita.id, 'completado');
      setCitas(citas.map(c => c.id === cita.id ? { ...c, estado: 'completado' } : c));
    } catch (error) {
      console.error('Error completando cita:', error);
    }
  };

  const handleSubirReporte = async () => {
    if (!selectedCita || !especialista || !reporteText.trim()) return;

    try {
      const reporteData: Omit<ReporteIA, 'id' | 'createdAt'> = {
        consultaId: selectedCita.id,
        userId: selectedCita.userId,
        specialistId: especialista.uid,
        resumen: reporteText,
        recomendaciones: reporteRecomendaciones || undefined,
        autor: especialista.nombre,
        tipo: especialista.tipo,
        fecha: new Date(),
        privacidad: reportePrivacidad
      };

      await createReporteIA(reporteData);
      
      // Actualizar la cita con referencia al reporte
      const updatedCitas = citas.map(c => 
        c.id === selectedCita.id 
          ? { ...c, reporteEspecialista: 'submitted' }
          : c
      );
      setCitas(updatedCitas);

      // Limpiar modal
      setShowReportModal(false);
      setSelectedCita(null);
      setReporteText('');
      setReporteRecomendaciones('');
      setReportePrivacidad('contextual');
    } catch (error) {
      console.error('Error subiendo reporte:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!isEspecialista) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder al dashboard de especialistas.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (!especialista) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfil No Encontrado</h2>
          <p className="text-gray-600 mb-6">
            No se encontró tu perfil de especialista. Contacta al administrador.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${getTypeColor(especialista.tipo)} text-white`}>
                {getTypeIcon(especialista.tipo)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {especialista.nombre} {especialista.apellido}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {especialista.displayId}
                  </span>
                  <span className="capitalize">{especialista.tipo}</span>
                  <span className="flex items-center">
                    <DollarSign size={14} className="mr-1" />
                    ${especialista.tarifa} USD/sesión
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {citas.filter(c => c.estado === 'completado').length}
                </div>
                <div className="text-xs text-gray-500">Sesiones completadas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'citas', label: 'Mis Citas', icon: Calendar },
              { id: 'disponibilidad', label: 'Disponibilidad', icon: Clock },
              { id: 'tarifa', label: 'Tarifa', icon: DollarSign },
              { id: 'reportes', label: 'Reportes', icon: FileText }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'citas' && (
          <CitasTab 
            citas={citas} 
            onCompletarCita={handleCompletarCita}
            onSubirReporte={(cita) => {
              setSelectedCita(cita);
              setShowReportModal(true);
            }}
          />
        )}
        
        {activeTab === 'disponibilidad' && (
          <DisponibilidadTab 
            especialista={especialista}
            onUpdateDisponibilidad={handleUpdateDisponibilidad}
          />
        )}
        
        {activeTab === 'tarifa' && (
          <TarifaTab 
            tarifa={especialista.tarifa}
            onUpdateTarifa={handleUpdateTarifa}
          />
        )}
        
        {activeTab === 'reportes' && (
          <ReportesTab citas={citas.filter(c => c.estado === 'completado')} />
        )}
      </div>

      {/* Modal de Reporte */}
      {showReportModal && selectedCita && (
        <ReportModal
          cita={selectedCita}
          reporteText={reporteText}
          setReporteText={setReporteText}
          reporteRecomendaciones={reporteRecomendaciones}
          setReporteRecomendaciones={setReporteRecomendaciones}
          reportePrivacidad={reportePrivacidad}
          setReportePrivacidad={setReportePrivacidad}
          onSubmit={handleSubirReporte}
          onClose={() => {
            setShowReportModal(false);
            setSelectedCita(null);
            setReporteText('');
            setReporteRecomendaciones('');
          }}
        />
      )}
    </div>
  );
};

// Componente para la pestaña de citas
const CitasTab: React.FC<{
  citas: CitaEspecialista[];
  onCompletarCita: (cita: CitaEspecialista) => void;
  onSubirReporte: (cita: CitaEspecialista) => void;
}> = ({ citas, onCompletarCita, onSubirReporte }) => {
  const getEstadoBadge = (estado: string) => {
    const styles = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'confirmado': 'bg-blue-100 text-blue-800',
      'programado': 'bg-green-100 text-green-800',
      'completado': 'bg-gray-100 text-gray-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[estado] || 'bg-gray-100 text-gray-800'}`}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Mis Citas</h2>
        <div className="text-sm text-gray-500">
          {citas.length} citas en total
        </div>
      </div>

      <div className="grid gap-4">
        {citas.map(cita => (
          <div key={cita.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-medium text-gray-900">{cita.nombre}</h3>
                  {getEstadoBadge(cita.estado)}
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Calendar size={14} />
                    <span>{cita.fecha.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  
                  {cita.motivo && (
                    <div className="flex items-start space-x-2">
                      <FileText size={14} className="mt-0.5" />
                      <span>{cita.motivo}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign size={14} />
                    <span>${cita.precio || 0} USD</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {cita.estado === 'programado' && (
                  <button
                    onClick={() => onCompletarCita(cita)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Marcar Completada
                  </button>
                )}
                
                {cita.estado === 'completado' && !cita.reporteEspecialista && (
                  <button
                    onClick={() => onSubirReporte(cita)}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload size={14} />
                    <span>Subir Reporte</span>
                  </button>
                )}
                
                {cita.estado === 'completado' && cita.reporteEspecialista && (
                  <div className="flex items-center space-x-1 text-green-600 text-sm">
                    <CheckCircle size={14} />
                    <span>Reporte enviado</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {citas.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tienes citas programadas</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para la pestaña de disponibilidad
const DisponibilidadTab: React.FC<{
  especialista: Especialista;
  onUpdateDisponibilidad: (dia: string, horas: string[]) => void;
}> = ({ especialista, onUpdateDisponibilidad }) => {
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [tempHoras, setTempHoras] = useState<string[]>([]);

  const handleEditDay = (dia: string) => {
    setEditingDay(dia);
    setTempHoras(especialista.horario[dia] || []);
  };

  const handleSaveDay = () => {
    if (editingDay) {
      onUpdateDisponibilidad(editingDay, tempHoras);
      setEditingDay(null);
      setTempHoras([]);
    }
  };

  const toggleHora = (hora: string) => {
    setTempHoras(prev => 
      prev.includes(hora) 
        ? prev.filter(h => h !== hora)
        : [...prev, hora].sort()
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Configurar Disponibilidad</h2>
        <p className="text-gray-600">Define los días y horarios en que estás disponible para consultas</p>
      </div>

      <div className="grid gap-4">
        {DIAS_SEMANA.map(dia => (
          <div key={dia} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 capitalize">{dia}</h3>
              {editingDay === dia ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveDay}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingDay(null)}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditDay(dia)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Editar
                </button>
              )}
            </div>

            {editingDay === dia ? (
              <div className="grid grid-cols-4 gap-2">
                {HORARIOS_COMUNES.map(hora => (
                  <button
                    key={hora}
                    onClick={() => toggleHora(hora)}
                    className={`p-2 text-sm rounded border transition-colors ${
                      tempHoras.includes(hora)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {hora}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(especialista.horario[dia] || []).length > 0 ? (
                  especialista.horario[dia].map(hora => (
                    <span
                      key={hora}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded"
                    >
                      {hora}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No disponible</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para la pestaña de tarifa
const TarifaTab: React.FC<{
  tarifa: number;
  onUpdateTarifa: (tarifa: number) => void;
}> = ({ tarifa, onUpdateTarifa }) => {
  const [newTarifa, setNewTarifa] = useState(tarifa);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdateTarifa(newTarifa);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Configurar Tarifa</h2>
        <p className="text-gray-600">Define el precio por sesión de 50 minutos</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-md">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-700">Precio por sesión (USD)</label>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Editar
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="number"
                value={newTarifa}
                onChange={(e) => setNewTarifa(Number(e.target.value))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="25"
                min="1"
                max="500"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewTarifa(tarifa);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="text-3xl font-bold text-green-600">
            ${tarifa} USD
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para la pestaña de reportes
const ReportesTab: React.FC<{
  citas: CitaEspecialista[];
}> = ({ citas }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Historial de Reportes</h2>
        <p className="text-gray-600">Sesiones completadas y reportes enviados</p>
      </div>

      <div className="grid gap-4">
        {citas.map(cita => (
          <div key={cita.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{cita.nombre}</h3>
                <p className="text-sm text-gray-600">
                  {cita.fecha.toLocaleDateString('es-ES', { 
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle size={16} />
                <span className="text-sm">Reporte enviado</span>
              </div>
            </div>
          </div>
        ))}
        
        {citas.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay reportes enviados aún</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Modal para crear reporte
const ReportModal: React.FC<{
  cita: CitaEspecialista;
  reporteText: string;
  setReporteText: (text: string) => void;
  reporteRecomendaciones: string;
  setReporteRecomendaciones: (text: string) => void;
  reportePrivacidad: 'privado' | 'contextual';
  setReportePrivacidad: (privacy: 'privado' | 'contextual') => void;
  onSubmit: () => void;
  onClose: () => void;
}> = ({ 
  cita, 
  reporteText, 
  setReporteText, 
  reporteRecomendaciones,
  setReporteRecomendaciones,
  reportePrivacidad,
  setReportePrivacidad,
  onSubmit, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Crear Reporte - {cita.nombre}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resumen de la sesión *
              </label>
              <textarea
                value={reporteText}
                onChange={(e) => setReporteText(e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe brevemente el desarrollo de la sesión, observaciones importantes y progreso del paciente..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recomendaciones (opcional)
              </label>
              <textarea
                value={reporteRecomendaciones}
                onChange={(e) => setReporteRecomendaciones(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Recomendaciones para futuras sesiones o para el paciente..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacidad del reporte
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="contextual"
                    checked={reportePrivacidad === 'contextual'}
                    onChange={(e) => setReportePrivacidad(e.target.value as 'contextual')}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    <strong>Contextual:</strong> La IA puede usar este reporte para personalizar futuras respuestas
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="privado"
                    checked={reportePrivacidad === 'privado'}
                    onChange={(e) => setReportePrivacidad(e.target.value as 'privado')}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    <strong>Privado:</strong> Solo visible para profesionales, no se usa en IA
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onSubmit}
              disabled={!reporteText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar Reporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialistDashboard;
