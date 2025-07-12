# Guía para configurar PayPal Sandbox

## Problemas identificados:
1. Los Plan IDs pueden no existir en tu cuenta PayPal Sandbox
2. Necesitas crear productos y planes de suscripción

## Pasos para solucionar:

### 1. Crear cuenta y aplicación PayPal Sandbox:
- Ve a https://developer.paypal.com/
- Crea una aplicación sandbox
- Obtén tu Client ID y Secret

### 2. Crear productos y planes:
```bash
# Usar la API de PayPal para crear productos y planes
# O usar el dashboard de PayPal Developer
```

### 3. Actualizar .env con los nuevos IDs:
```env
REACT_APP_PAYPAL_CLIENT_ID=tu_client_id_aqui
REACT_APP_PAYPAL_MONTHLY_PLAN_ID=tu_plan_mensual_aqui
REACT_APP_PAYPAL_YEARLY_PLAN_ID=tu_plan_anual_aqui
```

### 4. Rutas de prueba disponibles:
- /paypal-test - Página de prueba original
- /paypal-button-test - Componente simplificado de prueba
- /paypal-diagnostics - Diagnósticos de configuración

### 5. Si los botones no aparecen, verifica:
- Consola del navegador para errores
- Network tab para ver si el SDK se carga
- Que los Plan IDs existan en PayPal
- Que el Client ID sea válido

### 6. URLs de prueba:
- http://localhost:5176/#/paypal-test
- http://localhost:5176/#/paypal-button-test  
- http://localhost:5176/#/paypal-diagnostics
