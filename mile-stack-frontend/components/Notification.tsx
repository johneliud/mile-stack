"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

type NotificationType = "success" | "error";

interface NotificationData {
  message: string;
  type: NotificationType;
}

interface NotificationContextValue {
  notify: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [visible, setVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const notify = useCallback((message: string, type: NotificationType) => {
    if (!message) return;
    clearTimers();
    setNotification({ message, type });
    setVisible(false);
    timers.current = [
      setTimeout(() => setVisible(true), 10),
      setTimeout(() => setVisible(false), 3010),
      setTimeout(() => setNotification(null), 3350),
    ];
  }, []);

  const dismiss = useCallback(() => {
    clearTimers();
    setVisible(false);
    timers.current = [setTimeout(() => setNotification(null), 340)];
  }, []);

  const isSuccess = notification?.type === "success";

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      {notification && (
        <div
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className={`fixed right-4 top-20 z-[60] flex max-w-[90vw] items-start gap-3 rounded-xl px-4 py-3 shadow-lg transition-all duration-300 sm:max-w-sm ${
            isSuccess ? "bg-success text-white" : "bg-destructive text-white"
          } ${visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`}
        >
          {isSuccess ? (
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <p className="flex-1 text-sm font-medium leading-snug">{notification.message}</p>
          <button
            onClick={dismiss}
            aria-label="Dismiss notification"
            className="ml-1 shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
}
