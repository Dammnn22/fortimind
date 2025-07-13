import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  addDoc,
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { SpecialistData, ClientSession, ClientInfo, SpecialistType } from '../types/specialists';

const ADMIN_UID = 'afWkPmGLEIMUL4SAUHXf0ryPUJ02';

// Verificar si el usuario es admin
export const isAdmin = (uid: string): boolean => {
  return uid === ADMIN_UID;
};

// Obtener datos del especialista
export const getSpecialistData = async (uid: string): Promise<SpecialistData | null> => {
  try {
    const docRef = doc(db, 'usuarios_especialistas', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { uid, ...docSnap.data() } as SpecialistData;
    }
    return null;
  } catch (error) {
    console.error('Error getting specialist data:', error);
    throw error;
  }
};

// Verificar si el usuario tiene acceso a un dashboard específico
export const hasAccessToDashboard = async (uid: string, requiredType: SpecialistType): Promise<boolean> => {
  try {
    // Admin tiene acceso a todo
    if (isAdmin(uid)) {
      return true;
    }
    
    const specialistData = await getSpecialistData(uid);
    return specialistData?.tipo === requiredType && specialistData?.activo === true;
  } catch (error) {
    console.error('Error checking dashboard access:', error);
    return false;
  }
};

// Crear o actualizar datos del especialista
export const updateSpecialistData = async (uid: string, data: Partial<SpecialistData>): Promise<void> => {
  try {
    const docRef = doc(db, 'usuarios_especialistas', uid);
    await setDoc(docRef, {
      ...data,
      fechaActualizacion: Timestamp.now()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating specialist data:', error);
    throw error;
  }
};

// Obtener clientes del especialista
export const getSpecialistClients = async (specialistUid: string): Promise<ClientInfo[]> => {
  try {
    const specialistData = await getSpecialistData(specialistUid);
    if (!specialistData || !specialistData.clientes?.length) {
      return [];
    }

    const clients: ClientInfo[] = [];
    
    // Obtener información de cada cliente
    for (const clientUid of specialistData.clientes) {
      try {
        const clientDoc = await getDoc(doc(db, 'users', clientUid));
        if (clientDoc.exists()) {
          const clientData = clientDoc.data();
          
          // Contar sesiones del cliente
          const sessionsQuery = query(
            collection(db, 'clientes_sesiones', clientUid, 'sesiones'),
            where('especialista.uid', '==', specialistUid)
          );
          const sessionsSnap = await getDocs(sessionsQuery);
          
          // Obtener última sesión
          const lastSessionQuery = query(
            collection(db, 'clientes_sesiones', clientUid, 'sesiones'),
            where('especialista.uid', '==', specialistUid),
            orderBy('fecha', 'desc'),
            limit(1)
          );
          const lastSessionSnap = await getDocs(lastSessionQuery);
          
          clients.push({
            uid: clientUid,
            displayName: clientData.displayName || clientData.email || 'Usuario',
            email: clientData.email,
            photoURL: clientData.photoURL,
            totalSesiones: sessionsSnap.size,
            ultimaSesion: lastSessionSnap.empty ? null : lastSessionSnap.docs[0].data().fecha,
            estado: 'activo' // Por ahora todos activos
          });
        }
      } catch (error) {
        console.error(`Error getting client ${clientUid}:`, error);
      }
    }

    return clients;
  } catch (error) {
    console.error('Error getting specialist clients:', error);
    throw error;
  }
};

// Crear sesión con cliente
export const createClientSession = async (
  clientUid: string, 
  sessionData: Omit<ClientSession, 'id' | 'fechaCreacion'>
): Promise<string> => {
  try {
    const sessionsRef = collection(db, 'clientes_sesiones', clientUid, 'sesiones');
    const docRef = await addDoc(sessionsRef, {
      ...sessionData,
      fechaCreacion: Timestamp.now()
    });

    // Actualizar resumen de última sesión en el usuario
    const userRef = doc(db, 'users', clientUid);
    await updateDoc(userRef, {
      last_session_summary: `Sesión con ${sessionData.especialista.nombre} (${sessionData.especialista.tipo}) - ${sessionData.notas.substring(0, 100)}...`,
      last_session_date: sessionData.fecha,
      last_session_specialist: sessionData.especialista
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating client session:', error);
    throw error;
  }
};

// Obtener sesiones del especialista
export const getSpecialistSessions = async (specialistUid: string, limit_count: number = 10): Promise<ClientSession[]> => {
  try {
    const specialistData = await getSpecialistData(specialistUid);
    if (!specialistData || !specialistData.clientes?.length) {
      return [];
    }

    const allSessions: ClientSession[] = [];

    // Obtener sesiones de todos los clientes
    for (const clientUid of specialistData.clientes) {
      try {
        const sessionsQuery = query(
          collection(db, 'clientes_sesiones', clientUid, 'sesiones'),
          where('especialista.uid', '==', specialistUid),
          orderBy('fecha', 'desc'),
          limit(limit_count)
        );
        
        const sessionsSnap = await getDocs(sessionsQuery);
        sessionsSnap.forEach(doc => {
          allSessions.push({
            id: doc.id,
            clienteUid: clientUid,
            ...doc.data()
          } as ClientSession);
        });
      } catch (error) {
        console.error(`Error getting sessions for client ${clientUid}:`, error);
      }
    }

    // Ordenar por fecha descendente
    return allSessions.sort((a, b) => b.fecha.seconds - a.fecha.seconds);
  } catch (error) {
    console.error('Error getting specialist sessions:', error);
    throw error;
  }
};

// Agregar cliente al especialista
export const addClientToSpecialist = async (specialistUid: string, clientUid: string): Promise<void> => {
  try {
    const specialistRef = doc(db, 'usuarios_especialistas', specialistUid);
    const specialistSnap = await getDoc(specialistRef);
    
    if (specialistSnap.exists()) {
      const currentClients = specialistSnap.data().clientes || [];
      if (!currentClients.includes(clientUid)) {
        await updateDoc(specialistRef, {
          clientes: [...currentClients, clientUid]
        });
      }
    }
  } catch (error) {
    console.error('Error adding client to specialist:', error);
    throw error;
  }
};

// Remover cliente del especialista
export const removeClientFromSpecialist = async (specialistUid: string, clientUid: string): Promise<void> => {
  try {
    const specialistRef = doc(db, 'usuarios_especialistas', specialistUid);
    const specialistSnap = await getDoc(specialistRef);
    
    if (specialistSnap.exists()) {
      const currentClients = specialistSnap.data().clientes || [];
      const updatedClients = currentClients.filter((id: string) => id !== clientUid);
      await updateDoc(specialistRef, {
        clientes: updatedClients
      });
    }
  } catch (error) {
    console.error('Error removing client from specialist:', error);
    throw error;
  }
};

// Obtener métricas del especialista
export const getSpecialistMetrics = async (specialistUid: string) => {
  try {
    const specialistData = await getSpecialistData(specialistUid);
    const clients = await getSpecialistClients(specialistUid);
    const sessions = await getSpecialistSessions(specialistUid, 100); // Obtener más sesiones para métricas

    return {
      totalClientes: clients.length,
      clientesActivos: clients.filter(c => c.estado === 'activo').length,
      totalSesiones: sessions.length,
      tarifaPromedio: specialistData?.tarifa || 0,
      ultimaSesion: sessions.length > 0 ? sessions[0].fecha : null,
      horarioActivo: specialistData?.horario || null,
      diasDisponibles: specialistData?.diasDisponibles || [],
      plataforma: specialistData?.plataforma || 'No configurada'
    };
  } catch (error) {
    console.error('Error getting specialist metrics:', error);
    throw error;
  }
};
