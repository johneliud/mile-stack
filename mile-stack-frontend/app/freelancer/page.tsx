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
