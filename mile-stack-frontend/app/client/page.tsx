"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderOpen, ChevronRight, AlertCircle, RefreshCw, Plus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useWallet } from "@/contexts/WalletContext";
import { WalletGuard } from "@/components/WalletGuard";
import {
  getClientProjects,
  stroopsToXlm,
  totalProjectValue,
  projectOverallStatus,
  type ContractMilestone,
  type ContractProject,
  type MilestoneStatus,
} from "@/lib/contract";
import {
  getClientListings,
  getApplicationCount,
  getProjectNames,
  type Listing,
} from "@/lib/listings";

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

type ListingWithCount = Listing & { applicationCount: number };

function ListingCard({ listing }: { listing: ListingWithCount }) {
  const isOpen = listing.status === "open";

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">{listing.title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{listing.description}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
            isOpen
              ? "bg-blue-50 text-accent border-blue-200"
              : "bg-muted text-muted-foreground border-border"
          }`}
        >
          {listing.status}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          <span className="font-semibold text-accent">
            {listing.total_xlm.toLocaleString("en-US", { maximumFractionDigits: 2 })} XLM
          </span>
        </span>
        <span>
          {listing.milestones.length} milestone{listing.milestones.length !== 1 ? "s" : ""}
        </span>
        <span>
          {listing.applicationCount} applicant{listing.applicationCount !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="border-t border-border pt-4 flex items-center justify-between gap-4">
        {listing.status === "filled" && listing.on_chain_project_id && (
          <Link
            href={`/client/projects/${listing.on_chain_project_id}`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Project #{listing.on_chain_project_id}
          </Link>
        )}
        {listing.status !== "filled" && <div />}
        <Link href={`/client/listings/${listing.id}/applications`}>
          <Button variant="outline" size="sm">
            Review Applications
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

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
  const funded = project.milestones.filter((m) => m.status !== "Pending").length;
  const released = project.milestones.filter((m) => m.status === "Released").length;
  const progressPct = Math.round((released / project.milestones.length) * 100);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {name ?? `Project #${String(project.id)}`}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            #{String(project.id)} &middot; Created {formatDate(project.created_at)}
          </p>
        </div>
        <Badge variant={OVERALL_BADGE_VARIANT[overall]}>{overall}</Badge>
      </div>

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
          {project.milestones[0] ? truncateAddress(project.milestones[0].freelancer) : "-"}
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
          <p className="text-lg font-bold text-accent">{stroopsToXlm(total)} XLM</p>
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

export default function ClientDashboard() {
  const { address, isConnected } = useWallet();

  const [projects, setProjects] = useState<ContractProject[]>([]);
  const [projectNames, setProjectNames] = useState<Record<number, string>>({});
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [listings, setListings] = useState<ListingWithCount[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);

  const fetchProjects = async (addr: string) => {
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const [data, names] = await Promise.all([
        getClientProjects(addr),
        getProjectNames(addr).catch(() => ({}) as Record<number, string>),
      ]);
      setProjects(data);
      setProjectNames(names);
    } catch (err) {
      console.error("[ClientDashboard] fetchProjects:", err);
      setProjectsError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchListings = async (addr: string) => {
    setListingsLoading(true);
    setListingsError(null);
    try {
      const data = await getClientListings(addr);
      const withCounts = await Promise.all(
        data.map(async (l) => ({
          ...l,
          applicationCount: await getApplicationCount(l.id).catch(() => 0),
        })),
      );
      setListings(withCounts);
    } catch (err) {
      console.error("[ClientDashboard] fetchListings:", err);
      setListingsError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setListingsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchProjects(address);
      fetchListings(address);
    }
  }, [address, isConnected]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background py-12">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-10 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary">Client Dashboard</h1>
              <p className="mt-2 text-muted-foreground">
                Manage your listings and active escrow projects.
              </p>
            </div>
            {isConnected && (
              <Link href="/client/listings/new">
                <Button variant="primary">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </Link>
            )}
          </div>

          <WalletGuard message="Connect your Freighter wallet to view your dashboard.">
            {isConnected && (
              <div className="flex flex-col gap-12">
                {/* ── My Listings ── */}
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-6">My Projects</h2>

                  {listingsLoading && (
                    <div className="flex items-center gap-3 py-8 text-muted-foreground">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Loading listings...</span>
                    </div>
                  )}

                  {!listingsLoading && listingsError && (
                    <div className="rounded-2xl border border-border bg-card p-8 text-center">
                      <AlertCircle className="mx-auto h-8 w-8 text-destructive mb-3" />
                      <p className="text-sm font-medium text-foreground mb-4">{listingsError}</p>
                      {address && (
                        <Button variant="outline" size="sm" onClick={() => fetchListings(address)}>
                          <RefreshCw className="h-4 w-4" />
                          Retry
                        </Button>
                      )}
                    </div>
                  )}

                  {!listingsLoading && !listingsError && listings.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                      <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                      <p className="text-sm font-medium text-foreground">No projects yet</p>
                      <p className="mt-1 text-sm text-muted-foreground mb-4">
                        Post a project and freelancers will be able to apply.
                      </p>
                      <Link href="/client/listings/new">
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4" />
                          New Project
                        </Button>
                      </Link>
                    </div>
                  )}

                  {!listingsLoading && !listingsError && listings.length > 0 && (
                    <div className="grid gap-6 sm:grid-cols-2">
                      {listings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                      ))}
                    </div>
                  )}
                </section>

                {/* ── Active Projects ── */}
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-6">Active Projects</h2>

                  {projectsLoading && (
                    <div className="flex items-center gap-3 py-8 text-muted-foreground">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Loading projects...</span>
                    </div>
                  )}

                  {!projectsLoading && projectsError && (
                    <div className="rounded-2xl border border-border bg-card p-8 text-center">
                      <AlertCircle className="mx-auto h-8 w-8 text-destructive mb-3" />
                      <p className="text-sm font-medium text-foreground mb-1">
                        {projectsError === "CONTRACT_NOT_CONFIGURED"
                          ? "Contract not yet deployed"
                          : projectsError === "SIMULATION_SOURCE_NOT_CONFIGURED"
                            ? "Simulation source not configured"
                            : "Failed to load projects"}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {projectsError === "CONTRACT_NOT_CONFIGURED"
                          ? "Set NEXT_PUBLIC_CONTRACT_ID in your .env.local."
                          : projectsError === "SIMULATION_SOURCE_NOT_CONFIGURED"
                            ? "Set NEXT_PUBLIC_SIMULATION_SOURCE in your .env.local."
                            : projectsError}
                      </p>
                      {address && (
                        <Button variant="outline" size="sm" onClick={() => fetchProjects(address)}>
                          <RefreshCw className="h-4 w-4" />
                          Retry
                        </Button>
                      )}
                    </div>
                  )}

                  {!projectsLoading && !projectsError && projects.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                      <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                      <p className="text-sm font-medium text-foreground">
                        No active escrow projects
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Accept a freelancer application from one of your projects above to start an
                        escrow contract.
                      </p>
                    </div>
                  )}

                  {!projectsLoading && !projectsError && projects.length > 0 && (
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
                </section>
              </div>
            )}
          </WalletGuard>
        </div>
      </main>

      <Footer />
    </div>
  );
}
