
import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Play, Pause, Square, Settings, AlertTriangle } from 'lucide-react';
import type { User } from 'firebase/auth'; // Firebase User type
import Modal from '../components/Modal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLocalization } from '../hooks/useLocalization';
import { getTranslatedConstants } from '../translations';


interface FocusSessionSettings {
  duration: number; // in minutes
  isStrict: boolean;
  distractions: string[];
}

interface FocusPageProps {
  isGuest: boolean;
  firebaseUser: User | null | undefined;
}

const FocusPage: React.FC<FocusPageProps> = ({ isGuest, firebaseUser }) => {
  const { t, currentLanguage } = useLocalization();
  const { focusQuotes } = getTranslatedConstants(currentLanguage);
  const dataSavingDisabled = isGuest || !firebaseUser;

  const [settings, setSettings] = useLocalStorage<FocusSessionSettings>('focusSettings', {
    duration: 25,
    isStrict: false,
    distractions: ['Social Media', 'News Websites', 'Games'], 
  }, { disabled: dataSavingDisabled });

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.duration * 60);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showStrictExitConfirm, setShowStrictExitConfirm] = useState(false);
  const [strictExitPhrase, setStrictExitPhrase] = useState('');
  const [motivationalQuote, setMotivationalQuote] = useState(focusQuotes[0]);


  useEffect(() => {
    let timer: number;
    if (isSessionActive && timeLeft > 0) {
      timer = window.setTimeout(() => setTimeLeft(prevTime => prevTime - 1), 1000); 
    } else if (isSessionActive && timeLeft === 0) {
      setIsSessionActive(false);
      alert(t('focusSessionComplete'));
    }
    return () => clearTimeout(timer);
  }, [isSessionActive, timeLeft, t]);

  useEffect(() => {
    if (!isSessionActive) {
        setTimeLeft(settings.duration * 60);
    }
  }, [settings.duration, isSessionActive]);

  const startSession = useCallback(() => {
    setTimeLeft(settings.duration * 60);
    setIsSessionActive(true);
    setMotivationalQuote(focusQuotes[Math.floor(Math.random() * focusQuotes.length)]);
  }, [settings.duration, focusQuotes]);
  
  const stopSession = () => {
    if (settings.isStrict && isSessionActive) {
      setShowStrictExitConfirm(true);
      return;
    }
    setIsSessionActive(false);
    setTimeLeft(settings.duration * 60);
  };
  
  const handleStrictExit = () => {
    if (strictExitPhrase.toLowerCase() === t('strictExitPhraseToType').toLowerCase()) {
        setIsSessionActive(false);
        setTimeLeft(settings.duration * 60);
        setShowStrictExitConfirm(false);
        setStrictExitPhrase('');
    } else {
        alert(t('incorrectPhrase'));
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSettingsSave = (newSettings: FocusSessionSettings) => {
    setSettings(newSettings); 
    if (!isSessionActive) { 
        setTimeLeft(newSettings.duration * 60);
    }
    setIsSettingsModalOpen(false);
  };
  
  if (isSessionActive) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-primary via-secondary to-teal-600 dark:from-neutral-dark dark:via-slate-900 dark:to-black text-white flex flex-col items-center justify-center p-8 z-50">
        <Zap size={64} className="mb-8 animate-pulse" />
        <h1 className="text-6xl font-bold mb-4">{formatTime(timeLeft)}</h1>
        <p className="text-2xl mb-12 text-center">{motivationalQuote}</p>
        
        {settings.distractions.length > 0 && (
          <div className="mb-10 text-center">
            <h3 className="text-xl font-semibold mb-2">{t('rememberToAvoid')}</h3>
            <ul className="list-disc list-inside opacity-80">
              {settings.distractions.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
        )}

        <div className="flex space-x-6">
          <button
            onClick={stopSession}
            className="px-8 py-4 bg-danger hover:bg-danger-dark text-white rounded-lg shadow-lg text-lg font-semibold flex items-center transition-transform hover:scale-105"
          >
            <Square size={20} className="mr-2" /> {t('stopSession')}
          </button>
        </div>
         {settings.isStrict && (
            <p className="mt-8 text-sm opacity-70">{t('strictModeActive')}</p>
        )}
        <Modal isOpen={showStrictExitConfirm} onClose={() => setShowStrictExitConfirm(false)} title={t('confirmExitStrictTitle')}>
            <div className="space-y-4">
                <AlertTriangle size={48} className="mx-auto text-danger mb-4" />
                <p className="text-neutral-dark dark:text-neutral-light text-center">{t('confirmExitStrictMessage')}</p>
                <p className="text-sm text-neutral-dark/80 dark:text-neutral-light/80 text-center" dangerouslySetInnerHTML={{ __html: t('confirmExitStrictInstruction', `<strong>${t('strictExitPhraseToType')}</strong>`) }}/>

                <input
                    type="text"
                    value={strictExitPhrase}
                    onChange={(e) => setStrictExitPhrase(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-neutral-dark placeholder-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-300"
                    placeholder={t('typePhraseHere')}
                />
                <div className="flex justify-end space-x-3 pt-4">
                    <button onClick={() => setShowStrictExitConfirm(false)} className="px-4 py-2 text-neutral-dark dark:text-neutral-light bg-neutral/30 dark:bg-slate-700 hover:bg-neutral/40 dark:hover:bg-slate-600 rounded-md">{t('cancel')}</button>
                    <button onClick={handleStrictExit} className="px-4 py-2 bg-danger hover:bg-danger-dark text-white rounded-md">{t('confirmRemoval')}</button> 
                </div>
            </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-8 flex flex-col items-center justify-center text-center h-full">
      <Zap size={72} className="text-primary dark:text-primary-light mb-4" />
      <h1 className="text-4xl font-bold text-neutral-dark dark:text-white">{t('focusTitle')}</h1>
      <p className="text-xl text-neutral-dark/80 dark:text-neutral-light/80 max-w-lg">
        {t('focusDescription')}
      </p>
      
      {isGuest && (
         <div className="p-3 bg-yellow-100 dark:bg-yellow-700 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 rounded-md text-sm w-full max-w-md">
           {t('guestModeFeatureLimitationSettings')}
        </div>
      )}

      <div className="my-8 p-8 bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md">
        <p className="text-6xl font-bold text-primary dark:text-primary-light mb-6">{formatTime(timeLeft)}</p>
        <div className="space-y-4">
          <button
            onClick={startSession}
            disabled={isSessionActive}
            className="w-full px-8 py-4 bg-success hover:bg-success-dark text-white rounded-lg shadow-lg text-lg font-semibold flex items-center justify-center transition-all duration-200 disabled:opacity-50"
          >
            <Play size={20} className="mr-2" /> {t('startFocusSession')}
          </button>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-full px-8 py-3 bg-neutral/30 dark:bg-slate-700 hover:bg-neutral/40 dark:hover:bg-slate-600 text-neutral-dark dark:text-neutral-light rounded-lg text-md font-medium flex items-center justify-center transition-colors"
          >
            <Settings size={18} className="mr-2" /> {t('sessionSettings')}
          </button>
        </div>
      </div>
      
      <FocusSettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)}
        currentSettings={settings}
        onSave={handleSettingsSave}
        t={t}
        dataSavingDisabled={dataSavingDisabled}
      />
    </div>
  );
};


interface FocusSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: FocusSessionSettings;
  onSave: (settings: FocusSessionSettings) => void;
  t: (key: string, ...args: any[]) => string; 
  dataSavingDisabled: boolean;
}

