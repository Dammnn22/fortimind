import dotenv from 'dotenv';
import { getDeepSeekAdvice } from './services/deepSeekService.ts';

// Cargar variables de entorno
dotenv.config();

console.log('🔍 Probando API de DeepSeek...\n');

// Verificar si la API key está configurada
if (!process.env.DEEPSEEK_API_KEY) {
  console.log('❌ DEEPSEEK_API_KEY no encontrada');
  process.exit(1);
}

console.log('✅ DEEPSEEK_API_KEY encontrada');

async function testNutritionAPI() {
  try {
    console.log('\n📝 Probando generación de plan nutricional...');
    
    const nutritionPrompt = `MODE: 'fullDay'
PROFILE:
- Goal: maintainWeight
- Dietary Style: omnivore
- Allergies: none
- Preferences: mediterranean
- Day: 1`;
    
    const response = await getDeepSeekAdvice(nutritionPrompt, 'NUTRITION_PLAN_GENERATOR', 'en');
    
    if (response && !response.startsWith('Error:')) {
      console.log('✅ Respuesta recibida de DeepSeek');
      console.log('📝 Respuesta (primeros 200 caracteres):', response.substring(0, 200) + '...');
      
      // Intentar parsear como JSON
      try {
        const jsonResponse = JSON.parse(response);
        console.log('✅ Respuesta es JSON válido');
        console.log('📋 Estructura:', Object.keys(jsonResponse));
      } catch (parseError) {
        console.log('⚠️  Respuesta no es JSON válido:', parseError.message);
      }
    } else {
      console.log('❌ Error en la respuesta:', response);
    }
  } catch (error) {
    console.log('❌ Error al llamar a la API:', error.message);
  }
}

testNutritionAPI(); 