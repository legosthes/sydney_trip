import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Pencil, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "created" | "updated" | "deleted" | "checked" | "error";

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

declare global {
  interface Window {
    __toastBus?: {
      listeners: Set<(t: ToastData) => void>;
      nextId: number;
    };
  }
}

function getBus() {
  if (!window.__toastBus) {
    window.__toastBus = { listeners: new Set(), nextId: 0 };
  }
  return window.__toastBus;
}

export function showToast(message: string, type: ToastType = "created") {
  const bus = getBus();
  const toast: ToastData = { id: ++bus.nextId, message, type };
  bus.listeners.forEach((cb) => cb(toast));
}

export function useToast() {
  return { toast: showToast };
}

const toastStyles: Record<ToastType, string> = {
  created: "bg-emerald-600 text-white",
  updated: "bg-blue-600 text-white",
  deleted: "bg-red-500 text-white",
  checked: "bg-emerald-600 text-white",
  error: "bg-destructive text-destructive-foreground",
};

const toastIcons: Record<ToastType, typeof CheckCircle2> = {
  created: CheckCircle2,
  updated: Pencil,
  deleted: Trash2,
  checked: Check,
  error: X,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const bus = getBus();
    const cb = (t: ToastData) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 3500);
    };
    bus.listeners.add(cb);
    return () => {
      bus.listeners.delete(cb);
    };
  }, []);

  return (
    <>
      {children}
      {toasts.length > 0 &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
            {toasts.map((t) => {
              const Icon = toastIcons[t.type];
              return (
                <div
                  key={t.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium",
                    "animate-in slide-in-from-right-5 fade-in-0 duration-300",
                    toastStyles[t.type]
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{t.message}</span>
                  <button
                    onClick={() =>
                      setToasts((prev) => prev.filter((x) => x.id !== t.id))
                    }
                    className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}
