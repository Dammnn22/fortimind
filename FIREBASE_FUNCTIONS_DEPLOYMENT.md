# 🚀 Guía de Despliegue - Funciones Firebase Seguras

## ✅ Estado Actual: Funciones Actualizadas

Las funciones de Firebase han sido actualizadas al nuevo formato seguro usando `defineSecret` y `onRequest` v2. Esto proporciona mayor seguridad y mejor rendimiento.

---

## 🔧 Cambios Implementados

### **Nuevo Formato Seguro:**
- ✅ **defineSecret** para manejo seguro de API keys
- ✅ **onRequest v2** para mejor rendimiento
- ✅ **Logger mejorado** para debugging
- ✅ **Manejo de errores** simplificado y robusto

### **Funciones Disponibles:**
1. **callDeepSeek** - Integración con DeepSeek AI
2. **callGemini** - Integración con Google Gemini AI

---

## 📋 Próximos Pasos para Despliegue

### **1. Instalar Dependencias**
```bash
cd functions
npm install
```

### **2. Compilar TypeScript**
```bash
npm run build
```

### **3. Configurar Secretos de Firebase**
```bash
# Configurar DeepSeek API Key
firebase functions:secrets:set DEEPSEEK_API_KEY

# Configurar Gemini API Key  
firebase functions:secrets:set GEMINI_API_KEY
```

### **4. Desplegar Funciones**
```bash
firebase deploy --only functions
```

---

## 🔐 Configuración de Secretos

### **¿Qué son los Secretos?**
Los secretos de Firebase Functions son variables de entorno seguras que se almacenan de forma encriptada y solo están disponibles para tus funciones.

### **Ventajas:**
- ✅ **Seguridad máxima** - Las claves nunca se exponen en el código
- ✅ **Gestión centralizada** - Fácil rotación de claves
- ✅ **Auditoría** - Logs de acceso a secretos
- ✅ **Cumplimiento** - Cumple estándares de seguridad

### **Configuración:**
```bash
# Ver secretos existentes
firebase functions:secrets:access

# Configurar nuevo secreto (te pedirá el valor)
firebase functions:secrets:set DEEPSEEK_API_KEY

# Ver logs de acceso
firebase functions:logs
```

---

## 🧪 Verificación de Funciones

### **Probar Localmente:**
```bash
# Iniciar emulador
firebase emulators:start --only functions

# Probar función (en otra terminal)
curl -X POST http://localhost:5001/fortimind/us-central1/callDeepSeek \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, how are you?"}'
```

### **Probar en Producción:**
```bash
# Obtener URL de la función
firebase functions:list

# Probar con curl
curl -X POST https://us-central1-fortimind.cloudfunctions.net/callDeepSeek \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, how are you?"}'
```

---

## 🔄 Integración con Frontend

### **Servicios Actualizados:**
Los servicios `deepSeekService.ts` y `geminiService.ts` ya están configurados para usar estas funciones.

### **URLs de las Funciones:**
```typescript
// URLs automáticas basadas en tu proyecto
const DEEPSEEK_FUNCTION_URL = `https://us-central1-${PROJECT_ID}.cloudfunctions.net/callDeepSeek`;
const GEMINI_FUNCTION_URL = `https://us-central1-${PROJECT_ID}.cloudfunctions.net/callGemini`;
```

---

## 📊 Monitoreo y Logs

### **Ver Logs en Tiempo Real:**
```bash
firebase functions:logs --follow
```

### **Ver Métricas:**
```bash
# En Firebase Console
# Functions > [Función] > Usage
```

### **Alertas Configuradas:**
- ✅ Errores de API
- ✅ Timeouts de funciones
- ✅ Uso excesivo de recursos

---

## 🛡️ Seguridad Implementada

### **Medidas de Seguridad:**
1. **API Keys encriptadas** - Nunca en el código
2. **Validación de entrada** - Sanitización de prompts
3. **Rate limiting** - Protección contra abuso
4. **Logs de auditoría** - Rastreo de uso
5. **Manejo de errores** - Sin exposición de datos sensibles

### **Buenas Prácticas:**
- ✅ **Rotación regular** de API keys
- ✅ **Monitoreo** de uso y costos
- ✅ **Backup** de configuraciones
- ✅ **Documentación** de cambios

---

## 🚀 Comandos de Despliegue Completos

### **Despliegue Inicial:**
```bash
# 1. Navegar a functions
cd functions

# 2. Instalar dependencias
npm install

# 3. Compilar
npm run build

# 4. Configurar secretos (solo primera vez)
firebase functions:secrets:set DEEPSEEK_API_KEY
firebase functions:secrets:set GEMINI_API_KEY

# 5. Desplegar
firebase deploy --only functions
```

### **Despliegue de Actualizaciones:**
```bash
cd functions
npm run build
firebase deploy --only functions
```

### **Rollback si es necesario:**
```bash
firebase functions:rollback --only functions
```

---

## 🎯 Estado Final Esperado

### **Después del Despliegue:**
- ✅ **Funciones activas** en Firebase
- ✅ **Secretos configurados** y seguros
- ✅ **Integración completa** con frontend
- ✅ **Logs funcionando** para debugging
- ✅ **Monitoreo activo** de rendimiento

### **Verificación:**
1. **Firebase Console** > Functions > Ver funciones activas
2. **Probar endpoints** con curl o Postman
3. **Verificar logs** para confirmar funcionamiento
4. **Testear integración** desde la app

---

## 🔧 Troubleshooting

### **Errores Comunes:**

#### **Error: "Secret not found"**
```bash
# Verificar secretos configurados
firebase functions:secrets:access

# Reconfigurar si es necesario
firebase functions:secrets:set DEEPSEEK_API_KEY
```

#### **Error: "Function not found"**
```bash
# Verificar funciones desplegadas
firebase functions:list

# Redesplegar si es necesario
firebase deploy --only functions
```

#### **Error: "Build failed"**
```bash
# Limpiar y reinstalar
cd functions
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🎉 ¡Listo para Producción!

Una vez completados estos pasos, tu aplicación FortiMind tendrá:

1. **Funciones de IA seguras** y escalables
2. **Integración completa** con DeepSeek y Gemini
3. **Monitoreo y logs** para debugging
4. **Arquitectura robusta** para producción

### **Próximo paso:**
¡Probar las funciones desde tu aplicación frontend! 🚀 