import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { addClientToSpecialist, removeClientFromSpecialist } from '../services/specialistService';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import GlassNotification from './GlassNotification';

interface ClientManagementProps {
  specialistUid: string;
  assignedClients: string[];
  onClientsUpdate: () => void;
}

interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

const ClientManagement: React.FC<ClientManagementProps> = ({
  specialistUid,
  assignedClients,
  onClientsUpdate
}) => {
  const { user } = useAuth();
  const [availableUsers, setAvailableUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadAvailableUsers();
  }, []);

  const loadAvailableUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const usersSnap = await getDocs(usersRef);
      
      const users: UserData[] = [];
      usersSnap.forEach(doc => {
        const userData = doc.data();
        // Excluir especialistas y admins de la lista de clientes potenciales
        if (userData.email && !userData.isSpecialist && !userData.isAdmin) {
          users.push({
            uid: doc.id,
            displayName: userData.displayName || userData.email,
            email: userData.email,
            photoURL: userData.photoURL
          });
        }
      });
      
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar usuarios disponibles'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (clientUid: string) => {
    if (!user || user.uid !== specialistUid) {
      setNotification({
        type: 'error',
        message: 'No tienes permisos para realizar esta acción'
      });
      return;
    }

    try {
      await addClientToSpecialist(specialistUid, clientUid);
      setNotification({
        type: 'success',
        message: 'Cliente agregado exitosamente'
      });
      onClientsUpdate();
    } catch (error) {
      console.error('Error adding client:', error);
      setNotification({
        type: 'error',
        message: 'Error al agregar cliente'
      });
    }
  };

  const handleRemoveClient = async (clientUid: string) => {
    if (!user || user.uid !== specialistUid) {
      setNotification({
        type: 'error',
        message: 'No tienes permisos para realizar esta acción'
      });
      return;
    }

    if (confirm('¿Estás seguro de que quieres remover este cliente?')) {
      try {
        await removeClientFromSpecialist(specialistUid, clientUid);
        setNotification({
          type: 'success',
          message: 'Cliente removido exitosamente'
        });
        onClientsUpdate();
      } catch (error) {
        console.error('Error removing client:', error);
        setNotification({
          type: 'error',
          message: 'Error al remover cliente'
        });
      }
    }
  };

  const filteredUsers = availableUsers.filter(user =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unassignedUsers = filteredUsers.filter(user => 
    !assignedClients.includes(user.uid)
  );

  const assignedUsers = filteredUsers.filter(user => 
    assignedClients.includes(user.uid)
  );

  return (
    <div className="space-y-6">
      {notification && (
        <GlassNotification
          title={notification.type === 'success' ? 'Éxito' : 'Error'}
          message={notification.message}
          type={notification.type}
          isVisible={!!notification}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Búsqueda */}
      <GlassCard className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">🔍</span>
          <h3 className="text-lg font-semibold text-white">Buscar Usuarios</h3>
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
        />
      </GlassCard>

      {/* Clientes Asignados */}
      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">👥</span>
          <h3 className="text-lg font-semibold text-white">
            Mis Clientes ({assignedUsers.length})
          </h3>
        </div>
        
        {assignedUsers.length === 0 ? (
          <p className="text-white/70 text-center py-8">
            No tienes clientes asignados aún
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedUsers.map(client => (
              <div key={client.uid} className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  {client.photoURL ? (
                    <img 
                      src={client.photoURL} 
                      alt={client.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white text-sm">👤</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{client.displayName}</h4>
                    <p className="text-white/70 text-sm">{client.email}</p>
                  </div>
                  <GlassButton
                    onClick={() => handleRemoveClient(client.uid)}
                    variant="secondary"
                    size="sm"
                    className="text-red-300 hover:text-red-100"
                  >
                    Remover
                  </GlassButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Usuarios Disponibles */}
      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">➕</span>
          <h3 className="text-lg font-semibold text-white">
            Usuarios Disponibles ({unassignedUsers.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-white/70 mt-2">Cargando usuarios...</p>
          </div>
        ) : unassignedUsers.length === 0 ? (
          <p className="text-white/70 text-center py-8">
            No hay usuarios disponibles para asignar
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unassignedUsers.map(user => (
              <div key={user.uid} className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white text-sm">👤</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{user.displayName}</h4>
                    <p className="text-white/70 text-sm">{user.email}</p>
                  </div>
                  <GlassButton
                    onClick={() => handleAddClient(user.uid)}
                    variant="primary"
                    size="sm"
                  >
                    Asignar
                  </GlassButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default ClientManagement;
