"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  Wallet,
  DollarSign,
  X,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useNotification } from "@/components/Notification";
import { useWallet } from "@/contexts/WalletContext";
import {
  getProject,
  fundMilestone,
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

function isClient(project: ContractProject, walletAddress: string | null): boolean {
  if (!walletAddress) return false;
  return project.client.toLowerCase() === walletAddress.toLowerCase();
}

function MilestoneCard({
  milestone,
  index,
  canFund,
  isFunding,
  onFund,
}: {
  milestone: ContractMilestone;
  index: number;
  canFund: boolean;
  isFunding: boolean;
  onFund: (index: number) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const showFundButton = canFund && milestone.status === "Pending";

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

      {showFundButton && !confirming && (
        <div className="border-t border-border pt-4">
          <Button variant="primary" size="sm" onClick={() => setConfirming(true)}>
            <DollarSign className="h-4 w-4" aria-hidden="true" />
            Fund Milestone
          </Button>
        </div>
      )}

      {showFundButton && confirming && (
        <div className="border-t border-border pt-4 rounded-xl bg-muted/50 p-4 flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">
            Lock{" "}
            <span className="font-bold text-primary">{stroopsToXlm(milestone.amount)} XLM</span>{" "}
            into escrow for this milestone?
          </p>
          <p className="text-xs text-muted-foreground">
            Funds will be held by the contract until you approve the milestone or a dispute is
            resolved.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              loading={isFunding}
              onClick={() => {
                setConfirming(false);
                onFund(index);
              }}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {isFunding ? "Funding..." : "Confirm"}
            </Button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={isFunding}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted cursor-pointer disabled:opacity-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProjectManage({ projectId }: { projectId: number }) {
  const { address, isConnected, isFreighterInstalled, connect } = useWallet();
  const { notify } = useNotification();

  const [project, setProject] = useState<ContractProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fundingIndex, setFundingIndex] = useState<number | null>(null);

  const fetchProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProject(projectId);
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleFund = async (milestoneIndex: number) => {
    if (!address) return;
    setFundingIndex(milestoneIndex);
    try {
      await fundMilestone(address, projectId, milestoneIndex);
      notify("Milestone funded — XLM is now held in escrow.", "success");
      await fetchProject();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Failed to fund milestone", "error");
    } finally {
      setFundingIndex(null);
    }
  };

  const clientRole = project ? isClient(project, address) : false;
}
