import React, { createContext, useState, useCallback, useRef } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import Button from '../components/Button';

export const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmer',
    cancelLabel: 'Annuler',
    confirmVariant: 'primary', // primary, danger, success
  });

  const resolverRef = useRef(null);

  const confirm = useCallback((options) => {
    setState({
      isOpen: true,
      title: options.title || 'Confirmation',
      message: options.message || 'Êtes-vous sûr de vouloir continuer ?',
      confirmLabel: options.confirmLabel || 'Confirmer',
      cancelLabel: options.cancelLabel || 'Annuler',
      confirmVariant: options.confirmVariant || 'primary',
    });
    
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleClose = useCallback((result) => {
    setState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  }, []);

  const getVariantStyles = (variant) => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-rose-600" />,
          iconBg: 'bg-rose-50 border border-rose-100',
          confirmBtn: 'danger',
        };
      case 'success':
        return {
          icon: <HelpCircle className="h-6 w-6 text-emerald-600" />,
          iconBg: 'bg-emerald-50 border border-emerald-100',
          confirmBtn: 'success',
        };
      default:
        return {
          icon: <HelpCircle className="h-6 w-6 text-indigo-600" />,
          iconBg: 'bg-indigo-50 border border-indigo-100',
          confirmBtn: 'primary',
        };
    }
  };

  const currentStyles = getVariantStyles(state.confirmVariant);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      
      {state.isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-zoom-in">
            <div className="p-6">
              <div className="flex gap-4 items-start">
                <div className={`p-3 rounded-xl shrink-0 ${currentStyles.iconBg}`}>
                  {currentStyles.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
                    {state.title}
                  </h3>
                  <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                    {state.message}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
              >
                {state.cancelLabel}
              </Button>
              <Button
                variant={currentStyles.confirmBtn}
                onClick={() => handleClose(true)}
              >
                {state.confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
