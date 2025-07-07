import express from 'express';
import { json } from 'body-parser';
import { SubscriptionController } from './controllers/subscription';
import { WebhookController } from './controllers/webhook';
import { authMiddleware } from './middleware/auth';
import { validationMiddleware } from './middleware/validation';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(json());
app.use(authMiddleware);
app.use(validationMiddleware);

// Controllers
const subscriptionController = new SubscriptionController();
const webhookController = new WebhookController();

// Routes
app.post('/api/subscription', subscriptionController.createSubscription.bind(subscriptionController));
app.post('/api/webhook', webhookController.handleWebhook.bind(webhookController));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});