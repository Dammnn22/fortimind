import { Request, Response } from 'express';
import { createPayment, executePayment } from '../services/paypal';
import { validatePaymentRequest } from '../utils/validation';
import logger from '../utils/logger';

export const processPayment = async (req: Request, res: Response) => {
  try {
    const { amount, currency, paymentMethod } = req.body;

    const validationError = validatePaymentRequest(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const payment = await createPayment(amount, currency, paymentMethod);
    logger.info('Payment created successfully', { paymentId: payment.id });

    res.status(200).json({ approvalUrl: payment.approvalUrl });
  } catch (error) {
    logger.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { paymentId, payerId } = req.body;

    const paymentConfirmation = await executePayment(paymentId, payerId);
    logger.info('Payment executed successfully', { paymentId });

    res.status(200).json({ status: paymentConfirmation.status });
  } catch (error) {
    logger.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};