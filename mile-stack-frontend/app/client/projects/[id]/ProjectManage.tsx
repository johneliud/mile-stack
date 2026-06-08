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
  CheckCircle,
  X,
  Check,
  AlertTriangle,
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
  approveMilestone,
  stroopsToXlm,
  type ContractMilestone,
  type ContractProject,
  type MilestoneStatus,
} from "@/lib/contract";
import { getProjectNamesByIds } from "@/lib/listings";

const MILESTONE_BADGE_VARIANT: Record<
  MilestoneStatus,
  "pending" | "funded" | "completed" | "released" | "disputed"
> = {
  Pending: "pending",
  Funded: "funded",
  Completed: "completed",
  Released: "released",
  Disputed: "disputed",
};

function truncateAddress(addr: string) {
  const a = addr.toUpperCase();
  return `${a.slice(0, 6)}...${a.slice(-6)}`;
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
  canApprove,
  isFunding,
  isApproving,
  onFund,
  onApprove,
}: {
  milestone: ContractMilestone;
  index: number;
  canFund: boolean;
  canApprove: boolean;
  isFunding: boolean;
  isApproving: boolean;
  onFund: (index: number) => void;
  onApprove: (index: number) => void;
}) {
  const [fundConfirming, setFundConfirming] = useState(false);
  const [approveConfirming, setApproveConfirming] = useState(false);
  const showFundButton = canFund && milestone.status === "Pending";
  const showWaitingForFreelancer = milestone.status === "Funded";
  const showApproveButton = canApprove && milestone.status === "Completed";
  const showDisputed = milestone.status === "Disputed";

  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
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

      {/* Fund flow */}
      {showFundButton && !fundConfirming && (
        <div className="border-t border-border pt-4">
          <Button variant="primary" size="sm" onClick={() => setFundConfirming(true)}>
            Fund Milestone
          </Button>
        </div>
      )}

      {showFundButton && fundConfirming && (
        <div className="border-t border-border pt-4 rounded-xl bg-muted/50 p-4 flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">
            Lock <span className="font-bold text-accent">{stroopsToXlm(milestone.amount)} XLM</span>{" "}
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
                setFundConfirming(false);
                onFund(index);
              }}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {isFunding ? "Funding..." : "Confirm"}
            </Button>
            <button
              type="button"
              onClick={() => setFundConfirming(false)}
              disabled={isFunding}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted cursor-pointer disabled:opacity-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Waiting for freelancer */}
      {showWaitingForFreelancer && (
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Funds are in escrow. Waiting for the freelancer to mark this milestone complete.
          </p>
        </div>
      )}

      {/* Approve flow */}
      {showApproveButton && !approveConfirming && (
        <div className="border-t border-border pt-4">
          <Button variant="accent" size="sm" onClick={() => setApproveConfirming(true)}>
            Approve &amp; Release
          </Button>
        </div>
      )}

      {showApproveButton && approveConfirming && (
        <div className="border-t border-border pt-4 rounded-xl bg-muted/50 p-4 flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="h-4 w-4 text-destructive shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-foreground">
              Release{" "}
              <span className="font-bold text-accent">{stroopsToXlm(milestone.amount)} XLM</span> to{" "}
              <span className="font-mono text-foreground">
                {truncateAddress(milestone.freelancer)}
              </span>
              ?
            </p>
          </div>
          <p className="text-xs text-destructive font-medium">
            This action is irreversible. Funds will be sent directly to the freelancer.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              loading={isApproving}
              onClick={() => {
                setApproveConfirming(false);
                onApprove(index);
              }}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {isApproving ? "Releasing..." : "Confirm Release"}
            </Button>
            <button
              type="button"
              onClick={() => setApproveConfirming(false)}
              disabled={isApproving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted cursor-pointer disabled:opacity-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Disputed state */}
      {showDisputed && (
        <div className="border-t border-border pt-4 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-muted-foreground">
            This milestone is disputed. Funds are locked in escrow pending resolution by the
            platform. Contact support to proceed.
          </p>
        </div>
      )}
    </div>
  );
}

