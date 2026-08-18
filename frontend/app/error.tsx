"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[MileStack] Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-background flex items-center justify-center py-24">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Something went wrong</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            An unexpected error occurred. You can try again or return home.
          </p>
          {error.digest && (
            <p className="text-xs font-sans text-muted-foreground/60 mb-8">
              Error ID: {error.digest}
            </p>
          )}
          {!error.digest && <div className="mb-8" />}
          <div className="flex items-center justify-center gap-3">
            <Button variant="primary" onClick={unstable_retry}>
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4" />
                Go home
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
