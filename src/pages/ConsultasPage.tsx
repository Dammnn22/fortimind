import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Brain, Apple, Dumbbell, Calendar, DollarSign } from 'lucide-react';

const opciones = [
  {
    tipo: 'psicologo',
    titulo: 'Psicólogo / Apoyo Emocional',
    descripcion: 'Sesión individual con un psicólogo profesional para apoyo emocional y mental.',
    icon: <Brain className="w-8 h-8" />,
    precio: '$15 USD',
    color: 'bg-blue-500',
  },
  {
    tipo: 'nutricionista',
    titulo: 'Nutricionista',
    descripcion: 'Asesoría personalizada en nutrición y planes alimenticios.',
    icon: <Apple className="w-8 h-8" />,
    precio: '$15 USD',
    color: 'bg-green-500',
  },
  {
    tipo: 'coach',
    titulo: 'Coach Fitness',
    descripcion: 'Entrenamiento personalizado y consejos de fitness profesional.',
    icon: <Dumbbell className="w-8 h-8" />,
    precio: '$15 USD',
    color: 'bg-orange-500',
  },
];

export default function ConsultasPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
          Consultas 1:1 con Profesionales
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Reserva una sesión individual con nuestros profesionales certificados. 
          Paga solo por la sesión que necesites, sin compromisos mensuales.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {opciones.map((opcion) => (
          <div
            key={opcion.tipo}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className={`${opcion.color} rounded-full p-3 w-fit mx-auto mb-4`}>
              <div className="text-white">
                {opcion.icon}
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-3 text-center text-gray-800 dark:text-white">
              {opcion.titulo}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
              {opcion.descripcion}
            </p>
            
            <div className="flex items-center justify-center mb-4">
              <DollarSign className="w-5 h-5 text-green-500 mr-1" />
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {opcion.precio}
              </span>
            </div>
            
            <button
              onClick={() => navigate(`/consultas/reservar?tipo=${opcion.tipo}`)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Reservar Sesión</span>
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
          ¿Cómo funciona?
        </h3>
        <div className="grid md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center">
            <div className="bg-blue-600 rounded-full p-3 mb-2">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              1. Elige tu profesional
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-blue-600 rounded-full p-3 mb-2">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              2. Selecciona fecha y hora
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-blue-600 rounded-full p-3 mb-2">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              3. Paga con PayPal
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-blue-600 rounded-full p-3 mb-2">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              4. Recibe tu enlace de videollamada
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

<>
  <Route path="/consultas" element={<ConsultasPage />} />
  <Route path="/consultas/reservar" element={<ReservaConsultaForm />} />
</>