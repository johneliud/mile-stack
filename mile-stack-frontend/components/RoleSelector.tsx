"use client";

import { useRouter } from "next/navigation";
import { Briefcase, Code2 } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useRole, type UserRole } from "@/contexts/RoleContext";

export function RoleSelector() {
  const { isConnected } = useWallet();
  const { role, setRole } = useRole();
  const router = useRouter();

  if (!isConnected || role !== null) return null;

  function choose(r: UserRole) {
    setRole(r);
    router.push(r === "client" ? "/client" : "/freelancer");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl p-8">
        <h2 className="text-xl font-bold text-foreground text-center mb-2">
          How are you using MileStack?
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-8">
          We&apos;ll tailor your experience based on your role. You can switch anytime.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => choose("client")}
            className="flex flex-col items-center gap-4 rounded-xl border-2 border-border bg-background p-6 text-center transition-all duration-150 hover:border-accent hover:bg-accent/5 cursor-pointer group"
          >
            <div className="rounded-xl bg-muted p-3 group-hover:bg-accent/10 transition-colors duration-150">
              <Briefcase className="h-7 w-7 text-primary group-hover:text-accent transition-colors duration-150" />
            </div>
            <div>
              <p className="font-semibold text-foreground">I want to hire</p>
              <p className="text-xs text-muted-foreground mt-1">
                Post projects &amp; manage milestones
              </p>
            </div>
          </button>

          <button
            onClick={() => choose("freelancer")}
            className="flex flex-col items-center gap-4 rounded-xl border-2 border-border bg-background p-6 text-center transition-all duration-150 hover:border-accent hover:bg-accent/5 cursor-pointer group"
          >
            <div className="rounded-xl bg-muted p-3 group-hover:bg-accent/10 transition-colors duration-150">
              <Code2 className="h-7 w-7 text-primary group-hover:text-accent transition-colors duration-150" />
            </div>
            <div>
              <p className="font-semibold text-foreground">I want to work</p>
              <p className="text-xs text-muted-foreground mt-1">
                Apply to projects &amp; get paid in XLM
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
