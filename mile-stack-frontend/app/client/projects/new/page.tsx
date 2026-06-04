"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Wallet, CheckCircle, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { useNotification } from "@/components/Notification";
import { useWallet } from "@/contexts/WalletContext";
import { createProject } from "@/lib/contract";

const STELLAR_ADDRESS_RE = /^G[A-Z2-7]{55}$/;

interface MilestoneInput {
  id: string;
  title: string;
  xlmAmount: string;
}

function newMilestone(): MilestoneInput {
  return { id: crypto.randomUUID(), title: "", xlmAmount: "" };
}

export default function CreateProjectPage() {
  const { address, isConnected, isFreighterInstalled, connect } = useWallet();
  const { notify } = useNotification();

  const [freelancerAddress, setFreelancerAddress] = useState("");
  const [milestones, setMilestones] = useState<MilestoneInput[]>([newMilestone()]);
  const [submitting, setSubmitting] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<number | null>(null);

  function addMilestone() {
    setMilestones((prev) => [...prev, newMilestone()]);
  }

  function removeMilestone(id: string) {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  }

  function updateMilestone(id: string, field: "title" | "xlmAmount", value: string) {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  }

  function validate(): string | null {
    if (!isConnected || !address) return "Connect your wallet first.";
    if (!STELLAR_ADDRESS_RE.test(freelancerAddress.trim()))
      return "Enter a valid Stellar address (starts with G, 56 characters).";
    if (freelancerAddress.trim() === address)
      return "Freelancer address cannot be the same as your own.";
    if (milestones.some((m) => !m.title.trim())) return "All milestones need a title.";
    if (milestones.some((m) => !m.xlmAmount || parseFloat(m.xlmAmount) <= 0))
      return "All milestone amounts must be greater than 0.";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      notify(err, "error");
      return;
    }

    setSubmitting(true);
    try {
      const contractMilestones = milestones.map((m) => ({
        title: m.title.trim(),
        amount: BigInt(Math.round(parseFloat(m.xlmAmount) * 10_000_000)),
      }));
      const projectId = await createProject(address!, freelancerAddress.trim(), contractMilestones);
      setCreatedProjectId(projectId);
      notify(`Project #${projectId} created successfully.`, "success");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Failed to create project", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setFreelancerAddress("");
    setMilestones([newMilestone()]);
    setCreatedProjectId(null);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background py-12">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-primary">Create Project</h1>
            <p className="mt-2 text-muted-foreground">
              Define milestones and assign a freelancer. Funds are locked in escrow per milestone.
            </p>
          </div>

          {/* Wallet not connected */}
          {!isConnected && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center mb-8">
              <Wallet className="mx-auto h-9 w-9 text-muted-foreground mb-3" />
              <h2 className="text-base font-semibold text-foreground">Connect your wallet</h2>
              <p className="mt-1 text-sm text-muted-foreground mb-5">
                {isFreighterInstalled === false
                  ? "Install the Freighter extension to get started."
                  : "Connect your Freighter wallet to create a project."}
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

          {/* Success state */}
          {createdProjectId !== null && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-success mb-4" />
              <h2 className="text-lg font-semibold text-foreground">
                Project #{createdProjectId} created
              </h2>
              <p className="mt-1 text-sm text-muted-foreground mb-6">
                Your project is on-chain. Fund a milestone to move it forward.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${process.env.NEXT_PUBLIC_CONTRACT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Stellar Expert
                </a>
                <Button variant="primary" onClick={resetForm}>
                  <Plus className="h-4 w-4" />
                  Create Another
                </Button>
              </div>
            </div>
          )}

          {/* Form */}
          {createdProjectId === null && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              {/* Freelancer address */}
              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
                <h2 className="text-base font-semibold text-foreground">Freelancer</h2>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="freelancer" className="text-sm font-medium text-foreground">
                    Stellar Address
                  </label>
                  <input
                    id="freelancer"
                    type="text"
                    value={freelancerAddress}
                    onChange={(e) => setFreelancerAddress(e.target.value)}
                    placeholder="GXXXX..."
                    spellCheck={false}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground">
                    The Stellar public key of the freelancer you are hiring.
                  </p>
                </div>
              </div>

              {/* Milestones */}
              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">Milestones</h2>
                  <span className="text-xs text-muted-foreground">
                    {milestones.length} milestone{milestones.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {milestones.map((m, i) => (
                    <div
                      key={m.id}
                      className="rounded-xl border border-border bg-muted/40 p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Milestone {i + 1}
                        </span>
                        {milestones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMilestone(m.id)}
                            aria-label={`Remove milestone ${i + 1}`}
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor={`title-${m.id}`}
                            className="text-xs font-medium text-muted-foreground"
                          >
                            Title
                          </label>
                          <input
                            id={`title-${m.id}`}
                            type="text"
                            value={m.title}
                            onChange={(e) => updateMilestone(m.id, "title", e.target.value)}
                            placeholder="e.g. UI Design"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor={`amount-${m.id}`}
                            className="text-xs font-medium text-muted-foreground"
                          >
                            Amount (XLM)
                          </label>
                          <input
                            id={`amount-${m.id}`}
                            type="number"
                            min="0.0000001"
                            step="any"
                            value={m.xlmAmount}
                            onChange={(e) => updateMilestone(m.id, "xlmAmount", e.target.value)}
                            placeholder="500"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addMilestone}
                  className="inline-flex items-center gap-2 self-start rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add Milestone
                </button>
              </div>

              {/* Total */}
              {milestones.some((m) => parseFloat(m.xlmAmount) > 0) && (
                <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3">
                  <span className="text-sm text-muted-foreground">Total project value</span>
                  <span className="text-base font-bold text-primary">
                    {milestones
                      .reduce((s, m) => s + (parseFloat(m.xlmAmount) || 0), 0)
                      .toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 7,
                      })}{" "}
                    XLM
                  </span>
                </div>
              )}

              {/* Submit */}
              <div className="flex items-center justify-between gap-4">
                <Link
                  href="/client"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancel
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  disabled={!isConnected}
                >
                  {submitting ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
