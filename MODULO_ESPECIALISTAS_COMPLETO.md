# 🩺 Módulo de Especialistas FortiMind - Documentación Completa

## 🎯 Resumen del Sistema

El módulo de especialistas permite a psicólogos, nutricionistas y coaches certificados gestionar sus consultas, configurar disponibilidad, establecer tarifas y crear reportes personalizados que se integran con la IA de FortiMind.

---

## 🗄️ 1. ESTRUCTURA DE BASE DE DATOS

### 📊 Colección: `usuarios_especialistas/{specialistId}`

```typescript
{
  uid: string,                   // Firebase Auth UID
  displayId: string,            // ID visible tipo Discord (PsicoMaria#9471)
  nombre: string,
  apellido: string,
  email: string,
  tipo: "psicologo" | "nutricionista" | "coach",
  diasDisponibles: string[],    // ["lunes", "miercoles", "viernes"]
  horario: { [dia: string]: string[] }, // { "lunes": ["14:00", "16:00"] }
  tarifa: number,               // Precio en USD
  experiencia: string,          // Descripción de experiencia
  especialidades: string[],     // ["ansiedad", "depresión", "terapia cognitiva"]
  biografia?: string,           // Descripción personal
  certificaciones?: string[],   // ["Maestría en Psicología", "Certificado CBT"]
  idiomas?: string[],          // ["español", "inglés"]
  activo: boolean,             // Si está disponible para nuevas citas
  createdAt: Date,
  updatedAt?: Date
}
```

### 🗓️ Colección: `consultas_globales/{consultaId}` (Extendida)

```typescript
{
  // Campos existentes del sistema de consultas
  id: string,
  userId: string,
  email: string,
  nombre: string,
  tipoSesion: TipoSesion,
  fecha: Date,
  estado: EstadoConsulta,
  
  // Nuevos campos para especialistas
  specialistId: string,         // UID del especialista asignado
  motivo?: string,             // Razón de la consulta según el usuario
  reporteEspecialista?: string, // ID del reporte si existe
  duracionReal?: number,       // Duración real de la sesión
  siguienteCita?: Date,        // Si se programa cita de seguimiento
  
  // Metadatos
  createdAt: Date,
  updatedAt?: Date
}
```

### 📝 Colección: `reportes_ia/{reporteId}`

```typescript
{
  id: string,
  consultaId: string,
  userId: string,
  specialistId: string,
  resumen: string,             // Contexto clínico o emocional útil para la IA
  recomendaciones?: string,    // Recomendaciones específicas
  proximasSesiones?: string,   // Sugerencias para futuras sesiones
  autor: string,               // Nombre del profesional
  tipo: TipoSesion,           // psicólogo / nutricionista / coach
  fecha: Date,
  privacidad: 'privado' | 'contextual', // privado = solo especialista, contextual = disponible para IA
  visto_por_ia?: boolean,      // Si la IA ya procesó este reporte
  fecha_vista?: Date,          // Cuándo fue visto por la IA
  createdAt: Date
}
```

### 🤖 Subcolección: `usuarios/{userId}/contexto_ia/reporte_{consultaId}`

```typescript
{
  resumen: string,
  recomendaciones?: string,
  autor: string,
  tipo: TipoSesion,
  fecha: Date,
  privacidad: 'privado' | 'contextual',
  reporteId: string,           // Referencia al reporte principal
  createdAt: Date
}
```

---

## 🖥️ 2. FRONTEND - DASHBOARD DE ESPECIALISTAS

### 🌐 Ruta: `/especialista-dashboard`

#### 🔑 Validaciones de Acceso
- Verificar si el usuario es especialista registrado
- Comprobar que el especialista esté activo
- Redireccionar a página de error si no cumple criterios

#### 🧩 Componentes Principales

##### `SpecialistDashboard.tsx`
**Secciones:**
1. **📅 Mis Citas**
   - Lista de citas agendadas con filtros por estado
   - Botones para marcar como completada
   - Acceso rápido para subir reportes

2. **⚙️ Mi Disponibilidad**
   - Configuración de días disponibles
   - Gestión de horarios por día
   - Interfaz visual para seleccionar franjas horarias

3. **💵 Mi Tarifa**
   - Campo editable para precio por sesión
   - Validaciones de rango (1-500 USD)

4. **📘 Mis Reportes**
   - Historial de reportes enviados
   - Contador de sesiones completadas

##### Modal `ReportModal`
**Características:**
- Formulario para crear reportes post-sesión
- Campo obligatorio: Resumen de la sesión
- Campo opcional: Recomendaciones
- Selector de privacidad (Contextual/Privado)
- Validaciones antes de envío

