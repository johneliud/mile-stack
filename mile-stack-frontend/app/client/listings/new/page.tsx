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
}
