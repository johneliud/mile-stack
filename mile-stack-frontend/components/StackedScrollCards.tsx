"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useLenis } from "@/contexts/LenisContext";

const PIN_QUERY = "(min-width: 1024px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

interface StackedScrollCardsProps<T> {
  header?: ReactNode;
  items: readonly T[];
  renderCard: (item: T, index: number) => ReactNode;
  gridClassName?: string;
  revealStaggerMs?: number;
  className?: string;
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
  const OFFSET_X = count > 3 ? 56 : 68;
  const OFFSET_Y = count > 3 ? 24 : 28;

  const targetX = index * OFFSET_X;
  const targetY = index * OFFSET_Y;

  const start = index === 0 ? 0 : (index - 0.88) / (count - 0.15);
  const end = index === 0 ? 0.01 : index / (count - 0.15);

  const cardProgress = useTransform(progress, (p) => {
    if (index === 0) return 1;
    if (p <= start) return 0;
    if (p >= end) return 1;
    return (p - start) / (end - start);
  });

  const ease = useTransform(cardProgress, (t) => 1 - Math.pow(1 - t, 3));

  const y = useTransform(ease, (e) => (index === 0 ? 0 : (1 - e) * 320 + targetY));
  const x = useTransform(ease, (e) => (index === 0 ? 0 : (1 - e) * 24 + targetX));
  const scale = useTransform(ease, (e) => (index === 0 ? 1 : 0.95 + 0.05 * e));
  const opacity = useTransform(cardProgress, (t) => (index === 0 ? 1 : Math.min(1, t * 2.5)));
  const rotate = useTransform(ease, (e) => (index === 0 ? 0 : (1 - e) * 2));

  return (
    <motion.div
      className="absolute top-0 left-0 w-full max-w-[460px] will-change-transform"
      style={{
        zIndex: 10 + index,
        x,
        y,
        scale,
        opacity,
        rotate,
      }}
    >
      {renderCard(item, index)}
    </motion.div>
  );
}

export function StackedScrollCards<T>({
  header,
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
    const size = window.matchMedia(PIN_QUERY);
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
      if (travel > 0) {
        const current = -rect.top / travel;
        progress.set(Math.min(1, Math.max(0, current)));
      }
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

  // Mobile / tablet / reduced-motion fallback
  if (!pinned) {
    return (
      <div className={`py-16 md:py-24 ${className}`}>
        {header && <div className="mb-10">{header}</div>}
        <div className={`grid grid-cols-1 gap-6 ${gridClassName}`}>
          {items.map((item, index) => (
            <ScrollReveal key={index} delay={index * revealStaggerMs} className="h-full">
              {renderCard(item, index)}
            </ScrollReveal>
          ))}
        </div>
      </div>
    );
  }

  const OFFSET_X = count > 3 ? 56 : 68;
  const OFFSET_Y = count > 3 ? 24 : 28;
  const CARD_WIDTH = 460;
  const CARD_HEIGHT = 250;
  const stageWidth = CARD_WIDTH + (count - 1) * OFFSET_X;
  const stageHeight = CARD_HEIGHT + (count - 1) * OFFSET_Y;

  return (
    <div
      ref={rootRef}
      className={`relative ${className}`}
      style={{ height: `calc(100vh + ${(count - 1) * 60}vh)` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center py-8 sm:py-12">
        <div className="mx-auto max-w-screen-2xl w-full px-4 sm:px-6 lg:px-8 flex flex-col">
          {/* Top: Section Heading & Subheading */}
          {header && <div className="mb-8 sm:mb-10">{header}</div>}

          {/* Bottom: Diagonal Cascading Card Stack below the Header */}
          <div className="relative w-full flex items-center justify-start">
            <div
              className="relative w-full"
              style={{
                height: `${stageHeight}px`,
                maxWidth: `${stageWidth}px`,
              }}
            >
              {items.map((item, index) => (
                <StackedScrollCard
                  key={index}
                  item={item}
                  index={index}
                  count={count}
                  progress={progress}
                  renderCard={renderCard}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
