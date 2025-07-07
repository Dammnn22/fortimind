import React, { useState, useEffect } from 'react'; 
import { Settings as SettingsIcon, Sun, Moon, EyeOff, Eye, User as UserIconLucide, FileText, Bell, BellOff, ChevronRight, Dumbbell } from 'lucide-react'; 
import type { User } from 'firebase/auth';
import { AppTheme, Language, TranslationKey, UserExerciseChallenge, ExerciseLevel } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLocalization } from '../hooks/useLocalization';
import { translations } from '../translations';
import { Link } from 'react-router-dom';
import { requestNotificationPermissionAndSaveToken, disableNotificationsAndDeleteToken } from '../services/notificationService';
import UserProfileSettings from '../components/UserProfileSettings';


interface SettingsPageProps {
  isGuest: boolean;
  firebaseUser: User | null | undefined;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ isGuest, firebaseUser }) => {
  const dataSavingDisabled = isGuest || !firebaseUser;

  const [theme, setTheme] = useLocalStorage<AppTheme>('appTheme', AppTheme.LIGHT); // Theme is global
  const { t, setLanguage, currentLanguage } = useLocalization(); // Language is global
  
  const [discreetMode, setDiscreetMode] = useLocalStorage<boolean>('discreetMode', false, { disabled: dataSavingDisabled });
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  
  const exerciseStorageKey = firebaseUser ? `exerciseChallenge_${firebaseUser.uid}` : 'exerciseChallenge_guest';
  const [exerciseChallengeState, setExerciseChallengeState] = useLocalStorage<UserExerciseChallenge>(exerciseStorageKey, { status: 'inactive', level: 'beginner', currentDay: 1, completedDays: [] }, { disabled: dataSavingDisabled });

  
  // Effect to update permission status if it changes in the browser settings outside the app
  useEffect(() => {
    const checkPermission = () => setNotificationPermission(Notification.permission);
    // You could potentially add a periodic check or check on window focus
    window.addEventListener('focus', checkPermission);
    return () => window.removeEventListener('focus', checkPermission);
  }, []);


  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === AppTheme.LIGHT ? AppTheme.DARK : AppTheme.LIGHT);
  };

  const handleToggleDiscreetMode = () => {
    if (!dataSavingDisabled) { 
        setDiscreetMode(!discreetMode);
    }
  };

  const handleEnableNotifications = async () => {
    if (firebaseUser) {
      const token = await requestNotificationPermissionAndSaveToken(firebaseUser);
      if (token) {
        alert("Notifications enabled successfully!");
      }
      setNotificationPermission(Notification.permission); // Re-check permission after request
    }
  };
  
  const handleDisableNotifications = async () => {
     if (firebaseUser) {
        await disableNotificationsAndDeleteToken(firebaseUser);
        alert("Notifications disabled. You may need to refresh the page for the browser status to update.");
        setNotificationPermission('default'); // Assume it's disabled, browser will eventually report 'default' or 'denied'
     }
  };
  
  const availableLanguages = Object.keys(translations) as Language[];

  const isExerciseChallengeActive = exerciseChallengeState.status === 'active';

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <SettingsIcon size={32} className="text-primary dark:text-primary-light" />
        <h1 className="text-3xl font-bold text-neutral-dark dark:text-white">{t('settings')}</h1>
      </div>

      {isGuest && (
        <div className="p-4 bg-yellow-100 dark:bg-yellow-800 border-l-4 border-yellow-500 dark:border-yellow-400 text-yellow-700 dark:text-yellow-200 rounded-md shadow flex items-center space-x-3">
          <UserIconLucide size={24} className="text-yellow-600 dark:text-yellow-300" />
          <div>
            <p className="font-bold">{t('guestModeActiveTitle')}</p>
            <p className="text-sm">{t('guestModeSettingsWarning')}</p>
          </div>
        </div>
      )}

      {/* User Profile Section - Only show for authenticated users */}
      {!isGuest && firebaseUser && <UserProfileSettings />}

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-neutral-dark dark:text-white mb-4">{t('appearance' as TranslationKey)}</h2>
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-neutral-dark dark:text-neutral-light">{t('themeLabel')}</p>
                <button 
                    onClick={toggleTheme}
                    className="px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors bg-neutral/20 dark:bg-slate-700 hover:bg-neutral/30 dark:hover:bg-slate-600 text-neutral-dark dark:text-neutral-light"
                >
                    {theme === AppTheme.LIGHT ? <Moon size={18} className="mr-2"/> : <Sun size={18} className="mr-2" />}
                    {theme === AppTheme.LIGHT ? t('switchToDarkMode') : t('switchToLightMode')}
                </button>
            </div>
            <div className="flex items-center justify-between">
                <p className="text-neutral-dark dark:text-neutral-light">{t('language')}:</p>
                <select 
                    value={currentLanguage} 
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="px-3 py-2 rounded-md text-sm font-medium border border-neutral dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-dark dark:text-neutral-light focus:ring-primary focus:border-primary"
                >
                    {availableLanguages.map(lang => (
                        <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                    ))}
                </select>
            </div>
             <div className="flex items-center justify-between">
                <div>
                    <p className="text-neutral-dark dark:text-neutral-light">{t('discreetModeLabel')}</p>
                    <p className="text-xs text-neutral-dark/70 dark:text-neutral-light/70">{t('discreetModeDesc')}</p>
                </div>
                <button 
                    onClick={handleToggleDiscreetMode}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors bg-neutral/20 dark:bg-slate-700 hover:bg-neutral/30 dark:hover:bg-slate-600 text-neutral-dark dark:text-neutral-light ${dataSavingDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={dataSavingDisabled}
                    title={dataSavingDisabled ? t('guestModeFeatureDisabled') : (discreetMode ? t('discreetModeDisable') : t('discreetModeEnable'))}
                >
                    {discreetMode ? <EyeOff size={18} className="mr-2"/> : <Eye size={18} className="mr-2" />}
                    {discreetMode ? t('discreetModeDisable') : t('discreetModeEnable')} 
                </button>
            </div>
        </div>
      </div>

       <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-neutral-dark dark:text-white mb-4">{t('challengeSettingsTitle' as TranslationKey)}</h2>
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                 <div>
                    <p className="text-neutral-dark dark:text-neutral-light">{t('exerciseChallengeLevelLabel' as TranslationKey)}</p>
                    <p className="text-xs text-neutral-dark/70 dark:text-neutral-light/70">{t('exerciseChallengeLevelDesc' as TranslationKey)}</p>
                </div>
                <div className="relative" title={!isExerciseChallengeActive ? t('challengeSettingDisabledTooltip' as TranslationKey) : ''}>
                  <select 
                      value={exerciseChallengeState.level} 
                      onChange={(e) => setExerciseChallengeState(prev => ({ ...prev, level: e.target.value as ExerciseLevel }))}
                      disabled={!isExerciseChallengeActive}
                      className="px-3 py-2 rounded-md text-sm font-medium border border-neutral dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-dark dark:text-neutral-light focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed appearance-none pr-8"
                  >
                      {(['beginner', 'intermediate', 'professional'] as ExerciseLevel[]).map(level => (
                          <option key={level} value={level}>{t(level)}</option>
                      ))}
                  </select>
                  <Dumbbell size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-dark/50 dark:text-neutral-light/50 pointer-events-none"/>
                </div>
            </div>
        </div>
      </div>

       <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-neutral-dark dark:text-white mb-4">{t('notifications')}</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-dark dark:text-neutral-light">{t('pushNotificationsTitle')}</p>
              <p className="text-xs text-neutral-dark/70 dark:text-neutral-light/70">{t('pushNotificationsDesc')}</p>
            </div>
            {notificationPermission === 'granted' ? (
              <button onClick={handleDisableNotifications} className="px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-300" disabled={dataSavingDisabled}>
                <BellOff size={18} className="mr-2" />
                {t('disablePushNotifications')}
              </button>
            ) : notificationPermission === 'denied' ? (
              <p className="text-sm font-medium text-danger dark:text-danger-light">{t('notificationsBlocked')}</p>
            ) : (
              <button onClick={handleEnableNotifications} className="px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-900 text-green-700 dark:text-green-300" disabled={dataSavingDisabled}>
                <Bell size={18} className="mr-2" />
                {t('enablePushNotifications')}
              </button>
            )}
          </div>
        </div>
       </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-neutral-dark dark:text-white mb-4">{t('legalSectionTitle')}</h2>
        <div className="space-y-3">
          <Link
            to="/terms-of-service"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-light/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText size={20} className="text-primary dark:text-primary-light" />
              <span className="text-neutral-dark dark:text-neutral-light">{t('viewTermsOfService')}</span>
            </div>
            <ChevronRight size={20} className="text-neutral-dark/50 dark:text-neutral-light/50" />
          </Link>
          <Link
            to="/privacy-policy"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-light/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText size={20} className="text-primary dark:text-primary-light" />
              <span className="text-neutral-dark dark:text-neutral-light">{t('viewPrivacyPolicy')}</span>
            </div>
            <ChevronRight size={20} className="text-neutral-dark/50 dark:text-neutral-light/50" />
          </Link>
          <Link
            to="/refund-policy"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-light/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText size={20} className="text-primary dark:text-primary-light" />
              <span className="text-neutral-dark dark:text-neutral-light">{t('viewRefundPolicy')}</span>
            </div>
            <ChevronRight size={20} className="text-neutral-dark/50 dark:text-neutral-light/50" />
          </Link>
        </div>
      </div>
      
       <div className="bg-yellow-100 dark:bg-yellow-800 p-6 rounded-xl shadow-lg border-l-4 border-yellow-500 dark:border-yellow-400">
        <h2 className="text-xl font-semibold text-yellow-700 dark:text-yellow-200 mb-2">{t('noteOnAuthenticationTitle')}</h2>
        <p className="text-sm text-yellow-600 dark:text-yellow-100">
          {/* Updated message or keep as is, Firebase handles real auth now. */}
          {t('noteOnAuthenticationTitle')}: Firebase Authentication is now active. User data is managed securely by Firebase.
        </p>
      </div>

    </div>
  );
};

export default SettingsPage;