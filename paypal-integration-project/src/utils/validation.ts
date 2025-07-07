import { body, validationResult } from 'express-validator';

export const validateSubscriptionRequest = [
  body('userId').isString().withMessage('User ID must be a string'),
  body('planType').isIn(['monthly', 'yearly']).withMessage('Plan type must be either "monthly" or "yearly"'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validatePaymentRequest = [
  body('subscriptionId').isString().withMessage('Subscription ID must be a string'),
  body('paymentMethod').isString().withMessage('Payment method must be a string'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];