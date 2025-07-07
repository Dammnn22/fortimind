import { firestore } from '../config/firebase';
import { Subscription } from '../types/subscription';

// Create a new subscription in Firestore
export const createSubscription = async (subscriptionData: Subscription) => {
  const subscriptionRef = firestore.collection('subscriptions').doc(subscriptionData.id);
  await subscriptionRef.set(subscriptionData);
  return subscriptionRef.id;
};

// Update an existing subscription in Firestore
export const updateSubscription = async (subscriptionId: string, updates: Partial<Subscription>) => {
  const subscriptionRef = firestore.collection('subscriptions').doc(subscriptionId);
  await subscriptionRef.update(updates);
};

// Retrieve a subscription from Firestore
export const getSubscription = async (subscriptionId: string) => {
  const subscriptionRef = firestore.collection('subscriptions').doc(subscriptionId);
  const subscriptionDoc = await subscriptionRef.get();
  return subscriptionDoc.exists ? subscriptionDoc.data() as Subscription : null;
};

// Retrieve all subscriptions for a user
export const getUserSubscriptions = async (userId: string) => {
  const subscriptionsRef = firestore.collection('subscriptions');
  const snapshot = await subscriptionsRef.where('userId', '==', userId).get();
  return snapshot.docs.map(doc => doc.data() as Subscription);
};