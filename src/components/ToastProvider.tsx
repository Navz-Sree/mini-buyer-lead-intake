"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ToastContextType {
  showToast: (msg: ReactNode, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ msg: ReactNode; type: string } | null>(null);
  const showToast = useCallback((msg: ReactNode, type: "success" | "error" | "info" = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-6 right-6 z-[1000] px-4 py-2 rounded shadow-lg text-white font-semibold transition bg-${toast.type === "success" ? "green" : toast.type === "error" ? "red" : "gray"}-700`}
        >
          {toast.msg}
        </div>
      )}
    </ToastContext.Provider>
  );
}
