import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(0, 20);
      setNotifications(data.content || []);
      
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle new notification from SSE
  const handleNewNotification = useCallback((notification) => {
    // Add to list
    setNotifications(prev => [notification, ...prev]);
    
    // Increment unread count if not read
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Mark as read
  const markAsRead = useCallback(async (notificationId) => {
    const success = await notificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    return success;
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const success = await notificationService.markAllAsRead();
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
    return success;
  }, []);

  // Connect to SSE when user is authenticated
  useEffect(() => {
    if (user) {
      // Connect to SSE stream
      notificationService.connect();

      // Subscribe to new notifications
      const unsubscribe = notificationService.addListener(handleNewNotification);

      // Fetch initial data
      fetchNotifications();

      // Cleanup on unmount
      return () => {
        unsubscribe();
      };
    } else {
      // Disconnect when user logs out
      notificationService.disconnect();
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, handleNewNotification, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
};
