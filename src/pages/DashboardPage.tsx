import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, 
  Activity, 
  TrendingUp, 
  Award, 
  Calendar,
  Clock,
  Star,
  MessageCircle,
  Utensils,
  Dumbbell,
  Settings,
  Zap,
  Trophy,
  ChevronRight
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [greeting, setGreeting] = useState('');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  const stats = [
    { label: 'Racha actual', value: '7', unit: 'días', icon: Award, color: 'from-cyan-400 to-blue-500' },
    { label: 'Objetivos completados', value: '12', unit: '/15', icon: Target, color: 'from-green-400 to-emerald-500' },
    { label: 'Puntos XP', value: '2,430', unit: 'pts', icon: Trophy, color: 'from-yellow-400 to-orange-500' },
    { label: 'Tiempo enfocado', value: '45', unit: 'min', icon: Clock, color: 'from-purple-400 to-pink-500' }
  ];

  const quickActions = [
    { to: '/goals', icon: Target, label: 'Objetivos', desc: 'Define y rastrea tus metas', color: 'cyan' },
    { to: '/habits', icon: Activity, label: 'Hábitos', desc: 'Construye rutinas saludables', color: 'green' },
    { to: '/challenges', icon: Zap, label: 'Desafíos', desc: 'Supera retos diarios', color: 'purple' },
    { to: '/consultas/inicio', icon: MessageCircle, label: 'Consultas', desc: 'Habla con especialistas', color: 'pink', isNew: true },
    { to: '/nutrition-challenge', icon: Utensils, label: 'Nutrición', desc: 'Reto de alimentación', color: 'yellow' },
    { to: '/exercise-challenge', icon: Dumbbell, label: 'Ejercicios', desc: 'Reto de entrenamiento', color: 'orange' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] via-[#161925] to-[#1E2139] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 particle-bg opacity-30"></div>
      
      {/* Glow effects */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse glow-cyan"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000 glow-purple"></div>
      
      {/* Main content */}
      <div className="relative z-10 p-6 pb-32">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent mb-2 tracking-wide">
            {greeting}
          </h1>
          <p className="text-xl text-gray-300 font-medium">
            Continúa con tu transformación
          </p>
          <div className="flex items-center mt-4 text-cyan-400">
            <Calendar size={20} className="mr-2" />
            <span className="font-futuristic">{new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="futuristic-card p-6 text-center">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r ${stat.color} p-3 shadow-lg`}>
                  <Icon className="w-full h-full text-white" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-white">
                    {stat.value}
                    <span className="text-sm text-gray-400 ml-1">{stat.unit}</span>
                  </div>
                  <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Premium Banner */}
        <div className="mb-8">
          <Link to="/subscription" className="block">
            <div className="futuristic-card bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-pink-500/20 border-yellow-400/30 p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,215,0,0.3)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Desbloquea Premium</h3>
                    <p className="text-gray-300">Acceso ilimitado a todas las funciones</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-yellow-400">
                  <span className="font-bold">Activar</span>
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Zap className="mr-3 text-cyan-400" size={28} />
            Acciones Rápidas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const colorClasses = {
                cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-400/30 hover:shadow-[0_0_30px_rgba(0,255,255,0.3)]',
                green: 'from-green-500/20 to-emerald-500/20 border-green-400/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]',
                purple: 'from-purple-500/20 to-pink-500/20 border-purple-400/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]',
                pink: 'from-pink-500/20 to-rose-500/20 border-pink-400/30 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]',
                yellow: 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30 hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]',
                orange: 'from-orange-500/20 to-red-500/20 border-orange-400/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]'
              };
              
              return (
                <Link key={index} to={action.to} className="block">
                  <div className={`futuristic-card ${colorClasses[action.color as keyof typeof colorClasses]} p-6 hover:scale-[1.02] transition-all duration-300 relative group`}>
                    {action.isNew && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-400 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                        NUEVO
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color === 'cyan' ? 'from-cyan-400 to-blue-500' : 
                        action.color === 'green' ? 'from-green-400 to-emerald-500' :
                        action.color === 'purple' ? 'from-purple-400 to-pink-500' :
                        action.color === 'pink' ? 'from-pink-400 to-rose-500' :
                        action.color === 'yellow' ? 'from-yellow-400 to-orange-500' :
                        'from-orange-400 to-red-500'
                      } p-3 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-full h-full text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                          {action.label}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{action.desc}</p>
                      </div>
                      
                      <ChevronRight className="text-gray-500 group-hover:text-white transition-colors" size={20} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="futuristic-card p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <TrendingUp className="mr-3 text-green-400" size={24} />
            Actividad Reciente
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-gray-700/50">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300">Completaste el objetivo "Beber 8 vasos de agua"</span>
              <span className="text-xs text-gray-500 ml-auto">Hace 2 horas</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-gray-700/50">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300">Ganaste 50 XP por mantener tu racha</span>
              <span className="text-xs text-gray-500 ml-auto">Ayer</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-gray-700/50">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300">Nuevo desafío disponible: "30 días de ejercicio"</span>
              <span className="text-xs text-gray-500 ml-auto">Hace 3 días</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
