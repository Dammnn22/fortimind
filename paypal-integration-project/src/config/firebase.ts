import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export Firestore instance
const firestore = admin.firestore();
export { firestore };