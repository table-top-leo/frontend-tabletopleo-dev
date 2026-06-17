"use client";
import { useState, useRef } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "../designadminaccountsetup/designaccountsetup.css";
import { registerUser, verifyOtp, createPassword } from "../services/authService";

export default function AccountSetup({ onNext, initialData }) {
  const [form, setForm] = useState({
    fullName: initialData?.fullName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    password: initialData?.password || "",
    confirmPassword: initialData?.confirmPassword || "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const otpRefs = useRef([]);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address.";
    if (!emailVerified) e.email = e.email || "Please verify your email first.";
    if (!form.password) e.password = "Password is required.";
    else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        form.password
      )
    )
      e.password =
        "Password must be at least 8 characters with uppercase, lowercase, digit and special character (@$!%*?&).";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match.";
    return e;
  };

  const handleVerifyEmail = async () => {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors((e) => ({ ...e, email: "Enter a valid email to verify." }));
      return;
    }
    if (!form.fullName.trim()) {
      setErrors((e) => ({ ...e, fullName: "Full name is required before sending OTP." }));
      return;
    }
    setVerifyLoading(true);
    try {
      const mobileNumber = form.phone || "0000000000";
      await registerUser(form.fullName, form.email, mobileNumber);
      setShowOtp(true);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to send OTP. Please try again.";
      if (msg.toLowerCase().includes("already registered")) {
        setErrors((e) => ({
          ...e,
          email: "Email already registered. Please login.",
        }));
      } else {
        setErrors((e) => ({ ...e, email: msg }));
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleOtpChange = (index, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[index] = val;
    setOtp(next);
    setOtpError("");
    if (val && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };

  const handleVerifyOtp = async () => {
    if (otp.join("").length < 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }
    setOtpLoading(true);
    try {
      await verifyOtp(form.email, otp.join(""));
      setEmailVerified(true);
      setShowOtp(false);
      setErrors((er) => ({ ...er, email: "" }));
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid OTP. Please try again.";
      if (msg.toLowerCase().includes("expired")) {
        setOtpError("OTP has expired. Please request a new OTP.");
      } else {
        setOtpError("Invalid OTP. Please check and try again.");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setVerifyLoading(true);
    try {
      const mobileNumber = form.phone || "0000000000";
      await registerUser(form.fullName, form.email, mobileNumber);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch {
      setOtpError("Failed to resend OTP. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await createPassword(form.email, form.password, form.confirmPassword);
      const adminId = res.data?.adminId;
      onNext({ ...form, emailVerified: true, adminId });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to set password. Please try again.";
      setErrors((e) => ({ ...e, password: msg }));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="account-setup">
      <div className="form-header">
        <div className="form-avatar-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="10" r="5" stroke="#7c3aed" strokeWidth="2" />
            <path
              d="M4 24c0-4.4 4.5-8 10-8s10 3.6 10 8"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h2 className="form-title">Create Your Account</h2>
        <p className="form-subtitle">Start your journey with TableTop</p>
      </div>

      <div className="form-group">
        <label className="form-label">Full Name</label>
        <div className={`input-wrap ${errors.fullName ? "error" : ""}`}>
          <span className="input-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5.5" r="3" stroke="#a1a1aa" strokeWidth="1.5" />
              <path d="M1.5 14c0-3 3-5 6.5-5s6.5 2 6.5 5" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <input
            className="input-field"
            type="text"
            placeholder="Enter your full name"
            value={form.fullName}
            onChange={set("fullName")}
            autoComplete="name"
          />
        </div>
        {errors.fullName && <div className="field-error">⚠ {errors.fullName}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Email Address</label>
        <div className={`input-wrap ${errors.email ? "error" : emailVerified ? "success" : ""}`}>
          <span className="input-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="3" width="14" height="10" rx="2" stroke="#a1a1aa" strokeWidth="1.5" />
              <path d="M1 5l7 5 7-5" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <input
            className="input-field"
            type="email"
            placeholder="Enter your email address"
            value={form.email}
            onChange={(e) => {
              set("email")(e);
              setEmailVerified(false);
              setShowOtp(false);
            }}
            autoComplete="email"
            disabled={emailVerified}
          />
          <div className="input-action">
            {emailVerified ? (
              <button className="btn-verify verified" disabled type="button">
                ✓ Verified
              </button>
            ) : (
              <button
                className="btn-verify"
                onClick={handleVerifyEmail}
                type="button"
                disabled={verifyLoading}
              >
                {verifyLoading ? "Sending..." : "Verify Email"}
              </button>
            )}
          </div>
        </div>
        {errors.email && <div className="field-error">⚠ {errors.email}</div>}
      </div>

      {showOtp && !emailVerified && (
        <div className="otp-section">
          <span className="otp-label">
            Enter the 6-digit OTP sent to {form.email}
          </span>
          <div className="otp-boxes">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (otpRefs.current[i] = el)}
                className="otp-box"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                aria-label={`OTP digit ${i + 1}`}
              />
            ))}
          </div>
          {otpError && <div className="field-error">{otpError}</div>}
          <div className="otp-actions">
            <button
              className="btn-verify-otp"
              onClick={handleVerifyOtp}
              type="button"
              disabled={otpLoading}
            >
              {otpLoading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              className="otp-resend"
              onClick={handleResend}
              type="button"
              disabled={verifyLoading}
            >
              {verifyLoading ? "Resending..." : "Resend OTP"}
            </button>
          </div>
        </div>
      )}

      {emailVerified && (
        <div className="email-verified-row">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" fill="#22c55e" />
            <path d="M4.5 8.5l2.5 2.5 4.5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Email verified successfully!
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Mobile Number (Optional)</label>
        <div className={`phone-input-wrap ${errors.phone ? "error" : ""}`}>
          <PhoneInput
            international
            defaultCountry="IN"
            value={form.phone}
            onChange={(val) => {
              setForm((f) => ({ ...f, phone: val || "" }));
              setErrors((er) => ({ ...er, phone: "" }));
            }}
            placeholder="Enter your mobile number"
          />
        </div>
        {errors.phone && <div className="field-error">⚠ {errors.phone}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <div className={`input-wrap ${errors.password ? "error" : ""}`}>
          <span className="input-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="7" width="10" height="8" rx="2" stroke="#a1a1aa" strokeWidth="1.5" />
              <path d="M5 7V5a3 3 0 016 0v2" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11" r="1.2" fill="#a1a1aa" />
            </svg>
          </span>
          <input
            className="input-field"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={form.password}
            onChange={set("password")}
            autoComplete="new-password"
          />
          <button
            className="btn-eye"
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? (
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <path d="M1 8.5C1 8.5 3.8 3 8.5 3S16 8.5 16 8.5 13.2 14 8.5 14 1 8.5 1 8.5z" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8.5" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <path d="M2 2l13 13M7 4.3A7.7 7.7 0 018.5 4C13.2 4 16 9 16 9s-.9 1.7-2.5 3M10.8 10.8A3 3 0 015.3 6.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && <div className="field-error">⚠ {errors.password}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Confirm Password</label>
        <div className={`input-wrap ${errors.confirmPassword ? "error" : ""}`}>
          <span className="input-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="7" width="10" height="8" rx="2" stroke="#a1a1aa" strokeWidth="1.5" />
              <path d="M5 7V5a3 3 0 016 0v2" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11" r="1.2" fill="#a1a1aa" />
            </svg>
          </span>
          <input
            className="input-field"
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            autoComplete="new-password"
          />
          <button
            className="btn-eye"
            type="button"
            onClick={() => setShowConfirm((s) => !s)}
            aria-label="Toggle confirm password"
          >
            {showConfirm ? (
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <path d="M1 8.5C1 8.5 3.8 3 8.5 3S16 8.5 16 8.5 13.2 14 8.5 14 1 8.5 1 8.5z" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8.5" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <path d="M2 2l13 13M7 4.3A7.7 7.7 0 018.5 4C13.2 4 16 9 16 9s-.9 1.7-2.5 3M10.8 10.8A3 3 0 015.3 6.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <div className="field-error">⚠ {errors.confirmPassword}</div>
        )}
      </div>

      <button
        className="btn-primary"
        onClick={handleSubmit}
        type="button"
        disabled={submitLoading}
      >
        {submitLoading ? "Setting up..." : "Next →"}
      </button>

      <div className="form-footer">
        By creating an account, you agree to our{" "}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}