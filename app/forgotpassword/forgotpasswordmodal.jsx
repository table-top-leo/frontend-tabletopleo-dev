"use client";
import { useState } from "react";
import { sendForgotPasswordEmail } from "../services/sendforgotpasswordemail";

const ForgotPasswordModal = ({ onClose }) => {
  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const validate = () => {
    if (!email.trim()) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
    return "";
  };

  const handleSend = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    try {
      await sendForgotPasswordEmail(email.trim().toLowerCase());
      setSent(true);
    } catch (e) {
      const msg = e.response?.data?.message || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !loading) handleSend(); };

  return (
    <div
      style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}
      onClick={onClose}
    >
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)" }} />

      <div
        style={{ position:"relative", background:"#fff", borderRadius:"16px", padding:"32px 28px", width:"100%", maxWidth:"420px", boxShadow:"0 24px 60px rgba(0,0,0,0.18)", animation:"fpSlideUp 0.2s cubic-bezier(0.34,1.4,0.64,1)" }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position:"absolute", top:"14px", right:"14px", width:"28px", height:"28px", border:"none", background:"#f3f4f6", borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#6b7280", fontSize:"16px" }}
        >
          ✕
        </button>

        {!sent ? (
          <>
            <div style={{ textAlign:"center", marginBottom:"24px" }}>
              <div style={{ width:"52px", height:"52px", background:"#fef3c7", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:"24px" }}>
                🔑
              </div>
              <h2 style={{ margin:"0 0 6px", fontSize:"20px", fontWeight:"800", color:"#111827", letterSpacing:"-0.3px" }}>
                Forgot Password?
              </h2>
              <p style={{ margin:0, fontSize:"13.5px", color:"#6b7280", lineHeight:"1.6" }}>
                Enter your registered email address and we'll send you a link to reset your password.
              </p>
            </div>

            <div style={{ marginBottom:"16px" }}>
              <label style={{ display:"block", fontSize:"12.5px", fontWeight:"700", color:"#374151", marginBottom:"6px" }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{ width:"100%", padding:"11px 14px", border:`1.5px solid ${error ? "#ef4444" : "#e5e7eb"}`, borderRadius:"9px", fontSize:"14px", color:"#111827", outline:"none", background:"#f9fafb", boxSizing:"border-box", fontFamily:"inherit", transition:"border-color 0.15s" }}
                onFocus={e => { if (!error) e.target.style.borderColor = "#f59e0b"; }}
                onBlur={e => { if (!error) e.target.style.borderColor = "#e5e7eb"; }}
              />
              {error && (
                <p style={{ margin:"5px 0 0", fontSize:"12px", color:"#ef4444", fontWeight:"500" }}>
                  ⚠ {error}
                </p>
              )}
            </div>

            <div style={{ display:"flex", gap:"8px", marginTop:"4px" }}>
              <button
                onClick={onClose}
                style={{ flex:1, padding:"11px", border:"1.5px solid #e5e7eb", borderRadius:"9px", background:"#fff", fontSize:"13.5px", fontWeight:"600", color:"#374151", cursor:"pointer", fontFamily:"inherit", transition:"background 0.15s" }}
                onMouseOver={e => e.currentTarget.style.background="#f9fafb"}
                onMouseOut={e => e.currentTarget.style.background="#fff"}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                style={{ flex:2, padding:"11px", border:"none", borderRadius:"9px", background: loading ? "#d1d5db" : "linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", fontSize:"13.5px", fontWeight:"700", cursor: loading ? "not-allowed" : "pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", transition:"opacity 0.15s" }}
              >
                {loading ? (
                  <>
                    <span style={{ width:"14px", height:"14px", border:"2px solid rgba(255,255,255,0.4)", borderTop:"2px solid #fff", borderRadius:"50%", display:"inline-block", animation:"fpSpin 0.7s linear infinite" }} />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link →"
                )}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign:"center", padding:"8px 0" }}>
            <div style={{ width:"60px", height:"60px", background:"#dcfce7", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", fontSize:"28px" }}>
              ✅
            </div>
            <h2 style={{ margin:"0 0 10px", fontSize:"20px", fontWeight:"800", color:"#111827" }}>
              Check Your Email
            </h2>
            <p style={{ margin:"0 0 6px", fontSize:"13.5px", color:"#374151", lineHeight:"1.6" }}>
              If <strong>{email}</strong> is registered with us, you'll receive a password reset link shortly.
            </p>
            <p style={{ margin:"0 0 22px", fontSize:"12.5px", color:"#6b7280", lineHeight:"1.6" }}>
              The link will expire in <strong>30 minutes</strong>. Check your spam folder if you don't see it.
            </p>
            <button
              onClick={onClose}
              style={{ padding:"11px 28px", border:"none", borderRadius:"9px", background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", fontSize:"13.5px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit" }}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fpSlideUp { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes fpSpin    { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ForgotPasswordModal;
