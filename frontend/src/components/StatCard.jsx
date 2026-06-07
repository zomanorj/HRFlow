import React from 'react';

/**
 * Reusable dashboard statistics card.
 * @param {Object} props
 * @param {string} props.title - Title of the statistic
 * @param {string|number} props.value - The statistic value
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} [props.bgIconClass='bg-indigo-50 text-indigo-600'] - CSS classes for icon background and text color
 * @param {boolean} [props.loading=false] - Whether card is loading
 */
const StatCard = ({
  title,
  value,
  icon: Icon,
  bgIconClass = 'bg-indigo-50 text-indigo-600',
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse flex items-center justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        </div>
        <div className="h-12 w-12 bg-slate-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight transition-transform duration-200 group-hover:scale-105 origin-left">
          {value}
        </h3>
      </div>
      {Icon && (
        <div className={`p-3 rounded-xl transition-all duration-300 group-hover:rotate-12 ${bgIconClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
