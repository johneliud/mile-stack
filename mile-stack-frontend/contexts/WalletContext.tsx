"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { checkFreighterInstalled, getWalletAddress } from "@/lib/freighter";

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isFreighterInstalled: boolean | null; // null while checking on mount
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFreighterInstalled, setIsFreighterInstalled] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check Freighter availability on mount (browser-only)
  useEffect(() => {
    checkFreighterInstalled()
      .then(setIsFreighterInstalled)
      .catch(() => setIsFreighterInstalled(false));
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    try {
      const addr = await getWalletAddress();
      setAddress(addr);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setError(null);
  }, []);

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
