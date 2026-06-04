"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  Wallet,
  FolderOpen,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useNotification } from "@/components/Notification";
import { useWallet } from "@/contexts/WalletContext";
import {
  getProject,
  disputeMilestone,
  stroopsToXlm,
  type ContractMilestone,
  type ContractProject,
  type MilestoneStatus,
} from "@/lib/contract";

const MILESTONE_BADGE_VARIANT: Record<
  MilestoneStatus,
  "pending" | "funded" | "released" | "disputed"
> = {
  Pending: "pending",
  Funded: "funded",
  Completed: "released",
  Released: "released",
  Disputed: "disputed",
};

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
}

function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function canDispute(milestone: ContractMilestone, walletAddress: string | null): boolean {
  if (!walletAddress) return false;
  const isFreelancer = milestone.freelancer.toLowerCase() === walletAddress.toLowerCase();
  return isFreelancer && (milestone.status === "Funded" || milestone.status === "Completed");
}

function MilestoneCard({
  milestone,
  index,
  walletAddress,
  isDisputing,
  onDispute,
}: {
  milestone: ContractMilestone;
  index: number;
  walletAddress: string | null;
  isDisputing: boolean;
  onDispute: (index: number) => void;
}) {
  const showDispute = canDispute(milestone, walletAddress);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
            {index + 1}
          </span>
          <h3 className="text-base font-semibold text-foreground">{milestone.title}</h3>
        </div>
        <Badge variant={MILESTONE_BADGE_VARIANT[milestone.status]}>{milestone.status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Amount</p>
          <p className="font-semibold text-foreground">{stroopsToXlm(milestone.amount)} XLM</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Freelancer</p>
          <p className="font-medium text-foreground tabular-nums">
            {truncateAddress(milestone.freelancer)}
          </p>
        </div>
      </div>

      {showDispute && (
        <div className="border-t border-border pt-4">
          <Button
            variant="destructive"
            size="sm"
            loading={isDisputing}
            onClick={() => onDispute(index)}
          >
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            {isDisputing ? "Submitting..." : "Raise Dispute"}
          </Button>
        </div>
      )}
    </div>
  );
}
