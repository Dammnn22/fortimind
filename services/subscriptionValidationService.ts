import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from 'firebase/auth';

export interface SubscriptionStatus {
  isPremium: boolean;
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  paypalSubscriptionId?: string;
  activatedAt?: Date;
  lastPaymentAt?: Date;
  deactivatedAt?: Date;
  needsReview?: boolean;
  reviewReason?: string;
}

export interface PremiumFeatureAccess {
  canAccess: boolean;
  reason?: string;
  upgradeRequired?: boolean;
}

/**
 * Service to validate and manage premium subscriptions
 */
export class SubscriptionValidationService {
  
  private static subscriptionCache: Map<string, { data: SubscriptionStatus; timestamp: number }> = new Map();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get user's subscription status from Firestore
   */
  static async getSubscriptionStatus(user: User): Promise<SubscriptionStatus> {
    try {
      const cacheKey = user.uid;
      const cached = this.subscriptionCache.get(cacheKey);
      
      // Return cached data if still valid
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      // Get subscription data from Firestore
      const [userDoc, configDoc] = await Promise.all([
        getDoc(doc(db, 'users', user.uid)),
        getDoc(doc(db, 'users', user.uid, 'configuracion', 'subscription'))
      ]);

      const userData = userDoc.exists() ? userDoc.data() : {};
      const configData = configDoc.exists() ? configDoc.data() : {};

      const subscriptionStatus: SubscriptionStatus = {
        isPremium: userData.isPremium || false,
        status: configData.status || 'inactive',
        paypalSubscriptionId: configData.paypalSubscriptionId,
        activatedAt: configData.activatedAt?.toDate(),
        lastPaymentAt: configData.lastPaymentAt?.toDate(),
        deactivatedAt: configData.deactivatedAt?.toDate(),
        needsReview: configData.needsReview || false,
        reviewReason: configData.reviewReason
      };

      // Cache the result
      this.subscriptionCache.set(cacheKey, {
        data: subscriptionStatus,
        timestamp: Date.now()
      });

      return subscriptionStatus;

    } catch (error) {
      console.error('Error getting subscription status:', error);
      return {
        isPremium: false,
        status: 'inactive'
      };
    }
  }

  /**
   * Check if user can access a specific premium feature
   */
  static async canAccessPremiumFeature(
    user: User | null, 
    featureName: string
  ): Promise<PremiumFeatureAccess> {
    
    if (!user) {
      return {
        canAccess: false,
        reason: 'User not authenticated',
        upgradeRequired: true
      };
    }

    try {
      const subscriptionStatus = await this.getSubscriptionStatus(user);

      if (!subscriptionStatus.isPremium) {
        return {
          canAccess: false,
          reason: 'Premium subscription required',
          upgradeRequired: true
        };
      }

      if (subscriptionStatus.status !== 'active') {
        return {
          canAccess: false,
          reason: `Subscription is ${subscriptionStatus.status}`,
          upgradeRequired: true
        };
      }

      // Additional feature-specific validation could go here
      switch (featureName) {
        case 'ai_chat':
        case 'advanced_programs':
        case 'nutrition_plans':
        case 'priority_support':
          return { canAccess: true };
        
        default:
          return {
            canAccess: false,
            reason: 'Unknown premium feature',
            upgradeRequired: false
          };
      }

    } catch (error) {
      console.error('Error checking premium feature access:', error);
      return {
        canAccess: false,
        reason: 'Error validating subscription',
        upgradeRequired: false
      };
    }
  }

  /**
   * Clear subscription cache for a user (call after subscription changes)
   */
  static clearUserCache(userId: string) {
    this.subscriptionCache.delete(userId);
  }

  /**
   * Clear all subscription cache
   */
  static clearAllCache() {
    this.subscriptionCache.clear();
  }

  /**
   * Validate subscription status and show upgrade prompt if needed
   */
  static async validateAndPromptUpgrade(
    user: User | null,
    featureName: string,
    onUpgradeNeeded?: () => void
  ): Promise<boolean> {
    
    const access = await this.canAccessPremiumFeature(user, featureName);
    
    if (!access.canAccess && access.upgradeRequired && onUpgradeNeeded) {
      onUpgradeNeeded();
    }
    
    return access.canAccess;
  }

  /**
   * Get subscription status from Firebase Functions API (for real-time validation)
   */
  static async getServerSubscriptionStatus(user: User): Promise<SubscriptionStatus> {
    try {
      const idToken = await user.getIdToken();
      
      const response = await fetch(`${process.env.REACT_APP_FIREBASE_FUNCTIONS_URL}/getSubscriptionStatusAPI`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          idToken
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update cache with server data
      this.subscriptionCache.set(user.uid, {
        data: data,
        timestamp: Date.now()
      });

      return data;

    } catch (error) {
      console.error('Error getting server subscription status:', error);
      // Fallback to local Firestore data
      return this.getSubscriptionStatus(user);
    }
  }

  /**
   * Check if user's subscription needs review or attention
   */
  static async checkSubscriptionHealth(user: User): Promise<{
    isHealthy: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    
    const subscription = await this.getSubscriptionStatus(user);
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!subscription.isPremium) {
      return {
        isHealthy: true,
        issues: [],
        recommendations: []
      };
    }

    // Check for issues
    if (subscription.status !== 'active') {
      issues.push(`Subscription status is ${subscription.status}`);
      recommendations.push('Contact support to resolve subscription issues');
    }

    if (subscription.needsReview) {
      issues.push(`Subscription marked for review: ${subscription.reviewReason}`);
      recommendations.push('Check your PayPal account and payment methods');
    }

    // Check payment recency
    if (subscription.lastPaymentAt) {
      const daysSincePayment = Math.floor(
        (Date.now() - subscription.lastPaymentAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSincePayment > 35) {
        issues.push('No recent payments detected');
        recommendations.push('Verify your PayPal subscription is active');
      }
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      recommendations
    };
  }
}

export default SubscriptionValidationService;
