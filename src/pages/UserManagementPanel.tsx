import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserCheck, 
  Stethoscope, 
  Mail, 
  Calendar,
  Shield,
  UserX,
  RefreshCw,
  Filter
} from 'lucide-react';
import { UserData, getAllUsers, searchUsers, removerEspecialista } from '../services/userManagementService';
import AsignarEspecialistaModal from '../components/AsignarEspecialistaModal';
import LoadingSpinner from '../../components/LoadingSpinner';

const UserManagementPanel: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'specialists' | 'regular'>('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const userData = await getAllUsers();
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Aplicar filtro de tipo
    if (filterType === 'specialists') {
      filtered = filtered.filter(user => user.isEspecialista);
    } else if (filterType === 'regular') {
      filtered = filtered.filter(user => !user.isEspecialista);
    }

    // Aplicar búsqueda
    if (searchTerm.trim()) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(lowercaseSearch) ||
        (user.displayName || '').toLowerCase().includes(lowercaseSearch) ||
        (user.especialistaData?.displayId || '').toLowerCase().includes(lowercaseSearch)
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterType]);

  const handleAsignarEspecialista = (user: UserData) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleRemoverEspecialista = async (user: UserData) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres remover el rol de especialista de ${user.displayName}?`
    );

    if (confirmed) {
      try {
        const result = await removerEspecialista(user.uid);
        if (result.success) {
          alert('✅ Rol de especialista removido exitosamente');
          loadUsers(); // Recargar lista
        } else {
          alert(`❌ Error: ${result.message}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('❌ Error inesperado al remover especialista');
      }
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'No disponible';
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getSpecialistBadge = (user: UserData) => {
    if (!user.isEspecialista || !user.especialistaData) return null;
    
    const typeColors = {
      psicologo: 'bg-blue-100 text-blue-800 border-blue-200',
      nutricionista: 'bg-green-100 text-green-800 border-green-200',
      coach: 'bg-purple-100 text-purple-800 border-purple-200'
    };

    const typeLabels = {
      psicologo: 'Psicólogo',
      nutricionista: 'Nutricionista',
      coach: 'Coach'
    };

    return (
      <div className="flex flex-col space-y-1">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${typeColors[user.especialistaData.tipo]}`}>
          <Stethoscope size={12} className="mr-1" />
          {typeLabels[user.especialistaData.tipo]}
        </span>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {user.especialistaData.displayId}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="text-blue-600" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administra roles y permisos de usuarios
            </p>
          </div>
        </div>
        <button
          onClick={loadUsers}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw size={16} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-3">
            <Users className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-3">
            <Stethoscope className="text-green-600" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Especialistas</p>
              <p className="text-2xl font-bold">
                {users.filter(u => u.isEspecialista).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-3">
            <UserCheck className="text-purple-600" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Usuarios Regulares</p>
              <p className="text-2xl font-bold">
                {users.filter(u => !u.isEspecialista).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por email, nombre o Display ID..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          {/* Filtro */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'specialists' | 'regular')}
              className="pl-10 pr-8 py-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white min-w-[200px]"
            >
              <option value="all">Todos los usuarios</option>
              <option value="specialists">Solo especialistas</option>
              <option value="regular">Solo usuarios regulares</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Usuarios */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rol/Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Último Acceso
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {filteredUsers.map(user => (
                <tr key={user.uid} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <Users size={20} />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.displayName || 'Sin nombre'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <Mail size={12} className="mr-1" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isEspecialista ? (
                      getSpecialistBadge(user)
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 dark:bg-slate-600 dark:text-gray-200 dark:border-slate-500">
                        <UserCheck size={12} className="mr-1" />
                        Usuario Regular
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar size={12} className="mr-1" />
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(user.lastLogin)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {user.isEspecialista ? (
                        <button
                          onClick={() => handleRemoverEspecialista(user)}
                          className="flex items-center space-x-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                        >
                          <UserX size={14} />
                          <span>Remover Rol</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAsignarEspecialista(user)}
                          className="flex items-center space-x-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                        >
                          <Stethoscope size={14} />
                          <span>Hacer Especialista</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {searchTerm || filterType !== 'all' 
                ? 'No se encontraron usuarios con los filtros aplicados'
                : 'No hay usuarios registrados'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal para Asignar Especialista */}
      {selectedUser && (
        <AsignarEspecialistaModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          userId={selectedUser.uid}
          userName={selectedUser.displayName || 'Usuario'}
          userEmail={selectedUser.email}
          onSuccess={() => {
            loadUsers(); // Recargar lista después del éxito
          }}
        />
      )}
    </div>
  );
};

export default UserManagementPanel;
