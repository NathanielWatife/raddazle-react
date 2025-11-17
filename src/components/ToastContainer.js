import React from 'react';
import { useToast } from '../context/ToastContext';

const palette = {
  success: { bg: '#ffffff', fg: '#14532d', accent: '#16a34a' },
  error: { bg: '#ffffff', fg: '#7f1d1d', accent: '#dc2626' },
  info: { bg: '#ffffff', fg: '#1e3a8a', accent: '#2563eb' },
};

const icons = {
  success: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  error: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  info: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 16h-1v-4h-1m1-4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
};

export default function ToastContainer() {
  const { toasts, remove } = useToast();
  if (!toasts.length) return null;
  const t = toasts[toasts.length - 1];
  const colors = palette[t.type] || palette.info;
  return (
    <div className="overlay-toast-backdrop" role="dialog" aria-live="polite" aria-atomic="true">
      <div className="overlay-toast-card animate-pop" style={{ background: colors.bg, color: colors.fg, borderTop: `4px solid ${colors.accent}` }}>
        <div className="d-flex align-items-center justify-content-center gap-2">
          <span className="toast-type-icon" style={{ color: colors.accent }}>{icons[t.type] || icons.info}</span>
          <div className="text-center">
            {t.title && <div className="overlay-toast-title">{t.title}</div>}
            <div className="overlay-toast-message">{t.message}</div>
          </div>
        </div>
        <div className="overlay-toast-actions">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => remove(t.id)}>Close</button>
        </div>
      </div>
    </div>
  );
}
