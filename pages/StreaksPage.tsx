
import React, { useState } from 'react';
import { PlusCircle, CalendarIcon } from 'lucide-react';
import type { User } from 'firebase/auth'; // Firebase User type
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Streak } from '../types';
import Modal from '../components/Modal';
import StreakCard from '../components/StreakCard';
import CalendarView from '../components/CalendarView';
import { DEFAULT_STREAK_NAME_KEY } from '../constants';
import { useLocalization } from '../hooks/useLocalization'; 

interface StreaksPageProps {
  isGuest: boolean;
  firebaseUser: User | null | undefined;
}

const StreaksPage: React.FC<StreaksPageProps> = ({ isGuest, firebaseUser }) => {
  const dataSavingDisabled = isGuest || !firebaseUser;
  const [streaks, setStreaks] = useLocalStorage<Streak[]>('streaks', [], { disabled: dataSavingDisabled });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStreak, setCurrentStreak] = useState<Partial<Streak> | null>(null);
  const [editingStreakId, setEditingStreakId] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const { t } = useLocalization(); 

  const openModalForNew = () => {
    setCurrentStreak({ name: t(DEFAULT_STREAK_NAME_KEY), startDate: new Date().toISOString().split('T')[0], targetDays: 0 });
    setEditingStreakId(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (streak: Streak) => {
    setCurrentStreak({ ...streak, startDate: new Date(streak.startDate).toISOString().split('T')[0] });
    setEditingStreakId(streak.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStreak(null);
    setEditingStreakId(null);
  };

  const handleSaveStreak = () => {
    if (dataSavingDisabled || !currentStreak || !currentStreak.name || !currentStreak.startDate) return;

    const streakData: Streak = {
      id: editingStreakId || crypto.randomUUID(),
      name: currentStreak.name,
      startDate: new Date(currentStreak.startDate).toISOString(),
      lastRelapseDate: currentStreak.lastRelapseDate ? new Date(currentStreak.lastRelapseDate).toISOString() : undefined,
      targetDays: currentStreak.targetDays ? Number(currentStreak.targetDays) : undefined,
    };
    
    if (editingStreakId) {
      setStreaks(streaks.map(s => s.id === editingStreakId ? streakData : s));
    } else {
      setStreaks([...streaks, streakData]);
    }
    closeModal();
  };

  const handleDeleteStreak = (id: string) => {
    if (dataSavingDisabled) return;
    if (window.confirm(t('deleteStreakConfirm'))) {
        setStreaks(streaks.filter(s => s.id !== id));
        alert(t('streakDeleted'));
    }
  };
  
  const handleRecordRelapse = (id: string) => {
    if (dataSavingDisabled) return;
    if (window.confirm(t('recordRelapseConfirm'))) {
        setStreaks(streaks.map(s => s.id === id ? { ...s, lastRelapseDate: new Date().toISOString() } : s));
        alert(t('relapseRecorded'));
    }
  };

  const allRelapseDates = streaks.reduce((acc, streak) => {
    if (streak.lastRelapseDate) {
      acc.push(streak.lastRelapseDate);
    }
    return acc;
  }, [] as string[]);


  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-dark dark:text-white">{t('yourStreaks')}</h1>
        <div className="flex items-center space-x-2">
            <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="p-2 sm:p-3 bg-secondary hover:bg-secondary-dark text-white rounded-lg shadow hover:shadow-md transition-all duration-200 flex items-center"
                title={showCalendar ? t('hideRelapseCalendar') : t('showRelapseCalendar')}
            >
                <CalendarIcon className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
            </button>
            <button
                onClick={openModalForNew}
                disabled={dataSavingDisabled}
                className="p-2 sm:p-3 bg-primary hover:bg-primary-dark text-white rounded-lg shadow hover:shadow-md transition-all duration-200 flex items-center text-sm sm:text-base disabled:opacity-50"
            >
                <PlusCircle className="w-[18px] h-[18px] sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                {t('newStreak')}
            </button>
        </div>
      </div>
      
      {isGuest && ( // Show only if guest, not if firebaseUser is null but not guest.
         <div className="p-3 bg-yellow-100 dark:bg-yellow-700 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 rounded-md text-sm">
           {t('guestModeFeatureLimitation')}
        </div>
      )}

      {showCalendar && (
        <div className="my-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-neutral-dark dark:text-white">{t('relapseCalendar')}</h2>
            <p className="text-sm text-neutral-dark/80 dark:text-neutral-light/80 mb-4 whitespace-pre-line">
                {t('relapseCalendarDesc')}
            </p>
            <CalendarView relapseDates={allRelapseDates} />
        </div>
      )}

      {streaks.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon size={64} className="mx-auto text-neutral dark:text-slate-600 mb-4" />
          <p className="text-xl text-neutral-dark dark:text-neutral-light">{t('noStreaksMessage')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {streaks.map(streak => (
            <StreakCard 
                key={streak.id} 
                streak={streak} 
                onDelete={handleDeleteStreak} 
                onEdit={openModalForEdit}
                onRelapse={handleRecordRelapse}
            />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingStreakId ? t('editStreakModalTitle') : t('addStreakModalTitle')}>
        <div className="space-y-4">
          <div>
            <label htmlFor="streakName" className="block text-sm font-medium text-neutral-dark dark:text-neutral-light">{t('streakNameLabel')}</label>
            <input
              type="text"
              id="streakName"
              value={currentStreak?.name || ''}
              onChange={e => setCurrentStreak(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t(DEFAULT_STREAK_NAME_KEY)}
              className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-neutral-dark placeholder-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-300"
            />
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-neutral-dark dark:text-neutral-light">{t('startDateLabel')}</label>
            <input
              type="date"
              id="startDate"
              value={currentStreak?.startDate ? new Date(currentStreak.startDate).toISOString().split('T')[0] : ''}
              onChange={e => setCurrentStreak(prev => ({ ...prev, startDate: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-neutral-dark dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="targetDays" className="block text-sm font-medium text-neutral-dark dark:text-neutral-light">{t('targetDaysLabel')}</label>
            <input
              type="number"
              id="targetDays"
              min="0"
              value={currentStreak?.targetDays || ''}
              onChange={e => setCurrentStreak(prev => ({ ...prev, targetDays: parseInt(e.target.value, 10) || undefined }))}
              className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-neutral-dark placeholder-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-300"
              placeholder={t('targetDaysLabel')}
            />
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
              onClick={handleSaveStreak}
              disabled={dataSavingDisabled}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md shadow-sm disabled:opacity-50"
            >
              {editingStreakId ? t('saveChanges') : t('add') + ' ' + t('streaks').toLowerCase()}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StreaksPage;
