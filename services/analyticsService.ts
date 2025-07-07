import { logEvent } from 'firebase/analytics';
import { analytics } from '../firebase';

/**
 * Servicio centralizado para tracking de eventos con Google Analytics
 */
export class AnalyticsService {
  
  /**
   * Registrar evento de creación de programa de ejercicio
   */
  static trackProgramCreation(programType: string, totalDays: number, difficulty: string) {
    if (analytics) {
      logEvent(analytics, 'crear_programa_ejercicio', {
        tipo_programa: programType,
        total_dias: totalDays,
        dificultad: difficulty,
        categoria: 'ejercicio'
      });
    }
  }

  /**
   * Registrar evento de creación de reto nutricional
   */
  static trackChallengeCreation(challengeType: string, totalDays: number, difficulty: string) {
    if (analytics) {
      logEvent(analytics, 'crear_reto_nutricional', {
        tipo_reto: challengeType,
        total_dias: totalDays,
        dificultad: difficulty,
        categoria: 'nutricion'
      });
    }
  }

  /**
   * Registrar uso de IA
   */
  static trackAIUsage(aiAction: string, context?: string) {
    if (analytics) {
      logEvent(analytics, 'uso_ia', {
        accion_ia: aiAction,
        contexto: context || 'general',
        categoria: 'ai'
      });
    }
  }

  /**
   * Registrar navegación a páginas importantes
   */
  static trackPageView(pageName: string, section?: string) {
    if (analytics) {
      logEvent(analytics, 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        seccion: section || 'general'
      });
    }
  }

  /**
   * Registrar interacciones con funciones premium
   */
  static trackPremiumInteraction(feature: string, action: 'attempt' | 'success' | 'upgrade_prompt') {
    if (analytics) {
      logEvent(analytics, 'interaccion_premium', {
        funcion_premium: feature,
        accion: action,
        categoria: 'premium'
      });
    }
  }

  /**
   * Registrar eventos de suscripción
   */
  static trackSubscription(action: 'start' | 'success' | 'cancel' | 'upgrade', plan?: string) {
    if (analytics) {
      logEvent(analytics, 'suscripcion', {
        accion_suscripcion: action,
        plan: plan || 'unknown',
        categoria: 'monetizacion'
      });
    }
  }

  /**
   * Registrar errores importantes
   */
  static trackError(errorType: string, errorMessage: string, context?: string) {
    if (analytics) {
      logEvent(analytics, 'error_aplicacion', {
        tipo_error: errorType,
        mensaje_error: errorMessage.substring(0, 100), // Limitar longitud
        contexto: context || 'unknown',
        categoria: 'error'
      });
    }
  }

  /**
   * Registrar logros y hitos del usuario
   */
  static trackAchievement(achievement: string, value?: number) {
    if (analytics) {
      logEvent(analytics, 'logro_usuario', {
        logro: achievement,
        valor: value || 1,
        categoria: 'engagement'
      });
    }
  }

  /**
   * Registrar tiempo de sesión y engagement
   */
  static trackEngagement(timeSpentMinutes: number, actionsCompleted: number) {
    if (analytics) {
      logEvent(analytics, 'engagement_session', {
        tiempo_minutos: timeSpentMinutes,
        acciones_completadas: actionsCompleted,
        categoria: 'engagement'
      });
    }
  }

  /**
   * Registrar alertas de abuso (para métricas administrativas)
   */
  static trackAbuseAlert(alertType: string, severity: string) {
    if (analytics) {
      logEvent(analytics, 'alerta_abuso', {
        tipo_alerta: alertType,
        severidad: severity,
        categoria: 'seguridad'
      });
    }
  }

  /**
   * Registrar uso de funciones específicas
   */
  static trackFeatureUsage(featureName: string, context?: Record<string, any>) {
    if (analytics) {
      logEvent(analytics, 'uso_funcion', {
        nombre_funcion: featureName,
        ...context,
        categoria: 'features'
      });
    }
  }

  /**
   * Registrar conversiones importantes
   */
  static trackConversion(conversionType: string, value?: number) {
    if (analytics) {
      logEvent(analytics, 'conversion', {
        tipo_conversion: conversionType,
        valor: value || 1,
        categoria: 'conversion'
      });
    }
  }
}

export default AnalyticsService;
