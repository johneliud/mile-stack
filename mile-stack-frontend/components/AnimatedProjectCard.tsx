"use client";

import { useEffect, useState } from "react";

type Status = "released" | "funded" | "pending";

interface Project {
  title: string;
  skills: string;
  milestones: { title: string; amount: number }[];
}

const PROJECTS: Project[] = [
  {
    title: "E-Commerce Platform",
    skills: "React · Node.js · PostgreSQL",
    milestones: [
      { title: "Architecture & Setup", amount: 1200 },
      { title: "Frontend Development", amount: 2800 },
      { title: "Backend & Deployment", amount: 2000 },
    ],
  },
  {
    title: "Soroban DeFi Protocol",
    skills: "Rust · Soroban · Smart Contracts",
    milestones: [
      { title: "Protocol Design", amount: 1500 },
      { title: "Contract Development", amount: 3500 },
      { title: "Audit & Testing", amount: 2000 },
    ],
  },
  {
    title: "Mobile Banking App",
    skills: "React Native · TypeScript · UI/UX",
    milestones: [
      { title: "UX Research & Design", amount: 1800 },
      { title: "iOS & Android Build", amount: 3200 },
      { title: "QA & App Store Launch", amount: 1500 },
    ],
  },
];

// Status snapshots per phase within a project
const PHASE_STATUSES: Status[][] = [
  ["pending", "pending", "pending"],
  ["funded", "pending", "pending"],
  ["released", "funded", "pending"],
  ["released", "released", "funded"],
  ["released", "released", "released"],
];

// How long to hold each phase (ms)
const PHASE_DURATIONS = [2000, 3500, 3500, 3500, 3000];

const STATUS_CONFIG: Record<Status, { label: string; text: string; bg: string }> = {
  released: {
    label: "Released",
    text: "text-emerald-700 font-semibold",
    bg: "bg-emerald-50/90 border-emerald-200/80",
  },
  funded: {
    label: "Funded (Escrowed)",
    text: "text-amber-800 font-semibold",
    bg: "bg-amber-50/90 border-amber-200/80",
  },
  pending: {
    label: "Pending",
    text: "text-slate-500 font-medium",
    bg: "bg-slate-50 border-slate-200",
  },
};

function useAnimatedNumber(target: number, duration = 800) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    const start = value;
    const diff = target - start;
    if (diff === 0) return;
    const steps = 40;
    const stepMs = duration / steps;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setValue(Math.round(start + (diff * step) / steps));
      if (step >= steps) {
        clearInterval(interval);
        setValue(target);
      }
    }, stepMs);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

export function AnimatedProjectCard() {
  const [projectIndex, setProjectIndex] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const project = PROJECTS[projectIndex];
  const statuses = PHASE_STATUSES[phaseIndex];
  const total = project.milestones.reduce((s, m) => s + m.amount, 0);
  const released = project.milestones.reduce(
    (s, m, i) => s + (statuses[i] === "released" ? m.amount : 0),
    0,
  );

  const animatedReleased = useAnimatedNumber(released, 900);
  const animatedTotal = useAnimatedNumber(total, 700);

  useEffect(() => {
    const duration = PHASE_DURATIONS[phaseIndex];
    const timer = setTimeout(() => {
      const isLastPhase = phaseIndex === PHASE_STATUSES.length - 1;
      if (isLastPhase) {
        // Fade out, switch project, fade in
        setVisible(false);
        setTimeout(() => {
          setProjectIndex((i) => (i + 1) % PROJECTS.length);
          setPhaseIndex(0);
          setVisible(true);
        }, 500);
      } else {
        setPhaseIndex((p) => p + 1);
      }
    }, duration);
    return () => clearTimeout(timer);
  }, [phaseIndex]);

  return (
    <div
      className={`w-full rounded-2xl border border-border bg-card shadow-lg overflow-hidden transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      {/* Header */}
      <div className="px-8 py-10 md:py-12 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
              Active project
            </p>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">{project.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{project.skills}</p>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <ul className="px-8 py-6 flex flex-col gap-3">
        {project.milestones.map(({ title, amount }, i) => {
          const status = statuses[i];
          const s = STATUS_CONFIG[status];

          return (
            <li
              key={title}
              className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-all duration-700 ${s.bg}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">{title}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground tabular-nums">
                  {amount.toLocaleString()} XLM
                </p>
                <p className={`text-xs font-medium mt-0.5 ${s.text}`}>{s.label}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="px-8 pb-8">
        <div className="rounded-xl bg-muted/60 border border-border px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Total released</p>
            <p className="text-xl md:text-2xl font-black text-success tabular-nums">
              {animatedReleased.toLocaleString()} XLM
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-0.5">Project value</p>
            <p className="text-xl md:text-2xl font-black text-accent tabular-nums">
              {animatedTotal.toLocaleString()} XLM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
