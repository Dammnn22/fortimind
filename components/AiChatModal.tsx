import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, AlertTriangle, Sparkles, Info, MessageSquareHeart, ShieldAlert } from 'lucide-react';
import type { User } from 'firebase/auth'; // Firebase User type
import Modal from './Modal';
import { useLocalization } from '../hooks/useLocalization';
import { getGeminiAdvice, isGeminiAvailable } from '../services/geminiService';
import { AIPersona, AiChatMessage, TranslationKey } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { saveAiInteractionToFirestore } from '../services/userMemoryService'; // Import the new service
import RequirePremium from './RequirePremium';


const initialChatHistories: Record<AIPersona, AiChatMessage[]> = {
  [AIPersona.AI_MENTOR_DEFAULT]: [],
  [AIPersona.JOURNAL_ANALYST]: [],
  [AIPersona.EMERGENCY_CHAT]: [],
  [AIPersona.FUTURE_SELF_MENTOR]: [],
  [AIPersona.PERSONALIZED_RECOMMENDER]: [],
  [AIPersona.CONTENT_MODERATOR]: [],
  [AIPersona.WORKOUT_GENERATOR]: [],
  [AIPersona.NUTRITION_PLAN_GENERATOR]: [],
};

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  firebaseUser: User | null | undefined; 
}

