
import React from 'react';
import Modal from './Modal';
import { useLocalization } from '../hooks/useLocalization';
import { Bell } from 'lucide-react';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void; // For "Maybe Later"
  onEnable: () => void; // For "Enable Notifications"
}

const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({ isOpen, onClose, onEnable }) => {
  const { t } = useLocalization();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('pushNotificationsTitle')}>
      <div className="text-center p-4">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-light/30 mb-4">
          <Bell size={40} className="text-primary dark:text-primary-light" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-dark dark:text-white">
          {t('notificationPermissionModalTitle' as any)}
        </h3>
        <p className="mt-2 text-sm text-neutral-dark/80 dark:text-neutral-light/80">
          {t('notificationPermissionModalDesc' as any)}
        </p>
        <ul className="mt-3 text-left text-sm text-neutral-dark dark:text-neutral-light space-y-1 list-disc list-inside">
          <li>{t('notificationPermissionBenefit1' as any)}</li>
          <li>{t('notificationPermissionBenefit2' as any)}</li>
          <li>{t('notificationPermissionBenefit3' as any)}</li>
        </ul>
        <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={onEnable}
            className="w-full sm:w-auto flex-1 justify-center items-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-success hover:bg-success-dark transition-colors"
          >
            {t('enablePushNotifications')}
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto flex-1 justify-center px-4 py-2.5 text-sm font-medium text-neutral-dark dark:text-neutral-light bg-neutral/20 dark:bg-slate-700 hover:bg-neutral/30 dark:hover:bg-slate-600 rounded-lg"
          >
            {t('maybeLater' as any)}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NotificationPermissionModal;
