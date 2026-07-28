import React from "react";

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = "Confirm" }) {
  return (
    <div className="absolute inset-0 bg-ink/50 flex items-center justify-center z-40 px-6">
      <div className="bg-cream rounded-2xl w-full max-w-xs p-5 text-center shadow-lift">
        <h3 className="font-display font-semibold text-charcoal text-base mb-1">{title}</h3>
        <p className="text-sm text-muted mb-5">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full py-2.5 text-sm font-medium border border-charcoal/20 text-charcoal/70 active:bg-charcoal/5"
          >
            Go back
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-full py-2.5 text-sm font-semibold bg-claret text-cream active:bg-claret/90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
