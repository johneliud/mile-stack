"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, RefreshCw, AlertCircle, FolderOpen } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { getOpenListings, type Listing } from "@/lib/listings";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:border-accent/40 transition-colors duration-150">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-foreground leading-snug">{listing.title}</h3>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {timeAgo(listing.created_at)}
        </span>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>

      {listing.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {listing.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="border-t border-border pt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            <span className="font-semibold text-primary">
              {listing.total_xlm.toLocaleString("en-US", { maximumFractionDigits: 2 })} XLM
            </span>
          </span>
          <span>
            {listing.milestones.length} milestone{listing.milestones.length !== 1 ? "s" : ""}
          </span>
        </div>
        <Link href={`/projects/${listing.id}`}>
          <Button variant="outline" size="sm">
            View
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
