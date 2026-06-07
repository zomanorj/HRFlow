import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Employees from '../pages/Employees';
import Departments from '../pages/Departments';
import Leaves from '../pages/Leaves';
import Attendance from '../pages/Attendance';
import Notifications from '../pages/Notifications';
import AuditLog from '../pages/AuditLog';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Route publique de connexion */}
      <Route path="/login" element={<Login />} />

      {/* Espace sécurisé sous le layout principal */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="departments" element={<Departments />} />
        <Route path="leaves" element={<Leaves />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="audit" element={<AuditLog />} />
      </Route>

      {/* Redirection automatique pour les routes inconnues */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
