import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ConfirmCtx = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState({ open: false, options: {}, resolver: null });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setState({ open: true, options: options || {}, resolver: resolve });
    });
  }, []);

  const close = useCallback((result) => {
    setState((prev) => {
      prev.resolver && prev.resolver(result);
      return { open: false, options: {}, resolver: null };
    });
  }, []);

  const api = useMemo(() => ({ confirm, close }), [confirm, close]);

  return (
    <ConfirmCtx.Provider value={{ ...state, ...api }}>
      {children}
    </ConfirmCtx.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
};
