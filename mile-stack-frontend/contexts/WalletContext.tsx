"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  checkFreighterInstalled,
  checkWalletAllowed,
  getWalletAddress,
  requestWalletAccess,
} from "@/lib/freighter";
import { useNotification } from "@/components/Notification";

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isFreighterInstalled: boolean | null; // null while detecting on mount
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { notify } = useNotification();
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFreighterInstalled, setIsFreighterInstalled] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkFreighterInstalled()
      .then(async (installed) => {
        setIsFreighterInstalled(installed);
        if (installed) {
          // Silently restore the session if the site was already allowed
          const allowed = await checkWalletAllowed();
          if (allowed) {
            const addr = await getWalletAddress();
            if (addr) setAddress(addr);
          }
        }
      })
      .catch(() => setIsFreighterInstalled(false));
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    try {
      const addr = await requestWalletAccess();
      setAddress(addr);
      notify("Wallet connected successfully.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(message);
      notify(message, "error");
    } finally {
      setIsConnecting(false);
    }
  }, [notify]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setError(null);
    notify("Wallet disconnected.", "success");
  }, [notify]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: Boolean(address),
        isConnecting,
        isFreighterInstalled,
        error,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}
