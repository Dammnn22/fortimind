import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AnalyticsService from '../services/analyticsService';

/**
 * Hook para tracking automático de páginas con Google Analytics
 */
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Mapear rutas a nombres amigables
    const getPageName = (pathname: string): string => {
      const routeMap: Record<string, string> = {
        '/': 'Dashboard Principal',
        '/dashboard': 'Dashboard Principal',
        '/goals': 'Objetivos',
        '/habits': 'Hábitos',
        '/streaks': 'Rachas',
        '/challenges': 'Retos',
        '/exercise-challenge': 'Reto de Ejercicio',
        '/nutrition-challenge': 'Reto Nutricional',
        '/focus': 'Enfoque',
        '/journal': 'Diario',
        '/learn': 'Aprender',
        '/support': 'Soporte',
        '/statistics': 'Estadísticas',
        '/settings': 'Configuración',
        '/subscription': 'Suscripción',
        '/admin-dashboard': 'Dashboard Admin',
        '/login': 'Inicio de Sesión',
        '/exercise-demo': 'Demo Programas Ejercicio',
        '/nutrition-demo': 'Demo Retos Nutrición',
        '/test': 'Página de Pruebas',
      };

      return routeMap[pathname] || pathname;
    };

    // Determinar sección de la app
    const getSection = (pathname: string): string => {
      if (pathname.includes('admin')) return 'administration';
      if (pathname.includes('challenge') || pathname.includes('exercise') || pathname.includes('nutrition')) return 'content_creation';
      if (pathname.includes('subscription') || pathname.includes('premium')) return 'monetization';
      if (pathname.includes('settings') || pathname.includes('support')) return 'user_management';
      if (pathname.includes('statistics') || pathname.includes('dashboard')) return 'analytics';
      if (pathname.includes('demo') || pathname.includes('test')) return 'testing';
      return 'main_app';
    };

    const pageName = getPageName(location.pathname);
    const section = getSection(location.pathname);

    // Track page view
    AnalyticsService.trackPageView(pageName, section);

  }, [location]);
};

/**
 * Hook específico para tracking de features/funciones
 */
export const useFeatureTracking = () => {
  
  const trackFeatureClick = (featureName: string, context?: Record<string, any>) => {
    AnalyticsService.trackFeatureUsage(featureName, context);
  };

  const trackConversion = (conversionType: string, value?: number) => {
    AnalyticsService.trackConversion(conversionType, value);
  };

  const trackError = (errorType: string, errorMessage: string, context?: string) => {
    AnalyticsService.trackError(errorType, errorMessage, context);
  };

  const trackAchievement = (achievement: string, value?: number) => {
    AnalyticsService.trackAchievement(achievement, value);
  };

  return {
    trackFeatureClick,
    trackConversion,
    trackError,
    trackAchievement,
  };
};

/**
 * Hook para tracking de session engagement
 */
export const useSessionTracking = () => {
  useEffect(() => {
    const startTime = Date.now();
    let actionCount = 0;

    // Trackear clics y acciones del usuario
    const trackAction = () => {
      actionCount++;
    };

    // Agregar listeners
    document.addEventListener('click', trackAction);
    document.addEventListener('keydown', trackAction);

    // Cleanup al desmontar o cambiar de página
    return () => {
      document.removeEventListener('click', trackAction);
      document.removeEventListener('keydown', trackAction);

      // Calcular tiempo de sesión
      const sessionTime = Math.round((Date.now() - startTime) / 1000 / 60); // en minutos

      // Solo trackear sesiones de más de 30 segundos
      if (sessionTime > 0.5) {
        AnalyticsService.trackEngagement(sessionTime, actionCount);
      }
    };
  }, []);
};

export default usePageTracking;
