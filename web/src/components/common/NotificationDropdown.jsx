import { CheckCheck, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useLanguage } from '../../hooks/useLanguage';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    // Handle navigation based on notification type
    // You can add routing logic here
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
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

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20',
      normal: 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20',
      low: 'border-l-4 border-gray-400 bg-gray-50 dark:bg-gray-800',
    };
    return colors[priority] || colors.normal;
  };

  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: isArabic ? ar : enUS
      });
    } catch (error) {
      return date;
    }
  };

  return (
    <div className="absolute left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-textPrimary dark:text-white">
          {t.notifications?.title || 'Notifications'}
        </h3>
        {recentNotifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" />
            {t.notifications?.markAllRead || 'Mark all read'}
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-textSecondary dark:text-gray-400">
            {t.common?.loading || 'Loading...'}
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="p-8 text-center text-textSecondary dark:text-gray-400">
            <div className="text-4xl mb-2">🔔</div>
            <p>{t.notifications?.noNotifications || 'No notifications yet'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentNotifications.map(notification => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  !notification.read ? getPriorityColor(notification.priority) : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className={`text-sm font-semibold ${
                        !notification.read 
                          ? 'text-textPrimary dark:text-white' 
                          : 'text-textSecondary dark:text-gray-400'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-sm text-textSecondary dark:text-gray-400 line-clamp-2 mb-1">
                      {notification.message}
                    </p>
                    <span className="text-xs text-textSecondary dark:text-gray-500">
                      {formatTime(notification.sentAt)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {recentNotifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium py-2 flex items-center justify-center gap-1"
          >
            {t.notifications?.viewAll || 'View all notifications'}
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
