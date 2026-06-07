import { useEffect, useRef } from "react";

/**
 * Runs `callback` on a fixed interval, but only when the tab is visible.
 * Also re-fires on visibility restore so state is immediately fresh when
 * the user tabs back in.
 *
 * Set `paused` to true while a transaction is in-flight so polling does
 * not race with a pending Freighter signature.
 */
export function usePolling(callback: () => void, intervalMs: number, paused = false) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (paused) return;

    const tick = () => {
      if (document.visibilityState === "visible") callbackRef.current();
    };

    const id = setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [intervalMs, paused]);
}
