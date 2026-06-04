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
}
