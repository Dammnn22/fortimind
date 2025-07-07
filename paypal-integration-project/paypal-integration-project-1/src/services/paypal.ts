import axios from 'axios';
import { PAYPAL_BASE_URL, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } from '../config/paypal';

export const createSubscription = async (subscriptionData) => {
  try {
    const accessToken = await getAccessToken();
    const response = await axios.post(`${PAYPAL_BASE_URL}/v1/billing/subscriptions`, subscriptionData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create subscription: ${error.message}`);
  }
};

export const getAccessToken = async () => {
  const response = await axios.post(`${PAYPAL_BASE_URL}/v1/oauth2/token`, 'grant_type=client_credentials', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`
    }
  });
  return response.data.access_token;
};

export const handleWebhookEvent = async (event) => {
  // Process the webhook event from PayPal
  switch (event.event_type) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
      // Handle subscription activation
      break;
    case 'BILLING.SUBSCRIPTION.CANCELLED':
      // Handle subscription cancellation
      break;
    // Add more cases as needed
    default:
      throw new Error(`Unhandled event type: ${event.event_type}`);
  }
};