import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  hasAccessToDashboard, 
  getSpecialistData, 
  getSpecialistClients, 
  getSpecialistSessions, 
  getSpecialistMetrics
} from '../services/specialistService';
import { SpecialistData, ClientInfo, ClientSession, SpecialistType } from '../types/specialists';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassNotification from '../components/GlassNotification';
import AnimatedBackground from '../components/AnimatedBackground';
import ClientManagement from '../components/ClientManagement';
import ScheduleConfiguration from '../components/ScheduleConfiguration';
import SessionForm from '../components/SessionForm';

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
      'nutricionista': 'Dashboard Nutricionista',
      'psicologo': 'Dashboard Psicólogo',
      'coach': 'Dashboard Entrenador Personal'
    };
    return titles[type] || 'Dashboard de Especialista';
  };

  const getSpecialistIcon = (type: SpecialistType) => {
    const icons = {
      'nutricionista': '🥗',
      'psicologo': '🧠',
      'coach': '💪'
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
                { id: 'overview', label: 'Métricas', icon: '📊' },
                { id: 'clients', label: 'Clientes', icon: '👥' },
                { id: 'sessions', label: 'Sesiones', icon: '�' },
                { id: 'settings', label: 'Horario y Tarifa', icon: '⚙️' }
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

        {activeTab === 'clients' && currentUser && (
          <ClientManagement
            specialistUid={currentUser.uid}
            assignedClients={specialistData?.clientes || []}
            onClientsUpdate={loadDashboardData}
          />
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
          <ScheduleConfiguration
            specialistData={specialistData!}
            onDataUpdate={loadDashboardData}
          />
        )}
      </div>

      {/* Session Form Modal */}
      {showSessionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <SessionForm
            specialistData={specialistData!}
            clients={clients}
            onSessionCreated={() => {
              setShowSessionForm(false);
              loadDashboardData();
            }}
            onCancel={() => setShowSessionForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default SpecialistDashboard;
