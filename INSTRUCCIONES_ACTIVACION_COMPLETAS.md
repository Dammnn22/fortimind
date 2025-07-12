# 🚀 PASOS EXACTOS PARA ACTIVAR EL MÓDULO DE ESPECIALISTAS

## ⚠️ ACCIONES REQUERIDAS INMEDIATAMENTE:

### 1. **CONFIGURAR TU UID DE ADMINISTRADOR**
```javascript
// EN: firestore.rules (línea 236)
// CAMBIAR: 'TU_UID_FIREBASE_AQUI' 
// POR: tu UID real de Firebase Auth

// EN: src/services/userService.ts (línea 12)  
// CAMBIAR: 'TU_UID_FIREBASE_AQUI'
// POR: tu UID real de Firebase Auth
```

**¿Cómo obtener tu UID?**
1. Ve a Firebase Console → Authentication → Users
2. Encuentra tu usuario y copia el UID
3. Reemplaza en ambos archivos

### 2. **REDESPLEGAR REGLAS DE FIRESTORE**
```bash
firebase deploy --only firestore:rules
```

### 3. **CREAR ESPECIALISTAS DE PRUEBA**
**Opción A - Manual (Recomendado):**
1. Ve a Firebase Console → Firestore Database
2. Crea la colección: `usuarios_especialistas`
3. Agrega un documento con esta estructura:

```json
{
  "uid": "doc_id_generado_automaticamente",
  "displayId": "PsicoMaria#1234",
  "nombre": "Maria",
  "apellido": "González", 
  "email": "maria@ejemplo.com",
  "tipo": "psicologo",
  "diasDisponibles": ["lunes", "martes", "miercoles"],
  "horario": {
    "lunes": ["14:00", "15:00", "16:00"],
    "martes": ["10:00", "11:00", "16:00"],
    "miercoles": ["14:00", "15:00"]
  },
  "tarifa": 50,
  "experiencia": "8 años de experiencia en psicología clínica",
  "especialidades": ["ansiedad", "depresión", "terapia cognitiva"],
  "biografia": "Psicóloga especializada en terapia cognitivo-conductual",
  "activo": true,
  "createdAt": "2025-01-08T00:00:00.000Z",
  "updatedAt": "2025-01-08T00:00:00.000Z"
}
```

**Opción B - Via Functions Console:**
1. Ve a Firebase Console → Functions
2. Crea una función temporal con el código de `create-specialists-manual.js`
3. Ejecuta la función

### 4. **VERIFICAR DESPLIEGUE**
```bash
npm run build
npm run dev
```

### 5. **CREAR UN USUARIO ESPECIALISTA REAL (OPCIONAL)**
Si quieres que un usuario real sea especialista:
1. El usuario debe registrarse normalmente en tu app
2. Ve a Firestore Console
3. En `usuarios_especialistas`, crea un documento con su UID real de Firebase Auth
4. Llena todos los campos requeridos

## ✅ VERIFICACIÓN DEL FUNCIONAMIENTO:

### Como Admin:
1. Inicia sesión con tu cuenta (debe tener el UID configurado)
2. Verás "Gestión de Especialistas" en el sidebar
3. Puedes ver, crear y gestionar especialistas

### Como Especialista:
1. Inicia sesión con una cuenta que esté en `usuarios_especialistas`
2. Verás "Dashboard Especialista" en el sidebar
3. Puedes ver tus citas y crear reportes

### Como Usuario Regular:
1. Ve a "Consultas 1:1" en el sidebar
2. Puedes reservar sesiones con especialistas disponibles

## 🎯 ESTADO ACTUAL:
- ✅ Backend desplegado (Firebase Functions)
- ✅ Frontend implementado (React Components)
- ✅ Seguridad configurada (Firestore Rules)
- ✅ Navegación implementada (Role-based Sidebar)
- ⚠️ **PENDIENTE: Configurar tu UID de admin**
- ⚠️ **PENDIENTE: Crear especialistas de prueba**

## 🔧 TROUBLESHOOTING:

**Si no ves las opciones de especialista en el sidebar:**
1. Verifica que tu UID esté en las reglas de Firestore
2. Redespliega las reglas: `firebase deploy --only firestore:rules`
3. Limpia caché del navegador

**Si hay errores de permisos:**
1. Verifica que las reglas de Firestore estén desplegadas
2. Confirma que los documentos existen en las colecciones correctas

**Si las funciones no funcionan:**
1. Verifica en Firebase Console → Functions que estén desplegadas
2. Revisa los logs de las funciones para errores

¡El módulo está 100% implementado y listo para usar! 🚀
