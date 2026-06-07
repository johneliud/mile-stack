"use client";

import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useWallet } from "@/contexts/WalletContext";

interface WalletGuardProps {
  children: React.ReactNode;
  message?: string;
}

export function WalletGuard({ children, message }: WalletGuardProps) {
  const { isConnected, isFreighterInstalled, connect } = useWallet();

  if (isConnected) return <>{children}</>;

  const defaultMessage = isFreighterInstalled === false
    ? "Install the Freighter browser extension to get started."
    : "Connect your Freighter wallet to continue.";

  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center">
      <Wallet className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
      <h2 className="text-lg font-semibold text-foreground">Connect your wallet</h2>
      <p className="mt-1 text-sm text-muted-foreground mb-6">{message ?? defaultMessage}</p>
      {isFreighterInstalled === false ? (
        <a
          href="https://www.freighter.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 cursor-pointer"
        >
          Install Freighter
        </a>
      ) : (
        <Button variant="primary" onClick={connect}>
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      )}
    </div>
  );
}
