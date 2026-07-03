"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { validateResetToken, resetPassword } from "../services/sendforgotpasswordemail";

const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeClosed = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const CheckIcon = ({ pass }) => (
  <span style={{ fontSize:"11px", marginRight:"4px" }}>{pass ? "✅" : "⬜"}</span>
);

function getPasswordChecks(pw) {
  return {
    length:    pw.length >= 8,
    upper:     /[A-Z]/.test(pw),
    lower:     /[a-z]/.test(pw),
    number:    /[0-9]/.test(pw),
    special:   /[^A-Za-z0-9]/.test(pw),
  };
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token") || "";

  const [phase,       setPhase]       = useState("validating");
  const [newPw,       setNewPw]       = useState("");
  const [confirmPw,   setConfirmPw]   = useState("");
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [countdown,   setCountdown]   = useState(5);

  const checks = getPasswordChecks(newPw);
  const allChecksPass = Object.values(checks).every(Boolean);

  useEffect(() => {
    if (!token) { setPhase("invalid"); return; }
    (async () => {
      try {
        await validateResetToken(token);
        setPhase("form");
      } catch {
        setPhase("invalid");
      }
    })();
  }, [token]);

  useEffect(() => {
    if (phase !== "success") return;
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(interval); router.push("/logintabletopleo"); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, router]);

  const handleReset = async () => {
    if (!allChecksPass) { setError("Please meet all password requirements."); return; }
    if (newPw !== confirmPw) { setError("Passwords do not match."); return; }
    setError(""); setLoading(true);
    try {
      await resetPassword(token, newPw, confirmPw);
      setPhase("success");
    } catch (e) {
      const msg = e.response?.data?.message || "Something went wrong. Please try again.";
      setError(msg);
      if (msg.toLowerCase().includes("expired") || msg.toLowerCase().includes("invalid")) {
        setPhase("invalid");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    width:"100%", padding:"11px 42px 11px 14px", border:`1.5px solid ${hasError ? "#ef4444" : "#e5e7eb"}`,
    borderRadius:"9px", fontSize:"14px", color:"#111827", outline:"none", background:"#f9fafb",
    boxSizing:"border-box", fontFamily:"inherit",
  });

  const labelStyle = {
    display:"block", fontSize:"12.5px", fontWeight:"700", color:"#374151", marginBottom:"6px",
  };

  if (phase === "validating") return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f6f9" }}>
      <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:"14px" }}>
        <div style={{ width:"40px", height:"40px", border:"3px solid #e5e7eb", borderTop:"3px solid #f59e0b", borderRadius:"50%", animation:"rpSpin 0.7s linear infinite" }} />
        <p style={{ color:"#6b7280", fontSize:"14px", margin:0, fontFamily:"inherit" }}>Validating your link...</p>
        <style>{`@keyframes rpSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (phase === "invalid") return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f6f9", padding:"20px", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:"16px", padding:"40px 36px", maxWidth:"420px", width:"100%", textAlign:"center", boxShadow:"0 8px 32px rgba(0,0,0,0.1)" }}>
        <div style={{ width:"64px", height:"64px", background:"#fef2f2", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:"30px" }}>⏰</div>
        <h1 style={{ margin:"0 0 10px", fontSize:"22px", fontWeight:"800", color:"#111827" }}>Link Expired</h1>
        <p style={{ margin:"0 0 24px", fontSize:"14px", color:"#6b7280", lineHeight:"1.6" }}>
          This password reset link is invalid or has expired. Reset links are valid for <strong>30 minutes</strong> only.
        </p>
        <button
          onClick={() => router.push("/logintabletopleo")}
          style={{ padding:"12px 28px", border:"none", borderRadius:"9px", background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", fontSize:"14px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit" }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );

  if (phase === "success") return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f6f9", padding:"20px", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:"16px", padding:"40px 36px", maxWidth:"420px", width:"100%", textAlign:"center", boxShadow:"0 8px 32px rgba(0,0,0,0.1)" }}>
        <div style={{ width:"64px", height:"64px", background:"#dcfce7", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:"30px" }}>✅</div>
        <h1 style={{ margin:"0 0 10px", fontSize:"22px", fontWeight:"800", color:"#111827" }}>Password Updated!</h1>
        <p style={{ margin:"0 0 16px", fontSize:"14px", color:"#6b7280", lineHeight:"1.6" }}>
          Your password has been reset successfully. You can now login with your new password.
        </p>
        <div style={{ background:"#f9fafb", border:"1px solid #f3f4f6", borderRadius:"8px", padding:"10px 16px", marginBottom:"24px" }}>
          <p style={{ margin:0, fontSize:"12.5px", color:"#6b7280" }}>
            Redirecting to login in <strong style={{ color:"#f59e0b" }}>{countdown}</strong> second{countdown !== 1 ? "s" : ""}...
          </p>
        </div>
        <button
          onClick={() => router.push("/logintabletopleo")}
          style={{ padding:"12px 28px", border:"none", borderRadius:"9px", background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", fontSize:"14px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", width:"100%" }}
        >
          Go to Login →
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f6f9", padding:"20px", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:"16px", padding:"36px 32px", maxWidth:"440px", width:"100%", boxShadow:"0 8px 32px rgba(0,0,0,0.1)" }}>

        <div style={{ textAlign:"center", marginBottom:"28px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginBottom:"20px" }}>
            <div style={{ width:"32px", height:"32px", background:"#f59e0b", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px" }}>🍽️</div>
            <span style={{ fontSize:"18px", fontWeight:"800", color:"#111827" }}>TableTop Leo</span>
          </div>
          <h1 style={{ margin:"0 0 8px", fontSize:"22px", fontWeight:"800", color:"#111827", letterSpacing:"-0.3px" }}>Reset Password</h1>
          <p style={{ margin:0, fontSize:"13.5px", color:"#6b7280", lineHeight:"1.6" }}>Create a strong new password for your account.</p>
        </div>

        {error && (
          <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:"9px", padding:"11px 14px", marginBottom:"16px" }}>
            <p style={{ margin:0, fontSize:"12.5px", color:"#dc2626", fontWeight:"600" }}>⚠ {error}</p>
          </div>
        )}

        <div style={{ marginBottom:"16px" }}>
          <label style={labelStyle}>New Password</label>
          <div style={{ position:"relative" }}>
            <input
              type={showNew ? "text" : "password"}
              placeholder="Enter new password"
              value={newPw}
              onChange={e => { setNewPw(e.target.value); setError(""); }}
              style={inputStyle(false)}
            />
            <button
              type="button"
              onClick={() => setShowNew(s => !s)}
              style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9ca3af", display:"flex", alignItems:"center" }}
            >
              {showNew ? <EyeClosed /> : <EyeOpen />}
            </button>
          </div>
        </div>

        {newPw && (
          <div style={{ background:"#f9fafb", border:"1px solid #f3f4f6", borderRadius:"9px", padding:"12px 14px", marginBottom:"16px" }}>
            <p style={{ margin:"0 0 8px", fontSize:"11.5px", fontWeight:"700", color:"#374151" }}>Password requirements:</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px" }}>
              {[
                [checks.length,  "Min 8 characters"],
                [checks.upper,   "Uppercase letter"],
                [checks.lower,   "Lowercase letter"],
                [checks.number,  "Number"],
                [checks.special, "Special character"],
              ].map(([pass, label]) => (
                <div key={label} style={{ display:"flex", alignItems:"center", fontSize:"11.5px", color: pass ? "#16a34a" : "#9ca3af" }}>
                  <CheckIcon pass={pass} /> {label}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom:"22px" }}>
          <label style={labelStyle}>Confirm Password</label>
          <div style={{ position:"relative" }}>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm your new password"
              value={confirmPw}
              onChange={e => { setConfirmPw(e.target.value); setError(""); }}
              onKeyDown={e => { if (e.key === "Enter" && !loading) handleReset(); }}
              style={inputStyle(confirmPw && confirmPw !== newPw)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(s => !s)}
              style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9ca3af", display:"flex", alignItems:"center" }}
            >
              {showConfirm ? <EyeClosed /> : <EyeOpen />}
            </button>
          </div>
          {confirmPw && confirmPw !== newPw && (
            <p style={{ margin:"5px 0 0", fontSize:"12px", color:"#ef4444", fontWeight:"500" }}>⚠ Passwords do not match.</p>
          )}
        </div>

        <div style={{ display:"flex", gap:"8px" }}>
          <button
            onClick={() => router.push("/logintabletopleo")}
            style={{ flex:1, padding:"12px", border:"1.5px solid #e5e7eb", borderRadius:"9px", background:"#fff", fontSize:"13.5px", fontWeight:"600", color:"#374151", cursor:"pointer", fontFamily:"inherit" }}
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            disabled={loading || !allChecksPass || newPw !== confirmPw}
            style={{ flex:2, padding:"12px", border:"none", borderRadius:"9px", background: (loading || !allChecksPass || newPw !== confirmPw) ? "#d1d5db" : "linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", fontSize:"13.5px", fontWeight:"700", cursor: (loading || !allChecksPass || newPw !== confirmPw) ? "not-allowed" : "pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px" }}
          >
            {loading ? (
              <>
                <span style={{ width:"14px", height:"14px", border:"2px solid rgba(255,255,255,0.4)", borderTop:"2px solid #fff", borderRadius:"50%", display:"inline-block", animation:"rpSpin 0.7s linear infinite" }} />
                Resetting...
              </>
            ) : "Reset Password →"}
          </button>
        </div>

        <p style={{ margin:"16px 0 0", textAlign:"center", fontSize:"12.5px", color:"#9ca3af" }}>
          Remember your password?{" "}
          <button onClick={() => router.push("/logintabletopleo")} style={{ background:"none", border:"none", color:"#f59e0b", fontWeight:"700", cursor:"pointer", fontSize:"12.5px", fontFamily:"inherit" }}>
            Sign in
          </button>
        </p>
      </div>

      <style>{`@keyframes rpSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f6f9" }}>
        <div style={{ width:"40px", height:"40px", border:"3px solid #e5e7eb", borderTop:"3px solid #f59e0b", borderRadius:"50%", animation:"rpSpin 0.7s linear infinite" }} />
        <style>{`@keyframes rpSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
