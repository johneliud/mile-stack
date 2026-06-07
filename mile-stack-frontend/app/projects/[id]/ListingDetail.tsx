"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, RefreshCw, FolderOpen, Wallet, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { useNotification } from "@/components/Notification";
import { useWallet } from "@/contexts/WalletContext";
import { getListing, applyToListing, hasApplied, type Listing } from "@/lib/listings";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function ListingDetail({ listingId }: { listingId: string }) {
  const { address, isConnected, isFreighterInstalled, connect } = useWallet();
  const { notify } = useNotification();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);

  const fetchListing = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getListing(listingId);
      setListing(data);
    } catch (err) {
      console.error("[ListingDetail] fetchListing:", err);
      setError(err instanceof Error ? err.message : "Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  useEffect(() => {
    if (!address || !listingId) return;
    hasApplied(listingId, address)
      .then(setAlreadyApplied)
      .catch((err) => console.error("[ListingDetail] hasApplied:", err));
  }, [address, listingId]);

  const handleApply = async () => {
    if (!address) return;
    setSubmitting(true);
    try {
      await applyToListing(listingId, address, message);
      setApplied(true);
      setAlreadyApplied(true);
      notify("Application submitted successfully.", "success");
    } catch (err) {
      console.error("[ListingDetail] handleApply:", err);
      notify(err instanceof Error ? err.message : "Failed to submit application", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const isClient =
    listing && address ? listing.client_address.toLowerCase() === address.toLowerCase() : false;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background py-12">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <RefreshCw className="h-7 w-7 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Loading project...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-4" />
              <h2 className="text-lg font-semibold text-foreground">Failed to load project</h2>
              <p className="mt-1 text-sm text-muted-foreground mb-6">{error}</p>
              <Button variant="outline" onClick={fetchListing}>
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          )}

          {/* Not found */}
          {!loading && !error && !listing && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold text-foreground">Project not found</h2>
            </div>
          )}

          {/* Listing detail */}
          {!loading && !error && listing && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main content */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h1 className="text-3xl font-bold text-primary">{listing.title}</h1>
                    {listing.status === "filled" && (
                      <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground border border-border">
                        Filled
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Posted {timeAgo(listing.created_at)}
                  </p>
                </div>

                {/* Description */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Description
                  </h2>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {listing.description}
                  </p>
                </div>

                {/* Skills */}
                {listing.skills.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                      Required Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {listing.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-sm font-medium text-accent"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestones */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Milestones
                  </h2>
                  <div className="divide-y divide-border">
                    {listing.milestones.map((m, i) => (
                      <div key={i} className="flex items-center justify-between gap-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                            {i + 1}
                          </span>
                          <span className="text-sm text-foreground">{m.title}</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground tabular-nums shrink-0">
                          {m.amount_xlm.toLocaleString("en-US", { maximumFractionDigits: 2 })} XLM
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="flex flex-col gap-4">
                {/* Budget summary */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Total Budget
                  </p>
                  <p className="text-3xl font-bold text-accent">
                    {listing.total_xlm.toLocaleString("en-US", { maximumFractionDigits: 2 })} XLM
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    across {listing.milestones.length} milestone
                    {listing.milestones.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Apply panel */}
                {listing.status === "filled" && (
                  <div className="rounded-2xl border border-border bg-card p-6 text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      This project has been filled.
                    </p>
                  </div>
                )}

                {listing.status === "open" && isClient && (
                  <div className="rounded-2xl border border-border bg-card p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      This is your listing.{" "}
                      <Link
                        href={`/client/listings/${listing.id}/applications`}
                        className="font-medium text-accent hover:underline"
                      >
                        Review applications
                      </Link>
                    </p>
                  </div>
                )}

                {listing.status === "open" && !isClient && (
                  <>
                    {/* Not connected */}
                    {!isConnected && (
                      <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <Wallet className="h-5 w-5 text-muted-foreground shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            {isFreighterInstalled === false
                              ? "Install Freighter to apply."
                              : "Connect your wallet to apply for this project."}
                          </p>
                        </div>
                        {isFreighterInstalled !== false && (
                          <Button variant="primary" onClick={connect}>
                            <Wallet className="h-4 w-4" />
                            Connect Wallet
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Already applied or just submitted */}
                    {isConnected && (alreadyApplied || applied) && (
                      <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-success shrink-0" />
                        <p className="text-sm font-medium text-foreground">Application submitted</p>
                      </div>
                    )}

                    {/* Apply form */}
                    {isConnected && !alreadyApplied && !applied && (
                      <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
                        <h3 className="text-sm font-semibold text-foreground">
                          Apply for this project
                        </h3>
                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="apply-message"
                            className="text-xs font-medium text-muted-foreground"
                          >
                            Message (optional)
                          </label>
                          <textarea
                            id="apply-message"
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Briefly describe your experience and why you're a good fit..."
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors resize-none"
                          />
                        </div>
                        <Button variant="primary" loading={submitting} onClick={handleApply}>
                          {submitting ? "Submitting..." : "Apply"}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
