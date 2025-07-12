import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { User } from 'firebase/auth';

export interface UserRole {
  isAdmin: boolean;
  isEspecialista: boolean;
  isRegularUser: boolean;
}

// Lista de UIDs de administradores (REEMPLAZA CON TU UID REAL)
const ADMIN_UIDS = ['afWkPmGLEIMUL4SAUHXf0ryPUJ02'];

/**
 * Obtiene los roles de un usuario
 */
export const getUserRole = async (firebaseUser: User | null): Promise<UserRole> => {
  if (!firebaseUser) {
    return {
      isAdmin: false,
      isEspecialista: false,
      isRegularUser: false
    };
  }

  const userId = firebaseUser.uid;
  
  try {
    // Verificar si es admin
    const isAdmin = ADMIN_UIDS.includes(userId) || await checkAdminCollection(userId);
    
    // Verificar si es especialista
    const isEspecialista = await checkEspecialistaCollection(userId);
    
    return {
      isAdmin,
      isEspecialista,
      isRegularUser: !isAdmin && !isEspecialista
    };
  } catch (error) {
    console.error('Error checking user role:', error);
    return {
      isAdmin: false,
      isEspecialista: false,
      isRegularUser: true
    };
  }
};

/**
 * Verifica si el usuario existe en la colección admin_users
 */
const checkAdminCollection = async (userId: string): Promise<boolean> => {
  try {
    const adminDoc = await getDoc(doc(db, 'admin_users', userId));
    return adminDoc.exists();
  } catch (error) {
    console.error('Error checking admin collection:', error);
    return false;
  }
};

/**
 * Verifica si el usuario existe en la colección usuarios_especialistas
 */
const checkEspecialistaCollection = async (userId: string): Promise<boolean> => {
  try {
    const especialistaDoc = await getDoc(doc(db, 'usuarios_especialistas', userId));
    return especialistaDoc.exists();
  } catch (error) {
    console.error('Error checking especialista collection:', error);
    return false;
  }
};

/**
 * Hook personalizado para obtener roles de usuario
 */
import { useState, useEffect } from 'react';

export const useUserRole = (firebaseUser: User | null) => {
  const [userRole, setUserRole] = useState<UserRole>({
    isAdmin: false,
    isEspecialista: false,
    isRegularUser: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      setLoading(true);
      const role = await getUserRole(firebaseUser);
      setUserRole(role);
      setLoading(false);
    };

    fetchUserRole();
  }, [firebaseUser?.uid]);

  return { userRole, loading };
};
