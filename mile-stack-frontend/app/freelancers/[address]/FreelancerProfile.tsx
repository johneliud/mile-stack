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
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { useRole } from "@/contexts/RoleContext";
import { getProfile, type FreelancerProfile as Profile } from "@/lib/profiles";

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
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

          {/* Profile — two-column layout */}
          {!loading && !error && profile && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left — bio + skills */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Name + address header */}
                <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-bold text-primary">{profile.name}</h1>
                  <p className="text-sm font-mono text-muted-foreground">
                    {truncateAddress(profile.wallet_address)}
                  </p>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="text-sm font-semibold text-foreground mb-3">About</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {profile.skills.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="text-sm font-semibold text-foreground mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right — sidebar: hire CTA + links */}
              <div className="flex flex-col gap-4 lg:sticky lg:top-24">
                {/* Hire CTA for clients */}
                {role === "client" && (
                  <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
                    <div>
                      <p className="text-base font-semibold text-foreground">
                        Hire {profile.name?.split(" ")[0]}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Create a project and assign them directly. Funds held in escrow.
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
                  <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-3">
                    <h2 className="text-sm font-semibold text-foreground">Links</h2>
                    {profile.github_url && (
                      <a
                        href={profile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                      >
                        <GitBranch className="h-4 w-4 shrink-0" />
                        <span className="truncate">{profile.github_url}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 ml-auto" />
                      </a>
                    )}
                    {profile.portfolio_url && (
                      <a
                        href={profile.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                      >
                        <Globe className="h-4 w-4 shrink-0" />
                        <span className="truncate">{profile.portfolio_url}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 ml-auto" />
                      </a>
                    )}
                  </div>
                )}

                {/* Wallet address card */}
                <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-2">
                  <h2 className="text-sm font-semibold text-foreground">Stellar Address</h2>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {profile.wallet_address}
                  </p>
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
