
import React from 'react';
import { BarChart3, ShieldCheck, Target, MessageSquareHeart, Repeat, LucideProps } from 'lucide-react';
import type { User } from 'firebase/auth'; // Firebase User type
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Streak, Goal, JournalEntry, Habit } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface StatisticsPageProps {
  isGuest: boolean;
  firebaseUser: User | null | undefined;
}

const StatisticsPage: React.FC<StatisticsPageProps> = ({ isGuest, firebaseUser }) => {
  const dataSavingDisabled = isGuest || !firebaseUser;

  const [streaks] = useLocalStorage<Streak[]>('streaks', [], { disabled: dataSavingDisabled });
  const [goals] = useLocalStorage<Goal[]>('goals', [], { disabled: dataSavingDisabled });
  const [journalEntries] = useLocalStorage<JournalEntry[]>('journalEntries', [], { disabled: dataSavingDisabled });
  const [habits] = useLocalStorage<Habit[]>('habits', [], { disabled: dataSavingDisabled });
  const { t } = useLocalization();

  const calculateStreakDays = (startDate: string, lastRelapseDate?: string): number => {
    const start = new Date(lastRelapseDate || startDate);
    const end = new Date();
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const activeStreaks = streaks.length;
  const longestCurrentStreak = streaks.reduce((max, s) => {
    const days = calculateStreakDays(s.startDate, s.lastRelapseDate);
    return days > max ? days : max;
  }, 0);

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.isCompleted).length;
  const goalCompletionRate = totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(0) : 0;

  const totalJournal = journalEntries.length;
  const totalHabits = habits.length;

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement<LucideProps>; unit?: string; description?: string }> = 
  ({ title, value, icon, unit, description }) => (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg flex items-start space-x-3 sm:space-x-4">
      <div className="p-2 sm:p-3 bg-primary-light/30 dark:bg-primary-dark/30 rounded-full text-primary dark:text-primary-light">
        {React.cloneElement(icon, { size: 20, className: `${icon.props.className || ''} sm:w-6 sm:h-6` })}
      </div>
      <div>
        <p className="text-xs sm:text-sm text-neutral-dark/80 dark:text-neutral-light/80">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-neutral-dark dark:text-white">
          {value} <span className="text-base sm:text-lg font-medium">{unit}</span>
        </p>
        {description && <p className="text-xs text-neutral-dark/70 dark:text-neutral-light/70 mt-1">{description}</p>}
      </div>
    </div>
  );

  const showStats = firebaseUser && !isGuest; // Only show full stats for logged-in users not in guest mode.

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-center space-x-3">
        <BarChart3 className="text-primary dark:text-primary-light w-7 h-7 md:w-8 md:h-8" />
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark dark:text-white">{t('statistics')}</h1>
      </div>

      {isGuest && (
         <div className="p-3 bg-yellow-100 dark:bg-yellow-700 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 rounded-md text-sm">
           {t('guestModeFeatureLimitation')}
        </div>
      )}

      {!showStats && !isGuest && ( /* Message if not guest but also no firebase user somehow (shouldn't happen with ProtectedRoute) */
         <p className="text-center py-10 text-neutral-dark/80 dark:text-neutral-light/80">
            {t('noStatsYet')}
        </p>
      )}

      {showStats && (
        <>
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-neutral-dark dark:text-white">{t('streaksStatsTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              <StatCard title={t('totalActiveStreaks')} value={activeStreaks} icon={<ShieldCheck size={24} />} />
              <StatCard title={t('longestStreakDuration')} value={longestCurrentStreak} unit={t('days').toLowerCase()} icon={<ShieldCheck size={24} />} />
            </div>
            {streaks.length > 0 && (
                <div className="mt-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2 text-neutral-dark dark:text-white">{t('individualStreaks')}</h3>
                    <ul className="space-y-1 max-h-48 overflow-y-auto">
                    {streaks.map(s => (
                        <li key={s.id} className="text-sm text-neutral-dark dark:text-neutral-light">
                            {s.name}: {calculateStreakDays(s.startDate, s.lastRelapseDate)} {t('days').toLowerCase()}
                        </li>
                    ))}
                    </ul>
                </div>
            )}
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-neutral-dark dark:text-white">{t('goalsStatsTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              <StatCard title={t('totalGoalsSet')} value={totalGoals} icon={<Target size={24} />} />
              <StatCard title={t('goalsCompleted')} value={completedGoals} icon={<Target size={24} />} />
              <StatCard title={t('completionRate')} value={goalCompletionRate} unit="%" icon={<Target size={24} />} />
            </div>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-neutral-dark dark:text-white">{t('journalStatsTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              <StatCard title={t('totalJournalEntries')} value={totalJournal} icon={<MessageSquareHeart size={24} />} />
            </div>
          </section>
          
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-neutral-dark dark:text-white">{t('habitsStatsTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              <StatCard title={t('totalHabitsTracked')} value={totalHabits} icon={<Repeat size={24} />} />
            </div>
            {habits.length > 0 && (
                <div className="mt-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2 text-neutral-dark dark:text-white">{t('habitStreaks')}</h3>
                    <ul className="space-y-1 max-h-48 overflow-y-auto">
                    {habits.map(h => (
                        <li key={h.id} className="text-sm text-neutral-dark dark:text-neutral-light">
                            {h.name}: {h.currentStreak} {t('days').toLowerCase()}
                        </li>
                    ))}
                    </ul>
                </div>
            )}
          </section>

          {streaks.length === 0 && goals.length === 0 && journalEntries.length === 0 && habits.length === 0 && (
            <p className="text-center py-10 text-neutral-dark/80 dark:text-neutral-light/80">
                {t('noStatsYet')}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default StatisticsPage;
