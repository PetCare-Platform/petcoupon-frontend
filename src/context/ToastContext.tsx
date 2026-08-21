import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const showToast = useCallback((next: string) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setMessage(next);
    timerRef.current = window.setTimeout(() => setMessage(null), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-6 right-6 z-[200] max-w-[min(420px,calc(100vw-48px))] rounded-control border border-ink bg-paper px-5 py-4 text-[15px] shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-all duration-200"
        style={{
          opacity: message ? 1 : 0,
          transform: message ? "translateY(0)" : "translateY(8px)",
          pointerEvents: "none",
        }}
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
