"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  Search,
  X,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { ListingCardSkeleton } from "@/components/ui/Skeleton";
import { getOpenListings, type Listing } from "@/lib/listings";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-7 min-h-[16rem] flex flex-col justify-between gap-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200 group">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
            {timeAgo(listing.created_at)}
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {listing.description}
        </p>

        {listing.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {listing.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-blue-200/70 bg-blue-50/80 px-2.5 py-0.5 text-xs font-medium text-blue-700"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-sm font-bold text-amber-700 font-poppins">
            {listing.total_xlm.toLocaleString("en-US", { maximumFractionDigits: 2 })} XLM
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {listing.milestones.length} milestone{listing.milestones.length !== 1 ? "s" : ""}
          </span>
        </div>
        <Link href={`/projects/${listing.id}`}>
          <Button variant="outline" size="sm">
            View
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeSkills, setActiveSkills] = useState<Set<string>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOpenListings();
      setListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
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
    listings.forEach((l) => l.skills.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [listings]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return listings.filter((l) => {
      const matchesSearch =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.skills.some((s) => s.toLowerCase().includes(q));
      const matchesSkills =
        activeSkills.size === 0 || [...activeSkills].every((s) => l.skills.includes(s));
      return matchesSearch && matchesSkills;
    });
  }, [listings, search, activeSkills]);

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
                <h1 className="text-3xl font-bold text-primary">Open Projects</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse projects posted by clients and apply with your Stellar wallet.
                </p>
              </div>

              {/* Embedded Search + Skills Filter */}
              {!loading && !error && listings.length > 0 && (
                <div ref={searchContainerRef} className="relative w-full sm:w-80 md:w-123">
                  <div className="relative flex items-center">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onFocus={() => setDropdownOpen(true)}
                      placeholder="Search projects..."
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

        {/* ── Project grid – window scrolls, Lenis drives it ── */}
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-4" />
              <h2 className="text-lg font-semibold text-foreground">Failed to load projects</h2>
              <p className="mt-1 text-sm text-muted-foreground mb-6">
                {error === "SUPABASE_NOT_CONFIGURED"
                  ? "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local."
                  : error}
              </p>
              <Button variant="outline" onClick={fetchListings}>
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          )}

          {/* Empty (no listings at all) */}
          {!loading && !error && listings.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold text-foreground">No open projects</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                No projects have been posted yet. Check back soon.
              </p>
            </div>
          )}

          {/* No results after filtering */}
          {!loading && !error && listings.length > 0 && filtered.length === 0 && (
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
                {filtered.length} open project{filtered.length !== 1 ? "s" : ""}
                {hasFilters ? " matching your filters" : ""}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
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
