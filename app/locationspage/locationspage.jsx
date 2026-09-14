"use client";
import { useState, useEffect } from "react";
import {
  MapPin, Plus, X, Building2, Phone, Clock, CreditCard,
  UserPlus, RefreshCw, Pencil, Check, ShieldCheck, Info,
  Store, Users, Copy, CheckCircle2, Loader2, AlertTriangle, Mail, Trash2,
} from "lucide-react";
import { getBusinessInformation } from "../services/businessService";
import { getLocations, createLocation, updateLocation, deleteLocation } from "../services/locationService";

const ROLES = [
  { value: "BRANCH_MANAGER", label: "Branch Manager", desc: "Can edit this branch's menu, offers, payments & hours" },
  { value: "CASHIER",        label: "Cashier",         desc: "Can accept/reject orders — no access to settings" },
];

// Dial code + strict mobile-number length per country — keyed by the exact
// same country names used in Business Information's country dropdown, so
// whichever country the merchant registered under is matched automatically.
// Falls back to India if the country can't be determined.
const PHONE_CONFIG = {
  "India":                { code: "+91",  length: 10, example: "98765 43210" },
  "Denmark":              { code: "+45",  length: 8,  example: "12 34 56 78" },
  "United States":        { code: "+1",   length: 10, example: "(555) 123-4567" },
  "United Kingdom":       { code: "+44",  length: 10, example: "7911 123456" },
  "Germany":              { code: "+49",  length: 11, example: "151 23456789" },
  "France":               { code: "+33",  length: 9,  example: "6 12 34 56 78" },
  "Spain":                { code: "+34",  length: 9,  example: "612 345 678" },
  "Italy":                { code: "+39",  length: 10, example: "312 345 6789" },
  "Portugal":             { code: "+351", length: 9,  example: "912 345 678" },
  "Netherlands":          { code: "+31",  length: 9,  example: "6 12345678" },
  "Belgium":              { code: "+32",  length: 9,  example: "470 12 34 56" },
  "Austria":              { code: "+43",  length: 11, example: "664 1234567" },
  "Finland":              { code: "+358", length: 9,  example: "41 2345678" },
  "Greece":               { code: "+30",  length: 10, example: "691 234 5678" },
  "Luxembourg":           { code: "+352", length: 9,  example: "621 123 456" },
  "Malta":                { code: "+356", length: 8,  example: "9912 3456" },
  "Ireland":              { code: "+353", length: 9,  example: "85 123 4567" },
  "Cyprus":               { code: "+357", length: 8,  example: "96 123456" },
  "United Arab Emirates": { code: "+971", length: 9,  example: "50 123 4567" },
  "Saudi Arabia":         { code: "+966", length: 9,  example: "50 123 4567" },
  "Australia":            { code: "+61",  length: 9,  example: "412 345 678" },
  "Canada":               { code: "+1",   length: 10, example: "(555) 123-4567" },
  "Singapore":            { code: "+65",  length: 8,  example: "8123 4567" },
  "Japan":                { code: "+81",  length: 10, example: "90 1234 5678" },
  "Norway":               { code: "+47",  length: 8,  example: "406 12 345" },
  "Sweden":               { code: "+46",  length: 9,  example: "70 123 45 67" },
  "Switzerland":          { code: "+41",  length: 9,  example: "78 123 45 67" },
  "China":                { code: "+86",  length: 11, example: "138 0013 8000" },
  "Malaysia":             { code: "+60",  length: 10, example: "12 345 6789" },
  "Thailand":             { code: "+66",  length: 9,  example: "81 234 5678" },
  "Philippines":          { code: "+63",  length: 10, example: "917 123 4567" },
  "Indonesia":            { code: "+62",  length: 11, example: "812 3456 789" },
  "Pakistan":             { code: "+92",  length: 10, example: "301 2345678" },
  "Bangladesh":           { code: "+880", length: 10, example: "1712 345678" },
  "Sri Lanka":            { code: "+94",  length: 9,  example: "71 234 5678" },
  "Nepal":                { code: "+977", length: 10, example: "984 1234567" },
  "Mexico":               { code: "+52",  length: 10, example: "55 1234 5678" },
  "Brazil":               { code: "+55",  length: 11, example: "11 91234-5678" },
  "South Africa":         { code: "+27",  length: 9,  example: "71 123 4567" },
  "Nigeria":              { code: "+234", length: 10, example: "802 123 4567" },
  "Kenya":                { code: "+254", length: 9,  example: "712 345678" },
  "Egypt":                { code: "+20",  length: 10, example: "100 123 4567" },
  "Turkey":               { code: "+90",  length: 10, example: "532 123 4567" },
  "Russia":               { code: "+7",   length: 10, example: "912 345-67-89" },
  "Kuwait":               { code: "+965", length: 8,  example: "5012 3456" },
  "Oman":                 { code: "+968", length: 8,  example: "9212 3456" },
  "Qatar":                { code: "+974", length: 8,  example: "3312 3456" },
  "Bahrain":              { code: "+973", length: 8,  example: "3612 3456" },
  "New Zealand":          { code: "+64",  length: 9,  example: "21 123 4567" },
};
const DEFAULT_PHONE_CONFIG = PHONE_CONFIG["India"];

