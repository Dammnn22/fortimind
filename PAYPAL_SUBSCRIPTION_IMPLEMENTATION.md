# 🚀 Implementación de Sistema de Suscripción PayPal para FortiMind

## 📋 Resumen del Sistema

FortiMind ahora incluye un sistema completo de suscripción premium con PayPal que permite a los usuarios acceder a funciones avanzadas mediante suscripciones mensuales o anuales.

### 💰 Planes de Precios

| Plan | Precio Mensual | Precio Anual | Descripción |
|------|----------------|--------------|-------------|
| **Free** | $0 | — | Acceso limitado para probar la app |
| **Premium** | USD $4.99 | USD $39.99 | Acceso completo a todas las funciones |

**Características especiales:**
- ✅ Período de prueba gratuito: 7 días (solo una vez por usuario)
- ✅ Descuento anual: $39.99/año (33% OFF del precio mensual)
- ✅ Precios en USD para toda LATAM y España

### 🎯 Funciones por Plan

| Función | Free | Premium |
|---------|------|---------|
| Acceso a IA (Gemini / DeepSeek) | ❌ | ✅ Ilimitado |
| Retos completos (30 días Ejercicio/Nutrición) | Solo 10 días | ✅ Completo |
| Rachas, Metas, Hábitos y Diario | ✅ Limitado (3 de cada) | ✅ Ilimitado |
| Resumen semanal/mensual con IA | ❌ | ✅ |
| Meditaciones guiadas | 3 gratuitas | ✅ Todas |
| Estadísticas y análisis avanzado | ❌ | ✅ |
| Contenido exclusivo | ❌ | ✅ |
| Personalización extra | ❌ | ✅ |

## 🏗️ Arquitectura

### Backend (Firebase Functions)
- **`createPayPalSubscription`**: Crea suscripciones y devuelve URL de aprobación
- **`paypalWebhook`**: Procesa eventos de PayPal (activación, cancelación, pagos)
- **Firestore**: Almacena datos de usuarios, suscripciones y pagos

### Frontend (React)
- **`PayPalSubscriptionButton`**: Componente para iniciar suscripciones
- **`FortiMindPremiumFeature`**: Componente específico para funciones premium con límites
- **`PremiumFeaturesService`**: Servicio para manejar funciones premium específicas
- **`useFortiMindPremium`**: Hook personalizado para funciones premium
- **Páginas de éxito/cancelación**: Manejo de flujo de pago

## 🔐 Funciones Premium de FortiMind

### 1. **Chat con IAs (DeepSeek / Gemini)** 🔐
- **Estado**: Premium completo
- **Descripción**: Acceso ilimitado a mentoría y guía personalizada
- **Valor**: Alto - consume APIs pagas

### 2. **Retos de 30 días personalizados** 🔐
- **Estado**: Límite gratuito (10 días) + Premium completo
- **Gratuito**: 10 días de acceso
- **Premium**: 30 días completos + generación AI + XP completo

### 3. **Múltiples hábitos y metas** 🔐
- **Estado**: Límite gratuito (1 hábito/meta) + Premium ilimitado
- **Gratuito**: Crear solo 1 hábito o meta
- **Premium**: Hábitos y metas ilimitados

### 4. **Análisis AI del diario** 🔐
- **Estado**: Premium completo
- **Descripción**: Revisión automática de tu día por IA
- **Beneficio**: Insights personalizados de progreso diario

### 5. **Resumen semanal/mensual con IA** 🔐
- **Estado**: Premium completo
- **Descripción**: Resúmenes personalizados de progreso y emociones
- **Beneficio**: Análisis profundo de progreso semanal/mensual

### 6. **Audio-terapias y meditaciones AI** 🔐
- **Estado**: Límite gratuito (3 sesiones) + Premium completo
- **Gratuito**: 3 sesiones de meditación
- **Premium**: Acceso completo + audio exclusivo semanal

### 7. **Estadísticas completas y comparaciones** 🔐
- **Estado**: Premium completo
- **Descripción**: Progreso detallado por categorías
- **Beneficio**: Análisis por disciplina, emociones, hábitos, etc.

### 8. **Acceso anticipado a nuevas funciones** 🔐
- **Estado**: Premium completo
- **Descripción**: Prueba nuevas características antes que nadie
- **Beneficio**: Bonus de valor y comunidad

## 🔧 Configuración

### 1. Configurar Secretos de Firebase

```bash
# Configurar PayPal
firebase functions:secrets:set PAYPAL_CLIENT_ID
firebase functions:secrets:set PAYPAL_CLIENT_SECRET

# Verificar secretos configurados
firebase functions:secrets:access
```

### 2. Configurar PayPal Developer Dashboard

