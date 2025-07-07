
import React from 'react';
import { ShieldAlert, ShieldCheck, Trash2, Edit3, CalendarDays } from 'lucide-react';
import { Streak, TranslationKey } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface StreakCardProps {
  streak: Streak;
  onDelete: (id: string) => void;
  onEdit: (streak: Streak) => void;
  onRelapse: (id: string) => void;
}

const StreakCard: React.FC<StreakCardProps> = ({ streak, onDelete, onEdit, onRelapse }) => {
  const { t, currentLanguage } = useLocalization();

  const calculateDays = (startDate: string, endDate?: string): number => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const currentStreakDays = calculateDays(streak.lastRelapseDate || streak.startDate);
  const totalDays = calculateDays(streak.startDate);
  
  const progressBarWidth = streak.targetDays 
    ? Math.min((currentStreakDays / streak.targetDays) * 100, 100)
    : 0;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-semibold text-primary dark:text-primary-light">{streak.name}</h3>
          <p className="text-sm text-neutral-dark/80 dark:text-neutral-light/80">
            {t('startDateLabel')}: {new Date(streak.startDate).toLocaleDateString(currentLanguage)}
          </p>
          {streak.lastRelapseDate && (
            <p className="text-sm text-neutral-dark/80 dark:text-neutral-light/80">
              {t('relapseLabel' as TranslationKey)}: {new Date(streak.lastRelapseDate).toLocaleDateString(currentLanguage)}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <button onClick={() => onEdit(streak)} className="p-2 text-neutral-dark/70 hover:text-secondary dark:text-neutral-light/70 dark:hover:text-secondary-light transition-colors" title={t('editStreakButtonTitle')}>
            <Edit3 size={18} />
          </button>
          <button onClick={() => onDelete(streak.id)} className="p-2 text-neutral-dark/70 hover:text-danger dark:text-neutral-light/70 dark:hover:text-danger-light transition-colors" title={t('deleteStreakButtonTitle')}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="text-center my-6">
        <p className="text-6xl font-bold text-success dark:text-success-light">{currentStreakDays}</p>
        <p className="text-lg text-neutral-dark dark:text-neutral-light">{t('daysStrong')}</p>
      </div>

      {streak.targetDays && streak.targetDays > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-neutral-dark dark:text-neutral-light mb-1">
            <span>{t('progressLabel')}</span>
            <span>{currentStreakDays} / {streak.targetDays} {t('days').toLowerCase()}</span>
          </div>
          <div className="w-full bg-neutral/70 dark:bg-slate-700 rounded-full h-2.5">
            <div
              className="bg-success dark:bg-success-dark h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressBarWidth}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <p className="text-sm text-neutral-dark/80 dark:text-neutral-light/80 mb-6 text-center">
        {t('totalTimeSober')} {totalDays} {t('days').toLowerCase()}.
      </p>

      <button
        onClick={() => onRelapse(streak.id)}
        className="w-full flex items-center justify-center py-3 px-4 bg-danger hover:bg-danger-dark dark:bg-danger-dark dark:hover:bg-red-700 text-white rounded-lg font-semibold transition-colors duration-200"
      >
        <ShieldAlert size={20} className="mr-2" />
        {t('recordRelapseButton')}
      </button>
    </div>
  );
};

export default StreakCard;
