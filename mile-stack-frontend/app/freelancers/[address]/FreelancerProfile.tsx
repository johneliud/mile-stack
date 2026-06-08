"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  GitBranch,
  Globe,
  RefreshCw,
  AlertCircle,
  User,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { useRole } from "@/contexts/RoleContext";
import { getProfile, type FreelancerProfile as Profile } from "@/lib/profiles";

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function FreelancerProfile({ address }: { address: string }) {
  const { role } = useRole();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProfile(address);
      if (!data || !data.name) {
        setNotFound(true);
      } else {
        setProfile(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [address]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background py-12">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/freelancers"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            All Freelancers
          </Link>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <RefreshCw className="h-7 w-7 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-4" />
              <h2 className="text-lg font-semibold text-foreground">Failed to load</h2>
              <p className="mt-1 text-sm text-muted-foreground mb-6">{error}</p>
              <Button variant="outline" onClick={load}>
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          )}

          {/* Not found */}
          {!loading && !error && notFound && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <User className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold text-foreground">Profile not found</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This freelancer has not set up their profile yet.
              </p>
            </div>
          )}

          {/* Profile */}
          {!loading && !error && profile && (
            <div className="flex flex-col gap-6">
              {/* Header card */}
              <div className="bg-card border border-border rounded-2xl shadow-sm">
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {/* Avatar */}
                  <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <span className="text-xl font-bold text-accent">
                      {profile.name ? getInitials(profile.name) : <User className="h-7 w-7" />}
                    </span>
                  </div>

                  {/* Name + address */}
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary leading-tight">
                      {profile.name}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 w-fit bg-muted border border-border rounded-lg px-2.5 py-1 text-xs font-mono text-muted-foreground">
                      <Wallet className="h-3.5 w-3.5 shrink-0" />
                      {truncateAddress(profile.wallet_address)}
                    </span>
                  </div>

                  {/* Hire CTA inline for clients (sm+) */}
                  {role === "client" && (
                    <div className="sm:ml-auto shrink-0">
                      <Link href={`/client/projects/new?freelancer=${profile.wallet_address}`}>
                        <Button variant="primary" size="md">
                          Start a Project
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Body: two-column */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left - bio + skills */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {profile.bio && (
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                      <h2 className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
                        About
                      </h2>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {profile.bio}
                      </p>
                    </div>
                  )}

                  {profile.skills.length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                      <h2 className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">
                        Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right sidebar */}
                <div className="flex flex-col gap-4 lg:sticky lg:top-24">
                  {/* Hire CTA card for clients (stacked below header on mobile) */}
                  {role === "client" && (
                    <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 flex flex-col gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Ready to hire {profile.name?.split(" ")[0]}?
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Create a project and assign them directly. Funds are held in escrow until
                          each milestone is approved.
                        </p>
                      </div>
                      <Link href={`/client/projects/new?freelancer=${profile.wallet_address}`}>
                        <Button variant="primary" size="md" className="w-full">
                          Start a Project
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Links */}
                  {(profile.github_url || profile.portfolio_url) && (
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-1">
                      <h2 className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
                        Links
                      </h2>
                      {profile.github_url && (
                        <a
                          href={profile.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          <GitBranch className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-accent transition-colors" />
                          <span className="truncate flex-1">GitHub</span>
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-accent transition-colors" />
                        </a>
                      )}
                      {profile.portfolio_url && (
                        <a
                          href={profile.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          <Globe className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-accent transition-colors" />
                          <span className="truncate flex-1">Portfolio</span>
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-accent transition-colors" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Wallet address */}
                  {/*<div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-2">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
                      Stellar Address
                    </h2>
                    <p className="text-xs font-mono text-muted-foreground break-all bg-muted rounded-lg px-3 py-2.5">
                      {profile.wallet_address}
                    </p>
                  </div>*/}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
