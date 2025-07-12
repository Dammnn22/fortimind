// Script para crear administradores
// Ejecutar en la consola de Firebase o como función Cloud

const admin = require('firebase-admin');

// Configurar tu proyecto Firebase
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  // o usa tu service account key
});

const db = admin.firestore();

async function createAdminUser(uid, data) {
  try {
    await db.collection('admin_users').doc(uid).set({
      email: data.email,
      nombre: data.nombre,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      permissions: ['manage_specialists', 'view_consultations', 'admin_dashboard']
    });
    console.log(`Admin user created: ${uid}`);
  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

// REEMPLAZA CON TU UID REAL DE FIREBASE AUTH
const yourFirebaseUID = 'TU_UID_AQUI'; // Obtén esto de Firebase Auth Console

createAdminUser(yourFirebaseUID, {
  email: 'tu-email@ejemplo.com',
  nombre: 'Tu Nombre Admin'
});
