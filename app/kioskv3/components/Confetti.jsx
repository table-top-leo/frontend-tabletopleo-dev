import React, { useMemo } from "react";

const COLORS = ["#e0973f", "#f4c988", "#5c7a52", "#faf6ee", "#b5652a"];

export default function Confetti({ count = 40 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: COLORS[i % COLORS.length],
        duration: 1.4 + Math.random() * 1.1,
        delay: Math.random() * 0.5,
        rotate: Math.random() * 360,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
