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
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const instance = new Lenis({
      autoRaf: true,
      autoResize: true,
      smoothWheel: true,
      syncTouch: false,
    });

    lenisRef.current = instance;
    setLenis(instance);

    return () => {
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  const lenisStop = useCallback(() => {
    lenisRef.current?.stop();
    document.body.style.overflow = "hidden";
  }, []);

  const lenisStart = useCallback(() => {
    lenisRef.current?.start();
    document.body.style.overflow = "";
  }, []);

  return (
    <LenisContext.Provider value={{ lenis, lenisStop, lenisStart }}>
      {children}
    </LenisContext.Provider>
  );
}

export function useLenis() {
  return useContext(LenisContext);
}
