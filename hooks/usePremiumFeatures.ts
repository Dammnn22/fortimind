import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import SubscriptionValidationService, { SubscriptionStatus, PremiumFeatureAccess } from '../services/subscriptionValidationService';

export interface UsePremiumFeaturesResult {
  subscriptionStatus: SubscriptionStatus | null;
  loading: boolean;
  error: string | null;
  canAccessFeature: (featureName: string) => Promise<PremiumFeatureAccess>;
  refreshSubscription: () => Promise<void>;
  validateFeatureAccess: (featureName: string, onUpgradeNeeded?: () => void) => Promise<boolean>;
  isPremium: boolean;
  isActive: boolean;
}

/**
 * React hook for managing premium features and subscription validation
 */
export const usePremiumFeatures = (user: User | null): UsePremiumFeaturesResult => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load subscription status
  const loadSubscriptionStatus = useCallback(async () => {
    if (!user) {
      setSubscriptionStatus(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const status = await SubscriptionValidationService.getSubscriptionStatus(user);
      setSubscriptionStatus(status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subscription status';
      setError(errorMessage);
      console.error('Error loading subscription status:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh subscription from server
  const refreshSubscription = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Clear cache and get fresh data from server
      SubscriptionValidationService.clearUserCache(user.uid);
      const status = await SubscriptionValidationService.getServerSubscriptionStatus(user);
      setSubscriptionStatus(status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh subscription status';
      setError(errorMessage);
      console.error('Error refreshing subscription:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check if user can access a specific feature
  const canAccessFeature = useCallback(async (featureName: string): Promise<PremiumFeatureAccess> => {
    return SubscriptionValidationService.canAccessPremiumFeature(user, featureName);
  }, [user]);

  // Validate feature access and show upgrade prompt if needed
  const validateFeatureAccess = useCallback(async (
    featureName: string, 
    onUpgradeNeeded?: () => void
  ): Promise<boolean> => {
    return SubscriptionValidationService.validateAndPromptUpgrade(user, featureName, onUpgradeNeeded);
  }, [user]);

  // Load subscription status when user changes
  useEffect(() => {
    loadSubscriptionStatus();
  }, [loadSubscriptionStatus]);

  // Computed values
  const isPremium = subscriptionStatus?.isPremium || false;
  const isActive = subscriptionStatus?.status === 'active';

  return {
    subscriptionStatus,
    loading,
    error,
    canAccessFeature,
    refreshSubscription,
    validateFeatureAccess,
    isPremium,
    isActive
  };
};

export default usePremiumFeatures;
