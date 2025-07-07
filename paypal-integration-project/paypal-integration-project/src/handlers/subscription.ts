import { Request, Response } from 'express';
import { createSubscription, updateSubscription } from '../services/subscription';
import { validateSubscriptionRequest } from '../utils/validation';
import { logger } from '../utils/logger';

export const handleCreateSubscription = async (req: Request, res: Response) => {
    try {
        const { userId, planType } = req.body;

        const validationError = validateSubscriptionRequest(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const subscription = await createSubscription(userId, planType);
        return res.status(201).json(subscription);
    } catch (error) {
        logger.error('Error creating subscription:', error);
        return res.status(500).json({ error: 'Failed to create subscription' });
    }
};

export const handleUpdateSubscription = async (req: Request, res: Response) => {
    try {
        const { subscriptionId, planType } = req.body;

        const validationError = validateSubscriptionRequest(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const updatedSubscription = await updateSubscription(subscriptionId, planType);
        return res.status(200).json(updatedSubscription);
    } catch (error) {
        logger.error('Error updating subscription:', error);
        return res.status(500).json({ error: 'Failed to update subscription' });
    }
};