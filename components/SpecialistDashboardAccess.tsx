import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isAdmin, getSpecialistData } from '../services/specialistService';
import { SPECIALIST_ROUTES, SPECIALIST_TITLES, SpecialistType } from '../types/specialists';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';

const SpecialistDashboardAccess: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [userSpecialistData, setUserSpecialistData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Verificar si es admin
        const adminStatus = isAdmin(currentUser.uid);
        setUserIsAdmin(adminStatus);

        // Obtener datos de especialista si los tiene
        const specialistData = await getSpecialistData(currentUser.uid);
        setUserSpecialistData(specialistData);
      } catch (error) {
        console.error('Error checking specialist access:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [currentUser]);

  const handleDashboardAccess = (specialistType: SpecialistType) => {
    navigate(SPECIALIST_ROUTES[specialistType]);
  };

  if (loading) {
    return (
      <GlassCard className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-white/20 rounded w-1/2"></div>
        </div>
      </GlassCard>
    );
  }

  // Si no es admin ni especialista, no mostrar nada
  if (!userIsAdmin && !userSpecialistData) {
    return null;
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="text-2xl">👨‍⚕️</div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            {userIsAdmin ? 'Dashboards de Especialistas' : 'Mi Dashboard de Especialista'}
          </h3>
          <p className="text-white/70 text-sm">
            {userIsAdmin 
              ? 'Accede a los dashboards de especialistas como administrador' 
              : `Accede a tu dashboard como ${userSpecialistData.tipo}`
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Si es admin, mostrar todos los dashboards */}
        {userIsAdmin && (
          <>
            <GlassButton
              onClick={() => handleDashboardAccess('nutricion')}
              variant="primary"
              className="flex items-center space-x-2 justify-center"
            >
              <span>🥗</span>
              <span>Nutrición</span>
            </GlassButton>
            
            <GlassButton
              onClick={() => handleDashboardAccess('psicologia')}
              variant="primary"
              className="flex items-center space-x-2 justify-center"
            >
              <span>🧠</span>
              <span>Psicología</span>
            </GlassButton>
            
            <GlassButton
              onClick={() => handleDashboardAccess('entrenador')}
              variant="primary"
              className="flex items-center space-x-2 justify-center"
            >
              <span>💪</span>
              <span>Entrenador</span>
            </GlassButton>
          </>
        )}

        {/* Si es especialista pero no admin, mostrar solo su dashboard */}
        {!userIsAdmin && userSpecialistData && (
          <GlassButton
            onClick={() => handleDashboardAccess(userSpecialistData.tipo)}
            variant="primary"
            className="flex items-center space-x-2 justify-center col-span-full"
          >
            <span>
              {userSpecialistData.tipo === 'nutricion' ? '🥗' : 
               userSpecialistData.tipo === 'psicologia' ? '🧠' : '💪'}
            </span>
            <span>Mi Dashboard - {SPECIALIST_TITLES[userSpecialistData.tipo as SpecialistType]}</span>
          </GlassButton>
        )}
      </div>

      {/* Botón para configurar sistema de especialistas (solo admin) */}
      {userIsAdmin && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <GlassButton
            onClick={() => {
              // Importar y ejecutar la función de configuración
              import('../services/initializeSpecialists').then(({ setupSpecialistSystem }) => {
                setupSpecialistSystem().then(result => {
                  if (result.success) {
                    alert('Sistema de especialistas configurado correctamente');
                  } else {
                    alert('Error al configurar el sistema: ' + result.message);
                  }
                });
              });
            }}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            ⚙️ Configurar Sistema de Especialistas
          </GlassButton>
        </div>
      )}
    </GlassCard>
  );
};

export default SpecialistDashboardAccess;
