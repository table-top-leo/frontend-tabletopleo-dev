"use client";
import React, { useMemo } from "react";

export default function KioskFloatingBubbles({ count = 14 }) {
  const bubbles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 6 + Math.random() * 22,
        duration: 9 + Math.random() * 10,
        delay: -(Math.random() * 14),
        drift: -30 + Math.random() * 60,
        opacity: 0.15 + Math.random() * 0.35,
      })),
    [count]
  );

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="ttlKioskEmberBubble"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            "--bubble-drift": `${b.drift}px`,
            "--bubble-opacity": b.opacity,
          }}
        />
      ))}
    </div>
  );
}
