# 🔒 Configuración de Seguridad para Repositorio Público

## ⚠️ Advertencia Importante

Este repositorio es **PÚBLICO**. Para mantener la seguridad de los datos sensibles:

### 🚫 Datos que NO deben incluirse en commits públicos:

1. **API Keys reales de producción**
2. **Firebase configuration con claves reales**
3. **PayPal Client ID/Secret de producción**
4. **UIDs específicos de usuarios admin**
5. **Tokens de acceso o credenciales**

### ✅ Datos seguros para repositorio público:

1. **Código fuente de la aplicación**
2. **Componentes y lógica de negocio**
3. **Estilos y assets**
4. **Documentación**
5. **Archivos de configuración de ejemplo (.env.example)**

### 🔧 Configuración Recomendada para Producción:

#### 1. Variables de Entorno
Crear archivo `.env` (nunca commitear):
```bash
cp .env.example .env
# Editar .env con valores reales
```

#### 2. Firebase Config
Para producción, usar variables de entorno en lugar de valores hardcodeados en `firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... resto de configuración
};
```

#### 3. Admin UIDs
Los UIDs de admin se configuran mediante variable de entorno:
```bash
ADMIN_UIDS=uid1,uid2,uid3
```

#### 4. Deploy Seguro
- Usar Firebase Hosting con variables de entorno
- Configurar Firebase Functions con secrets
- Usar GitHub Actions con secrets para CI/CD

### 🛡️ Reglas de Firestore

Las reglas de Firestore están configuradas para:
- Solo permitir acceso a administradores verificados
- Validar permisos en cada operación
- Proteger datos sensibles de usuarios

### 📁 Archivos Excluidos (.gitignore)

```
.env
.env.local
*.env
firebase-admin-sdk.json
*private*
*secret*
```

### 🔍 Verificación Antes de Commit

Antes de cada commit público, verificar que NO se incluya:
- [ ] API keys reales
- [ ] UIDs específicos de usuarios
- [ ] Configuraciones de producción
- [ ] Archivos .env con datos reales
- [ ] Credentials o tokens

---

**Recuerda**: En un repositorio público, toda la información es visible para cualquier persona. Mantén siempre los datos sensibles en variables de entorno locales.
