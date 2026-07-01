"use client";
import { useState, useRef } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "../designadminaccountsetup/businessinformation.css";
import { setupBusiness } from "../services/businessService";
import axios from "axios";

const BASE_URL = "http://localhost:6163";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia",
  "Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium",
  "Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei",
  "Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Chad","Chile","China",
  "Colombia","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark",
  "Dominican Republic","Ecuador","Egypt","El Salvador","Eritrea","Estonia","Ethiopia",
  "Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Guatemala",
  "Guinea","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland",
  "Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan",
  "Laos","Latvia","Lebanon","Libya","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia",
  "Maldives","Mali","Malta","Mauritius","Mexico","Moldova","Mongolia","Montenegro","Morocco",
  "Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger",
  "Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Panama","Paraguay",
  "Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia",
  "Senegal","Serbia","Sierra Leone","Singapore","Slovakia","Slovenia","Somalia","South Africa",
  "South Korea","South Sudan","Spain","Sri Lanka","Sudan","Sweden","Switzerland","Syria",
  "Taiwan","Tajikistan","Tanzania","Thailand","Togo","Trinidad and Tobago","Tunisia","Turkey",
  "Turkmenistan","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States",
  "Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
];

const TIMEZONES = [
  "(GMT-12:00) International Date Line West","(GMT-11:00) Midway Island, Samoa",
  "(GMT-10:00) Hawaii","(GMT-09:00) Alaska","(GMT-08:00) Pacific Time (US & Canada)",
  "(GMT-07:00) Mountain Time (US & Canada)","(GMT-06:00) Central Time (US & Canada)",
  "(GMT-05:00) Eastern Time (US & Canada)","(GMT-04:00) Atlantic Time (Canada)",
  "(GMT-03:00) Buenos Aires, Georgetown","(GMT-02:00) Mid-Atlantic","(GMT-01:00) Azores",
  "(GMT+00:00) London, Lisbon, Dublin","(GMT+01:00) Amsterdam, Berlin, Paris",
  "(GMT+02:00) Cairo, Athens, Istanbul","(GMT+03:00) Moscow, Kuwait, Nairobi",
  "(GMT+04:00) Abu Dhabi, Muscat","(GMT+05:00) Islamabad, Karachi",
  "(GMT+05:30) Asia/Kolkata","(GMT+05:45) Kathmandu","(GMT+06:00) Astana, Dhaka",
  "(GMT+07:00) Bangkok, Hanoi, Jakarta","(GMT+08:00) Beijing, Singapore, Hong Kong",
  "(GMT+09:00) Tokyo, Seoul","(GMT+09:30) Adelaide, Darwin",
  "(GMT+10:00) Canberra, Melbourne, Sydney","(GMT+11:00) Solomon Islands",
  "(GMT+12:00) Auckland, Wellington, Fiji",
];

