'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    opts: ConfirmOptions;
    resolver: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    return new Promise<boolean>((resolve) => {
      setState({ opts, resolver: resolve });
    });
  }, []);

  const close = (value: boolean) => {
    if (state) {
      state.resolver(value);
      setState(null);
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {state && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
            onClick={() => close(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex gap-4">
                  {state.opts.variant === 'danger' && (
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                      {state.opts.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{state.opts.message}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => close(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition font-medium"
                >
                  {state.opts.cancelText || 'Cancel'}
                </button>
                <button
                  onClick={() => close(true)}
                  autoFocus
                  className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition ${
                    state.opts.variant === 'danger'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-[#1C1C1E] hover:bg-[#1C1C1E]/90'
                  }`}
                >
                  {state.opts.confirmText || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx;
}
