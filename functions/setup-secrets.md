# 🔐 Configuración Manual de Secretos Firebase

## API Keys Disponibles:

### DeepSeek API Key:
```
sk-1ad99b5f12174c749770dbe684a6d37c
```

### Gemini API Key:
```
[Necesitas proporcionar tu Gemini API Key]
```

### PayPal API Keys:
```
[Necesitas obtener tus PayPal Client ID y Client Secret del PayPal Developer Dashboard]
```

## Comandos para Configurar:

```bash
# Configurar DeepSeek
firebase functions:secrets:set DEEPSEEK_API_KEY

# Configurar Gemini (cuando tengas la clave)
firebase functions:secrets:set GEMINI_API_KEY

# Configurar PayPal (obtener desde https://developer.paypal.com/dashboard/)
firebase functions:secrets:set PAYPAL_CLIENT_ID
firebase functions:secrets:set PAYPAL_CLIENT_SECRET
```

## Pasos para PayPal:
1. Ve a https://developer.paypal.com/dashboard/
2. Crea una nueva aplicación o usa una existente
3. Copia el Client ID y Client Secret
4. Ejecuta los comandos de configuración de secretos
5. Configura el webhook en PayPal Dashboard:
   - URL: `https://your-project.cloudfunctions.net/paypalWebhook`
   - Eventos: `BILLING.SUBSCRIPTION.ACTIVATED`, `BILLING.SUBSCRIPTION.CANCELLED`, `BILLING.SUBSCRIPTION.EXPIRED`, `PAYMENT.SALE.COMPLETED`

## Pasos:
1. Ejecutar el comando para DeepSeek
2. Pegar la clave cuando se solicite
3. Proporcionar la clave de Gemini cuando esté disponible
4. Configurar PayPal siguiendo los pasos anteriores
5. Desplegar las funciones 