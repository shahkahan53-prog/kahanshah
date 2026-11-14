import React, { useEffect } from 'react';
import { XCircle } from 'lucide-react';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-container">
      <XCircle size={20} className="toast-icon" />
      <span className="toast-text">{message}</span>
    </div>
  );
}

