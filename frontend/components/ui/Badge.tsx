type Variant = "default" | "pending" | "funded" | "completed" | "released" | "disputed";

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  default: "bg-muted text-muted-foreground border border-border",
  pending: "bg-slate-100 text-slate-700 border border-slate-200",
  funded: "bg-amber-50 text-amber-800 border border-amber-200/80",
  completed: "bg-blue-50 text-blue-700 border border-blue-200/80",
  released: "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
  disputed: "bg-rose-50 text-rose-800 border border-rose-200/80",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
