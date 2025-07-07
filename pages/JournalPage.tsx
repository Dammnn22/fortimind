
import React, { useState } from 'react';
import { PlusCircle, BookOpen, Edit3, Trash2, Meh, Brain } from 'lucide-react'; // Removed Smile, Frown
import type { User } from 'firebase/auth'; // Firebase User type
import { useLocalStorage } from '../hooks/useLocalStorage';
import { JournalEntry, Mood, AIPersona, TranslationKey } from '../types';
import Modal from '../components/Modal';
import { MOOD_OPTIONS, XP_REWARDS } from '../constants'; // Removed GEMINI_MODEL_NAME as it's in constants
import { useLocalization } from '../hooks/useLocalization';
import { getGeminiAdvice, isGeminiAvailable } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';


interface JournalPageProps {
  addXP: (points: number) => void;
  isGuest: boolean;
  firebaseUser: User | null | undefined;
}

const JournalPage: React.FC<JournalPageProps> = ({ addXP, isGuest, firebaseUser }) => {
  const dataSavingDisabled = isGuest || !firebaseUser;
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('journalEntries', [], { disabled: dataSavingDisabled });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry> | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const { t, currentLanguage } = useLocalization();

  const [isAiAnalysisModalOpen, setIsAiAnalysisModalOpen] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [analyzedEntryContent, setAnalyzedEntryContent] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const geminiIsOn = isGeminiAvailable();

  const openModalForNew = () => {
    setCurrentEntry({ date: new Date().toISOString(), content: '', mood: Mood.Okay });
    setEditingEntryId(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setEditingEntryId(entry.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEntry(null);
    setEditingEntryId(null);
  };

  const handleSaveEntry = () => {
    if (dataSavingDisabled || !currentEntry || !currentEntry.content) return;

    const entryData: JournalEntry = {
      id: editingEntryId || crypto.randomUUID(),
      date: editingEntryId ? currentEntry.date! : new Date().toISOString(),
      content: currentEntry.content,
      mood: currentEntry.mood,
      aiAnalysis: editingEntryId ? entries.find(e => e.id === editingEntryId)?.aiAnalysis : undefined, 
    };
    
    if (editingEntryId) {
      setEntries(entries.map(e => e.id === editingEntryId ? entryData : e));
    } else {
      setEntries([entryData, ...entries]); 
      if (!dataSavingDisabled) { // Check before adding XP
        addXP(XP_REWARDS.JOURNAL_ENTRY);
      }
    }
    alert(t('entrySaved'));
    closeModal();
  };

  const handleDeleteEntry = (id: string) => {
    if (dataSavingDisabled) return;
    if (window.confirm(t('deleteEntryConfirm'))) {
      setEntries(entries.filter(e => e.id !== id));
      alert(t('entryDeleted'));
    }
  };
  
  const getMoodIcon = (mood?: Mood) => {
    const moodOption = MOOD_OPTIONS.find(opt => opt.value === mood);
    if (moodOption) {
        return <span className="text-2xl">{moodOption.icon}</span>;
    }
    return <Meh size={24} className="text-neutral dark:text-slate-500" />;
  };

  const handleAiAnalysis = async (entry: JournalEntry) => {
    if (!geminiIsOn || !entry.content) return;

    setAnalyzedEntryContent(entry.content); 
    setIsAiLoading(true);
    setAiAnalysisResult(null); 
    setIsAiAnalysisModalOpen(true);
    
    const userPrompt = `Analiza la siguiente entrada de diario:\n\n"${entry.content}"`;
    
    const response = await getGeminiAdvice(userPrompt, AIPersona.JOURNAL_ANALYST, currentLanguage, firebaseUser?.uid);
    setAiAnalysisResult(response);

    if (!dataSavingDisabled && response && !response.startsWith("Error")) {
        setEntries(prevEntries => prevEntries.map(e => e.id === entry.id ? {...e, aiAnalysis: response} : e));
    }
    setIsAiLoading(false);
  };

  const sortedEntries = [...entries].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-dark dark:text-white">{t('reflectionJournal')}</h1>
        <button
          onClick={openModalForNew}
          disabled={dataSavingDisabled}
          className="p-3 bg-primary hover:bg-primary-dark text-white rounded-lg shadow hover:shadow-md transition-all duration-200 flex items-center disabled:opacity-50"
        >
          <PlusCircle size={20} className="mr-2" />
          {t('newEntry')}
        </button>
      </div>

      {isGuest && (
         <div className="p-3 bg-yellow-100 dark:bg-yellow-700 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 rounded-md text-sm">
           {t('guestModeFeatureLimitation')}
        </div>
      )}

      {sortedEntries.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen size={64} className="mx-auto text-neutral dark:text-slate-600 mb-4" />
          <p className="text-xl text-neutral-dark dark:text-neutral-light">{t('emptyJournalMessage')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedEntries.map(entry => (
            <div key={entry.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-neutral-dark/80 dark:text-neutral-light/80">
                    {new Date(entry.date).toLocaleDateString(currentLanguage, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    {' - '} 
                    {new Date(entry.date).toLocaleTimeString(currentLanguage, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {entry.mood && (
                    <div className="flex items-center mt-1">
                        {getMoodIcon(entry.mood)}
                        <span className="ml-2 text-sm text-neutral-dark dark:text-neutral-light">
                          {t(MOOD_OPTIONS.find(m => m.value === entry.mood)?.labelKey || 'moodOkay' as TranslationKey)}
                        </span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-1 sm:space-x-2">
                  {geminiIsOn && entry.content && (
                    <button 
                      onClick={() => handleAiAnalysis(entry)}
                      className="p-2 text-neutral-dark/70 hover:text-purple-500 dark:text-neutral-light/70 dark:hover:text-purple-400 transition-colors" 
                      title={t('analyzeWithAI')}
                      disabled={dataSavingDisabled && !entry.aiAnalysis} // Can view existing if guest, but not generate new
                    >
                      <Brain size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => openModalForEdit(entry)} 
                    className="p-2 text-neutral-dark/70 hover:text-secondary dark:text-neutral-light/70 dark:hover:text-secondary-light transition-colors disabled:opacity-50" 
                    title={t('editEntryModalTitle')}
                    disabled={dataSavingDisabled}
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteEntry(entry.id)} 
                    className="p-2 text-neutral-dark/70 hover:text-danger dark:text-neutral-light/70 dark:hover:text-danger-light transition-colors disabled:opacity-50" 
                    title={t('deleteEntryConfirm')}
                    disabled={dataSavingDisabled}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <p className="text-neutral-dark dark:text-neutral-light whitespace-pre-wrap">{entry.content}</p>
              {entry.aiAnalysis && (
                <div className="mt-3 pt-3 border-t border-neutral/20 dark:border-slate-700">
                  <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">{t('aiAnalysisTitle')}:</h4>
                  <p className="text-xs text-neutral-dark/80 dark:text-neutral-light/80 whitespace-pre-wrap">{entry.aiAnalysis}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CRUD Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingEntryId ? t('editEntryModalTitle') : t('newEntryModalTitle')}>
        <div className="space-y-4">
          <div>
            <label htmlFor="entryContent" className="block text-sm font-medium text-neutral-dark dark:text-neutral-light">{t('contentLabel')}</label>
            <textarea
              id="entryContent"
              rows={6}
              value={currentEntry?.content || ''}
              onChange={e => setCurrentEntry(prev => ({ ...prev, content: e.target.value }))}
              placeholder={t('contentLabel')}
              className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-neutral-dark placeholder-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-300"
            />
          </div>
          <div>
            <label htmlFor="entryMood" className="block text-sm font-medium text-neutral-dark dark:text-neutral-light">{t('moodLabel')}</label>
            <select
                id="entryMood"
                value={currentEntry?.mood || ''}
                onChange={e => setCurrentEntry(prev => ({...prev, mood: e.target.value as Mood}))}
                className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-neutral-dark dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
                <option value="">{t('selectMood')}</option>
                {MOOD_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.icon} {t(opt.labelKey)}</option>
                ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-neutral-dark dark:text-neutral-light bg-neutral/30 dark:bg-slate-700 hover:bg-neutral/40 dark:hover:bg-slate-600 rounded-md shadow-sm"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={handleSaveEntry}
              disabled={dataSavingDisabled}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md shadow-sm disabled:opacity-50"
            >
              {editingEntryId ? t('saveChanges') : t('add') + ' ' + t('newEntry').toLowerCase()}
            </button>
          </div>
        </div>
      </Modal>

      {/* AI Analysis Modal */}
      <Modal isOpen={isAiAnalysisModalOpen} onClose={() => setIsAiAnalysisModalOpen(false)} title={t('aiAnalysisTitle')} size="lg">
        {isAiLoading && (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <LoadingSpinner size={48} />
                <p className="text-neutral-dark dark:text-neutral-light">{t('aiAnalysisLoading')}</p>
            </div>
        )}
        {!isAiLoading && aiAnalysisResult && (
            <div className="space-y-4">
                <div className="p-3 bg-neutral-light dark:bg-slate-700 rounded-md max-h-40 overflow-y-auto">
                    <p className="text-xs italic text-neutral-dark/80 dark:text-neutral-light/80">
                        {t('aiAnalysisPlaceholder', analyzedEntryContent.substring(0,150), analyzedEntryContent.length > 150 ? '...' : '')}
                    </p>
                </div>
                <div className="whitespace-pre-wrap text-neutral-dark dark:text-neutral-light leading-relaxed">
                    {aiAnalysisResult}
                </div>
                 <button
                    onClick={() => setIsAiAnalysisModalOpen(false)}
                    className="mt-6 w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md shadow-sm"
                  >
                    {t('close')}
                </button>
            </div>
        )}
         {!isAiLoading && !aiAnalysisResult && (
            <div className="text-center p-8">
                <p className="text-danger dark:text-danger-light">{t('aiAnalysisError')}</p>
                 <button
                    onClick={() => setIsAiAnalysisModalOpen(false)}
                    className="mt-6 px-4 py-2 bg-neutral/30 dark:bg-slate-600 hover:bg-neutral/40 dark:hover:bg-slate-500 text-neutral-dark dark:text-neutral-light rounded-md shadow-sm"
                  >
                    {t('close')}
                </button>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default JournalPage;
