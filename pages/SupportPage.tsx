import React, { useState, useCallback, useEffect } from 'react';
import { LifeBuoy, Zap, MessageCircle, ExternalLink, Send, Brain, AlertTriangle, Wind, Sparkles } from 'lucide-react';
import type { User } from 'firebase/auth'; // Firebase User type
import { INITIAL_SUPPORT_CONTACTS_KEYS, GEMINI_MODEL_NAME, DEEPSEEK_MODEL_NAME } from '../constants';
import { getGeminiAdvice, isGeminiAvailable } from '../services/geminiService';
import { getDeepSeekAdvice, isDeepSeekAvailable } from '../services/deepSeekService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useLocalization } from '../hooks/useLocalization';
import { getTranslatedConstants } from '../translations';
import { SupportContact, AIPersona, TranslationKey } from '../types';

interface SupportPageProps {
  isGuest: boolean;
  firebaseUser: User | null | undefined;
}

const SupportPage: React.FC<SupportPageProps> = ({ isGuest, firebaseUser }) => { // Props received
  const { t, currentLanguage } = useLocalization();
  const { emergencyTips, guidedBreathingInstructions } = getTranslatedConstants(currentLanguage);

  const [showEmergencyTipsModal, setShowEmergencyTipsModal] = useState(false);
  const [geminiQuery, setGeminiQuery] = useState('');
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const geminiIsOn = isGeminiAvailable();
  const deepSeekIsOn = isDeepSeekAvailable();
  const [currentAiPersona, setCurrentAiPersona] = useState<AIPersona>(AIPersona.PERSONALIZED_RECOMMENDER);
  const [activePersonaForDisplay, setActivePersonaForDisplay] = useState<AIPersona>(AIPersona.PERSONALIZED_RECOMMENDER);
  
  const [supportContacts, setSupportContacts] = useState<SupportContact[]>(INITIAL_SUPPORT_CONTACTS_KEYS.map(keyContact => ({
    id: keyContact.id, 
    name: t(keyContact.nameKey),
    description: t(keyContact.descriptionKey),
    phone: keyContact.phone, 
    website: keyContact.website, 
  })));

  useEffect(() => {
    setSupportContacts(INITIAL_SUPPORT_CONTACTS_KEYS.map(keyContact => ({
        id: keyContact.id,
        name: t(keyContact.nameKey),
        description: t(keyContact.descriptionKey),
        phone: keyContact.phone,
        website: keyContact.website,
    })))
  }, [t]);


  const getRandomEmergencyTip = useCallback(() => {
    return emergencyTips[Math.floor(Math.random() * emergencyTips.length)];
  }, [emergencyTips]);

  const [currentEmergencyTip, setCurrentEmergencyTip] = useState(getRandomEmergencyTip());
  
  useEffect(() => { 
    setCurrentEmergencyTip(getRandomEmergencyTip());
  }, [getRandomEmergencyTip]);


  const showNewTip = () => {
    setCurrentEmergencyTip(getRandomEmergencyTip());
    setShowEmergencyTipsModal(true); 
  };

  const openEmergencyModal = () => {
    setCurrentEmergencyTip(getRandomEmergencyTip()); 
    setShowEmergencyTipsModal(true);
  };


  const handleGeminiQuery = async () => {
    if (!geminiQuery.trim() || !geminiIsOn) return;
    setIsGeminiLoading(true);
    setGeminiResponse(null);
    
    let personaToUse = currentAiPersona;
    const crisisKeywords = ['recaer', 'crisis', 'ayuda urgente', 'no puedo más', 'punto de caer']; 
    if (crisisKeywords.some(keyword => geminiQuery.toLowerCase().includes(keyword))) {
        personaToUse = AIPersona.EMERGENCY_CHAT;
    }
    setActivePersonaForDisplay(personaToUse); 

    const response = await getGeminiAdvice(geminiQuery, personaToUse, currentLanguage, firebaseUser?.uid);
    setGeminiResponse(response);
    setIsGeminiLoading(false);
  };
  
  const activatePersona = (persona: AIPersona) => {
    setCurrentAiPersona(persona);
    setActivePersonaForDisplay(persona); 
    setGeminiQuery(''); 
    setGeminiResponse(null); 
  };

  const getPersonaSpecificPlaceholder = () => {
    switch(currentAiPersona) {
        case AIPersona.FUTURE_SELF_MENTOR:
            return t('futureSelfPlaceholder');
        case AIPersona.EMERGENCY_CHAT:
            return t('emergencyPlaceholder');
        default:
            return t('askPlaceholder');
    }
  }

  const getPersonaDisplayName = (persona: AIPersona) => {
    switch(persona) {
        case AIPersona.JOURNAL_ANALYST: return t('personaJournalAnalyst');
        case AIPersona.EMERGENCY_CHAT: return t('personaEmergencyChat');
        case AIPersona.FUTURE_SELF_MENTOR: return t('personaFutureSelf');
        case AIPersona.PERSONALIZED_RECOMMENDER: return t('personaRecommender');
        default: return t('personaGeneralSupport' as TranslationKey);
    }
  }


  return (
    <div className="space-y-10">
      <div className="p-8 bg-gradient-to-r from-primary to-secondary dark:from-primary-dark dark:to-secondary-dark rounded-xl shadow-2xl text-white text-center">
        <LifeBuoy size={64} className="mx-auto mb-4 animate-pulse" />
        <h1 className="text-4xl font-bold mb-2">{t('needSupportTitle')}</h1>
        <p className="text-lg opacity-90">{t('needSupportSubTitle')}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-neutral-dark dark:text-white mb-4 flex items-center">
          <Zap size={24} className="mr-3 text-yellow-500" />
          {t('immediateHelp')}
        </h2>
        <p className="text-neutral-dark/80 dark:text-neutral-light/80 mb-6">
          {t('immediateHelpDesc')}
        </p>
        <button
          onClick={openEmergencyModal}
          className="w-full px-6 py-4 bg-danger hover:bg-danger-dark text-white rounded-lg shadow-md text-lg font-semibold transition-all duration-200 transform hover:scale-105"
        >
          {t('iNeedHelpNow')}
        </button>
      </div>
      <Modal isOpen={showEmergencyTipsModal} onClose={() => setShowEmergencyTipsModal(false)} title={t('quickCopingStrategy')} size="lg">
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-neutral-dark dark:text-neutral-light mb-2 text-center">{t('anotherTip')}:</h3>
                <p className="text-md text-neutral-dark dark:text-neutral-light mb-4 text-center">{currentEmergencyTip}</p>
            </div>
            <div className="border-t dark:border-slate-700 pt-4">
                <h3 className="text-lg font-semibold text-neutral-dark dark:text-neutral-light mb-3 flex items-center">
                    <Wind size={20} className="mr-2 text-primary dark:text-primary-light" />
                    {t('guidedBreathingTitle')}
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-neutral-dark dark:text-neutral-light">
                    {guidedBreathingInstructions.map((step, index) => (
                        <li key={index}>{step}</li>
                    ))}
                </ul>
            </div>
        </div>
        <div className="flex justify-center space-x-3 mt-8">
             <button onClick={() => setShowEmergencyTipsModal(false)} className="px-6 py-2 bg-neutral/30 dark:bg-slate-700 text-neutral-dark dark:text-neutral-light rounded-md hover:bg-neutral/40 dark:hover:bg-slate-600 transition-colors">
                {t('close')}
            </button>
            <button onClick={showNewTip} className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors">
                {t('anotherTip')}
            </button>
        </div>
      </Modal>

      {geminiIsOn && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-2xl font-semibold text-neutral-dark dark:text-white flex items-center">
                <Brain size={24} className="mr-3 text-secondary dark:text-secondary-light" />
                {t('askForAdviceAI')} (Gemini)
            </h2>
            <div className="flex space-x-2 mt-3 sm:mt-0">
                <button
                    onClick={() => activatePersona(AIPersona.PERSONALIZED_RECOMMENDER)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${currentAiPersona === AIPersona.PERSONALIZED_RECOMMENDER ? 'bg-primary text-white' : 'bg-neutral-light dark:bg-slate-700 hover:bg-neutral/30 dark:hover:bg-slate-600'}`}
                >
                    {t('personaRecommender')}
                </button>
                <button
                    onClick={() => activatePersona(AIPersona.EMERGENCY_CHAT)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${currentAiPersona === AIPersona.EMERGENCY_CHAT ? 'bg-danger text-white' : 'bg-neutral-light dark:bg-slate-700 hover:bg-neutral/30 dark:hover:bg-slate-600'}`}
                >
                    {t('personaEmergencyChat')}
                </button>
                 <button
                    onClick={() => activatePersona(AIPersona.FUTURE_SELF_MENTOR)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${currentAiPersona === AIPersona.FUTURE_SELF_MENTOR ? 'bg-secondary text-white' : 'bg-neutral-light dark:bg-slate-700 hover:bg-neutral/30 dark:hover:bg-slate-600'}`}
                    title={t('futureSelfTitle')}
                >
                   <Sparkles size={14} className="mr-1 inline-block"/> {t('personaFutureSelf')}
                </button>
            </div>
          </div>
          
          <p className="text-neutral-dark/80 dark:text-neutral-light/80 mb-1">
            {currentAiPersona === AIPersona.FUTURE_SELF_MENTOR ? t('futureSelfDesc' as TranslationKey) : t('askForAdviceAIDesc')}
          </p>
          <p className="text-xs text-neutral-dark/60 dark:text-neutral-light/60 mb-4">
            ({t('geminiModel')} {GEMINI_MODEL_NAME} - {t('currentAIMode')}: {getPersonaDisplayName(currentAiPersona)})
          </p>
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={geminiQuery}
              onChange={e => setGeminiQuery(e.target.value)}
              placeholder={getPersonaSpecificPlaceholder()}
              className="flex-grow px-4 py-2 border border-neutral rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white text-neutral-dark placeholder-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-300"
              onKeyPress={e => e.key === 'Enter' && handleGeminiQuery()}
            />
            <button
              onClick={handleGeminiQuery}
              disabled={isGeminiLoading || !geminiQuery.trim()}
              className="px-6 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-lg shadow-md font-medium transition-colors disabled:opacity-50 flex items-center"
            >
              {isGeminiLoading ? <LoadingSpinner size={20} className="mr-2" /> : <Send size={18} className="mr-2" />}
              {t('askButton')}
            </button>
          </div>
          {isGeminiLoading && <LoadingSpinner className="mx-auto my-4" />}
          {geminiResponse && (
            <div className="mt-4 p-4 bg-neutral-light dark:bg-slate-700 rounded-lg">
              <h4 className="font-semibold text-neutral-dark dark:text-white mb-1">
                {t('aiResponseTitle')} ({getPersonaDisplayName(activePersonaForDisplay)})
              </h4>
              <p className="text-neutral-dark dark:text-neutral-light whitespace-pre-wrap">{geminiResponse}</p>
            </div>
          )}
        </div>
      )}
      {!geminiIsOn && (
         <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-400 text-yellow-700 dark:text-yellow-200 p-4 rounded-md shadow" role="alert">
            <div className="flex items-center">
                <AlertTriangle size={20} className="mr-2"/>
                <p className="font-bold">{t('aiSupportDisabled')}</p>
            </div>
            <p className="text-sm">{t('aiSupportDisabledDesc')}</p>
        </div>
      )}

      {deepSeekIsOn && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-2xl font-semibold text-neutral-dark dark:text-white flex items-center">
                <Brain size={24} className="mr-3 text-primary dark:text-primary-light" />
                {t('askForAdviceAI')} (DeepSeek)
            </h2>
            <div className="flex space-x-2 mt-3 sm:mt-0">
                <button
                    onClick={() => activatePersona(AIPersona.PERSONALIZED_RECOMMENDER)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${currentAiPersona === AIPersona.PERSONALIZED_RECOMMENDER ? 'bg-primary text-white' : 'bg-neutral-light dark:bg-slate-700 hover:bg-neutral/30 dark:hover:bg-slate-600'}`}
                >
                    {t('personaRecommender')}
                </button>
                <button
                    onClick={() => activatePersona(AIPersona.EMERGENCY_CHAT)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${currentAiPersona === AIPersona.EMERGENCY_CHAT ? 'bg-danger text-white' : 'bg-neutral-light dark:bg-slate-700 hover:bg-neutral/30 dark:hover:bg-slate-600'}`}
                >
                    {t('personaEmergencyChat')}
                </button>
                 <button
                    onClick={() => activatePersona(AIPersona.FUTURE_SELF_MENTOR)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${currentAiPersona === AIPersona.FUTURE_SELF_MENTOR ? 'bg-secondary text-white' : 'bg-neutral-light dark:bg-slate-700 hover:bg-neutral/30 dark:hover:bg-slate-600'}`}
                    title={t('futureSelfTitle')}
                >
                   <Sparkles size={14} className="mr-1 inline-block"/> {t('personaFutureSelf')}
                </button>
            </div>
          </div>
          
          <p className="text-neutral-dark/80 dark:text-neutral-light/80 mb-1">
            {currentAiPersona === AIPersona.FUTURE_SELF_MENTOR ? t('futureSelfDesc' as TranslationKey) : t('askForAdviceAIDesc')}
          </p>
          <p className="text-xs text-neutral-dark/60 dark:text-neutral-light/60 mb-4">
            (DeepSeek Model: {DEEPSEEK_MODEL_NAME} - {t('currentAIMode')}: {getPersonaDisplayName(currentAiPersona)})
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-neutral-dark dark:text-white mb-6 flex items-center">
          <MessageCircle size={24} className="mr-3 text-primary dark:text-primary-light" />
          {t('professionalResources')}
        </h2>
        <div className="space-y-4">
          {supportContacts.map(contact => (
            <div key={contact.id} className="p-4 border border-neutral/30 dark:border-slate-700 rounded-lg hover:bg-neutral-light/50 dark:hover:bg-slate-700/50 transition-colors">
              <h4 className="font-semibold text-lg text-primary dark:text-primary-light">{contact.name}</h4>
              <p className="text-sm text-neutral-dark/80 dark:text-neutral-light/80 mb-2">{contact.description}</p>
              {contact.phone && <p className="text-sm text-neutral-dark dark:text-neutral-light">{t('phoneLabel') || 'Phone'}: {contact.phone}</p>}
              {contact.website && (
                <a
                  href={contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-secondary dark:text-secondary-light hover:underline flex items-center"
                >
                  {t('visitWebsiteLabel') || 'Visit Website'} <ExternalLink size={14} className="ml-1" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
