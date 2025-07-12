import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Especialista, TipoSesion } from '../types/consultas';

export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: Date;
  lastLogin?: Date;
  isEspecialista?: boolean;
  especialistaData?: Especialista;
}

export interface AsignarEspecialistaData {
  tipo: TipoSesion;
  nombre: string;
  apellido: string;
  displayId: string;
  tarifa: number;
  diasDisponibles: string[];
  horario: { [dia: string]: string[] };
  especialidades: string[];
  experiencia: string;
  biografia?: string;
  certificaciones?: string[];
  idiomas?: string[];
}

/**
 * Obtiene todos los usuarios registrados de la colección 'users'
 */
export const getAllUsers = async (): Promise<UserData[]> => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(usersQuery);
    const users: UserData[] = [];
    
    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      // Verificar si ya es especialista
      const especialistaDoc = await getDoc(doc(db, 'usuarios_especialistas', userId));
      const isEspecialista = especialistaDoc.exists();
      
      users.push({
        uid: userId,
        email: userData.email || '',
        displayName: userData.displayName || userData.nombre || 'Sin nombre',
        photoURL: userData.photoURL,
        createdAt: userData.createdAt?.toDate?.() || new Date(),
        lastLogin: userData.lastLogin?.toDate?.(),
        isEspecialista,
        especialistaData: isEspecialista ? especialistaDoc.data() as Especialista : undefined
      });
    }
    
    return users;
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    throw new Error('No se pudieron cargar los usuarios');
  }
};

/**
 * Verifica si un usuario existe en la colección users
 */
export const verifyUserExists = async (uid: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists();
  } catch (error) {
    console.error('Error verificando usuario:', error);
    return false;
  }
};

/**
 * Genera un Display ID único estilo Discord
 */
export const generateUniqueDisplayId = async (nombre: string): Promise<string> => {
  const cleanName = nombre.replace(/\s+/g, '').toLowerCase();
  const capitalizedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const hash = Math.floor(Math.random() * 9000 + 1000);
    const displayId = `${capitalizedName}#${hash}`;
    
    // Verificar que no exista ya
    const existingQuery = query(
      collection(db, 'usuarios_especialistas'),
    );
    const snapshot = await getDocs(existingQuery);
    
    const exists = snapshot.docs.some(doc => doc.data().displayId === displayId);
    
    if (!exists) {
      return displayId;
    }
    
    attempts++;
  }
  
  // Fallback con timestamp si no se encuentra uno único
  const timestamp = Date.now().toString().slice(-4);
  return `${capitalizedName}#${timestamp}`;
};

/**
 * Asigna el rol de especialista a un usuario
 */
export const asignarEspecialista = async (
  uid: string, 
  datos: AsignarEspecialistaData
): Promise<{ success: boolean; message: string; displayId?: string }> => {
  try {
    // Verificar que el usuario existe
    const userExists = await verifyUserExists(uid);
    if (!userExists) {
      throw new Error('El usuario no existe en el sistema');
    }
    
    // Verificar que no sea ya especialista
    const existingEspecialista = await getDoc(doc(db, 'usuarios_especialistas', uid));
    if (existingEspecialista.exists()) {
      throw new Error('El usuario ya es especialista');
    }
    
    // Generar Display ID único si no se proporcionó uno personalizado
    let finalDisplayId = datos.displayId;
    if (!finalDisplayId || finalDisplayId.trim() === '') {
      finalDisplayId = await generateUniqueDisplayId(datos.nombre);
    }
    
    // Validar formato del Display ID personalizado
    if (finalDisplayId && !finalDisplayId.match(/^[A-Za-z]+#\d{4}$/)) {
      throw new Error('El Display ID debe tener el formato: Nombre#1234');
    }
    
    // Crear el documento del especialista
    const especialistaData: Especialista = {
      uid,
      displayId: finalDisplayId,
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: '', // Se obtendrá del documento user si es necesario
      tipo: datos.tipo,
      diasDisponibles: datos.diasDisponibles,
      horario: datos.horario,
      tarifa: datos.tarifa,
      experiencia: datos.experiencia,
      especialidades: datos.especialidades,
      biografia: datos.biografia,
      certificaciones: datos.certificaciones || [],
      idiomas: datos.idiomas || ['español'],
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Obtener email del usuario
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      especialistaData.email = userDoc.data().email || '';
    }
    
    // Guardar en Firestore
    await setDoc(doc(db, 'usuarios_especialistas', uid), especialistaData);
    
    // Actualizar el documento del usuario para marcar que es especialista
    await updateDoc(doc(db, 'users', uid), {
      isEspecialista: true,
      especialistaRole: datos.tipo,
      updatedAt: Timestamp.now()
    });
    
    return {
      success: true,
      message: `Usuario asignado como ${datos.tipo} exitosamente`,
      displayId: finalDisplayId
    };
    
  } catch (error) {
    console.error('Error asignando especialista:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido al asignar especialista'
    };
  }
};

/**
 * Remueve el rol de especialista de un usuario
 */
export const removerEspecialista = async (uid: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Verificar que es especialista
    const especialistaDoc = await getDoc(doc(db, 'usuarios_especialistas', uid));
    if (!especialistaDoc.exists()) {
      throw new Error('El usuario no es especialista');
    }
    
    // Remover documento de especialista (soft delete - marcar como inactivo)
    await updateDoc(doc(db, 'usuarios_especialistas', uid), {
      activo: false,
      removedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Actualizar documento del usuario
    await updateDoc(doc(db, 'users', uid), {
      isEspecialista: false,
      especialistaRole: null,
      updatedAt: Timestamp.now()
    });
    
    return {
      success: true,
      message: 'Rol de especialista removido exitosamente'
    };
    
  } catch (error) {
    console.error('Error removiendo especialista:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido al remover especialista'
    };
  }
};

/**
 * Busca usuarios por email o nombre
 */
export const searchUsers = async (searchTerm: string): Promise<UserData[]> => {
  try {
    const allUsers = await getAllUsers();
    const lowercaseSearch = searchTerm.toLowerCase();
    
    return allUsers.filter(user => 
      user.email.toLowerCase().includes(lowercaseSearch) ||
      (user.displayName || '').toLowerCase().includes(lowercaseSearch)
    );
  } catch (error) {
    console.error('Error buscando usuarios:', error);
    return [];
  }
};
