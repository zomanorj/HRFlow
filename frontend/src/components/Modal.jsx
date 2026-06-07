import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Reusable premium modal component using React Portals to prevent stacking context bugs.
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {function} props.onClose - Function to close modal
 * @param {string} props.title - Title of the modal
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ComponentType} [props.icon] - Optional Lucide icon for header
 * @param {string} [props.maxWidthClass='max-w-md'] - Custom max-width Tailwind class (e.g. 'max-w-2xl')
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  icon: Icon,
  maxWidthClass = 'max-w-md',
}) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop overlay with premium dark blur */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal dialog card */}
      <div className={`relative bg-white rounded-2xl w-full ${maxWidthClass} border border-slate-200 shadow-2xl overflow-hidden animate-zoom-in z-10 max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
            {Icon && <Icon className="h-5 w-5 text-indigo-600" />}
            <span>{title}</span>
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-600">
          {children}
        </div>
      </div>
    </div>
  );

  // Mount to document.body so it is always on top of all layout headers
  return createPortal(modalContent, document.body);
};

export default Modal;
