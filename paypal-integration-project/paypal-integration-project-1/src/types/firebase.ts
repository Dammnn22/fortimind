export interface FirebaseUser {
  uid: string;
  email: string;
  displayName?: string;
  isPremium: boolean;
  premiumSince?: Date;
  subscriptionId?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planType: string;
  status: string;
  startTime?: Date;
  createdAt: Date;
  paypalSubscriptionId: string;
}

export interface FirestoreDocument {
  createdAt: Date;
  updatedAt?: Date;
}