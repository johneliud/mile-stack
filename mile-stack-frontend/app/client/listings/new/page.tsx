"use client";

import { type FormEvent, useState, useRef, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Wallet, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { useNotification } from "@/components/Notification";
import { useWallet } from "@/contexts/WalletContext";
import { createListing } from "@/lib/listings";

interface MilestoneInput {
  id: string;
  title: string;
  xlmAmount: string;
}

function newMilestone(): MilestoneInput {
  return { id: crypto.randomUUID(), title: "", xlmAmount: "" };
}

export default function PostListingPage() {
  const router = useRouter();
  const { address, isConnected, isFreighterInstalled, connect } = useWallet();
  const { notify } = useNotification();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [milestones, setMilestones] = useState<MilestoneInput[]>([newMilestone()]);
  const [submitting, setSubmitting] = useState(false);
  const skillInputRef = useRef<HTMLInputElement>(null);

  function addSkill(value: string) {
    const trimmed = value.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  function handleSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    } else if (e.key === "Backspace" && !skillInput && skills.length > 0) {
      setSkills((prev) => prev.slice(0, -1));
    }
  }

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
    if (!title.trim()) return "Title is required.";
    if (!description.trim()) return "Description is required.";
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
      await createListing({
        clientAddress: address!,
        title: title.trim(),
        description: description.trim(),
        skills,
        milestones: milestones.map((m) => ({
          title: m.title.trim(),
          amount_xlm: parseFloat(m.xlmAmount),
        })),
      });
      notify("Listing posted successfully.", "success");
      router.push("/client");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Failed to post listing", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const totalXlm = milestones.reduce((s, m) => s + (parseFloat(m.xlmAmount) || 0), 0);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background py-12">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-primary">Post a Listing</h1>
            <p className="mt-2 text-muted-foreground">
              Describe your project and milestones. Freelancers will apply and you choose who to
              hire.
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
                  : "Connect your Freighter wallet to post a listing."}
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

          {/* Form */}
          {isConnected && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              {/* Basic info */}
              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
                <h2 className="text-base font-semibold text-foreground">Project Details</h2>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="title" className="text-sm font-medium text-foreground">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Build a Soroban smart contract"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="description" className="text-sm font-medium text-foreground">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the project scope, requirements, and any context freelancers need to apply..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors resize-none"
                  />
                </div>

                {/* Skills tag input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Required Skills
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </label>
                  <div
                    className="flex flex-wrap gap-2 min-h-[42px] w-full rounded-lg border border-border bg-background px-3 py-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-colors cursor-text"
                    onClick={() => skillInputRef.current?.focus()}
                  >
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2.5 py-0.5 text-xs font-medium text-foreground"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSkill(skill);
                          }}
                          className="text-muted-foreground hover:text-foreground cursor-pointer"
                          aria-label={`Remove ${skill}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      ref={skillInputRef}
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      onBlur={() => addSkill(skillInput)}
                      placeholder={skills.length === 0 ? "Type a skill and press Enter..." : ""}
                      className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Press Enter or comma to add a skill.
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
                            placeholder="e.g. Smart contract audit"
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
              {totalXlm > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3">
                  <span className="text-sm text-muted-foreground">Total project value</span>
                  <span className="text-base font-bold text-primary">
                    {totalXlm.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 7,
                    })}{" "}
                    XLM
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/client")}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" size="lg" loading={submitting}>
                  {submitting ? "Posting..." : "Post Listing"}
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
