"use client";
import React from "react";

export default function KioskConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = "Confirm" }) {
  return (
    <div className="ttlKioskCardamomConfirmWrap">
      <div className="ttlKioskCardamomConfirmCard">
        <h3 className="ttlKioskCardamomConfirmTitle">{title}</h3>
        <p className="ttlKioskCardamomConfirmMsg">{message}</p>
        <div className="ttlKioskCardamomConfirmActions">
          <button onClick={onCancel} className="ttlKioskCardamomConfirmGoBack">Go back</button>
          <button onClick={onConfirm} className="ttlKioskCardamomConfirmDanger">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
