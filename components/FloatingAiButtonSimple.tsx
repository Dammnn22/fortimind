import React, { useState } from 'react';
import { Bot } from 'lucide-react'; 
import type { User } from 'firebase/auth';

interface FloatingAiButtonProps {
  firebaseUser: User | null | undefined; 
  offset?: string;
}

const FloatingAiButton: React.FC<FloatingAiButtonProps> = ({ firebaseUser, offset }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Only render the button if the user is logged in
  if (!firebaseUser) {
    return null;
  }

  return (
    <>
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-110 z-40 ${offset ? offset : ''}`}
        aria-label="Chat AI"
      >
        <Bot size={24} />
      </button>
      
      {isChatOpen && (
        <div className="fixed bottom-20 right-6 bg-gray-800 rounded-lg shadow-xl p-4 w-80 z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold">AI Chat</h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="text-white">
            <p className="text-sm text-gray-300">
              ¡Hola! Soy tu asistente de FortiMind. ¿En qué puedo ayudarte hoy?
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAiButton;
