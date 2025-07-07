import React from 'react';
import { Bell } from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ unreadCount, onClick, className = '' }) => {
  const { t } = useLocalization();
  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-full transition-colors duration-200 ease-in-out text-neutral-dark dark:text-neutral-light hover:bg-primary-light/20 dark:hover:bg-slate-700 ${className}`}
      aria-label={t('openNotifications')}
      title={t('notifications')}
    >
      <Bell size={22} />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 block h-5 w-5 transform -translate-y-1/3 translate-x-1/3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-danger opacity-75 animate-ping"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-danger text-white text-xs items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
