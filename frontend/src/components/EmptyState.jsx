import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Reusable empty state component.
 * @param {Object} props
 * @param {React.ComponentType} [props.icon] - Lucide icon component
 * @param {string} props.title - Main headline
 * @param {string} [props.description] - Sub-headline explanation
 * @param {React.ReactNode} [props.action] - Optional action button
 */
const EmptyState = ({ 
  icon: Icon = Inbox, 
  title, 
  description, 
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-xl border border-dashed border-slate-300">
      <div className="p-4 bg-indigo-50 rounded-full text-indigo-600 mb-4 shadow-inner">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-slate-400 max-w-sm font-medium">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
