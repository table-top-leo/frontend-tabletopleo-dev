"use client";
import { useState, useEffect } from "react";
import "../designadminaccountsetup/setupcomplete.css";
import Link from 'next/link'

const CONFETTI = [
  { color: "#f59e0b", w: 10, h: 5, left: "15%", delay: 0 },
  { color: "#ef4444", w: 8, h: 12, left: "25%", delay: 0.1 },
  { color: "#22c55e", w: 6, h: 8, left: "35%", delay: 0.05 },
  { color: "#3b82f6", w: 9, h: 5, left: "45%", delay: 0.15 },
  { color: "#f59e0b", w: 7, h: 10, left: "55%", delay: 0.08 },
  { color: "#a855f7", w: 11, h: 6, left: "65%", delay: 0.2 },
  { color: "#ec4899", w: 8, h: 9, left: "72%", delay: 0.03 },
  { color: "#22c55e", w: 6, h: 7, left: "80%", delay: 0.12 },
  { color: "#3b82f6", w: 9, h: 4, left: "88%", delay: 0.18 },
  { color: "#f59e0b", w: 7, h: 11, left: "10%", delay: 0.22 },
  { color: "#ef4444", w: 5, h: 6, left: "20%", delay: 0.07 },
  { color: "#7c3aed", w: 8, h: 8, left: "90%", delay: 0.14 },
];

const ACTION_CARDS = [
  { icon: "🍽️", bg: "#fef3c7", title: "Setup Menu", desc: "Add categories and products" },
  { icon: "💳", bg: "#fef9ee", title: "Payment Setup", desc: "Configure payment methods" },
  { icon: "📲", bg: "#ecfdf5", title: "Generate QR", desc: "Generate QR code for your business" },
  { icon: "📈", bg: "#f0fdf4", title: "Start Receiving Orders", desc: "Let customers place orders" },
];

function generateBizId() {
  return `BUS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`;
}

export default function SetupComplete({ accountData, businessTypeData }) {
  const [bizId] = useState(generateBizId);
  const [copied, setCopied] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, []);

  const name = accountData?.fullName || "User";
  const email = accountData?.email || "";
  const phone = accountData?.phone || "";
  const bizType = businessTypeData?.businessTypeLabel || "";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const copyBizId = () => {
    navigator.clipboard?.writeText(bizId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="setup-complete">
      <div className="success-anim-wrap">
        {animate &&
          CONFETTI.map((c, i) => (
            <div
              key={i}
              className="confetti-item"
              style={{
                background: c.color,
                width: c.w,
                height: c.h,
                left: c.left,
                top: "10%",
                animationDelay: `${c.delay}s`,
                animationDuration: `${1.4 + c.delay}s`,
              }}
            />
          ))}
        <div className={`success-circle ${animate ? "pop" : ""}`}>
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
            <path
              d="M10 22l8 8 14-16"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <h1 className="complete-title">Setup Completed!</h1>
      <div className="complete-congrats">
        Congratulations, {name.split(" ")[0]}! 🎉
      </div>
      <p className="complete-desc">
        Your business account has been successfully created.
        <br />
        You&apos;re ready to manage your business and start receiving orders.
      </p>

      <div className="user-card">
        <div className="user-avatar">{initials}</div>
        <div>
          <div className="user-name">{name}</div>
          <div className="user-details">
            <div className="user-detail-row">
              <span>✉️</span>
              <span>{email}</span>
            </div>
            <div className="user-detail-row">
              <span>📞</span>
              <span>{phone}</span>
            </div>
            <div className="user-detail-row">
              <span>🏪</span>
              <span>Business Type: {bizType}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="biz-id-card">
        <div className="biz-id-icon-wrap">
          <span style={{ fontSize: "22px" }}>🏬</span>
        </div>
        <div>
          <div className="biz-id-label">Your Business ID</div>
          <div className="biz-id-value">
            {bizId}
            <button className="btn-copy" onClick={copyBizId} type="button" title="Copy ID">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="5" y="5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M3 11H2a1 1 0 01-1-1V2a1 1 0 011-1h8a1 1 0 011 1v1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="whats-next-title">What&apos;s Next?</div>
      <div className="action-cards">
        {ACTION_CARDS.map((a) => (
          <div className="action-card" key={a.title} role="button" tabIndex={0}>
            <div className="action-icon-wrap" style={{ background: a.bg }}>
              {a.icon}
            </div>
            <div className="action-card-title">{a.title}</div>
            <div className="action-card-desc">{a.desc}</div>
          </div>
        ))}
      </div>
<Link href="/tabletopleodashboard" className="btn-dashboard" type="button">
        Go to Dashboard →
      </Link>

      <div className="secure-note">
        🔒 Your information is secure and will never be shared with anyone.
      </div>

      <div className="quote-section">
        <div className="quote-mark">&ldquo;</div>
        <div>
          <div className="quote-text">
            The best way to predict the future of your business is to create it.
            Keep innovating, keep serving, and success will follow you.
          </div>
          <div className="quote-author">– Peter Drucker</div>
        </div>
      </div>

      {copied && <div className="copied-toast">✓ Business ID copied!</div>}
    </div>
  );
}