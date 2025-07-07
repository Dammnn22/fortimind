export interface Subscription {
  id: string;
  userId: string;
  planType: 'monthly' | 'yearly';
  status: 'active' | 'canceled' | 'expired';
  startTime: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  paypalSubscriptionId: string;
}

export interface SubscriptionPayload {
  userId: string;
  planType: 'monthly' | 'yearly';
  approvalUrl: string;
}