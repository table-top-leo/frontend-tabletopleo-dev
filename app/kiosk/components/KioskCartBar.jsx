"use client";
import React from "react";
import { formatCurrency } from "../../utils/currencyHelper";

export default function KioskCartBar({ total, itemCount, currencyCode, onOpen }) {
  if (itemCount === 0) return null;
  return (
    <div className="ttlKioskCinnamonBar">
      <button onClick={onOpen} className="ttlKioskCinnamonBtn">
        <span>
          <span className="ttlKioskCinnamonCount">{itemCount}</span>
          <span className="ttlKioskCinnamonLabel">View my cart</span>
        </span>
        <span className="ttlKioskCinnamonTotal">{formatCurrency(total, currencyCode)}</span>
      </button>
    </div>
  );
}
