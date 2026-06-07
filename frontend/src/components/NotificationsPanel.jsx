import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useToast } from '../hooks/useToast';
import { Bell, CheckCircle2, AlertCircle, Info, XCircle, Trash2, Check } from 'lucide-react';

const NotificationsPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      // Rafraîchir toutes les 60 secondes quand le panel est ouvert
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get('notifications/');
      setNotifications(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showToast('Erreur lors du chargement des notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`notifications/${notificationId}/read/`);
      setNotifications(
        notifications.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      showToast('Notification marquée comme lue', 'success');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('notifications/read-all/');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      showToast('Toutes les notifications marquées comme lues', 'success');
    } catch (error) {
      console.error('Error marking all as read:', error);
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await axios.delete(`notifications/${notificationId}/`);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      showToast('Notification supprimée', 'success');
    } catch (error) {
      console.error('Error deleting notification:', error);
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-rose-600" />;
      case 'WARNING':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'INFO':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'INFO':
        return { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' };
      case 'SUCCESS':
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800' };
      case 'WARNING':
        return { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800' };
      case 'ERROR':
        return { bg: 'bg-rose-50', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-800' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}m`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR');
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl flex flex-col animate-slide-in">
        {/* Header avec Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-blue-100">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-500/20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Actions Bar */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Tout marquer comme lu
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="animate-spin">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">Chargement...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <Bell className="w-16 h-16 text-gray-300" />
              <div className="text-center">
                <p className="font-medium text-gray-600">Aucune notification</p>
                <p className="text-sm text-gray-500">Vous êtes à jour!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {notifications.map((notification, index) => {
                const colors = getTypeColor(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`${colors.bg} border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md hover:border-gray-300 group animate-fade-in`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 pt-1">
                        {getTypeIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5" />
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${colors.badge}`}>
                            {notification.type}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {formatDate(notification.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Marquer comme lu"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
