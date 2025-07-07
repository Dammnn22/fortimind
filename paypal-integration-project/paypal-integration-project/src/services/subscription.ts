import { firestore } from '../config/firebase';
import { SubscriptionData } from '../types/subscription';

export const createSubscription = async (userId: string, subscriptionDetails: SubscriptionData) => {
    const subscriptionRef = firestore.collection('subscriptions').doc(userId);
    await subscriptionRef.set(subscriptionDetails);
    return subscriptionRef.id;
};

export const updateSubscription = async (userId: string, subscriptionDetails: Partial<SubscriptionData>) => {
    const subscriptionRef = firestore.collection('subscriptions').doc(userId);
    await subscriptionRef.update(subscriptionDetails);
};

export const getSubscription = async (userId: string) => {
    const subscriptionRef = firestore.collection('subscriptions').doc(userId);
    const subscriptionDoc = await subscriptionRef.get();
    return subscriptionDoc.exists ? subscriptionDoc.data() as SubscriptionData : null;
};