1. Ve a [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Crea una nueva aplicación o usa una existente
3. Copia el **Client ID** y **Client Secret**
4. Configura el webhook:
   - **URL**: `https://us-central1-fortimind.cloudfunctions.net/paypalWebhook`
   - **Eventos**:
     - `BILLING.SUBSCRIPTION.ACTIVATED`
     - `BILLING.SUBSCRIPTION.CANCELLED`
     - `BILLING.SUBSCRIPTION.EXPIRED`
     - `PAYMENT.SALE.COMPLETED`

### 3. Actualizar URLs en el Código

En `services/subscriptionService.ts`:
```typescript
const FIREBASE_FUNCTIONS_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://us-central1-fortimind.cloudfunctions.net'  // ← Ya actualizado
  : 'http://localhost:5001/fortimind/us-central1';  // ← Ya actualizado
```

## 📁 Estructura de Archivos

```
functions/
├── src/
│   └── index.ts                    # Firebase Functions (PayPal + AI)
├── env.example                     # Variables de entorno
├── setup-secrets.md               # Instrucciones de configuración
└── package.json                   # Dependencias

components/
├── PayPalSubscriptionButton.tsx    # Botón de suscripción
├── FortiMindPremiumFeature.tsx    # Protección específica de FortiMind
├── PremiumFeature.tsx             # Protección general
└── examples/
    └── PremiumFeaturesExamples.tsx # Ejemplos de implementación

pages/
├── SubscriptionSuccessPage.tsx     # Página de éxito
├── SubscriptionCancelPage.tsx     # Página de cancelación
└── SubscriptionPage.tsx           # Página principal de suscripción

services/
├── subscriptionService.ts         # Servicio de suscripciones
└── premiumFeatures.ts            # Servicio de funciones premium

hooks/
├── useAuth.ts                     # Hook de autenticación
└── useFortiMindPremium.ts        # Hook de funciones premium
```

## 🚀 Despliegue

### 1. Construir y Desplegar Functions

```bash
cd functions
npm run build
firebase deploy --only functions
```

### 2. Verificar Despliegue

```bash
# Verificar funciones desplegadas
firebase functions:list

# Ver logs en tiempo real
firebase functions:log --only createPayPalSubscription,paypalWebhook
```

## 💳 Planes de Suscripción

### Plan Mensual
- **Precio**: $9.99 USD/mes
- **Descripción**: Acceso completo a todas las funciones premium

### Plan Anual
- **Precio**: $99.99 USD/año
- **Descripción**: Acceso completo a todas las funciones premium (2 meses gratis)

## 🔐 Seguridad

### Backend
- ✅ Secretos almacenados en Firebase Secrets
- ✅ Autenticación requerida para crear suscripciones
- ✅ Verificación de usuario en Firestore
- ✅ Webhook protegido (verificación de firma opcional)

### Frontend
- ✅ Verificación de autenticación antes de suscribirse
- ✅ Tokens de autenticación en requests
- ✅ Protección de funciones premium con componente wrapper
- ✅ Límites de uso para funciones gratuitas

## 📊 Estructura de Datos en Firestore

### Colección: `users`
```typescript
{
  uid: string,
  email: string,
  displayName: string,
  isPremium: boolean,
  subscriptionId?: string,
  premiumSince?: Timestamp,
  premiumCancelledAt?: Timestamp,
  premiumExpiresAt?: Timestamp,
  lastPaymentDate?: Timestamp,
  // Contadores de uso para funciones premium
  habitsCreated?: number,
  goalsCreated?: number,
  meditationSessions?: number,
  challengeDaysCompleted?: number,
  aiChatMessages?: number,
  // Contadores específicos por función
  ai_chatCount?: number,
  challenges_30_daysCount?: number,
  multiple_habits_goalsCount?: number,
  unlimited_meditationCount?: number,
  ai_diary_analysisCount?: number,
  weekly_monthly_ai_summaryCount?: number,
  advanced_statisticsCount?: number,
  early_accessCount?: number
}
```

### Colección: `subscriptions`
```typescript
{
  id: string, // PayPal subscription ID
  userId: string,
  planType: 'monthly' | 'yearly',
  status: string,
  startTime: string,
  createdAt: Timestamp,
  updatedAt?: Timestamp,
  cancelledAt?: Timestamp,
  expiredAt?: Timestamp,
  paypalSubscriptionId: string
}
```

### Colección: `payments`
```typescript
{
  id: string, // PayPal payment ID
  userId: string,
  subscriptionId: string,
  amount: string,
  currency: string,
  status: string,
  paymentDate: Timestamp,
  paypalPaymentId: string
}
```

## 🎯 Uso en el Frontend

### 1. Protección de Funciones Premium Específicas

```tsx
import FortiMindPremiumFeature from './components/FortiMindPremiumFeature';

// Chat con IA (Premium completo)
<FortiMindPremiumFeature featureId="ai_chat">
  <div>Chat con IA ilimitado</div>
</FortiMindPremiumFeature>

// Retos de 30 días (Límite gratuito: 10 días)
<FortiMindPremiumFeature featureId="challenges_30_days">
  <div>Reto de 30 días completo</div>
</FortiMindPremiumFeature>

// Múltiples hábitos (Límite gratuito: 1)
<FortiMindPremiumFeature featureId="multiple_habits_goals">
  <div>Crear múltiples hábitos</div>
</FortiMindPremiumFeature>
```

### 2. Hook para Funciones Premium

```tsx
import useFortiMindPremium from './hooks/useFortiMindPremium';

const MyComponent = () => {
  const { 
    canAccess, 
    featureAccess, 
    incrementUsage 
  } = useFortiMindPremium('ai_chat');

  const handleUseFeature = async () => {
    if (canAccess) {
      await incrementUsage('ai_chat');
      // Usar la función
    }
  };

  return (
    <div>
      {featureAccess && !featureAccess.isPremium && (
        <p>Usos restantes: {featureAccess.remaining}</p>
      )}
      <button onClick={handleUseFeature}>Usar Función</button>
    </div>
  );
};
```

### 3. Verificación de Estado Premium

```tsx
import PremiumFeaturesService from './services/premiumFeatures';

const checkAccess = async () => {
  const access = await PremiumFeaturesService.canAccessFeature('ai_chat');
  if (access.canAccess) {
    // Usar función
  } else {
    // Mostrar prompt de actualización
  }
};
```

## 🔄 Flujo de Suscripción

1. **Usuario hace clic en "Suscribirse"**
2. **Frontend llama a `createPayPalSubscription`**
3. **Backend crea plan y suscripción en PayPal**
4. **Usuario es redirigido a PayPal para completar pago**
5. **PayPal envía webhook con evento de activación**
6. **Backend actualiza `isPremium: true` en Firestore**
7. **Usuario regresa a la app con acceso premium**

## 🎮 Límites de Uso Gratuito

### Funciones con Límites
- **Retos de 30 días**: 10 días gratis
- **Múltiples hábitos/metas**: 1 hábito/meta gratis
- **Meditaciones**: 3 sesiones gratis
- **Chat con IA**: 5 mensajes gratis

### Funciones Premium Completas
- **Análisis AI del diario**
- **Resumen semanal/mensual con IA**
- **Estadísticas avanzadas**
- **Acceso anticipado**

## 🐛 Troubleshooting

### Error: "User not found"
- Verificar que el usuario existe en Firestore
- Asegurar que se crea el documento de usuario al registrarse

### Error: "PayPal API error"
- Verificar que las claves de PayPal son correctas
- Confirmar que estás usando el entorno correcto (sandbox/production)

### Webhook no funciona
- Verificar que la URL del webhook es correcta
- Confirmar que los eventos están configurados en PayPal
- Revisar logs de Firebase Functions

### Usuario no se marca como premium
- Verificar que el webhook está recibiendo eventos
- Revisar logs de la función `paypalWebhook`
- Confirmar que el `userId` en la suscripción es correcto

### Límites de uso no funcionan
- Verificar que se incrementan los contadores correctamente
- Revisar la estructura de datos en Firestore
- Confirmar que se usan los IDs correctos de funciones

## 📈 Monitoreo

### Logs de Firebase Functions
```bash
firebase functions:log --only createPayPalSubscription,paypalWebhook
```

### Métricas de PayPal
- Revisar dashboard de PayPal para transacciones
- Monitorear webhook delivery en PayPal Developer Dashboard

### Firestore
- Revisar colecciones `users`, `subscriptions`, `payments`
- Verificar que `isPremium` se actualiza correctamente
- Monitorear contadores de uso de funciones premium

## 🔄 Próximos Pasos

1. **Implementar verificación de firma de webhook**
2. **Agregar más planes de suscripción**
3. **Implementar sistema de cupones/descuentos**
4. **Agregar analytics de conversión**
5. **Implementar sistema de referidos**
6. **Agregar notificaciones de renovación/cancelación**
7. **Implementar sistema de puntos/recompensas**
8. **Agregar más funciones premium específicas**

## 📞 Soporte

Para problemas técnicos:
1. Revisar logs de Firebase Functions
2. Verificar configuración de PayPal
3. Confirmar estructura de datos en Firestore
4. Revisar este documento de implementación
5. Verificar límites de uso de funciones premium

---

**¡El sistema está listo para producción! 🎉** 