#### 🎨 Elementos Visuales
- **Header:** Nombre + ID Discord + Tipo de especialista
- **Icons dinámicos:** 🧠 Psicólogo, 🍎 Nutricionista, 💪 Coach
- **Badges de estado:** Pendiente, Confirmado, Completado, etc.
- **Gradientes por especialidad:** Azul-púrpura, Verde-esmeralda, Naranja-rojo

---

## 🛠️ 3. GESTIÓN ADMINISTRATIVA

### 🌐 Ruta: `/admin/especialistas`

#### `SpecialistManagement.tsx`
**Funcionalidades:**
- **Vista general:** Lista de todos los especialistas
- **Filtros:** Por tipo, estado (activo/inactivo), búsqueda por nombre
- **Estadísticas:** Total, activos, por especialidad
- **Acciones:** Activar/desactivar especialistas
- **Creación:** Modal para registrar nuevos especialistas

#### 📊 Dashboard de Estadísticas
```typescript
{
  especialistas: {
    total: number,
    activos: number,
    porTipo: {
      psicologo: number,
      nutricionista: number,
      coach: number
    }
  },
  consultas: {
    totalCompletadas: number,
    conReporte: number,
    porTipo: Record<string, number>
  }
}
```

---

## ⚡ 4. FUNCIONES BACKEND (Firebase Functions)

### 📄 Archivo: `functions/src/especialistas.ts`

#### `getContextoIA(userId, pregunta)`
**Propósito:** Obtener contexto profesional para personalizar respuestas IA

**Proceso:**
1. Buscar último reporte contextual del usuario
2. Extraer información básica del perfil de usuario
3. Construir prompt enriquecido con contexto profesional
4. Retornar prompt final + metadatos

**Respuesta:**
```typescript
{
  success: boolean,
  promptConContexto: string,
  tieneContextoEspecialista: boolean,
  tieneContextoUsuario: boolean
}
```

#### `marcarReporteLeido(userId, reporteId)`
**Propósito:** Marcar cuándo la IA procesa un reporte

#### `getEspecialistasStats()`
**Propósito:** Obtener estadísticas para dashboard administrativo

---

## 🤖 5. INTEGRACIÓN CON IA

### 🔄 Flujo de Contextualización

1. **Usuario hace pregunta a IA**
2. **Sistema llama a `getContextoIA()`**
3. **Se obtiene último reporte de especialista**
4. **Prompt se enriquece con contexto profesional**
5. **IA responde con información personalizada**
6. **Se marca reporte como procesado**

### 📝 Ejemplo de Prompt Contextualizado

```
Contexto profesional previo:
- Profesional: Dra. María López (psicologo)
- Fecha: 15/12/2024
- Resumen: Paciente presenta ansiedad generalizada, trabajamos técnicas de respiración y mindfulness. Mostró buena receptividad a CBT.
- Recomendaciones: Continuar con ejercicios de respiración diarios, registrar niveles de ansiedad

Información del usuario:
- Nombre: Juan Pérez
- Edad: 28
- Objetivos: Manejo de ansiedad, mejorar sueño

Consulta del usuario: Me siento ansioso antes de dormir, ¿qué puedo hacer?

Por favor, responde de manera personalizada considerando el contexto profesional y la información del usuario.
```

---

## 🔒 6. SEGURIDAD Y PERMISOS

### 🛡️ Reglas de Firestore

#### Especialistas
- ✅ Solo el especialista puede modificar su perfil
- ✅ Usuarios pueden ver especialistas activos
- ✅ Administradores tienen acceso completo

#### Consultas
- ✅ Usuario y especialista asignado pueden acceder
- ✅ Administradores pueden supervisar

#### Reportes IA
- ✅ Solo el especialista autor puede crear/editar
- ✅ Usuario puede leer reportes marcados como 'contextual'
- ✅ Reportes 'privados' solo para profesionales

### 🔑 Funciones de Validación
```javascript
function isAdmin(userId) {
  return exists(/databases/$(database)/documents/admin_users/$(userId));
}

function isEspecialista(userId) {
  return exists(/databases/$(database)/documents/usuarios_especialistas/$(userId));
}
```

---

## 🆔 7. SISTEMA DE IDs ESTILO DISCORD

### 🎲 Generación Automática
```typescript
const generateDiscordStyleId = (nombre: string): string => {
  const cleanName = nombre.replace(/\s+/g, '').toLowerCase();
  const capitalizedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  const hash = Math.floor(Math.random() * 9000 + 1000);
  return `${capitalizedName}#${hash}`;
};
```

### 📋 Ejemplos:
- `PsicoMaria#9471`
- `CoachCarlos#2834`
- `NutriAna#7629`

