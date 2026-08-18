"use client";
import { X, User, Receipt, Flame, UtensilsCrossed, ChevronRight } from "lucide-react";
import { useCustomerLanguage } from "../context/CustomerLanguageProvider";

const CustomerSidebar = ({ open, onClose, business, identity, onMyOrders, onOffers, onHome }) => {
  const { t } = useCustomerLanguage();
  const hasIdentity = identity && (identity.name || identity.email);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0, zIndex: 300,
          background: "rgba(17,10,4,0.5)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.22s ease",
        }}
      />

      <div
        style={{
          position: "absolute", top: 0, bottom: 0, left: 0, zIndex: 301,
          width: "78%", maxWidth: 300,
          background: "var(--surface, #fff)",
          transform: open ? "translateX(0)" : "translateX(-105%)",
          transition: "transform 0.25s cubic-bezier(.4,0,.2,1)",
          display: "flex", flexDirection: "column",
          boxShadow: open ? "8px 0 30px rgba(0,0,0,0.18)" : "none",
        }}
      >
        <div style={{ padding: "20px 18px 16px", background: "linear-gradient(135deg,#F2701D,#F0A500)", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.22)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} color="#fff" />
          </button>
          <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
            <User size={26} color="#fff" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>
            {hasIdentity ? (identity.name || t("sidebar.guest")) : t("sidebar.guest")}
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.85)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {hasIdentity && identity.email ? identity.email : hasIdentity && identity.phone ? identity.phone : t("sidebar.orderToSeeDetails")}
          </div>
        </div>

        {business && (
          <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border-light)", fontSize: 11.5, color: "var(--text-muted)" }}>
            {t("sidebar.orderingAt")} <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{business.businessName || business.name}</span>
          </div>
        )}

        <div style={{ flex: 1, padding: "10px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
          <SidebarItem icon={UtensilsCrossed} label={t("sidebar.homeMenu")} onClick={onHome} />
          <SidebarItem icon={Receipt} label={t("sidebar.myOrders")} onClick={onMyOrders} />
          <SidebarItem icon={Flame} label={t("landing.offersAndDeals")} onClick={onOffers} />
        </div>

        <div style={{ padding: "14px 18px", fontSize: 10.5, color: "var(--text-muted)", borderTop: "1px solid var(--border-light)" }}>
          {t("sidebar.poweredBy")}
        </div>
      </div>
    </>
  );
};

function SidebarItem({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%",
        padding: "12px 12px", borderRadius: 12, border: "none",
        background: "transparent", cursor: "pointer", textAlign: "left",
        touchAction: "manipulation",
      }}
    >
      <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={16} color="var(--brand)" />
      </div>
      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>{label}</span>
      <ChevronRight size={15} color="var(--text-muted)" />
    </button>
  );
}

export default CustomerSidebar;
