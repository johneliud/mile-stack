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
        <h2 className="text-2xl font-bold text-white mb-4">Ready to find top talent?</h2>
        <p className="text-slate-300 mb-8 max-w-xl mx-auto text-sm leading-relaxed">
          Post your project, define milestones, and pay only when work is delivered. Trustless
          escrow powered by Stellar.
        </p>
        <Link href="/client/listings/new">
          <Button variant="accent" size="lg">
            Post a project
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </ScrollReveal>
    );
  }

  return (
    <ScrollReveal>
      <h2 className="text-2xl font-bold text-white mb-4">Your skills deserve global pay</h2>
      <p className="text-slate-300 mb-8 max-w-xl mx-auto text-sm leading-relaxed">
        Connect your Freighter wallet, apply to open projects, and get paid in XLM the moment your
        work is approved. No banks, no borders, no delays.
      </p>
      <Link href="/projects">
        <Button variant="accent" size="lg">
          Find your next project
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </Link>
    </ScrollReveal>
  );
}
