"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, RefreshCw, AlertCircle, FolderOpen } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
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
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:border-accent/40 transition-colors duration-150">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-foreground leading-snug">{listing.title}</h3>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {timeAgo(listing.created_at)}
        </span>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>

      {listing.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {listing.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="border-t border-border pt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            <span className="font-semibold text-primary">
              {listing.total_xlm.toLocaleString("en-US", { maximumFractionDigits: 2 })} XLM
            </span>
          </span>
          <span>
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background py-12">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-primary">Open Projects</h1>
            <p className="mt-2 text-muted-foreground">
              Browse projects posted by clients and apply with your Stellar wallet.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <RefreshCw className="h-7 w-7 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Loading projects...</p>
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

          {/* Empty */}
          {!loading && !error && listings.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold text-foreground">No open projects</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                No projects have been posted yet. Check back soon.
              </p>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && listings.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {listings.length} open project{listings.length !== 1 ? "s" : ""}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
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
