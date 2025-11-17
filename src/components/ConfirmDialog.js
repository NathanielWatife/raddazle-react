import React from 'react';
import { useConfirm } from '../context/ConfirmContext';

const icons = {
  danger: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  warning: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  info: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

export default function ConfirmDialog() {
  const { open, options, close } = useConfirm();
  if (!open) return null;

  const variant = options.variant || 'danger';
  const palette = {
    danger: { fg: '#7f1d1d', accent: '#dc2626' },
    warning: { fg: '#7a4d0b', accent: '#f59e0b' },
    info: { fg: '#1e3a8a', accent: '#2563eb' },
  }[variant];

  const onCancel = () => close(false);
  const onConfirm = () => close(true);

  return (
    <div className="overlay-toast-backdrop" onClick={onCancel}>
      <div className="overlay-confirm-card animate-pop" style={{ borderTop: `4px solid ${palette.accent}`, color: palette.fg }} onClick={(e)=>e.stopPropagation()}>
        <div className="overlay-confirm-icon" style={{ color: palette.accent }}>
          {icons[variant]}
        </div>
        <div className="overlay-confirm-content">
          {options.title && <div className="overlay-confirm-title">{options.title}</div>}
          {options.content ? (
            <div className="overlay-confirm-message">{options.content}</div>
          ) : (
            options.message && <div className="overlay-confirm-message">{options.message}</div>
          )}
        </div>
        <div className="overlay-confirm-actions">
          {Array.isArray(options.actions) && options.actions.length > 0 ? (
            <>
              <button className="btn btn-sm btn-outline-secondary" onClick={onCancel}>{options.cancelText || 'Cancel'}</button>
              {options.actions.map((a, idx) => (
                <button key={idx} className={`btn btn-sm ${a.variant === 'danger' ? 'btn-danger' : a.variant === 'warning' ? 'btn-warning' : 'btn-primary'}`}
                  onClick={() => close(a.value)}>
                  {a.label}
                </button>
              ))}
            </>
          ) : (
            <>
              <button className="btn btn-sm btn-outline-secondary" onClick={onCancel}>{options.cancelText || 'Cancel'}</button>
              <button className="btn btn-sm btn-primary" style={{ background: palette.accent, borderColor: palette.accent }} onClick={onConfirm}>{options.okText || 'Confirm'}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
