
import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { AppNotification, AppNotificationType, TranslationKey } from '../types';

const MAX_NOTIFICATIONS = 50; // Max notifications to keep in storage

export interface UseNotificationsReturn {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notificationData: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAllReadNotifications: () => void;
  clearAllNotifications: () => void;
}

export const useNotifications = (isGuest: boolean, userId?: string | null): UseNotificationsReturn => {
  const storageKey = userId ? `notifications_${userId}` : 'notifications_guest';
  const [storedNotifications, setStoredNotifications] = useLocalStorage<AppNotification[]>(storageKey, [], { disabled: isGuest });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(storedNotifications.filter(n => !n.isRead).length);
  }, [storedNotifications]);

  const addNotification = useCallback((notificationData: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    if (isGuest) return; // Do not add notifications for guests

    const newNotification: AppNotification = {
      ...notificationData,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setStoredNotifications(prevNotifications => {
      const updatedNotifications = [newNotification, ...prevNotifications];
      // Limit the number of notifications stored
      if (updatedNotifications.length > MAX_NOTIFICATIONS) {
        // Remove oldest read notifications first, then oldest unread if necessary
        const readNotifications = updatedNotifications.filter(n => n.isRead);
        const unreadNotifications = updatedNotifications.filter(n => !n.isRead);
        
        let combined = [...unreadNotifications, ...readNotifications]; // Prioritize unread
        if (combined.length > MAX_NOTIFICATIONS) {
            combined = combined.slice(0, MAX_NOTIFICATIONS);
        }
        return combined.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Keep newest first
      }
      return updatedNotifications;
    });
  }, [setStoredNotifications, isGuest]);

  const markAsRead = useCallback((id: string) => {
    if (isGuest) return;
    setStoredNotifications(prevNotifications =>
      prevNotifications.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, [setStoredNotifications, isGuest]);

  const markAllAsRead = useCallback(() => {
    if (isGuest) return;
    setStoredNotifications(prevNotifications =>
      prevNotifications.map(n => ({ ...n, isRead: true }))
    );
  }, [setStoredNotifications, isGuest]);

  const clearAllReadNotifications = useCallback(() => {
    if (isGuest) return;
    setStoredNotifications(prevNotifications =>
      prevNotifications.filter(n => !n.isRead)
    );
  }, [setStoredNotifications, isGuest]);
  
  const clearAllNotifications = useCallback(() => {
    if (isGuest) return;
    setStoredNotifications([]);
  }, [setStoredNotifications, isGuest]);


  return {
    notifications: storedNotifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAllReadNotifications,
    clearAllNotifications
  };
};
