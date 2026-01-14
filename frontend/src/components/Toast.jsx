import React, { useEffect, useState } from 'react';

/**
 * Global Toast Notification Component
 * Displays success, error, info, and warning messages
 */
function Toast({ message, type = 'info', duration = 5000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300); // Animation duration
  };

  if (!isVisible) return null;

  const typeStyles = {
    success: {
      bg: 'bg-green-600',
      border: 'border-green-500',
      icon: '✓',
      text: 'text-green-100',
    },
    error: {
      bg: 'bg-red-600',
      border: 'border-red-500',
      icon: '✕',
      text: 'text-red-100',
    },
    warning: {
      bg: 'bg-yellow-600',
      border: 'border-yellow-500',
      icon: '⚠',
      text: 'text-yellow-100',
    },
    info: {
      bg: 'bg-blue-600',
      border: 'border-blue-500',
      icon: 'ℹ',
      text: 'text-blue-100',
    },
  };

  const styles = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md w-full ${styles.bg} ${styles.border} border rounded-lg shadow-xl p-4 flex items-start space-x-3 transform transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
    >
      <div className={`flex-shrink-0 ${styles.text} text-xl font-bold`}>
        {styles.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${styles.text} font-medium`}>{message}</p>
      </div>
      <button
        onClick={handleClose}
        className={`flex-shrink-0 ${styles.text} hover:opacity-75 transition-opacity`}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;

