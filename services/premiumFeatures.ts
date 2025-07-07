import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  freeLimit?: number;
  premiumBenefit?: string;
}

export interface UserLimits {
  habitsCreated: number;
  goalsCreated: number;
  meditationSessions: number;
  challengeDaysCompleted: number;
  aiChatMessages: number;
}

export class PremiumFeaturesService {
  private static readonly FREE_LIMITS = {
    habitsCreated: 3,
    goalsCreated: 3,
    meditationSessions: 3,
    challengeDaysCompleted: 10,
    aiChatMessages: 0
  };

  private static readonly PREMIUM_FEATURES: PremiumFeature[] = [
    {
      id: 'ai_chat',
      name: 'Chat con IAs (DeepSeek / Gemini)',
      description: 'Acceso ilimitado a mentoría y guía personalizada con IA',
      isPremium: true,
      premiumBenefit: 'Chat ilimitado con IA para mentoría personalizada'
    },
    {
      id: 'challenges_30_days',
      name: 'Retos de 30 días personalizados',
      description: 'Acceso completo a retos de ejercicio y nutrición con generación AI',
      isPremium: true,
      freeLimit: 10,
      premiumBenefit: '30 días completos + generación AI + XP completo'
    },
    {
      id: 'multiple_habits_goals',
      name: 'Hábitos y metas ilimitados',
      description: 'Crear múltiples hábitos y metas sin límites',
      isPremium: true,
      freeLimit: 3,
      premiumBenefit: 'Hábitos y metas ilimitados'
    },
    {
      id: 'ai_diary_analysis',
      name: 'Análisis AI del diario',
      description: 'Revisión automática de tu día por IA',
      isPremium: true,
      premiumBenefit: 'Insights personalizados de tu progreso diario'
    },
    {
      id: 'weekly_monthly_ai_summary',
      name: 'Resumen semanal/mensual con IA',
      description: 'Resúmenes personalizados de progreso y emociones',
      isPremium: true,
      premiumBenefit: 'Análisis profundo de tu progreso semanal/mensual'
    },
    {
      id: 'unlimited_meditation',
      name: 'Audio-terapias y meditaciones AI',
      description: 'Acceso completo a sesiones de meditación',
      isPremium: true,
      freeLimit: 3,
      premiumBenefit: 'Audio exclusivo desbloqueado cada semana'
    },
    {
      id: 'advanced_statistics',
      name: 'Estadísticas completas y comparaciones',
      description: 'Progreso detallado por categorías',
      isPremium: true,
      premiumBenefit: 'Análisis por disciplina, emociones, hábitos, etc.'
    },
    {
      id: 'exclusive_content',
      name: 'Contenido exclusivo',
      description: 'Ebooks, recursos extra y contenido premium',
      isPremium: true,
      premiumBenefit: 'Acceso a contenido exclusivo y recursos premium'
    },
    {
      id: 'customization_extra',
      name: 'Personalización extra',
      description: 'Desbloqueo de logros y personalización avanzada',
      isPremium: true,
      premiumBenefit: 'Personalización completa y logros desbloqueados'
    },
    {
      id: 'private_community',
      name: 'Comunidad privada',
      description: 'Acceso a comunidad exclusiva de usuarios premium',
      isPremium: true,
      premiumBenefit: 'Comunidad privada y soporte prioritario'
    }
  ];

