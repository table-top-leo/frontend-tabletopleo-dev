import React, { useState } from "react";

const REACTIONS = {
  0: "Tap a star to rate",
  1: "Oh no — what went wrong?",
  2: "We can do better",
  3: "Thanks for the feedback",
  4: "Glad you enjoyed it!",
  5: "You're roar-some! 🦁",
};

export default function RatingModal({ open, onSubmit, onSkip }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const shown = hover || stars;

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      await onSubmit({ stars, note });
      setSubmitted(true);
    } catch (e) {
      setError(e.message || "Couldn't submit your rating. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="absolute inset-0 bg-ink/55 flex items-center justify-center z-50 px-6">
      <div className="pop-in bg-cream w-full max-w-[300px] rounded-2xl shadow-lift overflow-hidden">
        <div className="px-5 pt-5 pb-4 text-center">
          {submitted ? (
            <>
              <div className="w-11 h-11 mx-auto rounded-full bg-moss/15 text-moss flex items-center justify-center mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                  <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-charcoal text-base">Thanks a bunch!</h3>
              <p className="text-xs text-muted mt-1">Your feedback helps us roar louder.</p>
            </>
          ) : (
            <>
              <h3 className="font-display font-semibold text-charcoal text-base mb-1">
                How was everything?
              </h3>
              <p className="text-xs text-muted mb-3.5">{REACTIONS[shown]}</p>

              <div className="flex items-center justify-center gap-1.5 mb-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setStars(n)}
                    className="p-0.5 active:scale-90 transition-transform"
                    aria-label={`${n} star`}
                  >
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill={n <= shown ? "#e0973f" : "none"}
                      stroke={n <= shown ? "#e0973f" : "#c9beb0"}
                      strokeWidth="1.6"
                    >
                      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 17.6 6.2 20.5l1.1-6.5-4.8-4.6 6.6-.9L12 2.5Z" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
              </div>

              {stars > 0 && (
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything you'd like to add? (optional)"
                  rows={2}
                  className="w-full bg-white border border-charcoal/15 rounded-xl px-3.5 py-2.5 text-xs text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-ember focus:ring-2 focus:ring-ember/20 resize-none"
                />
              )}

              {error && <p className="text-[10.5px] text-claret mt-2">{error}</p>}
            </>
          )}
        </div>

        {!submitted && (
          <div className="flex border-t border-charcoal/10">
            <button
              onClick={onSkip}
              className="flex-1 py-3 text-xs font-medium text-charcoal/50 active:bg-charcoal/5"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={stars === 0 || submitting}
              className={`flex-1 py-3 text-xs font-semibold border-l border-charcoal/10 ${
                stars === 0 || submitting ? "text-charcoal/25" : "text-ember-deep active:bg-ember/5"
              }`}
            >
              {submitting ? "Submitting…" : "Submit rating"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
