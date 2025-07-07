import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

// Initialize Firebase Admin if not already done
if (!initializeApp.length) {
  initializeApp();
}

const db = getFirestore();

// Run every hour to check subscription statuses
export const checkSubscriptionStatus = onSchedule(
  {
    schedule: "0 * * * *", // Every hour
    timeZone: "UTC",
    region: "us-central1",
  },
  async (event) => {
    try {
      logger.info("Starting subscription status check");

      // Get all users with premium status
      const usersSnapshot = await db.collection('users')
        .where('isPremium', '==', true)
        .get();

      const promises = usersSnapshot.docs.map(async (userDoc) => {
        const userData = userDoc.data();
        const userId = userDoc.id;

        try {
          // Check subscription configuration
          const configDoc = await db.collection('users')
            .doc(userId)
            .collection('configuracion')
            .doc('subscription')
            .get();

          if (!configDoc.exists) {
            logger.warn(`No subscription config found for premium user ${userId}`);
            await deactivatePremiumUser(userId, 'missing_config');
            return;
          }

          const configData = configDoc.data()!;
          
          // Check if subscription is still valid
          if (configData.status !== 'active') {
            logger.info(`Deactivating premium for user ${userId} - status: ${configData.status}`);
            await deactivatePremiumUser(userId, configData.status);
            return;
          }

          // Check for payment failures or expired subscriptions
          const lastPayment = configData.lastPaymentAt?.toDate();
          const now = new Date();
          const daysSinceLastPayment = lastPayment 
            ? Math.floor((now.getTime() - lastPayment.getTime()) / (1000 * 60 * 60 * 24))
            : null;

          // If no payment in the last 35 days (allowing for monthly billing + grace period)
          if (daysSinceLastPayment && daysSinceLastPayment > 35) {
            logger.warn(`Subscription may be expired for user ${userId} - ${daysSinceLastPayment} days since last payment`);
            await markSubscriptionForReview(userId, 'payment_overdue');
          }

          // Check PayPal subscription status via API (optional - requires PayPal API integration)
          // await checkPayPalSubscriptionStatus(userId, configData.paypalSubscriptionId);

        } catch (error) {
          logger.error(`Error checking subscription for user ${userId}:`, error);
        }
      });

      await Promise.all(promises);
      logger.info(`Subscription check completed for ${usersSnapshot.docs.length} premium users`);

    } catch (error) {
      logger.error("Error in subscription status check:", error);
    }
  }
);

async function deactivatePremiumUser(userId: string, reason: string) {
  const batch = db.batch();

  // Update main user document
  const userRef = db.collection('users').doc(userId);
  batch.update(userRef, {
    isPremium: false,
    premiumStatus: 'inactive',
    deactivatedAt: new Date(),
    deactivationReason: reason,
    updatedAt: new Date()
  });

  // Update subscription config
  const configRef = db.collection('users').doc(userId).collection('configuracion').doc('subscription');
  batch.update(configRef, {
    isPremium: false,
    status: 'inactive',
    deactivatedAt: new Date(),
    deactivationReason: reason,
    updatedAt: new Date()
  });

  await batch.commit();
  
  logger.info(`Premium deactivated for user ${userId}, reason: ${reason}`);
}

async function markSubscriptionForReview(userId: string, reason: string) {
  await db.collection('users')
    .doc(userId)
    .collection('configuracion')
    .doc('subscription')
    .update({
      needsReview: true,
      reviewReason: reason,
      markedForReviewAt: new Date(),
      updatedAt: new Date()
    });

  logger.info(`Subscription marked for review: ${userId}, reason: ${reason}`);
}
