import React from 'react';

/**
 * A beautiful, premium spinner loader.
 * @param {Object} props
 * @param {('sm'|'md'|'lg')} [props.size='md'] - The size of the loader
 * @param {boolean} [props.fullScreen=false] - Whether it should span the whole screen
 * @param {string} [props.className=''] - Additional class names
 */
const Loader = ({ size = 'md', fullScreen = false, className = '' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-16 w-16 border-4',
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-indigo-600 border-t-transparent ${sizeClasses[size]} ${className}`} />
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/50 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-6">
      {spinner}
    </div>
  );
};

export default Loader;
