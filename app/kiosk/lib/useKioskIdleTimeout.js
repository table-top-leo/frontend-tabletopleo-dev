"use client";
import { useEffect, useRef, useState, useCallback } from "react";

export default function useKioskIdleTimeout({
  warnAfterMs = 60_000,
  resetAfterMs = 90_000,
  paused = false,
  onReset,
}) {
  const [warning, setWarning] = useState(false);
  const warnTimer = useRef(null);
  const resetTimer = useRef(null);

  const clearTimers = useCallback(() => {
    if (warnTimer.current) clearTimeout(warnTimer.current);
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const arm = useCallback(() => {
    clearTimers();
    setWarning(false);
    if (paused) return;
    warnTimer.current = setTimeout(() => setWarning(true), warnAfterMs);
    resetTimer.current = setTimeout(() => {
      setWarning(false);
      onReset?.();
    }, resetAfterMs);
  }, [paused, warnAfterMs, resetAfterMs, onReset, clearTimers]);

  const bump = useCallback(() => {
    arm();
  }, [arm]);

  useEffect(() => {
    arm();
    const events = ["pointerdown", "touchstart", "keydown", "wheel"];
    events.forEach((ev) => window.addEventListener(ev, bump, { passive: true }));
    return () => {
      clearTimers();
      events.forEach((ev) => window.removeEventListener(ev, bump));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, warnAfterMs, resetAfterMs]);

  const stayHere = useCallback(() => {
    bump();
  }, [bump]);

  return { warning, stayHere };
}
