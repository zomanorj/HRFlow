import React from 'react';
import Loader from './Loader';

/**
 * Reusable and customizable Button component.
 * @param {Object} props
 * @param {('primary'|'secondary'|'success'|'danger'|'outline'|'ghost')} [props.variant='primary'] - Visual style variant
 * @param {('sm'|'md'|'lg')} [props.size='md'] - Button size
 * @param {boolean} [props.loading=false] - Shows loading spinner and disables button
 * @param {React.ComponentType} [props.icon] - Optional Lucide icon to display before children
 * @param {boolean} [props.disabled=false] - Disables interaction
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.type='button'] - Button HTML type
 * @param {string} [props.className=''] - Additional class names
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  disabled = false,
  children,
  type = 'button',
  className = '',
  ...props
}) => {
  // Base styling for modern responsive buttons
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  // Variant mappings using the design system palette
  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent focus:ring-indigo-500 shadow-sm shadow-indigo-100 hover:shadow-md hover:shadow-indigo-200',
    secondary: 'bg-purple-600 hover:bg-purple-700 text-white border-transparent focus:ring-purple-500 shadow-sm shadow-purple-100 hover:shadow-md hover:shadow-purple-200',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent focus:ring-emerald-500 shadow-sm shadow-emerald-100 hover:shadow-md hover:shadow-emerald-200',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white border-transparent focus:ring-rose-500 shadow-sm shadow-rose-100 hover:shadow-md hover:shadow-rose-200',
    outline: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 focus:ring-indigo-500 hover:border-slate-300',
    ghost: 'bg-transparent hover:bg-slate-50 text-slate-600 border-transparent focus:ring-slate-400 hover:text-slate-900',
  };

  // Sizing mapping
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader size="sm" className="!border-current" />
      ) : (
        Icon && <Icon className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} shrink-0`} />
      )}
      <span>{children}</span>
    </button>
  );
};

export default Button;
