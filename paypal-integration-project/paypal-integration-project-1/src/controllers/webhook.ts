import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { handleWebhookEvent } from '../services/paypal';

export class WebhookController {
  public async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const event = req.body;
      logger.info('Received PayPal webhook event:', event);

      await handleWebhookEvent(event);

      res.status(200).json({ status: 'success' });
    } catch (error) {
      logger.error('Error handling PayPal webhook:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}