import { Request, Response } from 'express';
import { createSubscription, updateSubscription, getSubscription } from '../services/subscription';
import { validateSubscriptionRequest } from '../middleware/validation';

export class SubscriptionController {
  async create(req: Request, res: Response) {
    try {
      const subscriptionData = req.body;
      const validationErrors = validateSubscriptionRequest(subscriptionData);
      if (validationErrors) {
        return res.status(400).json({ errors: validationErrors });
      }

      const subscription = await createSubscription(subscriptionData);
      return res.status(201).json(subscription);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create subscription' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { subscriptionId } = req.params;
      const subscriptionData = req.body;

      const updatedSubscription = await updateSubscription(subscriptionId, subscriptionData);
      return res.status(200).json(updatedSubscription);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update subscription' });
    }
  }

  async get(req: Request, res: Response) {
    try {
      const { subscriptionId } = req.params;
      const subscription = await getSubscription(subscriptionId);

      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      return res.status(200).json(subscription);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to retrieve subscription' });
    }
  }
}