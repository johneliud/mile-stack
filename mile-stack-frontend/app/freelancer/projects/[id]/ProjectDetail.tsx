"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
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

function canDispute(milestone: ContractMilestone, walletAddress: string | null): boolean {
  if (!walletAddress) return false;
  const isFreelancer = milestone.freelancer.toLowerCase() === walletAddress.toLowerCase();
  return isFreelancer && (milestone.status === "Funded" || milestone.status === "Completed");
}
