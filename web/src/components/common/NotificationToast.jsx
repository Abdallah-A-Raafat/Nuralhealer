import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationToast = () => {
  const [toasts, setToasts] = useState([]);

  // Subscribe to new notifications
  useEffect(() => {
    const handleNewNotification = (notification) => {
      // Only show toast for high and normal priority
      if (notification.priority === 'low') return;

      const toast = {
        id: notification.id,
        ...notification,
      };

      setToasts(prev => [...prev, toast]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 5000);
    };

    // This would need to be connected to the notification service
    // For now, we'll just return cleanup
    return () => {};
  }, []);

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getPriorityStyles = (priority) => {
    const styles = {
      high: 'bg-red-50 dark:bg-red-900/20 border-red-500',
      normal: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500',
    };
    return styles[priority] || styles.normal;
  };

  const getNotificationIcon = (type) => {
    const icons = {
      MESSAGE_RECEIVED: '💬',
      ENGAGEMENT_STARTED: '🤝',
      ENGAGEMENT_CANCELLED: '❌',
      SECURITY_ALERT: '🔒',
      AI_RESPONSE_READY: '🤖',
      USER_WELCOME: '👋',
    };
    return icons[type] || '🔔';
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-md">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg animate-slide-in-right ${getPriorityStyles(toast.priority)}`}
        >
          <span className="text-2xl flex-shrink-0">
            {getNotificationIcon(toast.type)}
          </span>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-textPrimary dark:text-white mb-1">
              {toast.title}
            </h4>
            <p className="text-sm text-textSecondary dark:text-gray-400 line-clamp-2">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="flex-shrink-0 text-textSecondary hover:text-textPrimary dark:text-gray-400 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
