"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Wallet, ExternalLink } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Projects", href: "/projects" },
  { label: "Freelancer", href: "/freelancer" },
  { label: "Client", href: "/client" },
];

function truncateAddress(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function WalletButton({ onClose }: { onClose?: () => void }) {
  const { address, isConnected, isConnecting, isFreighterInstalled, connect, disconnect } =
    useWallet();

  const handleConnect = async () => {
    onClose?.();
    await connect();
  };

  const handleDisconnect = () => {
    onClose?.();
    disconnect();
  };

  // Still detecting whether Freighter is installed
  if (isFreighterInstalled === null) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Wallet className="h-4 w-4" aria-hidden="true" />
        Connect Wallet
      </Button>
    );
  }

  // Freighter not installed
  if (!isFreighterInstalled) {
    return (
      <a
        href="https://www.freighter.app"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted cursor-pointer"
      >
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
        Install Freighter
      </a>
    );
  }

  // Connected — show address + disconnect
  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground tabular-nums">
          {truncateAddress(address)}
        </span>
        <button
          onClick={handleDisconnect}
          aria-label="Disconnect wallet"
          className="rounded-lg border border-border p-2 px-6 text-muted-foreground transition-colors duration-150 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
        >
          Log out
        </button>
      </div>
    );
  }

  // Not connected
  return (
    <Button variant="outline" size="sm" loading={isConnecting} onClick={handleConnect}>
      <Wallet className="h-4 w-4" aria-hidden="true" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}

function MobileWalletButton({ onClose }: { onClose: () => void }) {
  const { address, isConnected, isConnecting, isFreighterInstalled, connect, disconnect } =
    useWallet();

  const handleConnect = async () => {
    onClose();
    await connect();
  };

  const handleDisconnect = () => {
    onClose();
    disconnect();
  };

  if (isFreighterInstalled === null) {
    return (
      <Button variant="primary" size="md" className="w-full" disabled>
        <Wallet className="h-4 w-4" aria-hidden="true" />
        Connect Wallet
      </Button>
    );
  }

  if (!isFreighterInstalled) {
    return (
      <a
        href="https://www.freighter.app"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
        Install Freighter
      </a>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex flex-col gap-2">
        <p className="rounded-lg border border-border bg-muted px-3 py-2.5 text-sm font-medium text-foreground tabular-nums text-center">
          {truncateAddress(address)}
        </p>
        <button
          onClick={handleDisconnect}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="md"
      className="w-full"
      loading={isConnecting}
      onClick={handleConnect}
    >
      <Wallet className="h-4 w-4" aria-hidden="true" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}

function isActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setMenuOpen(false);
      setClosing(false);
    }, 220);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-primary">Mile</span>
              <span className="text-accent">Stack</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => {
              const active = isActive(href, pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                    active
                      ? "bg-primary text-background"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop wallet */}
          <div className="hidden md:flex items-center gap-3">
            <WalletButton />
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-40 bg-foreground/20 md:hidden ${
              closing ? "animate-fade-out" : "animate-fade-in"
            }`}
            aria-hidden="true"
          />

          {/* Slide-in panel */}
          <div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className={`fixed top-0 right-0 z-50 flex h-full w-[75vw] flex-col border-l border-border bg-card shadow-xl md:hidden ${
              closing ? "animate-slide-out-right" : "animate-slide-in-right"
            }`}
          >
            {/* Panel header */}
            <div className="flex h-16 items-center justify-between border-b border-border px-6">
              <span className="text-sm font-semibold text-foreground">Menu</span>
              <button
                onClick={closeMenu}
                aria-label="Close menu"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Nav links */}
            <nav aria-label="Mobile navigation" className="flex flex-col px-6 py-4">
              {NAV_LINKS.map(({ label, href }) => {
                const active = isActive(href, pathname);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMenu}
                    className={`border-b border-border py-4 text-base font-medium transition-colors last:border-b-0 ${
                      active
                        ? "text-primary font-black"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Wallet at the bottom */}
            <div className="mt-auto border-t border-border px-6 py-5">
              <MobileWalletButton onClose={closeMenu} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
