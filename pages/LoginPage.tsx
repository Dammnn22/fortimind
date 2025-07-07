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

interface LoginPageProps {
  onContinueAsGuest: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onContinueAsGuest }) => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-light/20 via-secondary-light/20 to-neutral-light dark:from-neutral-dark dark:via-slate-800 dark:to-slate-900 p-4 font-sans">
        <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <Zap className="w-12 h-12 text-primary dark:text-primary-light mx-auto" />
            <h1 className="text-3xl font-bold text-neutral-dark dark:text-white mt-4">{isRegisterMode ? t('registrationPageHeader') : APP_NAME}</h1>
            <p className="text-neutral-dark/80 dark:text-neutral-light/80 mt-2">{isRegisterMode ? t('registrationFormPrompt') : t('loginFormPrompt')}</p>
          </div>

          <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">{t('emailLabel')}</label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-neutral/70 dark:text-slate-400" />
                  </div>
                  <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-neutral dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-white text-neutral-dark dark:bg-slate-700 dark:text-white"
                      placeholder={t('emailLabel')}
                  />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">{t('passwordLabel')}</label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-neutral/70 dark:text-slate-400" />
                  </div>
                  <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2.5 border border-neutral dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-white text-neutral-dark dark:bg-slate-700 dark:text-white"
                      placeholder={t('passwordLabel')}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-neutral/70 dark:text-slate-400 hover:text-primary">
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
                          <KeyRound className="h-5 w-5 text-neutral/70 dark:text-slate-400" />
                      </div>
                      <input
                          id="confirm-password"
                          name="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="block w-full pl-10 pr-10 py-2.5 border border-neutral dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-white text-neutral-dark dark:bg-slate-700 dark:text-white"
                          placeholder={t('confirmPasswordLabel')}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-neutral/70 dark:text-slate-400 hover:text-primary">
                              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                      </div>
                  </div>
              </div>
            )}

            {error && <p className="text-sm text-center text-danger dark:text-danger-light">{error}</p>}

            {!isRegisterMode && (
              <div className="text-right text-sm">
                  <button
                      type="button"
                      onClick={() => setIsForgotPasswordModalOpen(true)}
                      className="font-medium text-primary dark:text-primary-light hover:underline"
                  >
                      {t('forgotPasswordLink')}
                  </button>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark dark:focus:ring-offset-slate-800 transition-colors disabled:opacity-70"
              >
                {loading ? <LoadingSpinner size={20} className="text-white"/> : (isRegisterMode ? <UserPlus size={18} className="mr-2"/> : <LogIn size={18} className="mr-2"/>)}
                {isRegisterMode ? t('createAccountButton') : t('loginButton')}
              </button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral dark:border-slate-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-neutral-dark/80 dark:text-neutral-light/80">{t('orContinueWith')}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={socialLoading === 'google'}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-neutral dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-neutral-dark dark:text-neutral-light bg-white dark:bg-slate-700 hover:bg-neutral-light dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark dark:focus:ring-offset-slate-800 transition-colors disabled:opacity-70"
              >
                {socialLoading === 'google' ? <LoadingSpinner size={20}/> : <Chrome size={18} className="mr-2"/>}
                {t('signInWithGoogle')}
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                disabled={socialLoading === 'facebook'}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-neutral dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-neutral-dark dark:text-neutral-light bg-white dark:bg-slate-700 hover:bg-neutral-light dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark dark:focus:ring-offset-slate-800 transition-colors disabled:opacity-70"
              >
                {socialLoading === 'facebook' ? <LoadingSpinner size={20}/> : <Facebook size={18} className="mr-2"/>}
                {t('signInWithFacebook')}
              </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full sm:w-auto mt-2 text-sm font-medium text-secondary dark:text-secondary-light hover:underline focus:outline-none"
            >
              {t('continueAsGuest')}
            </button>
          </div>

        </div>
        <div className="mt-6 text-center text-sm">
          <button onClick={toggleMode} className="font-medium text-primary dark:text-primary-light hover:underline">
            {isRegisterMode ? t('alreadyHaveAccount') : t('dontHaveAccount')}
          </button>
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
