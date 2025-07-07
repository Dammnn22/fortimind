import React, { useEffect, useState } from 'react';
import { useProgramCreationProtection, useChallengeCreationProtection } from '../hooks/useAbuseProtection';

interface AbuseProtectionAlertProps {
  type: 'program' | 'challenge';
  onLimitReached?: () => void;
  showStats?: boolean;
}

/**
 * Componente que muestra alertas sobre límites de creación y protección contra abuso
 */
export const AbuseProtectionAlert: React.FC<AbuseProtectionAlertProps> = ({
  type,
  onLimitReached,
  showStats = false
}) => {
  const programProtection = useProgramCreationProtection();
  const challengeProtection = useChallengeCreationProtection();
  
  const protection = type === 'program' ? programProtection : challengeProtection;
  const getRemainingFn = type === 'program' 
    ? programProtection.getRemainingPrograms 
    : challengeProtection.getRemainingChallenges;
  
  const [remaining, setRemaining] = useState<{ remaining: number; limit: number }>({ remaining: 0, limit: 0 });
  
  useEffect(() => {
    const checkLimits = async () => {
      try {
        const remainingData = await getRemainingFn();
        setRemaining(remainingData);
        
        if (remainingData.remaining <= 0 && onLimitReached) {
          onLimitReached();
        }
      } catch (error) {
        console.error('Error checking limits:', error);
      }
    };
    
    checkLimits();
  }, [getRemainingFn, onLimitReached]);
  
  // Refrescar estadísticas si se solicita
  useEffect(() => {
    if (showStats) {
      protection.refreshActivityStats();
    }
  }, [showStats, protection.refreshActivityStats]);
  
  const getAlertLevel = (): 'info' | 'warning' | 'error' => {
    const percentage = remaining.remaining / remaining.limit;
    if (percentage <= 0) return 'error';
    if (percentage <= 0.2) return 'warning';
    return 'info';
  };
  
  const getAlertMessage = (): string => {
    if (protection.isBlocked) {
      const timeText = protection.retryAfter 
        ? ` Inténtalo de nuevo en ${Math.ceil(protection.retryAfter / 60)} minutos.`
        : ' Contacta al soporte si esto persiste.';
      return `Has alcanzado el límite de creación.${timeText}`;
    }
    
    if (remaining.remaining <= 0) {
      return `Has alcanzado el límite de ${type === 'program' ? 'programas' : 'retos'} que puedes crear hoy.`;
    }
    
    if (remaining.remaining <= 2) {
      return `Te quedan ${remaining.remaining} ${type === 'program' ? 'programas' : 'retos'} disponibles para crear hoy.`;
    }
    
    return `Puedes crear ${remaining.remaining} ${type === 'program' ? 'programas' : 'retos'} más hoy.`;
  };
  
  const alertLevel = getAlertLevel();
  const alertMessage = getAlertMessage();
  
  // Solo mostrar si hay algo importante que comunicar
  if (!protection.isBlocked && remaining.remaining > 2 && !showStats) {
    return null;
  }
  
  return (
    <div className={`
      p-4 rounded-lg border mb-4 transition-all duration-200
      ${alertLevel === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
      ${alertLevel === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : ''}
      ${alertLevel === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
    `}>
      <div className="flex items-start space-x-3">
        <div className={`
          flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5
          ${alertLevel === 'error' ? 'bg-red-500' : ''}
          ${alertLevel === 'warning' ? 'bg-yellow-500' : ''}
          ${alertLevel === 'info' ? 'bg-blue-500' : ''}
        `}>
          {alertLevel === 'error' ? '!' : alertLevel === 'warning' ? '⚠' : 'ℹ'}
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-medium">
            {alertMessage}
          </p>
          
          {showStats && protection.activityStats && (
            <div className="mt-2 text-xs opacity-75">
              <p>Actividad últimas 24h: {protection.activityStats.totalActions24h} acciones</p>
              {Object.entries(protection.activityStats.actionBreakdown).map(([action, count]) => (
                <span key={action} className="inline-block mr-3">
                  {action}: {count}
                </span>
              ))}
            </div>
          )}
          
          {/* Barra de progreso visual */}
          {remaining.limit > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Usados: {remaining.limit - remaining.remaining}/{remaining.limit}</span>
                <span>Restantes: {remaining.remaining}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    alertLevel === 'error' ? 'bg-red-500' :
                    alertLevel === 'warning' ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ 
                    width: `${Math.max(0, ((remaining.limit - remaining.remaining) / remaining.limit) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
          
          {protection.isBlocked && protection.retryAfter && (
            <div className="mt-2">
              <CountdownTimer seconds={protection.retryAfter} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CountdownTimerProps {
  seconds: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ seconds }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };
  
  return (
    <div className="text-xs font-mono bg-white bg-opacity-50 px-2 py-1 rounded">
      Tiempo restante: {formatTime(timeLeft)}
    </div>
  );
};

export default AbuseProtectionAlert;
