import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastCtx = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(1);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((toast) => {
    const id = idRef.current++;
    const t = { id, type: toast.type || 'info', message: toast.message || '', title: toast.title || '', duration: toast.duration ?? 3000 };
    setToasts((prev) => [...prev, t]);
    if (t.duration > 0) {
      setTimeout(() => remove(id), t.duration);
    }
    return id;
  }, [remove]);

  const api = useMemo(() => ({
    push,
    success: (message, opts={}) => push({ ...opts, type: 'success', message }),
    error: (message, opts={}) => push({ ...opts, type: 'error', message }),
    info: (message, opts={}) => push({ ...opts, type: 'info', message }),
    remove,
  }), [push, remove]);

  return (
    <ToastCtx.Provider value={{ toasts, ...api }}>
      {children}
    </ToastCtx.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
