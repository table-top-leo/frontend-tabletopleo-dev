import React, { useState } from "react";

export default function EmailInvoiceModal({ open, defaultEmail, onSend, onSkip }) {
  const [email, setEmail] = useState(defaultEmail || "");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  async function handleSend() {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    setSending(true);
    try {
      await onSend(email);
      setSent(true);
    } catch (e) {
      setError(e.message || "Couldn't send the invoice. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="absolute inset-0 bg-ink/55 flex items-center justify-center z-50 px-6">
      <div className="pop-in bg-cream w-full max-w-[300px] rounded-2xl shadow-lift overflow-hidden">
        <div className="px-5 pt-5 pb-4 text-center">
          <div className="w-11 h-11 mx-auto rounded-full bg-ember/15 text-ember-deep flex items-center justify-center mb-3">
            {sent ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="14" rx="2.4" />
                <path d="M3.5 6.5L12 13l8.5-6.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>

          {sent ? (
            <>
              <h3 className="font-display font-semibold text-charcoal text-base">Invoice sent!</h3>
              <p className="text-xs text-muted mt-1">Check {email} in a moment.</p>
            </>
          ) : (
            <>
              <h3 className="font-display font-semibold text-charcoal text-base">Email your invoice?</h3>
              <p className="text-xs text-muted mt-1 mb-3.5 leading-snug">
                We'll send a copy of your bill for easy expensing or record-keeping.
              </p>
              <input
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="you@email.com"
                inputMode="email"
                className="w-full bg-white border border-charcoal/15 rounded-xl px-3.5 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-ember focus:ring-2 focus:ring-ember/20 text-center"
              />
              {error && <p className="text-[10.5px] text-claret mt-1.5">{error}</p>}
            </>
          )}
        </div>

        {!sent && (
          <div className="flex border-t border-charcoal/10">
            <button
              onClick={onSkip}
              className="flex-1 py-3 text-xs font-medium text-charcoal/50 active:bg-charcoal/5"
            >
              Not now
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex-1 py-3 text-xs font-semibold text-ember-deep border-l border-charcoal/10 active:bg-ember/5 disabled:text-charcoal/25"
            >
              {sending ? "Sending…" : "Send invoice"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
