"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
];

export function Navbar() {
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

  // Close on outside click
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

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, closeMenu]);

  // Prevent body scroll while menu is open
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
            <span className="text-2xl font-bold text-primary tracking-tight">
              Mile<span className="text-accent">Stack</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" size="sm" disabled>
              Connect Wallet
            </Button>
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

      {/* Mobile menu overlay + panel */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-40 bg-foreground/20 md:hidden ${
              closing ? "animate-fade-out" : "animate-fade-in"
            }`}
            aria-hidden="true"
          />

          {/* Slide-in panel — 75vw from the right */}
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
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className="border-b border-border py-4 text-base font-medium text-muted-foreground transition-colors hover:text-foreground last:border-b-0"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Connect Wallet at the bottom */}
            <div className="mt-auto border-t border-border px-6 py-5">
              <Button variant="primary" size="md" className="w-full" disabled>
                Connect Wallet
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
