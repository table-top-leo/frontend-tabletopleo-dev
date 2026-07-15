"use client";
 
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus, ChevronRight, ChevronDown, ChevronUp, ChevronLeft,
  Search, Filter, Pencil, Trash2, Upload, Send, RotateCcw,
  Coffee, X, Check, RefreshCw, Loader2, Image,
} from "lucide-react";
import "../menucategorypage/designmenucategorypage.css";
import {
  createCategory, getCategoriesByAdmin, updateCategory, deleteCategory,
  createProduct, getProductsByCategory, updateProduct, deleteProduct,
} from "../services/menuService";
import { uploadCategoryImage, uploadProductImage } from "../services/imageservice";
import api from "../services/axiosInterceptor";
import { useCurrency } from "../context/CurrencyContext";
import { getCurrencySymbol, formatCurrency } from "../utils/currencyHelper";

const ITEMS_PER_PAGE = 5;

function getUser() {
  try { const s = localStorage.getItem("ttl_user"); return s ? JSON.parse(s) : null; }
  catch { return null; }
}

function Toast({ msg, type }) {
  return (
    <div style={{
      position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
      background: type === "error" ? "#dc2626" : "#18181b",
      color: "#fff", padding: "11px 24px", borderRadius: 30,
      fontSize: 13.5, fontWeight: 600, zIndex: 9999,
      boxShadow: "0 4px 20px rgba(0,0,0,0.18)", whiteSpace: "nowrap",
      animation: "mcToastIn 0.25s ease",
    }}>
      <style>{`@keyframes mcToastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {msg}
    </div>
  );
}

function ImageUploadBox({ imageUrl, onUpload, onRemove, uploading, compact }) {
  const inputRef = useRef();
  const handle = (e) => { const f = e.target.files[0]; if (f) onUpload(f); e.target.value = ""; };

  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handle} />
        {imageUrl ? (
          <div style={{ position: "relative", display: "inline-flex" }}>
            <img src={imageUrl} alt="cat" style={{ width: 38, height: 38, objectFit: "cover", borderRadius: 8, border: "1.5px solid #e4e4e7" }} />
            <button type="button" onClick={onRemove} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, background: "#ef4444", border: "2px solid #fff", borderRadius: "50%", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}><X size={10} /></button>
          </div>
        ) : (
          <div onClick={() => inputRef.current?.click()} style={{ width: 38, height: 38, borderRadius: 8, background: "#f4f3f0", border: "1.5px dashed #d4d4d8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#a1a1aa", flexShrink: 0 }}>
            {uploading ? <Loader2 size={14} style={{ animation: "spin .7s linear infinite" }} /> : <Image size={15} />}
          </div>
        )}
        <span style={{ fontSize: 12, color: "#a1a1aa" }}>{uploading ? "Uploading..." : imageUrl ? "Image uploaded" : "Optional: add image"}</span>
      </div>
    );
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handle} />
      {imageUrl ? (
        <div style={{ position: "relative", display: "inline-flex" }}>
          <img src={imageUrl} alt="preview" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 10, border: "1.5px solid #e4e4e7" }} />
          <button type="button" onClick={onRemove} style={{ position: "absolute", top: -7, right: -7, width: 20, height: 20, background: "#ef4444", border: "2px solid #fff", borderRadius: "50%", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, zIndex: 2 }}><X size={11} /></button>
        </div>
      ) : (
        <div className="mc-upload-zone" onClick={() => inputRef.current?.click()} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && inputRef.current?.click()}>
          {uploading
            ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}><Loader2 size={24} style={{ animation: "spin .7s linear infinite", color: "#3b1f0a" }} /><span className="mc-upload-text">Uploading...</span></div>
            : <><Upload size={24} className="mc-upload-icon" /><span className="mc-upload-text">Click to upload</span><span className="mc-upload-hint">PNG, JPG, WEBP up to 5MB</span></>}
        </div>
      )}
    </>
  );
}

// ── MAIN COMPONENT ──────────────────────────────────────────
const MenuCategory = () => {
  const { currencyCode } = useCurrency();
  const user       = getUser();
  const adminId    = user?.adminId    || "";
  const businessId = user?.businessId || "";

  const [categories,         setCategories]         = useState([]);
  const [products,           setProducts]           = useState([]);
  const [selectedCatId,      setSelectedCatId]      = useState(null);
  const [formCollapsed,      setFormCollapsed]      = useState(false);
  const [showAddCatInline,   setShowAddCatInline]   = useState(false);
  const [newCatName,         setNewCatName]         = useState("");
  const [newCatImageUrl,     setNewCatImageUrl]     = useState(null);
  const [newCatImgUploading, setNewCatImgUploading] = useState(false);
  const [searchQuery,        setSearchQuery]        = useState("");
  const [statusFilter,       setStatusFilter]       = useState("All Status");
  const [currentPage,        setCurrentPage]        = useState(1);
  const [editingItem,        setEditingItem]        = useState(null);
  const [showDeleteModal,    setShowDeleteModal]    = useState(false);
  const [deleteTarget,       setDeleteTarget]       = useState(null);
  const [catsLoading,        setCatsLoading]        = useState(true);
  const [prodsLoading,       setProdsLoading]       = useState(false);
  const [formSaving,         setFormSaving]         = useState(false);
  const [catSaving,          setCatSaving]          = useState(false);
  const [deleting,           setDeleting]           = useState(false);
  const [toast,              setToast]              = useState(null);
  const [prodImgUploading,   setProdImgUploading]   = useState(false);

  // ── Suggestion states ───────────────────────────────────
  const [catSuggestions,    setCatSuggestions]    = useState([]);  // [{categoryName, categoryEmoji}]
  const [itemSuggestions,   setItemSuggestions]   = useState([]);  // [{itemName}]
  const [loadingItemSugg,   setLoadingItemSugg]   = useState(false);
  // For sidebar add-category inline
  const [showCatSuggDrop,   setShowCatSuggDrop]   = useState(false);
  // For form category suggestion
  const [showFormCatDrop,   setShowFormCatDrop]   = useState(false);
  const [showFormItemDrop,  setShowFormItemDrop]  = useState(false);

  const [form, setForm] = useState({
    categoryId: "", newCategoryName: "", name: "", description: "",
    price: "", status: "ACTIVE", imageUrl: null,
  });
  const [formErrors, setFormErrors] = useState({});

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  }, []);

  // Load category suggestions on mount
  useEffect(() => {
    api.get("/api/suggestions/categories")
      .then(res => setCatSuggestions(res.data?.data || []))
      .catch(() => setCatSuggestions([]));
  }, []);

  // Load item suggestions when category changes
  const loadItemSuggestions = useCallback(async (categoryName) => {
    if (!categoryName) { setItemSuggestions([]); return; }
    setLoadingItemSugg(true);
    try {
      const res = await api.get(`/api/suggestions/items?categoryName=${encodeURIComponent(categoryName)}`);
      setItemSuggestions(res.data?.data || []);
    } catch {
      setItemSuggestions([]);
    } finally {
      setLoadingItemSugg(false);
    }
  }, []);

  // Trigger item suggestions load when category selection changes
  useEffect(() => {
    if (form.categoryId) {
      const cat = categories.find(c => String(c.categoryId) === String(form.categoryId));
      if (cat) loadItemSuggestions(cat.categoryName);
    } else if (form.newCategoryName.trim()) {
      loadItemSuggestions(form.newCategoryName.trim());
    } else {
      setItemSuggestions([]);
    }
  }, [form.categoryId, form.newCategoryName, categories, loadItemSuggestions]);

  const fetchCategories = useCallback(async () => {
    if (!adminId) return;
    setCatsLoading(true);
    try { const res = await getCategoriesByAdmin(adminId); setCategories(res.data || []); }
    catch { showToast("Failed to load categories.", "error"); }
    finally { setCatsLoading(false); }
  }, [adminId, showToast]);

  const fetchProducts = useCallback(async (catId) => {
    if (!catId) return;
    setProdsLoading(true);
    try { const res = await getProductsByCategory(catId); setProducts(res.data || []); }
    catch { showToast("Failed to load products.", "error"); }
    finally { setProdsLoading(false); }
  }, [showToast]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { if (selectedCatId) fetchProducts(selectedCatId); else setProducts([]); }, [selectedCatId, fetchProducts]);

  const handleSelectCategory = (catId) => {
    setSelectedCatId(catId); setCurrentPage(1); setSearchQuery(""); setStatusFilter("All Status"); resetForm();
    // Auto-set form category so admin can directly add items without selecting from dropdown
    setForm(prev => ({ ...prev, categoryId: String(catId), newCategoryName: "" }));
  };

  const handleCatImageUpload = async (file) => {
    setNewCatImgUploading(true);
    try { const res = await uploadCategoryImage(file); setNewCatImageUrl(res.data?.data?.imageUrl || res.data?.imageUrl || null); }
    catch { showToast("Failed to upload image.", "error"); }
    finally { setNewCatImgUploading(false); }
  };

  const handleProdImageUpload = async (file) => {
    setProdImgUploading(true);
    try { const res = await uploadProductImage(file); setForm(prev => ({ ...prev, imageUrl: res.data?.data?.imageUrl || res.data?.imageUrl || null })); }
    catch { showToast("Failed to upload image.", "error"); }
    finally { setProdImgUploading(false); }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setCatSaving(true);
    try {
      const res = await createCategory({ adminId, businessId, categoryName: newCatName.trim(), categoryImageUrl: newCatImageUrl || null });
      const created = res.data;
      setCategories(prev => [created, ...prev]);
      setSelectedCatId(created.categoryId);
      // Auto-select in form dropdown so admin does not need to re-pick
      setForm(prev => ({ ...prev, categoryId: String(created.categoryId), newCategoryName: "" }));
      // Auto-populate image if category has one from suggestions
      if (created.categoryImageUrl) {
        setForm(prev => ({ ...prev, imageUrl: created.categoryImageUrl }));
      }
      setNewCatName(""); setNewCatImageUrl(null); setShowAddCatInline(false);
      showToast("Category created! ✓");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create category.", "error");
    } finally { setCatSaving(false); }
  };

  const handleDeleteCategory = async (catId) => {
    setDeleting(true);
    try {
      await deleteCategory(catId, adminId);
      setCategories(prev => prev.filter(c => c.categoryId !== catId));
      if (selectedCatId === catId) { setSelectedCatId(null); setProducts([]); }
      showToast("Category deleted.");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete.", "error");
    } finally { setDeleting(false); setShowDeleteModal(false); setDeleteTarget(null); }
  };

  const resetForm = useCallback(() => {
    setForm({ categoryId: "", newCategoryName: "", name: "", description: "", price: "", status: "ACTIVE", imageUrl: null });
    setFormErrors({}); setEditingItem(null); setItemSuggestions([]);
  }, []);

  const handleFieldChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: "" }));
  }, []);

  const validateForm = () => {
    const errors = {};
    const hasCat = form.categoryId || form.newCategoryName.trim();
    if (!hasCat) errors.category = "Select or enter a category.";
    if (!form.name.trim()) errors.name = "Item name is required.";
    const p = parseFloat(form.price);
    if (form.price === "" || isNaN(p) || p < 0) errors.price = "Enter a valid price.";
    return errors;
  };

  const handleSaveItem = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    setFormSaving(true);
    try {
      let targetCatId = form.categoryId ? Number(form.categoryId) : selectedCatId;

      if (form.newCategoryName.trim()) {
        const existing = categories.find(c => c.categoryName.toLowerCase() === form.newCategoryName.trim().toLowerCase());
        if (existing) { targetCatId = existing.categoryId; }
        else {
          const catRes = await createCategory({ adminId, businessId, categoryName: form.newCategoryName.trim() });
          const newCat = catRes.data;
          setCategories(prev => [newCat, ...prev]);
          targetCatId = newCat.categoryId;
        }
      }

      const payload = {
        adminId, businessId, categoryId: targetCatId,
        itemName: form.name.trim(), itemDescription: form.description.trim() || null,
        itemPrice: parseFloat(form.price), itemImageUrl: form.imageUrl || null,
        productStatus: form.status,
      };

      if (editingItem) {
        const res = await updateProduct(editingItem.productId, adminId, payload);
        setProducts(prev => prev.map(p => p.productId === editingItem.productId ? res.data : p));
        showToast("Item updated! ✓");
      } else {
        const res = await createProduct(payload);
        if (targetCatId === selectedCatId) setProducts(prev => [res.data, ...prev]);
        else setSelectedCatId(targetCatId);
        setCategories(prev => prev.map(c => c.categoryId === targetCatId ? { ...c, productCount: c.productCount + 1 } : c));
        showToast("Item saved! ✓");
      }
      resetForm(); setCurrentPage(1);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save item.", "error");
    } finally { setFormSaving(false); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({ categoryId: String(item.categoryId), newCategoryName: "", name: item.itemName, description: item.itemDescription || "", price: String(item.itemPrice), status: item.productStatus, imageUrl: item.itemImageUrl || null });
    setFormErrors({}); setFormCollapsed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDeleteModal = (target) => { setDeleteTarget(target); setShowDeleteModal(true); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "product") {
      setDeleting(true);
      try {
        await deleteProduct(deleteTarget.id, adminId);
        setProducts(prev => prev.filter(p => p.productId !== deleteTarget.id));
        setCategories(prev => prev.map(c => c.categoryId === selectedCatId ? { ...c, productCount: Math.max(0, c.productCount - 1) } : c));
        showToast("Item deleted.");
      } catch (err) { showToast(err.response?.data?.message || "Failed to delete.", "error"); }
      finally { setDeleting(false); }
    } else if (deleteTarget.type === "category") {
      await handleDeleteCategory(deleteTarget.id);
    }
    setShowDeleteModal(false); setDeleteTarget(null); setCurrentPage(1);
  };

  const selectedCategory  = categories.find(c => c.categoryId === selectedCatId);
  const filteredProducts  = products.filter(p => {
    const ms = p.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || (p.itemDescription || "").toLowerCase().includes(searchQuery.toLowerCase());
    const mst = statusFilter === "All Status" || (statusFilter === "Active" && p.productStatus === "ACTIVE") || (statusFilter === "Inactive" && p.productStatus === "INACTIVE");
    return ms && mst;
  });
  const totalPages    = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safePage      = Math.min(currentPage, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
  const totalItems    = products.length;

  // current category name used to load item suggestions
  const currentCategoryName = form.categoryId
    ? (categories.find(c => String(c.categoryId) === String(form.categoryId))?.categoryName || "")
    : form.newCategoryName.trim();

  // ── INLINE STYLES ───────────────────────────────────────
  const suggDropStyle = {
    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 200,
    background: "#fff", border: "1.5px solid #e4e4e7", borderRadius: 10,
    boxShadow: "0 8px 24px rgba(0,0,0,0.13)", maxHeight: 240, overflowY: "auto",
  };
  const suggItemStyle = (hover) => ({
    display: "flex", alignItems: "center", gap: 10, width: "100%",
    padding: "9px 14px", background: hover ? "#fffbeb" : "transparent",
    border: "none", textAlign: "left", cursor: "pointer",
    fontSize: 13, color: "#18181b", borderBottom: "1px solid #f9f9f9",
  });

  return (
    <div className="mc-root">
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes mcToastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        .mc-btn-danger{display:inline-flex;align-items:center;gap:6px;background:#ef4444;border:none;color:#fff;border-radius:8px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;transition:background .18s}
        .mc-btn-danger:hover{background:#dc2626}.mc-btn-danger:disabled{opacity:.6;cursor:not-allowed}
        .mc-add-cat-inline{padding:14px 16px;border-bottom:1px solid #f4f4f5;display:flex;flex-direction:column;gap:10px}
        .mc-inline-actions{display:flex;gap:8px;justify-content:flex-end}
        .mc-no-category{display:flex;flex-direction:column;align-items:center;text-align:center;padding:32px 20px;gap:10px;color:#71717a}
        .mc-no-category .mc-no-icon{font-size:36px}
        .mc-no-category h3{font-size:14px;font-weight:700;color:#18181b;margin:0}
        .mc-no-category p{font-size:12.5px;margin:0}
        .mc-no-category button{display:inline-flex;align-items:center;gap:6px;background:#3b1f0a;color:#fff;border:none;border-radius:8px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;margin-top:4px}
        .mc-cat-row-actions{display:flex;align-items:center;gap:2px;margin-left:auto;padding-left:6px;flex-shrink:0}
        .mc-cat-icon-btn{background:none;border:none;color:#d4d4d8;cursor:pointer;padding:5px;border-radius:5px;display:flex;align-items:center;transition:color .18s,background .18s}
        .mc-cat-icon-btn:hover{color:#ef4444;background:#fee2e2}
        .sugg-drop-header{padding:7px 14px 5px;font-size:10.5px;color:#a1a1aa;font-weight:700;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #f4f4f5}
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {showDeleteModal && (
        <div className="mc-modal-overlay" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="mc-modal" onClick={e => e.stopPropagation()}>
            <div className="mc-modal-head">
              <span className="mc-modal-title">{deleteTarget?.type === "category" ? "Delete Category" : "Delete Item"}</span>
              <button className="mc-modal-close" onClick={() => !deleting && setShowDeleteModal(false)} type="button"><X size={20} /></button>
            </div>
            <div className="mc-modal-body">
              <p style={{ fontSize: 13.5, color: "#3f3f46" }}>
                {deleteTarget?.type === "category" ? "This will delete the category and ALL its products. This cannot be undone." : "Are you sure you want to delete this item?"}
              </p>
            </div>
            <div className="mc-modal-foot">
              <button className="mc-btn-ghost" onClick={() => setShowDeleteModal(false)} disabled={deleting} type="button">Cancel</button>
              <button className="mc-btn-danger" onClick={confirmDelete} disabled={deleting} type="button">
                {deleting ? <><Loader2 size={14} style={{ animation: "spin .7s linear infinite" }} /> Deleting...</> : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mc-page-header">
        <div className="mc-page-title-row">
          <div>
            <h1 className="mc-page-title">Menu &amp; Category</h1>
            <p className="mc-page-sub">Manage your restaurant menu categories and items</p>
          </div>
          {/* <button className="mc-btn-dark mc-add-btn" onClick={() => setShowAddCatInline(true)} type="button">
            <Plus size={16} /> Add New Category
          </button> */}
        </div>
      </div>

      <div className="mc-layout">
        {/* ── SIDEBAR ─────────────────────────────────────── */}
        <aside className="mc-sidebar">
          <div className="mc-sidebar-head">
            <span className="mc-sidebar-title">Categories {!catsLoading && `(${categories.length})`}</span>
            <button className="mc-btn-outline-sm" onClick={() => setShowAddCatInline(true)} type="button"><Plus size={14} /> Add</button>
          </div>

          {showAddCatInline && (
            <div className="mc-add-cat-inline">

              {/* Category suggestion dropdown for sidebar */}
              {catSuggestions.length > 0 && (
                <div style={{ position: "relative" }}>
                  <div style={{ marginBottom: 6 }}>
                    <button
                      type="button"
                      onClick={() => setShowCatSuggDrop(v => !v)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, width: "100%",
                        padding: "8px 12px", background: "#fffbeb", border: "1.5px solid #fde68a",
                        borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: "#92400e", cursor: "pointer",
                        justifyContent: "space-between"
                      }}
                    >
                      <span>✨ Pick from suggestions ({catSuggestions.length})</span>
                      <ChevronDown size={14} style={{ transform: showCatSuggDrop ? "rotate(180deg)" : "none", transition: "0.2s" }} />
                    </button>
                    {showCatSuggDrop && (
                      <div style={suggDropStyle}>
                        <div className="sugg-drop-header">Suggestions for your business type</div>
                        {catSuggestions.map((s, i) => (
                          <button key={i} type="button"
                            style={suggItemStyle(false)}
                            onMouseEnter={e => e.currentTarget.style.background = "#fffbeb"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            onClick={() => { setNewCatName(s.categoryName); setShowCatSuggDrop(false); }}
                          >
                            {s.categoryEmoji && <span style={{ fontSize: 16 }}>{s.categoryEmoji}</span>}
                            <span>{s.categoryName}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <input
                className="mc-input" type="text"
                placeholder="Category name (or type manually)..."
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddCategory()}
                autoFocus
              />
              <ImageUploadBox imageUrl={newCatImageUrl} onUpload={handleCatImageUpload} onRemove={() => setNewCatImageUrl(null)} uploading={newCatImgUploading} compact />
              <div className="mc-inline-actions">
                <button className="mc-btn-ghost" onClick={() => { setShowAddCatInline(false); setNewCatName(""); setNewCatImageUrl(null); setShowCatSuggDrop(false); }} disabled={catSaving} type="button">Cancel</button>
                <button className="mc-btn-dark" onClick={handleAddCategory} disabled={catSaving || !newCatName.trim()} type="button">
                  {catSaving ? <><Loader2 size={14} style={{ animation: "spin .7s linear infinite" }} /> Creating...</> : <><Check size={14} /> Create</>}
                </button>
              </div>
            </div>
          )}

          <div className="mc-cat-list">
            {catsLoading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 32, gap: 10, color: "#71717a", fontSize: 13 }}>
                <Loader2 size={18} style={{ animation: "spin .7s linear infinite" }} /> Loading...
              </div>
            ) : categories.length === 0 ? (
              <div className="mc-no-category">
                <span className="mc-no-icon">📪</span>
                <h3>No Categories Yet</h3>
                <p>Add your first category to get started</p>
                <button onClick={() => setShowAddCatInline(true)} type="button"><Plus size={14} /> Add New Category</button>
              </div>
            ) : (
              categories.map(cat => (
                <div key={cat.categoryId} className={`mc-cat-item ${selectedCatId === cat.categoryId ? "mc-cat-active" : ""}`}
                  onClick={() => handleSelectCategory(cat.categoryId)} role="button" tabIndex={0}
                  onKeyDown={e => e.key === "Enter" && handleSelectCategory(cat.categoryId)}>
                  <div className="mc-cat-img">
                    {cat.categoryImageUrl ? <img src={cat.categoryImageUrl} alt={cat.categoryName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} /> : "🍽️"}
                  </div>
                  <div className="mc-cat-info">
                    <div className="mc-cat-name">{cat.categoryName}</div>
                    <div className="mc-cat-count">{cat.productCount} Items</div>
                  </div>
                  <div className="mc-cat-row-actions" onClick={e => e.stopPropagation()}>
                    <button className="mc-cat-icon-btn" onClick={() => openDeleteModal({ type: "category", id: cat.categoryId })} type="button"><Trash2 size={13} /></button>
                    <ChevronRight size={15} style={{ color: "#d4d4d8", pointerEvents: "none" }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────── */}
        <div className="mc-main">
          <div className="mc-form-panel">
            <div className="mc-form-head">
              <h2 className="mc-form-title">{editingItem ? `Edit: ${editingItem.itemName}` : "Add New Item"}</h2>
              <button className="mc-collapse-btn" onClick={() => setFormCollapsed(v => !v)} type="button">
                {formCollapsed ? <><ChevronDown size={16} /> Expand</> : <><ChevronUp size={16} /> Collapse</>}
              </button>
            </div>

            {!formCollapsed && (
              <div className="mc-form-body">

                {/* ── CATEGORY ROW ──────────────────────── */}
                <div className="mc-form-row mc-form-cat-row">
                  <div className="mc-form-group mc-fg-half">
                    <label className="mc-label">Category <span className="mc-req">*</span></label>

                    {/* Category suggestion dropdown */}
                    {catSuggestions.length > 0 && (
                      <div style={{ position: "relative", marginBottom: 8 }}>
                        <button
                          type="button"
                          onClick={() => { setShowFormCatDrop(v => !v); setShowFormItemDrop(false); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 6, width: "100%",
                            padding: "8px 12px", background: "#fffbeb", border: "1.5px solid #fde68a",
                            borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: "#92400e",
                            cursor: "pointer", justifyContent: "space-between"
                          }}
                        >
                          <span>✨ Suggested categories ({catSuggestions.length})</span>
                          <ChevronDown size={14} style={{ transform: showFormCatDrop ? "rotate(180deg)" : "none", transition: "0.2s" }} />
                        </button>
                        {showFormCatDrop && (
                          <div style={suggDropStyle}>
                            <div className="sugg-drop-header">Based on your business type</div>
                            {catSuggestions.map((s, i) => (
                              <button key={i} type="button"
                                style={suggItemStyle(false)}
                                onMouseEnter={e => e.currentTarget.style.background = "#fffbeb"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                onClick={() => {
                                  handleFieldChange("newCategoryName", s.categoryName);
                                  handleFieldChange("categoryId", "");
                                  setShowFormCatDrop(false);
                                }}
                              >
                                {s.categoryEmoji && <span style={{ fontSize: 16 }}>{s.categoryEmoji}</span>}
                                <span>{s.categoryName}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mc-select-wrap">
                      <select className={`mc-select ${formErrors.category ? "mc-err" : ""}`}
                        value={form.categoryId}
                        onChange={e => { handleFieldChange("categoryId", e.target.value); handleFieldChange("newCategoryName", ""); }}>
                        <option value="">— Select Existing Category —</option>
                        {categories.map(c => <option key={c.categoryId} value={String(c.categoryId)}>{c.categoryName}</option>)}
                      </select>
                      <ChevronDown size={15} className="mc-select-icon" />
                    </div>
                    {formErrors.category && <span className="mc-field-err">{formErrors.category}</span>}
                  </div>

                  <div className="mc-form-or">or</div>

                  <div className="mc-form-group mc-fg-half">
                    <label className="mc-label">New Category Name</label>
                    <input className="mc-input" type="text"
                      placeholder="Type new category name here..."
                      value={form.newCategoryName}
                      onChange={e => { handleFieldChange("newCategoryName", e.target.value); handleFieldChange("categoryId", ""); }} />
                    <span style={{ fontSize: 11, color: "#a1a1aa", marginTop: 3, display: "block" }}>
                      Not in dropdown? Type here to create a new category
                    </span>
                  </div>
                </div>

                {/* ── ITEM NAME ROW ──────────────────────── */}
                <div className="mc-form-row">
                  <div className="mc-form-group mc-fg-half">
                    <label className="mc-label">Item Name <span className="mc-req">*</span></label>

                    {/* Item suggestion dropdown — shows only after category is chosen */}
                    {currentCategoryName && (
                      <div style={{ position: "relative", marginBottom: 8 }}>
                        {loadingItemSugg ? (
                          <div style={{ fontSize: 12, color: "#a1a1aa", display: "flex", alignItems: "center", gap: 6, padding: "6px 0" }}>
                            <Loader2 size={12} style={{ animation: "spin .7s linear infinite" }} />
                            Loading suggestions for "{currentCategoryName}"...
                          </div>
                        ) : itemSuggestions.length > 0 ? (
                          <>
                            <button
                              type="button"
                              onClick={() => { setShowFormItemDrop(v => !v); setShowFormCatDrop(false); }}
                              style={{
                                display: "flex", alignItems: "center", gap: 6, width: "100%",
                                padding: "8px 12px", background: "#f0fdf4", border: "1.5px solid #bbf7d0",
                                borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: "#166534",
                                cursor: "pointer", justifyContent: "space-between"
                              }}
                            >
                              <span>✨ Suggested items for "{currentCategoryName}" ({itemSuggestions.length})</span>
                              <ChevronDown size={14} style={{ transform: showFormItemDrop ? "rotate(180deg)" : "none", transition: "0.2s" }} />
                            </button>
                            {showFormItemDrop && (
                              <div style={suggDropStyle}>
                                <div className="sugg-drop-header">Tap to fill item name</div>
                                {itemSuggestions.map((s, i) => (
                                  <button key={i} type="button"
                                    style={suggItemStyle(false)}
                                    onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    onClick={() => {
                                      handleFieldChange("name", s.itemName);
                                      setShowFormItemDrop(false);
                                    }}
                                  >
                                    <span style={{ fontSize: 16 }}>🍽️</span>
                                    <span>{s.itemName}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div style={{ fontSize: 11.5, color: "#a1a1aa", padding: "4px 0" }}>
                            No suggestions for this category — type item name below
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`mc-input-icon-wrap ${formErrors.name ? "mc-err" : ""}`}>
                      <span className="mc-input-icon"><Coffee size={15} /></span>
                      <input className="mc-input-inner" type="text"
                        placeholder={currentCategoryName ? "Select from suggestions above or type manually" : "Enter item name"}
                        value={form.name}
                        onChange={e => handleFieldChange("name", e.target.value)} />
                    </div>
                    {formErrors.name && <span className="mc-field-err">{formErrors.name}</span>}
                  </div>

                  <div className="mc-form-group mc-fg-half">
                    <label className="mc-label">Item Description (Optional)</label>
                    <div className="mc-input-icon-wrap">
                      <span className="mc-input-icon"><Filter size={14} /></span>
                      <input className="mc-input-inner" type="text" placeholder="Enter item description"
                        value={form.description} onChange={e => handleFieldChange("description", e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* ── IMAGE + PRICE ROW ──────────────────── */}
                <div className="mc-form-row">
                  <div className="mc-form-group mc-fg-half">
                    <label className="mc-label">Item Image (Optional)</label>
                    <ImageUploadBox imageUrl={form.imageUrl} onUpload={handleProdImageUpload} onRemove={() => handleFieldChange("imageUrl", null)} uploading={prodImgUploading} />
                  </div>
                  <div className="mc-form-group mc-fg-half">
                    <label className="mc-label">Item Price <span className="mc-req">*</span></label>
                    <div className={`mc-input-icon-wrap ${formErrors.price ? "mc-err" : ""}`}>
                      <span className="mc-input-icon mc-rupee">{getCurrencySymbol(currencyCode)}</span>
                      <input className="mc-input-inner" type="number" min="0" step="0.01" placeholder="0.00"
                        value={form.price} onChange={e => handleFieldChange("price", e.target.value)} />
                    </div>
                    {formErrors.price && <span className="mc-field-err">{formErrors.price}</span>}
                    <label className="mc-label" style={{ marginTop: 14 }}>Status</label>
                    <div className="mc-select-wrap">
                      <select className="mc-select" value={form.status} onChange={e => handleFieldChange("status", e.target.value)}>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                      <ChevronDown size={15} className="mc-select-icon" />
                    </div>
                  </div>
                </div>

                <div className="mc-form-actions">
                  <button className="mc-btn-reset" onClick={resetForm} type="button" disabled={formSaving}><RotateCcw size={14} /> Reset</button>
                  <button className="mc-btn-dark mc-save-btn" onClick={handleSaveItem} type="button" disabled={formSaving || prodImgUploading}>
                    {formSaving
                      ? <><Loader2 size={14} style={{ animation: "spin .7s linear infinite" }} /> {editingItem ? "Updating..." : "Saving..."}</>
                      : <><Send size={14} /> {editingItem ? "Update Item" : "Save Item"}</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── ITEMS TABLE ──────────────────────────────── */}
          <div className="mc-items-panel">
            <div className="mc-items-head">
              <h3 className="mc-items-title">
                {selectedCategory ? `Items in ${selectedCategory.categoryName}` : "Select a category"} ({totalItems})
              </h3>
              <div className="mc-items-controls">
                <div className="mc-search-wrap">
                  <Search size={14} className="mc-search-icon" />
                  <input className="mc-search-input" type="text" placeholder="Search items..."
                    value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                </div>
                <div className="mc-select-wrap mc-status-select">
                  <select className="mc-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                    <option>All Status</option><option>Active</option><option>Inactive</option>
                  </select>
                  <ChevronDown size={14} className="mc-select-icon" />
                </div>
                <button className="mc-icon-btn" onClick={() => selectedCatId && fetchProducts(selectedCatId)} title="Refresh" type="button"><RefreshCw size={15} /></button>
              </div>
            </div>

            <div className="mc-table-wrap">
              <table className="mc-table">
                <thead>
                  <tr>
                    <th className="mc-th">Item</th><th className="mc-th">Description</th>
                    <th className="mc-th">Price</th><th className="mc-th">Status</th>
                    <th className="mc-th mc-th-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prodsLoading ? (
                    <tr><td colSpan={5} className="mc-empty"><div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Loader2 size={16} style={{ animation: "spin .7s linear infinite" }} /> Loading...</div></td></tr>
                  ) : !selectedCatId ? (
                    <tr><td colSpan={5} className="mc-empty">👈 Select a category from the left to view items.</td></tr>
                  ) : pagedProducts.length === 0 ? (
                    <tr><td colSpan={5} className="mc-empty">{searchQuery || statusFilter !== "All Status" ? "No items match your search." : "No items yet. Add one using the form above."}</td></tr>
                  ) : (
                    pagedProducts.map(item => (
                      <tr key={item.productId} className="mc-tr">
                        <td className="mc-td">
                          <div className="mc-item-cell">
                            <div className="mc-item-thumb">
                              {item.itemImageUrl ? <img src={item.itemImageUrl} alt={item.itemName} className="mc-thumb-img" onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} /> : null}
                              <span className="mc-thumb-emoji" style={{ display: item.itemImageUrl ? "none" : "flex" }}>🍽️</span>
                            </div>
                            <span className="mc-item-name">{item.itemName}</span>
                          </div>
                        </td>
                        <td className="mc-td mc-td-desc">{item.itemDescription || "—"}</td>
                        <td className="mc-td mc-td-price">{formatCurrency(Number(item.itemPrice), currencyCode)}</td>
                        <td className="mc-td">
                          <span className={`mc-status-badge ${item.productStatus === "ACTIVE" ? "mc-status-active" : "mc-status-inactive"}`}>
                            <span className="mc-status-dot" />{item.productStatus === "ACTIVE" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="mc-td mc-td-actions">
                          <button className="mc-action-edit" onClick={() => handleEdit(item)} type="button"><Pencil size={13} /> Edit</button>
                          <button className="mc-action-delete" onClick={() => openDeleteModal({ type: "product", id: item.productId })} type="button"><Trash2 size={13} /> Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredProducts.length > ITEMS_PER_PAGE && (
              <div className="mc-pagination">
                <span className="mc-pg-info">
                  Showing {Math.min((safePage - 1) * ITEMS_PER_PAGE + 1, filteredProducts.length)} to {Math.min(safePage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} items
                </span>
                <div className="mc-pg-controls">
                  <button className="mc-pg-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} type="button"><ChevronLeft size={15} /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                    <button key={pg} className={`mc-pg-btn ${safePage === pg ? "mc-pg-active" : ""}`} onClick={() => setCurrentPage(pg)} type="button">{pg}</button>
                  ))}
                  <button className="mc-pg-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} type="button"><ChevronRight size={15} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuCategory;