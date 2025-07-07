import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants';

const TermsOfServicePage: React.FC = () => {
  const { t } = useLocalization();
  const pageTitle = t('termsOfServiceTitle');

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

        <h2>{t('termsSection1Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('termsSection1Content', APP_NAME)}</p>
        <p>{t('termsSection1Content2', APP_NAME)}</p>
        

        <h2>{t('termsSection2Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('termsSection2Content', APP_NAME)}</p>

        <h2>{t('termsSection3Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('termsSection3Content')}</p>
        <ul>
          <li>{t('termsRestriction1')}</li>
          <li>{t('termsRestriction2')}</li>
          <li>{t('termsRestriction3')}</li>
          <li>{t('termsRestriction4')}</li>
          <li>{t('termsRestriction5')}</li>
          <li>{t('termsRestriction6')}</li>
          <li>{t('termsRestriction7')}</li>
          <li>{t('termsRestriction8')}</li>
        </ul>
        <p>{t('termsSection3Content2', APP_NAME)}</p>

        <h2>{t('termsSection4Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('termsSection4Content', APP_NAME)}</p>
        <p>{t('termsSection4Content2', APP_NAME)}</p>
        
        <h2>{t('termsSection5Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('termsSection5Content', APP_NAME)}</p>

        <h2>{t('termsSection6Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('termsSection6Content', APP_NAME)}</p>

        <h2>{t('termsSection7Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('termsSection7Content', APP_NAME)}</p>

        <h2>{t('termsSection8Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('termsSection8Content')}</p>

        <h2>{t('termsSection9Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('termsSection9Content', APP_NAME)}</p>

        <h2>{t('termsSection10Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('termsSection10Content', APP_NAME)}</p>

        <h2>{t('termsSection11Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('termsSection11Content', APP_NAME)}</p>

        <h2>{t('termsSection12Title')}</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>{t('termsSection12Content')}</p>
        
        <p className="mt-8 font-semibold">{t('contentToBeAdded')}</p>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
