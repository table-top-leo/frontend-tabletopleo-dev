"use client";
import { useState, useEffect, useMemo } from "react";
import {
  X, Copy, Store, ChevronDown, ChevronRight, Check, Loader2,
  AlertTriangle, Info, ShoppingBag, HelpCircle,
} from "lucide-react";
import { getHeadOfficeMenuForCopy, copyFromHeadOffice } from "../services/Menucopyservice";
import { useCurrency } from "../context/CurrencyContext";
import { formatCurrency } from "../utils/currencyHelper";

const CopyHeadOfficeMenuPopup = ({ onClose, onCopied }) => {
  const { currencyCode } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [headOfficeName, setHeadOfficeName] = useState("");
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [expanded, setExpanded] = useState(new Set()); // collapsed by default
  const [showInfo, setShowInfo] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copyError, setCopyError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getHeadOfficeMenuForCopy();
        if (res.success) {
          setHeadOfficeName(res.data.headOfficeBusinessName || "Head Office");
          setCategories(res.data.categories || []);
        } else {
          setLoadError(res.message || "Could not load Head Office's menu.");
        }
      } catch (e) {
        setLoadError(e.response?.data?.message || "Could not load Head Office's menu.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allSelectableIds = useMemo(() => {
    const ids = [];
    categories.forEach(cat => cat.items.forEach(it => { if (!it.alreadyCopied) ids.push(it.productId); }));
    return ids;
  }, [categories]);

  const totalItems = useMemo(() => categories.reduce((n, c) => n + c.items.length, 0), [categories]);
  const isAllSelected = allSelectableIds.length > 0 && allSelectableIds.every(id => selected.has(id));

  const toggleSelectAll = () => {
    setSelected(isAllSelected ? new Set() : new Set(allSelectableIds));
  };

  const categorySelectableIds = (cat) => cat.items.filter(i => !i.alreadyCopied).map(i => i.productId);
  const isCategoryFullySelected = (cat) => {
    const ids = categorySelectableIds(cat);
    return ids.length > 0 && ids.every(id => selected.has(id));
  };

  const toggleCategory = (cat, e) => {
    e.stopPropagation();
    const ids = categorySelectableIds(cat);
    if (ids.length === 0) return;
    setSelected(prev => {
      const next = new Set(prev);
      const allChecked = ids.every(id => next.has(id));
      ids.forEach(id => allChecked ? next.delete(id) : next.add(id));
      return next;
    });
  };

  const toggleItem = (item) => {
    if (item.alreadyCopied) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(item.productId) ? next.delete(item.productId) : next.add(item.productId);
      return next;
    });
  };

  const toggleExpanded = (categoryId) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(categoryId) ? next.delete(categoryId) : next.add(categoryId);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (selected.size === 0 || copying) return;
    setCopying(true);
    setCopyError("");
    try {
      const res = await copyFromHeadOffice(Array.from(selected));
      if (res.success) onCopied?.(res.data);
      else setCopyError(res.message || "Could not copy the selected items.");
    } catch (e) {
      setCopyError(e.response?.data?.message || "Could not copy the selected items.");
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="chm-overlay" onClick={onClose}>
      <style>{`
        @keyframes chmPopIn { from{opacity:0;transform:scale(0.97) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes chmSpin  { to{transform:rotate(360deg)} }
        .chm-overlay { position:fixed; inset:0; z-index:400; display:flex; align-items:center; justify-content:center; padding:20px; background:rgba(15,15,17,0.5); }
        .chm-card { width:100%; max-width:600px; max-height:calc(100vh - 60px); background:#fff; border-radius:16px; display:flex; flex-direction:column; box-shadow:0 20px 50px rgba(0,0,0,0.22); animation:chmPopIn 0.18s ease; overflow:hidden; border:1px solid #ececec; }
        .chm-header { display:flex; align-items:flex-start; justify-content:space-between; padding:18px 20px 14px; border-bottom:1px solid #f0f0f0; flex-shrink:0; }
        .chm-title { font-size:15.5px; font-weight:700; color:#111827; display:flex; align-items:center; gap:8px; }
        .chm-subtitle { font-size:12px; color:#9ca3af; margin-top:4px; display:flex; align-items:center; gap:5px; }
        .chm-close { background:#f4f4f5; border:none; border-radius:8px; cursor:pointer; color:#6b7280; width:26px; height:26px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .chm-close:hover { background:#e4e4e7; }
        .chm-know-more { display:inline-flex; align-items:center; gap:4px; background:none; border:none; color:#6b7280; font-size:11px; font-weight:600; cursor:pointer; padding:0; margin-top:8px; text-decoration:underline; text-underline-offset:2px; }
        .chm-know-more:hover { color:#111827; }
        .chm-body { flex:1; overflow-y:auto; padding:14px 20px 6px; }
        .chm-body::-webkit-scrollbar { width:4px; }
        .chm-body::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:99px; }
        .chm-selectall { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:9px 12px; border-radius:9px; border:1px solid #ececec; margin-bottom:10px; }
        .chm-selectall-left { display:flex; align-items:center; gap:9px; }
        .chm-cat { border:1px solid #ececec; border-radius:11px; margin-bottom:8px; overflow:hidden; }
        .chm-cat-head { display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer; background:#fff; }
        .chm-cat-head:hover { background:#fafafa; }
        .chm-cat-head.done { background:#fafafa; }
        .chm-cat-thumb { width:28px; height:28px; border-radius:7px; object-fit:cover; background:#f0f0f0; flex-shrink:0; }
        .chm-item-row { display:flex; align-items:center; gap:10px; padding:9px 12px 9px 40px; border-top:1px solid #f4f4f5; }
        .chm-item-row.done { opacity:0.55; }
        .chm-item-thumb { width:32px; height:32px; border-radius:7px; object-fit:cover; background:#f4f4f5; flex-shrink:0; }
        .chm-badge-done { display:inline-flex; align-items:center; gap:3px; font-size:9.5px; font-weight:700; color:#6b7280; background:#f4f4f5; border:1px solid #e5e7eb; padding:2px 7px; border-radius:20px; flex-shrink:0; }
        .chm-checkbox { width:15px; height:15px; accent-color:#111827; cursor:pointer; flex-shrink:0; }
        .chm-checkbox:disabled { cursor:not-allowed; opacity:0.4; }
        .chm-footer { display:flex; align-items:center; gap:10px; padding:14px 20px; border-top:1px solid #f0f0f0; flex-shrink:0; }
        .chm-btn { display:flex; align-items:center; justify-content:center; gap:6px; border-radius:9px; font-size:12.5px; font-weight:700; cursor:pointer; font-family:inherit; border:none; padding:10px 18px; }
        .chm-btn:disabled { cursor:not-allowed; opacity:0.5; }
        .chm-btn-ghost { background:#fff; color:#374151; border:1px solid #e5e7eb; }
        .chm-btn-ghost:hover:not(:disabled) { background:#f9fafb; }
        .chm-btn-primary { color:#fff; background:#111827; }
        .chm-btn-primary:hover:not(:disabled) { background:#1f2937; }
      `}</style>

      <div className="chm-card" onClick={(e) => e.stopPropagation()}>
        <div className="chm-header">
          <div>
            <div className="chm-title"><Copy size={15} /> Copy Head Office Menu</div>
            <div className="chm-subtitle"><Store size={11} /> {loading ? "Loading..." : headOfficeName}</div>
            <button className="chm-know-more" onClick={() => setShowInfo(true)}>
              <HelpCircle size={11} /> Know more about this menu copy concept
            </button>
          </div>
          <button className="chm-close" onClick={onClose}><X size={13} /></button>
        </div>

        <div className="chm-body">
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "50px 0", color: "#9ca3af", fontSize: 12.5 }}>
              <Loader2 size={16} style={{ animation: "chmSpin 0.7s linear infinite" }} /> Loading Head Office's menu...
            </div>
          ) : loadError ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "50px 20px", textAlign: "center" }}>
              <AlertTriangle size={22} color="#ef4444" />
              <span style={{ fontSize: 12.5, color: "#4b5563" }}>{loadError}</span>
            </div>
          ) : totalItems === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "50px 20px", textAlign: "center" }}>
              <ShoppingBag size={22} color="#9ca3af" />
              <span style={{ fontSize: 12.5, color: "#6b7280" }}>Head Office hasn't added any menu items yet.</span>
            </div>
          ) : (
            <>
              <div className="chm-selectall">
                <div className="chm-selectall-left">
                  <input type="checkbox" className="chm-checkbox" checked={isAllSelected} disabled={allSelectableIds.length === 0} onChange={toggleSelectAll} />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>Select All</span>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "#9ca3af" }}>{selected.size} selected</span>
              </div>

              {categories.map((cat) => {
                const catDone = cat.alreadyCopied;
                const catIndeterminate = !catDone && categorySelectableIds(cat).some(id => selected.has(id)) && !isCategoryFullySelected(cat);
                const isOpen = expanded.has(cat.categoryId);
                return (
                  <div key={cat.categoryId} className="chm-cat">
                    <div className={`chm-cat-head${catDone ? " done" : ""}`} onClick={() => toggleExpanded(cat.categoryId)}>
                      <input
                        type="checkbox"
                        className="chm-checkbox"
                        checked={isCategoryFullySelected(cat)}
                        ref={(el) => { if (el) el.indeterminate = catIndeterminate; }}
                        disabled={catDone}
                        onClick={(e) => toggleCategory(cat, e)}
                        onChange={() => {}}
                      />
                      {cat.categoryImageUrl
                        ? <img src={cat.categoryImageUrl} alt="" className="chm-cat-thumb" />
                        : <div className="chm-cat-thumb" />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>{cat.categoryName}</div>
                        <div style={{ fontSize: 10.5, color: "#9ca3af" }}>{cat.items.length} item{cat.items.length !== 1 ? "s" : ""}</div>
                      </div>
                      {catDone && <span className="chm-badge-done"><Check size={9} /> Added</span>}
                      {isOpen ? <ChevronDown size={14} color="#9ca3af" /> : <ChevronRight size={14} color="#9ca3af" />}
                    </div>

                    {isOpen && cat.items.map((item) => (
                      <div key={item.productId} className={`chm-item-row${item.alreadyCopied ? " done" : ""}`}>
                        <input type="checkbox" className="chm-checkbox" checked={item.alreadyCopied || selected.has(item.productId)} disabled={item.alreadyCopied} onChange={() => toggleItem(item)} />
                        {item.itemImageUrl
                          ? <img src={item.itemImageUrl} alt="" className="chm-item-thumb" />
                          : <div className="chm-item-thumb" />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#1f2937" }}>{item.itemName}</div>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", flexShrink: 0 }}>{formatCurrency(Number(item.itemPrice), currencyCode)}</div>
                        {item.alreadyCopied && <span className="chm-badge-done"><Check size={9} /> Added</span>}
                      </div>
                    ))}
                  </div>
                );
              })}

              {copyError && (
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 7, padding: "9px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 11.5, color: "#b91c1c", fontWeight: 600 }}>
                  <AlertTriangle size={13} /> {copyError}
                </div>
              )}
            </>
          )}
        </div>

        {!loading && !loadError && totalItems > 0 && (
          <div className="chm-footer">
            <button className="chm-btn chm-btn-ghost" onClick={onClose} disabled={copying} style={{ flex: 1 }}>Cancel</button>
            <button className="chm-btn chm-btn-primary" onClick={handleConfirm} disabled={copying || selected.size === 0} style={{ flex: 1.5 }}>
              {copying ? <Loader2 size={14} style={{ animation: "chmSpin 0.7s linear infinite" }} /> : <Copy size={13} />}
              {copying ? "Copying..." : `Copy ${selected.size || ""} Item${selected.size === 1 ? "" : "s"}`}
            </button>
          </div>
        )}
      </div>

      {showInfo && (
        <div className="chm-overlay" style={{ zIndex: 500, background: "rgba(15,15,17,0.55)" }} onClick={() => setShowInfo(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", width: "100%", maxWidth: 400, borderRadius: 14, padding: "20px 20px", boxShadow: "0 20px 50px rgba(0,0,0,0.25)", border: "1px solid #ececec" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Info size={16} color="#111827" />
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>How menu copying works</div>
            </div>
            <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.65 }}>
              Copying an item from Head Office creates your <strong>own independent copy</strong> — it does
              not stay linked. You can freely edit its price, description, photo, or availability afterward
              without affecting Head Office's original, and later changes Head Office makes won't change
              your copy either.
              <br /><br />
              An item marked <strong>"Added"</strong> has already been copied before — it's locked so you
              don't create a duplicate. To get the latest version of something you've already copied, edit
              it manually from your own menu.
              <br /><br />
              You can run this as many times as you like — copy a few items today, come back later for more.
            </div>
            <button onClick={() => setShowInfo(false)} style={{ width: "100%", marginTop: 16, padding: "9px 0", borderRadius: 8, border: "none", background: "#111827", color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CopyHeadOfficeMenuPopup;