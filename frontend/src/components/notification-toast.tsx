'use client';

import { useState, useEffect, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// CSS for shrink animation
const shrinkKeyframes = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;

// Inject CSS if not already present
if (typeof document !== 'undefined' && !document.getElementById('toast-animations')) {
  const style = document.createElement('style');
  style.id = 'toast-animations';
  style.textContent = shrinkKeyframes;
  document.head.appendChild(style);
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationToastProps {
  notification: ToastNotification;
  onClose: (id: string) => void;
}

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto close after duration - using direct approach from React docs
    if (notification.duration && notification.duration > 0) {
      console.log(`Setting auto-close timer for ${notification.duration}ms for notification: ${notification.title}`);
      
      const timer = setTimeout(() => {
        console.log(`Auto-closing notification: ${notification.title}`);
        // Direct close without intermediate state
        setIsExiting(true);
        setTimeout(() => {
          onClose(notification.id);
        }, 300);
      }, notification.duration);
      
      // Backup timer to force close after duration + 1 second (safety measure)
      const backupTimer = setTimeout(() => {
        console.log(`Backup timer: Force closing notification: ${notification.title}`);
        onClose(notification.id);
      }, notification.duration + 1000);
      
      return () => {
        console.log(`Clearing timers for notification: ${notification.title}`);
        clearTimeout(timer);
        clearTimeout(backupTimer);
      };
    }
  }, [notification.duration, notification.title, notification.id, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-500/20';
      case 'error':
        return 'border-red-500/20';
      case 'warning':
        return 'border-yellow-500/20';
      case 'info':
      default:
        return 'border-blue-500/20';
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-500/10';
      case 'error':
        return 'bg-red-500/10';
      case 'warning':
        return 'bg-yellow-500/10';
      case 'info':
      default:
        return 'bg-blue-500/10';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-500 ease-out backdrop-blur-sm
        ${isVisible && !isExiting 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
        bg-[#1A1A1C]/95 border border-white/8 rounded-xl shadow-2xl 
        shadow-black/20 min-w-72 max-w-sm
        hover:shadow-xl hover:scale-[1.02] transition-all duration-200
      `}
    >
      <div className="p-3.5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg" style={{
            backgroundColor: notification.type === 'success' ? 'rgba(34, 197, 94, 0.15)' :
                             notification.type === 'error' ? 'rgba(239, 68, 68, 0.15)' :
                             notification.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' :
                             'rgba(59, 130, 246, 0.15)'
          }}>
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white leading-tight">
              {notification.title}
            </h4>
            {notification.message && (
              <p className="mt-1 text-xs text-[#A0A0A0] leading-relaxed">
                {notification.message}
              </p>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1.5 hover:bg-white/8 rounded-lg transition-all duration-200 
                       opacity-60 hover:opacity-100 group"
            title="Cerrar"
          >
            <XMarkIcon className="w-3.5 h-3.5 text-[#A0A0A0] group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>
      
      {/* Progress bar for auto-close */}
      {notification.duration && notification.duration > 0 && (
        <div className="h-0.5 bg-white/5 overflow-hidden">
          <div 
            className="h-full transition-all ease-linear"
            style={{
              width: isExiting ? '0%' : '100%',
              backgroundColor: notification.type === 'success' ? '#22c55e' :
                              notification.type === 'error' ? '#ef4444' :
                              notification.type === 'warning' ? '#f59e0b' :
                              '#3b82f6',
              animationName: isExiting ? 'none' : 'shrink',
              animationDuration: isExiting ? '0ms' : `${notification.duration}ms`,
              animationTimingFunction: 'linear',
              animationFillMode: 'forwards'
            }}
          />
        </div>
      )}
    </div>
  );
}