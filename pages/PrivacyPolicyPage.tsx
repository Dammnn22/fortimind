import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants';

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useLocalization();
  const pageTitle = t('privacyPolicyTitle');

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-xl space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b dark:border-slate-700 pb-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-dark dark:text-white">{pageTitle}</h1>
        <Link
          to="/settings"
          className="p-2 text-primary dark:text-primary-light hover:bg-primary-light/10 dark:hover:bg-primary-dark/20 rounded-full transition-colors"
          aria-label={t('goBack')}
        >
          <ArrowLeft size={24} />
        </Link>
      </div>
      <div className="prose dark:prose-invert max-w-none text-neutral-dark dark:text-neutral-light">
        <p className="text-sm text-neutral-dark/70 dark:text-neutral-light/70">
          {t('lastUpdated')}: {new Date().toLocaleDateString()} {/* Placeholder Date */}
        </p>

        <h2>{t('privacySection1Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('privacySection1Content')}</p>

        <h2>{t('privacySection2Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <h3>{t('privacyInterpretationTitle')}</h3>
        <p>{t('privacyInterpretationContent')}</p>
        <h3>{t('privacyDefinitionsTitle')}</h3>
        <p>{t('privacyDefinitionsIntro')}</p>
        <ul>
            <li><strong>Account</strong> {t('privacyDefinitionAccount')}</li>
            <li><strong>Company</strong> {t('privacyDefinitionCompany', APP_NAME)}</li>
            <li><strong>Cookies</strong> {t('privacyDefinitionCookies')}</li>
            <li><strong>Country</strong> {t('privacyDefinitionCountry')}</li>
            <li><strong>Device</strong> {t('privacyDefinitionDevice')}</li>
            <li><strong>Personal Data</strong> {t('privacyDefinitionPersonalData')}</li>
            <li><strong>Service</strong> {t('privacyDefinitionService')}</li>
            <li><strong>Service Provider</strong> {t('privacyDefinitionServiceProvider')}</li>
            <li><strong>Usage Data</strong> {t('privacyDefinitionUsageData')}</li>
            <li><strong>Website</strong> {t('privacyDefinitionWebsite', APP_NAME)}</li>
            <li><strong>You</strong> {t('privacyDefinitionYou')}</li>
        </ul>

        <h2>{t('privacySection3Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <h3>{t('privacyTypesDataTitle')}</h3>
        <h4>{t('privacyPersonalDataTitle')}</h4>
        <p>{t('privacyPersonalDataContent')}</p>
        <ul>
            <li>{t('privacyPersonalDataEmail')}</li>
            <li>{t('privacyPersonalDataName')}</li>
            <li>{t('privacyPersonalDataUsage')}</li>
            <li>{t('privacyPersonalDataUserInput')}</li>
            <li>{t('privacyPersonalDataAI')}</li>
        </ul>
        <h4>{t('privacyUsageDataTitle')}</h4>
        <p>{t('privacyUsageDataContent')}</p>
        
        <h2>{t('privacySection4Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('privacyUseContent')}</p>
        <ul>
            <li>{t('privacyUseProvide')}</li>
            <li>{t('privacyUseAccount')}</li>
            <li>{t('privacyUseContract')}</li>
            <li>{t('privacyUseContact')}</li>
            <li>{t('privacyUseNews')}</li>
            <li>{t('privacyUseRequests')}</li>
            <li>{t('privacyUseBusiness')}</li>
            <li>{t('privacyUseOther')}</li>
        </ul>
        <p>{t('contentToBeAdded')}</p>

        <h2>{t('privacySection5Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('privacyStorageContent')}</p>
        
        <h2>{t('privacySection6Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('privacyChildrenContent')}</p>

        <h2>{t('privacySection7Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('privacyLinksContent')}</p>

        <h2>{t('privacySection8Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('privacyChangesContent')}</p>

        <h2>{t('privacySection9Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('privacyContactContent')}</p>
        <ul>
            <li>{t('privacyContactEmail')}</li>
        </ul>

        <p className="mt-8 font-semibold">{t('contentToBeAdded')}</p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
