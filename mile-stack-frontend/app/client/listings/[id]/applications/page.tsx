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
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
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
          <p className="text-sm font-semibold text-foreground font-mono">
            {truncateAddress(application.freelancer_address)}
          </p>
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
}
