# 🛡️ Protección Integral Contra Abuso y Spam

## Resumen de la Implementación

Se ha implementado un sistema completo de protección contra abuso que incluye múltiples capas de seguridad para prevenir la creación excesiva de documentos, spam automático, y abuso del sistema.

## 🔐 Protecciones Implementadas

### 1. **Reglas de Firestore Mejoradas**

#### **Validaciones en exercise_programs/{programId}:**
- ✅ Límite máximo: 90 días por programa (ampliado para usuarios premium)
- ✅ Validación de estructura mínima requerida
- ✅ Límite de longitud en campos de texto (título: 100 chars, descripción: 1000 chars)
- ✅ Validación de status permitidos

#### **Validaciones en exercise_programs/{programId}/days/{dayId}:**
- ✅ Validación de dayNumber dentro del rango del programa
- ✅ Formato obligatorio de dayId: `day-X`
- ✅ Límite de ejercicios por día: 20 máximo
- ✅ Prevención de modificación de campos críticos en updates
- ✅ Validación de estructura mínima por día

#### **Validaciones similares para nutrition_challenges:**
- ✅ Mismas protecciones aplicadas a retos nutricionales
- ✅ Límite de comidas por día: 10 máximo

### 2. **Servicio de Protección Contra Abuso (`abuseProtectionService.ts`)**

#### **Rate Limiting Granular:**
```typescript
PROGRAM_CREATION: {
  maxPerMinute: 2,
  maxPerHour: 5,
  maxPerDay: 20,
}

CHALLENGE_CREATION: {
  maxPerMinute: 2,
  maxPerHour: 5,
  maxPerDay: 20,
}

DAY_CREATION: {
  maxPerMinute: 10,
  maxPerHour: 100,
  maxPerDay: 500,
}
```

#### **Detección de Actividad Sospechosa:**
- 🔍 Monitoreo de patrones de uso anómalos
- 🔍 Detección de secuencias rápidas (< 5 segundos entre acciones)
- 🔍 Alerta cuando >50% de acciones están muy juntas en tiempo
- 🔍 Threshold de actividad sospechosa: 50 acciones por hora

#### **Logging de Actividad:**
- 📊 Registro completo de todas las acciones en `user_activity` collection
- 📊 Metadata personalizada por tipo de acción
- 📊 Limpieza automática de datos antiguos (>7 días)

### 3. **Validación de Límites Mejorada (`limitsValidationService.ts`)**

#### **Límites por Usuario:**
```typescript
FREE_USER_LIMITS: {
  maxPrograms: 3,
  maxChallenges: 3,
  maxDaysPerProgram: 30,
  maxDaysPerChallenge: 30,
}

PREMIUM_USER_LIMITS: {
  maxPrograms: 20,
  maxChallenges: 20,
  maxDaysPerProgram: 90,
  maxDaysPerChallenge: 90,
}
```

#### **Validaciones Anti-Spam:**
- ⏱️ Máximo 5 programas/retos por hora por usuario
- ⏱️ Validación de duplicados por número de día
- ⏱️ Conteo en tiempo real de documentos en subcolecciones

### 4. **Hooks de React para Frontend (`useAbuseProtection.ts`)**

#### **Funcionalidades:**
- 🎯 `validateAction()`: Valida y registra acciones antes de ejecutarlas
- 🎯 `checkActionLimit()`: Verifica límites sin registrar la acción
- 🎯 `getRemainingActions()`: Calcula acciones restantes por tipo
- 🎯 `refreshActivityStats()`: Obtiene estadísticas de actividad del usuario

#### **Hooks Especializados:**
- `useProgramCreationProtection()`: Específico para programas de ejercicio
- `useChallengeCreationProtection()`: Específico para retos nutricionales

### 5. **Componente de Alerta (`AbuseProtectionAlert.tsx`)**

#### **Características:**
- 🚨 Alertas visuales cuando se acercan a los límites
- 🚨 Barra de progreso de uso actual
- 🚨 Contador en tiempo real para desbloqueo
- 🚨 Estadísticas de actividad detalladas
- 🚨 Niveles de alerta: info, warning, error

### 6. **Integración en Servicios de Creación**

#### **automaticProgramCreator.ts:**
- ✅ Validación previa antes de crear programas
- ✅ Rate limiting para creación de días individuales
- ✅ Pausas progresivas para evitar sobrecarga
- ✅ Registro de metadata detallada

#### **automaticNutritionCreator.ts:**
- ✅ Mismo nivel de protección para retos nutricionales
- ✅ Validaciones específicas para contenido nutricional

## 🛡️ Capas de Protección

### **Capa 1: Frontend (React)**
- Validación inmediata antes de enviar requests
- Alertas proactivas al usuario
- Deshabilitación de botones cuando se alcanzan límites

### **Capa 2: Firestore Rules**
- Validación estructural y de formato
- Límites de longitud de campos
- Prevención de modificaciones no autorizadas

### **Capa 3: Servicios de Aplicación**
- Rate limiting sofisticado
- Detección de patrones sospechosos
- Logging completo de actividad

### **Capa 4: Límites de Negocio**
- Diferenciación entre usuarios free/premium
- Límites por usuario y por tiempo
- Validación de subcollecciones

## 📊 Monitoreo y Métricas

### **Métricas Registradas:**
- Acciones por usuario por período
- Patrones de uso anómalos
- Intentos de abuso detectados
- Estadísticas de rate limiting

### **Alertas Automáticas:**
- Actividad sospechosa detectada
- Límites excedidos frecuentemente
- Patrones de spam identificados

## 🔧 Configuración y Mantenimiento

### **Ajustes de Límites:**
Los límites pueden ajustarse fácilmente en `abuseProtectionService.ts`:
```typescript
export const RATE_LIMITS = {
  // Modificar según necesidades del sistema
}
```

### **Limpieza de Datos:**
- Función `cleanupOldActivity()` para eliminar datos antiguos
- Recomendado ejecutar periódicamente (Cloud Function)

### **Monitoreo:**
- Dashboard de admin para revisar patrones de uso
- Alertas para detectar intentos de abuso

## 🎯 Beneficios Implementados

✅ **Prevención de Spam**: Rate limiting efectivo por acción y período
✅ **Protección de Recursos**: Límites en subcolecciones y documentos
✅ **Experiencia de Usuario**: Alertas claras y retroalimentación inmediata
✅ **Escalabilidad**: Diferenciación entre usuarios free/premium
✅ **Visibilidad**: Logging completo y métricas detalladas
✅ **Mantenibilidad**: Configuración centralizada y fácil de ajustar

## 🚀 Próximos Pasos Opcionales

1. **Cloud Functions de Enforcement**: Validación adicional en el backend
2. **Dashboard de Admin**: Interfaz para monitorear y gestionar límites
3. **Alertas en Tiempo Real**: Notificaciones para actividad sospechosa
4. **Machine Learning**: Detección más sofisticada de patrones de abuso
5. **API Rate Limiting**: Protección a nivel de API Gateway

El sistema implementado proporciona una protección robusta y multicapa contra el abuso, manteniendo una excelente experiencia de usuario mientras protege los recursos del sistema.
