import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  hasAccessToDashboard, 
  getSpecialistData, 
  getSpecialistClients, 
  getSpecialistSessions, 
  getSpecialistMetrics,
  createClientSession
} from '../services/specialistService';
import { SpecialistData, ClientInfo, ClientSession, SpecialistType } from '../types/specialists';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassNotification from '../components/GlassNotification';
import AnimatedBackground from '../components/AnimatedBackground';

interface SpecialistDashboardProps {
  specialistType: SpecialistType;
}

const SpecialistDashboard: React.FC<SpecialistDashboardProps> = ({ specialistType }) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [specialistData, setSpecialistData] = useState<SpecialistData | null>(null);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [sessions, setSessions] = useState<ClientSession[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'sessions' | 'settings'>('overview');
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  const [sessionForm, setSessionForm] = useState({
    clienteUid: '',
    notas: '',
    progreso: '',
    evaluacion: 5,
    duracion: 60
  });
  const [showSessionForm, setShowSessionForm] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const hasAccess = await hasAccessToDashboard(currentUser.uid, specialistType);
        
        if (!hasAccess) {
          setNotification({
            type: 'error',
            message: 'No tienes acceso a este dashboard'
          });
          setTimeout(() => navigate('/dashboard'), 2000);
          return;
        }

        setIsAuthorized(true);
        await loadDashboardData();
      } catch (error) {
        console.error('Error checking access:', error);
        setNotification({
          type: 'error',
          message: 'Error al verificar acceso'
        });
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [currentUser, navigate, specialistType]);

  const loadDashboardData = async () => {
    if (!currentUser) return;

    try {
      const [specialistInfo, clientsList, sessionsList, metricsData] = await Promise.all([
        getSpecialistData(currentUser.uid),
        getSpecialistClients(currentUser.uid),
        getSpecialistSessions(currentUser.uid, 10),
        getSpecialistMetrics(currentUser.uid)
      ]);

      setSpecialistData(specialistInfo);
      setClients(clientsList);
      setSessions(sessionsList);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar datos del dashboard'
      });
    }
  };

  const handleCreateSession = async () => {
    if (!currentUser || !sessionForm.clienteUid || !sessionForm.notas) {
      setNotification({
        type: 'error',
        message: 'Por favor completa todos los campos requeridos'
      });
      return;
    }

    try {
      const selectedClient = clients.find(c => c.uid === sessionForm.clienteUid);
      
      const sessionData = {
        especialista: {
          uid: currentUser.uid,
          nombre: specialistData?.nombre || currentUser.displayName || 'Especialista',
          tipo: specialistType
        },
        clienteUid: sessionForm.clienteUid,
        clienteNombre: selectedClient?.displayName || 'Cliente',
        fecha: new Date(),
        notas: sessionForm.notas,
        progreso: sessionForm.progreso,
        evaluacion: sessionForm.evaluacion,
        duracion: sessionForm.duracion
      };

      await createClientSession(sessionForm.clienteUid, sessionData);
      
      setNotification({
        type: 'success',
        message: 'Sesión creada exitosamente'
      });

      setShowSessionForm(false);
      setSessionForm({
        clienteUid: '',
        notas: '',
        progreso: '',
        evaluacion: 5,
        duracion: 60
      });

      await loadDashboardData();
    } catch (error) {
      console.error('Error creating session:', error);
      setNotification({
        type: 'error',
        message: 'Error al crear la sesión'
      });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Nunca';
    
    const timestamp = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return timestamp.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSpecialistTitle = (type: SpecialistType) => {
    const titles = {
      'nutricion': 'Dashboard de Nutrición',
      'psicologia': 'Dashboard de Psicología',
      'entrenador': 'Dashboard de Entrenamiento'
    };
    return titles[type] || 'Dashboard de Especialista';
  };

  const getSpecialistIcon = (type: SpecialistType) => {
    const icons = {
      'nutricion': '🥗',
      'psicologia': '🧠',
      'entrenador': '💪'
    };
    return icons[type] || '👨‍⚕️';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <GlassCard className="p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-center">Cargando dashboard...</p>
        </GlassCard>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <GlassCard className="p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>
            <p className="text-white/80">No tienes permisos para acceder a este dashboard</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <AnimatedBackground />
      
      {notification && (
        <GlassNotification
          title={notification.type === 'success' ? 'Éxito' : notification.type === 'error' ? 'Error' : 'Información'}
          message={notification.message}
          type={notification.type}
          isVisible={!!notification}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{getSpecialistIcon(specialistType)}</div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {getSpecialistTitle(specialistType)}
                  </h1>
                  <p className="text-white/80">
                    Bienvenido, {specialistData?.nombre || currentUser?.displayName || 'Especialista'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <GlassButton
                  onClick={() => navigate('/dashboard')}
                  variant="secondary"
                  size="sm"
                >
                  Volver al Dashboard
                </GlassButton>
                <GlassButton
                  onClick={() => setShowSessionForm(true)}
                  variant="primary"
                  size="sm"
                >
                  Nueva Sesión
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <GlassCard className="p-2">
            <div className="flex space-x-2">
              {[
                { id: 'overview', label: 'Resumen', icon: '📊' },
                { id: 'clients', label: 'Clientes', icon: '👥' },
                { id: 'sessions', label: 'Sesiones', icon: '📅' },
                { id: 'settings', label: 'Configuración', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${activeTab === tab.id 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Main Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <GlassCard className="p-6">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">👥</div>
                <div>
                  <p className="text-white/80 text-sm">Total Clientes</p>
                  <p className="text-2xl font-bold text-white">{metrics?.totalClientes || 0}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📅</div>
                <div>
                  <p className="text-white/80 text-sm">Total Sesiones</p>
                  <p className="text-2xl font-bold text-white">{metrics?.totalSesiones || 0}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">💰</div>
                <div>
                  <p className="text-white/80 text-sm">Tarifa por Sesión</p>
                  <p className="text-2xl font-bold text-white">${metrics?.tarifaPromedio || 0}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🕒</div>
                <div>
                  <p className="text-white/80 text-sm">Última Sesión</p>
                  <p className="text-sm font-bold text-white">
                    {formatDate(metrics?.ultimaSesion)}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <GlassCard key={client.uid} className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  {client.photoURL ? (
                    <img 
                      src={client.photoURL} 
                      alt={client.displayName}
                      className="w-12 h-12 rounded-full border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white text-xl">👤</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-semibold">{client.displayName}</h3>
                    <p className="text-white/60 text-sm">{client.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">Sesiones:</span>
                    <span className="text-white">{client.totalSesiones}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">Última sesión:</span>
                    <span className="text-white">{formatDate(client.ultimaSesion)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">Estado:</span>
                    <span className={`
                      px-2 py-1 rounded text-xs
                      ${client.estado === 'activo' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}
                    `}>
                      {client.estado}
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {sessions.map((session) => (
              <GlassCard key={session.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      Sesión con Cliente
                    </h3>
                    <p className="text-white/60 text-sm">
                      {formatDate(session.fecha)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 rounded-full bg-white/20 text-white text-sm">
                      {session.duracion} min
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-white/80 text-sm">Evaluación:</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span 
                            key={star}
                            className={`
                              text-sm
                              ${star <= session.evaluacion ? 'text-yellow-400' : 'text-white/30'}
                            `}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-white/80 text-sm font-medium mb-1">Notas de la sesión:</h4>
                    <p className="text-white text-sm">{session.notas}</p>
                  </div>
                  
                  {session.progreso && (
                    <div>
                      <h4 className="text-white/80 text-sm font-medium mb-1">Progreso:</h4>
                      <p className="text-white text-sm">{session.progreso}</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Información del Especialista</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-white/80 text-sm">Nombre:</label>
                  <p className="text-white">{specialistData?.nombre || 'No configurado'}</p>
                </div>
                <div>
                  <label className="text-white/80 text-sm">Tipo:</label>
                  <p className="text-white capitalize">{specialistData?.tipo || 'No configurado'}</p>
                </div>
                <div>
                  <label className="text-white/80 text-sm">Plataforma:</label>
                  <p className="text-white">{specialistData?.plataforma || 'No configurada'}</p>
                </div>
                <div>
                  <label className="text-white/80 text-sm">Tarifa por sesión:</label>
                  <p className="text-white">${specialistData?.tarifa || 0}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Horarios y Disponibilidad</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-white/80 text-sm">Días disponibles:</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(specialistData?.diasDisponibles || []).map((day) => (
                      <span 
                        key={day}
                        className="px-2 py-1 bg-white/20 text-white text-xs rounded"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-white/80 text-sm">Horario:</label>
                  <p className="text-white">
                    {typeof specialistData?.horario === 'string' 
                      ? specialistData.horario 
                      : specialistData?.horario 
                        ? `${specialistData.horario.inicio} - ${specialistData.horario.fin}`
                        : 'No configurado'
                    }
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {/* Session Form Modal */}
      {showSessionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="p-6 max-w-md w-full">
            <h3 className="text-white font-semibold text-lg mb-4">Nueva Sesión</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-white/80 text-sm block mb-1">Cliente:</label>
                <select
                  value={sessionForm.clienteUid}
                  onChange={(e) => setSessionForm({...sessionForm, clienteUid: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map((client) => (
                    <option key={client.uid} value={client.uid} className="text-black">
                      {client.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white/80 text-sm block mb-1">Duración (minutos):</label>
                <input
                  type="number"
                  value={sessionForm.duracion}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionForm({...sessionForm, duracion: parseInt(e.target.value) || 60})}
                  min={15}
                  max={120}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm block mb-1">Notas de la sesión:</label>
                <textarea
                  value={sessionForm.notas}
                  onChange={(e) => setSessionForm({...sessionForm, notas: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white resize-none"
                  rows={3}
                  placeholder="Describe qué se trabajó en la sesión..."
                />
              </div>

              <div>
                <label className="text-white/80 text-sm block mb-1">Progreso observado:</label>
                <textarea
                  value={sessionForm.progreso}
                  onChange={(e) => setSessionForm({...sessionForm, progreso: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white resize-none"
                  rows={2}
                  placeholder="¿Qué progreso observaste?"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm block mb-1">Evaluación (1-5):</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setSessionForm({...sessionForm, evaluacion: star})}
                      className={`
                        text-2xl transition-all duration-200
                        ${star <= sessionForm.evaluacion ? 'text-yellow-400' : 'text-white/30'}
                        hover:text-yellow-400
                      `}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <GlassButton
                onClick={() => setShowSessionForm(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </GlassButton>
              <GlassButton
                onClick={handleCreateSession}
                variant="primary"
                className="flex-1"
              >
                Crear Sesión
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default SpecialistDashboard;
