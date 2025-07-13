import { collection, doc, setDoc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Función para crear datos iniciales de especialistas
export const initializeSpecialistData = async () => {
  try {
    // Especialistas de ejemplo
    const specialists = [
      {
        uid: 'specialist_nutrition_1',
        tipo: 'nutricion',
        nombre: 'Dr. María González',
        email: 'maria.gonzalez@fortimind.com',
        diasDisponibles: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        horario: {
          inicio: '09:00',
          fin: '17:00'
        },
        tarifa: 75,
        plataforma: 'Zoom',
        clientes: [],
        activo: true,
        fechaCreacion: serverTimestamp(),
        especialidades: ['Nutrición clínica', 'Nutrición deportiva', 'Control de peso'],
        descripcion: 'Nutricionista certificada con 10 años de experiencia en nutrición clínica y deportiva.'
      },
      {
        uid: 'specialist_psychology_1',
        tipo: 'psicologia',
        nombre: 'Dra. Ana Martínez',
        email: 'ana.martinez@fortimind.com',
        diasDisponibles: ['Lunes', 'Miércoles', 'Viernes', 'Sábado'],
        horario: {
          inicio: '10:00',
          fin: '18:00'
        },
        tarifa: 80,
        plataforma: 'Google Meet',
        clientes: [],
        activo: true,
        fechaCreacion: serverTimestamp(),
        especialidades: ['Terapia cognitivo-conductual', 'Ansiedad', 'Depresión'],
        descripcion: 'Psicóloga clínica especializada en terapia cognitivo-conductual y trastornos de ansiedad.'
      },
      {
        uid: 'specialist_trainer_1',
        tipo: 'entrenador',
        nombre: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@fortimind.com',
        diasDisponibles: ['Lunes', 'Martes', 'Jueves', 'Viernes', 'Sábado'],
        horario: {
          inicio: '06:00',
          fin: '20:00'
        },
        tarifa: 60,
        plataforma: 'Presencial/Online',
        clientes: [],
        activo: true,
        fechaCreacion: serverTimestamp(),
        especialidades: ['Entrenamiento funcional', 'Musculación', 'Cardio'],
        descripcion: 'Entrenador personal certificado con experiencia en entrenamiento funcional y musculación.'
      }
    ];

    // Crear documentos de especialistas
    for (const specialist of specialists) {
      const docRef = doc(db, 'usuarios_especialistas', specialist.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, specialist);
        console.log(`Especialista ${specialist.nombre} creado con éxito`);
      } else {
        console.log(`Especialista ${specialist.nombre} ya existe`);
      }
    }

    return { success: true, message: 'Datos de especialistas inicializados correctamente' };
  } catch (error) {
    console.error('Error initializing specialist data:', error);
    return { success: false, message: 'Error al inicializar datos de especialistas', error };
  }
};

// Función para crear sesiones de ejemplo
export const createSampleSessions = async () => {
  try {
    const sampleSessions = [
      {
        especialista: {
          uid: 'specialist_nutrition_1',
          nombre: 'Dr. María González',
          tipo: 'nutricion'
        },
        clienteUid: 'sample_client_1',
        clienteNombre: 'Juan Pérez',
        fecha: new Date('2024-01-15T10:00:00'),
        notas: 'Primera consulta nutricional. Se evaluó el estado nutricional actual del paciente y se establecieron objetivos de pérdida de peso saludable.',
        progreso: 'Paciente motivado para iniciar cambios en su alimentación. IMC: 28.5',
        evaluacion: 4,
        duracion: 60,
        fechaCreacion: serverTimestamp()
      },
      {
        especialista: {
          uid: 'specialist_psychology_1',
          nombre: 'Dra. Ana Martínez',
          tipo: 'psicologia'
        },
        clienteUid: 'sample_client_2',
        clienteNombre: 'María López',
        fecha: new Date('2024-01-16T14:30:00'),
        notas: 'Sesión de terapia cognitivo-conductual. Se trabajaron técnicas de manejo de ansiedad y se establecieron tareas para casa.',
        progreso: 'Paciente muestra mejoría en el control de episodios de ansiedad. Técnicas de respiración implementadas exitosamente.',
        evaluacion: 5,
        duracion: 50,
        fechaCreacion: serverTimestamp()
      },
      {
        especialista: {
          uid: 'specialist_trainer_1',
          nombre: 'Carlos Rodríguez',
          tipo: 'entrenador'
        },
        clienteUid: 'sample_client_3',
        clienteNombre: 'Pedro García',
        fecha: new Date('2024-01-17T16:00:00'),
        notas: 'Sesión de entrenamiento funcional. Se enfocó en ejercicios de core y estabilidad. Aumento de intensidad gradual.',
        progreso: 'Cliente muestra mejora en fuerza y resistencia. Puede realizar 3 series de 15 repeticiones sin dificultad.',
        evaluacion: 4,
        duracion: 45,
        fechaCreacion: serverTimestamp()
      }
    ];

    // Crear sesiones de ejemplo
    for (const session of sampleSessions) {
      const sessionsRef = collection(db, 'clientes_sesiones', session.clienteUid, 'sesiones');
      await addDoc(sessionsRef, session);
      console.log(`Sesión de ejemplo creada para ${session.clienteNombre}`);
    }

    return { success: true, message: 'Sesiones de ejemplo creadas correctamente' };
  } catch (error) {
    console.error('Error creating sample sessions:', error);
    return { success: false, message: 'Error al crear sesiones de ejemplo', error };
  }
};

// Función para asignar clientes a especialistas
export const assignClientsToSpecialists = async () => {
  try {
    const assignments = [
      {
        specialistUid: 'specialist_nutrition_1',
        clients: ['sample_client_1', 'sample_client_4']
      },
      {
        specialistUid: 'specialist_psychology_1',
        clients: ['sample_client_2', 'sample_client_5']
      },
      {
        specialistUid: 'specialist_trainer_1',
        clients: ['sample_client_3', 'sample_client_6']
      }
    ];

    for (const assignment of assignments) {
      const specialistRef = doc(db, 'usuarios_especialistas', assignment.specialistUid);
      const specialistSnap = await getDoc(specialistRef);
      
      if (specialistSnap.exists()) {
        await setDoc(specialistRef, {
          ...specialistSnap.data(),
          clientes: assignment.clients,
          fechaActualizacion: serverTimestamp()
        });
        console.log(`Clientes asignados al especialista ${assignment.specialistUid}`);
      }
    }

    return { success: true, message: 'Clientes asignados correctamente' };
  } catch (error) {
    console.error('Error assigning clients:', error);
    return { success: false, message: 'Error al asignar clientes', error };
  }
};

// Función principal para configurar todo el sistema de especialistas
export const setupSpecialistSystem = async () => {
  try {
    console.log('Iniciando configuración del sistema de especialistas...');
    
    const initResult = await initializeSpecialistData();
    if (!initResult.success) {
      throw new Error(initResult.message);
    }

    const sessionsResult = await createSampleSessions();
    if (!sessionsResult.success) {
      console.warn('Advertencia al crear sesiones de ejemplo:', sessionsResult.message);
    }

    const assignResult = await assignClientsToSpecialists();
    if (!assignResult.success) {
      console.warn('Advertencia al asignar clientes:', assignResult.message);
    }

    console.log('Sistema de especialistas configurado exitosamente');
    return { success: true, message: 'Sistema de especialistas configurado exitosamente' };
  } catch (error) {
    console.error('Error setting up specialist system:', error);
    return { success: false, message: 'Error al configurar el sistema de especialistas', error };
  }
};
