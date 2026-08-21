import { useCallback, useRef, useState } from 'react';
import { ToastContext } from './toast-context';

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const showToast = useCallback((text) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setMessage(text);
    setVisible(true);
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
      timerRef.current = null;
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast" role="status" aria-live="polite" aria-atomic="true" hidden={!visible}>
        {message}
      </div>
    </ToastContext.Provider>
  );
}
