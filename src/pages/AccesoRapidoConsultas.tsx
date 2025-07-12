import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Calendar, 
  Clock, 
  DollarSign, 
  Star, 
  CheckCircle,
  Brain,
  Apple,
  Dumbbell,
  ArrowRight,
  Users,
  Zap
} from 'lucide-react';

const AccesoRapidoConsultas: React.FC = () => {
  const navigate = useNavigate();

  const servicios = [
    {
      tipo: 'psicologo',
      titulo: 'Psicólogo',
      descripcion: 'Apoyo emocional y bienestar mental',
      icon: <Brain className="w-8 h-8" />,
      color: 'from-blue-500 to-purple-600',
      textColor: 'text-blue-600'
    },
    {
      tipo: 'nutricionista',
      titulo: 'Nutricionista',
      descripcion: 'Planes alimentarios personalizados',
      icon: <Apple className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-600',
      textColor: 'text-green-600'
    },
    {
      tipo: 'coach',
      titulo: 'Coach Fitness',
      descripcion: 'Entrenamiento y actividad física',
      icon: <Dumbbell className="w-8 h-8" />,
      color: 'from-orange-500 to-red-600',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4" />
            <span>Nuevo en FortiMind</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Consultas 1:1 con <span className="text-blue-600">Profesionales</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Conecta con psicólogos, nutricionistas y coaches certificados. 
            Recibe asesoría personalizada para alcanzar tus objetivos de bienestar.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">15+</div>
              <div className="text-gray-600">Profesionales certificados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">$15</div>
              <div className="text-gray-600">Desde USD por sesión</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">60min</div>
              <div className="text-gray-600">Duración de cada sesión</div>
            </div>
          </div>

          {/* CTA Principal */}
          <div className="space-y-4">
            <button
              onClick={() => navigate('/consultas')}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all"
            >
              <MessageCircle className="w-6 h-6" />
              <span>Ver Todas las Consultas</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <p className="text-sm text-gray-500">
              ⚡ Pago seguro con PayPal • 🔒 Sesiones confidenciales • 📱 Videollamadas HD
            </p>
          </div>
        </div>

        {/* Servicios disponibles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Elige tu especialista
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {servicios.map((servicio) => (
              <div 
                key={servicio.tipo}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100 hover:border-gray-200 cursor-pointer"
                onClick={() => navigate(`/consultas/reservar?tipo=${servicio.tipo}`)}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${servicio.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {servicio.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{servicio.titulo}</h3>
                <p className="text-gray-600 mb-4">{servicio.descripcion}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`${servicio.textColor} font-semibold`}>Desde $15 USD</span>
                  <ArrowRight className={`w-5 h-5 ${servicio.textColor} group-hover:translate-x-1 transition-transform`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proceso simple */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Proceso simple en 3 pasos
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Elige y reserva</h3>
              <p className="text-gray-600 text-sm">Selecciona tu especialista y fecha preferida</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Paga seguro</h3>
              <p className="text-gray-600 text-sm">Realiza el pago de forma segura con PayPal</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Conéctate</h3>
              <p className="text-gray-600 text-sm">Únete a tu sesión con el enlace de videollamada</p>
            </div>
          </div>
        </div>

        {/* Beneficios */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            ¿Por qué elegir nuestras consultas?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Profesionales certificados</h3>
                <p className="text-blue-100 text-sm">Todos nuestros especialistas cuentan con certificaciones oficiales</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Clock className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Horarios flexibles</h3>
                <p className="text-blue-100 text-sm">Agenda tu cita en el horario que mejor se adapte a ti</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Users className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Atención personalizada</h3>
                <p className="text-blue-100 text-sm">Sesiones individuales adaptadas a tus necesidades específicas</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Zap className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Resultados rápidos</h3>
                <p className="text-blue-100 text-sm">Obtén herramientas y estrategias efectivas desde la primera sesión</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-gray-600 mb-6">
              Tu bienestar es nuestra prioridad. Reserva tu primera consulta hoy mismo.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => navigate('/consultas')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
              >
                Explorar Consultas Disponibles
              </button>
              
              <div className="flex justify-center space-x-6 text-sm text-gray-500">
                <span>✓ Sin compromisos</span>
                <span>✓ Pago por sesión</span>
                <span>✓ Cancelación flexible</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccesoRapidoConsultas;
