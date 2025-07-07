
import React, { useState } from 'react';
import { PlusCircle, Edit3, Trash2, Check, Repeat, Zap, Clock } from 'lucide-react';
import type { User } from 'firebase/auth'; // Firebase User type
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Habit, AppNotification } from '../types';
import Modal from '../components/Modal';
import { useLocalization } from '../hooks/useLocalization';
import { XP_REWARDS } from '../constants';

export interface HabitsPageProps {
  addXP: (points: number) => void;
  isGuest: boolean;
  firebaseUser: User | null | undefined;
  addNotification: (notificationData: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
}

const HabitsPage: React.FC<HabitsPageProps> = ({ addXP, isGuest, firebaseUser, addNotification }) => {
  const dataSavingDisabled = isGuest || !firebaseUser;
  const [habits, setHabits] = useLocalStorage<Habit[]>('habits', [], { disabled: dataSavingDisabled });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentHabit, setCurrentHabit] = useState<Partial<Habit> | null>(null);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const { t } = useLocalization();

  const openModalForNew = () => {
    setCurrentHabit({ name: '', frequency: 'daily', currentStreak: 0, notificationTime: '' });
    setEditingHabitId(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (habit: Habit) => {
    setCurrentHabit(habit);
    setEditingHabitId(habit.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentHabit(null);
    setEditingHabitId(null);
  };

  const handleSaveHabit = () => {
    if (dataSavingDisabled || !currentHabit || !currentHabit.name) return;

    const habitData: Habit = {
      id: editingHabitId || crypto.randomUUID(),
      name: currentHabit.name,
      frequency: 'daily', 
      lastCompleted: currentHabit.lastCompleted,
      currentStreak: currentHabit.currentStreak || 0,
      createdAt: editingHabitId ? habits.find(h => h.id === editingHabitId)!.createdAt : new Date().toISOString(),
      notificationTime: currentHabit.notificationTime || undefined,
    };
    
    if (editingHabitId) {
      setHabits(habits.map(h => h.id === editingHabitId ? habitData : h));
    } else {
      setHabits([...habits, habitData]);
    }
    alert(t('habitSaved'));
    closeModal();
  };

  const handleDeleteHabit = (id: string) => {
    if (dataSavingDisabled) return;
    if (window.confirm(t('deleteHabitConfirm'))) { 
        setHabits(habits.filter(h => h.id !== id));
        alert(t('habitDeleted'));
    }
  };

  const isToday = (dateString?: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  const isYesterday = (dateString?: string): boolean => {
    if(!dateString) return false;
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() -1);
    return date.getFullYear() === yesterday.getFullYear() &&
           date.getMonth() === yesterday.getMonth() &&
           date.getDate() === yesterday.getDate();
  }

  const handleToggleHabitCompletion = (id: string) => {
    if (dataSavingDisabled) return;
    setHabits(prevHabits => 
      prevHabits.map(habit => {
        if (habit.id === id) {
          if (isToday(habit.lastCompleted)) { 
            return {
              ...habit,
              lastCompleted: undefined, 
              currentStreak: Math.max(0, habit.currentStreak -1) 
            };
          } else { 
            if (!dataSavingDisabled) { // Check before adding XP
              addXP(XP_REWARDS.HABIT_COMPLETED);
            }
            let newStreak = habit.currentStreak;
            if(isYesterday(habit.lastCompleted) || (!habit.lastCompleted && habit.currentStreak === 0)){ 
                newStreak +=1;
            } else if (habit.lastCompleted && !isYesterday(habit.lastCompleted)) { 
                newStreak = 1; 
            } else { 
                 newStreak = 1;
            }
            return {
              ...habit,
              lastCompleted: new Date().toISOString(),
              currentStreak: newStreak,
            };
          }
        }
        return habit;
      })
    );
  };

  const formatTimeForDisplay = (timeString?: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const sortedHabits = [...habits].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-dark dark:text-white">{t('habits')}</h1>
        <button
          onClick={openModalForNew}
          disabled={dataSavingDisabled}
          className="p-3 bg-primary hover:bg-primary-dark text-white rounded-lg shadow hover:shadow-md transition-all duration-200 flex items-center disabled:opacity-50"
        >
          <PlusCircle size={20} className="mr-2" />
          {t('newHabit')}
        </button>
      </div>

      {isGuest && (
         <div className="p-3 bg-yellow-100 dark:bg-yellow-700 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 rounded-md text-sm">
           {t('guestModeFeatureLimitation')}
        </div>
      )}

      {sortedHabits.length === 0 ? (
        <div className="text-center py-12">
          <Repeat size={64} className="mx-auto text-neutral dark:text-slate-600 mb-4" />
          <p className="text-xl text-neutral-dark dark:text-neutral-light">{t('noHabitsMessage')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedHabits.map(habit => (
            <div
              key={habit.id}
              className={`p-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-between
                          ${isToday(habit.lastCompleted)
                            ? 'bg-green-50 dark:bg-green-900/50' 
                            : 'bg-white dark:bg-slate-800 hover:shadow-xl'}`}
            >
              <div className="flex items-center space-x-4 flex-grow">
                <button 
                    onClick={() => handleToggleHabitCompletion(habit.id)} 
                    disabled={dataSavingDisabled && !isToday(habit.lastCompleted)} // Allow unchecking for guest
                    className={`p-3 rounded-full transition-colors duration-200 ease-in-out disabled:opacity-50
                                ${isToday(habit.lastCompleted) 
                                    ? 'bg-success text-white hover:bg-success-dark' 
                                    : 'bg-neutral/20 dark:bg-slate-700 hover:bg-primary-light dark:hover:bg-primary text-neutral-dark dark:text-neutral-light'}`}
                    aria-label={isToday(habit.lastCompleted) ? t('completedToday') : t('markDone')}
                >
                  {isToday(habit.lastCompleted) ? <Check size={22} /> : <Repeat size={22} />}
                </button>
                <div>
                  <p className={`text-lg font-medium ${isToday(habit.lastCompleted) ? 'text-green-700 dark:text-green-300' : 'text-neutral-dark dark:text-white'}`}>
                    {habit.name}
                  </p>
                  <div className="flex items-center text-xs text-neutral-dark/70 dark:text-neutral-light/70 mt-1">
                    <Zap size={14} className="mr-1 text-yellow-500" />
                    <span>{t('currentHabitStreak')} {habit.currentStreak} {t('days').toLowerCase()}</span>
                    {habit.notificationTime && (
                      <>
                        <span className="mx-2">|</span>
                        <Clock size={14} className="mr-1 text-primary dark:text-primary-light" />
                        <span>{t('habitScheduledAt', formatTimeForDisplay(habit.notificationTime))}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 flex-shrink-0 ml-4">
                <button 
                  onClick={() => openModalForEdit(habit)} 
                  disabled={dataSavingDisabled}
                  className="p-2 text-neutral-dark/70 hover:text-secondary dark:text-neutral-light/70 dark:hover:text-secondary-light transition-colors disabled:opacity-50" 
                  title={t('editHabitModalTitle')}
                 >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteHabit(habit.id)} 
                  disabled={dataSavingDisabled}
                  className="p-2 text-neutral-dark/70 hover:text-danger dark:text-neutral-light/70 dark:hover:text-danger-light transition-colors disabled:opacity-50" 
                  title={t('deleteHabitConfirm')}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingHabitId ? t('editHabitModalTitle') : t('addHabitModalTitle')}>
        <div className="space-y-4">
          <div>
            <label htmlFor="habitName" className="block text-sm font-medium text-neutral-dark dark:text-neutral-light">{t('habitNameLabel')}</label>
            <input
              id="habitName"
              type="text"
              value={currentHabit?.name || ''}
              onChange={e => setCurrentHabit(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-neutral-dark placeholder-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-300"
            />
          </div>
          <div>
            <label htmlFor="notificationTime" className="block text-sm font-medium text-neutral-dark dark:text-neutral-light">{t('habitNotificationTimeLabel')}</label>
            <input
              id="notificationTime"
              type="time"
              value={currentHabit?.notificationTime || ''}
              onChange={e => setCurrentHabit(prev => ({ ...prev, notificationTime: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-neutral-dark dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-neutral-dark dark:text-neutral-light bg-neutral/30 dark:bg-slate-700 hover:bg-neutral/40 dark:hover:bg-slate-600 rounded-md shadow-sm"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={handleSaveHabit}
              disabled={dataSavingDisabled}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md shadow-sm disabled:opacity-50"
            >
              {editingHabitId ? t('saveChanges') : t('add') + ' ' + t('habits').toLowerCase()}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HabitsPage;
