"use client";
import { useState, useRef } from "react";
import {
  Pencil,
  Check,
  Plus,
  X,
  Upload,
  ArrowLeft,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  FileText,
  Clock,
  Calendar,
  Percent,
  Package,
  ChevronDown,
} from "lucide-react";
import "../businessinformationpage/designbusinessinfo.css";

const COUNTRIES = [
  "India","United States","United Kingdom","Australia","Canada","Germany","France",
  "Singapore","UAE","Saudi Arabia","Japan","China","Brazil","South Africa",
];

const TIMEZONES = [
  "(GMT+05:30) Asia/Kolkata","(GMT+00:00) London","(GMT-05:00) Eastern Time",
  "(GMT-08:00) Pacific Time","(GMT+01:00) Berlin","(GMT+08:00) Singapore",
  "(GMT+09:00) Tokyo","(GMT+04:00) Dubai","(GMT+03:00) Riyadh",
];

const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  const ap = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(h12).padStart(2,"0")}:${m} ${ap}`;
});

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const PHONE_CODES = [
  { flag: "🇮🇳", code: "+91", iso: "IN" },
  { flag: "🇺🇸", code: "+1",  iso: "US" },
  { flag: "🇬🇧", code: "+44", iso: "GB" },
  { flag: "🇦🇺", code: "+61", iso: "AU" },
  { flag: "🇸🇬", code: "+65", iso: "SG" },
  { flag: "🇦🇪", code: "+971",iso: "AE" },
  { flag: "🇩🇪", code: "+49", iso: "DE" },
  { flag: "🇯🇵", code: "+81", iso: "JP" },
];

const INITIAL_DATA = {
  businessName: "Regal Biryani House",
  businessType: "Restaurant",
  businessEmail: "contact@regalbiryani.com",
  phoneCode: "+91",
  businessPhone: "9876543210",
  logoPreview: null,
  licenseNumber: "LIC-2024-MH-00892",
  gstNumber: "27AABCU9603R1ZM",
  website: "https://regalbiryani.com",
  addressLine1: "42, Banjara Hills Road No. 12",
  addressLine2: "Near Green Park Hotel",
  city: "Hyderabad",
  state: "Telangana",
  country: "India",
  postalCode: "500034",
  openingTime: "09:00 AM",
  closingTime: "10:00 PM",
  workingDays: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
  timezone: "(GMT+05:30) Asia/Kolkata",
  description: "Authentic Hyderabadi biryani and kebabs served with love since 2008. Family-friendly dine-in and fast delivery available.",
};

const EXTRA_FIELD_TYPES = [
  { label: "Social Media Link", icon: Globe, placeholder: "https://instagram.com/yourbusiness" },
  { label: "Alternate Phone", icon: Phone, placeholder: "Enter alternate phone number" },
  { label: "FSSAI Number", icon: FileText, placeholder: "Enter FSSAI license number" },
  { label: "PAN Number", icon: FileText, placeholder: "Enter PAN number" },
  { label: "Bank Account", icon: Package, placeholder: "Enter bank account number" },
];

 const BusinessInformation= ({ onBack, onComplete })=> {
  const [data, setData] = useState(INITIAL_DATA);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(INITIAL_DATA);
  const [extraFields, setExtraFields] = useState([]);
  const [showAddField, setShowAddField] = useState(false);
  const [errors, setErrors] = useState({});
  const logoRef = useRef();

  const set = (field) => (e) => setDraft(d => ({ ...d, [field]: e.target.value }));

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setDraft(d => ({ ...d, logoPreview: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleDaysChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
    setDraft(d => ({ ...d, workingDays: selected }));
  };

  const validate = () => {
    const e = {};
    if (!draft.businessName.trim()) e.businessName = "Required";
    if (!draft.businessEmail.trim()) e.businessEmail = "Required";
    if (!draft.businessPhone.trim()) e.businessPhone = "Required";
    if (!draft.addressLine1.trim()) e.addressLine1 = "Required";
    if (!draft.city.trim()) e.city = "Required";
    if (!draft.state.trim()) e.state = "Required";
    if (!draft.country) e.country = "Required";
    if (!draft.postalCode.trim()) e.postalCode = "Required";
    return e;
  };

  const handleEdit = () => {
    setDraft({ ...data });
    setEditing(true);
    setErrors({});
  };

  const handleDone = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setData({ ...draft });
    setEditing(false);
    setErrors({});
  };

  const handleCancel = () => {
    setDraft({ ...data });
    setEditing(false);
    setErrors({});
  };

  const addExtraField = (type) => {
    setExtraFields(prev => [...prev, { id: Date.now(), ...type, value: "" }]);
    setShowAddField(false);
  };

  const removeExtraField = (id) => setExtraFields(prev => prev.filter(f => f.id !== id));

  const updateExtraField = (id, value) => {
    setExtraFields(prev => prev.map(f => f.id === id ? { ...f, value } : f));
  };

  const d = editing ? draft : data;

  const Field = ({ label, required, error, children }) => (
    <div className="bi-field-group">
      <label className="bi-label">
        {label} {required && <span className="bi-req">*</span>}
      </label>
      {children}
      {error && <span className="bi-field-err">{error}</span>}
    </div>
  );

  const InputWrap = ({ icon: Icon, children, error }) => (
    <div className={`bi-input-wrap ${error ? "bi-err" : ""} ${!editing ? "bi-readonly" : ""}`}>
      {Icon && <Icon size={15} className="bi-icon" />}
      {children}
    </div>
  );

  return (
    <div className="bi-root">
      <div className="bi-card">
        <div className="bi-header">
          <h1 className="bi-title">Business Information</h1>
          <p className="bi-sub">Tell us more about your business.</p>
          <div className="bi-header-actions">
            {!editing ? (
              <button className="bi-btn-edit" onClick={handleEdit} type="button">
                <Pencil size={15} /> Edit Information
              </button>
            ) : (
              <div className="bi-edit-actions">
                <button className="bi-btn-cancel" onClick={handleCancel} type="button">
                  <X size={15} /> Cancel
                </button>
                <button className="bi-btn-done" onClick={handleDone} type="button">
                  <Check size={15} /> Done
                </button>
              </div>
            )}
          </div>
        </div>

        {!editing && (
          <div className="bi-mode-banner">
            <Lock size={14} />
            <span>View mode — click <strong>Edit Information</strong> to make changes</span>
          </div>
        )}

        <div className="bi-grid">
          <Field label="Business Name" required error={errors.businessName}>
            <InputWrap icon={Building2} error={errors.businessName}>
              <input className="bi-input" type="text" placeholder="Enter your business name"
                value={d.businessName} onChange={set("businessName")} disabled={!editing} />
            </InputWrap>
          </Field>

          <Field label="Business Type">
            <InputWrap icon={MapPin}>
              <input className="bi-input" type="text" placeholder="Business type"
                value={d.businessType} onChange={set("businessType")} disabled={!editing} />
            </InputWrap>
          </Field>

          <Field label="Business Email" required error={errors.businessEmail}>
            <InputWrap icon={Mail} error={errors.businessEmail}>
              <input className="bi-input" type="email" placeholder="Enter business email"
                value={d.businessEmail} onChange={set("businessEmail")} disabled={!editing} />
            </InputWrap>
          </Field>

          <Field label="Business Phone Number" required error={errors.businessPhone}>
            <div className={`bi-phone-wrap ${errors.businessPhone ? "bi-err" : ""} ${!editing ? "bi-readonly" : ""}`}>
              <Phone size={15} className="bi-icon" />
              <select className="bi-phone-code" value={d.phoneCode} onChange={set("phoneCode")} disabled={!editing}>
                {PHONE_CODES.map(c => (
                  <option key={c.iso} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
              <ChevronDown size={13} className="bi-phone-chevron" />
              <input className="bi-input bi-phone-input" type="tel" placeholder="Enter business phone number"
                value={d.businessPhone} onChange={set("businessPhone")} disabled={!editing} />
            </div>
          </Field>

          <Field label="Business Logo" required>
            <div className={`bi-logo-wrap ${!editing ? "bi-readonly" : ""}`}
              onClick={() => editing && logoRef.current?.click()}
              role={editing ? "button" : undefined}
              tabIndex={editing ? 0 : undefined}
              onKeyDown={e => editing && e.key === "Enter" && logoRef.current?.click()}
            >
              <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
              {d.logoPreview ? (
                <img src={d.logoPreview} alt="Business logo" className="bi-logo-preview" />
              ) : (
                <>
                  <Upload size={22} className="bi-upload-icon" />
                  <span className="bi-upload-text">Click to upload logo</span>
                  <span className="bi-upload-hint">PNG, JPG up to 2MB</span>
                </>
              )}
            </div>
          </Field>

          <Field label="Business License Number (Optional)">
            <InputWrap icon={FileText}>
              <input className="bi-input" type="text" placeholder="Enter license number"
                value={d.licenseNumber} onChange={set("licenseNumber")} disabled={!editing} />
            </InputWrap>
          </Field>

          <Field label="GST Number (Optional)">
            <InputWrap icon={Percent}>
              <input className="bi-input" type="text" placeholder="Enter GST number"
                value={d.gstNumber} onChange={set("gstNumber")} disabled={!editing} />
            </InputWrap>
          </Field>

          <Field label="Website (Optional)">
            <InputWrap icon={Globe}>
              <input className="bi-input" type="url" placeholder="https://yourwebsite.com"
                value={d.website} onChange={set("website")} disabled={!editing} />
            </InputWrap>
          </Field>

          <div className="bi-col-full">
            <Field label="Address Line 1" required error={errors.addressLine1}>
              <InputWrap icon={MapPin} error={errors.addressLine1}>
                <input className="bi-input" type="text" placeholder="Enter address line 1"
                  value={d.addressLine1} onChange={set("addressLine1")} disabled={!editing} />
              </InputWrap>
            </Field>
          </div>

          <div className="bi-col-full">
            <Field label="Address Line 2 (Optional)">
              <InputWrap icon={Building2}>
                <input className="bi-input" type="text" placeholder="Enter address line 2"
                  value={d.addressLine2} onChange={set("addressLine2")} disabled={!editing} />
              </InputWrap>
            </Field>
          </div>

          <Field label="City" required error={errors.city}>
            <InputWrap icon={Building2} error={errors.city}>
              <input className="bi-input" type="text" placeholder="Enter city"
                value={d.city} onChange={set("city")} disabled={!editing} />
            </InputWrap>
          </Field>

          <Field label="State / Province" required error={errors.state}>
            <InputWrap icon={MapPin} error={errors.state}>
              <input className="bi-input" type="text" placeholder="Enter state"
                value={d.state} onChange={set("state")} disabled={!editing} />
            </InputWrap>
          </Field>

          <Field label="Country" required error={errors.country}>
            <div className={`bi-input-wrap bi-select-wrap ${errors.country ? "bi-err" : ""} ${!editing ? "bi-readonly" : ""}`}>
              <Globe size={15} className="bi-icon" />
              <select className="bi-select" value={d.country} onChange={set("country")} disabled={!editing}>
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={13} className="bi-select-chevron" />
            </div>
          </Field>

          <Field label="Postal / ZIP Code" required error={errors.postalCode}>
            <InputWrap icon={Package} error={errors.postalCode}>
              <input className="bi-input" type="text" placeholder="Enter postal code"
                value={d.postalCode} onChange={set("postalCode")} disabled={!editing} />
            </InputWrap>
          </Field>

          <Field label="Opening Time" required>
            <div className={`bi-input-wrap bi-select-wrap ${!editing ? "bi-readonly" : ""}`}>
              <Clock size={15} className="bi-icon" />
              <select className="bi-select" value={d.openingTime} onChange={set("openingTime")} disabled={!editing}>
                {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={13} className="bi-select-chevron" />
            </div>
          </Field>

          <Field label="Closing Time" required>
            <div className={`bi-input-wrap bi-select-wrap ${!editing ? "bi-readonly" : ""}`}>
              <Clock size={15} className="bi-icon" />
              <select className="bi-select" value={d.closingTime} onChange={set("closingTime")} disabled={!editing}>
                {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={13} className="bi-select-chevron" />
            </div>
          </Field>

          <Field label="Working Days" required>
            <div className={`bi-input-wrap bi-select-wrap ${!editing ? "bi-readonly" : ""}`}>
              <Calendar size={15} className="bi-icon" />
              <select className="bi-select" multiple value={d.workingDays}
                onChange={handleDaysChange} disabled={!editing} size={1} style={{ minHeight: 42 }}>
                {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
              <ChevronDown size={13} className="bi-select-chevron" />
            </div>
            {editing && <span className="bi-hint">Hold Ctrl / Cmd to select multiple days</span>}
            {!editing && d.workingDays.length > 0 && (
              <div className="bi-days-display">
                {d.workingDays.map(day => (
                  <span key={day} className="bi-day-pill">{day.slice(0,3)}</span>
                ))}
              </div>
            )}
          </Field>

          <Field label="Time Zone" required>
            <div className={`bi-input-wrap bi-select-wrap ${!editing ? "bi-readonly" : ""}`}>
              <Globe size={15} className="bi-icon" />
              <select className="bi-select" value={d.timezone} onChange={set("timezone")} disabled={!editing}>
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
              <ChevronDown size={13} className="bi-select-chevron" />
            </div>
          </Field>

          <div className="bi-col-full">
            <Field label="Business Description (Optional)">
              <div className={`bi-textarea-wrap ${!editing ? "bi-readonly" : ""}`}>
                <textarea className="bi-textarea" placeholder="Tell us about your business..."
                  value={d.description} onChange={set("description")} disabled={!editing} />
                {editing && <Pencil size={14} className="bi-textarea-icon" />}
              </div>
            </Field>
          </div>

          {extraFields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.id} className="bi-col-full">
                <Field label={field.label}>
                  <div className="bi-extra-field-row">
                    <InputWrap icon={Icon}>
                      <input className="bi-input" type="text" placeholder={field.placeholder}
                        value={field.value}
                        onChange={e => updateExtraField(field.id, e.target.value)}
                        disabled={!editing} />
                    </InputWrap>
                    {editing && (
                      <button className="bi-remove-field-btn" onClick={() => removeExtraField(field.id)} type="button" aria-label="Remove field">
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </Field>
              </div>
            );
          })}

          {editing && (
            <div className="bi-col-full">
              <div className="bi-add-field-row">
                <button className="bi-add-field-btn" onClick={() => setShowAddField(v => !v)} type="button">
                  <Plus size={15} /> Add New Field
                </button>

                {showAddField && (
                  <div className="bi-field-picker">
                    <div className="bi-field-picker-title">Choose field type</div>
                    {EXTRA_FIELD_TYPES.map(type => {
                      const Icon = type.icon;
                      return (
                        <button key={type.label} className="bi-field-picker-item"
                          onClick={() => addExtraField(type)} type="button">
                          <Icon size={14} />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bi-footer">
          <button className="bi-btn-back" onClick={onBack} type="button">
            <ArrowLeft size={16} /> Back
          </button>
          <button className="bi-btn-complete" onClick={onComplete} type="button">
            Complete Setup <ArrowRight size={16} />
          </button>
        </div>

        <div className="bi-secure-note">
          <Lock size={13} />
          Your information is secure and will never be shared with anyone.
        </div>
      </div>
    </div>
  );
}
export default BusinessInformation;