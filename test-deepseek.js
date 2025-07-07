// Script de prueba para verificar la funcionalidad de DeepSeek
// Ejecutar con: node test-deepseek.js

// Simular las variables de entorno
process.env.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'test-key';

// Importar el servicio de DeepSeek
const { getDeepSeekAdvice, isDeepSeekAvailable } = require('./services/deepSeekService.ts');

async function testDeepSeek() {
  console.log('🧪 Probando servicio DeepSeek...\n');
  
  // Verificar disponibilidad
  const isAvailable = isDeepSeekAvailable();
  console.log(`✅ DeepSeek disponible: ${isAvailable}`);
  
  if (!isAvailable) {
    console.log('❌ DeepSeek no está disponible. Verifica DEEPSEEK_API_KEY');
    return;
  }
  
  // Probar generación de rutina de ejercicios
  console.log('\n🏋️ Probando generación de rutina de ejercicios...');
  try {
    const workoutPrompt = `Generate a workout routine for a user on Day 1 of a 30-day challenge.
- Fitness Level: beginner
- Location: home
- Muscle Group Focus: Full Body`;
    
    const workoutResponse = await getDeepSeekAdvice(workoutPrompt, 'WORKOUT_GENERATOR', 'en');
    console.log('✅ Respuesta de rutina de ejercicios recibida');
    console.log('📝 Respuesta:', workoutResponse?.substring(0, 200) + '...');
  } catch (error) {
    console.log('❌ Error en generación de rutina:', error.message);
  }
  
  // Probar generación de plan nutricional
  console.log('\n🥗 Probando generación de plan nutricional...');
  try {
    const nutritionPrompt = `MODE: 'fullDay'
PROFILE:
- Goal: maintainWeight
- Dietary Style: omnivore
- Allergies: none
- Preferences: mediterranean
- Day: 1`;
    
    const nutritionResponse = await getDeepSeekAdvice(nutritionPrompt, 'NUTRITION_PLAN_GENERATOR', 'en');
    console.log('✅ Respuesta de plan nutricional recibida');
    console.log('📝 Respuesta:', nutritionResponse?.substring(0, 200) + '...');
  } catch (error) {
    console.log('❌ Error en generación de plan nutricional:', error.message);
  }
  
  console.log('\n🎉 Pruebas completadas!');
}

// Ejecutar pruebas
testDeepSeek().catch(console.error); 