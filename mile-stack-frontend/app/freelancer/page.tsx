"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, FolderOpen, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useWallet } from "@/contexts/WalletContext";
import {
  getFreelancerProjects,
  stroopsToXlm,
  totalProjectValue,
  projectOverallStatus,
  type ContractMilestone,
  type ContractProject,
  type MilestoneStatus,
} from "@/lib/contract";
import { getProjectNamesByIds } from "@/lib/listings";

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

const OVERALL_BADGE_VARIANT: Record<string, "pending" | "funded" | "released" | "disputed"> = {
  Pending: "pending",
  Active: "funded",
  Disputed: "disputed",
  Completed: "released",
};

function MilestoneRow({ milestone }: { milestone: ContractMilestone }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        <Badge variant={MILESTONE_BADGE_VARIANT[milestone.status]} className="shrink-0">
          {milestone.status}
        </Badge>
        <span className="text-sm text-foreground truncate">{milestone.title}</span>
      </div>
      <span className="text-sm font-medium text-foreground tabular-nums shrink-0">
        {stroopsToXlm(milestone.amount)} XLM
      </span>
    </div>
  );
}

function ProjectCard({ project, name }: { project: ContractProject; name?: string }) {
  const total = totalProjectValue(project);
  const overall = projectOverallStatus(project);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {name ?? `Project #${String(project.id)}`}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">#{String(project.id)}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Created {formatDate(project.created_at)}
          </p>
        </div>
        <Badge variant={OVERALL_BADGE_VARIANT[overall]}>{overall}</Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        Client:{" "}
        <span className="font-medium text-foreground tabular-nums">
          {truncateAddress(project.client)}
        </span>
      </p>

      <div className="border-t border-border pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Milestones
        </p>
        <div className="divide-y divide-border">
          {project.milestones.map((m, i) => (
            <MilestoneRow key={i} milestone={m} />
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Total Value</p>
          <p className="text-lg font-bold text-primary">{stroopsToXlm(total)} XLM</p>
        </div>
        <Link href={`/freelancer/projects/${String(project.id)}`}>
          <Button variant="outline" size="sm">
            View Details
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function FreelancerDashboard() {
  const { address, isConnected, isFreighterInstalled, connect } = useWallet();
  const [projects, setProjects] = useState<ContractProject[]>([]);
  const [projectNames, setProjectNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async (addr: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFreelancerProjects(addr);
      setProjects(data);
      const ids = data.map((p) => Number(p.id));
      const names = await getProjectNamesByIds(ids).catch(() => ({}) as Record<number, string>);
      setProjectNames(names);
    } catch (err) {
      console.error("[FreelancerDashboard] fetchProjects:", err);
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchProjects(address);
    }
  }, [address, isConnected]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background py-12">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-primary">Freelancer Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              All projects where your wallet is assigned as a freelancer.
            </p>
          </div>

          {/* Wallet not connected */}
          {!isConnected && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <Wallet className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold text-foreground">Connect your wallet</h2>
              <p className="mt-1 text-sm text-muted-foreground mb-6">
                {isFreighterInstalled === false
                  ? "Install the Freighter extension to get started."
                  : "Connect your Freighter wallet to view your active projects."}
              </p>
              {isFreighterInstalled === false ? (
                <a
                  href="https://www.freighter.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  Install Freighter
                </a>
              ) : (
                <Button variant="primary" onClick={connect}>
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </Button>
              )}
            </div>
          )}

          {/* Loading */}
          {isConnected && loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <RefreshCw className="h-7 w-7 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Loading your projects...</p>
            </div>
          )}

          {/* Error */}
          {isConnected && !loading && error && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-4" />
              <h2 className="text-lg font-semibold text-foreground">
                {error === "CONTRACT_NOT_CONFIGURED"
                  ? "Contract not yet deployed"
                  : error === "SIMULATION_SOURCE_NOT_CONFIGURED"
                    ? "Simulation source not configured"
                    : "Failed to load projects"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground mb-6">
                {error === "CONTRACT_NOT_CONFIGURED"
                  ? "Set NEXT_PUBLIC_CONTRACT_ID in your .env.local after deploying the contract."
                  : error === "SIMULATION_SOURCE_NOT_CONFIGURED"
                    ? "Set NEXT_PUBLIC_SIMULATION_SOURCE in your .env.local to a funded testnet account."
                    : error}
              </p>
              {address && (
                <Button variant="outline" onClick={() => fetchProjects(address)}>
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              )}
            </div>
          )}

          {/* Empty state */}
          {isConnected && !loading && !error && projects.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold text-foreground">No active projects</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                You have no projects on this network yet. Share your wallet address with a client to
                get started.
              </p>
            </div>
          )}

          {/* Project grid */}
          {isConnected && !loading && !error && projects.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard
                  key={String(project.id)}
                  project={project}
                  name={projectNames[Number(project.id)]}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
