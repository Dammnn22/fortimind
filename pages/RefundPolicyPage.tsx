
import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants';

const RefundPolicyPage: React.FC = () => {
  const { t } = useLocalization();
  const pageTitle = t('refundPolicyTitle');

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

        <h2>1. Introduction</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>Thank you for choosing {APP_NAME}. This policy outlines the terms under which refunds may be issued for any subscription services or paid features offered through our application.</p>
        <p>As {APP_NAME} currently does not offer paid subscriptions or features, this Refund Policy is provided for future reference and will become effective if and when such services are introduced.</p>

        <h2>2. Subscription Services (Future)</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>If {APP_NAME} introduces subscription-based services in the future:</p>
        <ul>
          <li><strong>Subscription Period:</strong> Subscriptions may be offered on a monthly or annual basis. Details of subscription periods will be provided at the time of purchase.</li>
          <li><strong>Billing:</strong> You will be billed in advance on a recurring and periodic basis (such as monthly or annually), depending on the type of subscription plan you select when purchasing the subscription.</li>
          <li><strong>Cancellation:</strong> You may cancel Your Subscription renewal either through Your Account settings page or by contacting Us. You will not receive a refund for the fees You already paid for Your current Subscription period and You will be able to access the Service until the end of Your current Subscription period.</li>
        </ul>

        <h2>3. Refund Eligibility (Future)</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>Generally, all purchases for digital services, once accessed or used, are non-refundable. However, we may consider refunds on a case-by-case basis under the following circumstances, subject to our discretion:</p>
        <ul>
            <li>Technical issues preventing access to the paid service that we are unable to resolve within a reasonable timeframe.</li>
            <li>Billing errors resulting in overcharges.</li>
            <li>Specific refund guarantees offered at the time of purchase for certain promotions or plans.</li>
        </ul>
        <p>Refunds will not typically be granted for:</p>
        <ul>
            <li>Change of mind after purchasing a subscription.</li>
            <li>Unused portion of a subscription period if you cancel early (you will retain access until the end of the paid period).</li>
            <li>Failure to cancel a subscription before the renewal date.</li>
        </ul>

        <h2>4. How to Request a Refund (Future)</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>To request a refund, please contact our support team at [Your Support Email - to be added] with the following information:</p>
        <ul>
            <li>Your account email address.</li>
            <li>Date of purchase.</li>
            <li>Reason for the refund request.</li>
            <li>Any relevant transaction IDs or receipts.</li>
        </ul>
        <p>We aim to process refund requests within [Number] business days. Approved refunds will be processed back to the original method of payment, where possible.</p>

        <h2>5. Changes to This Refund Policy</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>We reserve the right to modify this Refund Policy at any time. Any changes will be effective immediately upon posting the updated policy on our website. Your continued use of our paid services after any such changes constitutes your acceptance of the new Refund Policy.</p>
        
        <h2>6. Contact Us</h2>
        <p>{t('contentToBeAdded')}</p>
        <p>If you have any questions about this Refund Policy, please contact us:</p>
        <ul>
            <li>By email: [Your Contact Email - to be added]</li>
        </ul>
        
        <p className="mt-8 font-semibold">{t('contentToBeAdded')}</p>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
