import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Apple, Dumbbell, Calendar, DollarSign } from 'lucide-react';

const opciones = [
  {
    tipo: 'psicologo',
    titulo: 'Psicólogo / Apoyo Emocional',
    descripcion: 'Sesión individual con un psicólogo profesional.',
    icon: <Brain className="w-8 h-8" />,
    precio: '$15 USD',
    color: 'bg-blue-500',
  },
  {
    tipo: 'nutricionista',
    titulo: 'Nutricionista',
    descripcion: 'Asesoría personalizada en nutrición.',
    icon: <Apple className="w-8 h-8" />,
    precio: '$15 USD',
    color: 'bg-green-500',
  },
  {
    tipo: 'coach',
    titulo: 'Coach Fitness',
    descripcion: 'Entrenamiento personalizado.',
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
        <h1 className="text-3xl font-bold mb-4">Consultas 1:1 con Profesionales</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Reserva una sesión individual con nuestros profesionales certificados.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {opciones.map((opcion) => (
          <div key={opcion.tipo} className="bg-white rounded-lg shadow-lg p-6">
            <div className={`${opcion.color} rounded-full p-3 w-fit mx-auto mb-4`}>
              <div className="text-white">{opcion.icon}</div>
            </div>
            
            <h2 className="text-xl font-semibold mb-3 text-center">{opcion.titulo}</h2>
            <p className="text-gray-600 mb-4 text-center">{opcion.descripcion}</p>
            
            <div className="flex items-center justify-center mb-4">
              <DollarSign className="w-5 h-5 text-green-500 mr-1" />
              <span className="text-lg font-bold text-green-600">{opcion.precio}</span>
            </div>
            
            <button
              onClick={() => navigate(`/consultas/reservar?tipo=${opcion.tipo}`)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Reservar Sesión</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}