const AiChatModal: React.FC<AiChatModalProps> = ({ isOpen, onClose, firebaseUser }) => {
  const { t, currentLanguage } = useLocalization();
  // Chat history persistence is disabled if firebaseUser is null.
  const [aiChatHistories, setAiChatHistories] = useLocalStorage<Record<AIPersona, AiChatMessage[]>>(
    'aiChatHistories', 
    initialChatHistories,
    { disabled: !firebaseUser } 
  );
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatPersona, setCurrentChatPersona] = useState<AIPersona>(AIPersona.AI_MENTOR_DEFAULT);
  const [currentPersonaExplanation, setCurrentPersonaExplanation] = useState<string>('');
  const geminiIsOn = isGeminiAvailable();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  };

  useEffect(scrollToBottom, [messages]);
  
  const getPersonaDisplayName = useCallback((persona: AIPersona): string => {
    switch (persona) {
      case AIPersona.AI_MENTOR_DEFAULT: return t('personaAiMentorDefault');
      case AIPersona.PERSONALIZED_RECOMMENDER: return t('personaRecommender');
      case AIPersona.JOURNAL_ANALYST: return t('personaJournalAnalyst');
      case AIPersona.EMERGENCY_CHAT: return t('personaEmergencyChat');
      case AIPersona.FUTURE_SELF_MENTOR: return t('personaFutureSelf');
      case AIPersona.CONTENT_MODERATOR: return "Content Moderator"; // Should not be user-facing directly
      default: return t('personaAiMentorDefault');
    }
  }, [t]);

  useEffect(() => {
    if (isOpen && firebaseUser && geminiIsOn) { // Only proceed if logged in and Gemini is on
      let explanationKey: TranslationKey = 'aiPersonaExplanationDefault';
      if (currentChatPersona === AIPersona.EMERGENCY_CHAT) explanationKey = 'aiPersonaExplanationEmergencyChat';
      else if (currentChatPersona === AIPersona.FUTURE_SELF_MENTOR) explanationKey = 'aiPersonaExplanationFutureSelf';
      else if (currentChatPersona === AIPersona.AI_MENTOR_DEFAULT || currentChatPersona === AIPersona.PERSONALIZED_RECOMMENDER) explanationKey = 'aiPersonaExplanationPersonalizedRecommender';
      else if (currentChatPersona === AIPersona.JOURNAL_ANALYST) explanationKey = 'aiPersonaExplanationJournalAnalyst';
      setCurrentPersonaExplanation(t(explanationKey));

      const personaMessagesFromStorage = aiChatHistories[currentChatPersona] || [];
      let finalMessagesForPersona: AiChatMessage[] = personaMessagesFromStorage;

      const lastMessageTime = personaMessagesFromStorage.length > 0 ? new Date(personaMessagesFromStorage[personaMessagesFromStorage.length - 1].timestamp).getTime() : 0;
      const now = new Date().getTime();
      const thirtyMinutes = 30 * 60 * 1000;
      const shouldClearPersonaChat = (now - lastMessageTime) > thirtyMinutes && personaMessagesFromStorage.length > 0;

      if (shouldClearPersonaChat) {
        finalMessagesForPersona = []; 
        setAiChatHistories(prev => ({
          ...prev,
          [currentChatPersona]: [] 
        }));
      }

      if (finalMessagesForPersona.length === 0) {
        let greetingTextKey: TranslationKey | null = null;
        switch (currentChatPersona) {
          case AIPersona.AI_MENTOR_DEFAULT:
          case AIPersona.PERSONALIZED_RECOMMENDER:
            greetingTextKey = 'aiChatInitialGreetingRecommender'; break;
          case AIPersona.EMERGENCY_CHAT:
            greetingTextKey = 'aiChatInitialGreetingCrisis'; break;
          case AIPersona.FUTURE_SELF_MENTOR:
            greetingTextKey = 'aiChatInitialGreetingFutureSelf'; break;
        }

        if (greetingTextKey) {
          const initialGreetingMessage: AiChatMessage = {
            id: crypto.randomUUID(),
            text: t(greetingTextKey as TranslationKey),
            sender: 'ai',
            persona: currentChatPersona,
            timestamp: new Date().toISOString(),
          };
          finalMessagesForPersona = [initialGreetingMessage];
          setAiChatHistories(prev => ({
            ...prev,
            [currentChatPersona]: [initialGreetingMessage]
          }));
        }
      }
      setMessages(finalMessagesForPersona);
    } else if (!firebaseUser) { // If not logged in, clear messages
        setMessages([]);
        setCurrentPersonaExplanation('');
    }
  }, [isOpen, currentChatPersona, geminiIsOn, t, firebaseUser, aiChatHistories, setAiChatHistories, getPersonaDisplayName]);


  const handleSendMessage = async () => {
    if (!firebaseUser || !inputValue.trim() || !geminiIsOn) return; // Prevent send if not logged in

    const userMessage: AiChatMessage = {
      id: crypto.randomUUID(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    const newMessagesWithUser = [...messages, userMessage];
    setMessages(newMessagesWithUser); 
    
    setAiChatHistories(prev => ({
        ...prev,
        [currentChatPersona]: [...(prev[currentChatPersona] || []), userMessage]
    }));

    setInputValue('');
    setIsLoading(true);

    let personaForThisQuery = currentChatPersona;
    
    // Pass firebaseUser.uid for history fetching
    const aiResponseText = await getGeminiAdvice(userMessage.text, personaForThisQuery, currentLanguage, firebaseUser.uid);

    if (aiResponseText) {
      const aiMessage: AiChatMessage = {
        id: crypto.randomUUID(),
        text: aiResponseText,
        sender: 'ai',
        persona: personaForThisQuery,
        timestamp: new Date().toISOString(),
      };
      setMessages(prevMsgs => [...prevMsgs, aiMessage]); 
      setAiChatHistories(prev => ({
        ...prev,
        [currentChatPersona]: [...(prev[currentChatPersona] || []), aiMessage]
      }));

      // Save to Firestore
      if (firebaseUser?.uid) {
        await saveAiInteractionToFirestore({
          userId: firebaseUser.uid,
          userMessageText: userMessage.text,
          aiMessageText: aiMessage.text,
          persona: personaForThisQuery,
        });
      }
    }
    setIsLoading(false);
  };

  const activatePersona = (persona: AIPersona) => {
    if (!firebaseUser) return; // Prevent persona switch if not logged in
    setCurrentChatPersona(persona);
    setMessages(aiChatHistories[persona] || []); // Load history for the new persona
    setInputValue(''); 
  };
  
  const getChatInputPlaceholder = (): string => {
    if (!firebaseUser) return t('aiMentorForLoggedInUsers');
    switch(currentChatPersona) {
        case AIPersona.EMERGENCY_CHAT: return t('emergencyPlaceholder');
        case AIPersona.FUTURE_SELF_MENTOR: return t('futureSelfPlaceholder');
        default: return t('aiChatInputPlaceholder');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('aiChatTitle')} size="lg">
      <RequirePremium customMessage="Esta función es solo para suscriptores premium" showBothPlans>
        <div className="flex flex-col h-[70vh] sm:h-[60vh]">
          {!geminiIsOn && (
              <div className="p-3 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-md text-sm mb-3">
              {t('aiSupportDisabledDesc')}
              </div>
          )}
          
          {!firebaseUser ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
              <ShieldAlert size={48} className="text-primary dark:text-primary-light mb-4" />
              <h3 className="text-xl font-semibold text-neutral-dark dark:text-white mb-2">{t('aiMentorForLoggedInUsersTitle')}</h3>
              <p className="text-neutral-dark/80 dark:text-neutral-light/80">{t('aiMentorForLoggedInUsers')}</p>
            </div>
          ) : (
            <>
              <div className="mb-2 text-xs text-center text-neutral-dark/70 dark:text-neutral-light/70">
                  {t('currentAIMode')}: <strong>{getPersonaDisplayName(currentChatPersona)}</strong>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                  <button
                    onClick={() => activatePersona(AIPersona.AI_MENTOR_DEFAULT)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors flex items-center ${(currentChatPersona === AIPersona.AI_MENTOR_DEFAULT || currentChatPersona === AIPersona.PERSONALIZED_RECOMMENDER) ? 'bg-primary text-white shadow-md' : 'bg-neutral-light dark:bg-slate-700 hover:bg-neutral/30 dark:hover:bg-slate-600'}`}
                    title={t('personaRecommender')}
                    disabled={!firebaseUser}
                  >
                  <MessageSquareHeart size={14} className="mr-1 hidden sm:inline-block"/> {t('personaRecommender')}
                  </button>
                  <button
                    onClick={() => activatePersona(AIPersona.EMERGENCY_CHAT)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors flex items-center ${currentChatPersona === AIPersona.EMERGENCY_CHAT ? 'bg-danger text-white shadow-md' : 'bg-neutral-light dark:bg-slate-700 hover:bg-neutral/30 dark:hover:bg-slate-600'}`}
                    title={t('aiChatSwitchToEmergency')}
                    disabled={!firebaseUser}
                  >
                    <AlertTriangle size={14} className="mr-1 hidden sm:inline-block" /> {t('aiChatSwitchToEmergency')}
                  </button>
                  <button
                    onClick={() => activatePersona(AIPersona.FUTURE_SELF_MENTOR)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors flex items-center ${currentChatPersona === AIPersona.FUTURE_SELF_MENTOR ? 'bg-secondary text-white shadow-md' : 'bg-neutral-light dark:bg-slate-700 hover:bg-neutral/30 dark:hover:bg-slate-600'}`}
                    title={t('aiChatSwitchToFutureSelf')}
                    disabled={!firebaseUser}
                  >
                    <Sparkles size={14} className="mr-1 hidden sm:inline-block" /> {t('aiChatSwitchToFutureSelf')}
                  </button>
              </div>

              {currentPersonaExplanation && (
                <div className="mb-3 p-2.5 bg-primary-light/20 dark:bg-primary-dark/20 border border-primary/30 dark:border-primary/50 rounded-lg text-xs text-primary-dark dark:text-primary-light text-center flex items-center justify-center">
                  <Info size={16} className="mr-2 flex-shrink-0" />
                  <p>{currentPersonaExplanation}</p>
                </div>
              )}

              <div className="flex-grow overflow-y-auto mb-4 p-3 bg-neutral-light dark:bg-slate-700 rounded-lg space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-3 rounded-xl shadow ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-white dark:bg-slate-600 text-neutral-dark dark:text-neutral-light rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-light/80 text-right' : 'text-neutral-dark/60 dark:text-neutral-light/60 text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString(currentLanguage, { hour: '2-digit', minute: '2-digit' })}
                        {msg.sender === 'ai' && msg.persona && ` (${getPersonaDisplayName(msg.persona)})`}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                      <div className="max-w-[75%] p-3 rounded-xl shadow bg-white dark:bg-slate-600 text-neutral-dark dark:text-neutral-light rounded-bl-none">
                          <LoadingSpinner size={20} />
                      </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && firebaseUser && handleSendMessage()}
                  placeholder={getChatInputPlaceholder()}
                  className="flex-grow px-4 py-2.5 border border-neutral rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white text-neutral-dark placeholder-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-300 transition-colors"
                  disabled={!geminiIsOn || isLoading || !firebaseUser}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!geminiIsOn || isLoading || !inputValue.trim() || !firebaseUser}
                  className="p-3 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t('aiChatSend')}
                >
                  <Send size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      </RequirePremium>
    </Modal>
  );
};

export default AiChatModal;
