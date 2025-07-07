import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin if not already done
if (!initializeApp.length) {
  initializeApp();
}

const db = getFirestore();
const auth = getAuth();

interface SubscriptionStatusRequest {
  userId: string;
  idToken: string;
}

export const getSubscriptionStatus = onRequest(
  {
    region: "us-central1",
    cors: true,
    timeoutSeconds: 30,
  },
  async (req, res) => {
    try {
      // Only allow POST requests
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
      }

      const { userId, idToken }: SubscriptionStatusRequest = req.body;

      if (!userId || !idToken) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Verify the Firebase ID token
      try {
        const decodedToken = await auth.verifyIdToken(idToken);
        if (decodedToken.uid !== userId) {
          res.status(403).json({ error: 'Unauthorized' });
          return;
        }
      } catch (error) {
        logger.error('Token verification failed:', error);
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      // Get user's subscription status
      const userDoc = await db.collection('users').doc(userId).get();
      const configDoc = await db.collection('users')
        .doc(userId)
        .collection('configuracion')
        .doc('subscription')
        .get();

      const userData = userDoc.exists ? userDoc.data() : {};
      const configData = configDoc.exists ? configDoc.data() : {};

      const subscriptionStatus = {
        isPremium: userData?.isPremium || false,
        status: configData?.status || 'inactive',
        paypalSubscriptionId: configData?.paypalSubscriptionId || null,
        activatedAt: configData?.activatedAt || null,
        lastPaymentAt: configData?.lastPaymentAt || null,
        deactivatedAt: configData?.deactivatedAt || null,
        needsReview: configData?.needsReview || false,
        reviewReason: configData?.reviewReason || null
      };

      res.status(200).json(subscriptionStatus);

    } catch (error) {
      logger.error('Error getting subscription status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

export const updateSubscriptionStatus = onRequest(
  {
    region: "us-central1",
    cors: true,
    timeoutSeconds: 30,
  },
  async (req, res) => {
    try {
      // Only allow POST requests
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
      }

      const { userId, idToken, paypalSubscriptionId, action } = req.body;

      if (!userId || !idToken || !paypalSubscriptionId || !action) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Verify the Firebase ID token
      try {
        const decodedToken = await auth.verifyIdToken(idToken);
        if (decodedToken.uid !== userId) {
          res.status(403).json({ error: 'Unauthorized' });
          return;
        }
      } catch (error) {
        logger.error('Token verification failed:', error);
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      const batch = db.batch();
      const userRef = db.collection('users').doc(userId);
      const configRef = db.collection('users').doc(userId).collection('configuracion').doc('subscription');

      if (action === 'activate') {
        // Activate premium subscription
        batch.set(userRef, {
          isPremium: true,
          premiumStatus: 'active',
          updatedAt: new Date()
        }, { merge: true });

        batch.set(configRef, {
          isPremium: true,
          status: 'active',
          paypalSubscriptionId,
          activatedAt: new Date(),
          updatedAt: new Date()
        }, { merge: true });

        logger.info(`Premium activated manually for user ${userId}`);

      } else if (action === 'deactivate') {
        // Deactivate premium subscription
        batch.update(userRef, {
          isPremium: false,
          premiumStatus: 'inactive',
          updatedAt: new Date()
        });

        batch.update(configRef, {
          isPremium: false,
          status: 'inactive',
          deactivatedAt: new Date(),
          deactivationReason: 'manual',
          updatedAt: new Date()
        });

        logger.info(`Premium deactivated manually for user ${userId}`);
      }

      await batch.commit();
      res.status(200).json({ success: true });

    } catch (error) {
      logger.error('Error updating subscription status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);
