import React from 'react';

const SimpleSettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">⚙️ Configuración</h1>
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Ajustes Personales</h2>
          <p className="text-gray-300">
            Personaliza tu experiencia con configuraciones de tema, idioma y notificaciones.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleSettingsPage;
