"use client";
import "../designadminaccountsetup/stepper.css";

const STEPS = [
  { label: "Account Setup" },
  { label: "Business Type" },
  { label: "Business Information" },
  { label: "Setup Complete" },
];

export default function Stepper({ currentStep }) {
  return (
    <div className="stepper" role="list" aria-label="Onboarding progress">
      {STEPS.map((step, index) => {
        const num = index + 1;
        const completed = num < currentStep;
        const active = num === currentStep;

        return (
          <div
            key={num}
            style={{
              display: "flex",
              alignItems: "flex-start",
              flex: index < STEPS.length - 1 ? "1" : "0",
            }}
          >
            <div className="stepper-item" role="listitem">
              <div
                className={[
                  "stepper-circle",
                  completed ? "completed" : "",
                  active ? "active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={active ? "step" : undefined}
              >
                {completed ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M3.5 9.5L7.5 13.5L14.5 5.5"
                      stroke="white"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  num
                )}
              </div>
              <div
                className={[
                  "stepper-label",
                  completed ? "completed" : "",
                  active ? "active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {step.label}
              </div>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={[
                  "stepper-connector",
                  completed ? "completed" : "pending",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ marginTop: "21px" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}