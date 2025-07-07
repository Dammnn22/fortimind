import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Shield, Clock, AlertCircle } from 'lucide-react';
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import AbuseAlertService from '../services/abuseAlertService';

interface AdminNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'security_alert' | 'system_alert' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
  read: boolean;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

const AdminNotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

    // Verificar si el usuario es admin
    const checkAdminStatus = async () => {
      const adminStatus = await AbuseAlertService.isUserAdmin(user.uid);
      setIsAdmin(adminStatus);
    };

    checkAdminStatus();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || !isAdmin) return;

    // Escuchar notificaciones en tiempo real para el admin
    const notificationsQuery = query(
      collection(db, 'admin_notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AdminNotification));

      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [user?.uid, isAdmin]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'low': return <Shield className="w-4 h-4 text-blue-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Aquí marcaríamos como leída la notificación
      console.log('Marking notification as read:', notificationId);
      // TODO: Implementar marcado como leída
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      // Marcar todas las notificaciones como leídas
      const promises = notifications.map(notification => 
        markAsRead(notification.id)
      );
      await Promise.all(promises);
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // No mostrar el componente si no es admin
  if (!isAdmin) {
    return null;
  }

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <Bell className="w-6 h-6" />
        
        {/* Badge for unread notifications */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Alertas de Seguridad
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Marcar todas como leídas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No hay alertas pendientes</p>
                <p className="text-sm text-gray-500 mt-1">
                  Todas las alertas han sido revisadas
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${getSeverityColor(notification.severity)}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getSeverityIcon(notification.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-700 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                            notification.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            notification.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            notification.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {notification.severity === 'critical' ? 'Crítica' :
                             notification.severity === 'high' ? 'Alta' :
                             notification.severity === 'medium' ? 'Media' : 'Baja'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {notification.createdAt.toDate().toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {unreadCount > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navegar al dashboard de admin si no estamos ahí
                  window.location.hash = '#/admin-dashboard';
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todas las alertas en el Dashboard →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminNotificationBell;