function slugify(name) {
  const cleaned = (name || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!cleaned) return "BRN";
  return cleaned.slice(0, 3);
}

function randomLoginIdSuffix() {
  return String(Math.floor(10000 + Math.random() * 90000)); // 5 random digits, e.g. "54125"
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

const EMPTY_FORM = {
  branchName: "", phone: "", addressLine1: "", city: "", state: "", postalCode: "",
  openingTime: "09:00", closingTime: "22:00",
  useHeadOfficePayment: true,
  assignStaff: false,
  role: "BRANCH_MANAGER",
  loginId: "",
  password: "",
};

const LocationsPage = () => {
  // Only the Head Office OWNER can add or edit branches from here — a
  // staff login (Branch Manager/Cashier) can see this list for context
  // (which other branches exist), but Add/Edit are hidden entirely for
  // them, not just disabled, so it's unambiguous this isn't their area.
  const currentRole = (() => {
    try {
      const stored = localStorage.getItem("ttl_user");
      return stored ? (JSON.parse(stored).role || "OWNER") : "OWNER";
    } catch { return "OWNER"; }
  })();
  const isOwner = currentRole === "OWNER";

  const [business, setBusiness] = useState(null);

  const [phoneConfig, setPhoneConfig] = useState(DEFAULT_PHONE_CONFIG);
  const [locations, setLocations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [copiedField, setCopiedField] = useState("");
  const [toast, setToast] = useState("");
  const [justCreated, setJustCreated] = useState(null); // shows the credentials-sent banner once, right after creating
  const [deleteTarget, setDeleteTarget] = useState(null); // location pending delete confirmation
  const [deleting, setDeleting] = useState(false);
  const [previewSuffix, setPreviewSuffix] = useState(randomLoginIdSuffix());

  const branchCount = locations.length;

  // Reads the merchant's own registered business (name, address, country)
  // so: 1) the phone field matches their real market (India -> +91/10
  // digits, Denmark -> +45/8 digits, etc.), and 2) the Head Office card at
  // the top of the page shows their real business name, not a placeholder.
  useEffect(() => {
    (async () => {
      try {
        const stored = localStorage.getItem("ttl_user");
        if (!stored) return;
        const { adminId } = JSON.parse(stored);
        if (!adminId) return;
        const res = await getBusinessInformation(adminId);
        if (res?.data) {
          setBusiness(res.data);
          if (res.data.country && PHONE_CONFIG[res.data.country]) {
            setPhoneConfig(PHONE_CONFIG[res.data.country]);
          }
        }
      } catch {
        // Falls back to defaults — never blocks this page.
      }
    })();
  }, []);

  const fetchLocations = async () => {
    setLoadingList(true);
    setListError("");
    try {
      const res = await getLocations();
      if (res.success) setLocations(res.data || []);
      else setListError(res.message || "Could not load your locations.");
    } catch (e) {
      setListError(e.response?.data?.message || "Could not load your locations.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  // The random 5-digit suffix is generated once per "Add New Location"
  // session (not on every keystroke) so the preview ID doesn't visibly
  // jump around while typing — only the branch-code prefix updates live
  // as the name changes. The FINAL id is always authoritatively
  // generated server-side on save; this is purely a preview of the shape.
  useEffect(() => {
    if (!showForm || editingId) return;
    setForm(f => ({
      ...f,
      loginId: f.branchName.trim() ? `${slugify(f.branchName)}${previewSuffix}` : "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.branchName, showForm, editingId, previewSuffix]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, password: generatePassword() });
    setPreviewSuffix(randomLoginIdSuffix());
    setErrors({});
    setSaveError("");
    setJustCreated(null);
    setShowForm(true);
  };

  const openEditForm = (loc) => {
    setEditingId(loc.locationId);
    setForm({
      branchName: loc.branchName, phone: (loc.phone || "").replace(/^\+\d+\s*/, ""),
      addressLine1: loc.addressLine1 || "",
      city: loc.city || "", state: loc.state || "", postalCode: loc.postalCode || "",
      openingTime: loc.openingTime || "09:00", closingTime: loc.closingTime || "22:00",
      useHeadOfficePayment: loc.useHeadOfficePayment !== false,
      assignStaff: !!loc.staff && loc.staff.accountStatus !== "INACTIVE",
      role: loc.staff?.role || "BRANCH_MANAGER",
      loginId: loc.staff?.loginId || "",
      password: "",
    });
    setErrors({});
    setSaveError("");
    setJustCreated(null);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const validate = () => {
    const e = {};
    if (!form.branchName.trim()) e.branchName = "Branch name is required";
    if (!form.phone.trim()) {
      e.phone = "Phone number is required";
    } else if (form.phone.length !== phoneConfig.length) {
      e.phone = `Enter a valid ${phoneConfig.length}-digit number for ${phoneConfig.code}`;
    }
    if (!form.addressLine1.trim()) e.addressLine1 = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (form.assignStaff) {
      const isNewStaff = !editingId || !locations.find(l => l.locationId === editingId)?.staff;
      if (isNewStaff && !form.password.trim()) e.password = "Password is required";
      if (form.password.trim() && form.password.trim().length < 6) e.password = "Password must be at least 6 characters";
    }
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    setSaveError("");

    const payload = {
      branchName: form.branchName.trim(),
      phone: `${phoneConfig.code} ${form.phone}`,
      addressLine1: form.addressLine1.trim(),
      city: form.city.trim(),
      state: form.state.trim() || null,
      postalCode: form.postalCode.trim() || null,
      openingTime: form.openingTime,
      closingTime: form.closingTime,
      useHeadOfficePayment: form.useHeadOfficePayment,
      assignStaff: form.assignStaff,
      role: form.role,
      loginId: editingId ? undefined : (form.loginId || undefined),
      password: form.password || undefined,
    };

    try {
      if (editingId) {
        const res = await updateLocation(editingId, payload);
        if (res.success) {
          setLocations(prev => prev.map(l => l.locationId === editingId ? res.data : l));
          showToast(`${res.data.branchName} updated`);
          closeForm();
        } else {
          setSaveError(res.message || "Could not update this location.");
        }
      } else {
        const res = await createLocation(payload);
        if (res.success) {
          setLocations(prev => [...prev, res.data]);
          showToast(`${res.data.branchName} created successfully`);
          if (form.assignStaff) {
            setJustCreated({ branchName: res.data.branchName, loginId: res.data.staff?.loginId });
          }
          closeForm();
        } else {
          setSaveError(res.message || "Could not create this location.");
        }
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteLocation(deleteTarget.locationId);
      if (res.success) {
        setLocations(prev => prev.filter(l => l.locationId !== deleteTarget.locationId));
        showToast(`${deleteTarget.branchName} deleted`);
        setDeleteTarget(null);
      } else {
        showToast(res.message || "Could not delete this location.");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Could not delete this location.");
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text, field) => {
    if (!text) return;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 1400);
  };

  const editingLocation = editingId ? locations.find(l => l.locationId === editingId) : null;
  const editingHasStaff = !!editingLocation?.staff && editingLocation.staff.accountStatus !== "INACTIVE";

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", paddingBottom: 40 }}>
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          background: "#18181b", color: "#fff", padding: "11px 22px", borderRadius: 30,
          fontSize: 13.5, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <CheckCircle2 size={15} color="#4ade80" /> {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#18181b", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 9 }}>
            <MapPin size={22} color="#7c3aed" /> Locations
          </h1>
          <p style={{ fontSize: 13, color: "#71717a", margin: 0 }}>
            {isOwner ? "Manage every branch of your business from one place." : "View every branch of your business — only the owner can add or edit locations."}
          </p>
        </div>
        {isOwner && (
          <button
            onClick={openAddForm}
            style={{ display: "flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#6d28d9,#7c3aed)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(124,58,237,0.28)" }}
          >
            <Plus size={16} /> Add New Location
          </button>
        )}
      </div>

      {/* Just-created credentials-sent banner */}
      {justCreated && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", marginBottom: 18 }}>
          <Mail size={18} color="#15803d" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: "#166534", lineHeight: 1.6 }}>
            <strong>Login ID {justCreated.loginId} created for {justCreated.branchName}.</strong> We've emailed
            the ID and password to your registered Head Office email — forward them to whoever will be
            working at this branch.
          </div>
          <button onClick={() => setJustCreated(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#15803d", flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* Concept / info banner */}
      <div style={{ display: "flex", gap: 12, padding: "14px 16px", borderRadius: 12, background: "#f5f3ff", border: "1px solid #ede9fe", marginBottom: 22 }}>
        <Info size={18} color="#7c3aed" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12.5, color: "#4c1d95", lineHeight: 1.6 }}>
          <strong>Each location runs independently.</strong> Its own menu, its own QR codes, its own
          orders and daily sales — nothing is shared between branches unless you choose to. The
          customer profile (loyalty, order history) is the only thing that stays shared across every
          branch. You can assign a staff login to a location right when you create it, or add one later.
        </div>
      </div>

      {/* Locations list */}
      {loadingList ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "40px 0", color: "#a1a1aa", fontSize: 13 }}>
          <Loader2 size={16} style={{ animation: "locSpin 0.7s linear infinite" }} /> Loading your locations...
        </div>
      ) : listError ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "36px 20px", textAlign: "center" }}>
          <AlertTriangle size={20} color="#ef4444" />
          <span style={{ fontSize: 13, color: "#71717a" }}>{listError}</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Head Office — static, sourced from Business Information, not editable here */}
          <div style={{
            display: "flex", alignItems: "center", gap: 16, padding: "16px 18px",
            background: "#fff", border: "1.5px solid #ddd6fe",
            borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", flexWrap: "wrap",
          }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#6d28d9,#a855f7)" }}>
              <Building2 size={20} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14.5, fontWeight: 800, color: "#18181b" }}>{business?.businessName || "Head Office"}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ede9fe", padding: "2px 8px", borderRadius: 20, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Head Office
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#a1a1aa", marginTop: 3 }}>
                {[business?.addressLine1, business?.city, business?.state].filter(Boolean).join(", ") || "Managed from Business Information"}
              </div>
            </div>
          </div>

          {locations.length === 0 && (
            <div style={{ textAlign: "center", padding: "28px 20px", color: "#a1a1aa", fontSize: 13 }}>
              No branches yet — click "Add New Location" to create your first one.
            </div>
          )}

          {locations.map((loc) => {
            const hasStaff = !!loc.staff && loc.staff.accountStatus !== "INACTIVE";
            return (
              <div key={loc.locationId} style={{
                display: "flex", alignItems: "center", gap: 16, padding: "16px 18px",
                background: "#fff", border: "1.5px solid #e4e4e7",
                borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", flexWrap: "wrap",
              }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f4f5" }}>
                  <Store size={20} color="#71717a" />
                </div>

                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14.5, fontWeight: 800, color: "#18181b" }}>{loc.branchName}</span>
                    {hasStaff && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: 20 }}>
                        <Users size={10} /> {ROLES.find(r => r.value === loc.staff.role)?.label}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "#a1a1aa", marginTop: 3 }}>
                    {[loc.addressLine1, loc.city, loc.state].filter(Boolean).join(", ") || "No address set"}
                  </div>
                  <div style={{ display: "flex", gap: 14, marginTop: 5, fontSize: 11, color: "#a1a1aa", flexWrap: "wrap" }}>
                    {loc.phone && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} />{loc.phone}</span>}
                    {loc.openingTime && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} />{loc.openingTime} – {loc.closingTime}</span>}
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><CreditCard size={11} />{loc.useHeadOfficePayment ? "Head Office payments" : "Own payment setup"}</span>
                    {hasStaff && <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "monospace", fontWeight: 700, color: "#7c3aed" }}>ID: {loc.staff.loginId}</span>}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {isOwner && (
                    <>
                      <button
                        onClick={() => openEditForm(loc)}
                        style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid #e4e4e7", borderRadius: 9, padding: "8px 13px", fontSize: 12.5, fontWeight: 700, color: "#3f3f46", cursor: "pointer" }}
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(loc)}
                        style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid #fecaca", borderRadius: 9, padding: "8px 13px", fontSize: 12.5, fontWeight: 700, color: "#dc2626", cursor: "pointer" }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit form modal — full-page sized */}
      {showForm && (
        <div
          onClick={closeForm}
          style={{ position: "fixed", inset: 0, background: "rgba(24,24,27,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", width: "100%", maxWidth: 1100, height: "100%", maxHeight: "calc(100vh - 40px)", borderRadius: 20, display: "flex", flexDirection: "column", boxShadow: "0 30px 80px rgba(0,0,0,0.35)" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 26px", borderBottom: "1px solid #f0eef0", flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#18181b" }}>{editingId ? "Edit Location" : "Add New Location"}</div>
                <div style={{ fontSize: 11.5, color: "#a1a1aa", marginTop: 2 }}>Each location gets its own menu, orders & QR codes</div>
              </div>
              <button onClick={closeForm} style={{ background: "#f4f4f5", border: "none", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#71717a" }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ overflowY: "auto", padding: "24px 26px", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 6 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Branch Name <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    value={form.branchName}
                    onChange={(e) => setForm(f => ({ ...f, branchName: e.target.value }))}
                    placeholder="Enter branch name"
                    style={inputStyle(errors.branchName)}
                  />
                  {errors.branchName && <span style={errStyle}>{errors.branchName}</span>}
                </div>

                <div>
                  <label style={labelStyle}>
                    Phone Number <span style={{ color: "#ef4444" }}>*</span>
                    <span style={{ fontWeight: 500, color: "#a1a1aa" }}> ({phoneConfig.length} digits, {phoneConfig.code})</span>
                  </label>
                  <div style={{ display: "flex", alignItems: "stretch", border: `1.5px solid ${errors.phone ? "#fca5a5" : "#e4e4e7"}`, borderRadius: 8, overflow: "hidden" }}>
                    <span style={{ display: "flex", alignItems: "center", padding: "0 11px", background: "#f4f4f5", color: "#3f3f46", fontSize: 13, fontWeight: 700, borderRight: "1.5px solid #e4e4e7", flexShrink: 0 }}>
                      {phoneConfig.code}
                    </span>
                    <input
                      value={form.phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, phoneConfig.length);
                        setForm(f => ({ ...f, phone: digits }));
                      }}
                      placeholder={phoneConfig.example}
                      inputMode="numeric"
                      style={{ flex: 1, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", border: "none", outline: "none", color: "#18181b", minWidth: 0 }}
                    />
                  </div>
                  {errors.phone && <span style={errStyle}>{errors.phone}</span>}
                </div>
                <div>
                  <label style={labelStyle}>City <span style={{ color: "#ef4444" }}>*</span></label>
                  <input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Enter your city" style={inputStyle(errors.city)} />
                  {errors.city && <span style={errStyle}>{errors.city}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Postal Code</label>
                  <input value={form.postalCode} onChange={(e) => setForm(f => ({ ...f, postalCode: e.target.value }))} placeholder="Enter postal code" style={inputStyle()} />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Address <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    value={form.addressLine1}
                    onChange={(e) => setForm(f => ({ ...f, addressLine1: e.target.value }))}
                    placeholder="Street, area"
                    style={inputStyle(errors.addressLine1)}
                  />
                  {errors.addressLine1 && <span style={errStyle}>{errors.addressLine1}</span>}
                </div>

                <div>
                  <label style={labelStyle}>State</label>
                  <input value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))} placeholder="Enter your state" style={inputStyle()} />
                </div>
                <div>
                  <label style={labelStyle}>Opening Time</label>
                  <input type="time" value={form.openingTime} onChange={(e) => setForm(f => ({ ...f, openingTime: e.target.value }))} style={inputStyle()} />
                </div>
                <div>
                  <label style={labelStyle}>Closing Time</label>
                  <input type="time" value={form.closingTime} onChange={(e) => setForm(f => ({ ...f, closingTime: e.target.value }))} style={inputStyle()} />
                </div>
              </div>

              {/* Payment */}
              <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 12, background: "#f9fafb", border: "1.5px solid #e4e4e7" }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 11, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.useHeadOfficePayment}
                    onChange={(e) => setForm(f => ({ ...f, useHeadOfficePayment: e.target.checked }))}
                    style={{ width: 17, height: 17, marginTop: 2, accentColor: "#7c3aed", cursor: "pointer", flexShrink: 0 }}
                  />
                  <span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#18181b" }}>
                      <CreditCard size={14} color="#7c3aed" /> Use Head Office's payment settings
                    </span>
                    <span style={{ display: "block", fontSize: 11.5, color: "#71717a", marginTop: 3, lineHeight: 1.5 }}>
                      Orders from this location settle to the same account as Head Office. Uncheck this
                      if this branch needs its own bank/UPI details — you can set those up right after
                      creating the location.
                    </span>
                  </span>
                </label>
              </div>

              {/* Staff assignment — gated behind a branch name being entered,
                  since the auto-generated Login ID is derived from it. */}
              <div style={{ marginTop: 14, padding: "14px 16px", borderRadius: 12, background: form.branchName.trim() ? "#f9fafb" : "#fafafa", border: `1.5px solid ${form.branchName.trim() ? "#e4e4e7" : "#f0eef0"}`, opacity: form.branchName.trim() ? 1 : 0.65 }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 11, cursor: form.branchName.trim() ? "pointer" : "not-allowed", marginBottom: (form.assignStaff && form.branchName.trim()) ? 14 : 0 }}>
                  <input
                    type="checkbox"
                    checked={form.assignStaff}
                    disabled={!form.branchName.trim()}
                    onChange={(e) => setForm(f => ({ ...f, assignStaff: e.target.checked, password: e.target.checked && !f.password ? generatePassword() : f.password }))}
                    style={{ width: 17, height: 17, marginTop: 2, accentColor: "#7c3aed", cursor: form.branchName.trim() ? "pointer" : "not-allowed", flexShrink: 0 }}
                  />
                  <span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#18181b" }}>
                      <UserPlus size={14} color="#7c3aed" /> Assign a staff login to this location
                    </span>
                    <span style={{ display: "block", fontSize: 11.5, color: "#71717a", marginTop: 3, lineHeight: 1.5 }}>
                      {form.branchName.trim()
                        ? "This login will only ever see this location — its menu, its orders, nothing else."
                        : "Enter a branch name above first — the login ID is generated from it."}
                    </span>
                  </span>
                </label>

                {form.assignStaff && form.branchName.trim() && (
                  <div style={{ paddingLeft: 28 }}>
                    <label style={labelStyle}>Role</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
                      {ROLES.map(r => (
                        <label
                          key={r.value}
                          style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, cursor: "pointer",
                            border: `1.5px solid ${form.role === r.value ? "#7c3aed" : "#e4e4e7"}`,
                            background: form.role === r.value ? "#f5f3ff" : "#fff",
                          }}
                        >
                          <input type="radio" name="role" checked={form.role === r.value} onChange={() => setForm(f => ({ ...f, role: r.value }))} style={{ accentColor: "#7c3aed" }} />
                          <span>
                            <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#18181b" }}>{r.label}</span>
                            <span style={{ display: "block", fontSize: 11, color: "#a1a1aa", marginTop: 1 }}>{r.desc}</span>
                          </span>
                        </label>
                      ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={labelStyle}>
                          Login ID {editingId ? <span style={{ fontWeight: 500, color: "#a1a1aa" }}>(fixed)</span> : <span style={{ fontWeight: 500, color: "#a1a1aa" }}>(auto-generated)</span>}
                        </label>
                        <div style={{ position: "relative" }}>
                          <input value={form.loginId} readOnly style={{ ...inputStyle(), background: "#f4f4f5", color: "#3f3f46", fontFamily: "monospace", fontWeight: 700, paddingRight: 36 }} />
                          <button type="button" onClick={() => copyToClipboard(form.loginId, "id")} style={copyBtnStyle}>
                            {copiedField === "id" ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>
                          Password {editingHasStaff ? <span style={{ fontWeight: 500, color: "#a1a1aa" }}>(leave blank to keep current)</span> : <span style={{ color: "#ef4444" }}>*</span>}
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            value={form.password}
                            onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                            placeholder={editingHasStaff ? "Leave blank to keep current password" : "Enter a password"}
                            style={{ ...inputStyle(errors.password), fontFamily: "monospace", fontWeight: 700, paddingRight: 66 }}
                          />
                          <div style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 3 }}>
                            <button type="button" title="Generate new password" onClick={() => setForm(f => ({ ...f, password: generatePassword() }))} style={copyBtnStyleInline}>
                              <RefreshCw size={13} />
                            </button>
                            <button type="button" title="Copy" onClick={() => copyToClipboard(form.password, "pw")} style={copyBtnStyleInline}>
                              {copiedField === "pw" ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </div>
                        {errors.password && <span style={errStyle}>{errors.password}</span>}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 10, padding: "9px 11px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8 }}>
                      <ShieldCheck size={13} color="#a16207" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 11, color: "#92400e", lineHeight: 1.5 }}>
                        {editingId
                          ? "Changing the password here updates it immediately for this login."
                          : "We'll email this Login ID and password to your Head Office inbox — forward them to whoever runs this branch."}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {saveError && (
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, padding: "10px 13px", borderRadius: 9, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 12, color: "#b91c1c", fontWeight: 600 }}>
                  <AlertTriangle size={14} /> {saveError}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12, padding: "18px 26px", borderTop: "1px solid #f0eef0", flexShrink: 0 }}>
              <button onClick={closeForm} disabled={saving} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1.5px solid #e4e4e7", background: "#fff", color: "#71717a", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1.4, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6d28d9,#7c3aed)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.75 : 1, boxShadow: "0 6px 16px rgba(124,58,237,0.28)" }}>
                {saving ? <Loader2 size={14} style={{ animation: "locSpin 0.7s linear infinite" }} /> : (editingId ? <Pencil size={14} /> : <Plus size={14} />)}
                {saving ? "Saving..." : (editingId ? "Save Changes" : "Create Location")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div
          onClick={() => !deleting && setDeleteTarget(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(24,24,27,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", width: "100%", maxWidth: 420, borderRadius: 18, padding: "28px 26px", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Trash2 size={22} color="#dc2626" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#18181b", marginBottom: 8 }}>
              Delete {deleteTarget.branchName}?
            </div>
            <div style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6, marginBottom: 22 }}>
              This will permanently remove this branch and its staff login ({deleteTarget.staff?.loginId || "if any"}).
              That login will stop working immediately — trying to sign in with it will show an invalid
              credentials error, same as any login that never existed. <strong style={{ color: "#18181b" }}>This cannot be undone.</strong>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1.5px solid #e4e4e7", background: "#fff", color: "#3f3f46", fontSize: 13, fontWeight: 700, cursor: deleting ? "not-allowed" : "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                disabled={deleting}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 0", borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", fontSize: 13, fontWeight: 800, cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.75 : 1 }}
              >
                {deleting ? <Loader2 size={14} style={{ animation: "locSpin 0.7s linear infinite" }} /> : <Trash2 size={14} />}
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes locSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

const labelStyle = { display: "block", fontSize: 11.5, fontWeight: 700, color: "#3f3f46", marginBottom: 5 };
const errStyle = { display: "block", fontSize: 10.5, color: "#ef4444", fontWeight: 600, marginTop: 4 };
const inputStyle = (hasError) => ({
  width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13, fontFamily: "inherit",
  border: `1.5px solid ${hasError ? "#fca5a5" : "#e4e4e7"}`, outline: "none", color: "#18181b", boxSizing: "border-box",
});
const copyBtnStyle = { position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#71717a", padding: 6, display: "flex" };
const copyBtnStyleInline = { background: "none", border: "none", cursor: "pointer", color: "#71717a", padding: 4, display: "flex" };

export default LocationsPage;