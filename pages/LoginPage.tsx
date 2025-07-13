import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase'; // Ensure this path is correct
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, type UserCredential } from 'firebase/auth';
import { Zap, LogIn, UserPlus, User as UserIcon, Eye, EyeOff, KeyRound, Chrome, Facebook } from 'lucide-react'; // Added Chrome and Facebook icons
import { useLocalization } from '../hooks/useLocalization';
import { APP_NAME } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { loginWithGoogle, loginWithFacebook } from '../services/authService'; // Import social login functions
import AnimatedBackground from '../components/AnimatedBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AppTheme } from '../types';

interface LoginPageProps {
  onContinueAsGuest: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onContinueAsGuest }) => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [theme] = useLocalStorage<AppTheme>('appTheme', AppTheme.LIGHT);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError(t('loginErrorInvalidCredentials'));
      setLoading(false);
      return;
    }

    if (isRegisterMode && password.length < 6) {
        setError(t('registrationErrorPasswordTooShort'));
        setLoading(false);
        return;
    }

    if (isRegisterMode && password !== confirmPassword) {
      setError(t('registrationErrorPasswordMismatch'));
      setLoading(false);
      return;
    }

    try {
      let userCredential: UserCredential;
      if (isRegisterMode) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      if (userCredential.user) {
        navigate(from, { replace: true });
      }
    } catch (firebaseError: any) {
      handleAuthError(firebaseError);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setError('');
    setSocialLoading(provider);
    try {
      const loginFn = provider === 'google' ? loginWithGoogle : loginWithFacebook;
      const userCredential = await loginFn();
      if (userCredential.user) {
        navigate(from, { replace: true });
      }
    } catch (firebaseError: any) {
      handleAuthError(firebaseError);
    } finally {
      setSocialLoading(null);
    }
  };
  
  const handleAuthError = (firebaseError: any) => {
    console.error("Firebase auth error:", firebaseError);
    if (firebaseError.code === 'auth/email-already-in-use') {
      setError(t('registrationErrorEmailExists'));
    } else if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/invalid-email') {
      setError(t('loginErrorInvalidCredentials'));
    } else if (firebaseError.code === 'auth/popup-closed-by-user') {
      setError(t('socialLoginCancelled' as any)); 
    } else if (firebaseError.code === 'auth/account-exists-with-different-credential') {
      setError(t('socialLoginAccountExists' as any));
    } else {
      setError(firebaseError.message); 
    }
  };


  const handleGuestLogin = () => {
    onContinueAsGuest();
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans relative">
        <AnimatedBackground isDarkMode={theme === AppTheme.DARK} />
        
        <div className="w-full max-w-md mx-auto relative z-10">
          <GlassCard size="lg" className="space-y-6">
            <div className="text-center">
              <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {isRegisterMode ? t('registrationPageHeader') : APP_NAME}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {isRegisterMode ? t('registrationFormPrompt') : t('loginFormPrompt')}
              </p>
            </div>

            <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">{t('emailLabel')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                    placeholder={t('emailLabel')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">{t('passwordLabel')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                    placeholder={t('passwordLabel')}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {isRegisterMode && (
                <div>
                  <label htmlFor="confirm-password" className="sr-only">{t('confirmPasswordLabel')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                      placeholder={t('confirmPasswordLabel')}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
                  <p className="text-sm text-red-400 text-center">{error}</p>
                </div>
              )}

              {!isRegisterMode && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordModalOpen(true)}
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {t('forgotPasswordLink')}
                  </button>
                </div>
              )}

              <div>
                <GlassButton
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <LoadingSpinner size={20} className="text-white"/>
                  ) : (
                    <>
                      {isRegisterMode ? <UserPlus size={18} className="mr-2"/> : <LogIn size={18} className="mr-2"/>}
                      {isRegisterMode ? t('createAccountButton') : t('loginButton')}
                    </>
                  )}
                </GlassButton>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/10 text-gray-600 dark:text-gray-300 rounded-full backdrop-blur-sm">
                  {t('orContinueWith')}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <GlassButton
                onClick={() => handleSocialLogin('google')}
                disabled={socialLoading === 'google'}
                variant="ghost"
                size="md"
                className="w-full"
              >
                {socialLoading === 'google' ? (
                  <LoadingSpinner size={20}/>
                ) : (
                  <>
                    <Chrome size={18} className="mr-2"/>
                    {t('signInWithGoogle')}
                  </>
                )}
              </GlassButton>
              
              <GlassButton
                onClick={() => handleSocialLogin('facebook')}
                disabled={socialLoading === 'facebook'}
                variant="ghost"
                size="md"
                className="w-full"
              >
                {socialLoading === 'facebook' ? (
                  <LoadingSpinner size={20}/>
                ) : (
                  <>
                    <Facebook size={18} className="mr-2"/>
                    {t('signInWithFacebook')}
                  </>
                )}
              </GlassButton>
            </div>
            
            <div className="text-center">
              <GlassButton
                onClick={handleGuestLogin}
                variant="ghost"
                size="md"
                className="w-full sm:w-auto"
              >
                {t('continueAsGuest')}
              </GlassButton>
            </div>
          </GlassCard>
          
          <div className="mt-6 text-center">
            <button 
              onClick={toggleMode} 
              className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isRegisterMode ? t('alreadyHaveAccount') : t('dontHaveAccount')}
            </button>
          </div>
        </div>
      </div>
      
      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
      />
    </>
  );
};

export default LoginPage;
