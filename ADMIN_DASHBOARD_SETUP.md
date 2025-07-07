# Admin Dashboard Setup - FortiMind

## Descripción
Dashboard interno administrativo que muestra métricas clave de la aplicación FortiMind.

## Ruta de Acceso
- **URL**: `/admin-dashboard`
- **Componente**: `pages/AdminDashboard_clean.tsx`
- **Servicio**: `services/adminDashboardService.ts`

## Métricas Mostradas

### 1. Métricas de Usuarios
- **Total de usuarios registrados**: Cuenta total de documentos en la colección `users`
- **Usuarios activos**: Usuarios con actividad en las últimas 24 horas (basado en `user_activity`)
- **Nuevos usuarios**: Usuarios registrados en los últimos 7 días
- **Usuarios premium**: Usuarios con suscripciones activas (colección `user_subscriptions`)

### 2. Contenido Generado
- **Programas de ejercicio**: Total de documentos en `exercise_programs`
- **Retos nutricionales**: Total de documentos en `nutrition_challenges`
- **Días generados**: Suma total de días de todos los programas y retos
- **Duración promedio**: Promedio de días por programa/reto

### 3. Uso de Inteligencia Artificial
- **Total solicitudes IA**: Todas las actividades AI registradas
- **Últimos 7 días**: Solicitudes AI en la última semana
- **Últimas 24 horas**: Solicitudes AI del último día
- **Promedio por usuario**: Uso promedio de IA por usuario activo

### 4. Top 5 Usuarios Más Activos
- Lista de usuarios con mayor actividad en los últimos 30 días
- Muestra email, número de actividades y fecha de última actividad
- Incluye funciones favoritas de cada usuario

## Colecciones de Firestore Utilizadas

### user_activity
Estructura esperada:
```typescript
{
  userId: string;
  action: 'ai_chat' | 'program_creation' | 'challenge_creation' | 'ai_advice' | string;
  timestamp: Timestamp;
  metadata?: any;
}
```

### users
Estructura esperada:
```typescript
{
  email: string;
  createdAt: Timestamp;
  // otros campos del usuario
}
```

### user_subscriptions
Estructura esperada:
```typescript
{
  userId: string;
  status: 'active' | 'inactive' | 'cancelled';
  // otros campos de suscripción
}
```

### exercise_programs
Estructura esperada:
```typescript
{
  userId: string;
  totalDays: number;
  // otros campos del programa
}
```

### nutrition_challenges
Estructura esperada:
```typescript
{
  userId: string;
  totalDays: number;
  // otros campos del reto
}
```

## Funcionalidades

### Actualización en Tiempo Real
- Botón "Actualizar" para recargar todas las métricas
- Indicador de carga durante la obtención de datos
- Manejo de errores con opción de reintento

### Diseño Responsivo
- Cards de métricas adaptables a diferentes tamaños de pantalla
- Layout optimizado para móvil y desktop
- Iconos lucide-react para mejor visualización

### Información Contextual
- Subtítulos explicativos en las métricas
- Sección de información adicional al final
- Timestamp de última actualización

## Seguridad

### Acceso Controlado
- Protegido por `ProtectedRoute`
- Solo accesible para usuarios autenticados
- **Nota**: Considerar agregar verificación de rol de administrador

### Permisos de Firestore
- Requiere reglas de lectura apropiadas en Firestore
- Las consultas deben estar permitidas en `firestore.rules`

## Configuración de Desarrollo

### Dependencias
- React + TypeScript
- Firestore SDK
- Lucide React (iconos)
- Componentes de UI personalizados

### Navegación
- Link disponible en `Sidebar.tsx`
- Icono: `BarChart3`
- Etiqueta: "Admin Dashboard"

## Testing

### Datos de Prueba
Para probar el dashboard, asegúrate de tener:
1. Algunos usuarios en la colección `users`
2. Registros de actividad en `user_activity`
3. Programas en `exercise_programs`
4. Retos en `nutrition_challenges`
5. Suscripciones en `user_subscriptions`

### Validación
- Verificar que todas las métricas cargan correctamente
- Comprobar que los usuarios activos se calculan bien
- Validar que el top 5 de usuarios se muestra adecuadamente
- Confirmar que las métricas de IA son precisas

## Próximas Mejoras

### Funcionalidades Avanzadas
- Gráficos temporales de actividad
- Filtros por rango de fechas
- Exportación de datos
- Alertas para métricas críticas

### Optimización
- Cache de consultas frecuentes
- Paginación para listas grandes
- Actualización automática periódica
- Compresión de datos históricos

### Monitoreo
- Logs de acceso al dashboard
- Métricas de rendimiento de consultas
- Alertas de errores de Firestore
- Dashboard de salud del sistema
