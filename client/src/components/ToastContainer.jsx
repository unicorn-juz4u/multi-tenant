import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks.js';
import { selectToasts } from '../features/ui/selectors.js';
import { removeToast } from '../features/ui/uiSlice.js';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastItem = ({ toast }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />,
    info: <Info className="h-5 w-5 text-sky-500 flex-shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-200 dark:border-emerald-800/60',
    error: 'border-rose-200 dark:border-rose-800/60',
    warning: 'border-amber-200 dark:border-amber-800/60',
    info: 'border-sky-200 dark:border-sky-800/60',
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl shadow-elevated border ${
        borderColors[toast.type] || borderColors.info
      } animate-fade-in pointer-events-auto`}
    >
      {icons[toast.type] || icons.info}
      <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">
        {toast.message}
      </div>
      <button
        type="button"
        onClick={() => dispatch(removeToast(toast.id))}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const toasts = useAppSelector(selectToasts);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
