import React, { useState, useEffect } from 'react'; 
import { Settings as SettingsIcon, Sun, Moon, EyeOff, Eye, User as UserIconLucide, FileText, Bell, BellOff, ChevronRight, Dumbbell, Shield, Zap, Globe, Palette } from 'lucide-react'; 
import type { User } from 'firebase/auth';
import { AppTheme, Language, TranslationKey, UserExerciseChallenge, ExerciseLevel } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useLocalization } from '../../hooks/useLocalization';
import { translations } from '../../translations_clean';
import { Link } from 'react-router-dom';
import { requestNotificationPermissionAndSaveToken, disableNotificationsAndDeleteToken } from '../../services/notificationService';
import UserProfileSettings from '../../components/UserProfileSettings';

interface SettingsPageProps {
  isGuest: boolean;
  firebaseUser: User | null | undefined;
}

const FuturisticSettingsPage: React.FC<SettingsPageProps> = ({ isGuest, firebaseUser }) => {
  const dataSavingDisabled = isGuest || !firebaseUser;

  const [theme, setTheme] = useLocalStorage<AppTheme>('appTheme', AppTheme.LIGHT);
  const { t, setLanguage, currentLanguage } = useLocalization();
  
  const [discreetMode, setDiscreetMode] = useLocalStorage<boolean>('discreetMode', false, { disabled: dataSavingDisabled });
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  
  const exerciseStorageKey = firebaseUser ? `exerciseChallenge_${firebaseUser.uid}` : 'exerciseChallenge_guest';
  const [exerciseChallengeState, setExerciseChallengeState] = useLocalStorage<UserExerciseChallenge>(exerciseStorageKey, { status: 'inactive', level: 'beginner', currentDay: 1, completedDays: [] }, { disabled: dataSavingDisabled });

  useEffect(() => {
    const checkPermission = () => setNotificationPermission(Notification.permission);
    window.addEventListener('focus', checkPermission);
    return () => window.removeEventListener('focus', checkPermission);
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme: AppTheme) => prevTheme === AppTheme.LIGHT ? AppTheme.DARK : AppTheme.LIGHT);
  };

  const handleToggleDiscreetMode = () => {
    if (!dataSavingDisabled) { 
        setDiscreetMode(!discreetMode);
    }
  };

  const handleEnableNotifications = async () => {
    if (firebaseUser) {
      await requestNotificationPermissionAndSaveToken(firebaseUser);
      setNotificationPermission(Notification.permission);
    }
  };
  
  const handleDisableNotifications = async () => {
     if (firebaseUser) {
        await disableNotificationsAndDeleteToken(firebaseUser);
        alert("Notifications disabled. You may need to refresh the page for the browser status to update.");
        setNotificationPermission('default');
     }
  };
  
  const availableLanguages = Object.keys(translations) as Language[];
  const isExerciseChallengeActive = exerciseChallengeState.status === 'active';

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      {/* Fondo animado */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/6 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-magenta-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <SettingsIcon className="text-violet-400 mr-4 animate-pulse" size={40} />
            <h1 className="text-4xl md:text-6xl font-futuristic text-glow-violet">
              CONFIGURACIÓN
            </h1>
            <Zap className="text-cyan-400 ml-4 animate-pulse" size={40} />
          </div>
          <p className="text-xl text-secondary font-futuristic-light">
            Personaliza tu experiencia FortiMind
          </p>
        </div>

        {/* Guest Mode Warning */}
        {isGuest && (
          <div className="glassmorphism glow-yellow p-6 border border-yellow-400">
            <div className="flex items-center space-x-4">
              <UserIconLucide className="text-yellow-400 animate-pulse" size={28} />
              <div>
                <h3 className="font-futuristic text-yellow-400 mb-2">{t('guestModeActiveTitle')}</h3>
                <p className="text-sm text-secondary">{t('guestModeSettingsWarning')}</p>
              </div>
            </div>
          </div>
        )}

        {/* User Profile Section */}
        {!isGuest && firebaseUser && (
          <div className="glassmorphism glow-cyan p-6">
            <UserProfileSettings />
          </div>
        )}

        {/* Appearance Settings */}
        <div className="card-futuristic glow-violet">
          <div className="flex items-center mb-6">
            <Palette className="text-violet-400 mr-3" size={24} />
            <h2 className="text-2xl font-futuristic text-glow-violet">APARIENCIA</h2>
          </div>
          
          <div className="space-y-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 glass-card">
              <div>
                <p className="text-primary font-medium">{t('themeLabel')}</p>
                <p className="text-xs text-muted">Cambia entre modo claro y oscuro</p>
              </div>
              <button 
                onClick={toggleTheme}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-futuristic transition-all duration-300 ${
                  theme === AppTheme.LIGHT 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black glow-yellow' 
                    : 'bg-gradient-to-r from-blue-500 to-violet-500 text-white glow-blue'
                }`}
              >
                {theme === AppTheme.LIGHT ? <Moon size={18} /> : <Sun size={18} />}
                <span>{theme === AppTheme.LIGHT ? 'MODO OSCURO' : 'MODO CLARO'}</span>
              </button>
            </div>

            {/* Language Selection */}
            <div className="flex items-center justify-between p-4 glass-card">
              <div>
                <p className="text-primary font-medium">{t('language')}</p>
                <p className="text-xs text-muted">Selecciona tu idioma preferido</p>
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400" size={16} />
                <select 
                  value={currentLanguage} 
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="input-futuristic pl-10 pr-4 py-3 font-futuristic text-sm"
                >
                  {availableLanguages.map(lang => (
                    <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Discreet Mode */}
            <div className="flex items-center justify-between p-4 glass-card">
              <div>
                <p className="text-primary font-medium">{t('discreetModeLabel')}</p>
                <p className="text-xs text-muted">{t('discreetModeDesc')}</p>
              </div>
              <button 
                onClick={handleToggleDiscreetMode}
                disabled={dataSavingDisabled}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-futuristic transition-all duration-300 ${
                  discreetMode 
                    ? 'bg-gradient-to-r from-magenta-500 to-pink-500 text-white glow-magenta' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-black glow-green'
                } ${dataSavingDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={dataSavingDisabled ? t('guestModeFeatureDisabled') : (discreetMode ? t('discreetModeDisable') : t('discreetModeEnable'))}
              >
                {discreetMode ? <EyeOff size={18} /> : <Eye size={18} />}
                <span>{discreetMode ? 'DESACTIVAR' : 'ACTIVAR'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Challenge Settings */}
        <div className="card-futuristic glow-yellow">
          <div className="flex items-center mb-6">
            <Dumbbell className="text-yellow-400 mr-3" size={24} />
            <h2 className="text-2xl font-futuristic text-glow-yellow">CONFIGURACIÓN DE RETOS</h2>
          </div>
          
          <div className="flex items-center justify-between p-4 glass-card">
            <div>
              <p className="text-primary font-medium">{t('exerciseChallengeLevelLabel' as TranslationKey)}</p>
              <p className="text-xs text-muted">{t('exerciseChallengeLevelDesc' as TranslationKey)}</p>
            </div>
            <div className="relative">
              <select 
                value={exerciseChallengeState.level} 
                onChange={(e) => setExerciseChallengeState((prev: UserExerciseChallenge) => ({ ...prev, level: e.target.value as ExerciseLevel }))}
                disabled={!isExerciseChallengeActive}
                className="input-futuristic pr-12 py-3 font-futuristic text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title={!isExerciseChallengeActive ? t('challengeSettingDisabledTooltip' as TranslationKey) : ''}
              >
                {(['beginner', 'intermediate', 'professional'] as ExerciseLevel[]).map(level => (
                  <option key={level} value={level}>{t(level).toUpperCase()}</option>
                ))}
              </select>
              <Dumbbell className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card-futuristic glow-green">
          <div className="flex items-center mb-6">
            <Bell className="text-green-400 mr-3" size={24} />
            <h2 className="text-2xl font-futuristic text-glow-green">NOTIFICACIONES</h2>
          </div>
          
          <div className="flex items-center justify-between p-4 glass-card">
            <div>
              <p className="text-primary font-medium">{t('pushNotificationsTitle')}</p>
              <p className="text-xs text-muted">{t('pushNotificationsDesc')}</p>
            </div>
            {notificationPermission === 'granted' ? (
              <button 
                onClick={handleDisableNotifications} 
                disabled={dataSavingDisabled}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl font-futuristic bg-gradient-to-r from-red-500 to-pink-500 text-white glow-magenta transition-all duration-300 hover:scale-105"
              >
                <BellOff size={18} />
                <span>DESACTIVAR</span>
              </button>
            ) : notificationPermission === 'denied' ? (
              <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-futuristic text-sm">
                BLOQUEADAS
              </div>
            ) : (
              <button 
                onClick={handleEnableNotifications} 
                disabled={dataSavingDisabled}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl font-futuristic bg-gradient-to-r from-green-500 to-emerald-500 text-black glow-green transition-all duration-300 hover:scale-105"
              >
                <Bell size={18} />
                <span>ACTIVAR</span>
              </button>
            )}
          </div>
        </div>

        {/* Legal Section */}
        <div className="card-futuristic glow-blue">
          <div className="flex items-center mb-6">
            <Shield className="text-blue-400 mr-3" size={24} />
            <h2 className="text-2xl font-futuristic text-glow-blue">LEGAL Y PRIVACIDAD</h2>
          </div>
          
          <div className="space-y-3">
            <Link
              to="/terms-of-service"
              className="flex items-center justify-between p-4 glass-card hover:glow-cyan transition-all duration-300 group"
            >
              <div className="flex items-center space-x-3">
                <FileText className="text-cyan-400 group-hover:animate-pulse" size={20} />
                <span className="text-primary font-medium group-hover:text-cyan-400">{t('viewTermsOfService')}</span>
              </div>
              <ChevronRight className="text-muted group-hover:text-cyan-400 transition-colors" size={20} />
            </Link>
            
            <Link
              to="/privacy-policy"
              className="flex items-center justify-between p-4 glass-card hover:glow-cyan transition-all duration-300 group"
            >
              <div className="flex items-center space-x-3">
                <FileText className="text-cyan-400 group-hover:animate-pulse" size={20} />
                <span className="text-primary font-medium group-hover:text-cyan-400">{t('viewPrivacyPolicy')}</span>
              </div>
              <ChevronRight className="text-muted group-hover:text-cyan-400 transition-colors" size={20} />
            </Link>
            
            <Link
              to="/refund-policy"
              className="flex items-center justify-between p-4 glass-card hover:glow-cyan transition-all duration-300 group"
            >
              <div className="flex items-center space-x-3">
                <FileText className="text-cyan-400 group-hover:animate-pulse" size={20} />
                <span className="text-primary font-medium group-hover:text-cyan-400">{t('viewRefundPolicy')}</span>
              </div>
              <ChevronRight className="text-muted group-hover:text-cyan-400 transition-colors" size={20} />
            </Link>
          </div>
        </div>
        
        {/* Authentication Note */}
        <div className="glassmorphism glow-yellow p-6 border border-yellow-400">
          <div className="flex items-center space-x-4">
            <Shield className="text-yellow-400 animate-pulse" size={28} />
            <div>
              <h3 className="font-futuristic text-yellow-400 mb-2">{t('noteOnAuthenticationTitle')}</h3>
              <p className="text-sm text-secondary">
                Firebase Authentication está activo. Los datos del usuario se gestionan de forma segura mediante Firebase.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="text-cyan-400 animate-pulse" size={20} />
            <span className="font-futuristic text-glow-cyan">
              PERSONALIZA TU EXPERIENCIA. OPTIMIZA TU RENDIMIENTO. SÉ FORTIMIND.
            </span>
            <Zap className="text-cyan-400 animate-pulse" size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuturisticSettingsPage;
