import dotenv from 'dotenv';

dotenv.config();

console.log('=== PayPal Configuration Check ===');
console.log('✅ Client ID:', process.env.REACT_APP_PAYPAL_CLIENT_ID ? 'Present' : '❌ Missing');
console.log('✅ Environment:', process.env.REACT_APP_PAYPAL_ENVIRONMENT || 'Not set');
console.log('✅ Plan ID (Monthly):', process.env.REACT_APP_PAYPAL_MONTHLY_PLAN_ID ? 'Present' : '❌ Missing');
console.log('✅ Plan ID (Yearly):', process.env.REACT_APP_PAYPAL_YEARLY_PLAN_ID ? 'Present' : '❌ Missing');
console.log('=====================================');

console.log('\n=== Test URLs ===');
console.log('🔗 PayPal Simple Button: http://localhost:5180/paypal-simple-button');
console.log('🔗 Environment Debug: http://localhost:5180/env-debug');
console.log('🔗 PayPal Tests Index: http://localhost:5180/paypal-tests');
console.log('🔗 Minimal Test: http://localhost:5180/paypal-minimal-test');
console.log('🔗 Script Test: http://localhost:5180/paypal-script-test');
console.log('=====================================');

console.log('\n=== Next Steps ===');
console.log('1. Abre http://localhost:5180/paypal-simple-button');
console.log('2. Si no funciona, revisa la consola del navegador');
console.log('3. Verifica que el Client ID sea válido en PayPal Developer');
console.log('4. Para suscripciones, necesitas crear un plan válido');
console.log('=====================================');

// Verificar que el Client ID tenga el formato correcto
const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
if (clientId) {
  if (clientId.length === 80 && clientId.startsWith('A')) {
    console.log('✅ Client ID format looks correct');
  } else {
    console.log('⚠️  Client ID format might be incorrect');
    console.log('   Expected: 80 characters starting with "A"');
    console.log('   Actual length:', clientId.length);
  }
}
