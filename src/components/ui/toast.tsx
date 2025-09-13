'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 4000);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Listen for global toast events from API layer
  useEffect(() => {
    const handleGlobalToast = (event: CustomEvent) => {
      const { type, message, duration } = event.detail;
      addToast({ message, type, duration });
    };

    window.addEventListener('show-toast', handleGlobalToast as EventListener);
    
    return () => {
      window.removeEventListener('show-toast', handleGlobalToast as EventListener);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 200); // Wait for exit animation
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />;
      default:
        return <Info className="h-5 w-5 text-gray-600 flex-shrink-0" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-white border-gray-200 text-gray-800 shadow-lg';
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-4 rounded-lg border backdrop-blur-sm',
        'transition-all duration-200 ease-out',
        'font-medium text-sm leading-relaxed',
        'shadow-lg drop-shadow-sm',
        getStyles(),
        isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      )}
      style={{
        transform: isVisible && !isLeaving 
          ? 'translateX(0) scale(1)' 
          : 'translateX(100%) scale(0.95)',
        opacity: isVisible && !isLeaving ? 1 : 0,
      }}
    >
      {getIcon()}
      
      <div className="flex-1 min-w-0 text-left">
        <p className="font-semibold text-sm leading-tight break-words">
          {toast.message}
        </p>
        
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className={cn(
              'mt-2 text-sm font-semibold underline underline-offset-2',
              'hover:no-underline transition-all duration-150',
              toast.type === 'success' && 'text-green-700 hover:text-green-600',
              toast.type === 'error' && 'text-red-700 hover:text-red-600',
              toast.type === 'warning' && 'text-amber-700 hover:text-amber-600',
              toast.type === 'info' && 'text-blue-700 hover:text-blue-600',
              toast.type === 'default' && 'text-gray-700 hover:text-gray-600'
            )}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      <button
        onClick={handleClose}
        className={cn(
          'flex-shrink-0 p-1 rounded-md transition-all duration-150',
          'hover:bg-gray-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
          'text-gray-600 hover:text-gray-800'
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast } = context;

  const toast = (message: string, options?: { type?: ToastType; duration?: number; action?: Toast['action'] }) => {
    addToast({
      message,
      type: options?.type || 'default',
      duration: options?.duration,
      action: options?.action,
    });
  };

  toast.success = (message: string, options?: { duration?: number; action?: Toast['action'] }) => {
    addToast({ message, type: 'success', duration: options?.duration, action: options?.action });
  };

  toast.error = (message: string, options?: { duration?: number; action?: Toast['action'] }) => {
    addToast({ message, type: 'error', duration: options?.duration, action: options?.action });
  };

  toast.warning = (message: string, options?: { duration?: number; action?: Toast['action'] }) => {
    addToast({ message, type: 'warning', duration: options?.duration, action: options?.action });
  };

  toast.info = (message: string, options?: { duration?: number; action?: Toast['action'] }) => {
    addToast({ message, type: 'info', duration: options?.duration, action: options?.action });
  };

  return toast;
}