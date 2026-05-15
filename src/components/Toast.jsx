import { useEffect } from 'react';

const styles = {
  success: 'border-green-200 bg-green-50 text-green-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
};

const ToastItem = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timeout = window.setTimeout(() => onDismiss(toast.id), 4000);
    return () => window.clearTimeout(timeout);
  }, [onDismiss, toast.id]);

  return (
    <div
      className={`w-full rounded-xl border px-4 py-3 shadow-lg ${styles[toast.type] || styles.info}`}
      role="status"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium leading-6">{toast.message}</p>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="focus-ring rounded px-1 text-lg leading-none opacity-70 transition hover:opacity-100"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

const Toast = ({ toasts, onDismiss }) => (
  <div className="fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
    {toasts.map((toast) => (
      <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
    ))}
  </div>
);

export default Toast;
