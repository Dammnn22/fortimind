import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../src/firebase';
import { useLocalization } from '../hooks/useLocalization';
import { TrendingUp, Target, Calendar, Zap, BookOpen, MessageSquare, Brain, Award, Clock, Users, BarChart3, Star } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface SimpleDashboardProps {
  isGuest: boolean;
  firebaseUser: User | null;
}

interface UserStats {
  totalXP: number;
  level: number;
  streaks: number;
  completedChallenges: number;
  totalSessions: number;
  weeklyGoals: number;
  monthlyGoals: number;
}

const SimpleDashboard: React.FC<SimpleDashboardProps> = ({ isGuest, firebaseUser }) => {
  const { t } = useLocalization();
  const [userStats, setUserStats] = useState<UserStats>({
    totalXP: 0,
    level: 1,
    streaks: 0,
    completedChallenges: 0,
    totalSessions: 0,
    weeklyGoals: 0,
    monthlyGoals: 0
  });
  const [loading, setLoading] = useState(true);
  const [dailyQuote, setDailyQuote] = useState('');

  useEffect(() => {
    if (firebaseUser && !isGuest) {
      loadUserData();
    } else {
      loadGuestData();
    }
    generateDailyQuote();
  }, [firebaseUser, isGuest]);

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser!.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserStats(userData.stats || {
          totalXP: 0,
          level: 1,
          streaks: 0,
          completedChallenges: 0,
          totalSessions: 0,
          weeklyGoals: 0,
          monthlyGoals: 0
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGuestData = () => {
    const guestStats = localStorage.getItem('guestStats');
    if (guestStats) {
      setUserStats(JSON.parse(guestStats));
    }
    setLoading(false);
  };

  const generateDailyQuote = () => {
    const quotes = [
      "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
      "Tu única limitación eres tú mismo.",
      "El progreso, no la perfección.",
      "Cada día es una nueva oportunidad para crecer.",
      "La constancia vence lo que la dicha no alcanza.",
      "Eres más fuerte de lo que piensas.",
      "El cambio comienza con una decisión.",
      "Tu bienestar mental es una prioridad, no un lujo."
    ];
    const today = new Date().getDate();
    setDailyQuote(quotes[today % quotes.length]);
  };

  const addXP = (points: number) => {
    if (isGuest) {
      const newStats = { ...userStats, totalXP: userStats.totalXP + points };
      setUserStats(newStats);
      localStorage.setItem('guestStats', JSON.stringify(newStats));
    }
  };

  const quickActions = [
    { icon: <Target className="w-6 h-6" />, title: "Establecer Objetivo", action: () => addXP(10) },
    { icon: <Calendar className="w-6 h-6" />, title: "Registrar Hábito", action: () => addXP(5) },
    { icon: <Brain className="w-6 h-6" />, title: "Sesión de Enfoque", action: () => addXP(15) },
    { icon: <BookOpen className="w-6 h-6" />, title: "Leer Contenido", action: () => addXP(8) }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-8">
        
        {/* Header de bienvenida */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            ¡Bienvenido a FortiMind!
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            {isGuest ? 'Modo Invitado - Explora las funcionalidades' : `Bienvenido de vuelta, ${firebaseUser?.displayName || firebaseUser?.email || 'Usuario'}`}
          </p>
          
          {/* Frase del día */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg max-w-2xl mx-auto">
            <p className="text-lg font-medium italic">"{dailyQuote}"</p>
          </div>
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-yellow-400 mr-3" />
              <div>
                <p className="text-2xl font-bold">{userStats.totalXP}</p>
                <p className="text-gray-400 text-sm">XP Total</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-purple-400 mr-3" />
              <div>
                <p className="text-2xl font-bold">{userStats.level}</p>
                <p className="text-gray-400 text-sm">Nivel</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-400 mr-3" />
              <div>
                <p className="text-2xl font-bold">{userStats.streaks}</p>
                <p className="text-gray-400 text-sm">Racha Actual</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-orange-400 mr-3" />
              <div>
                <p className="text-2xl font-bold">{userStats.completedChallenges}</p>
                <p className="text-gray-400 text-sm">Retos Completados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg border border-gray-700 transition-colors duration-200 flex items-center space-x-3"
              >
                <div className="text-blue-400">{action.icon}</div>
                <span className="text-sm font-medium">{action.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Módulos principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors duration-200">
            <BarChart3 className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-xl font-semibold mb-2">📊 Dashboard</h3>
            <p className="text-gray-400 mb-4">Tu centro de control personal con métricas y análisis</p>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition-colors">
              Ver Estadísticas
            </button>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-green-500 transition-colors duration-200">
            <Target className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-xl font-semibold mb-2">🎯 Objetivos</h3>
            <p className="text-gray-400 mb-4">Establece y alcanza tus metas con seguimiento inteligente</p>
            <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-medium transition-colors">
              Crear Objetivo
            </button>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-orange-500 transition-colors duration-200">
            <TrendingUp className="w-8 h-8 text-orange-400 mb-3" />
            <h3 className="text-xl font-semibold mb-2">🔥 Rachas</h3>
            <p className="text-gray-400 mb-4">Mantén tu progreso constante y construye hábitos</p>
            <button className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-sm font-medium transition-colors">
              Ver Rachas
            </button>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors duration-200">
            <Users className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-xl font-semibold mb-2">💬 Consultas 1:1</h3>
            <p className="text-gray-400 mb-4">Sesiones personalizadas con profesionales certificados</p>
            <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm font-medium transition-colors">
              Agendar Sesión
            </button>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-500 transition-colors duration-200">
            <Brain className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-xl font-semibold mb-2">🤖 IA Mentor</h3>
            <p className="text-gray-400 mb-4">Tu asistente personal inteligente disponible 24/7</p>
            <button className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded text-sm font-medium transition-colors">
              Chatear con IA
            </button>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-indigo-500 transition-colors duration-200">
            <BookOpen className="w-8 h-8 text-indigo-400 mb-3" />
            <h3 className="text-xl font-semibold mb-2">📝 Diario Inteligente</h3>
            <p className="text-gray-400 mb-4">Reflexiona y analiza tu progreso con IA</p>
            <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-sm font-medium transition-colors">
              Escribir Entrada
            </button>
          </div>
        </div>

        {/* Progreso semanal */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Progreso Semanal</h2>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="grid grid-cols-7 gap-2">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm text-gray-400 mb-2">{day}</p>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index < 4 ? 'bg-green-600' : 'bg-gray-700'
                  }`}>
                    {index < 4 ? '✓' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SimpleDashboard;
