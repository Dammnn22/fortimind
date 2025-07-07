import React, { useState, useEffect } from 'react';
import { Users, Activity, Dumbbell, Apple, Brain, TrendingUp, Calendar, Zap, Shield, Clock } from 'lucide-react';
import { AdminDashboardService, AdminMetrics } from '../services/adminDashboardService';

import React, { useState, useEffect } from 'react';
import { Users, Activity, Dumbbell, Apple, Brain, TrendingUp, Calendar } from 'lucide-react';
import { AdminDashboardService, AdminMetrics } from '../services/adminDashboardService';

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardMetrics();
  }, []);

  const loadDashboardMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await AdminDashboardService.getComprehensiveMetrics();
      setMetrics(data);
      
    } catch (err) {
      console.error('Error loading dashboard metrics:', err);
      setError('Error cargando métricas del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando métricas del dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={loadDashboardMetrics}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
                <p className="text-gray-600">Métricas y estadísticas de FortiMind</p>
              </div>
              <button
                onClick={loadDashboardMetrics}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Métricas de Usuarios */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Métricas de Usuarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total de Usuarios"
              value={metrics.userMetrics.totalUsers.toLocaleString()}
              icon={<Users className="w-6 h-6 text-white" />}
              color="bg-blue-500"
            />
            <MetricCard
              title="Usuarios Activos"
              value={metrics.userMetrics.activeUsers.toLocaleString()}
              icon={<Activity className="w-6 h-6 text-white" />}
              color="bg-green-500"
              subtitle="Últimas 24 horas"
            />
            <MetricCard
              title="Nuevos Usuarios"
              value={metrics.userMetrics.newUsersThisWeek.toLocaleString()}
              icon={<TrendingUp className="w-6 h-6 text-white" />}
              color="bg-purple-500"
              subtitle="Esta semana"
            />
            <MetricCard
              title="Usuarios Premium"
              value={metrics.userMetrics.premiumUsers.toLocaleString()}
              icon={<Users className="w-6 h-6 text-white" />}
              color="bg-yellow-500"
            />
          </div>
        </div>

        {/* Métricas de Contenido */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contenido Generado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Programas de Ejercicio"
              value={metrics.contentMetrics.exercisePrograms.toLocaleString()}
              icon={<Dumbbell className="w-6 h-6 text-white" />}
              color="bg-red-500"
            />
            <MetricCard
              title="Retos Nutricionales"
              value={metrics.contentMetrics.nutritionChallenges.toLocaleString()}
              icon={<Apple className="w-6 h-6 text-white" />}
              color="bg-orange-500"
            />
            <MetricCard
              title="Días Generados"
              value={metrics.contentMetrics.totalDaysGenerated.toLocaleString()}
              icon={<Calendar className="w-6 h-6 text-white" />}
              color="bg-indigo-500"
            />
            <MetricCard
              title="Duración Promedio"
              value={`${metrics.contentMetrics.averageProgramLength} días`}
              icon={<TrendingUp className="w-6 h-6 text-white" />}
              color="bg-teal-500"
            />
          </div>
        </div>

        {/* Métricas de IA */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Uso de Inteligencia Artificial</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Solicitudes IA"
              value={metrics.aiMetrics.totalAIRequests.toLocaleString()}
              icon={<Brain className="w-6 h-6 text-white" />}
              color="bg-purple-600"
            />
            <MetricCard
              title="Últimos 7 días"
              value={metrics.aiMetrics.aiRequestsLast7Days.toLocaleString()}
              icon={<Calendar className="w-6 h-6 text-white" />}
              color="bg-blue-600"
            />
            <MetricCard
              title="Últimas 24 horas"
              value={metrics.aiMetrics.aiRequestsLast24Hours.toLocaleString()}
              icon={<Activity className="w-6 h-6 text-white" />}
              color="bg-green-600"
            />
            <MetricCard
              title="Promedio por Usuario"
              value={metrics.aiMetrics.averageAIUsagePerUser.toLocaleString()}
              icon={<TrendingUp className="w-6 h-6 text-white" />}
              color="bg-pink-600"
            />
          </div>
        </div>

        {/* Top 5 usuarios más activos */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Top 5 Usuarios Más Activos (30 días)
            </h3>
          </div>
          <div className="p-6">
            {metrics.activityMetrics.topActiveUsers.length > 0 ? (
              <div className="space-y-4">
                {metrics.activityMetrics.topActiveUsers.map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.email || `Usuario ${user.userId.slice(0, 8)}...`}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {user.userId.slice(0, 12)}...
                        </p>
                        <p className="text-xs text-gray-400">
                          Funciones favoritas: {user.favoriteFeatures.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{user.activityCount} actividades</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {user.lastActive.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay datos de actividad disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Funciones más populares */}
        <div className="mt-8 bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Funciones Más Populares</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.activityMetrics.popularFeatures.map((feature, index) => (
                <div key={feature.feature} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-gray-900">{feature.feature}</p>
                    <p className="text-sm text-gray-500">{feature.uniqueUsers} usuarios únicos</p>
                  </div>
                  <p className="font-bold text-gray-900">{feature.usageCount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Información del Dashboard</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Los datos se actualizan en tiempo real desde Firestore</p>
            <p>• Los usuarios activos se basan en actividad de los últimos 30 días</p>
            <p>• El uso de IA incluye: chat IA, creación de programas, retos nutricionales y consejos</p>
            <p>• Última actualización: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
