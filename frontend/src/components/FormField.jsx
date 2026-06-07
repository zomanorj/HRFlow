import React from 'react';

/**
 * Reusable Form Field wrapper with consistent label, error, and icon styling.
 * @param {Object} props
 * @param {string} props.label - Label of the field
 * @param {string} [props.error] - Validation error message
 * @param {React.ComponentType} [props.icon] - Left-side Lucide icon
 * @param {string} [props.type='text'] - Input type (text, email, password, date, select, textarea)
 * @param {Array<{value: string|number, label: string}>} [props.options=[]] - Dropdown options (only used when type='select')
 * @param {string} [props.className=''] - Additional wrapper class names
 */
const FormField = ({
  label,
  error,
  icon: Icon,
  type = 'text',
  options = [],
  className = '',
  required = false,
  ...props
}) => {
  const inputBaseClasses = `block w-full rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-200 ${
    Icon ? 'pl-10' : 'pl-4'
  } pr-4 py-2.5`;
  const errorClasses = error ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/10' : '';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-400 transition-colors duration-200" />
          </div>
        )}

        {type === 'textarea' ? (
          <textarea
            required={required}
            className={`${inputBaseClasses} ${errorClasses} resize-none`}
            {...props}
          />
        ) : type === 'select' ? (
          <select
            required={required}
            className={`${inputBaseClasses} ${errorClasses} bg-none`}
            {...props}
          >
            {options.map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            required={required}
            className={`${inputBaseClasses} ${errorClasses}`}
            {...props}
          />
        )}
      </div>
      {error && (
        <p className="text-xs text-rose-500 font-semibold animate-pulse mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
