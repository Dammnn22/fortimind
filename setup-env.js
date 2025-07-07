#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Configuración de Variables de Entorno para FortiMind\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnv() {
  try {
    const envPath = path.join(__dirname, '.env');
    
    // Verificar si el archivo .env ya existe
    if (fs.existsSync(envPath)) {
      console.log('⚠️  El archivo .env ya existe. ¿Quieres sobrescribirlo? (y/n)');
      const overwrite = await question('Respuesta: ');
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log('❌ Configuración cancelada.');
        rl.close();
        return;
      }
    }

    console.log('📝 Configurando variables de entorno...\n');

    // Solicitar API keys
    console.log('🔑 DeepSeek API Key:');
    console.log('   Obtén tu API key en: https://platform.deepseek.com/');
    const deepseekKey = await question('   Ingresa tu DeepSeek API Key (sk-...): ');

    console.log('\n🔑 Gemini API Key (opcional, para otras funcionalidades):');
    console.log('   Obtén tu API key en: https://makersuite.google.com/app/apikey');
    const geminiKey = await question('   Ingresa tu Gemini API Key (opcional): ');

    // Crear contenido del archivo .env
    let envContent = `# DeepSeek API Configuration
# Obtén tu API key en: https://platform.deepseek.com/
DEEPSEEK_API_KEY=${deepseekKey}

# Gemini API Configuration (mantenida para otras funcionalidades)
API_KEY=${geminiKey || 'tu_api_key_de_gemini_aqui'}
GEMINI_API_KEY=${geminiKey || 'tu_api_key_de_gemini_aqui'}

# Firebase Configuration (si es necesaria)
# FIREBASE_API_KEY=tu_firebase_api_key
# FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
# FIREBASE_PROJECT_ID=tu_proyecto_id
# FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
# FIREBASE_MESSAGING_SENDER_ID=123456789
# FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Otras configuraciones de la app
NODE_ENV=development
`;

    // Escribir el archivo .env
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Archivo .env creado exitosamente!');
    console.log('📁 Ubicación:', envPath);
    
    console.log('\n🔧 Próximos pasos:');
    console.log('1. Reinicia tu servidor de desarrollo: npm run dev');
    console.log('2. Ve a la sección de Retos para probar DeepSeek');
    console.log('3. Verifica en la página de Soporte que DeepSeek esté activo');

    // Verificar que las variables se pueden leer
    console.log('\n🧪 Verificando configuración...');
    const env = require('dotenv').config();
    
    if (process.env.DEEPSEEK_API_KEY) {
      console.log('✅ DEEPSEEK_API_KEY configurada correctamente');
    } else {
      console.log('❌ DEEPSEEK_API_KEY no encontrada');
    }

    if (process.env.GEMINI_API_KEY) {
      console.log('✅ GEMINI_API_KEY configurada correctamente');
    } else {
      console.log('⚠️  GEMINI_API_KEY no configurada (opcional)');
    }

  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
  } finally {
    rl.close();
  }
}

setupEnv(); 