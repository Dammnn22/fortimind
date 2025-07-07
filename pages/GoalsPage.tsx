
import React, { useState } from 'react';
import { PlusCircle, Edit3, Trash2, Target, CheckCircle, Circle } from 'lucide-react';
import type { User } from 'firebase/auth'; // Firebase User type
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Goal, AppNotification } from '../types';
import Modal from '../components/Modal';
import { useLocalization } from '../hooks/useLocalization';
import { XP_REWARDS } from '../constants';

export interface GoalsPageProps {
  addXP: (points: number) => void;
  isGuest: boolean;
  firebaseUser: User | null | undefined;
  addNotification: (notificationData: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
}

const GoalsPage: React.FC<GoalsPageProps> = ({ addXP, isGuest, firebaseUser, addNotification }) => {
  const dataSavingDisabled = isGuest || !firebaseUser;
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', [], { disabled: dataSavingDisabled });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Partial<Goal> | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const { t, currentLanguage } = useLocalization();

  const openModalForNew = () => {
    setCurrentGoal({ description: '', targetDate: '', isCompleted: false });
    setEditingGoalId(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (goal: Goal) => {
    setCurrentGoal({ ...goal, targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '' });
    setEditingGoalId(goal.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentGoal(null);
    setEditingGoalId(null);
  };

  const handleSaveGoal = () => {
    if (dataSavingDisabled || !currentGoal || !currentGoal.description) return;

    const goalData: Goal = {
      id: editingGoalId || crypto.randomUUID(),
      description: currentGoal.description,
      targetDate: currentGoal.targetDate ? new Date(currentGoal.targetDate).toISOString() : undefined,
      isCompleted: currentGoal.isCompleted || false,
      createdAt: editingGoalId ? goals.find(g => g.id === editingGoalId)!.createdAt : new Date().toISOString(),
    };
    
    const oldGoal = editingGoalId ? goals.find(g => g.id === editingGoalId) : null;

    if (editingGoalId) {
      setGoals(goals.map(g => g.id === editingGoalId ? goalData : g));
    } else {
      setGoals([...goals, goalData]);
    }

    if (!dataSavingDisabled && goalData.isCompleted && (!oldGoal || !oldGoal.isCompleted)) {
      addXP(XP_REWARDS.GOAL_COMPLETED);
      // addNotification({ // Example: Add notification on goal completion
      //   titleKey: 'notificationGoalCompletedTitle',
      //   messageKey: 'notificationGoalCompletedMessage',
      //   messageArgs: [goalData.description, XP_REWARDS.GOAL_COMPLETED],
      //   type: AppNotificationType.GOAL_COMPLETED,
      //   icon: 'Target',
      //   linkTo: '/goals'
      // });
    }
    
    alert(t('goalSaved'));
    closeModal();
  };

  const handleDeleteGoal = (id: string) => {
    if (dataSavingDisabled) return;
    if (window.confirm(t('deleteGoalConfirm'))) {
        setGoals(goals.filter(g => g.id !== id));
        alert(t('goalDeleted'));
    }
  };

  const toggleGoalCompletion = (id: string) => {
    if (dataSavingDisabled) return;
    setGoals(prevGoals => 
        prevGoals.map(g => {
            if (g.id === id) {
                const updatedGoal = { ...g, isCompleted: !g.isCompleted };
                if (!dataSavingDisabled && updatedGoal.isCompleted) { 
                    addXP(XP_REWARDS.GOAL_COMPLETED);
                     // addNotification({ // Example
                      //   titleKey: 'notificationGoalCompletedTitle',
                      //   messageKey: 'notificationGoalCompletedMessage',
                      //   messageArgs: [updatedGoal.description, XP_REWARDS.GOAL_COMPLETED],
                      //   type: AppNotificationType.GOAL_COMPLETED,
                      //   icon: 'Target',
                      //   linkTo: '/goals'
                      // });
                }
                // If unchecking, consider if XP should be removed (not implemented here)
                return updatedGoal;
            }
            return g;
        })
    );
  };

  const sortedGoals = [...goals].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1; 
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); 
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-dark dark:text-white">{t('yourGoals')}</h1>
        <button
          onClick={openModalForNew}
          disabled={dataSavingDisabled}
          className="p-3 bg-primary hover:bg-primary-dark text-white rounded-lg shadow hover:shadow-md transition-all duration-200 flex items-center disabled:opacity-50"
        >
          <PlusCircle size={20} className="mr-2" />
          {t('newGoal')}
        </button>
      </div>

      {isGuest && (
         <div className="p-3 bg-yellow-100 dark:bg-yellow-700 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 rounded-md text-sm">
           {t('guestModeFeatureLimitation')}
        </div>
      )}

      {sortedGoals.length === 0 ? (
        <div className="text-center py-12">
          <Target size={64} className="mx-auto text-neutral dark:text-slate-600 mb-4" />
          <p className="text-xl text-neutral-dark dark:text-neutral-light">{t('noGoalsMessage')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedGoals.map(goal => (
            <div
              key={goal.id}
              className={`p-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-between
                          ${goal.isCompleted 
                            ? 'bg-green-50 dark:bg-green-900/50 opacity-70' 
                            : 'bg-white dark:bg-slate-800 hover:shadow-xl'}`}
            >
              <div className="flex items-center space-x-4 flex-grow">
                <button 
                  onClick={() => toggleGoalCompletion(goal.id)} 
                  className="focus:outline-none disabled:opacity-50"
                  disabled={dataSavingDisabled && !goal.isCompleted} // Allow unchecking for guest, but not checking
                >
                  {goal.isCompleted ? (
                    <CheckCircle size={28} className="text-success dark:text-success-light" />
                  ) : (
                    <Circle size={28} className="text-neutral dark:text-slate-600 hover:text-primary dark:hover:text-primary-light transition-colors" />
                  )}
                </button>
                <div>
                  <p className={`text-lg font-medium ${goal.isCompleted ? 'line-through text-neutral-dark/70 dark:text-neutral-light/70' : 'text-neutral-dark dark:text-white'}`}>
                    {goal.description}
                  </p>
                  {goal.targetDate && (
                    <p className={`text-sm ${goal.isCompleted ? 'text-neutral-dark/60 dark:text-neutral-light/60' : 'text-neutral-dark/80 dark:text-neutral-light/80'}`}>
                      {t('goalTargetDateLabel')}: {new Date(goal.targetDate).toLocaleDateString(currentLanguage)}
                    </p>
                  )}
                </div>
              </div>
              {!goal.isCompleted && (
                <div className="flex space-x-2 flex-shrink-0 ml-4">
                  <button 
                    onClick={() => openModalForEdit(goal)} 
                    className="p-2 text-neutral-dark/70 hover:text-secondary dark:text-neutral-light/70 dark:hover:text-secondary-light transition-colors disabled:opacity-50" 
                    title={t('editGoalModalTitle')}
                    disabled={dataSavingDisabled}
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteGoal(goal.id)} 
                    className="p-2 text-neutral-dark/70 hover:text-danger dark:text-neutral-light/70 dark:hover:text-danger-light transition-colors disabled:opacity-50" 
                    title={t('deleteGoalConfirm')}
                    disabled={dataSavingDisabled}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingGoalId ? t('editGoalModalTitle') : t('add') + ' ' + t('newGoal')}>
        <div className="space-y-4">
          <div>
            <label htmlFor="goalDescription" className="block text-sm font-medium text-neutral-dark dark:text-neutral-light">{t('goalDescriptionLabel')}</label>
            <textarea
              id="goalDescription"
              rows={3}
              value={currentGoal?.description || ''}
              onChange={e => setCurrentGoal(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-neutral-dark placeholder-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-300"
            />
          </div>
          <div>
            <label htmlFor="targetDate" className="block text-sm font-medium text-neutral-dark dark:text-neutral-light">{t('goalTargetDateLabel')}</label>
            <input
              type="date"
              id="targetDate"
              value={currentGoal?.targetDate ? new Date(currentGoal.targetDate).toISOString().split('T')[0] : ''}
              onChange={e => setCurrentGoal(prev => ({ ...prev, targetDate: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-neutral rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-neutral-dark dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
          {editingGoalId && (
             <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-neutral-dark dark:text-neutral-light">
                    <input
                    type="checkbox"
                    checked={currentGoal?.isCompleted || false}
                    onChange={e => setCurrentGoal(prev => ({ ...prev, isCompleted: e.target.checked }))}
                    className="h-4 w-4 text-primary border-neutral dark:border-slate-600 rounded focus:ring-primary dark:bg-slate-700"
                    />
                    <span>{t('markAsCompleted')}</span>
                </label>
            </div>
          )}
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
              onClick={handleSaveGoal}
              disabled={dataSavingDisabled}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md shadow-sm disabled:opacity-50"
            >
              {editingGoalId ? t('saveChanges') : t('add') + ' ' + t('goals').toLowerCase()}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GoalsPage;
