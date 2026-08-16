"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useRole } from "@/contexts/RoleContext";

export function LandingBottomCta() {
  const { role } = useRole();

  if (role === "client") {
    return (
      <ScrollReveal>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-warning mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
          Zero Upfront Risk
        </div>
        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight sm:text-4xl">
          Ready to find top global talent?
        </h2>
        <p className="text-slate-300 mb-8 max-w-xl mx-auto text-base leading-relaxed">
          Post your project, define milestones, and release XLM only when work is delivered.
          Trustless escrow powered by Stellar.
        </p>
        <Link href="/client/listings/new">
          <Button variant="accent" size="lg" className="shadow-lg shadow-blue-500/25">
            Post a project
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </ScrollReveal>
    );
  }

  return (
    <ScrollReveal>
      <h2 className="text-3xl font-bold text-white mb-4 tracking-tight sm:text-4xl">
        Your skills deserve global pay
      </h2>
      <p className="text-slate-300 mb-8 max-w-xl mx-auto text-base leading-relaxed">
        Connect your Freighter wallet, apply to open projects, and get paid in XLM the moment your
        work is approved. No banks, no wire fees, no delays.
      </p>
      <Link href="/projects">
        <Button variant="accent" size="lg" className="shadow-lg shadow-blue-500/25">
          Find your next project
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </Link>
    </ScrollReveal>
  );
}
