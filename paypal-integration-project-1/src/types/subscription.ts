export interface Subscription {
  id: string;
  userId: string;
  planType: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  startTime: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface SubscriptionStatus {
  isPremium: boolean;
  subscriptionId: string | null;
  activatedAt: Date | null;
  lastPaymentAt: Date | null;
  deactivatedAt: Date | null;
}