"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRole } from "@/contexts/RoleContext";

export function LandingHeroCta() {
  const { role } = useRole();

  if (role === "client") {
    return (
      <div
        className="animate-fade-up mt-10 flex flex-wrap items-center gap-4"
        style={{ animationDelay: "240ms" }}
      >
        <Link href="/client/listings/new">
          <Button variant="primary" size="lg">
            Post a project
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
        <Link href="/client">
          <Button variant="outline" size="lg">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  if (role === "freelancer") {
    return (
      <div
        className="animate-fade-up mt-10 flex flex-wrap items-center gap-4"
        style={{ animationDelay: "240ms" }}
      >
        <Link href="/projects">
          <Button variant="primary" size="lg">
            Browse open projects
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
        <Link href="/freelancer">
          <Button variant="outline" size="lg">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="animate-fade-up mt-10 flex flex-wrap items-center gap-4"
      style={{ animationDelay: "240ms" }}
    >
      <Link href="/projects" className="w-full">
        <Button variant="primary" size="lg" className="w-full">
          Browse open projects
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </Link>
      {/*<Link href="/client">
        <Button variant="outline" size="lg">
          Hire talent
        </Button>
      </Link>*/}
    </div>
  );
}