---

## 🚀 8. FLUJO DE TRABAJO COMPLETO

### 👨‍💼 Para el Especialista:

1. **Acceso:** Navegar a `/especialista-dashboard`
2. **Verificación:** Sistema valida credenciales y estado activo
3. **Configuración inicial:**
   - Establecer disponibilidad semanal
   - Configurar tarifa por sesión
   - Completar perfil profesional

4. **Gestión de citas:**
   - Ver agenda de citas programadas
   - Marcar sesiones como completadas
   - Acceder a detalles de cada paciente

5. **Reportes post-sesión:**
   - Escribir resumen de la sesión
   - Agregar recomendaciones específicas
   - Elegir nivel de privacidad
   - Enviar reporte al sistema

### 👩‍💻 Para el Administrador:

1. **Gestión:** Acceder a `/admin/especialistas`
2. **Supervisión:** Revisar estadísticas generales
3. **Registro:** Crear nuevos especialistas
4. **Mantenimiento:** Activar/desactivar profesionales

### 🤖 Para la IA:

1. **Recepción:** Usuario hace pregunta
2. **Contexto:** Sistema busca reportes relevantes
3. **Enriquecimiento:** Prompt se mejora con información profesional
4. **Respuesta:** IA proporciona respuesta personalizada
5. **Tracking:** Se registra uso del contexto

---

## 📊 9. MÉTRICAS Y ANALYTICS

### 📈 KPIs Principales:
- **Especialistas activos:** Número de profesionales disponibles
- **Consultas completadas:** Total de sesiones finalizadas
- **Reportes generados:** Cantidad de reportes post-sesión
- **Uso de contexto IA:** Frecuencia de personalización

### 📋 Dashboard Metrics:
```typescript
interface MetricasEspecialistas {
  especialistasActivos: number;
  consultasEstesMes: number;
  reportesGenerados: number;
  satisfaccionPromedio: number;
  tiempoPromedioSesion: number;
  especialistaTop: {
    nombre: string;
    consultasCompletadas: number;
  };
}
```

---

## 🔧 10. CONFIGURACIÓN Y DEPLOYMENT

### 📦 Archivos Nuevos Creados:
- `src/types/consultas.ts` (extendido)
- `src/services/especialistasService.ts`
- `src/pages/SpecialistDashboard.tsx`
- `src/pages/SpecialistManagement.tsx`
- `functions/src/especialistas.ts`
- `firestore.rules` (actualizado)

### 🚀 Comandos de Deploy:
```bash
# Deploy funciones
firebase deploy --only functions

# Deploy reglas de Firestore
firebase deploy --only firestore:rules

# Deploy aplicación
npm run build
firebase deploy --only hosting
```

### 🧪 Testing:
```bash
# Ejecutar emuladores
firebase emulators:start --only functions,firestore,auth

# Testing especialistas
npm run test:especialistas
```

---

## ✅ 11. CHECKLIST DE IMPLEMENTACIÓN

### 🗄️ Base de Datos:
- ✅ Estructura de especialistas definida
- ✅ Colección de reportes IA
- ✅ Contexto por usuario implementado
- ✅ Reglas de seguridad configuradas

### 🖥️ Frontend:
- ✅ Dashboard de especialistas funcional
- ✅ Gestión administrativa completa
- ✅ Rutas protegidas implementadas
- ✅ Validación de roles activa

### ⚡ Backend:
- ✅ Funciones Firebase deployadas
- ✅ Integración con IA contextual
- ✅ Sistema de reportes activo
- ✅ APIs de estadísticas funcionando

### 🔒 Seguridad:
- ✅ Permisos por rol implementados
- ✅ Validaciones de especialista
- ✅ Protección de datos sensibles
- ✅ Control de acceso granular

### 🎨 UX/UI:
- ✅ Interfaz intuitiva y profesional
- ✅ Iconografía diferenciada por especialidad
- ✅ Feedback visual en tiempo real
- ✅ Navegación fluida entre secciones

---

## 🚀 El módulo de especialistas está **100% IMPLEMENTADO** y listo para producción!

### 🎯 Características Destacadas:
- **🆔 IDs estilo Discord** para profesionales
- **🤖 Integración IA contextual** automática
- **📱 Dashboard especializado** por profesional
- **🔒 Seguridad granular** por roles
- **📊 Analytics completos** para administración
- **⚡ Experiencia optimizada** para especialistas y usuarios

El sistema permite a FortiMind ofrecer un servicio profesional de consultorías personalizadas con integración perfecta entre especialistas humanos e inteligencia artificial, creando una experiencia única y personalizada para cada usuario.
