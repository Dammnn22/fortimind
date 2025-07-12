// Script para crear especialistas de prueba
// Ejecutar con: node create-test-specialists.js

const admin = require('firebase-admin');

// Inicializar Firebase Admin (asegúrate de tener las credenciales)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'fortimind'
  });
}

const db = admin.firestore();

// Función para generar ID estilo Discord
const generateDiscordStyleId = (nombre) => {
  const cleanName = nombre.replace(/\s+/g, '').toLowerCase();
  const capitalizedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  const hash = Math.floor(Math.random() * 9000 + 1000);
  return `${capitalizedName}#${hash}`;
};

// Especialistas de prueba
const especialistasPrueba = [
  {
    nombre: 'María',
    apellido: 'González',
    email: 'maria.gonzalez@fortimind.com',
    tipo: 'psicologo',
    diasDisponibles: ['lunes', 'miercoles', 'viernes'],
    horario: {
      'lunes': ['14:00', '15:00', '16:00', '17:00'],
      'miercoles': ['14:00', '15:00', '16:00'],
      'viernes': ['15:00', '16:00', '17:00', '18:00']
    },
    tarifa: 35,
    experiencia: '8 años de experiencia en psicología clínica y terapia cognitivo-conductual. Especializada en trastornos de ansiedad y depresión.',
    especialidades: ['ansiedad', 'depresión', 'terapia cognitiva', 'mindfulness'],
    biografia: 'Psicóloga clínica con maestría en Terapia Cognitivo-Conductual. Apasionada por ayudar a las personas a desarrollar herramientas para el bienestar mental.',
    certificaciones: ['Maestría en Psicología Clínica', 'Certificación en CBT', 'Mindfulness-Based Stress Reduction'],
    idiomas: ['español', 'inglés']
  },
  {
    nombre: 'Carlos',
    apellido: 'Ruiz',
    email: 'carlos.ruiz@fortimind.com',
    tipo: 'coach',
    diasDisponibles: ['martes', 'jueves', 'sabado'],
    horario: {
      'martes': ['08:00', '09:00', '17:00', '18:00'],
      'jueves': ['08:00', '09:00', '17:00', '18:00', '19:00'],
      'sabado': ['09:00', '10:00', '11:00', '12:00']
    },
    tarifa: 25,
    experiencia: '5 años como entrenador personal certificado. Especialista en programas de pérdida de peso y ganancia muscular.',
    especialidades: ['pérdida de peso', 'ganancia muscular', 'acondicionamiento físico', 'nutrición deportiva'],
    biografia: 'Coach de fitness certificado con enfoque en transformaciones corporales sostenibles y hábitos saludables a largo plazo.',
    certificaciones: ['NASM Certified Personal Trainer', 'Precision Nutrition Level 1', 'Functional Movement Screen'],
    idiomas: ['español', 'inglés']
  },
  {
    nombre: 'Ana',
    apellido: 'Martínez',
    email: 'ana.martinez@fortimind.com',
    tipo: 'nutricionista',
    diasDisponibles: ['lunes', 'martes', 'miercoles', 'jueves'],
    horario: {
      'lunes': ['10:00', '11:00', '15:00', '16:00'],
      'martes': ['10:00', '11:00', '15:00', '16:00'],
      'miercoles': ['10:00', '11:00', '14:00', '15:00'],
      'jueves': ['10:00', '11:00', '15:00', '16:00']
    },
    tarifa: 30,
    experiencia: '6 años de experiencia en nutrición clínica y deportiva. Especializada en planes personalizados para diferentes objetivos de salud.',
    especialidades: ['nutrición clínica', 'nutrición deportiva', 'pérdida de peso', 'diabetes', 'alimentación vegana'],
    biografia: 'Nutricionista con licenciatura en Nutrición y Dietética. Enfoque en planes alimentarios personalizados y educación nutricional.',
    certificaciones: ['Licenciatura en Nutrición', 'Certificación en Nutrición Deportiva', 'Especialización en Diabetes'],
    idiomas: ['español', 'inglés', 'francés']
  },
  {
    nombre: 'David',
    apellido: 'López',
    email: 'david.lopez@fortimind.com',
    tipo: 'psicologo',
    diasDisponibles: ['martes', 'miercoles', 'jueves', 'viernes'],
    horario: {
      'martes': ['16:00', '17:00', '18:00', '19:00'],
      'miercoles': ['16:00', '17:00', '18:00'],
      'jueves': ['15:00', '16:00', '17:00', '18:00'],
      'viernes': ['15:00', '16:00', '17:00']
    },
    tarifa: 40,
    experiencia: '10 años en psicología clínica con especialización en trauma y TEPT. Experiencia en terapia individual y grupal.',
    especialidades: ['trauma', 'TEPT', 'terapia familiar', 'adicciones', 'duelo'],
    biografia: 'Psicólogo clínico especializado en trauma y recuperación. Enfoque en terapias basadas en evidencia para la sanación emocional.',
    certificaciones: ['Doctorado en Psicología Clínica', 'EMDR Therapy', 'Trauma-Focused CBT'],
    idiomas: ['español', 'inglés']
  }
];

async function crearEspecialistas() {
  console.log('🚀 Iniciando creación de especialistas de prueba...\n');

  for (const especialista of especialistasPrueba) {
    try {
      // Generar ID estilo Discord
      const displayId = generateDiscordStyleId(especialista.nombre);
      
      // Crear documento en Firestore
      const especialistaData = {
        ...especialista,
        displayId,
        activo: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('usuarios_especialistas').add(especialistaData);
      
      // Actualizar con el UID real
      await db.collection('usuarios_especialistas').doc(docRef.id).update({
        uid: docRef.id
      });

      console.log(`✅ Especialista creado: ${especialista.nombre} ${especialista.apellido}`);
      console.log(`   📧 Email: ${especialista.email}`);
      console.log(`   🆔 ID: ${displayId}`);
      console.log(`   👨‍⚕️ Tipo: ${especialista.tipo}`);
      console.log(`   💰 Tarifa: $${especialista.tarifa} USD`);
      console.log(`   📅 Días disponibles: ${especialista.diasDisponibles.join(', ')}`);
      console.log(`   🏥 Especialidades: ${especialista.especialidades.slice(0, 3).join(', ')}\n`);

    } catch (error) {
      console.error(`❌ Error creando especialista ${especialista.nombre}:`, error);
    }
  }

  console.log('🎉 ¡Especialistas de prueba creados exitosamente!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Ve a /admin/especialistas para ver los especialistas');
  console.log('2. Cada especialista puede acceder a /especialista-dashboard con su UID');
  console.log('3. Los usuarios pueden ver especialistas activos al reservar consultas');
}

// Ejecutar el script
crearEspecialistas()
  .then(() => {
    console.log('✨ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en el script:', error);
    process.exit(1);
  });

module.exports = { crearEspecialistas, especialistasPrueba };
