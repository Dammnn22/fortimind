import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.DEEPSEEK_API_KEY': JSON.stringify(env.DEEPSEEK_API_KEY),
        'process.env.REACT_APP_FIREBASE_FUNCTIONS_URL': JSON.stringify(env.REACT_APP_FIREBASE_FUNCTIONS_URL),
        'process.env.REACT_APP_PAYPAL_ENV': JSON.stringify(env.REACT_APP_PAYPAL_ENV),
        'process.env.REACT_APP_PAYPAL_CLIENT_ID': JSON.stringify(env.REACT_APP_PAYPAL_CLIENT_ID)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