function to24Hour(timeStr) {
  const [time, meridiem] = timeStr.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (meridiem === "AM" && h === 12) h = 0;
  if (meridiem === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(h12).padStart(2, "0")}:${m} ${ampm}`;
});

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function BusinessInformation({ onNext, onBack, initialData, businessTypeData, accountData }) {
  const [form, setForm] = useState({
    businessName: initialData?.businessName || "",
    businessEmail: initialData?.businessEmail || "",
    businessPhone: initialData?.businessPhone || "",
    logoPreview: initialData?.logoPreview || null,
    logoUrl: initialData?.logoUrl || null,
    licenseNumber: initialData?.licenseNumber || "",
    gstNumber: initialData?.gstNumber || "",
    website: initialData?.website || "",
    addressLine1: initialData?.addressLine1 || "",
    addressLine2: initialData?.addressLine2 || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    country: initialData?.country || "",
    postalCode: initialData?.postalCode || "",
    openingTime: initialData?.openingTime || "09:00 AM",
    closingTime: initialData?.closingTime || "10:00 PM",
    workingDays: initialData?.workingDays || [],
    timezone: initialData?.timezone || "(GMT+05:30) Asia/Kolkata",
    description: initialData?.description || "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [apiError, setApiError] = useState("");
  const fileRef = useRef();

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: "" }));
  };

  const handleDaysChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setForm((f) => ({ ...f, workingDays: selected }));
    setErrors((er) => ({ ...er, workingDays: "" }));
  };

  // ── UPDATED: Upload to backend, get real URL ──────────────
  const handleLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, logoPreview: ev.target.result }));
    reader.readAsDataURL(file);

    // Upload to backend
    setLogoUploading(true);
    try {
      const token = localStorage.getItem("ttl_token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${BASE_URL}/api/images/logo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.data?.success && res.data?.data?.imageUrl) {
        setForm((f) => ({ ...f, logoUrl: res.data.data.imageUrl }));
      }
    } catch (err) {
      console.error("Logo upload failed:", err);
      setApiError("Failed to upload logo. Please try again.");
      setForm((f) => ({ ...f, logoPreview: null, logoUrl: null }));
    } finally {
      setLogoUploading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.businessName.trim()) e.businessName = "Business name is required.";
    if (!form.businessEmail.trim()) e.businessEmail = "Business email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.businessEmail))
      e.businessEmail = "Enter a valid email.";
    if (!form.businessPhone) e.businessPhone = "Business phone is required.";
    else if (!isValidPhoneNumber(form.businessPhone))
      e.businessPhone = "Enter a valid phone number.";
    if (!form.addressLine1.trim()) e.addressLine1 = "Address is required.";
    if (!form.city.trim()) e.city = "City is required.";
    if (!form.state.trim()) e.state = "State is required.";
    if (!form.country) e.country = "Country is required.";
    if (!form.postalCode.trim()) e.postalCode = "Postal code is required.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    if (logoUploading) { setApiError("Please wait for logo upload to finish."); return; }

    setLoading(true);
    setApiError("");
    try {
      const adminId = accountData?.adminId;
      if (!adminId) throw new Error("Admin ID is missing. Please restart registration.");

      const businessType = businessTypeData?.businessTypeLabel || businessTypeData?.businessType || "";
      const workingDaysStr = form.workingDays.length > 0
        ? form.workingDays.join(",")
        : "Monday,Tuesday,Wednesday,Thursday,Friday";

      const payload = {
        adminId,
        businessType,
        businessName: form.businessName,
        businessEmail: form.businessEmail,
        businessPhone: form.businessPhone,
        logoUrl: form.logoUrl || null,
        gstNumber: form.gstNumber || null,
        licenseNumber: form.licenseNumber || null,
        website: form.website || null,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2 || null,
        city: form.city,
        state: form.state,
        country: form.country,
        postalCode: form.postalCode,
        openingTime: to24Hour(form.openingTime),
        closingTime: to24Hour(form.closingTime),
        workingDays: workingDaysStr,
        timezone: form.timezone,
        businessDescription: form.description || null,
      };

      const res = await setupBusiness(payload);
      onNext({ ...form, businessId: res.data?.businessId });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save business info. Please try again.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="business-info">
      <h2 className="biz-title">Business Information</h2>
      <p className="biz-subtitle">Tell us more about your business.</p>

      {apiError && (
        <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
          ⚠ {apiError}
        </div>
      )}

      <div className="biz-grid">
        <div className="form-group">
          <label className="form-label">Business Name <span className="req-star">*</span></label>
          <div className={`input-wrap ${errors.businessName ? "error" : ""}`}>
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M2 13V5a1 1 0 011-1h10a1 1 0 011 1v8M6 4V3a2 2 0 014 0v1" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <input className="input-field" type="text" placeholder="Enter your business name" value={form.businessName} onChange={set("businessName")} />
          </div>
          {errors.businessName && <div className="field-error">⚠ {errors.businessName}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Business Type</label>
          <div className="input-wrap disabled">
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M8 2C8 2 3 6 3 10a5 5 0 0010 0C13 6 8 2 8 2z" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <input className="input-field" type="text" value={businessTypeData?.businessTypeLabel || ""} disabled readOnly />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Business Email <span className="req-star">*</span></label>
          <div className={`input-wrap ${errors.businessEmail ? "error" : ""}`}>
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="3" width="14" height="10" rx="2" stroke="#a1a1aa" strokeWidth="1.4" />
                <path d="M1 5l7 5 7-5" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </span>
            <input className="input-field" type="email" placeholder="Enter business email" value={form.businessEmail} onChange={set("businessEmail")} />
          </div>
          {errors.businessEmail && <div className="field-error">⚠ {errors.businessEmail}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Business Phone Number <span className="req-star">*</span></label>
          <div className={`phone-input-wrap ${errors.businessPhone ? "error" : ""}`}>
            <PhoneInput international defaultCountry="IN" value={form.businessPhone}
              onChange={(val) => { setForm((f) => ({ ...f, businessPhone: val || "" })); setErrors((er) => ({ ...er, businessPhone: "" })); }}
              placeholder="Enter business phone number" />
          </div>
          {errors.businessPhone && <div className="field-error">⚠ {errors.businessPhone}</div>}
        </div>

        {/* ── LOGO UPLOAD ── */}
        <div className="form-group">
          <label className="form-label">
            Business Logo <span style={{ color: "#71717a", fontWeight: 400 }}>(Optional)</span>
          </label>
          <div
            className={`logo-upload-area ${form.logoPreview ? "has-image" : ""}`}
            onClick={() => !logoUploading && fileRef.current?.click()}
            role="button" tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && !logoUploading && fileRef.current?.click()}
            aria-label="Upload business logo"
            style={{ cursor: logoUploading ? "not-allowed" : "pointer" }}
          >
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="logo-input" onChange={handleLogo} />
            {form.logoPreview ? (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img src={form.logoPreview} alt="Logo preview" className="logo-preview" />
                {logoUploading && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
                    Uploading...
                  </div>
                )}
              </div>
            ) : (
              <>
                {logoUploading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 28, height: 28, border: "3px solid #f3f4f6", borderTop: "3px solid #7c3aed", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    <div className="logo-upload-text">Uploading...</div>
                  </div>
                ) : (
                  <>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path d="M14 18V8M14 8l-4 4M14 8l4 4" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5 20a3 3 0 003 3h12a3 3 0 003-3" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <div className="logo-upload-text">Click to upload logo</div>
                    <div className="logo-upload-hint">PNG, JPG up to 5MB</div>
                  </>
                )}
              </>
            )}
          </div>
          {form.logoUrl && !logoUploading && (
            <div style={{ fontSize: 11.5, color: "#16a34a", marginTop: 4, fontWeight: 600 }}>
              ✓ Logo uploaded successfully
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Business License Number (Optional)</label>
          <div className="input-wrap">
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M4 2h8a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1zM6 6h4M6 9h4M6 12h2" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </span>
            <input className="input-field" type="text" placeholder="Enter license number" value={form.licenseNumber} onChange={set("licenseNumber")} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">GST Number (Optional)</label>
          <div className="input-wrap">
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M8 1l1.5 4.5H14l-3.8 2.8 1.5 4.5L8 10l-3.7 2.8 1.5-4.5L2 6.5h4.5z" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <input className="input-field" type="text" placeholder="Enter GST number" value={form.gstNumber} onChange={set("gstNumber")} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Website (Optional)</label>
          <div className="input-wrap">
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#a1a1aa" strokeWidth="1.4" />
                <path d="M1 8h14M8 1c-2 2-3 4.5-3 7s1 5 3 7M8 1c2 2 3 4.5 3 7s-1 5-3 7" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </span>
            <input className="input-field" type="url" placeholder="https://yourwebsite.com" value={form.website} onChange={set("website")} />
          </div>
        </div>

        <div className="form-group biz-col-full">
          <label className="form-label">Address Line 1 <span className="req-star">*</span></label>
          <div className={`input-wrap ${errors.addressLine1 ? "error" : ""}`}>
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M8 1C5.2 1 3 3.2 3 6c0 4 5 9 5 9s5-5 5-9c0-2.8-2.2-5-5-5zM8 8a2 2 0 110-4 2 2 0 010 4z" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <input className="input-field" type="text" placeholder="Enter address line 1" value={form.addressLine1} onChange={set("addressLine1")} />
          </div>
          {errors.addressLine1 && <div className="field-error">⚠ {errors.addressLine1}</div>}
        </div>

        <div className="form-group biz-col-full">
          <label className="form-label">Address Line 2 (Optional)</label>
          <div className="input-wrap">
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h12M2 12h8" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </span>
            <input className="input-field" type="text" placeholder="Enter address line 2" value={form.addressLine2} onChange={set("addressLine2")} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">City <span className="req-star">*</span></label>
          <div className={`input-wrap ${errors.city ? "error" : ""}`}>
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M2 13l6-10 6 10H2z" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <input className="input-field" type="text" placeholder="Enter city" value={form.city} onChange={set("city")} />
          </div>
          {errors.city && <div className="field-error">⚠ {errors.city}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">State / Province <span className="req-star">*</span></label>
          <div className={`input-wrap ${errors.state ? "error" : ""}`}>
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="1" stroke="#a1a1aa" strokeWidth="1.4" />
              </svg>
            </span>
            <input className="input-field" type="text" placeholder="Enter state" value={form.state} onChange={set("state")} />
          </div>
          {errors.state && <div className="field-error">⚠ {errors.state}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Country <span className="req-star">*</span></label>
          <div className={`input-wrap ${errors.country ? "error" : ""}`}>
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#a1a1aa" strokeWidth="1.4" />
                <path d="M1 8h14" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </span>
            <select className="select-field" value={form.country}
              onChange={(e) => { setForm((f) => ({ ...f, country: e.target.value })); setErrors((er) => ({ ...er, country: "" })); }}>
              <option value="">Select country</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {errors.country && <div className="field-error">⚠ {errors.country}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Postal / ZIP Code <span className="req-star">*</span></label>
          <div className={`input-wrap ${errors.postalCode ? "error" : ""}`}>
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M4 2h8l2 4H2L4 2zM2 6l2 8h8l2-8" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <input className="input-field" type="text" placeholder="Enter postal code" value={form.postalCode} onChange={set("postalCode")} />
          </div>
          {errors.postalCode && <div className="field-error">⚠ {errors.postalCode}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Opening Time <span className="req-star">*</span></label>
          <div className="input-wrap">
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#a1a1aa" strokeWidth="1.4" />
                <path d="M8 4v4l3 3" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </span>
            <select className="select-field" value={form.openingTime}
              onChange={(e) => setForm((f) => ({ ...f, openingTime: e.target.value }))}>
              {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Closing Time <span className="req-star">*</span></label>
          <div className="input-wrap">
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#a1a1aa" strokeWidth="1.4" />
                <path d="M8 4v4l3 3" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </span>
            <select className="select-field" value={form.closingTime}
              onChange={(e) => setForm((f) => ({ ...f, closingTime: e.target.value }))}>
              {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Working Days <span style={{ color: "#71717a", fontWeight: 400 }}>(Optional)</span></label>
          <div className="input-wrap" style={errors.workingDays ? { borderColor: "#ef4444" } : {}}>
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="3" width="14" height="12" rx="1" stroke="#a1a1aa" strokeWidth="1.4" />
                <path d="M1 7h14M5 1v4M11 1v4" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </span>
            <select className="select-field" multiple value={form.workingDays} onChange={handleDaysChange} size={1} style={{ minHeight: "40px" }}>
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="field-hint">Hold Ctrl / Cmd to select multiple days</div>
          {errors.workingDays && <div className="field-error">⚠ {errors.workingDays}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Time Zone <span className="req-star">*</span></label>
          <div className="input-wrap">
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#a1a1aa" strokeWidth="1.4" />
                <path d="M1 8h14M8 1c-1.5 2-2.5 4.4-2.5 7S6.5 13 8 15" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </span>
            <select className="select-field" value={form.timezone}
              onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group biz-col-full">
          <label className="form-label">Business Description (Optional)</label>
          <div className="textarea-wrap">
            <textarea className="textarea-field" placeholder="Tell us about your business..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
        </div>
      </div>

      <div className="step-nav">
        <button className="btn-back" onClick={onBack} type="button">← Back</button>
        <button className="btn-complete" onClick={handleSubmit} type="button" disabled={loading || logoUploading}>
          {loading ? "Saving..." : logoUploading ? "Uploading logo..." : "Complete Setup →"}
        </button>
      </div>

      <div className="secure-note">
        🔒 Your information is secure and will never be shared with anyone.
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
