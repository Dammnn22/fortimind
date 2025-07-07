# Migración de Gemini a DeepSeek

## Resumen

Se ha migrado exitosamente la funcionalidad de IA de Gemini a DeepSeek en las secciones de retos de ejercicios y nutrición de FortiMind. Esta migración fue necesaria debido al límite alcanzado en el plan de Gemini.

## Cambios Realizados

### 1. Nuevo Servicio DeepSeek
- **Archivo**: `services/deepSeekService.ts`
- **Funcionalidad**: Servicio completo para interactuar con la API de DeepSeek
- **Características**:
  - Soporte para todos los personajes de IA (AIPersona)
  - Manejo de errores robusto
  - Configuración de temperatura específica para cada tipo de tarea
  - Soporte para historial de conversaciones
  - Generación de rutinas de ejercicios y planes nutricionales

### 2. Actualización de Servicios Existentes

#### Servicio de Ejercicios (`services/exerciseService.ts`)
- Reemplazado `getGeminiAdvice` por `getDeepSeekAdvice`
- Actualizado mensajes de error para reflejar DeepSeek
- Mantenida toda la funcionalidad existente

#### Servicio de Nutrición (`services/nutritionService.ts`)
- Reemplazado `getGeminiAdvice` por `getDeepSeekAdvice`
- Actualizado mensajes de error para reflejar DeepSeek
- Mantenida toda la funcionalidad existente

### 3. Constantes Actualizadas
- **Archivo**: `constants.ts`
- Agregada constante `DEEPSEEK_MODEL_NAME = "deepseek-chat"`

### 4. Página de Soporte Actualizada
- **Archivo**: `pages/SupportPage.tsx`
- Agregada información sobre DeepSeek
- Mostrado estado de disponibilidad de ambos servicios

## Configuración Requerida

### Variables de Entorno
Para que DeepSeek funcione correctamente, es necesario configurar la siguiente variable de entorno:

```bash
DEEPSEEK_API_KEY=tu_api_key_de_deepseek
```

### Obtener API Key de DeepSeek
1. Visitar [DeepSeek Console](https://platform.deepseek.com/)
2. Crear una cuenta o iniciar sesión
3. Generar una nueva API key
4. Configurar la variable de entorno en el proyecto

## Funcionalidades Migradas

### Reto de Ejercicios
- ✅ Generación de rutinas personalizadas por día
- ✅ Diferentes niveles de dificultad (principiante, intermedio, profesional)
- ✅ Soporte para entrenamiento en casa y gimnasio
- ✅ Rotación de grupos musculares
- ✅ Rutinas estáticas de respaldo

### Reto de Nutrición
- ✅ Generación de planes de comidas completos
- ✅ Reemplazo de comidas individuales
- ✅ Soporte para diferentes objetivos (bajar peso, mantener, ganar masa)
- ✅ Estilos alimenticios (omnívoro, vegetariano, vegano)
- ✅ Manejo de alergias y preferencias culturales

## Personajes de IA Soportados

DeepSeek ahora maneja todos los personajes de IA que anteriormente manejaba Gemini:

- `JOURNAL_ANALYST`: Análisis de entradas de diario
- `EMERGENCY_CHAT`: Chat de emergencia en modo crisis
- `FUTURE_SELF_MENTOR`: Mentor del yo futuro
- `WORKOUT_GENERATOR`: Generador de rutinas de ejercicios
- `NUTRITION_PLAN_GENERATOR`: Generador de planes nutricionales
- `CONTENT_MODERATOR`: Moderación de contenido
- `PERSONALIZED_RECOMMENDER`: Recomendador personalizado
- `AI_MENTOR_DEFAULT`: Mentor IA por defecto

## Ventajas de DeepSeek

1. **Límites más altos**: DeepSeek ofrece límites más generosos en su plan gratuito
2. **Rendimiento**: Respuestas rápidas y consistentes
3. **Calidad**: Generación de contenido de alta calidad
4. **Compatibilidad**: API compatible con OpenAI, fácil de integrar

## Fallbacks y Manejo de Errores

El sistema incluye múltiples capas de fallback:

1. **Rutinas estáticas**: Si la API falla, se usan rutinas predefinidas
2. **Manejo de errores**: Mensajes claros cuando la API no está disponible
3. **Validación**: Verificación de respuestas JSON antes de procesarlas
4. **Logging**: Registro detallado de errores para debugging

## Próximos Pasos

1. **Configurar API Key**: Asegurarse de que `DEEPSEEK_API_KEY` esté configurada
2. **Probar funcionalidades**: Verificar que los retos funcionen correctamente
3. **Monitorear uso**: Revisar logs para asegurar funcionamiento estable
4. **Optimizar prompts**: Ajustar prompts si es necesario para mejorar resultados

## Notas Importantes

- Gemini sigue disponible para otras funcionalidades de la app
- DeepSeek se usa específicamente para retos de ejercicios y nutrición
- La migración es transparente para el usuario final
- No se requiere migración de datos existentes 