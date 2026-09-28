import React from 'react';
import { ToastMessage } from '../../types';
import { IconAlert, IconClose } from './Icons';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <div style={{ marginTop: '2px' }}>
            <IconAlert
              size={18}
              color={
                t.type === 'success'
                  ? 'var(--success)'
                  : t.type === 'danger'
                  ? 'var(--danger)'
                  : t.type === 'warning'
                  ? 'var(--warning)'
                  : 'var(--primary)'
              }
            />
          </div>
          <div className="toast-content">
            {t.title && <div className="toast-title">{t.title}</div>}
            <div className="toast-message">{t.message}</div>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '2px',
            }}
          >
            <IconClose size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
