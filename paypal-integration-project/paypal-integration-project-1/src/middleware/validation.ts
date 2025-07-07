import { Request, Response, NextFunction } from 'express';

export const validateSubscriptionRequest = (req: Request, res: Response, next: NextFunction) => {
    const { userId, planType } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    if (!planType || (planType !== 'monthly' && planType !== 'yearly')) {
        return res.status(400).json({ error: 'planType must be either "monthly" or "yearly"' });
    }

    next();
};

export const validateWebhookRequest = (req: Request, res: Response, next: NextFunction) => {
    const { event_type, resource } = req.body;

    if (!event_type || !resource) {
        return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    next();
};