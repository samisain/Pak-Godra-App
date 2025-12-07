
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  subMessage?: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, subMessage, isVisible, onClose, type = 'info' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-sm rounded-xl shadow-2xl p-4 flex items-center space-x-3 transition-all duration-300 animate-in slide-in-from-top-5 ${
        type === 'success' ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-white'
    }`}>
      <div className={`p-2 rounded-full ${type === 'success' ? 'bg-white/20' : 'bg-white/10'}`}>
        <span className="material-symbols-outlined text-xl">
            {type === 'success' ? 'check_circle' : 'notifications'}
        </span>
      </div>
      <div className="flex-1">
         <h4 className="font-bold text-sm">{message}</h4>
         {subMessage && <p className="text-xs opacity-90 line-clamp-1">{subMessage}</p>}
      </div>
      <button onClick={onClose} className="text-white/60 hover:text-white">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
};
