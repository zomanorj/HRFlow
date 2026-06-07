import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import DataTable from '../components/DataTable';
import { useToast } from '../hooks/useToast';
import useAuth from '../hooks/useAuth';

import Button from '../components/Button';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'ALL',
    is_read: 'ALL',
  });
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, [filters]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let url = 'notifications/';
      const params = new URLSearchParams();

      if (filters.type !== 'ALL') {
        params.append('type', filters.type);
      }
      if (filters.is_read !== 'ALL') {
        params.append('is_read', filters.is_read === 'read');
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
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

  const getTypeColor = (type) => {
    switch (type) {
      case 'INFO':
        return 'bg-blue-100 text-blue-800';
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns = [
    {
      key: 'title',
      label: 'Titre',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-600 mt-1">{row.message}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded ${getTypeColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'is_read',
      label: 'Statut',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded ${
          value
            ? 'bg-gray-100 text-gray-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {value ? 'Lu' : 'Non lu'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          {!row.is_read && (
            <button
              onClick={() => handleMarkAsRead(row.id)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Marquer comme lu"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Supprimer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Gérez vos notifications</p>
        </div>
        <Button
          onClick={handleMarkAllAsRead}
          variant="secondary"
          size="sm"
        >
          Tout marquer comme lu
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tous</option>
              <option value="INFO">Information</option>
              <option value="SUCCESS">Succès</option>
              <option value="WARNING">Avertissement</option>
              <option value="ERROR">Erreur</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={filters.is_read}
              onChange={(e) => setFilters({ ...filters, is_read: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tous</option>
              <option value="unread">Non lus</option>
              <option value="read">Lus</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={notifications}
          loading={loading}
          emptyMessage="Aucune notification"
        />
      </div>
    </div>
  );
};

export default Notifications;
