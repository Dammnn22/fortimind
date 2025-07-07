import React, { useState, useEffect } from 'react';
import { User, Crown, Mail, Hash, Calendar, LogOut, Shield, ChevronRight, Loader2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { useLocalization } from '../hooks/useLocalization';
import AnalyticsService from '../services/analyticsService';
import SubscriptionStatusDisplay from './SubscriptionStatusDisplay';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role?: string;
  creationTime?: string;
}

const UserProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLocalization();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Obtener datos adicionales del usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      // Construir perfil completo
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || t('accountEmail'),
        displayName: user.displayName || userData.displayName || t('userProfile'),
        photoURL: user.photoURL || userData.photoURL,
        role: userData.role || 'usuario',
        creationTime: user.metadata.creationTime
      };
      
      setUserProfile(profile);
      
      // Track profile view
      AnalyticsService.trackFeatureUsage('user_profile_view', {
        hasPhoto: !!profile.photoURL,
        role: profile.role
      });
      
    } catch (error) {
      console.error('Error loading user profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      AnalyticsService.trackError('profile_load_error', errorMessage, 'UserProfileSettings');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      
      // Track logout action
      AnalyticsService.trackFeatureUsage('user_logout', {
        from_page: 'profile_settings'
      });
      
      await signOut(auth);
      
    } catch (error) {
      console.error('Error signing out:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      AnalyticsService.trackError('logout_error', errorMessage, 'UserProfileSettings');
      alert(t('profileLoadError'));
    } finally {
      setSigningOut(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('contentToBeAdded');
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return t('contentToBeAdded');
    }
  };

  const getRoleDisplay = (role?: string) => {
    const roleMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      'admin': { 
        label: t('adminPrivileges'), 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: <Crown className="w-4 h-4" />
      },
      'premium': { 
        label: 'Premium', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: <Shield className="w-4 h-4" />
      },
      'usuario': { 
        label: t('userProfile'), 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: <User className="w-4 h-4" />
      }
    };

    const roleData = roleMap[role || 'usuario'] || roleMap['usuario'];
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${roleData.color}`}>
        {roleData.icon}
        {roleData.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-neutral-dark dark:text-white mb-6 flex items-center gap-2">
          <User className="w-5 h-5" />
          {t('userProfileTitle')}
        </h2>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <div className="text-center text-red-600 dark:text-red-400">
          {t('profileLoadError')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-neutral-dark dark:text-white mb-6 flex items-center gap-2">
        <User className="w-5 h-5" />
        {t('userProfileTitle')}
      </h2>
      
      {/* Photo and Basic Info */}
      <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          {userProfile.photoURL ? (
            <img 
              src={userProfile.photoURL} 
              alt="Foto de perfil"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {userProfile.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium text-neutral-dark dark:text-white">
            {userProfile.displayName}
          </h3>
          <div className="mt-2">
            {getRoleDisplay(userProfile.role)}
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="space-y-4 mb-6">
        {/* Email */}
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700">
          <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t('accountEmail')}
            </p>
            <p className="text-sm font-medium text-neutral-dark dark:text-white">
              {userProfile.email}
            </p>
          </div>
        </div>

        {/* UID */}
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700">
          <Hash className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t('userId')}
            </p>
            <p className="text-sm font-mono text-neutral-dark dark:text-white break-all">
              {userProfile.uid}
            </p>
          </div>
        </div>

        {/* Creation Date */}
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700">
          <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t('accountCreated')}
            </p>
            <p className="text-sm font-medium text-neutral-dark dark:text-white">
              {formatDate(userProfile.creationTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Admin Badge (if applicable) */}
      {userProfile.role === 'admin' && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <Crown className="w-5 h-5" />
            <span className="font-medium">{t('adminPrivileges')}</span>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {t('adminPrivilegesDesc')}
          </p>
        </div>
      )}

      {/* Subscription Status */}
      <SubscriptionStatusDisplay 
        showDetails={true}
        className="mb-6"
      />

      {/* Sign Out Button */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
        >
          {signingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          {signingOut ? t('signingOut') : t('signOut')}
        </button>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          FortiMind • Tu aplicación de bienestar personal
        </p>
      </div>
    </div>
  );
};

export default UserProfileSettings;
