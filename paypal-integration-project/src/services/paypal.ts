import axios from 'axios';
import { PAYPAL_BASE_URL, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } from '../config/paypal';

export const createSubscription = async (subscriptionData) => {
  try {
    const accessToken = await getAccessToken();
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v1/billing/subscriptions`,
      subscriptionData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create subscription: ${error.message}`);
  }
};

export const getAccessToken = async () => {
  const response = await axios.post(
    `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`
      }
    }
  );
  return response.data.access_token;
};

export const getSubscriptionDetails = async (subscriptionId) => {
  try {
    const accessToken = await getAccessToken();
    const response = await axios.get(
      `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to retrieve subscription details: ${error.message}`);
  }
};