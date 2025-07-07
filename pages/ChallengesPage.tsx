
import React, { useState, useEffect, useCallback } from 'react';
import { Award, Lock, CheckCircle, Zap, TrendingUp, CalendarDays, AlertCircle } from 'lucide-react';
import type { User } from 'firebase/auth';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ChallengeDefinition, UserChallenge, Badge as BadgeType, TranslationKey, BadgeDefinition, AppNotification, AppNotificationType } from '../types';
import { CHALLENGE_DEFINITIONS, DEFAULT_BADGES_KEYS, XP_REWARDS } from '../constants';
import { useLocalization } from '../hooks/useLocalization';

export interface ChallengesPageProps {
  addXP: (points: number) => void;
  isGuest: boolean;
  firebaseUser: User | null | undefined;
  addNotification: (notificationData: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
}

const ChallengesPage: React.FC<ChallengesPageProps> = ({ addXP, isGuest, firebaseUser, addNotification }) => {
  const { t, currentLanguage } = useLocalization();
  const dataSavingDisabled = isGuest || !firebaseUser;
  const storageKey = firebaseUser ? `userChallenges_${firebaseUser.uid}` : 'userChallenges_guest';
  
  const [userChallenges, setUserChallenges] = useLocalStorage<UserChallenge[]>(storageKey, [], { disabled: dataSavingDisabled });
  const [achievedBadges, setAchievedBadges] = useLocalStorage<BadgeType[]>('achievedBadges', [], { disabled: dataSavingDisabled });
  const [notification, setNotification] = useState<string | null>(null);

  const initializeChallenges = useCallback(() => {
    if (dataSavingDisabled) return;

    setUserChallenges(prevChallenges => {
      let updatedUserChallenges = [...prevChallenges];
      let changed = false;

      CHALLENGE_DEFINITIONS.forEach(def => {
        if (!updatedUserChallenges.find(uc => uc.challengeId === def.id)) {
          updatedUserChallenges.push({
            challengeId: def.id,
            status: 'locked' as const,
            progress: 0,
          });
          changed = true;
        }
      });
      
      const activeChallenge = updatedUserChallenges.find(uc => uc.status === 'active');
      if (!activeChallenge && updatedUserChallenges.length > 0) {
          let firstUnlockableIndex = -1;
          for (let i = 0; i < CHALLENGE_DEFINITIONS.length; i++) {
              const defId = CHALLENGE_DEFINITIONS[i].id;
              const userChallengeForDef = updatedUserChallenges.find(uc => uc.challengeId === defId);
              if (userChallengeForDef && userChallengeForDef.status === 'locked') {
                  const precedingChallenges = CHALLENGE_DEFINITIONS.slice(0, i);
                  const allPrecedingCompleted = precedingChallenges.every(predDef => {
                      const predUserChallenge = updatedUserChallenges.find(uc => uc.challengeId === predDef.id);
                      return predUserChallenge && predUserChallenge.status === 'completed';
                  });
                  if (allPrecedingCompleted) {
                      firstUnlockableIndex = updatedUserChallenges.findIndex(uc => uc.challengeId === defId);
                      break;
                  }
              }
          }
          
          if (firstUnlockableIndex !== -1 && updatedUserChallenges[firstUnlockableIndex]?.status === 'locked') {
               updatedUserChallenges[firstUnlockableIndex] = {
                  ...updatedUserChallenges[firstUnlockableIndex],
                  status: 'active' as const,
                  startDate: new Date().toISOString(),
                  progress: 0,
                  lastDayMarkedDate: undefined,
               };
               changed = true;
          }
      }

      if (changed) {
        return updatedUserChallenges;
      }
      return prevChallenges;
    });
  }, [dataSavingDisabled, setUserChallenges]); 

  useEffect(() => {
    initializeChallenges();
  }, [initializeChallenges]);

  interface HandleMarkDayOutcome {
    nextChallengesState: UserChallenge[];
    notificationMessage: string | null;
    xpToAdd: number;
    badgeToAwardDetails: { badgeDef: BadgeDefinition, newBadge: BadgeType } | null;
    processed: boolean; 
  }
  

  const handleMarkDayComplete = (challengeId: string) => {
    if (dataSavingDisabled) return;

    let outcome: HandleMarkDayOutcome | null = null;

    setUserChallenges(prevUserChallenges => {
      let tempUpdatedChallenges = [...prevUserChallenges];
      let notificationMessage: string | null = null;
      let xpToAddTotal = 0;
      let badgeDetails: { badgeDef: BadgeDefinition, newBadge: BadgeType } | null = null;
      let processedSuccessfully = false;
      let somethingChangedInChallenges = false;

      const challengeIndex = tempUpdatedChallenges.findIndex(uc => uc.challengeId === challengeId && uc.status === 'active');
      if (challengeIndex === -1) {
        outcome = { nextChallengesState: prevUserChallenges, notificationMessage: t('error' as TranslationKey), xpToAdd: 0, badgeToAwardDetails: null, processed: false };
        return prevUserChallenges;
      }

      const currentChallenge = tempUpdatedChallenges[challengeIndex];
      const challengeDef = CHALLENGE_DEFINITIONS.find(def => def.id === currentChallenge.challengeId);

      if (!challengeDef) {
        outcome = { nextChallengesState: prevUserChallenges, notificationMessage: t('error'as TranslationKey), xpToAdd: 0, badgeToAwardDetails: null, processed: false };
        return prevUserChallenges;
      }

      if (currentChallenge.lastDayMarkedDate && new Date(currentChallenge.lastDayMarkedDate).toDateString() === new Date().toDateString()) {
        notificationMessage = t('alreadyMarkedToday');
        outcome = { nextChallengesState: prevUserChallenges, notificationMessage, xpToAdd: 0, badgeToAwardDetails: null, processed: true }; // Processed is true as we handled it
        return prevUserChallenges;
      }

      const newProgress = currentChallenge.progress + 1;
      xpToAddTotal += XP_REWARDS.CHALLENGE_DAY_MARKED;
      notificationMessage = `${t('daySuccessfullyMarked')} (+${XP_REWARDS.CHALLENGE_DAY_MARKED} XP)`;
      somethingChangedInChallenges = true;
      processedSuccessfully = true;

      let updatedChallenge = { ...currentChallenge, progress: newProgress, lastDayMarkedDate: new Date().toISOString() };

      // Add notification for marking day
      addNotification({
        titleKey: 'notificationChallengeDayMarkedTitle',
        messageKey: 'notificationChallengeDayMarkedMessage',
        messageArgs: [newProgress, t(challengeDef.nameKey), XP_REWARDS.CHALLENGE_DAY_MARKED],
        type: AppNotificationType.CHALLENGE_DAY_MARKED,
        icon: 'CalendarDays',
        linkTo: '/challenges'
      });


      if (newProgress >= challengeDef.durationDays) { 
        updatedChallenge.status = 'completed' as const;
        xpToAddTotal += challengeDef.xpReward;
        
        let completionNotification = `${t('challengeCompleted', t(challengeDef.nameKey))} ${t(challengeDef.rewardDescriptionKey)}`;

        if (challengeDef.badgeToAwardId) {
          const badgeDefinition = DEFAULT_BADGES_KEYS.find(b => b.id === challengeDef.badgeToAwardId);
          if (badgeDefinition && !achievedBadges.find(ab => ab.id === badgeDefinition.id)) {
            const newBadge: BadgeType = {
              id: badgeDefinition.id,
              name: t(badgeDefinition.nameKey as TranslationKey),
              description: t(badgeDefinition.descriptionKey as TranslationKey),
              icon: badgeDefinition.icon,
              achievedDate: new Date().toISOString()
            };
            badgeDetails = { badgeDef: badgeDefinition, newBadge };
            completionNotification += `\n${t('challengeBadgeAwarded', t(badgeDefinition.nameKey as TranslationKey))}`;
          }
        }
        notificationMessage = completionNotification;

         // Add notification for challenge completion
        addNotification({
            titleKey: 'notificationChallengeCompletedTitle',
            messageKey: 'notificationChallengeCompletedMessage',
            messageArgs: [t(challengeDef.nameKey), t(challengeDef.rewardDescriptionKey)],
            type: AppNotificationType.CHALLENGE_COMPLETED,
            icon: 'Award',
            linkTo: '/challenges'
        });


        const currentIndexInDefs = CHALLENGE_DEFINITIONS.findIndex(def => def.id === challengeDef.id);
        if (currentIndexInDefs !== -1 && currentIndexInDefs + 1 < CHALLENGE_DEFINITIONS.length) {
          const nextChallengeDef = CHALLENGE_DEFINITIONS[currentIndexInDefs + 1];
          const nextChallengeUserChallenge = tempUpdatedChallenges.find(uc => uc.challengeId === nextChallengeDef.id);
          if (nextChallengeUserChallenge && nextChallengeUserChallenge.status === 'locked') {
             const nextChallengeIndex = tempUpdatedChallenges.findIndex(uc => uc.challengeId === nextChallengeDef.id);
             if (nextChallengeIndex !== -1) { // Check if found
                tempUpdatedChallenges[nextChallengeIndex] = {
                  ...tempUpdatedChallenges[nextChallengeIndex],
                  status: 'active' as const,
                  startDate: new Date().toISOString(),
                  progress: 0,
                  lastDayMarkedDate: undefined,
                };
             }
          }
        }
      }
      
      tempUpdatedChallenges[challengeIndex] = updatedChallenge;
      
      let firstActiveFound = false;
      const finalChallengesState = CHALLENGE_DEFINITIONS.map(def => {
          const userChalIndex = tempUpdatedChallenges.findIndex(uc => uc.challengeId === def.id);
          let userChal = userChalIndex !== -1 ? tempUpdatedChallenges[userChalIndex] : 
                           { challengeId: def.id, status: 'locked' as const, progress: 0 }; 

          if (userChal.status === 'active') {
              if (!firstActiveFound) {
                  firstActiveFound = true;
                  return userChal;
              } else {
                  somethingChangedInChallenges = true; // Mark change if we had to demote an active
                  return { ...userChal, status: 'locked' as const }; 
              }
          }
          return userChal;
      }).filter(Boolean) as UserChallenge[]; // ensure no undefined entries if tempUpdatedChallenges was sparse

      outcome = { 
        nextChallengesState: finalChallengesState, 
        notificationMessage, 
        xpToAdd: xpToAddTotal, 
        badgeToAwardDetails: badgeDetails,
        processed: processedSuccessfully
      };
      
      if (somethingChangedInChallenges || JSON.stringify(finalChallengesState) !== JSON.stringify(prevUserChallenges.filter(pc => CHALLENGE_DEFINITIONS.some(def => def.id === pc.challengeId))) ) {
          return finalChallengesState;
      }
      return prevUserChallenges;
    });

    if (outcome) {
      try {
        if (outcome.notificationMessage) {
          setNotification(outcome.notificationMessage);
        }
        if (outcome.xpToAdd > 0 && !dataSavingDisabled) { // Check dataSavingDisabled for XP
          addXP(outcome.xpToAdd);
        }
        if (outcome.badgeToAwardDetails && !dataSavingDisabled) { // Check dataSavingDisabled for badges
          setAchievedBadges(prevBadges => {
              if (!prevBadges.find(b => b.id === outcome!.badgeToAwardDetails!.badgeDef.id)) {
                  return [...prevBadges, outcome!.badgeToAwardDetails!.newBadge];
              }
              return prevBadges;
          });
        }
      } catch (e: any) {
        console.error("Error during side effects in handleMarkDayComplete:", e);
        setNotification(`${t('error' as TranslationKey)}: ${e.message || 'An unexpected error occurred processing challenge update.'}`);
      }
    }
  };
  
  const startChallenge = (challengeId: string) => {
    if (dataSavingDisabled) return;
    
    const activeChallengeExists = userChallenges.some(uc => uc.status === 'active');
    if (activeChallengeExists) {
        setNotification(t("Complete your active challenge first!" as TranslationKey)); 
        return;
    }

    setUserChallenges(prevUserChallenges => {
      let changed = false;
      const newChallenges = prevUserChallenges.map(uc => {
        if (uc.challengeId === challengeId && uc.status === 'locked') {
          changed = true;
          return { ...uc, status: 'active' as const, startDate: new Date().toISOString(), progress: 0, lastDayMarkedDate: undefined };
        }
        return uc;
      });
      
      if(changed){
        setNotification(t('challengeStarted' as TranslationKey, CHALLENGE_DEFINITIONS.find(c => c.id === challengeId)?.nameKey ? t(CHALLENGE_DEFINITIONS.find(c => c.id === challengeId)!.nameKey) : 'New Challenge'));
        return newChallenges;
      }
      return prevUserChallenges;
    });
  };
  
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const activeUserChallenge = userChallenges.find(uc => uc.status === 'active');
  const activeChallengeDef = activeUserChallenge ? CHALLENGE_DEFINITIONS.find(def => def.id === activeUserChallenge.challengeId) : null;

  const upcomingChallenges = CHALLENGE_DEFINITIONS
    .map(def => {
        const userChal = userChallenges.find(uc => uc.challengeId === def.id);
        return { ...def, userStatus: userChal?.status || 'locked' };
    })
    .filter(chal => chal.userStatus === 'locked' && 
                     (!activeChallengeDef || CHALLENGE_DEFINITIONS.findIndex(d => d.id === chal.id) > CHALLENGE_DEFINITIONS.findIndex(d=> d.id === activeChallengeDef.id))
           )
    .sort((a,b) => CHALLENGE_DEFINITIONS.findIndex(d => d.id === a.id) - CHALLENGE_DEFINITIONS.findIndex(d => d.id === b.id));
        
  const completedUserChallenges = userChallenges.filter(uc => uc.status === 'completed');

  return (
    <div className="space-y-8">
      {notification && (
        <div className={`p-4 rounded-md shadow-md text-white mb-6 ${notification.includes(t('error' as TranslationKey)) || notification.includes(t('alreadyMarkedToday')) || notification.includes('An unexpected error occurred') ? 'bg-danger' : 'bg-success'}`}>
          {notification.split('\n').map((line, index) => <p key={index}>{line}</p>)}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-dark dark:text-white flex items-center">
          <Award size={28} className="mr-3 text-primary dark:text-primary-light" />
          {t('challengesTitle')}
        </h1>
      </div>

      {isGuest && (
        <div className="p-3 bg-yellow-100 dark:bg-yellow-700 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 rounded-md text-sm flex items-center gap-2">
           <AlertCircle size={20} /> {t('challengeGuestModeMessage')}
        </div>
      )}

      {activeChallengeDef && activeUserChallenge && (
        <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl border-2 border-primary dark:border-primary-light">
          <h2 className="text-2xl font-semibold text-primary dark:text-primary-light mb-3">{t('activeChallenge')}</h2>
          <h3 className="text-xl font-bold text-neutral-dark dark:text-white mb-1">{t(activeChallengeDef.nameKey)}</h3>
          <p className="text-sm text-neutral-dark/80 dark:text-neutral-light/80 mb-4">{t(activeChallengeDef.descriptionKey)}</p>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-neutral-dark dark:text-neutral-light mb-1">
              <span>{t('progressLabel')}</span>
              <span>{t('challengeProgress', activeUserChallenge.progress, activeChallengeDef.durationDays)}</span>
            </div>
            <div className="w-full bg-neutral/30 dark:bg-slate-700 rounded-full h-4">
              <div
                className="bg-success h-4 rounded-full transition-all duration-300 ease-out flex items-center justify-center text-xs text-white font-semibold"
                style={{ width: `${(activeUserChallenge.progress / activeChallengeDef.durationDays) * 100}%` }}
                aria-valuenow={(activeUserChallenge.progress / activeChallengeDef.durationDays) * 100}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
              >
                {activeChallengeDef.durationDays > 0 ? ((activeUserChallenge.progress / activeChallengeDef.durationDays) * 100).toFixed(0) + '%' : '0%'}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleMarkDayComplete(activeUserChallenge.challengeId)}
            disabled={dataSavingDisabled || (activeUserChallenge.lastDayMarkedDate && new Date(activeUserChallenge.lastDayMarkedDate).toDateString() === new Date().toDateString())}
            className="w-full px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <CalendarDays size={20} />
            {t('markDayComplete')}
          </button>
          {activeUserChallenge.lastDayMarkedDate && new Date(activeUserChallenge.lastDayMarkedDate).toDateString() === new Date().toDateString() && (
             <p className="text-xs text-center mt-2 text-green-600 dark:text-green-400">{t('alreadyMarkedToday')}</p>
          )}
        </section>
      )}

      {!activeChallengeDef && upcomingChallenges.length > 0 && !dataSavingDisabled && (
         <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
             <h2 className="text-2xl font-semibold text-neutral-dark dark:text-white mb-3">{t('nextChallenge')}</h2>
             <h3 className="text-xl font-bold text-neutral-dark dark:text-neutral-light mb-1">{t(upcomingChallenges[0].nameKey)}</h3>
            <p className="text-sm text-neutral-dark/80 dark:text-neutral-light/80 mb-4">{t(upcomingChallenges[0].descriptionKey)}</p>
             <button
                onClick={() => startChallenge(upcomingChallenges[0].id)}
                disabled={dataSavingDisabled}
                className="w-full px-6 py-3 bg-secondary hover:bg-secondary-dark text-white rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                <TrendingUp size={20} />
                {t('startThisChallenge')}
            </button>
         </section>
      )}
      
       {!activeChallengeDef && upcomingChallenges.length === 0 && completedUserChallenges.length === 0 && !dataSavingDisabled && (
        <div className="text-center py-10 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <Award size={48} className="mx-auto text-neutral dark:text-slate-600 mb-4" />
            <p className="text-xl text-neutral-dark dark:text-neutral-light">{t('startFirstChallenge')}</p>
        </div>
      )}

       {activeChallengeDef && upcomingChallenges.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-neutral-dark dark:text-white mb-4">{t('nextChallenge')}</h2>
          {upcomingChallenges.slice(0,1).map(challengeDef => ( 
            <div key={challengeDef.id} className="bg-neutral-light dark:bg-slate-700/50 p-6 rounded-xl shadow-md opacity-70">
              <div className="flex items-center mb-2">
                <Lock size={20} className="mr-3 text-neutral-dark/60 dark:text-neutral-light/60" />
                <h3 className="text-xl font-bold text-neutral-dark/80 dark:text-neutral-light/80">{t(challengeDef.nameKey)} ({t('challengeLocked')})</h3>
              </div>
              <p className="text-sm text-neutral-dark/70 dark:text-neutral-light/70 mb-2">{t(challengeDef.descriptionKey)}</p>
              <p className="text-xs text-neutral-dark/60 dark:text-neutral-light/60">{t('unlockNextChallengePrompt')}</p>
            </div>
          ))}
        </section>
      )}

      {completedUserChallenges.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-neutral-dark dark:text-white mb-4">{t('completedChallenges')}</h2>
          <div className="space-y-4">
            {completedUserChallenges.map(userChallenge => {
              const challengeDef = CHALLENGE_DEFINITIONS.find(def => def.id === userChallenge.challengeId);
              if (!challengeDef) return null;
              return (
                <div key={userChallenge.challengeId} className="bg-green-50 dark:bg-green-900/30 p-6 rounded-xl shadow-md border border-green-200 dark:border-green-700">
                  <div className="flex items-center mb-2">
                     <CheckCircle size={24} className="mr-3 text-success dark:text-success-light" />
                     <h3 className="text-xl font-bold text-green-700 dark:text-green-300">{t(challengeDef.nameKey)}</h3>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">{t('challengeReward', t(challengeDef.rewardDescriptionKey))}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}
      
       {!activeChallengeDef && upcomingChallenges.length === 0 && completedUserChallenges.length > 0 &&
        CHALLENGE_DEFINITIONS.length === completedUserChallenges.length && (
        <div className="text-center py-10 bg-green-50 dark:bg-green-900/50 p-6 rounded-xl shadow-lg">
            <Award size={48} className="mx-auto text-success dark:text-success-light mb-4" />
            <p className="text-xl font-semibold text-success dark:text-success-light">{t('allChallengesCompleted')}</p>
        </div>
      )}

    </div>
  );
};

export default ChallengesPage;
