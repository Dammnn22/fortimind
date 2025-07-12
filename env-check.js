import { defineConfig, loadEnv } from 'vite';

const mode = process.env.NODE_ENV || 'development';
const env = loadEnv(mode, '.', '');

console.log('=== Environment Variables Check ===');
console.log('Mode:', mode);
console.log('REACT_APP_PAYPAL_CLIENT_ID:', env.REACT_APP_PAYPAL_CLIENT_ID);
console.log('REACT_APP_PAYPAL_ENV:', env.REACT_APP_PAYPAL_ENV);
console.log('REACT_APP_PAYPAL_ENVIRONMENT:', env.REACT_APP_PAYPAL_ENVIRONMENT);
console.log('REACT_APP_PAYPAL_MONTHLY_PLAN_ID:', env.REACT_APP_PAYPAL_MONTHLY_PLAN_ID);
console.log('REACT_APP_PAYPAL_YEARLY_PLAN_ID:', env.REACT_APP_PAYPAL_YEARLY_PLAN_ID);
console.log('=====================================');

export default defineConfig({
  plugins: [],
  define: {
    'process.env.REACT_APP_PAYPAL_CLIENT_ID': JSON.stringify(env.REACT_APP_PAYPAL_CLIENT_ID),
    'process.env.REACT_APP_PAYPAL_ENV': JSON.stringify(env.REACT_APP_PAYPAL_ENV),
    'process.env.REACT_APP_PAYPAL_ENVIRONMENT': JSON.stringify(env.REACT_APP_PAYPAL_ENVIRONMENT),
    'process.env.REACT_APP_PAYPAL_MONTHLY_PLAN_ID': JSON.stringify(env.REACT_APP_PAYPAL_MONTHLY_PLAN_ID),
    'process.env.REACT_APP_PAYPAL_YEARLY_PLAN_ID': JSON.stringify(env.REACT_APP_PAYPAL_YEARLY_PLAN_ID),
  }
});
