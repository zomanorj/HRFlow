import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import DataTable from '../components/DataTable';
import { useToast } from '../hooks/useToast';
import useAuth from '../hooks/useAuth';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    user: '',
    date_from: '',
    date_to: '',
  });
  const [users, setUsers] = useState([]);
  const { showToast } = useToast();
  const { user } = useAuth();

  // Check if user has permission to view audit logs
  if (!user || !['ADMIN', 'HR'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder aux logs d'audit.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchLogs();
    fetchUsers();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = 'audit/';
      const params = new URLSearchParams();

      if (filters.action) params.append('action', filters.action);
      if (filters.user) params.append('user', filters.user);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      setLogs(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      showToast('Erreur lors du chargement des logs d\'audit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('auth/users/');
      setUsers(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE_EMPLOYEE':
      case 'CREATE_DEPARTMENT':
      case 'CREATE_LEAVE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE_EMPLOYEE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE_EMPLOYEE':
      case 'DELETE_DEPARTMENT':
        return 'bg-red-100 text-red-800';
      case 'APPROVE_LEAVE':
        return 'bg-indigo-100 text-indigo-800';
      case 'REJECT_LEAVE':
        return 'bg-red-100 text-red-800';
      case 'CHECK_IN':
        return 'bg-green-100 text-green-800';
      case 'CHECK_OUT':
        return 'bg-orange-100 text-orange-800';
      case 'LOGIN':
        return 'bg-blue-100 text-blue-800';
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-800';
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
      key: 'action_display',
      label: 'Action',
      render: (value, row) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded ${getActionColor(row.action)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'user_display',
      label: 'Utilisateur',
      render: (value) => value || 'Système',
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => (
        <div className="text-sm text-gray-600 max-w-xs">
          {value}
        </div>
      ),
    },
    {
      key: 'target_type',
      label: 'Cible',
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium">{value}</div>
          {row.target_id && <div className="text-gray-500">ID: {row.target_id}</div>}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (value) => formatDate(value),
    },
  ];

  const actionOptions = [
    { value: '', label: 'Toutes les actions' },
    { value: 'CREATE_EMPLOYEE', label: 'Création d\'employé' },
    { value: 'UPDATE_EMPLOYEE', label: 'Modification d\'employé' },
    { value: 'DELETE_EMPLOYEE', label: 'Suppression d\'employé' },
    { value: 'CREATE_DEPARTMENT', label: 'Création de département' },
    { value: 'DELETE_DEPARTMENT', label: 'Suppression de département' },
    { value: 'CREATE_LEAVE', label: 'Création de congé' },
    { value: 'APPROVE_LEAVE', label: 'Approbation de congé' },
    { value: 'REJECT_LEAVE', label: 'Rejet de congé' },
    { value: 'CHECK_IN', label: 'Check-in' },
    { value: 'CHECK_OUT', label: 'Check-out' },
    { value: 'LOGIN', label: 'Connexion' },
    { value: 'LOGOUT', label: 'Déconnexion' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Log d'audit</h1>
        <p className="text-gray-600 mt-1">Consultez l'historique de toutes les actions effectuées dans le système</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {actionOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Utilisateur
            </label>
            <select
              value={filters.user}
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              De
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              À
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
            headers={[
                "Action",
                "Utilisateur",
                "Description",
                "Cible",
                "Date"
            ]}
            items={logs}
            loading={loading}
            renderRow={(log) => (
                <tr key={log.id}>
                <td className="px-6 py-4">
                    {log.action_display}
                </td>

                <td className="px-6 py-4">
                    {log.user_display || "Système"}
                </td>

                <td className="px-6 py-4">
                    {log.description}
                </td>

                <td className="px-6 py-4">
                    {log.target_type}
                </td>

                <td className="px-6 py-4">
                    {formatDate(log.created_at)}
                </td>
                </tr>
            )}
            />
      </div>
    </div>
  );
};

export default AuditLog;
