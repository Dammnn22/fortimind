
import React, { useState } from 'react';
import * as fbAuth from 'firebase/auth';
import { auth } from '../firebase';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import { useLocalization } from '../hooks/useLocalization';
import { Mail, KeyRound } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLocalization();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setLoading(true);

    if (!email.trim()) {
      setMessage(t('loginErrorInvalidCredentials')); // Or a more specific "Email is required"
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      await fbAuth.sendPasswordResetEmail(auth, email);
      setMessage(t('resetPasswordSuccessMessage', email));
      setMessageType('success');
      // setEmail(''); // Optionally clear email field on success
    } catch (firebaseError: any) {
      console.error("Password reset error:", firebaseError);
      // Firebase's sendPasswordResetEmail itself usually doesn't error if email doesn't exist,
      // but it can error for invalid email format, network issues, etc.
      if (firebaseError.code === 'auth/invalid-email') {
         setMessage(t('resetPasswordErrorMessage'));
      } else {
         setMessage(t('resetPasswordErrorMessage')); // Keep it generic for other errors
      }
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setEmail('');
    setMessage('');
    setMessageType('');
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title={t('resetPasswordModalTitle')}>
      <form onSubmit={handlePasswordReset} className="space-y-4">
        <p className="text-sm text-neutral-dark/80 dark:text-neutral-light/80">
          {t('resetPasswordInstruction')}
        </p>
        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-neutral-dark dark:text-neutral-light">
            {t('emailAddressLabel')}
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-neutral/70 dark:text-slate-400" aria-hidden="true" />
            </div>
            <input
              id="reset-email"
              name="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-neutral dark:border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-white text-neutral-dark dark:bg-slate-50 dark:text-neutral-dark placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {message && (
          <p className={`text-sm text-center py-1 ${messageType === 'success' ? 'text-success dark:text-success-light' : 'text-danger dark:text-danger-light'}`}>
            {message}
          </p>
        )}

        <div className="flex flex-col sm:flex-row-reverse gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark dark:focus:ring-offset-slate-800 transition-colors disabled:opacity-70"
          >
            {loading ? <LoadingSpinner size={20} className="text-white"/> : <KeyRound size={18} className="mr-2"/>}
            {t('resetPasswordSendButton')}
          </button>
          <button
            type="button"
            onClick={handleCloseModal}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-neutral-dark dark:text-neutral-light bg-neutral/20 dark:bg-slate-700 hover:bg-neutral/30 dark:hover:bg-slate-600 rounded-lg shadow-sm"
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ForgotPasswordModal;
