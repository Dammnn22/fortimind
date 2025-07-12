// Script simple para crear especialistas de prueba vía Firebase console
// Ejecutar este código en la consola de Firebase Functions

const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

// Función para generar ID estilo Discord
function generateDiscordStyleId(nombre) {
  const cleanName = nombre.replace(/\s+/g, '').toLowerCase();
  const capitalizedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  const hash = Math.floor(Math.random() * 9000 + 1000);
  return `${capitalizedName}#${hash}`;
}

// Función principal para crear especialistas
async function createTestSpecialists() {
  const db = admin.firestore();
  
  const testSpecialists = [
    {
      nombre: 'Maria',
      apellido: 'González',
      email: 'maria.gonzalez@ejemplo.com',
      tipo: 'psicologo',
      diasDisponibles: ['lunes', 'martes', 'miercoles', 'viernes'],
      horario: {
        'lunes': ['09:00', '10:00', '14:00', '15:00'],
        'martes': ['10:00', '11:00', '16:00', '17:00'],
        'miercoles': ['09:00', '14:00', '15:00'],
        'viernes': ['14:00', '15:00', '16:00', '17:00']
      },
      tarifa: 50,
      experiencia: '8 años de experiencia en psicología clínica y terapia cognitivo-conductual',
      especialidades: ['ansiedad', 'depresión', 'terapia cognitiva', 'trauma'],
      biografia: 'Psicóloga especializada en terapia cognitivo-conductual con amplia experiencia en tratamiento de ansiedad y depresión.',
      certificaciones: ['Maestría en Psicología Clínica', 'Certificación en TCC', 'Diplomado en Trauma'],
      idiomas: ['español', 'inglés']
    },
    {
      nombre: 'Carlos',
      apellido: 'López',
      email: 'carlos.lopez@ejemplo.com',
      tipo: 'nutricionista',
      diasDisponibles: ['lunes', 'miercoles', 'jueves', 'viernes'],
      horario: {
        'lunes': ['08:00', '09:00', '10:00', '15:00'],
        'miercoles': ['09:00', '10:00', '14:00', '16:00'],
        'jueves': ['08:00', '09:00', '15:00', '16:00'],
        'viernes': ['09:00', '10:00', '11:00', '15:00']
      },
      tarifa: 40,
      experiencia: '5 años especializándose en nutrición deportiva y pérdida de peso saludable',
      especialidades: ['nutrición deportiva', 'pérdida de peso', 'diabetes', 'nutrición vegana'],
      biografia: 'Nutricionista deportivo con enfoque en planes personalizados para atletas y personas activas.',
      certificaciones: ['Licenciatura en Nutrición', 'Especialización en Nutrición Deportiva'],
      idiomas: ['español']
    },
    {
      nombre: 'Ana',
      apellido: 'Martínez',
      email: 'ana.martinez@ejemplo.com',
      tipo: 'coach',
      diasDisponibles: ['martes', 'miercoles', 'jueves', 'sabado'],
      horario: {
        'martes': ['14:00', '15:00', '16:00', '18:00'],
        'miercoles': ['14:00', '15:00', '17:00', '18:00'],
        'jueves': ['15:00', '16:00', '17:00', '18:00'],
        'sabado': ['09:00', '10:00', '11:00', '12:00']
      },
      tarifa: 35,
      experiencia: '4 años ayudando a profesionales a alcanzar sus metas personales y laborales',
      especialidades: ['desarrollo personal', 'productividad', 'liderazgo', 'balance vida-trabajo'],
      biografia: 'Coach certificado especializado en desarrollo personal y profesional para ejecutivos y emprendedores.',
      certificaciones: ['Certificación Internacional en Coaching', 'PNL Practitioner'],
      idiomas: ['español', 'inglés', 'portugués']
    }
  ];

  try {
    for (const specialistData of testSpecialists) {
      const displayId = generateDiscordStyleId(specialistData.nombre);
      
      const newSpecialist = {
        ...specialistData,
        uid: '', // Se establecerá como el ID del documento
        displayId,
        activo: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('usuarios_especialistas').add(newSpecialist);
      
      // Actualizar con el UID real
      await docRef.update({ uid: docRef.id });
      
      console.log(`✅ Especialista creado: ${specialistData.nombre} ${specialistData.apellido} (${displayId})`);
    }
    
    console.log('🎉 Todos los especialistas de prueba fueron creados exitosamente!');
    return { success: true, message: 'Especialistas creados' };
  } catch (error) {
    console.error('❌ Error creando especialistas:', error);
    return { success: false, error: error.message };
  }
}

// Exportar para uso en Firebase Functions
module.exports = { createTestSpecialists };

console.log(`
🔥 INSTRUCCIONES PARA CREAR ESPECIALISTAS DE PRUEBA:

1. Ve a la consola de Firebase Functions
2. Copia y pega este código en una nueva función temporal
3. O ejecuta directamente: createTestSpecialists()

ALTERNATIVAMENTE, crea manualmente en Firestore Console:
- Ve a Firestore Database
- Crea la colección: usuarios_especialistas  
- Agrega documentos con la estructura mostrada arriba
`);
