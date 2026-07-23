"use client";
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useIdleTimer — kiosk inactivity watchdog.
 *
 * Standard self-service-kiosk pattern (McDonald's / Starbucks / IKEA):
 *   1. If the guest stops touching the screen for `warnAfterMs`,
 *      show a "Still there?" countdown overlay.
 *   2. If they don't respond within `countdownMs`, fire `onTimeout`
 *      (the caller resets the cart/order and returns to the
 *      attract screen).
 *   3. Any tap/click/keypress/scroll cancels the warning and
 *      restarts the timer.
 *
 * Pass `enabled: false` while on the attract screen itself, or
 * during payment processing, so the guest is never interrupted.
 */
export default function useIdleTimer({
  enabled = true,
  warnAfterMs = 75000,   // 75s of inactivity → show warning
  countdownMs = 15000,   // 15s to respond before auto-reset
  onTimeout,
} = {}) {
  const [warning, setWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.round(countdownMs / 1000));

  const warnTimerRef  = useRef(null);
  const countTickRef  = useRef(null);
  const deadlineRef   = useRef(null);

  const clearAll = useCallback(() => {
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    if (countTickRef.current) clearInterval(countTickRef.current);
    warnTimerRef.current = null;
    countTickRef.current = null;
  }, []);

  const startCountdown = useCallback(() => {
    setWarning(true);
    deadlineRef.current = Date.now() + countdownMs;
    setSecondsLeft(Math.round(countdownMs / 1000));
    countTickRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearAll();
        setWarning(false);
        onTimeout && onTimeout();
      }
    }, 250);
  }, [countdownMs, clearAll, onTimeout]);

  const reset = useCallback(() => {
    clearAll();
    setWarning(false);
    if (!enabled) return;
    warnTimerRef.current = setTimeout(startCountdown, warnAfterMs);
  }, [enabled, warnAfterMs, startCountdown, clearAll]);

  useEffect(() => {
    if (!enabled) { clearAll(); setWarning(false); return; }

    reset();
    const events = ["pointerdown", "touchstart", "mousemove", "keydown", "wheel"];
    events.forEach(ev => window.addEventListener(ev, reset, { passive: true }));

    return () => {
      events.forEach(ev => window.removeEventListener(ev, reset));
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const stayHere = useCallback(() => reset(), [reset]);

  return { warning, secondsLeft, stayHere };
}
