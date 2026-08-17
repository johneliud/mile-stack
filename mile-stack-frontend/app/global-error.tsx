"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[MileStack] Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#F8FAFC",
          color: "#0F172A",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
          {/* Icon */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(225, 29, 72, 0.08)",
              border: "1px solid rgba(225, 29, 72, 0.2)",
              marginBottom: 24,
            }}
          >
            <AlertCircle size={32} color="#E11D48" />
          </div>

          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 12px" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#64748B", lineHeight: 1.6, margin: "0 0 8px" }}>
            Please try again or return to the home page.
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.75rem", color: "#94A3B8", marginBottom: 32 }}>
              Error ID: {error.digest}
            </p>
          )}
          {!error.digest && <div style={{ marginBottom: 32 }} />}

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={unstable_retry}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 18px",
                borderRadius: 10,
                background: "#0F172A",
                color: "#fff",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <RefreshCw size={14} />
              Try again
            </button>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 18px",
                borderRadius: 10,
                background: "#fff",
                color: "#0F172A",
                border: "1px solid #E2E8F0",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              <Home size={14} />
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
