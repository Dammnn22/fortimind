import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth'; 
import { auth } from './firebase'; 
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import AITestComponent from './components/AITestComponent'; // New import
import Sidebar from './components/Sidebar';
import AnimatedBackground from './components/AnimatedBackground';
import IntroScreen from './components/IntroScreen';

import DashboardPage from './pages/DashboardPage';
import StreaksPage from './pages/StreaksPage';
import GoalsPage from './pages/GoalsPage';
import FocusPage from './pages/FocusPage';
import SupportPage from './pages/SupportPage';
import LearnPage from './pages/LearnPage';
import JournalPage from './pages/JournalPage';
import SettingsPage from './pages/SettingsPage';
import HabitsPage from './pages/HabitsPage';
import StatisticsPage from './pages/StatisticsPage';
import ChallengesPage from './pages/ChallengesPage';
import ExerciseChallengePage from './pages/ExerciseChallengePage';
import NutritionChallengePage from './pages/NutritionChallengePage'; // New
import ExerciseProgramCreationDemo from './components/ExerciseProgramCreationDemo'; // New automatic program demo
import NutritionChallengeCreationDemo from './components/NutritionChallengeCreationDemo'; // New automatic nutrition demo
import ProgramTestComponent from './components/ProgramTestComponent'; // Test component for QA
import LoginPage from './pages/LoginPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import PayPalTestPage from './pages/PayPalTestPage';
// Importar páginas de suscripción
import SubscriptionPage from './components/SubscriptionPage';
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage';
import SubscriptionCancelPage from './pages/SubscriptionCancelPage';
import PremiumTestComponent from './components/PremiumTestComponent';
import AdminDashboard from './pages/AdminDashboard_clean';
import PruebaConsultas from './src/pages/PruebaConsultas'; // New import
import ConsultasPage from './src/pages/ConsultasPage'; // New import
import ReservaConsultaForm from './src/pages/ReservaConsultaForm'; // New import

// Specialist Dashboard imports
import NutritionDashboard from './components/NutritionDashboard';
import PsychologyDashboard from './components/PsychologyDashboard';
import TrainerDashboard from './components/TrainerDashboard';

import { useLocalStorage } from './hooks/useLocalStorage';
import { AppTheme, UserXP, AppNotificationType } from './types'; 
import { useLocalization } from './hooks/useLocalization';
import FloatingAiButton from './components/FloatingAiButton';
import { useNotifications } from './hooks/useNotifications'; // New
import NotificationListModal from './components/NotificationListModal'; // New
import { listenForForegroundMessages, requestNotificationPermissionAndSaveToken } from './services/notificationService'; // FCM Listener & permission request
import NotificationPermissionModal from './components/NotificationPermissionModal'; // New
import { usePageTracking, useSessionTracking } from './hooks/useAnalytics'; // Analytics tracking


