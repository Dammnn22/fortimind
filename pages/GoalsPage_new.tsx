import React, { useState } from 'react';
import { PlusCircle, Edit3, Trash2, Target, CheckCircle } from 'lucide-react';
import type { User } from 'firebase/auth';
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

const GoalsPage: React.FC<GoalsPageProps> = ({ addXP, isGuest, firebaseUser, addNotification: _addNotification }) => {
  const dataSavingDisabled = isGuest || !firebaseUser;
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', [], { disabled: dataSavingDisabled });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Partial<Goal> | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const { t } = useLocalization();

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
                }
                return updatedGoal;
            }
            return g;
        })
    );
  };

  const completedGoals = goals.filter(g => g.isCompleted).length;
  const totalGoals = goals.length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="w-8 h-8 text-primary" />
          {t('yourGoals')}
        </h1>
        <button
          onClick={openModalForNew}
          disabled={dataSavingDisabled}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            dataSavingDisabled 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-primary text-white hover:bg-primary-dark'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          {t('newGoal')}
        </button>
      </div>

      {/* Stats */}
      {totalGoals > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{completedGoals}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('goalsCompleted')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalGoals}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('totalGoalsSet')}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('completionRate')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">{t('noGoalsMessage')}</p>
            {!dataSavingDisabled && (
              <button
                onClick={openModalForNew}
                className="text-primary hover:text-primary-dark font-medium"
              >
                {t('newGoal')}
              </button>
            )}
          </div>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              className={`p-4 rounded-lg shadow-md border-l-4 transition-all ${
                goal.isCompleted
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : 'bg-white dark:bg-gray-800 border-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleGoalCompletion(goal.id)}
                    disabled={dataSavingDisabled}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      goal.isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-primary'
                    } ${dataSavingDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {goal.isCompleted && <CheckCircle className="w-4 h-4" />}
                  </button>
                  <div className="flex-1">
                    <h3 className={`font-medium ${goal.isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                      {goal.description}
                    </h3>
                    {goal.targetDate && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Target Date: {new Date(goal.targetDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModalForEdit(goal)}
                    disabled={dataSavingDisabled}
                    className={`p-2 rounded-lg transition-colors ${
                      dataSavingDisabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                    title="Edit Goal"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    disabled={dataSavingDisabled}
                    className={`p-2 rounded-lg transition-colors ${
                      dataSavingDisabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                    }`}
                    title="Delete Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Goal Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingGoalId ? t('editGoalModalTitle') : t('addGoalModalTitle')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('goalDescriptionLabel')}
              </label>
              <input
                type="text"
                value={currentGoal?.description || ''}
                onChange={(e) => setCurrentGoal({ ...currentGoal, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={t('goalDescriptionLabel')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('goalTargetDateLabel')}
              </label>
              <input
                type="date"
                value={currentGoal?.targetDate || ''}
                onChange={(e) => setCurrentGoal({ ...currentGoal, targetDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveGoal}
                disabled={!currentGoal?.description}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentGoal?.description
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {t('saveChanges')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default GoalsPage;
