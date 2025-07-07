
import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Trash2, X, Clock, Award, Target, CalendarDays, LucideProps } from 'lucide-react';
import Modal from './Modal';
import { AppNotification, TranslationKey } from '../types';
import { useLocalization } from '../hooks/useLocalization';

const ICONS: { [key: string]: React.FC<LucideProps> } = {
  Clock,
  Award,
  Target,
  CalendarDays,
  Bell, // Default
};

interface NotificationListModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAllRead: () => void;
}

const NotificationListModal: React.FC<NotificationListModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAllRead
}) => {
  const { t, currentLanguage } = useLocalization();

  const formatTimestamp = (isoTimestamp: string) => {
    const date = new Date(isoTimestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString(currentLanguage, { month: 'short', day: 'numeric' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('notificationsTitle')} size="lg">
      <div className="flex flex-col h-[60vh] sm:h-[50vh]">
        {notifications.length > 0 && (
          <div className="flex justify-between items-center mb-3 flex-shrink-0">
            <button
              onClick={onMarkAllAsRead}
              className="px-3 py-1.5 text-xs font-medium text-primary dark:text-primary-light hover:bg-primary-light/10 dark:hover:bg-primary-dark/20 rounded-md transition-colors"
            >
              {t('markAllAsRead')}
            </button>
            <button
              onClick={onClearAllRead}
              className="px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 rounded-md transition-colors"
            >
              <Trash2 size={14} className="inline mr-1" />
              {t('clearAllReadNotifications')}
            </button>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center text-neutral-dark/70 dark:text-neutral-light/70 p-6">
            <Bell size={48} className="mb-4 text-neutral/50 dark:text-slate-600" />
            <p className="text-lg">{t('noNotificationsYet')}</p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2">
            {notifications.map(notification => {
              const IconComponent = notification.icon && ICONS[notification.icon] ? ICONS[notification.icon] : Bell;
              const title = notification.title ?? t(notification.titleKey as TranslationKey);
              const message = notification.message ?? t(notification.messageKey as TranslationKey, ...(notification.messageArgs || []));

              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg shadow-sm transition-colors duration-200 flex items-start space-x-3
                              ${notification.isRead ? 'bg-neutral-light/50 dark:bg-slate-700/50 opacity-70' : 'bg-white dark:bg-slate-700'}`}
                >
                  <div className={`p-2 rounded-full ${notification.isRead ? 'bg-slate-200 dark:bg-slate-600' : 'bg-primary-light/30 dark:bg-primary-dark/30'} text-primary dark:text-primary-light mt-1`}>
                     <IconComponent size={20} />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-sm text-neutral-dark dark:text-white">{title}</h4>
                    <p className="text-xs text-neutral-dark/80 dark:text-neutral-light/80 mt-0.5">{message}</p>
                    <p className="text-xs text-neutral-dark/60 dark:text-neutral-light/60 mt-1.5">{formatTimestamp(notification.timestamp)}</p>
                    {notification.linkTo && (
                      <Link to={notification.linkTo} onClick={onClose} className="text-xs text-secondary dark:text-secondary-light hover:underline mt-1 inline-block">
                        View Details
                      </Link>
                    )}
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => onMarkAsRead(notification.id)}
                      className="p-1.5 text-neutral-dark/60 dark:text-neutral-light/60 hover:text-success dark:hover:text-success-light rounded-full transition-colors"
                      title={t('markAsRead')}
                    >
                      <Check size={18} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default NotificationListModal;