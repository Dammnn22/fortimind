import { 
  collection, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  addDoc,
  Timestamp,
  doc
} from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  Especialista, 
  CitaEspecialista, 
  ReporteIA, 
  TipoSesion,
  EstadoConsulta,
  DisponibilidadEspecialista 
} from '../types/consultas';

// Generar ID estilo Discord
export const generateDiscordStyleId = (nombre: string): string => {
  const cleanName = nombre.replace(/\s+/g, '').toLowerCase();
  const capitalizedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  const hash = Math.floor(Math.random() * 9000 + 1000);
  return `${capitalizedName}#${hash}`;
};

// Crear perfil de especialista
export const createEspecialista = async (especialistaData: Omit<Especialista, 'uid' | 'displayId' | 'createdAt'>): Promise<string> => {
  try {
    const displayId = generateDiscordStyleId(especialistaData.nombre);
    
    const newEspecialista: Especialista = {
      ...especialistaData,
      uid: '', // Se establecerá desde el Auth
      displayId,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'usuarios_especialistas'), newEspecialista);
    
    // Actualizar con el UID real
    await updateDoc(docRef, { uid: docRef.id });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating especialista:', error);
    throw error;
  }
};

// Obtener perfil de especialista por UID
export const getEspecialistaByUid = async (uid: string): Promise<Especialista | null> => {
  try {
    const q = query(
      collection(db, 'usuarios_especialistas'), 
      where('uid', '==', uid)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as Especialista;
  } catch (error) {
    console.error('Error getting especialista:', error);
    return null;
  }
};

// Actualizar perfil de especialista
export const updateEspecialista = async (uid: string, updates: Partial<Especialista>): Promise<void> => {
  try {
    const q = query(
      collection(db, 'usuarios_especialistas'), 
      where('uid', '==', uid)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating especialista:', error);
    throw error;
  }
};

// Obtener citas de un especialista
export const getCitasEspecialista = async (specialistId: string): Promise<CitaEspecialista[]> => {
  try {
    const q = query(
      collection(db, 'consultas_globales'),
      where('specialistId', '==', specialistId),
      orderBy('fecha', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as CitaEspecialista[];
  } catch (error) {
    console.error('Error getting citas especialista:', error);
    return [];
  }
};

// Obtener especialistas por tipo
export const getEspecialistasByTipo = async (tipo: TipoSesion): Promise<Especialista[]> => {
  try {
    const q = query(
      collection(db, 'usuarios_especialistas'),
      where('tipo', '==', tipo),
      where('activo', '==', true),
      orderBy('nombre')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Especialista[];
  } catch (error) {
    console.error('Error getting especialistas by tipo:', error);
    return [];
  }
};

// Crear reporte IA
export const createReporteIA = async (reporteData: Omit<ReporteIA, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const newReporte: Omit<ReporteIA, 'id'> = {
      ...reporteData,
      createdAt: new Date()
    };

    // Guardar en la colección global
    const docRef = await addDoc(collection(db, 'reportes_ia'), newReporte);
    
    // También guardar en el contexto del usuario para la IA
    await setDoc(
      doc(db, `usuarios/${reporteData.userId}/contexto_ia/reporte_${reporteData.consultaId}`),
      {
        ...newReporte,
        reporteId: docRef.id
      }
    );

    return docRef.id;
  } catch (error) {
    console.error('Error creating reporte IA:', error);
    throw error;
  }
};

// Obtener último reporte IA de un usuario
export const getLastSpecialistReport = async (userId: string): Promise<string | null> => {
  try {
    const q = query(
      collection(db, `usuarios/${userId}/contexto_ia`),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const lastReport = querySnapshot.docs[0].data();
    
    // Solo usar reportes marcados como 'contextual' para la IA
    if (lastReport.privacidad === 'contextual') {
      return `Reporte profesional anterior (${lastReport.tipo} - ${lastReport.autor}): ${lastReport.resumen}`;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting last specialist report:', error);
    return null;
  }
};

// Actualizar estado de cita
export const updateEstadoCita = async (consultaId: string, estado: EstadoConsulta): Promise<void> => {
  try {
    const docRef = doc(db, 'consultas_globales', consultaId);
    await updateDoc(docRef, {
      estado,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating estado cita:', error);
    throw error;
  }
};

// Obtener disponibilidad de especialista para una fecha
export const getDisponibilidadEspecialista = async (
  especialistaId: string, 
  fecha: Date
): Promise<DisponibilidadEspecialista | null> => {
  try {
    const especialista = await getEspecialistaByUid(especialistaId);
    if (!especialista) return null;

    const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    const horasDisponibles = especialista.horario[diaSemana] || [];

    // Obtener citas ocupadas para esa fecha
    const startOfDay = new Date(fecha);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(fecha);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, 'consultas_globales'),
      where('specialistId', '==', especialistaId),
      where('fecha', '>=', Timestamp.fromDate(startOfDay)),
      where('fecha', '<=', Timestamp.fromDate(endOfDay)),
      where('estado', 'in', ['confirmado', 'programado', 'en_progreso'])
    );

    const querySnapshot = await getDocs(q);
    const horasOcupadas = querySnapshot.docs.map(doc => {
      const fechaCita = doc.data().fecha.toDate();
      return fechaCita.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
    });

    return {
      especialistaId,
      fecha,
      horasDisponibles,
      horasOcupadas
    };
  } catch (error) {
    console.error('Error getting disponibilidad especialista:', error);
    return null;
  }
};

// Verificar si un usuario es especialista
export const isUserEspecialista = async (uid: string): Promise<boolean> => {
  try {
    const especialista = await getEspecialistaByUid(uid);
    return especialista !== null && especialista.activo;
  } catch (error) {
    console.error('Error checking if user is especialista:', error);
    return false;
  }
};
