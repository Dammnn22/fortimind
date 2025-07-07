import React, { useState } from 'react';
import { Bot } from 'lucide-react'; 
import type { User } from 'firebase/auth'; // Firebase User type
import AiChatModal from './AiChatModal';
import { useLocalization } from '../hooks/useLocalization';

interface FloatingAiButtonProps {
  firebaseUser: User | null | undefined; 
  offset?: string; // Nueva prop para margen inferior
}

const FloatingAiButton: React.FC<FloatingAiButtonProps> = ({ firebaseUser, offset }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { t } = useLocalization();

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
        className={`fixed bottom-6 right-6 bg-primary hover:bg-primary-dark text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-110 z-40 ${offset ? offset : ''}`}
        aria-label={t('aiChatTitle')}
        title={t('aiChatTitle')}
      >
        <Bot size={28} />
      </button>
      <AiChatModal isOpen={isChatOpen} onClose={toggleChat} firebaseUser={firebaseUser} />
    </>
  );
};

export default FloatingAiButton;