const App: React.FC = () => {
  const [firebaseUser, firebaseLoading, firebaseError] = useAuthState(auth);
  const [isGuestModeActive, setIsGuestModeActive] = useLocalStorage<boolean>('isGuestModeActive', false);
  const [showIntroScreen, setShowIntroScreen] = useState(true);
  
  const [theme, setTheme] = useLocalStorage<AppTheme>('appTheme', AppTheme.LIGHT);
  const { t, currentLanguage } = useLocalization();

  const isDataSavingDisabled = !firebaseUser || isGuestModeActive;
  const [, setUserXP] = useLocalStorage<UserXP>('userXP', 0, { disabled: isDataSavingDisabled });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const navigate = useNavigate(); 
  const location = useLocation(); 

  // 📊 Analytics tracking hooks
  usePageTracking(); // Automatic page view tracking
  useSessionTracking(); // Session engagement tracking

  // Notifications
  const { 
    notifications, 
    addNotification, 
    markAsRead, 
    markAllAsRead,
    clearAllReadNotifications
  } = useNotifications(isGuestModeActive, firebaseUser?.uid);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isNotificationPermissionModalOpen, setIsNotificationPermissionModalOpen] = useState(false); // New state


  useEffect(() => {
    if (theme === AppTheme.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  useEffect(() => {
    if (firebaseUser) {
      setIsGuestModeActive(false);
    }
  }, [firebaseUser, setIsGuestModeActive]);

  // Effect for listening to foreground push notifications
  useEffect(() => {
    if (firebaseUser && !isDataSavingDisabled) {
      const unsubscribe = listenForForegroundMessages((payload) => {
        console.log("Foreground push notification received in App.tsx:", payload);
        if (payload.notification) {
          addNotification({
            type: AppNotificationType.PUSH_NOTIFICATION,
            title: payload.notification.title,
            message: payload.notification.body,
            icon: 'Bell' // Default icon for push notifications
          });
        }
      });
      // Cleanup the listener when the component unmounts or user logs out
      return () => unsubscribe();
    }
  }, [firebaseUser, isDataSavingDisabled, addNotification]);

  // Effect to prompt for notification permission
  useEffect(() => {
    if (firebaseUser && !isGuestModeActive && 'Notification' in window) {
      const dismissed = sessionStorage.getItem('notification_prompt_dismissed');
      // Show prompt if permission is 'default' and it hasn't been dismissed this session
      if (Notification.permission === 'default' && !dismissed) {
        // Delay the prompt slightly to not overwhelm the user on login
        const timer = setTimeout(() => {
          setIsNotificationPermissionModalOpen(true);
        }, 5000); // 5-second delay
        return () => clearTimeout(timer);
      }
    }
  }, [firebaseUser, isGuestModeActive]);


  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === AppTheme.LIGHT ? AppTheme.DARK : AppTheme.LIGHT);
  }, [setTheme]);
  
  const handleContinueAsGuest = async () => {
    if (firebaseUser) {
      await signOut(auth); 
    }
    setIsGuestModeActive(true);
    navigate('/'); 
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsGuestModeActive(false); 
      // Potentially clear notifications on logout if they are not user-specific and persisted by UID
      // clearAllNotifications(); // If useNotifications hook provided this
      navigate('/login');
        } catch (error) {
      console.error("Error signing out: ", error);
      alert(t('errorSigningOut'));
    }
  };
  
  const addXPCallback = useCallback((points: number) => { // Renamed to avoid conflict
    if (isDataSavingDisabled) return; 
    setUserXP(prevXP => prevXP + points);
  }, [setUserXP, isDataSavingDisabled]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        const hamburgerButton = document.getElementById('hamburger-button');
        if (hamburgerButton && hamburgerButton.contains(event.target as Node)) {
          return;
        }
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  const handleEnableNotificationsFromModal = async () => {
    if (firebaseUser) {
      await requestNotificationPermissionAndSaveToken(firebaseUser);
    }
    sessionStorage.setItem('notification_prompt_dismissed', 'true');
    setIsNotificationPermissionModalOpen(false);
  };

  const handleDismissNotificationModal = () => {
    sessionStorage.setItem('notification_prompt_dismissed', 'true');
    setIsNotificationPermissionModalOpen(false);
  };
  
  if (firebaseLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-light dark:bg-neutral-dark">
        <AnimatedBackground isDarkMode={theme === AppTheme.DARK} />
        <LoadingSpinner size={48} />
        <p className="mt-4 text-neutral-dark dark:text-neutral-light">{t('loading')}...</p>
      </div>
    );
  }

  if (showIntroScreen) {
    return (
      <div className="relative h-screen overflow-hidden">
        <AnimatedBackground isDarkMode={theme === AppTheme.DARK} />
        <IntroScreen 
          onComplete={() => setShowIntroScreen(false)}
          isDarkMode={theme === AppTheme.DARK}
        />
      </div>
    );
  }
  
  if (firebaseError) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-light dark:bg-neutral-dark p-4">
        <p className="text-danger dark:text-danger-light text-center">{t('error')}: {firebaseError.message}</p>
        <p className="mt-2 text-neutral-dark dark:text-neutral-light text-center">
            Intenta recargar la página o contacta soporte si el problema persiste.
        </p>
         <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">
            Recargar
        </button>
      </div>
    );
  }

  if (!firebaseUser && !isGuestModeActive && location.pathname !== '/login' && !['/terms-of-service', '/privacy-policy', '/refund-policy'].includes(location.pathname)) {
     return <Navigate to="/login" state={{ from: location }} replace />;
  }


  return (
    <>
      <AnimatedBackground isDarkMode={theme === AppTheme.DARK} />
      <div className="relative z-10 flex min-h-screen font-sans">
        {/* Sidebar responsive */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          theme={theme}
          toggleTheme={toggleTheme}
          isGuestModeActive={isGuestModeActive}
          onLogout={handleLogout}
        />

        {/* Botón hamburguesa solo en móvil */}
        <button
          className="md:hidden fixed top-4 left-4 z-50 bg-white/10 dark:bg-slate-800/10 backdrop-blur-md p-2 rounded-full shadow-lg border border-white/20 dark:border-slate-700/30"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          <MenuIcon size={28} className="text-gray-800 dark:text-white" />
        </button>

        {/* Contenido principal */}
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8">
          <Routes>
            <Route path="/login" element={<LoginPage onContinueAsGuest={handleContinueAsGuest} />} />
            
            {/* Protected Routes - Pass addNotification and addXP to pages that need them */}
            <Route path="/" element={<ProtectedRoute isGuest={isGuestModeActive}><DashboardPage addXP={addXPCallback} isGuest={isGuestModeActive} firebaseUser={firebaseUser} /></ProtectedRoute>} />
            <Route path="/streaks" element={<ProtectedRoute isGuest={isGuestModeActive}><StreaksPage isGuest={isGuestModeActive} firebaseUser={firebaseUser} /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute isGuest={isGuestModeActive}><GoalsPage addXP={addXPCallback} isGuest={isGuestModeActive} firebaseUser={firebaseUser} addNotification={addNotification} /></ProtectedRoute>} />
            <Route path="/habits" element={<ProtectedRoute isGuest={isGuestModeActive}><HabitsPage addXP={addXPCallback} isGuest={isGuestModeActive} firebaseUser={firebaseUser} addNotification={addNotification} /></ProtectedRoute>} />
            <Route path="/focus" element={<ProtectedRoute isGuest={isGuestModeActive}><FocusPage isGuest={isGuestModeActive} firebaseUser={firebaseUser} /></ProtectedRoute>} />
            <Route path="/journal" element={<ProtectedRoute isGuest={isGuestModeActive}><JournalPage addXP={addXPCallback} isGuest={isGuestModeActive} firebaseUser={firebaseUser} /></ProtectedRoute>} />
            <Route path="/statistics" element={<ProtectedRoute isGuest={isGuestModeActive}><StatisticsPage isGuest={isGuestModeActive} firebaseUser={firebaseUser}/></ProtectedRoute>} />
            <Route path="/learn" element={<ProtectedRoute isGuest={isGuestModeActive}><LearnPage isGuest={isGuestModeActive} firebaseUser={firebaseUser}/></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute isGuest={isGuestModeActive}><SupportPage isGuest={isGuestModeActive} firebaseUser={firebaseUser}/></ProtectedRoute>} />
            <Route path="/challenges" element={<ProtectedRoute isGuest={isGuestModeActive}><ChallengesPage addXP={addXPCallback} isGuest={isGuestModeActive} firebaseUser={firebaseUser} addNotification={addNotification} /></ProtectedRoute>} />
            <Route path="/exercise-challenge" element={<ProtectedRoute isGuest={isGuestModeActive}><ExerciseChallengePage addXP={addXPCallback} isGuest={isGuestModeActive} firebaseUser={firebaseUser} /></ProtectedRoute>} />
            <Route path="/nutrition-challenge" element={<ProtectedRoute isGuest={isGuestModeActive}><NutritionChallengePage addXP={addXPCallback} isGuest={isGuestModeActive} firebaseUser={firebaseUser} /></ProtectedRoute>} />
            <Route path="/exercise-programs-demo" element={<ProtectedRoute isGuest={isGuestModeActive}><ExerciseProgramCreationDemo /></ProtectedRoute>} />
            <Route path="/nutrition-challenges-demo" element={<ProtectedRoute isGuest={isGuestModeActive}><NutritionChallengeCreationDemo /></ProtectedRoute>} />
            <Route path="/paypal-test" element={<ProtectedRoute isGuest={isGuestModeActive}><PayPalTestPage /></ProtectedRoute>} />
            <Route path="/program-test" element={<ProtectedRoute isGuest={isGuestModeActive}><ProgramTestComponent /></ProtectedRoute>} />
            <Route path="/ai-test" element={<ProtectedRoute isGuest={isGuestModeActive}><AITestComponent /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute isGuest={isGuestModeActive}><SettingsPage isGuest={isGuestModeActive} firebaseUser={firebaseUser}/></ProtectedRoute>} /> 
            
            {/* Rutas de Suscripción */}
            <Route path="/subscription" element={<ProtectedRoute isGuest={isGuestModeActive}><SubscriptionPage /></ProtectedRoute>} />
            <Route path="/subscription/success" element={<ProtectedRoute isGuest={isGuestModeActive}><SubscriptionSuccessPage /></ProtectedRoute>} />
            <Route path="/subscription/cancel" element={<SubscriptionCancelPage />} />
            <Route path="/premium-test" element={<ProtectedRoute isGuest={isGuestModeActive}><PremiumTestComponent /></ProtectedRoute>} />
            
            {/* Admin Dashboard */}
            <Route path="/admin-dashboard" element={<ProtectedRoute isGuest={isGuestModeActive}><AdminDashboard /></ProtectedRoute>} />
            
            {/* Specialist Dashboards */}
            <Route path="/dashboard-nutricion" element={<ProtectedRoute isGuest={isGuestModeActive}><NutritionDashboard /></ProtectedRoute>} />
            <Route path="/dashboard-psicologia" element={<ProtectedRoute isGuest={isGuestModeActive}><PsychologyDashboard /></ProtectedRoute>} />
            <Route path="/dashboard-entrenador" element={<ProtectedRoute isGuest={isGuestModeActive}><TrainerDashboard /></ProtectedRoute>} />
            
            {/* Public Static Pages */}
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/prueba-consultas" element={<PruebaConsultas />} /> {/* New route */}
            <Route path="/consultas" element={<ProtectedRoute isGuest={isGuestModeActive}><ConsultasPage /></ProtectedRoute>} />
            <Route path="/consultas/reservar" element={<ProtectedRoute isGuest={isGuestModeActive}><ReservaConsultaForm /></ProtectedRoute>} /> {/* New route */}

            <Route path="*" element={<Navigate to={(firebaseUser || isGuestModeActive) ? "/" : "/login"} />} />
          </Routes>
        </main>
      </div>
      {firebaseUser && <FloatingAiButton firebaseUser={firebaseUser} offset="mb-24" />}
      {firebaseUser && !isGuestModeActive && (
        <>
          <NotificationListModal
              isOpen={isNotificationModalOpen}
              onClose={() => setIsNotificationModalOpen(false)}
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onClearAllRead={clearAllReadNotifications}
          />
          <NotificationPermissionModal
              isOpen={isNotificationPermissionModalOpen}
              onClose={handleDismissNotificationModal}
              onEnable={handleEnableNotificationsFromModal}
          />
        </>
      )}
    </>
  );
};

const AppWrapper: React.FC = () => (
  <HashRouter>
    <App /> 
  </HashRouter>
);

export default AppWrapper;
