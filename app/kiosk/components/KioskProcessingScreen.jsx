"use client";
import React from "react";
import { KioskLeoMark } from "./KioskLogo";
import KioskFloatingBubbles from "./KioskFloatingBubbles";

export default function KioskProcessingScreen({ method }) {
  return (
    <div className="ttlKioskNutmegScreen">
      <KioskFloatingBubbles count={10} />
      <div className="ttlKioskNutmegRing">
        <div className="ttlKioskNutmegRingTrack" />
        <div className="ttlKioskNutmegRingSpin" />
        <div className="ttlKioskNutmegRingMark"><KioskLeoMark size={40} /></div>
      </div>
      <h2 className="ttlKioskNutmegTitle">Processing payment</h2>
      <p className="ttlKioskNutmegSub">Please don't tap away while we confirm your {method || "payment"}…</p>
    </div>
  );
}
