import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar navigation component */}
      <Sidebar 
        user={user} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        onLogout={handleLogout} 
      />

      {/* Main content wrapper */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top header navigation */}
        <Navbar 
          user={user} 
          onMenuClick={() => setSidebarOpen(true)} 
        />

        {/* Active page contents */}
        <main className="flex-1 py-8 px-4 sm:px-6 md:px-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
