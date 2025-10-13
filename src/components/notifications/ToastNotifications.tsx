import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, MessageCircle, Calendar } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'message' | 'task' | 'success' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClick?: () => void;
}

interface ToastNotificationProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

export function ToastNotification({ toast, onRemove }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto remove toast
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'message': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'task': return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'message': return 'border-l-blue-500';
      case 'task': return 'border-l-purple-500';
      case 'success': return 'border-l-green-500';
      case 'error': return 'border-l-red-500';
      case 'info': return 'border-l-blue-500';
      default: return 'border-l-gray-500';
    }
  };

  const handleClick = () => {
    if (toast.onClick) {
      toast.onClick();
      onRemove(toast.id);
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 ${getBorderColor()} p-4 mb-3 min-w-[320px] max-w-[400px] ${
          toast.onClick ? 'cursor-pointer hover:shadow-xl' : ''
        }`}
        onClick={handleClick}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1 truncate">
              {toast.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
              {toast.message}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
              setTimeout(() => onRemove(toast.id), 300);
            }}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}