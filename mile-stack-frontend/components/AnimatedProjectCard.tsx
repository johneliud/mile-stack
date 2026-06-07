"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock, Zap } from "lucide-react";

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
  released: { label: "Released", text: "text-success", bg: "bg-emerald-50 border-emerald-200" },
  funded: { label: "Funded", text: "text-accent", bg: "bg-blue-50 border-blue-200" },
  pending: { label: "Pending", text: "text-muted-foreground", bg: "bg-muted border-border" },
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
}
