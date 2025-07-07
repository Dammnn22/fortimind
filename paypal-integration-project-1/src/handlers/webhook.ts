import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { updateUserSubscriptionStatus } from '../services/subscription';
import { handleSubscriptionActivated, handleSubscriptionCancelled, handleSubscriptionExpired } from '../services/paypal';

export const webhookHandler = async (req: Request, res: Response) => {
  const event = req.body;

  logger.info('Received PayPal webhook event:', event);

  try {
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(event.resource);
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(event.resource);
        break;
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await handleSubscriptionExpired(event.resource);
        break;
      default:
        logger.warn(`Unhandled event type: ${event.event_type}`);
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    logger.error('Error processing webhook event:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};