"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  RefreshCw,
  AlertCircle,
  GitBranch,
  Globe,
  X,
  Star,
  SlidersHorizontal,
  Check,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { FreelancerCardSkeleton } from "@/components/ui/Skeleton";
import { getAllProfiles, type FreelancerProfile } from "@/lib/profiles";
import { getReputation } from "@/lib/contract";

function truncateAddress(addr: string) {
  const a = addr.toUpperCase();
  return `${a.slice(0, 6)}...${a.slice(-6)}`;
}

function FreelancerCard({
  profile,
  reputation,
}: {
  profile: FreelancerProfile;
  reputation?: number;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-7 min-h-[16rem] flex flex-col justify-between gap-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200 group">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {profile.name ?? truncateAddress(profile.wallet_address)}
            </p>
            {/*<p className="inline-block w-fit text-xs font-sans text-muted-foreground bg-muted rounded-md px-2 py-0.5">
              {truncateAddress(profile.wallet_address)}
            </p>*/}
          </div>
          {reputation !== undefined && reputation > 0 && (
            <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-700">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              {reputation}
            </span>
          )}
        </div>

        {profile.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {profile.skills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-blue-200/70 bg-blue-50/80 px-2.5 py-0.5 text-xs font-medium text-blue-700"
              >
                {skill}
              </span>
            ))}
            {profile.skills.length > 6 && (
              <span className="rounded-full border border-blue-200/70 bg-blue-50/80 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                +{profile.skills.length - 6}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
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
        </div>
        <Link href={`/freelancers/${profile.wallet_address}`}>
          <Button variant="outline" size="sm">
            View profile
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function FreelancersPage() {
  const [profiles, setProfiles] = useState<FreelancerProfile[]>([]);
  const [reputations, setReputations] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeSkills, setActiveSkills] = useState<Set<string>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProfiles();
      setProfiles(data);
      const scores = await Promise.all(
        data.map((p) => getReputation(p.wallet_address.toUpperCase()).catch(() => 0)),
      );
      const repMap: Record<string, number> = {};
      data.forEach((p, i) => {
        repMap[p.wallet_address] = scores[i];
      });
      setReputations(repMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load talent");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

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

  const hasFilters = search.trim() !== "" || activeSkills.size > 0;

  function clearFilters() {
    setSearch("");
    setActiveSkills(new Set());
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background">
        {/* ── Sticky title + search – pins just below the navbar ── */}
        <div className="sticky top-[57px] z-20 bg-background border-b border-border">
          <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <div className="py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-primary">Find Talent</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse freelancers ready to work on your Stellar project.
                </p>
              </div>

              {/* Embedded Search + Skills Filter */}
              {!loading && !error && profiles.length > 0 && (
                <div ref={searchContainerRef} className="relative w-full sm:w-80 md:w-123">
                  <div className="relative flex items-center">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onFocus={() => setDropdownOpen(true)}
                      placeholder="Search talent..."
                      className="w-full rounded-xl border border-border bg-card pl-10 pr-24 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all shadow-xs"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      {search && (
                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          aria-label="Clear search input"
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {allSkills.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setDropdownOpen((prev) => !prev)}
                          aria-label="Toggle skills filter"
                          aria-expanded={dropdownOpen}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                            activeSkills.size > 0
                              ? "bg-accent text-white"
                              : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                          }`}
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          {activeSkills.size > 0 ? (
                            <span className="font-bold">{activeSkills.size}</span>
                          ) : (
                            <span>Skills</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Embedded Skills Popover Dropdown */}
                  {dropdownOpen && allSkills.length > 0 && (
                    <div className="absolute right-0 top-full mt-2 z-30 w-full sm:w-96 rounded-2xl border border-border bg-card p-4 shadow-xl animate-fade-in">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Filter by Skills
                          </span>
                          {activeSkills.size > 0 && (
                            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                              {activeSkills.size} selected
                            </span>
                          )}
                        </div>
                        {activeSkills.size > 0 && (
                          <button
                            type="button"
                            onClick={() => setActiveSkills(new Set())}
                            className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
                        {allSkills.map((skill) => {
                          const isSelected = activeSkills.has(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                                isSelected
                                  ? "border-accent bg-accent/10 text-accent font-semibold shadow-xs"
                                  : "border-border bg-muted/60 text-muted-foreground hover:border-slate-300 hover:text-foreground"
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                              {skill}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {activeSkills.size === 0
                            ? "All skills included"
                            : `${activeSkills.size} skill filter${activeSkills.size > 1 ? "s" : ""} active`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDropdownOpen(false)}
                          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Freelancer grid – window scrolls, Lenis drives it ── */}
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <FreelancerCardSkeleton key={i} />
              ))}
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
                  <FreelancerCard
                    key={profile.wallet_address}
                    profile={profile}
                    reputation={reputations[profile.wallet_address]}
                  />
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
