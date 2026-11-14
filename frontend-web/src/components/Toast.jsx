import React, { useEffect } from 'react';
import { XCircle, CheckCircle2 } from 'lucide-react';

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const msgText = typeof message === 'string' ? message : message?.text || '';
  const isSuccess = type === 'success' || (
    msgText.toLowerCase().includes('success') ||
    msgText.toLowerCase().includes('invalidated') ||
    msgText.toLowerCase().includes('cleared') ||
    msgText.toLowerCase().includes('added') ||
    msgText.toLowerCase().includes('refreshed') ||
    msgText.toLowerCase().includes('evicted')
  );

  return (
    <div className={`toast-container ${isSuccess ? 'toast-success' : 'toast-error'}`}>
      {isSuccess ? (
        <CheckCircle2 size={20} className="toast-icon-success" />
      ) : (
        <XCircle size={20} className="toast-icon" />
      )}
      <span className="toast-text">{msgText}</span>
    </div>
  );
}
