type Variant = "default" | "pending" | "funded" | "released" | "disputed";

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  default: "bg-muted text-muted-foreground",
  pending: "bg-slate-100 text-slate-600",
  funded: "bg-blue-50 text-accent border border-blue-200",
  released: "bg-emerald-50 text-success border border-emerald-200",
  disputed: "bg-red-50 text-destructive border border-red-200",
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
