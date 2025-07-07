import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import PremiumFeaturesService, { PremiumFeature, UserLimits } from '../services/premiumFeatures';

export interface FeatureAccess {
  canAccess: boolean;
  isPremium: boolean;
  currentUsage?: number;
  limit?: number;
  remaining?: number;
  percentage?: number;
}

export interface PremiumStatus {
  isPremium: boolean;
  availableFeatures: PremiumFeature[];
  limitedFeatures: PremiumFeature[];
  lockedFeatures: PremiumFeature[];
  userLimits: UserLimits;
}

export const useFortiMindPremium = (featureId?: string) => {
  const { user, loading } = useAuth();
  const [featureAccess, setFeatureAccess] = useState<FeatureAccess | null>(null);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar acceso a una función específica
  const checkFeatureAccess = async (id: string) => {
    try {
      const access = await PremiumFeaturesService.canAccessFeature(id);
      const progress = await PremiumFeaturesService.getFeatureProgress(id);
      
      setFeatureAccess({
        ...access,
        percentage: progress.percentage
      });
    } catch (error) {
      console.error('Error checking feature access:', error);
      setFeatureAccess({ canAccess: false, isPremium: false });
    }
  };

  // Cargar estado premium completo
  const loadPremiumStatus = async () => {
    if (!user) {
      setPremiumStatus({
        isPremium: false,
        availableFeatures: [],
        limitedFeatures: [],
        lockedFeatures: [],
        userLimits: {
          habitsCreated: 0,
          goalsCreated: 0,
          meditationSessions: 0,
          challengeDaysCompleted: 0,
          aiChatMessages: 0
        }
      });
      setIsLoading(false);
      return;
    }

    try {
      const isPremium = await PremiumFeaturesService.isPremiumUser();
      const userLimits = await PremiumFeaturesService.getUserLimits();
      const { available, limited, locked } = await PremiumFeaturesService.getAvailableFeatures();

      setPremiumStatus({
        isPremium,
        availableFeatures: available,
        limitedFeatures: limited,
        lockedFeatures: locked,
        userLimits
      });
    } catch (error) {
      console.error('Error loading premium status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Incrementar uso de una función
  const incrementUsage = async (id: string) => {
    try {
      await PremiumFeaturesService.incrementUsage(id);
      // Recargar el estado después de incrementar
      if (featureId) {
        await checkFeatureAccess(featureId);
      }
      await loadPremiumStatus();
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  };

  // Verificar si puede usar una función específica
  const canUseFeature = (id: string): boolean => {
    if (!premiumStatus) return false;
    
    if (premiumStatus.isPremium) return true;
    
    const feature = PremiumFeaturesService.getPremiumFeatures().find(f => f.id === id);
    if (!feature || !feature.freeLimit) return false;
    
    const currentUsage = getCurrentUsage(id, premiumStatus.userLimits);
    return currentUsage < feature.freeLimit;
  };

  // Obtener uso actual de una función
  const getCurrentUsage = (id: string, limits: UserLimits): number => {
    switch (id) {
      case 'multiple_habits_goals':
        return Math.max(limits.habitsCreated, limits.goalsCreated);
      case 'challenges_30_days':
        return limits.challengeDaysCompleted;
      case 'unlimited_meditation':
        return limits.meditationSessions;
      case 'ai_chat':
        return limits.aiChatMessages;
      default:
        return 0;
    }
  };

  // Obtener progreso de una función
  const getFeatureProgress = (id: string) => {
    if (!premiumStatus) return null;
    
    const feature = PremiumFeaturesService.getPremiumFeatures().find(f => f.id === id);
    if (!feature || !feature.freeLimit) return null;
    
    const current = getCurrentUsage(id, premiumStatus.userLimits);
    const limit = feature.freeLimit;
    const percentage = Math.min(100, (current / limit) * 100);
    const remaining = Math.max(0, limit - current);
    
    return { current, limit, percentage, remaining };
  };

  useEffect(() => {
    loadPremiumStatus();
  }, [user]);

  useEffect(() => {
    if (featureId && user) {
      checkFeatureAccess(featureId);
    }
  }, [featureId, user]);

  return {
    // Estado general
    isLoading: loading || isLoading,
    isPremium: premiumStatus?.isPremium || false,
    
    // Acceso a función específica
    featureAccess,
    canAccess: featureAccess?.canAccess || false,
    
    // Estado premium completo
    premiumStatus,
    availableFeatures: premiumStatus?.availableFeatures || [],
    limitedFeatures: premiumStatus?.limitedFeatures || [],
    lockedFeatures: premiumStatus?.lockedFeatures || [],
    userLimits: premiumStatus?.userLimits,
    
    // Métodos
    checkFeatureAccess,
    incrementUsage,
    canUseFeature,
    getFeatureProgress,
    loadPremiumStatus
  };
};

export default useFortiMindPremium; 