"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Check,
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
  markComplete,
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

function canMarkComplete(milestone: ContractMilestone, walletAddress: string | null): boolean {
  if (!walletAddress) return false;
  return (
    milestone.freelancer.toLowerCase() === walletAddress.toLowerCase() &&
    milestone.status === "Funded"
  );
}

function MilestoneCard({
  milestone,
  index,
  walletAddress,
  isMarkingComplete,
  isDisputing,
  onMarkComplete,
  onDispute,
}: {
  milestone: ContractMilestone;
  index: number;
  walletAddress: string | null;
  isMarkingComplete: boolean;
  isDisputing: boolean;
  onMarkComplete: (index: number) => void;
  onDispute: (index: number) => void;
}) {
  const showMarkComplete = canMarkComplete(milestone, walletAddress);
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

      {milestone.status === "Disputed" && (
        <div className="border-t border-border pt-4 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-muted-foreground">
            This milestone is disputed. Funds are locked in escrow pending resolution by the
            platform. Contact support to proceed.
          </p>
        </div>
      )}

      {(showMarkComplete || showDispute) && (
        <div className="border-t border-border pt-4 flex items-center gap-2 flex-wrap">
          {showMarkComplete && (
            <Button
              variant="primary"
              size="sm"
              loading={isMarkingComplete}
              onClick={() => onMarkComplete(index)}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {isMarkingComplete ? "Submitting..." : "Mark as Complete"}
            </Button>
          )}
          {showDispute && (
            <Button
              variant="destructive"
              size="sm"
              loading={isDisputing}
              onClick={() => onDispute(index)}
            >
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              {isDisputing ? "Submitting..." : "Raise Dispute"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function ProjectDetail({ projectId }: { projectId: number }) {
  const { address, isConnected, isFreighterInstalled, connect } = useWallet();
  const { notify } = useNotification();

  const [project, setProject] = useState<ContractProject | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingCompleteIndex, setMarkingCompleteIndex] = useState<number | null>(null);
  const [disputingIndex, setDisputingIndex] = useState<number | null>(null);

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
      console.error("[ProjectDetail] fetchProject:", err);
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleMarkComplete = async (milestoneIndex: number) => {
    if (!address) return;
    setMarkingCompleteIndex(milestoneIndex);
    try {
      await markComplete(address, projectId, milestoneIndex);
      notify("Milestone marked as complete — waiting for client approval.", "success");
      await fetchProject();
    } catch (err) {
      console.error("[ProjectDetail] handleMarkComplete:", err);
      notify(err instanceof Error ? err.message : "Failed to mark milestone complete", "error");
    } finally {
      setMarkingCompleteIndex(null);
    }
  };

  const handleDispute = async (milestoneIndex: number) => {
    if (!address) return;
    setDisputingIndex(milestoneIndex);
    try {
      await disputeMilestone(address, projectId, milestoneIndex);
      notify("Dispute raised — funds are now locked until resolved.", "success");
      await fetchProject();
    } catch (err) {
      console.error("[ProjectDetail] handleDispute:", err);
      notify(err instanceof Error ? err.message : "Failed to raise dispute", "error");
    } finally {
      setDisputingIndex(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background py-12">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/freelancer"
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

          {/* Project not found */}
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
                  <p className="text-lg font-bold text-primary">
                    {stroopsToXlm(project.milestones.reduce((s, m) => s + m.amount, 0n))} XLM
                  </p>
                </div>
              </div>

              {/* Wallet prompt if not connected */}
              {!isConnected && (
                <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-muted-foreground shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      {isFreighterInstalled === false
                        ? "Install Freighter to raise disputes."
                        : "Connect your wallet to raise disputes on your milestones."}
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
                      walletAddress={address}
                      isMarkingComplete={markingCompleteIndex === i}
                      isDisputing={disputingIndex === i}
                      onMarkComplete={handleMarkComplete}
                      onDispute={handleDispute}
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
