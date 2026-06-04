import Link from "next/link";
import { Layers } from "lucide-react";

const PLATFORM_LINKS = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Browse projects", href: "/projects" },
  { label: "Post a project", href: "/projects/new" },
];

const RESOURCES_LINKS = [
  {
    label: "Stellar testnet",
    href: "https://developers.stellar.org/docs/learn/fundamentals/networks",
  },
  { label: "Freighter wallet", href: "https://www.freighter.app" },
  {
    label: "Soroban docs",
    href: "https://developers.stellar.org/docs/build/smart-contracts/overview",
  },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const COLUMNS = [
  { heading: "Platform", links: PLATFORM_LINKS },
  { heading: "Resources", links: RESOURCES_LINKS },
  { heading: "Legal", links: LEGAL_LINKS },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        {/* Main content */}
        <div className="grid grid-cols-1 gap-12 py-12 md:grid-cols-[1fr_auto_auto_auto]">
          {/* Brand block */}
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-primary">Mile</span>
                <span className="text-accent">Stack</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Milestone-based XLM escrow payments on Stellar, connecting developers in the Global
              South with global employers through trustless, borderless financial infrastructure.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map(({ heading, links }) => (
            <div key={heading}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground">
                {heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                      {...(href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MileStack. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Built on Stellar &amp; Soroban</p>
        </div>
      </div>
    </footer>
  );
}
