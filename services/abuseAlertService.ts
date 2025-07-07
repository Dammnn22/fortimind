import { collection, doc, addDoc, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import AnalyticsService from './analyticsService';

export interface AdminAlert {
  id?: string;
  uid: string;
  email?: string;
  fecha: Timestamp;
  motivo: string;
  tipoAbuso: 'rate_limit_exceeded' | 'suspicious_activity' | 'resource_abuse' | 'api_abuse' | 'content_violation';
  severidad: 'low' | 'medium' | 'high' | 'critical';
  detalles: {
    accion: string;
    limite: number;
    cantidadDetectada: number;
    periodo: string;
    metadata?: any;
  };
  estado: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  resuelto: boolean;
  fechaResolucion?: Timestamp;
  adminQueResolvio?: string;
  notas?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AbuseThresholds {
  // Límites diarios
  dailyProgramCreations: number;
  dailyChallengeCreations: number;
  dailyAIRequests: number;
  dailyLoginAttempts: number;
  
  // Límites por hora
  hourlyProgramCreations: number;
  hourlyChallengeCreations: number;
  hourlyAIRequests: number;
  
  // Límites por minuto
  minutelyAIRequests: number;
  minutelyActions: number;
}

/**
 * Servicio para detectar y manejar alertas de abuso automáticamente
 */
export class AbuseAlertService {
  
  // Límites configurables de uso
  private static readonly DEFAULT_THRESHOLDS: AbuseThresholds = {
    // Límites diarios
    dailyProgramCreations: 20,
    dailyChallengeCreations: 15,
    dailyAIRequests: 100,
    dailyLoginAttempts: 50,
    
    // Límites por hora
    hourlyProgramCreations: 5,
    hourlyChallengeCreations: 3,
    hourlyAIRequests: 20,
    
    // Límites por minuto
    minutelyAIRequests: 5,
    minutelyActions: 10,
  };

  /**
   * Verificar si un usuario ha superado los límites y crear alerta si es necesario
   */
  static async checkAndCreateAlert(
    userId: string, 
    action: string, 
    userEmail?: string,
    thresholds: Partial<AbuseThresholds> = {}
  ): Promise<AdminAlert | null> {
    
    const limits = { ...this.DEFAULT_THRESHOLDS, ...thresholds };
    
    try {
      // Verificar diferentes tipos de abuso
      const abuseChecks = [
        this.checkDailyProgramCreations(userId, limits.dailyProgramCreations),
        this.checkDailyChallengeCreations(userId, limits.dailyChallengeCreations),
        this.checkDailyAIRequests(userId, limits.dailyAIRequests),
        this.checkHourlyActivity(userId, action, limits),
        this.checkMinutelyActivity(userId, action, limits),
      ];

      const results = await Promise.all(abuseChecks);
      
      // Encontrar la primera violación detectada
      const violation = results.find(result => result !== null);
      
      if (violation) {
        // Crear alerta en Firestore
        const alert = await this.createAlert(userId, userEmail, violation);
        
        // Notificar a administradores si hay alguno conectado
        await this.notifyAdministrators(alert);
        
        return alert;
      }
      
      return null;
      
    } catch (error) {
      console.error('Error checking for abuse:', error);
      return null;
    }
  }

  /**
   * Verificar creaciones diarias de programas de ejercicio
   */
  private static async checkDailyProgramCreations(userId: string, limit: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const query_ = query(
      collection(db, 'user_activity'),
      where('userId', '==', userId),
      where('action', '==', 'program_creation'),
      where('timestamp', '>=', Timestamp.fromDate(today))
    );
    
    const snapshot = await getDocs(query_);
    const count = snapshot.size;
    
    if (count > limit) {
      return {
        motivo: `Superado límite diario de creación de programas: ${count}/${limit}`,
        tipoAbuso: 'rate_limit_exceeded' as const,
        severidad: count > limit * 2 ? 'high' as const : 'medium' as const,
        detalles: {
          accion: 'program_creation',
          limite: limit,
          cantidadDetectada: count,
          periodo: 'daily',
          metadata: { timestamp: new Date().toISOString() }
        }
      };
    }
    
    return null;
  }

  /**
   * Verificar creaciones diarias de retos nutricionales
   */
  private static async checkDailyChallengeCreations(userId: string, limit: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const query_ = query(
      collection(db, 'user_activity'),
      where('userId', '==', userId),
      where('action', '==', 'challenge_creation'),
      where('timestamp', '>=', Timestamp.fromDate(today))
    );
    
    const snapshot = await getDocs(query_);
    const count = snapshot.size;
    
    if (count > limit) {
      return {
        motivo: `Superado límite diario de creación de retos: ${count}/${limit}`,
        tipoAbuso: 'rate_limit_exceeded' as const,
        severidad: count > limit * 2 ? 'high' as const : 'medium' as const,
        detalles: {
          accion: 'challenge_creation',
          limite: limit,
          cantidadDetectada: count,
          periodo: 'daily',
          metadata: { timestamp: new Date().toISOString() }
        }
      };
    }
    
    return null;
  }

  /**
   * Verificar solicitudes diarias de IA
   */
  private static async checkDailyAIRequests(userId: string, limit: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const query_ = query(
      collection(db, 'user_activity'),
      where('userId', '==', userId),
      where('action', 'in', ['ai_chat', 'ai_advice', 'program_creation', 'challenge_creation']),
      where('timestamp', '>=', Timestamp.fromDate(today))
    );
    
    const snapshot = await getDocs(query_);
    const count = snapshot.size;
    
    if (count > limit) {
      return {
        motivo: `Superado límite diario de uso de IA: ${count}/${limit}`,
        tipoAbuso: 'api_abuse' as const,
        severidad: count > limit * 3 ? 'critical' as const : count > limit * 2 ? 'high' as const : 'medium' as const,
        detalles: {
          accion: 'ai_requests',
          limite: limit,
          cantidadDetectada: count,
          periodo: 'daily',
          metadata: { timestamp: new Date().toISOString() }
        }
      };
    }
    
    return null;
  }

  /**
   * Verificar actividad por hora
   */
  private static async checkHourlyActivity(userId: string, action: string, limits: AbuseThresholds) {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    // Mapear acciones a límites por hora
    const hourlyLimits: Record<string, number> = {
      'program_creation': limits.hourlyProgramCreations,
      'challenge_creation': limits.hourlyChallengeCreations,
      'ai_chat': limits.hourlyAIRequests,
      'ai_advice': limits.hourlyAIRequests,
    };
    
    const limit = hourlyLimits[action];
    if (!limit) return null;
    
    const query_ = query(
      collection(db, 'user_activity'),
      where('userId', '==', userId),
      where('action', '==', action),
      where('timestamp', '>=', Timestamp.fromDate(oneHourAgo))
    );
    
    const snapshot = await getDocs(query_);
    const count = snapshot.size;
    
    if (count > limit) {
      return {
        motivo: `Superado límite por hora para ${action}: ${count}/${limit}`,
        tipoAbuso: 'rate_limit_exceeded' as const,
        severidad: count > limit * 2 ? 'high' as const : 'medium' as const,
        detalles: {
          accion: action,
          limite: limit,
          cantidadDetectada: count,
          periodo: 'hourly',
          metadata: { timestamp: new Date().toISOString() }
        }
      };
    }
    
    return null;
  }

  /**
   * Verificar actividad por minuto (para detectar ataques automatizados)
   */
  private static async checkMinutelyActivity(userId: string, action: string, limits: AbuseThresholds) {
    const oneMinuteAgo = new Date();
    oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);
    
    const query_ = query(
      collection(db, 'user_activity'),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(oneMinuteAgo))
    );
    
    const snapshot = await getDocs(query_);
    const count = snapshot.size;
    
    // Límite general por minuto
    if (count > limits.minutelyActions) {
      return {
        motivo: `Actividad sospechosa: ${count} acciones en 1 minuto (límite: ${limits.minutelyActions})`,
        tipoAbuso: 'suspicious_activity' as const,
        severidad: 'high' as const,
        detalles: {
          accion: 'multiple_actions',
          limite: limits.minutelyActions,
          cantidadDetectada: count,
          periodo: 'minutely',
          metadata: { 
            timestamp: new Date().toISOString(),
            possibleBot: count > limits.minutelyActions * 2
          }
        }
      };
    }
    
    // Límite específico para IA por minuto
    if (action.includes('ai') || action.includes('program') || action.includes('challenge')) {
      const aiActions = snapshot.docs.filter(doc => {
        const actionType = doc.data().action;
        return actionType.includes('ai') || actionType.includes('program') || actionType.includes('challenge');
      });
      
      if (aiActions.length > limits.minutelyAIRequests) {
        return {
          motivo: `Uso excesivo de IA: ${aiActions.length} solicitudes en 1 minuto (límite: ${limits.minutelyAIRequests})`,
          tipoAbuso: 'api_abuse' as const,
          severidad: 'critical' as const,
          detalles: {
            accion: 'ai_spam',
            limite: limits.minutelyAIRequests,
            cantidadDetectada: aiActions.length,
            periodo: 'minutely',
            metadata: { 
              timestamp: new Date().toISOString(),
              possibleAttack: true
            }
          }
        };
      }
    }
    
    return null;
  }

  /**
   * Crear alerta en Firestore
   */
  private static async createAlert(
    userId: string, 
    userEmail: string | undefined, 
    violation: any
  ): Promise<AdminAlert> {
    
    const alert: Omit<AdminAlert, 'id'> = {
      uid: userId,
      email: userEmail,
      fecha: Timestamp.now(),
      motivo: violation.motivo,
      tipoAbuso: violation.tipoAbuso,
      severidad: violation.severidad,
      detalles: violation.detalles,
      estado: 'pending',
      resuelto: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    try {
      const docRef = await addDoc(collection(db, 'admin_alerts'), alert);
      console.log(`🚨 Alerta de abuso creada para usuario ${userId}: ${violation.motivo}`);
      
      // 📊 Track abuse alert en Analytics
      AnalyticsService.trackAbuseAlert(violation.tipoAbuso, violation.severidad);
      
      return { ...alert, id: docRef.id };
      
    } catch (error) {
      console.error('Error creating abuse alert:', error);
      throw error;
    }
  }

  /**
   * Obtener alertas pendientes
   */
  static async getPendingAlerts(): Promise<AdminAlert[]> {
    try {
      const query_ = query(
        collection(db, 'admin_alerts'),
        where('estado', '==', 'pending'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(query_);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AdminAlert));
      
    } catch (error) {
      console.error('Error fetching pending alerts:', error);
      return [];
    }
  }

  /**
   * Obtener todas las alertas de un usuario
   */
  static async getUserAlerts(userId: string): Promise<AdminAlert[]> {
    try {
      const query_ = query(
        collection(db, 'admin_alerts'),
        where('uid', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(query_);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AdminAlert));
      
    } catch (error) {
      console.error('Error fetching user alerts:', error);
      return [];
    }
  }

  /**
   * Marcar alerta como resuelta
   */
  static async resolveAlert(alertId: string, adminId: string, notas?: string): Promise<void> {
    try {
      const alertRef = doc(db, 'admin_alerts', alertId);
      await addDoc(collection(alertRef, 'updates'), {
        estado: 'resolved',
        resuelto: true,
        fechaResolucion: Timestamp.now(),
        adminQueResolvio: adminId,
        notas: notas || '',
        updatedAt: Timestamp.now(),
      });
      
      console.log(`✅ Alerta ${alertId} marcada como resuelta por ${adminId}`);
      
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }

  /**
   * Notificar a administradores conectados
   */
  private static async notifyAdministrators(alert: AdminAlert): Promise<void> {
    try {
      // Verificar si hay administradores conectados
      const adminUsersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'admin')
      );
      
      const adminSnapshot = await getDocs(adminUsersQuery);
      
      if (adminSnapshot.empty) {
        console.log('No se encontraron administradores para notificar');
        return;
      }

      // Crear notificación para cada administrador
      const notificationPromises = adminSnapshot.docs.map(async (adminDoc) => {
        const notification = {
          userId: adminDoc.id,
          title: `🚨 Alerta de Abuso Detectada`,
          message: `Usuario ${alert.email || alert.uid} - ${alert.motivo}`,
          type: 'security_alert',
          severity: alert.severidad,
          data: {
            alertId: alert.id,
            userId: alert.uid,
            abuseType: alert.tipoAbuso,
            details: alert.detalles
          },
          read: false,
          createdAt: Timestamp.now(),
          expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 días
        };

        return addDoc(collection(db, 'admin_notifications'), notification);
      });

      await Promise.all(notificationPromises);
      
      console.log(`📧 Notificación enviada a ${adminSnapshot.size} administradores`);
      
    } catch (error) {
      console.error('Error notifying administrators:', error);
    }
  }

  /**
   * Verificar si un usuario tiene privilegios de administrador
   */
  static async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId),
        where('role', '==', 'admin')
      );
      
      const snapshot = await getDocs(userQuery);
      return !snapshot.empty;
      
    } catch (error) {
      console.error('Error checking admin privileges:', error);
      return false;
    }
  }

  /**
   * Obtener estadísticas de alertas para el dashboard
   */
  static async getAlertStats(): Promise<{
    totalAlerts: number;
    pendingAlerts: number;
    resolvedAlerts: number;
    criticalAlerts: number;
    alertsByType: Record<string, number>;
    alertsBySeverity: Record<string, number>;
  }> {
    try {
      const allAlertsSnapshot = await getDocs(collection(db, 'admin_alerts'));
      const alerts = allAlertsSnapshot.docs.map(doc => doc.data() as AdminAlert);
      
      const stats = {
        totalAlerts: alerts.length,
        pendingAlerts: alerts.filter(a => a.estado === 'pending').length,
        resolvedAlerts: alerts.filter(a => a.estado === 'resolved').length,
        criticalAlerts: alerts.filter(a => a.severidad === 'critical').length,
        alertsByType: {} as Record<string, number>,
        alertsBySeverity: {} as Record<string, number>,
      };

      // Contar por tipo
      alerts.forEach(alert => {
        stats.alertsByType[alert.tipoAbuso] = (stats.alertsByType[alert.tipoAbuso] || 0) + 1;
        stats.alertsBySeverity[alert.severidad] = (stats.alertsBySeverity[alert.severidad] || 0) + 1;
      });

      return stats;
      
    } catch (error) {
      console.error('Error getting alert stats:', error);
      return {
        totalAlerts: 0,
        pendingAlerts: 0,
        resolvedAlerts: 0,
        criticalAlerts: 0,
        alertsByType: {},
        alertsBySeverity: {},
      };
    }
  }
}

export default AbuseAlertService;