  /**
   * Verificar si el usuario tiene acceso premium
   */
  static async isPremiumUser(): Promise<boolean> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      return false;
    }

    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.isPremium || false;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  /**
   * Obtener límites actuales del usuario
   */
  static async getUserLimits(): Promise<UserLimits> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      return {
        habitsCreated: 0,
        goalsCreated: 0,
        meditationSessions: 0,
        challengeDaysCompleted: 0,
        aiChatMessages: 0
      };
    }

    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          habitsCreated: userData.habitsCreated || 0,
          goalsCreated: userData.goalsCreated || 0,
          meditationSessions: userData.meditationSessions || 0,
          challengeDaysCompleted: userData.challengeDaysCompleted || 0,
          aiChatMessages: userData.aiChatMessages || 0
        };
      }
      
      return {
        habitsCreated: 0,
        goalsCreated: 0,
        meditationSessions: 0,
        challengeDaysCompleted: 0,
        aiChatMessages: 0
      };
    } catch (error) {
      console.error('Error getting user limits:', error);
      return {
        habitsCreated: 0,
        goalsCreated: 0,
        meditationSessions: 0,
        challengeDaysCompleted: 0,
        aiChatMessages: 0
      };
    }
  }

  /**
   * Verificar si el usuario puede acceder a una función específica
   */
  static async canAccessFeature(featureId: string): Promise<{
    canAccess: boolean;
    isPremium: boolean;
    currentUsage?: number;
    limit?: number;
    remaining?: number;
  }> {
    const isPremium = await this.isPremiumUser();
    const userLimits = await this.getUserLimits();
    const feature = this.PREMIUM_FEATURES.find(f => f.id === featureId);

    if (!feature) {
      return { canAccess: false, isPremium };
    }

    // Si es premium, tiene acceso completo
    if (isPremium) {
      return { canAccess: true, isPremium: true };
    }

    // Si no es premium, verificar límites
    if (feature.freeLimit) {
      const currentUsage = this.getCurrentUsage(featureId, userLimits);
      const canAccess = currentUsage < feature.freeLimit;
      
      return {
        canAccess,
        isPremium: false,
        currentUsage,
        limit: feature.freeLimit,
        remaining: Math.max(0, feature.freeLimit - currentUsage)
      };
    }

    // Si no tiene límite gratuito, es premium only
    return { canAccess: false, isPremium: false };
  }

  /**
   * Obtener todas las funciones premium disponibles
   */
  static getPremiumFeatures(): PremiumFeature[] {
    return this.PREMIUM_FEATURES;
  }

  /**
   * Obtener funciones que el usuario puede usar actualmente
   */
  static async getAvailableFeatures(): Promise<{
    available: PremiumFeature[];
    limited: PremiumFeature[];
    locked: PremiumFeature[];
  }> {
    const isPremium = await this.isPremiumUser();
    const userLimits = await this.getUserLimits();

    const available: PremiumFeature[] = [];
    const limited: PremiumFeature[] = [];
    const locked: PremiumFeature[] = [];

    for (const feature of this.PREMIUM_FEATURES) {
      if (isPremium) {
        available.push(feature);
      } else if (feature.freeLimit) {
        const currentUsage = this.getCurrentUsage(feature.id, userLimits);
        if (currentUsage < feature.freeLimit) {
          limited.push(feature);
        } else {
          locked.push(feature);
        }
      } else {
        locked.push(feature);
      }
    }

    return { available, limited, locked };
  }

  /**
   * Incrementar el contador de uso de una función
   */
  static async incrementUsage(featureId: string): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentValue = userData[`${featureId}Count`] || 0;
        
        await updateDoc(doc(db, 'users', user.uid), {
          [`${featureId}Count`]: currentValue + 1
        });
      }
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  }

  /**
   * Obtener el uso actual de una función específica
   */
  private static getCurrentUsage(featureId: string, userLimits: UserLimits): number {
    switch (featureId) {
      case 'multiple_habits_goals':
        return Math.max(userLimits.habitsCreated, userLimits.goalsCreated);
      case 'challenges_30_days':
        return userLimits.challengeDaysCompleted;
      case 'unlimited_meditation':
        return userLimits.meditationSessions;
      case 'ai_chat':
        return userLimits.aiChatMessages;
      default:
        return 0;
    }
  }

  /**
   * Obtener el progreso de uso de una función (para mostrar en UI)
   */
  static async getFeatureProgress(featureId: string): Promise<{
    current: number;
    limit: number;
    percentage: number;
    remaining: number;
  }> {
    const userLimits = await this.getUserLimits();
    const feature = this.PREMIUM_FEATURES.find(f => f.id === featureId);
    
    if (!feature || !feature.freeLimit) {
      return { current: 0, limit: 0, percentage: 0, remaining: 0 };
    }

    const current = this.getCurrentUsage(featureId, userLimits);
    const limit = feature.freeLimit;
    const percentage = Math.min(100, (current / limit) * 100);
    const remaining = Math.max(0, limit - current);

    return { current, limit, percentage, remaining };
  }
}

export default PremiumFeaturesService; 