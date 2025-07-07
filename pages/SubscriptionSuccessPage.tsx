import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocalization } from '../hooks/useLocalization';

const SubscriptionSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t } = useLocalization();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('');

  const subscriptionId = searchParams.get('subscription_id');

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!subscriptionId) {
        setSubscriptionStatus('error');
        setIsLoading(false);
        return;
      }

      try {
        // Aquí podrías verificar el estado de la suscripción
        // llamando a una Firebase Function si es necesario
        setSubscriptionStatus('success');
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setSubscriptionStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, [subscriptionId]);

  if (isLoading) {
    return (
      <div className="subscription-success-page">
        <div className="loading-container">
          <div className="loading-spinner">{t('loading')}...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-success-page">
      <div className="success-container">
        {subscriptionStatus === 'success' ? (
          <>
            <div className="success-icon">✅</div>
            <h1>{t('subscriptionSuccessTitle')}</h1>
            <p>{t('subscriptionSuccessMessage')}</p>
            
            <div className="subscription-details">
              <h3>{t('subscriptionDetailsTitle')}</h3>
              <p><strong>{t('subscriptionIdLabel')}</strong> {subscriptionId}</p>
              <p><strong>{t('subscriptionStatusLabel')}</strong> {t('subscriptionStatusActive')}</p>
              <p><strong>{t('subscriptionUserLabel')}</strong> {user?.email}</p>
            </div>

            <div className="premium-benefits">
              <h3>{t('premiumBenefitsTitle')}</h3>
              <ul>
                <li>{t('premiumBenefitCompleteAccess')}</li>
                <li>{t('premiumBenefitUnlimitedAI')}</li>
                <li>{t('premiumBenefitPersonalizedExercise')}</li>
                <li>{t('premiumBenefitAdvancedNutrition')}</li>
                <li>{t('premiumBenefitDetailedStats')}</li>
                <li>{t('premiumBenefitPrioritySupport')}</li>
              </ul>
            </div>

            <div className="action-buttons">
              <Link to="/dashboard" className="btn btn-primary">
                {t('goToDashboard')}
              </Link>
              <Link to="/settings" className="btn btn-secondary">
                {t('manageSubscription')}
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="error-icon">❌</div>
            <h1>{t('subscriptionErrorTitle')}</h1>
            <p>{t('subscriptionErrorMessage')}</p>
            
            <div className="error-details">
              <p>{t('subscriptionErrorContact')}</p>
              <p>{t('subscriptionIdLabel')} {subscriptionId || t('subscriptionIdNotAvailable')}</p>
            </div>

            <div className="action-buttons">
              <Link to="/subscription" className="btn btn-primary">
                {t('tryAgain')}
              </Link>
              <Link to="/support" className="btn btn-secondary">
                {t('contactSupport')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage; 