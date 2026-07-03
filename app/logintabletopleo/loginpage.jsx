"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "../logintabletopleo/designloginpage.css";
import Link from "next/link";
import { loginUser } from "../services/authService";
import ForgotPasswordModal from "../forgotpassword/forgotpasswordmodal";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const SPECIALS = "@#$!~";

function generateSessionToken() {
  const ts    = Date.now().toString(36).toUpperCase();
  const rand  = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];
  const spec  = () => SPECIALS[Math.floor(Math.random() * SPECIALS.length)];
  let token   = "";
  for (let i = 0; i < 24; i++) token += rand();
  token += spec();
  for (let i = 0; i < 24; i++) token += rand();
  token += spec();
  for (let i = 0; i < 24; i++) token += rand();
  token += spec();
  for (let i = 0; i < 8;  i++) token += rand();
  const withTs = ts + token;
  return withTs.match(/.{1,8}/g).join("-");
}

const TableTopLeoLoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Enter a valid email address.";
    if (!password) newErrors.password = "Password is required.";
    return newErrors;
  };

  const handleLogin = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setApiError("");
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("ttl_token", data.token);
      localStorage.setItem(
        "ttl_user",
        JSON.stringify({
          adminId: data.adminId,
          fullName: data.fullName,
          email: data.email,
          businessId: data.businessId,
          logoUrl: data.logoUrl || null,
        })
      );
      const sessionToken = generateSessionToken();
      router.push(`/tabletopleodashboard?app=tabletopleo&session=${sessionToken}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid email or password.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  const features = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11l19-9-9 19-2-8-8-2z" />
        </svg>
      ),
      title: "Smart Menu Management",
      desc: "Create, update and manage your menu with ease.",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01" strokeWidth="2.5" />
        </svg>
      ),
      title: "QR Based Ordering",
      desc: "Let customers order effortlessly by scanning QR codes.",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      ),
      title: "Secure Payments",
      desc: "Accept payments securely with multiple payment options.",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      title: "Real-time Insights",
      desc: "Track orders, sales and performance in real-time.",
    },
  ];

  return (
    <div className="ttl-root">
      <nav className="ttl-nav">
        <div className="ttl-nav-logo">
          <div className="ttl-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="ttl-logo-text">TableTop</span>
        </div>
        <div className="ttl-nav-right">
          <span className="ttl-nav-hint">Don&apos;t have an account?</span>
          <Link href="/adminaccountsetup" className="ttl-btn-outline">Register</Link>
        </div>
      </nav>

      <main className="ttl-main">
        <section className="ttl-left">
          <div className="ttl-hero-text">
            <h1>
              Simplify Orders.<br />
              Delight Customers.<br />
              <span className="ttl-accent">Grow Your Business.</span>
            </h1>
            <p className="ttl-hero-sub">
              Join thousands of restaurants, cafes and shops who trust TableTop to manage their menu, orders, payments and customer experience.
            </p>
          </div>
          <ul className="ttl-features">
            {features.map((f, i) => (
              <li key={i} className="ttl-feature-item">
                <div className="ttl-feature-icon">{f.icon}</div>
                <div>
                  <strong>{f.title}</strong>
                  <p>{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="ttl-illustration">
            <div className="ttl-store">
              <div className="ttl-awning"><div className="ttl-awning-stripes" /></div>
              <div className="ttl-storefront">
                <div className="ttl-store-window" />
                <div className="ttl-store-door" />
                <div className="ttl-store-label">TableTop</div>
              </div>
              <div className="ttl-signboard">
                <span>Good</span><span>Food</span><span>Great</span><span>Mood</span>
              </div>
              <div className="ttl-lamp" />
              <div className="ttl-plant ttl-plant-left" />
              <div className="ttl-plant ttl-plant-right" />
            </div>
            <div className="ttl-clouds">
              <div className="ttl-cloud ttl-cloud-1" />
              <div className="ttl-cloud ttl-cloud-2" />
              <div className="ttl-cloud ttl-cloud-3" />
            </div>
          </div>
        </section>

        <section className="ttl-right">
          <div className="ttl-card">
            <div className="ttl-card-header">
              <div className="ttl-lock-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <h2>Welcome Back!</h2>
              <p>Login to your TableTop account</p>
            </div>

            {apiError && (
              <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>
                ⚠ {apiError}
              </div>
            )}

            <div className={`ttl-field ${errors.email ? "ttl-field--error" : ""}`}>
              <label>Email Address</label>
              <div className="ttl-input-wrap">
                <span className="ttl-input-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); setApiError(""); }}
                  onKeyDown={handleKeyDown}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="ttl-error-msg">{errors.email}</span>}
            </div>

            <div className={`ttl-field ${errors.password ? "ttl-field--error" : ""}`}>
              <label>Password</label>
              <div className="ttl-input-wrap">
                <span className="ttl-input-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); setApiError(""); }}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                />
                <button type="button" className="ttl-eye-btn" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="ttl-error-msg">{errors.password}</span>}
            </div>

            <div className="ttl-row-options">
              <label className="ttl-checkbox-label">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <span className="ttl-custom-checkbox">
                  {rememberMe && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2 6 5 9 10 3" />
                    </svg>
                  )}
                </span>
                Remember me
              </label>
              <button className="ttl-forgot" type="button" onClick={() => setShowForgot(true)}>
                Forgot Password?
              </button>
            </div>

            <button
              className={`ttl-btn-login ${loading ? "ttl-btn-login--loading" : ""}`}
              onClick={handleLogin}
              disabled={loading}
              type="button"
            >
              {loading ? (
                <span className="ttl-spinner" />
              ) : (
                <>
                  Login
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>

            {/* <div className="ttl-divider"><span>or continue with</span></div>

            <div className="ttl-social-row">
              <button className="ttl-social-btn" type="button" onClick={() => alert("Google login — coming soon!")}>
                <svg width="17" height="17" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className="ttl-social-btn" type="button" onClick={() => alert("Facebook login — coming soon!")}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              <button className="ttl-social-btn" type="button" onClick={() => alert("Apple login — coming soon!")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </button>
            </div> */}

<div style={{ marginTop: "18px",display: "flex",flexDirection: "column",alignItems: "center",gap: "6px",}}>
  <div style={{ display: "flex",alignItems: "center",gap: "6px",fontSize: "13px",color: "#16a34a",fontWeight: "600",}}>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
    <span>Your data is 100% secure with us.</span>
  </div>

  <div style={{fontSize: "12px",color: "#6b7280",textAlign: "center",lineHeight: "18px",}}>
    By continuing, you agree to our{" "}
    <Link href="/privacy-policy" style={{ color: "#4f46e5",textDecoration: "none",fontWeight: "600",}}>
      Privacy Policy
    </Link>{" "}
    and{" "}
    <Link href="/terms-and-conditions" style={{color: "#4f46e5",textDecoration: "none",fontWeight: "600",}}>
      Terms &amp; Conditions
    </Link>
    .
  </div>
</div>
</div>
</section>
      </main>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
};

export default TableTopLeoLoginPage;