import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Settings, BarChart3, UserCheck, Database } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-400">
            Gestiona todos los aspectos de FortiMind
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/gestion-especialistas"
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <UserCheck className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold">Gestión de Especialistas</h3>
                <p className="text-sm text-gray-400">Administrar y aprobar especialistas</p>
              </div>
            </div>
          </Link>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold">Gestión de Usuarios</h3>
                <p className="text-sm text-gray-400">Administrar usuarios del sistema</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8 text-purple-500" />
              <div>
                <h3 className="text-lg font-semibold">Configuración</h3>
                <p className="text-sm text-gray-400">Ajustes del sistema</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-orange-500" />
              <div>
                <h3 className="text-lg font-semibold">Estadísticas</h3>
                <p className="text-sm text-gray-400">Métricas y reportes</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold">Base de Datos</h3>
                <p className="text-sm text-gray-400">Gestión de datos</p>
              </div>
            </div>
          </div>

          <Link
            to="/"
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-8 h-8 text-indigo-500" />
              <div>
                <h3 className="text-lg font-semibold">Volver al Dashboard</h3>
                <p className="text-sm text-gray-400">Regresar al panel principal</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Usuarios Activos</p>
                <p className="text-2xl font-bold text-green-400">1,234</p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Especialistas</p>
                <p className="text-2xl font-bold text-blue-400">56</p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pendientes</p>
                <p className="text-2xl font-bold text-orange-400">12</p>
              </div>
              <Settings className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Sistema</p>
                <p className="text-2xl font-bold text-purple-400">OK</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Estado del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Firebase conectado</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Firestore funcionando</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Autenticación activa</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Gestión de especialistas disponible</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
