"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Users,
  Wallet,
  Check,
  X,
  CheckCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { useNotification } from "@/components/Notification";
import { useWallet } from "@/contexts/WalletContext";
import {
  getListing,
  getApplications,
  acceptApplication,
  rejectApplication,
  type Listing,
  type Application,
} from "@/lib/listings";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
}

const STATUS_STYLES: Record<Application["status"], string> = {
  pending: "bg-blue-50 text-accent border-blue-200",
  accepted: "bg-emerald-50 text-success border-emerald-200",
  rejected: "bg-slate-100 text-slate-500 border-slate-200",
};

function ApplicationCard({
  application,
  listingOpen,
  isAccepting,
  isRejecting,
  onAccept,
  onReject,
}: {
  application: Application;
  listingOpen: boolean;
  isAccepting: boolean;
  isRejecting: boolean;
  onAccept: (app: Application) => void;
  onReject: (app: Application) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const isPending = application.status === "pending";
  const canAct = listingOpen && isPending;
}
