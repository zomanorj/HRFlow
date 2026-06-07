import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';
import NotificationsPanel from './NotificationsPanel';

/**
 * Top navigation bar component.
 * @param {Object} props
 * @param {Object} props.user - User object
 * @param {function} props.onMenuClick - Triggered when mobile hamburger is clicked
 */
const Navbar = ({ user, onMenuClick }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: 'bg-rose-50 text-rose-700 border-rose-200',
      HR: 'bg-purple-50 text-purple-700 border-purple-200',
      EMPLOYEE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    const labels = {
      ADMIN: 'Administrateur',
      HR: 'Ressources Humaines',
      EMPLOYEE: 'Employé',
    };
    return (
      <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${badges[role] || badges.EMPLOYEE}`}>
        {labels[role] || 'Employé'}
      </span>
    );
  };

  const getInitials = (u) => {
    if (!u) return '?';
    if (u.employee_prenom && u.employee_nom) {
      return `${u.employee_prenom.charAt(0)}${u.employee_nom.charAt(0)}`.toUpperCase();
    }
    return u.username?.charAt(0).toUpperCase() || '?';
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-white/85 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 md:px-8">
        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 text-slate-500 rounded-md hover:bg-slate-100 focus:outline-none transition"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Greeting (Desktop only) */}
        <div className="flex-1 md:flex items-center hidden">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Bonjour, {user?.employee_prenom || user?.username} ! 👋
          </h2>
        </div>

        {/* User Information and Badges */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <NotificationBell
            isOpen={isNotificationsOpen}
            onOpen={() => setIsNotificationsOpen(true)}
            onClose={() => setIsNotificationsOpen(false)}
          />

          {user && getRoleBadge(user.role)}
          
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 text-xs font-bold shadow-inner">
              {getInitials(user)}
            </div>
            <span className="text-xs font-semibold text-slate-600 hidden sm:inline-block">
              {user?.employee_prenom || user?.username} {user?.employee_nom || ''}
            </span>
          </div>
        </div>
      </header>

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
};

export default Navbar;
