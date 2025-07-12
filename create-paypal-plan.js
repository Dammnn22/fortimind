import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_PAYPAL_CLIENT_SECRET || '';

console.log('CLIENT_ID:', CLIENT_ID);
console.log('CLIENT_SECRET:', CLIENT_SECRET ? 'Present' : 'Missing');

async function createPayPalPlan() {
  try {
    // Get access token
    const authResponse = await fetch('https://api.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    const authData = await authResponse.json();
    console.log('Auth response:', authData);

    if (!authData.access_token) {
      console.error('Failed to get access token');
      return;
    }

    // Create product first
    const productResponse = await fetch('https://api.sandbox.paypal.com/v1/catalogs/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`
      },
      body: JSON.stringify({
        name: 'FortiMind Premium',
        description: 'Premium subscription for FortiMind app',
        type: 'SERVICE',
        category: 'SOFTWARE'
      })
    });

    const productData = await productResponse.json();
    console.log('Product response:', productData);

    if (!productData.id) {
      console.error('Failed to create product');
      return;
    }

    // Create plan
    const planResponse = await fetch('https://api.sandbox.paypal.com/v1/billing/plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`
      },
      body: JSON.stringify({
        product_id: productData.id,
        name: 'FortiMind Monthly Premium',
        description: 'Monthly premium subscription',
        status: 'ACTIVE',
        billing_cycles: [
          {
            frequency: {
              interval_unit: 'MONTH',
              interval_count: 1
            },
            tenure_type: 'REGULAR',
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: {
              fixed_price: {
                value: '9.99',
                currency_code: 'USD'
              }
            }
          }
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: {
            value: '0',
            currency_code: 'USD'
          },
          setup_fee_failure_action: 'CONTINUE',
          payment_failure_threshold: 3
        }
      })
    });

    const planData = await planResponse.json();
    console.log('Plan response:', planData);

    if (planData.id) {
      console.log('\n✅ SUCCESS! New Plan created:');
      console.log('Plan ID:', planData.id);
      console.log('Update your .env file with:');
      console.log(`REACT_APP_PAYPAL_MONTHLY_PLAN_ID=${planData.id}`);
    }

  } catch (error) {
    console.error('Error creating PayPal plan:', error);
  }
}

createPayPalPlan();
