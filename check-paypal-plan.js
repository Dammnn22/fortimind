import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;
const PLAN_ID = process.env.REACT_APP_PAYPAL_MONTHLY_PLAN_ID;

console.log('CLIENT_ID:', CLIENT_ID);
console.log('PLAN_ID:', PLAN_ID);

async function checkPayPalPlan() {
  try {
    // Get access token
    const authResponse = await fetch('https://api.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    const authData = await authResponse.json();
    console.log('Auth response:', authData);

    if (!authData.access_token) {
      console.error('Failed to get access token');
      return;
    }

    // Check plan
    const planResponse = await fetch(`https://api.sandbox.paypal.com/v1/billing/plans/${PLAN_ID}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`
      }
    });

    const planData = await planResponse.json();
    console.log('Plan response:', planData);

  } catch (error) {
    console.error('Error checking PayPal plan:', error);
  }
}

checkPayPalPlan();
