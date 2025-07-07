import { Firestore } from '@google-cloud/firestore';

const firestore = new Firestore();

export const saveUserData = async (userId: string, data: any) => {
  await firestore.collection('users').doc(userId).set(data, { merge: true });
};

export const getUserData = async (userId: string) => {
  const userDoc = await firestore.collection('users').doc(userId).get();
  return userDoc.exists ? userDoc.data() : null;
};

export const saveSubscriptionData = async (subscriptionId: string, data: any) => {
  await firestore.collection('subscriptions').doc(subscriptionId).set(data, { merge: true });
};

export const getSubscriptionData = async (subscriptionId: string) => {
  const subscriptionDoc = await firestore.collection('subscriptions').doc(subscriptionId).get();
  return subscriptionDoc.exists ? subscriptionDoc.data() : null;
};