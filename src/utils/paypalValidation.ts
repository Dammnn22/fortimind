import { PAYPAL_CONFIG } from '../config/paypal';

export const validatePayPalCredentials = async (): Promise<{ isValid: boolean; error?: string }> => {
  try {
    // Verificar si las credenciales básicas están presentes
    if (!PAYPAL_CONFIG.CLIENT_ID || PAYPAL_CONFIG.CLIENT_ID.length < 10) {
      return { isValid: false, error: 'Invalid PayPal Client ID' };
    }

    if (!PAYPAL_CONFIG.PLANS.MONTHLY || PAYPAL_CONFIG.PLANS.MONTHLY.length < 10) {
      return { isValid: false, error: 'Invalid PayPal Monthly Plan ID' };
    }

    // Intentar obtener un token de acceso desde PayPal
    const response = await fetch(`${PAYPAL_CONFIG.SANDBOX_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${PAYPAL_CONFIG.CLIENT_ID}:`)}`
      },
      body: 'grant_type=client_credentials'
    });

    if (response.ok) {
      return { isValid: true };
    } else {
      const error = await response.text();
      return { isValid: false, error: `PayPal authentication failed: ${error}` };
    }
  } catch (error: any) {
    return { isValid: false, error: `Network error: ${error.message}` };
  }
};

export const checkPayPalPlan = async (planId: string): Promise<{ isValid: boolean; error?: string }> => {
  try {
    // Primero obtener un token de acceso
    const tokenResponse = await fetch(`${PAYPAL_CONFIG.SANDBOX_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${PAYPAL_CONFIG.CLIENT_ID}:`)}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      return { isValid: false, error: 'Failed to get PayPal access token' };
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Verificar si el plan existe
    const planResponse = await fetch(`${PAYPAL_CONFIG.SANDBOX_BASE_URL}/v1/billing/plans/${planId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (planResponse.ok) {
      const planData = await planResponse.json();
      return { isValid: true, error: `Plan found: ${planData.name}` };
    } else {
      return { isValid: false, error: `Plan not found or invalid: ${planId}` };
    }
  } catch (error: any) {
    return { isValid: false, error: `Error checking plan: ${error.message}` };
  }
};
