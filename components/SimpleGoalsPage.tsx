import React from 'react';

const SimpleGoalsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🎯 Objetivos</h1>
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Metas Personales</h2>
          <p className="text-gray-300">
            Establece objetivos claros y alcanza tus metas paso a paso.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleGoalsPage;