export function ProjectManage({ projectId }: { projectId: number }) {
  const { address, isConnected, isFreighterInstalled, connect } = useWallet();
  const { notify } = useNotification();

  const [project, setProject] = useState<ContractProject | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fundingIndex, setFundingIndex] = useState<number | null>(null);
  const [approvingIndex, setApprovingIndex] = useState<number | null>(null);

  const fetchProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, names] = await Promise.all([
        getProject(projectId),
        getProjectNamesByIds([projectId]).catch(() => ({}) as Record<number, string>),
      ]);
      setProject(data);
      setProjectName(names[projectId] ?? null);
    } catch (err) {
      console.error("[ProjectManage] fetchProject:", err);
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
      notify("Milestone funded. XLM is now held in escrow.", "success");
      await fetchProject();
    } catch (err) {
      console.error("[ProjectManage] handleFund:", err);
      notify(err instanceof Error ? err.message : "Failed to fund milestone", "error");
    } finally {
      setFundingIndex(null);
    }
  };

  const handleApprove = async (milestoneIndex: number) => {
    if (!address) return;
    setApprovingIndex(milestoneIndex);
    try {
      await approveMilestone(address, projectId, milestoneIndex);
      notify("Milestone approved. XLM released to the freelancer.", "success");
      await fetchProject();
    } catch (err) {
      console.error("[ProjectManage] handleApprove:", err);
      notify(err instanceof Error ? err.message : "Failed to approve milestone", "error");
    } finally {
      setApprovingIndex(null);
    }
  };

  const clientRole = project ? isClient(project, address) : false;

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
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <RefreshCw className="h-7 w-7 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Loading project...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-4" />
              <h2 className="text-lg font-semibold text-foreground">
                {error === "CONTRACT_NOT_CONFIGURED"
                  ? "Contract not yet deployed"
                  : error === "SIMULATION_SOURCE_NOT_CONFIGURED"
                    ? "Simulation source not configured"
                    : "Failed to load project"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground mb-6">
                {error === "CONTRACT_NOT_CONFIGURED"
                  ? "Set NEXT_PUBLIC_CONTRACT_ID in your .env.local after deploying the contract."
                  : error === "SIMULATION_SOURCE_NOT_CONFIGURED"
                    ? "Set NEXT_PUBLIC_SIMULATION_SOURCE in your .env.local to a funded testnet account."
                    : error}
              </p>
              <Button variant="outline" onClick={fetchProject}>
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          )}

          {/* Not found */}
          {!loading && !error && !project && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold text-foreground">Project not found</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Project #{projectId} does not exist on this network.
              </p>
            </div>
          )}

          {/* Project detail */}
          {!loading && !error && project && (
            <div className="flex flex-col gap-8">
              {/* Header */}
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-primary">
                  {projectName ?? `Project #${String(project.id)}`}
                </h1>
                <p className="text-sm text-muted-foreground">
                  #{String(project.id)} &middot; Created {formatDate(project.created_at)}
                </p>
              </div>

              {/* Meta */}
              <div className="bg-card border border-border rounded-2xl p-6 grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Client
                  </p>
                  <p className="text-sm font-medium text-foreground tabular-nums">
                    {truncateAddress(project.client)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Total Value
                  </p>
                  <p className="text-lg font-bold text-accent">
                    {stroopsToXlm(project.milestones.reduce((s, m) => s + m.amount, 0n))} XLM
                  </p>
                </div>
              </div>

              {/* Wallet prompt */}
              {!isConnected && (
                <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-muted-foreground shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      {isFreighterInstalled === false
                        ? "Install Freighter to manage milestones."
                        : "Connect your wallet to fund milestones."}
                    </p>
                  </div>
                  {isFreighterInstalled !== false && (
                    <Button variant="primary" size="sm" onClick={connect}>
                      Connect
                    </Button>
                  )}
                </div>
              )}

              {/* Milestones */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Milestones</h2>
                <div className="flex flex-col gap-4">
                  {project.milestones.map((m, i) => (
                    <MilestoneCard
                      key={i}
                      milestone={m}
                      index={i}
                      canFund={isConnected && clientRole}
                      canApprove={isConnected && clientRole}
                      isFunding={fundingIndex === i}
                      isApproving={approvingIndex === i}
                      onFund={handleFund}
                      onApprove={handleApprove}
                    />
                  ))}
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
