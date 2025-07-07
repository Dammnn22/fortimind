
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Target, Zap, MessageSquareHeart, Award, PlayCircle, Repeat, BarChart3, UserCheck, AlertCircle, User as UserIconLucide, LucideProps, Leaf } from 'lucide-react'; // Renamed User to UserIconLucide, added Leaf
import * as fbAuth from 'firebase/auth'; // Firebase User type
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Streak, Goal, JournalEntry, Badge as BadgeType, UserXP } from '../types';
import { DEFAULT_BADGES_KEYS, XP_REWARDS } from '../constants';
import BadgeDisplay from '../components/BadgeDisplay';
import { useLocalization } from '../hooks/useLocalization';

interface DashboardPageProps {
  addXP: (points: number) => void; 
  isGuest: boolean; // Changed from isGuestMode
  firebaseUser: fbAuth.User | null | undefined; // Added firebaseUser prop
}

const DashboardPage: React.FC<DashboardPageProps> = ({ addXP, isGuest, firebaseUser }) => {
  const dataSavingDisabled = isGuest || !firebaseUser;

  const [streaks] = useLocalStorage<Streak[]>('streaks', [], { disabled: dataSavingDisabled });
  const [goals] = useLocalStorage<Goal[]>('goals', [], { disabled: dataSavingDisabled });
  const [journalEntries] = useLocalStorage<JournalEntry[]>('journalEntries', [], { disabled: dataSavingDisabled });
  const [achievedBadges, setAchievedBadges] = useLocalStorage<BadgeType[]>('achievedBadges', [], { disabled: dataSavingDisabled });
  
  const [userXP] = useLocalStorage<UserXP>('userXP', 0, { disabled: dataSavingDisabled }); 
  const [discreetMode] = useLocalStorage<boolean>('discreetMode', false, { disabled: dataSavingDisabled });

  const { t, currentLanguage } = useLocalization();
  const [showJournalPrompt, setShowJournalPrompt] = useState(false);

  useEffect(() => {
    if (dataSavingDisabled) { // Use combined check
        setShowJournalPrompt(false); 
        return;
    }
    if (journalEntries.length > 0) {
      const lastEntryDate = new Date(journalEntries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date);
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      setShowJournalPrompt(lastEntryDate < oneDayAgo);
    } else {
      setShowJournalPrompt(true); 
    }
  }, [journalEntries, dataSavingDisabled]);

  React.useEffect(() => {
    if (dataSavingDisabled) {
        setAchievedBadges([]); 
        return;
    }
    const allBadgesAsBadgeType: BadgeType[] = DEFAULT_BADGES_KEYS.map((badgeDef): BadgeType => {
      const existingAchieved = achievedBadges.find(ab => ab.id === badgeDef.id);
      if (existingAchieved) {
        return {
            ...existingAchieved,
            name: t(badgeDef.nameKey), 
            description: t(badgeDef.descriptionKey),
        };
      }

      let newlyAchieved = false;
      if (badgeDef.requiredDays !== undefined) {
        const days = badgeDef.requiredDays;
        newlyAchieved = streaks.some(s => {
          const startDate = new Date(s.lastRelapseDate || s.startDate);
          const endDate = new Date();
          const sDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          const eDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
          const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= days;
        });
      } else if (badgeDef.requiredGoals !== undefined) {
        const count = badgeDef.requiredGoals;
        newlyAchieved = goals.filter(g => g.isCompleted).length >= count;
      } else if (badgeDef.requiredEntries !== undefined) {
        const count = badgeDef.requiredEntries;
        newlyAchieved = journalEntries.length >= count;
      }
      
      const name = t(badgeDef.nameKey);
      const description = t(badgeDef.descriptionKey);

      if (newlyAchieved) {
        return { 
          id: badgeDef.id, 
          name, 
          description, 
          icon: badgeDef.icon, 
          achievedDate: new Date().toISOString() 
        };
      }
      
      return { 
        id: badgeDef.id, 
        name, 
        description, 
        icon: badgeDef.icon, 
        achievedDate: undefined
      };
    });
    
    const trulyAchievedBadges = allBadgesAsBadgeType.filter(b => b.achievedDate);
    
    const currentAchievedIds = achievedBadges.map(b => b.id).sort();
    const newAchievedIds = trulyAchievedBadges.map(b => b.id).sort();

    if (JSON.stringify(currentAchievedIds) !== JSON.stringify(newAchievedIds) || 
        achievedBadges.some(ab => {
            const badgeDef = DEFAULT_BADGES_KEYS.find(bk => bk.id === ab.id);
            return badgeDef ? ab.name !== t(badgeDef.nameKey) : false;
        }) 
    ) {
        setAchievedBadges(trulyAchievedBadges);
    }
  }, [streaks, goals, journalEntries, achievedBadges, setAchievedBadges, t, currentLanguage, dataSavingDisabled]);

  const getActiveStreaksCount = () => streaks.length; 
  const getOngoingGoalsCount = () => goals.filter(g => !g.isCompleted).length;

  const QuickActionCard: React.FC<{ title: string; icon: React.ReactElement<LucideProps>; to: string; count?: number; description: string }> = ({ title, icon, to, count, description }) => (
    <Link to={to} className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col justify-between">
      <div>
        <div className="flex items-center text-primary dark:text-primary-light mb-2 sm:mb-3">
          {React.cloneElement(icon, { size: 24, className: `${icon.props.className || ''} sm:w-7 sm:h-7` })}
          <h3 className="ml-3 text-lg sm:text-xl font-semibold text-neutral-dark dark:text-white">{title}</h3>
        </div>
        <p className="text-xs sm:text-sm text-neutral-dark/80 dark:text-neutral-light/80 mb-3 sm:mb-4">{description}</p>
      </div>
      {(typeof count !== 'undefined' && !discreetMode) && (
        <p className="text-2xl sm:text-3xl font-bold text-secondary dark:text-secondary-light mt-auto">{count}</p>
      )}
       {(typeof count !== 'undefined' && discreetMode) && (
        <p className="text-2xl sm:text-3xl font-bold text-secondary dark:text-secondary-light mt-auto"><UserCheck size={28} className="sm:w-7 sm:h-7"/></p>
      )}
    </Link>
  );
  
  const latestStreak = streaks.length > 0 ? streaks.reduce((latest, current) => new Date(latest.startDate) > new Date(current.startDate) ? latest : current) : null;
  const currentStreakDays = latestStreak ? Math.floor((new Date().getTime() - new Date(latestStreak.lastRelapseDate || latestStreak.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-6 md:space-y-8">
      {isGuest && (
        <div className="p-4 bg-yellow-100 dark:bg-yellow-800 border-l-4 border-yellow-500 dark:border-yellow-400 text-yellow-700 dark:text-yellow-200 rounded-md shadow flex items-center space-x-3">
          <UserIconLucide size={24} className="text-yellow-600 dark:text-yellow-300" />
          <div>
            <p className="font-bold">{t('guestModeActiveTitle')}</p>
            <p className="text-sm">{t('guestModeWarning')}</p>
          </div>
        </div>
      )}

      <div className="p-6 md:p-8 bg-gradient-to-r from-primary to-secondary dark:from-primary-dark dark:to-secondary-dark rounded-xl shadow-2xl text-white">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {firebaseUser ? `${t('welcomeBack')}${firebaseUser.displayName ? `, ${firebaseUser.displayName}` : ''}!` : t('welcomeGuest')}
                </h1>
                <p className="text-base md:text-lg opacity-90">{t('readyMessage')}</p>
            </div>
            {firebaseUser && !isGuest && (
                <div className="text-right">
                    <p className="text-xs md:text-sm opacity-80">{t('totalXP')}</p>
                    <p className="text-2xl md:text-3xl font-bold">{userXP}</p>
                </div>
            )}
        </div>
        {latestStreak && !discreetMode && firebaseUser && !isGuest && (
             <p className="mt-4 text-xl md:text-2xl font-semibold">
                {t('currentLongestStreak')}{' '}
                <span className="text-yellow-300">{currentStreakDays}</span> {t('days')}
            </p>
        )}
      </div>

      {showJournalPrompt && firebaseUser && !isGuest && (
        <div className="p-4 bg-yellow-100 dark:bg-yellow-800 border-l-4 border-yellow-500 dark:border-yellow-400 text-yellow-700 dark:text-yellow-200 rounded-md shadow flex items-center space-x-3">
          <AlertCircle size={24} />
          <p>{t('timeToJournalPrompt')} <Link to="/journal" className="font-semibold underline hover:text-yellow-800 dark:hover:text-yellow-100">{t('journal')}</Link></p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <QuickActionCard title={discreetMode && firebaseUser ? t('progress') : t('streaks')} icon={<ShieldCheck size={28} />} to="/streaks" count={getActiveStreaksCount()} description={t('quickActionStreaksDesc')} />
        <QuickActionCard title={t('goals')} icon={<Target size={28} />} to="/goals" count={getOngoingGoalsCount()} description={t('quickActionGoalsDesc')} />
        <QuickActionCard title={t('habits')} icon={<Repeat size={28} />} to="/habits" description={t('quickActionHabitsDesc')} />
        <QuickActionCard title={t('focusMode')} icon={<Zap size={28} />} to="/focus" description={t('quickActionFocusDesc')} />
        <QuickActionCard title={t('journal')} icon={<MessageSquareHeart size={28} />} to="/journal" description={t('quickActionJournalDesc')} />
        <QuickActionCard title={t('statistics')} icon={<BarChart3 size={28} />} to="/statistics" description={t('quickActionStatisticsDesc')} />
        <QuickActionCard title={t('learn')} icon={<PlayCircle size={28} />} to="/learn" description={t('quickActionLearnDesc')} />
        <QuickActionCard title={t('support')} icon={<Award size={28} />} to="/support" description={t('quickActionSupportDesc')} />
        <QuickActionCard title={t('nutritionChallenge' as any)} icon={<Leaf size={28} />} to="/nutrition-challenge" description={t('quickActionNutritionDesc' as any)} />
      </div>

      {firebaseUser && !isGuest && (
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-neutral-dark dark:text-white">{t('yourBadges')}</h2>
          {DEFAULT_BADGES_KEYS.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {DEFAULT_BADGES_KEYS.map(badgeDefKey => {
                const achievedVersion = achievedBadges.find(ab => ab.id === badgeDefKey.id);
                const displayBadge: BadgeType = {
                    id: badgeDefKey.id,
                    name: t(badgeDefKey.nameKey),
                    description: t(badgeDefKey.descriptionKey),
                    icon: badgeDefKey.icon,
                    achievedDate: achievedVersion ? achievedVersion.achievedDate : undefined,
                };
                return (
                  <BadgeDisplay 
                    key={displayBadge.id} 
                    badge={displayBadge} 
                    achieved={!!achievedVersion} 
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-neutral-dark/80 dark:text-neutral-light/80 p-6 bg-white dark:bg-slate-800 rounded-lg shadow text-center">
              {t('noBadgesYet')}
            </p>
          )}
           {DEFAULT_BADGES_KEYS.length > 0 && achievedBadges.length === 0 && (
              <p className="mt-4 text-sm text-center text-neutral-dark/70 dark:text-neutral-light/70">
                  {t('unlockMoreBadges')}
              </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
