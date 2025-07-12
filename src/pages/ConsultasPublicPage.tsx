import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Calendar, 
  Clock, 
  CheckCircle,
  Brain,
  Apple,
  Dumbbell,
  ArrowRight,
  Zap,
  UserPlus,
  LogIn
} from 'lucide-react';

const ConsultasPublicPage: React.FC = () => {
  const navigate = useNavigate();

  const servicios = [
    {
      tipo: 'psicologo',
      titulo: 'Psicólogo',
      descripcion: 'Apoyo emocional y bienestar mental',
      icon: <Brain className="w-8 h-8" />,
      color: 'from-blue-500 to-purple-600',
      textColor: 'text-blue-600',
      precio: '$25 USD'
    },
    {
      tipo: 'nutricionista',
      titulo: 'Nutricionista',
      descripcion: 'Planes alimentarios personalizados',
      icon: <Apple className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-600',
      textColor: 'text-green-600',
      precio: '$20 USD'
    },
    {
      tipo: 'coach',
      titulo: 'Coach Fitness',
      descripcion: 'Entrenamiento y actividad física',
      icon: <Dumbbell className="w-8 h-8" />,
      color: 'from-orange-500 to-red-600',
      textColor: 'text-orange-600',
      precio: '$15 USD'
    }
  ];

  const beneficios = [
    {
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      titulo: 'Profesionales Certificados',
      descripcion: 'Todos nuestros especialistas están acreditados y con experiencia comprobada.'
    },
    {
      icon: <Calendar className="w-6 h-6 text-blue-500" />,
      titulo: 'Horarios Flexibles',
      descripcion: 'Agenda tu consulta cuando mejor te convenga, 7 días de la semana.'
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-500" />,
      titulo: 'Sesiones de 50 minutos',
      descripcion: 'Tiempo completo para abordar tus inquietudes con la atención que mereces.'
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      titulo: 'Resultados Rápidos',
      descripcion: 'Obtén estrategias y herramientas prácticas desde la primera sesión.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header con navegación */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">FortiMind</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <LogIn size={18} />
                <span>Iniciar Sesión</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus size={18} />
                <span>Registrarse</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-100 rounded-full">
              <MessageCircle className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Consultas 1:1 con
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}Profesionales
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Recibe asesoría personalizada de psicólogos, nutricionistas y coaches certificados. 
            Tu bienestar mental y físico en manos expertas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold"
            >
              <Calendar size={20} />
              <span>Reservar Consulta Ahora</span>
              <ArrowRight size={16} />
            </button>
            
            <div className="flex items-center space-x-2 text-green-600 text-sm">
              <CheckCircle size={16} />
              <span>Primera consulta desde $15 USD</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Consultas realizadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">4.9⭐</div>
              <div className="text-gray-600">Calificación promedio</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600">Profesionales certificados</div>
            </div>
          </div>
        </div>

        {/* Servicios */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Nuestros Servicios Especializados
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {servicios.map((servicio, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className={`h-2 bg-gradient-to-r ${servicio.color}`}></div>
                
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${servicio.color} text-white`}>
                      {servicio.icon}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{servicio.precio}</div>
                      <div className="text-sm text-gray-500">por sesión</div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {servicio.titulo}
                  </h3>
                  
                  <p className="text-gray-600 mb-6">
                    {servicio.descripcion}
                  </p>
                  
                  <button
                    onClick={() => navigate('/login')}
                    className={`w-full flex items-center justify-center space-x-2 px-6 py-3 border-2 border-current rounded-lg font-semibold transition-all group-hover:bg-current group-hover:text-white ${servicio.textColor}`}
                  >
                    <span>Reservar Cita</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Beneficios */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ¿Por qué elegir FortiMind?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {beneficios.map((beneficio, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {beneficio.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {beneficio.titulo}
                    </h3>
                    <p className="text-gray-600">
                      {beneficio.descripcion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para comenzar tu transformación?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de personas que ya están mejorando su bienestar con FortiMind
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold flex items-center justify-center space-x-2"
            >
              <UserPlus size={20} />
              <span>Crear Cuenta Gratis</span>
            </button>
            
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold flex items-center justify-center space-x-2"
            >
              <Calendar size={20} />
              <span>Reservar Primera Consulta</span>
            </button>
          </div>
          
          <p className="text-sm mt-6 opacity-75">
            * No se requiere tarjeta de crédito para crear tu cuenta
          </p>
        </section>
      </div>
    </div>
  );
};

export default ConsultasPublicPage;
