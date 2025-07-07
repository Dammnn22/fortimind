import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { createPayPalSubscription } from './handlers/subscription';
import { paypalWebhook } from './handlers/webhook';
import { initializeFirebase } from './config/firebase';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(json());

// Initialize Firebase
initializeFirebase();

// Routes
app.post('/api/subscription', createPayPalSubscription);
app.post('/api/webhook', paypalWebhook);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});