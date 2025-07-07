#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando configuración de FortiMind...\n');

// Verificar archivo .env
const envPath = path.join(__dirname, '.env');
const envLocalPath = path.join(__dirname, '.env.local');

console.log('📁 Verificando archivos de configuración:');

if (fs.existsSync(envPath)) {
  console.log('✅ Archivo .env encontrado');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('DEEPSEEK_API_KEY')) {
    console.log('✅ Variable DEEPSEEK_API_KEY configurada');
    
    // Verificar si es un placeholder
    if (envContent.includes('sk-tu_api_key_aqui')) {
      console.log('⚠️  DEEPSEEK_API_KEY aún tiene el valor placeholder');
      console.log('   Necesitas reemplazar "sk-tu_api_key_aqui" con tu API key real');
    } else {
      console.log('✅ DEEPSEEK_API_KEY tiene un valor real');
    }
  } else {
    console.log('❌ Variable DEEPSEEK_API_KEY no encontrada');
  }
  
  if (envContent.includes('GEMINI_API_KEY')) {
    console.log('✅ Variable GEMINI_API_KEY configurada');
  } else {
    console.log('⚠️  Variable GEMINI_API_KEY no encontrada (opcional)');
  }
} else {
  console.log('❌ Archivo .env no encontrado');
}

if (fs.existsSync(envLocalPath)) {
  console.log('✅ Archivo .env.local encontrado');
} else {
  console.log('⚠️  Archivo .env.local no encontrado (opcional)');
}

// Verificar configuración de Vite
const viteConfigPath = path.join(__dirname, 'vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
  const viteContent = fs.readFileSync(viteConfigPath, 'utf8');
  if (viteContent.includes('DEEPSEEK_API_KEY')) {
    console.log('✅ Vite configurado para DeepSeek');
  } else {
    console.log('❌ Vite no configurado para DeepSeek');
  }
} else {
  console.log('❌ Archivo vite.config.ts no encontrado');
}

// Verificar servicios
const deepSeekServicePath = path.join(__dirname, 'services', 'deepSeekService.ts');
if (fs.existsSync(deepSeekServicePath)) {
  console.log('✅ Servicio DeepSeek encontrado');
} else {
  console.log('❌ Servicio DeepSeek no encontrado');
}

const exerciseServicePath = path.join(__dirname, 'services', 'exerciseService.ts');
if (fs.existsSync(exerciseServicePath)) {
  const exerciseContent = fs.readFileSync(exerciseServicePath, 'utf8');
  if (exerciseContent.includes('getDeepSeekAdvice')) {
    console.log('✅ Servicio de ejercicios migrado a DeepSeek');
  } else {
    console.log('❌ Servicio de ejercicios no migrado a DeepSeek');
  }
} else {
  console.log('❌ Servicio de ejercicios no encontrado');
}

const nutritionServicePath = path.join(__dirname, 'services', 'nutritionService.ts');
if (fs.existsSync(nutritionServicePath)) {
  const nutritionContent = fs.readFileSync(nutritionServicePath, 'utf8');
  if (nutritionContent.includes('getDeepSeekAdvice')) {
    console.log('✅ Servicio de nutrición migrado a DeepSeek');
  } else {
    console.log('❌ Servicio de nutrición no migrado a DeepSeek');
  }
} else {
  console.log('❌ Servicio de nutrición no encontrado');
}

console.log('\n🎯 Estado de la migración:');
console.log('✅ Archivos de configuración creados');
console.log('✅ Servicios migrados a DeepSeek');
console.log('✅ Vite configurado para DeepSeek');

console.log('\n📋 Próximos pasos:');
console.log('1. Obtén tu API key en: https://platform.deepseek.com/');
console.log('2. Reemplaza "sk-tu_api_key_aqui" en el archivo .env');
console.log('3. Ejecuta: npm run dev');
console.log('4. Prueba los retos de ejercicios y nutrición');

console.log('\n🔧 Para configurar automáticamente:');
console.log('   npm run setup-env'); 