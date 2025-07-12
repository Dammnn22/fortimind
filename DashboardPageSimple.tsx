import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Target, Zap, Award, BarChart3, UserCheck } from 'lucide-react';
import * as fbAuth from 'firebase/auth';

interface DashboardPageProps {
  addXP: (points: number) => void; 
  isGuest: boolean;
  firebaseUser: fbAuth.User | null | undefined;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ addXP, isGuest, firebaseUser }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            ¡Bienvenido a FortiMind!
          </h1>
          <p className="text-gray-400">
            {isGuest ? 'Modo invitado' : `Hola, ${firebaseUser?.email || 'Usuario'}`}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/admin-dashboard"
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold">Admin Dashboard</h3>
                <p className="text-sm text-gray-400">Gestión administrativa</p>
              </div>
            </div>
          </Link>

          <Link
            to="/gestion-especialistas"
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <UserCheck className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold">Gestión Especialistas</h3>
                <p className="text-sm text-gray-400">Administrar especialistas</p>
              </div>
            </div>
          </Link>

          <Link
            to="/test"
            className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-purple-500" />
              <div>
                <h3 className="text-lg font-semibold">Test</h3>
                <p className="text-sm text-gray-400">Página de pruebas</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Estado</p>
                <p className="text-2xl font-bold text-green-400">Activo</p>
              </div>
              <Zap className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Modo</p>
                <p className="text-2xl font-bold text-blue-400">
                  {isGuest ? 'Invitado' : 'Usuario'}
                </p>
              </div>
              <Award className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Sistema</p>
                <p className="text-2xl font-bold text-purple-400">Funcionando</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">🎉 ¡Bienvenido!</h2>
          <p className="text-gray-300">
            FortiMind está funcionando correctamente. Puedes navegar por las diferentes secciones usando el menú lateral o las tarjetas de arriba.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
              ✅ Sistema funcionando
            </span>
            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
              ✅ Firebase conectado
            </span>
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
              ✅ Componentes cargados
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
