"use client";
import { createContext, useContext, useState } from "react";

export type ToastItem = { id: string; title?: string; description?: string };

const ToastContext = createContext<{
  push: (t: Omit<ToastItem, "id">) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  function push(t: Omit<ToastItem, "id">) {
    const id = Math.random().toString(36).slice(2);
    setItems((s) => [...s, { id, ...t }]);
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 3000);
  }
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed inset-x-0 top-2 z-50 mx-auto w-full max-w-md space-y-2">
        {items.map((i) => (
          <div
            key={i.id}
            className="rounded-md border border-neutral-200 bg-white p-3 shadow"
          >
            {i.title && <div className="text-sm font-medium">{i.title}</div>}
            {i.description && (
              <div className="text-sm text-neutral-600">{i.description}</div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

