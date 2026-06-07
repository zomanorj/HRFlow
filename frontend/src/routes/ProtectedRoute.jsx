import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <h1 className="text-6xl font-bold text-indigo-600">403</h1>
        <p className="mt-4 text-xl font-semibold text-slate-800">Accès Refusé</p>
        <p className="mt-2 text-slate-500">Vous n'avez pas l'autorisation nécessaire pour consulter cette page.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition"
        >
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
