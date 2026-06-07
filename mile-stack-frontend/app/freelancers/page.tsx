"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users, RefreshCw, AlertCircle, GitBranch, Globe, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { getAllProfiles, type FreelancerProfile } from "@/lib/profiles";

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
}

function FreelancerCard({ profile }: { profile: FreelancerProfile }) {
  return (
    <Link
      href={`/freelancers/${profile.wallet_address}`}
      className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:border-accent/40 transition-colors duration-150 cursor-pointer"
    >
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-foreground">
          {profile.name ?? truncateAddress(profile.wallet_address)}
        </p>
        <p className="text-xs font-mono text-muted-foreground">
          {truncateAddress(profile.wallet_address)}
        </p>
      </div>

      {profile.bio && <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>}

      {profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {profile.skills.slice(0, 6).map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
            >
              {skill}
            </span>
          ))}
          {profile.skills.length > 6 && (
            <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
              +{profile.skills.length - 6}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-4">
        {profile.github_url && (
          <span className="inline-flex items-center gap-1 text-xs text-accent/70">
            <GitBranch className="h-3.5 w-3.5" />
            GitHub
          </span>
        )}
        {profile.portfolio_url && (
          <span className="inline-flex items-center gap-1 text-xs text-accent/70">
            <Globe className="h-3.5 w-3.5" />
            Portfolio
          </span>
        )}
        <span className="ml-auto text-xs font-medium text-accent">View profile →</span>
      </div>
    </Link>
  );
}

export default function FreelancersPage() {
  const [profiles, setProfiles] = useState<FreelancerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeSkills, setActiveSkills] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProfiles();
      setProfiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load talent");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const allSkills = useMemo(() => {
    const set = new Set<string>();
    profiles.forEach((p) => p.skills.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [profiles]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return profiles.filter((p) => {
      const matchesSearch =
        !q ||
        (p.name ?? "").toLowerCase().includes(q) ||
        (p.bio ?? "").toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q));
      const matchesSkills =
        activeSkills.size === 0 || [...activeSkills].every((s) => p.skills.includes(s));
      return matchesSearch && matchesSkills;
    });
  }, [profiles, search, activeSkills]);

  function toggleSkill(skill: string) {
    setActiveSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  }

  function clearFilters() {
    setSearch("");
    setActiveSkills(new Set());
  }

  const hasFilters = search.trim() !== "" || activeSkills.size > 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background py-12">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">Find Talent</h1>
            <p className="mt-2 text-muted-foreground">
              Browse freelancers ready to work on your Stellar project.
            </p>
          </div>

          {/* Search + filters */}
          {!loading && !error && profiles.length > 0 && (
            <div className="mb-8 flex flex-col gap-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, bio, or skill..."
                  className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
                />
              </div>

              {allSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  {allSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        activeSkills.has(skill)
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-muted text-muted-foreground hover:border-accent/40"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer ml-1"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <RefreshCw className="h-7 w-7 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Loading talent...</p>
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

          {/* Empty state (no profiles at all) */}
          {!loading && !error && profiles.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <Users className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold text-foreground">No freelancers yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Freelancers who complete their profile will appear here.
              </p>
            </div>
          )}

          {/* No results after filtering */}
          {!loading && !error && profiles.length > 0 && filtered.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <Search className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold text-foreground">No matches</h2>
              <p className="mt-1 text-sm text-muted-foreground mb-4">
                Try different keywords or remove some skill filters.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-accent hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && filtered.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {filtered.length} freelancer{filtered.length !== 1 ? "s" : ""}
                {hasFilters ? " matching your filters" : ""}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((profile) => (
                  <FreelancerCard key={profile.wallet_address} profile={profile} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
