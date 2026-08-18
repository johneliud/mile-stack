"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Users,
  Wallet,
  Check,
  X,
  CheckCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { ApplicationCardSkeleton } from "@/components/ui/Skeleton";
import { useNotification } from "@/components/Notification";
import { useWallet } from "@/contexts/WalletContext";
import {
  getListing,
  getApplications,
  acceptApplication,
  rejectApplication,
  type Listing,
  type Application,
} from "@/lib/listings";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function truncateAddress(addr: string) {
  const a = addr.toUpperCase();
  return `${a.slice(0, 6)}...${a.slice(-6)}`;
}

const STATUS_STYLES: Record<Application["status"], string> = {
  pending: "bg-blue-50 text-accent border-blue-200",
  accepted: "bg-emerald-50 text-success border-emerald-200",
  rejected: "bg-slate-100 text-slate-500 border-slate-200",
};

function ApplicationCard({
  application,
  listingOpen,
  isAccepting,
  isRejecting,
  onAccept,
  onReject,
}: {
  application: Application;
  listingOpen: boolean;
  isAccepting: boolean;
  isRejecting: boolean;
  onAccept: (app: Application) => void;
  onReject: (app: Application) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const isPending = application.status === "pending";
  const canAct = listingOpen && isPending;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <a
            href={`/freelancers/${application.freelancer_address}`}
            className="text-sm font-semibold text-foreground font-sans hover:text-accent transition-colors"
          >
            {truncateAddress(application.freelancer_address)}
          </a>
          <p className="text-xs text-muted-foreground">{timeAgo(application.created_at)}</p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[application.status]}`}
        >
          {application.status}
        </span>
      </div>

      {application.message && (
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap border-t border-border pt-4">
          {application.message}
        </p>
      )}

      {canAct && !confirming && (
        <div className="border-t border-border pt-4 flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            loading={isAccepting}
            onClick={() => setConfirming(true)}
          >
            <Check className="h-4 w-4" />
            Accept
          </Button>
          <Button
            variant="destructive"
            size="sm"
            loading={isRejecting}
            onClick={() => onReject(application)}
          >
            <X className="h-4 w-4" />
            Reject
          </Button>
        </div>
      )}

      {canAct && confirming && (
        <div className="border-t border-border pt-4 rounded-xl bg-muted/50 p-4 flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">
              Accept this applicant and create an on-chain escrow project?
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            This will trigger a Freighter popup to sign the transaction. All other applications will
            be automatically rejected.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              loading={isAccepting}
              onClick={() => {
                setConfirming(false);
                onAccept(application);
              }}
            >
              <Check className="h-4 w-4" />
              {isAccepting ? "Creating project..." : "Confirm"}
            </Button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={isAccepting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted cursor-pointer disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const { address, isConnected, isFreighterInstalled, connect } = useWallet();
  const { notify } = useNotification();

  const [listing, setListing] = useState<Listing | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [listingData, appsData] = await Promise.all([
        getListing(listingId),
        getApplications(listingId),
      ]);
      setListing(listingData);
      setApplications(appsData);
    } catch (err) {
      console.error("[Applications] fetchData:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [listingId]);

  const handleAccept = async (application: Application) => {
    if (!address || !listing) return;
    setAcceptingId(application.id);
    try {
      const projectId = await acceptApplication(
        listingId,
        application.id,
        application.freelancer_address,
        listing.milestones,
        address,
        listing.title,
      );
      notify(`Project #${projectId} created - freelancer accepted.`, "success");
      router.push(`/client/projects/${projectId}`);
    } catch (err) {
      console.error("[Applications] handleAccept:", err);
      notify(err instanceof Error ? err.message : "Failed to accept application", "error");
      setAcceptingId(null);
    }
  };

  const handleReject = async (application: Application) => {
    setRejectingId(application.id);
    try {
      await rejectApplication(application.id);
      setApplications((prev) =>
        prev.map((a) => (a.id === application.id ? { ...a, status: "rejected" } : a)),
      );
      notify("Application rejected.", "success");
    } catch (err) {
      console.error("[Applications] handleReject:", err);
      notify(err instanceof Error ? err.message : "Failed to reject application", "error");
    } finally {
      setRejectingId(null);
    }
  };

  const isOwner =
    listing && address ? listing.client_address.toLowerCase() === address.toLowerCase() : false;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background py-12">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/client"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <ApplicationCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-4" />
              <h2 className="text-lg font-semibold text-foreground">Failed to load</h2>
              <p className="mt-1 text-sm text-muted-foreground mb-6">{error}</p>
              <Button variant="outline" onClick={fetchData}>
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          )}

          {/* Wallet not connected */}
          {!loading && !error && !isConnected && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <Wallet className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold text-foreground">Connect your wallet</h2>
              <p className="mt-1 text-sm text-muted-foreground mb-6">
                {isFreighterInstalled === false
                  ? "Install Freighter to manage applications."
                  : "Connect your wallet to review applications."}
              </p>
              {isFreighterInstalled !== false && (
                <Button variant="primary" onClick={connect}>
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </Button>
              )}
            </div>
          )}

          {/* Unauthorized */}
          {!loading && !error && isConnected && listing && !isOwner && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-4" />
              <h2 className="text-lg font-semibold text-foreground">Unauthorized</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Only the client who posted this listing can review applications.
              </p>
            </div>
          )}

          {/* Content */}
          {!loading && !error && isConnected && listing && isOwner && (
            <div className="flex flex-col gap-8">
              {/* Header */}
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-primary">{listing.title}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                      listing.status === "open"
                        ? "bg-blue-50 text-accent border-blue-200"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {listing.status}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {listing.total_xlm.toLocaleString("en-US", { maximumFractionDigits: 2 })} XLM
                    total &middot; {listing.milestones.length} milestone
                    {listing.milestones.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Filled state */}
              {listing.status === "filled" && listing.on_chain_project_id && (
                <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success shrink-0" />
                    <p className="text-sm font-medium text-foreground">
                      A freelancer has been accepted. Project #{listing.on_chain_project_id} is
                      active on-chain.
                    </p>
                  </div>
                  <Link href={`/client/projects/${listing.on_chain_project_id}`}>
                    <Button variant="outline" size="sm">
                      Manage Project
                    </Button>
                  </Link>
                </div>
              )}

              {/* Applications */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Applications{" "}
                  <span className="text-base font-normal text-muted-foreground">
                    ({applications.length})
                  </span>
                </h2>

                {applications.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-card p-10 text-center">
                    <Users className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-base font-semibold text-foreground">No applications yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Share your listing at{" "}
                      <span className="font-sans text-xs">/projects/{listingId}</span> to attract
                      freelancers.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {applications.map((app) => (
                      <ApplicationCard
                        key={app.id}
                        application={app}
                        listingOpen={listing.status === "open"}
                        isAccepting={acceptingId === app.id}
                        isRejecting={rejectingId === app.id}
                        onAccept={handleAccept}
                        onReject={handleReject}
                      />
                    ))}
                  </div>
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
