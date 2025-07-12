export const PAYPAL_CONFIG = {
  // Sandbox credentials - usar variables de entorno si están disponibles
  CLIENT_ID: process.env.REACT_APP_PAYPAL_CLIENT_ID || 'AXdp6VAohHcC0NjKbgBNFhtuhoi9nEgmSpQUnsJtN8CifbYpP2ht3OyEbFMa9Mqaylo-ENqx5TSQ_UrR',
  SANDBOX_BASE_URL: 'https://api.sandbox.paypal.com',
  SANDBOX_SDK_URL: 'https://www.paypal.com/sdk/js',
  
  // Test plans - usar variables de entorno si están disponibles
  PLANS: {
    MONTHLY: process.env.REACT_APP_PAYPAL_MONTHLY_PLAN_ID || 'P-6LG6825998894721SNBU3NVQ',
    YEARLY: process.env.REACT_APP_PAYPAL_YEARLY_PLAN_ID || 'P-0LT85457VK498443GNBU3OGI'
  },
  
  // PayPal SDK options
  SDK_OPTIONS: {
    'client-id': process.env.REACT_APP_PAYPAL_CLIENT_ID || 'AXdp6VAohHcC0NjKbgBNFhtuhoi9nEgmSpQUnsJtN8CifbYpP2ht3OyEbFMa9Mqaylo-ENqx5TSQ_UrR',
    'vault': 'true',
    'intent': 'subscription',
    'currency': 'USD',
    'disable-funding': 'credit,card'
  }
};

export const getPayPalSDKUrl = () => {
  const params = new URLSearchParams({
    'client-id': PAYPAL_CONFIG.CLIENT_ID,
    'vault': 'true',
    'intent': 'subscription',
    'currency': 'USD',
    'components': 'buttons',
    'debug': 'true'
  });
  
  return `${PAYPAL_CONFIG.SANDBOX_SDK_URL}?${params.toString()}`;
};