const FocusSettingsModal: React.FC<FocusSettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave, t, dataSavingDisabled }) => {
  const [duration, setDuration] = useState(currentSettings.duration);
  const [isStrict, setIsStrict] = useState(currentSettings.isStrict);
  const [distractions, setDistractions] = useState(currentSettings.distractions.join(', '));

  const handleSave = () => {
    onSave({
      duration,
      isStrict,
      distractions: distractions.split(',').map(d => d.trim()).filter(d => d),
    });
  };

  useEffect(() => {
    setDuration(currentSettings.duration);
    setIsStrict(currentSettings.isStrict);
    setDistractions(currentSettings.distractions.join(', '));
  }, [currentSettings, isOpen]);


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('focusSettingsTitle')}>
      <div className="space-y-6">
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-neutral-dark dark:text-neutral-light">{t('durationLabel')}</label>
          <input
            type="number"
            id="duration"
            value={duration}
            min="1"
            onChange={e => setDuration(Math.max(1, parseInt(e.target.value,10)))}
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-neutral-dark dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="distractions" className="block text-sm font-medium text-neutral-dark dark:text-neutral-light">{t('distractionsLabel')}</label>
          <input
            type="text"
            id="distractions"
            value={distractions}
            onChange={e => setDistractions(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-neutral-dark placeholder-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-300"
            placeholder={t('distractionsPlaceholder')}
          />
        </div>
        <div className="flex items-center">
          <input
            id="strictMode"
            type="checkbox"
            checked={isStrict}
            onChange={e => setIsStrict(e.target.checked)}
            className="h-4 w-4 text-primary border-neutral dark:border-slate-600 rounded focus:ring-primary dark:bg-slate-700"
          />
          <label htmlFor="strictMode" className="ml-2 block text-sm text-neutral-dark dark:text-neutral-light">{t('enableStrictMode')}</label>
        </div>
         {dataSavingDisabled && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">{t('guestModeFeatureLimitationSettings')}</p>
        )}
        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 text-neutral-dark dark:text-neutral-light bg-neutral/30 dark:bg-slate-700 hover:bg-neutral/40 dark:hover:bg-slate-600 rounded-md">{t('cancel')}</button>
          <button onClick={handleSave} disabled={dataSavingDisabled} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md disabled:opacity-50">{t('saveSettings')}</button>
        </div>
      </div>
    </Modal>
  );
};


export default FocusPage;
