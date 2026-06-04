"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, FolderOpen, ChevronRight, AlertCircle, RefreshCw, Plus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useWallet } from "@/contexts/WalletContext";
import {
  getClientProjects,
  stroopsToXlm,
  totalProjectValue,
  projectOverallStatus,
  type ContractMilestone,
  type ContractProject,
  type MilestoneStatus,
} from "@/lib/contract";

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
  "pending" | "funded" | "released" | "disputed"
> = {
  Pending: "pending",
  Funded: "funded",
  Completed: "released",
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

function ProjectCard({ project }: { project: ContractProject }) {
  const total = totalProjectValue(project);
  const overall = projectOverallStatus(project);
  const funded = project.milestones.filter((m) => m.status !== "Pending").length;
  const released = project.milestones.filter((m) => m.status === "Released").length;
  const progressPct = Math.round((released / project.milestones.length) * 100);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Project #{String(project.id)}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Created {formatDate(project.created_at)}
          </p>
        </div>
        <Badge variant={OVERALL_BADGE_VARIANT[overall]}>{overall}</Badge>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {funded} of {project.milestones.length} milestones funded
          </span>
          <span>{progressPct}% released</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-success transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Freelancer:{" "}
        <span className="font-medium text-foreground tabular-nums">
          {project.milestones[0] ? truncateAddress(project.milestones[0].freelancer) : "—"}
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
        <Link href={`/client/projects/${String(project.id)}`}>
          <Button variant="outline" size="sm">
            Manage
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
