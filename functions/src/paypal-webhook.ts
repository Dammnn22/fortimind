import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import * as crypto from "crypto";

// Initialize Firebase Admin if not already done
if (!initializeApp.length) {
  initializeApp();
}

const db = getFirestore();

// PayPal webhook validation
interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource_type: string;
  summary: string;
  resource: {
    id: string;
    status: string;
    subscriber?: {
      payer_id: string;
      email_address: string;
    };
    custom_id?: string; // This will contain our Firebase UID
    billing_info?: {
      outstanding_balance: {
        currency_code: string;
        value: string;
      };
    };
  };
  create_time: string;
}

// PayPal webhook signature verification
function verifyPayPalSignature(
  body: string,
  headers: { [key: string]: string },
  webhookId: string
): boolean {
  const authAlgo = headers['paypal-auth-algo'];
  const transmission_id = headers['paypal-transmission-id'];
  const cert_id = headers['paypal-cert-id'];
  const transmission_sig = headers['paypal-transmission-sig'];
  const transmission_time = headers['paypal-transmission-time'];
  
  if (!authAlgo || !transmission_id || !cert_id || !transmission_sig || !transmission_time) {
    logger.warn('Missing PayPal webhook headers');
    return false;
  }

  // Note: In production, you should implement proper PayPal webhook signature verification
  // using PayPal's webhook verification API. This is a simplified version.
  // For now, we'll do basic validation and rely on HTTPS + webhook endpoint security
  
  return true; // Simplified for demo - implement proper verification in production
}

export const paypalWebhook = onRequest(
  {
    region: "us-central1",
    cors: false,
    timeoutSeconds: 60,
  },
  async (req, res) => {
    try {
      // Only allow POST requests
      if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
      }

      const webhookId = process.env.PAYPAL_WEBHOOK_ID;
      if (!webhookId) {
        logger.error('PayPal webhook ID not configured');
        res.status(500).send('Webhook not configured');
        return;
      }

      const body = JSON.stringify(req.body);
      const isValidSignature = verifyPayPalSignature(body, req.headers as any, webhookId);
      
      if (!isValidSignature) {
        logger.warn('Invalid PayPal webhook signature');
        res.status(401).send('Unauthorized');
        return;
      }

      const event: PayPalWebhookEvent = req.body;
      logger.info(`PayPal webhook received: ${event.event_type}`, { eventId: event.id });

      // Extract Firebase UID from custom_id
      const firebaseUid = event.resource.custom_id;
      if (!firebaseUid) {
        logger.warn('No Firebase UID found in PayPal webhook', { eventId: event.id });
        res.status(400).send('Missing user identifier');
        return;
      }

      // Handle different PayPal events
      await handlePayPalEvent(event, firebaseUid);

      res.status(200).send('OK');
    } catch (error) {
      logger.error('PayPal webhook error:', error);
      res.status(500).send('Internal Server Error');
    }
  }
);

async function handlePayPalEvent(event: PayPalWebhookEvent, firebaseUid: string) {
  const userConfigRef = db.collection('users').doc(firebaseUid).collection('configuracion').doc('subscription');
  const subscriptionLogsRef = db.collection('subscription_logs');

  // Log the event
  await subscriptionLogsRef.add({
    firebaseUid,
    paypalEventId: event.id,
    eventType: event.event_type,
    resourceId: event.resource.id,
    status: event.resource.status,
    timestamp: new Date(),
    rawEvent: event
  });

  try {
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await activateSubscription(firebaseUid, event);
        break;
        
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await deactivateSubscription(firebaseUid, event);
        break;
        
      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(firebaseUid, event);
        break;
        
      case 'PAYMENT.SALE.DENIED':
      case 'PAYMENT.SALE.REFUNDED':
        await handlePaymentFailed(firebaseUid, event);
        break;
        
      default:
        logger.info(`Unhandled PayPal event type: ${event.event_type}`);
    }
  } catch (error) {
    logger.error(`Error handling PayPal event ${event.event_type}:`, error);
    throw error;
  }
}

async function activateSubscription(firebaseUid: string, event: PayPalWebhookEvent) {
  const userConfigRef = db.collection('users').doc(firebaseUid).collection('configuracion').doc('subscription');
  
  await userConfigRef.set({
    isPremium: true,
    status: 'active',
    paypalSubscriptionId: event.resource.id,
    activatedAt: new Date(),
    lastPaymentAt: new Date(),
    eventType: event.event_type,
    updatedAt: new Date()
  }, { merge: true });

  // Also update the main user document for quick access
  await db.collection('users').doc(firebaseUid).update({
    isPremium: true,
    premiumStatus: 'active',
    updatedAt: new Date()
  });

  logger.info(`Subscription activated for user ${firebaseUid}`, {
    subscriptionId: event.resource.id,
    eventId: event.id
  });
}

async function deactivateSubscription(firebaseUid: string, event: PayPalWebhookEvent) {
  const userConfigRef = db.collection('users').doc(firebaseUid).collection('configuracion').doc('subscription');
  
  await userConfigRef.set({
    isPremium: false,
    status: 'inactive',
    paypalSubscriptionId: event.resource.id,
    deactivatedAt: new Date(),
    deactivationReason: event.event_type,
    eventType: event.event_type,
    updatedAt: new Date()
  }, { merge: true });

  // Update the main user document
  await db.collection('users').doc(firebaseUid).update({
    isPremium: false,
    premiumStatus: 'inactive',
    updatedAt: new Date()
  });

  logger.info(`Subscription deactivated for user ${firebaseUid}`, {
    subscriptionId: event.resource.id,
    reason: event.event_type,
    eventId: event.id
  });
}

async function handlePaymentCompleted(firebaseUid: string, event: PayPalWebhookEvent) {
  const userConfigRef = db.collection('users').doc(firebaseUid).collection('configuracion').doc('subscription');
  
  await userConfigRef.update({
    lastPaymentAt: new Date(),
    paymentStatus: 'completed',
    updatedAt: new Date()
  });

  logger.info(`Payment completed for user ${firebaseUid}`, {
    paymentId: event.resource.id,
    eventId: event.id
  });
}

async function handlePaymentFailed(firebaseUid: string, event: PayPalWebhookEvent) {
  const userConfigRef = db.collection('users').doc(firebaseUid).collection('configuracion').doc('subscription');
  
  await userConfigRef.update({
    paymentStatus: 'failed',
    lastFailedPaymentAt: new Date(),
    updatedAt: new Date()
  });

  // If payment failed, we might want to suspend premium features after grace period
  // This can be handled by a scheduled function

  logger.warn(`Payment failed for user ${firebaseUid}`, {
    paymentId: event.resource.id,
    eventId: event.id
  });
}
