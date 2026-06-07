import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CalendarDays, 
  Clock, 
  Bell,
  Shield,
  LogOut, 
  X,
  ChevronRight
} from 'lucide-react';

/**
 * Responsive navigation sidebar component.
 * @param {Object} props
 * @param {Object} props.user - User object
 * @param {boolean} props.sidebarOpen - Mobile sidebar state
 * @param {function} props.setSidebarOpen - Mobile sidebar state setter
 * @param {function} props.onLogout - Logout callback
 */
const Sidebar = ({ user, sidebarOpen, setSidebarOpen, onLogout }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Tableau de bord', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
    { name: 'Employés', href: '/employees', icon: Users, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
    { name: 'Départements', href: '/departments', icon: Building2, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
    { name: 'Congés', href: '/leaves', icon: CalendarDays, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
    { name: 'Présences', href: '/attendance', icon: Clock, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
    { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
    { name: 'Audit', href: '/audit', icon: Shield, roles: ['ADMIN', 'HR'] },
  ];

  const filteredNavigation = navigation.filter(item => item.roles.includes(user?.role));

  const getInitials = (u) => {
    if (!u) return '?';
    if (u.employee_prenom && u.employee_nom) {
      return `${u.employee_prenom.charAt(0)}${u.employee_nom.charAt(0)}`.toUpperCase();
    }
    return u.username?.charAt(0).toUpperCase() || '?';
  };

  const navLinks = filteredNavigation.map((item) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;
    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <Icon className={`mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-500'}`} />
        {item.name}
        {isActive && <ChevronRight className="ml-auto h-4 w-4 animate-pulse" />}
      </Link>
    );
  });

  const profileSection = (
    <div className="p-4 border-t border-slate-200 bg-white">
      <div className="flex items-center mb-4 p-2 rounded-xl bg-slate-50 border border-slate-100">
        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200 shadow-inner">
          {getInitials(user)}
        </div>
        <div className="ml-3 overflow-hidden">
          <p className="text-sm font-bold text-slate-800 truncate">
            {user?.employee_prenom || user?.username} {user?.employee_nom || ''}
          </p>
          <p className="text-xs font-semibold text-slate-400 truncate">{user?.email}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 rounded-xl transition-all shadow-sm"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Déconnexion
      </button>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-slate-200 z-20">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center px-6 mb-8 gap-2">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-100">
              H
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              HR<span className="text-indigo-600">Flow</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 space-y-1 bg-white">
            {navLinks}
          </nav>
        </div>

        {/* Profile Section */}
        {profileSection}
      </aside>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Sidebar Drawer */}
          <aside className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white shadow-2xl border-r border-slate-100 animate-slide-in">
            {/* Close Button */}
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-slate-900/30"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Logo */}
            <div className="flex items-center px-6 mb-8 gap-2">
              <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                H
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                HR<span className="text-indigo-600">Flow</span>
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-1">
              {navLinks}
            </nav>

            {/* Profile Section */}
            {profileSection}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
