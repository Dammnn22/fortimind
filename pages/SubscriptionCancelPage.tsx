import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';

const SubscriptionCancelPage: React.FC = () => {
  const { t } = useLocalization();
  
  return (
    <div className="subscription-cancel-page">
      <div className="cancel-container">
        <div className="cancel-icon">❌</div>
        <h1>{t('subscriptionCanceledTitle')}</h1>
        <p>{t('subscriptionCanceledMessage')}</p>
        
        <div className="cancel-message">
          <p>{t('noChargeMessage')}</p>
          <p>{t('canTryAgainMessage')}</p>
        </div>

        <div className="benefits-reminder">
          <h3>{t('rememberBenefitsTitle')}</h3>
          <ul>
            <li>{t('premiumBenefitRocket')}</li>
            <li>{t('premiumBenefitRobot')}</li>
            <li>{t('premiumBenefitMuscle')}</li>
            <li>{t('premiumBenefitSalad')}</li>
            <li>{t('premiumBenefitChart')}</li>
            <li>{t('premiumBenefitTarget')}</li>
          </ul>
        </div>

        <div className="action-buttons">
          <Link to="/subscription" className="btn btn-primary">
            {t('tryAgain')}
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            {t('backToDashboard')}
          </Link>
        </div>

        <div className="help-section">
          <p>{t('subscriptionQuestions')}</p>
          <Link to="/support" className="btn btn-outline">
            {t('contactSupport')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancelPage; 