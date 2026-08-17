"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useLenis } from "@/contexts/LenisContext";

const STEP_Y = 6;
const PIN_ENABLED_QUERY = "(min-width: 1280px) and (min-height: 800px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

interface StackedScrollCardsProps<T> {
  items: readonly T[];
  renderCard: (item: T, index: number) => ReactNode;
  gridClassName?: string;
  revealStaggerMs?: number;
  className?: string;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function StackedScrollCards<T>({
  items,
  renderCard,
  gridClassName = "",
  revealStaggerMs = 80,
  className = "",
}: StackedScrollCardsProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const progress = useMotionValue(0);
  const { lenis } = useLenis();

  useEffect(() => {
    const size = window.matchMedia(PIN_ENABLED_QUERY);
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => setPinned(size.matches && !reducedMotion.matches);
    update();
    size.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      size.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!pinned) return;
    const el = rootRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      if (travel > 0) progress.set(clamp01(-rect.top / travel));
    };

    measure();
    const offLenis = lenis ? lenis.on("scroll", measure) : null;
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      offLenis?.();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [lenis, pinned, progress]);

  const count = items.length;
  if (count === 0) return null;

  if (!pinned) {
    return (
      <div ref={rootRef} className={`grid grid-cols-1 gap-6 ${gridClassName}`}>
        {items.map((item, index) => (
          <ScrollReveal key={index} delay={index * revealStaggerMs}>
            {renderCard(item, index)}
          </ScrollReveal>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={`relative ${className}`}
      style={{ height: `calc(${count} * 100vh + 40vh)` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 flex">
          {items.map((item, index) => (
            <div key={index} className="relative h-full flex-1">
              <StackedScrollCard
                item={item}
                index={index}
                count={count}
                progress={progress}
                renderCard={renderCard}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StackedScrollCardProps<T> {
  item: T;
  index: number;
  count: number;
  progress: MotionValue<number>;
  renderCard: (item: T, index: number) => ReactNode;
}

function StackedScrollCard<T>({
  item,
  index,
  count,
  progress,
  renderCard,
}: StackedScrollCardProps<T>) {
  const start = index / count;
  const span = 1 / count;

  const reveal = useTransform(progress, (p) => (index === 0 ? 1 : clamp01((p - start) / span)));
  const y = useTransform(reveal, (v) =>
    index === 0 ? index * STEP_Y : (1 - v) * window.innerHeight * 0.8 + v * index * STEP_Y,
  );
  const scale = useTransform(reveal, (v) => 0.96 + 0.04 * v);
  const opacity = useTransform(reveal, (v) => Math.min(1, v * 1.4));

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 h-[26rem] w-[min(100%,26rem)] will-change-transform"
      style={{ zIndex: index + 1, y, scale, opacity }}
      transformTemplate={(_, generated) => `translate(-50%, -50%) ${generated}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 right-8 select-none font-heading text-[8rem] font-black leading-none tracking-tighter text-slate-900/80 opacity-[0.07]"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      {renderCard(item, index)}
    </motion.div>
  );
}
