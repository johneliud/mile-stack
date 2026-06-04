"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, RefreshCw, FolderOpen, Wallet, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { useNotification } from "@/components/Notification";
import { useWallet } from "@/contexts/WalletContext";
import { getListing, applyToListing, hasApplied, type Listing } from "@/lib/listings";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function ListingDetail({ listingId }: { listingId: string }) {
  const { address, isConnected, isFreighterInstalled, connect } = useWallet();
  const { notify } = useNotification();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);

  const fetchListing = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getListing(listingId);
      setListing(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  useEffect(() => {
    if (!address || !listingId) return;
    hasApplied(listingId, address)
      .then(setAlreadyApplied)
      .catch(() => {});
  }, [address, listingId]);

  const handleApply = async () => {
    if (!address) return;
    setSubmitting(true);
    try {
      await applyToListing(listingId, address, message);
      setApplied(true);
      setAlreadyApplied(true);
      notify("Application submitted successfully.", "success");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Failed to submit application", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const isClient =
    listing && address ? listing.client_address.toLowerCase() === address.toLowerCase() : false;
}
