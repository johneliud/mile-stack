"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type UserRole = "client" | "freelancer";

const STORAGE_KEY = "milestack_role";

interface RoleState {
  role: UserRole | null;
  setRole: (role: UserRole) => void;
  clearRole: () => void;
}

const RoleContext = createContext<RoleState | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "client" || stored === "freelancer") setRoleState(stored);
  }, []);

  const setRole = useCallback((r: UserRole) => {
    setRoleState(r);
    localStorage.setItem(STORAGE_KEY, r);
  }, []);

  const clearRole = useCallback(() => {
    setRoleState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole, clearRole }}>{children}</RoleContext.Provider>
  );
}

export function useRole(): RoleState {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside <RoleProvider>");
  return ctx;
}
