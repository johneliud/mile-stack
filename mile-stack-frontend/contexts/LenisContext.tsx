"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";

interface LenisContextValue {
  lenis: Lenis | null;
  lenisStop: () => void;
  lenisStart: () => void;
}

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  lenisStop: () => {},
  lenisStart: () => {},
});

export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      // Natural exponential ease – quick start, gentle finish
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Mirror native touch inertia so mobile feels authentic
      syncTouch: true,
      syncTouchLerp: 0.075,
      // Slightly reduced multipliers for a controlled feel
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
      // Always resize automatically
      autoResize: true,
    });

    // Drive Lenis from requestAnimationFrame
    function raf(time: number) {
      instance.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }
    rafRef.current = requestAnimationFrame(raf);

    setLenis(instance);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      instance.destroy();
    };
  }, []);

  const lenisStop = useCallback(() => {
    lenis?.stop();
  }, [lenis]);

  const lenisStart = useCallback(() => {
    lenis?.start();
  }, [lenis]);

  return (
    <LenisContext.Provider value={{ lenis, lenisStop, lenisStart }}>
      {children}
    </LenisContext.Provider>
  );
}

/** Access the Lenis instance and modal helpers from any client component. */
export function useLenis() {
  return useContext(LenisContext);
}
