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

const ITEMS_PER_PAGE = 5;

function getUser() {
  try {
    const s = localStorage.getItem("ttl_user");
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function Toast({ msg, type }) {
  return (
    <div style={{
      position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)",
      background: type === "error" ? "#dc2626" : "#18181b",
      color:"#fff", padding:"11px 24px", borderRadius:30,
      fontSize:13.5, fontWeight:600, zIndex:9999,
      boxShadow:"0 4px 20px rgba(0,0,0,0.18)", whiteSpace:"nowrap",
      animation:"mcToastIn 0.25s ease",
    }}>
      <style>{`@keyframes mcToastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {msg}
    </div>
  );
}

const MenuCategory = () => {
  const user       = getUser();
  const adminId    = user?.adminId    || "";
  const businessId = user?.businessId || "";

  const [categories,       setCategories]       = useState([]);
  const [products,         setProducts]         = useState([]);
  const [selectedCatId,    setSelectedCatId]    = useState(null);
  const [formCollapsed,    setFormCollapsed]    = useState(false);
  const [showAddCatInline, setShowAddCatInline] = useState(false);
  const [newCatName,       setNewCatName]       = useState("");
  const [newCatImage,      setNewCatImage]      = useState(null);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [statusFilter,     setStatusFilter]     = useState("All Status");
  const [currentPage,      setCurrentPage]      = useState(1);
  const [editingItem,      setEditingItem]      = useState(null);
  const [showDeleteModal,  setShowDeleteModal]  = useState(false);
  const [deleteTarget,     setDeleteTarget]     = useState(null);
  const [catsLoading,      setCatsLoading]      = useState(true);
  const [prodsLoading,     setProdsLoading]     = useState(false);
  const [formSaving,       setFormSaving]       = useState(false);
  const [catSaving,        setCatSaving]        = useState(false);
  const [deleting,         setDeleting]         = useState(false);
  const [toast,            setToast]            = useState(null);

  const [form, setForm] = useState({
    categoryId:"", newCategoryName:"", name:"", description:"",
    price:"", status:"ACTIVE", imagePreview:null,
  });
  const [formErrors, setFormErrors] = useState({});

  const imageRef    = useRef();
  const catImageRef = useRef();

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchCategories = useCallback(async () => {
    if (!adminId) return;
    setCatsLoading(true);
    try {
      const res = await getCategoriesByAdmin(adminId);
      setCategories(res.data || []);
    } catch {
      showToast("Failed to load categories.", "error");
    } finally {
      setCatsLoading(false);
    }
  }, [adminId, showToast]);

  const fetchProducts = useCallback(async (catId) => {
    if (!catId) return;
    setProdsLoading(true);
    try {
      const res = await getProductsByCategory(catId);
      setProducts(res.data || []);
    } catch {
      showToast("Failed to load products.", "error");
    } finally {
      setProdsLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    if (selectedCatId) fetchProducts(selectedCatId);
    else setProducts([]);
  }, [selectedCatId, fetchProducts]);

  const handleSelectCategory = (catId) => {
    setSelectedCatId(catId);
    setCurrentPage(1);
    setSearchQuery("");
    setStatusFilter("All Status");
    resetForm();
  };

  const handleCatImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setNewCatImage(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setCatSaving(true);
    try {
      const res = await createCategory({
        adminId, businessId,
        categoryName: newCatName.trim(),
        categoryImageUrl: newCatImage || null,
      });
      const created = res.data;
      setCategories(prev => [created, ...prev]);
      setSelectedCatId(created.categoryId);
      setNewCatName("");
      setNewCatImage(null);
      setShowAddCatInline(false);
      showToast("Category created successfully! ✓");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create category.", "error");
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    setDeleting(true);
    try {
      await deleteCategory(catId, adminId);
      setCategories(prev => prev.filter(c => c.categoryId !== catId));
      if (selectedCatId === catId) { setSelectedCatId(null); setProducts([]); }
      showToast("Category deleted successfully.");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete category.", "error");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const resetForm = useCallback(() => {
    setForm({ categoryId:"", newCategoryName:"", name:"", description:"", price:"", status:"ACTIVE", imagePreview:null });
    setFormErrors({});
    setEditingItem(null);
  }, []);

  const handleFieldChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: "" }));
  }, []);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(prev => ({ ...prev, imagePreview: ev.target.result }));
    reader.readAsDataURL(file);
    e.target.value = "";
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
        const existing = categories.find(
          c => c.categoryName.toLowerCase() === form.newCategoryName.trim().toLowerCase()
        );
        if (existing) {
          targetCatId = existing.categoryId;
        } else {
          const catRes = await createCategory({ adminId, businessId, categoryName: form.newCategoryName.trim() });
          const newCat = catRes.data;
          setCategories(prev => [newCat, ...prev]);
          targetCatId = newCat.categoryId;
        }
      }

      const payload = {
        adminId, businessId, categoryId: targetCatId,
        itemName: form.name.trim(),
        itemDescription: form.description.trim() || null,
        itemPrice: parseFloat(form.price),
        itemImageUrl: form.imagePreview || null,
        productStatus: form.status,
      };

      if (editingItem) {
        const res = await updateProduct(editingItem.productId, adminId, payload);
        setProducts(prev => prev.map(p => p.productId === editingItem.productId ? res.data : p));
        if (targetCatId !== selectedCatId) {
          setProducts(prev => prev.filter(p => p.productId !== editingItem.productId));
          setCategories(prev => prev.map(c => ({
            ...c,
            productCount: c.categoryId === targetCatId ? c.productCount + 1
              : c.categoryId === selectedCatId ? c.productCount - 1 : c.productCount,
          })));
        }
        showToast("Item updated successfully! ✓");
      } else {
        const res = await createProduct(payload);
        const newProduct = res.data;
        if (targetCatId === selectedCatId) setProducts(prev => [newProduct, ...prev]);
        else setSelectedCatId(targetCatId);
        setCategories(prev => prev.map(c =>
          c.categoryId === targetCatId ? { ...c, productCount: c.productCount + 1 } : c
        ));
        showToast("Item saved successfully! ✓");
      }

      resetForm();
      setCurrentPage(1);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save item.", "error");
    } finally {
      setFormSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({
      categoryId: String(item.categoryId), newCategoryName:"",
      name: item.itemName, description: item.itemDescription || "",
      price: String(item.itemPrice), status: item.productStatus,
      imagePreview: item.itemImageUrl || null,
    });
    setFormErrors({});
    setFormCollapsed(false);
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const openDeleteModal = (target) => { setDeleteTarget(target); setShowDeleteModal(true); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "product") {
      setDeleting(true);
      try {
        await deleteProduct(deleteTarget.id, adminId);
        setProducts(prev => prev.filter(p => p.productId !== deleteTarget.id));
        setCategories(prev => prev.map(c =>
          c.categoryId === selectedCatId
            ? { ...c, productCount: Math.max(0, c.productCount - 1) }
            : c
        ));
        showToast("Item deleted.");
      } catch (err) {
        showToast(err.response?.data?.message || "Failed to delete item.", "error");
      } finally {
        setDeleting(false);
      }
    } else if (deleteTarget.type === "category") {
      await handleDeleteCategory(deleteTarget.id);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
    setCurrentPage(1);
  };

  const selectedCategory = categories.find(c => c.categoryId === selectedCatId);

  const filteredProducts = products.filter(p => {
    const matchSearch =
      p.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.itemDescription || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      statusFilter === "All Status" ||
      (statusFilter === "Active"   && p.productStatus === "ACTIVE") ||
      (statusFilter === "Inactive" && p.productStatus === "INACTIVE");
    return matchSearch && matchStatus;
  });

  const totalPages    = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safePage      = Math.min(currentPage, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
  const totalItems    = products.length;

  return (
    <div className="mc-root">
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes mcToastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        .mc-btn-danger{display:inline-flex;align-items:center;gap:6px;background:#ef4444;border:none;color:#fff;border-radius:8px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .18s}
        .mc-btn-danger:hover{background:#dc2626}
        .mc-btn-danger:disabled{opacity:.6;cursor:not-allowed}
        .mc-add-cat-inline{padding:14px 16px;border-bottom:1px solid #f4f4f5;display:flex;flex-direction:column;gap:10px}
        .mc-inline-actions{display:flex;gap:8px;justify-content:flex-end}
        .mc-no-category{display:flex;flex-direction:column;align-items:center;text-align:center;padding:32px 20px;gap:10px;color:#71717a}
        .mc-no-category .mc-no-icon{font-size:36px}
        .mc-no-category h3{font-size:14px;font-weight:700;color:#18181b;margin:0}
        .mc-no-category p{font-size:12.5px;margin:0}
        .mc-no-category button{display:inline-flex;align-items:center;gap:6px;background:#3b1f0a;color:#fff;border:none;border-radius:8px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;margin-top:4px}
        .mc-cat-row-wrap{display:flex;align-items:center;width:100%;position:relative}
        .mc-cat-row-actions{display:flex;align-items:center;gap:2px;margin-left:auto;padding-left:6px;flex-shrink:0}
        .mc-cat-icon-btn{background:none;border:none;color:#d4d4d8;cursor:pointer;padding:5px;border-radius:5px;display:flex;align-items:center;transition:color .18s,background .18s;flex-shrink:0}
        .mc-cat-icon-btn:hover{color:#ef4444;background:#fee2e2}
        .mc-img-upload-row{display:flex;align-items:center;gap:8px}
        .mc-cat-img-preview{width:36px;height:36px;border-radius:8px;object-fit:cover;border:1.5px solid #e4e4e7;flex-shrink:0}
        .mc-cat-img-placeholder{width:36px;height:36px;border-radius:8px;background:#f4f3f0;border:1.5px dashed #d4d4d8;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#a1a1aa;cursor:pointer;transition:border-color .18s,background .18s}
        .mc-cat-img-placeholder:hover{border-color:#3b1f0a;background:#fdf7f3}
        .mc-upload-cancel-btn{position:absolute;top:-6px;right:-6px;width:18px;height:18px;background:#ef4444;border:none;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;z-index:2}
        .mc-img-wrap-rel{position:relative;display:inline-flex}
        .mc-prod-img-cancel{position:absolute;top:-7px;right:-7px;width:20px;height:20px;background:#ef4444;border:2px solid #fff;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;z-index:2;box-shadow:0 1px 4px rgba(0,0,0,.2)}
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {showDeleteModal && (
        <div className="mc-modal-overlay" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="mc-modal" onClick={e => e.stopPropagation()}>
            <div className="mc-modal-head">
              <span className="mc-modal-title">
                {deleteTarget?.type === "category" ? "Delete Category" : "Delete Item"}
              </span>
              <button className="mc-modal-close" onClick={() => !deleting && setShowDeleteModal(false)} type="button">
                <X size={20} />
              </button>
            </div>
            <div className="mc-modal-body">
              <p style={{ fontSize:13.5, color:"#3f3f46" }}>
                {deleteTarget?.type === "category"
                  ? "This will delete the category and ALL its products. This cannot be undone."
                  : "Are you sure you want to delete this item? This action cannot be undone."}
              </p>
            </div>
            <div className="mc-modal-foot">
              <button className="mc-btn-ghost" onClick={() => setShowDeleteModal(false)} disabled={deleting} type="button">Cancel</button>
              <button className="mc-btn-danger" onClick={confirmDelete} disabled={deleting} type="button">
                {deleting
                  ? <><Loader2 size={14} style={{ animation:"spin .7s linear infinite" }} /> Deleting...</>
                  : "Yes, Delete"}
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
          <button className="mc-btn-dark mc-add-btn" onClick={() => setShowAddCatInline(true)} type="button">
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      <div className="mc-layout">
        <aside className="mc-sidebar">
          <div className="mc-sidebar-head">
            <span className="mc-sidebar-title">
              Categories {!catsLoading && `(${categories.length})`}
            </span>
            <button className="mc-btn-outline-sm" onClick={() => setShowAddCatInline(true)} type="button">
              <Plus size={14} /> Add
            </button>
          </div>

          {showAddCatInline && (
            <div className="mc-add-cat-inline">
              <input
                className="mc-input"
                type="text"
                placeholder="Category name..."
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddCategory()}
                autoFocus
              />

              <div className="mc-img-upload-row">
                <input
                  ref={catImageRef}
                  type="file"
                  accept="image/*"
                  style={{ display:"none" }}
                  onChange={handleCatImageUpload}
                />
                {newCatImage ? (
                  <div className="mc-img-wrap-rel">
                    <img src={newCatImage} alt="Category" className="mc-cat-img-preview" />
                    <button
                      className="mc-upload-cancel-btn"
                      onClick={() => setNewCatImage(null)}
                      type="button"
                      title="Remove image"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <div
                    className="mc-cat-img-placeholder"
                    onClick={() => catImageRef.current?.click()}
                    title="Upload category image"
                  >
                    <Image size={16} />
                  </div>
                )}
                <span style={{ fontSize:12, color:"#a1a1aa" }}>
                  {newCatImage ? "Image selected" : "Optional: upload category image"}
                </span>
              </div>

              <div className="mc-inline-actions">
                <button
                  className="mc-btn-ghost"
                  onClick={() => { setShowAddCatInline(false); setNewCatName(""); setNewCatImage(null); }}
                  disabled={catSaving}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="mc-btn-dark"
                  onClick={handleAddCategory}
                  disabled={catSaving || !newCatName.trim()}
                  type="button"
                >
                  {catSaving
                    ? <><Loader2 size={14} style={{ animation:"spin .7s linear infinite" }} /> Creating...</>
                    : <><Check size={14} /> Create</>}
                </button>
              </div>
            </div>
          )}

          <div className="mc-cat-list">
            {catsLoading ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:32, gap:10, color:"#71717a", fontSize:13 }}>
                <Loader2 size={18} style={{ animation:"spin .7s linear infinite" }} /> Loading...
              </div>
            ) : categories.length === 0 ? (
              <div className="mc-no-category">
                <span className="mc-no-icon">📪</span>
                <h3>No Categories Yet</h3>
                <p>Start building your menu by adding your first category</p>
                <button onClick={() => setShowAddCatInline(true)} type="button">
                  <Plus size={14} /> Add Your First Category
                </button>
              </div>
            ) : (
              categories.map(cat => (
                <div
                  key={cat.categoryId}
                  className={`mc-cat-item ${selectedCatId === cat.categoryId ? "mc-cat-active" : ""}`}
                  onClick={() => handleSelectCategory(cat.categoryId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === "Enter" && handleSelectCategory(cat.categoryId)}
                >
                  <div className="mc-cat-img">
                    {cat.categoryImageUrl
                      ? <img src={cat.categoryImageUrl} alt={cat.categoryName} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:8 }} />
                      : "🍽️"}
                  </div>
                  <div className="mc-cat-info">
                    <div className="mc-cat-name">{cat.categoryName}</div>
                    <div className="mc-cat-count">{cat.productCount} Items</div>
                  </div>
                  <div className="mc-cat-row-actions" onClick={e => e.stopPropagation()}>
                    <button
                      className="mc-cat-icon-btn"
                      title="Delete category"
                      onClick={() => openDeleteModal({ type:"category", id:cat.categoryId })}
                      type="button"
                    >
                      <Trash2 size={13} />
                    </button>
                    <ChevronRight size={15} className="mc-cat-arrow" style={{ color:"#d4d4d8", pointerEvents:"none" }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <div className="mc-main">
          <div className="mc-form-panel">
            <div className="mc-form-head">
              <h2 className="mc-form-title">
                {editingItem ? `Edit: ${editingItem.itemName}` : "Add New Item"}
              </h2>
              <button className="mc-collapse-btn" onClick={() => setFormCollapsed(v => !v)} type="button">
                {formCollapsed ? <><ChevronDown size={16} /> Expand</> : <><ChevronUp size={16} /> Collapse</>}
              </button>
            </div>

            {!formCollapsed && (
              <div className="mc-form-body">
                <div className="mc-form-row mc-form-cat-row">
                  <div className="mc-form-group mc-fg-half">
                    <label className="mc-label">Category <span className="mc-req">*</span></label>
                    <div className="mc-select-wrap">
                      <select
                        className={`mc-select ${formErrors.category ? "mc-err" : ""}`}
                        value={form.categoryId}
                        onChange={e => { handleFieldChange("categoryId", e.target.value); handleFieldChange("newCategoryName",""); }}
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => (
                          <option key={c.categoryId} value={String(c.categoryId)}>{c.categoryName}</option>
                        ))}
                      </select>
                      <ChevronDown size={15} className="mc-select-icon" />
                    </div>
                    {formErrors.category && <span className="mc-field-err">{formErrors.category}</span>}
                  </div>
                  <div className="mc-form-or">or</div>
                  <div className="mc-form-group mc-fg-half">
                    <label className="mc-label">&nbsp;</label>
                    <input
                      className="mc-input"
                      type="text"
                      placeholder="Create New Category"
                      value={form.newCategoryName}
                      onChange={e => { handleFieldChange("newCategoryName", e.target.value); handleFieldChange("categoryId",""); }}
                    />
                  </div>
                </div>

                <div className="mc-form-row">
                  <div className="mc-form-group mc-fg-half">
                    <label className="mc-label">Item Name <span className="mc-req">*</span></label>
                    <div className={`mc-input-icon-wrap ${formErrors.name ? "mc-err" : ""}`}>
                      <span className="mc-input-icon"><Coffee size={15} /></span>
                      <input
                        className="mc-input-inner"
                        type="text"
                        placeholder="Enter item name"
                        value={form.name}
                        onChange={e => handleFieldChange("name", e.target.value)}
                      />
                    </div>
                    {formErrors.name && <span className="mc-field-err">{formErrors.name}</span>}
                  </div>
                  <div className="mc-form-group mc-fg-half">
                    <label className="mc-label">Item Description (Optional)</label>
                    <div className="mc-input-icon-wrap">
                      <span className="mc-input-icon"><Filter size={14} /></span>
                      <input
                        className="mc-input-inner"
                        type="text"
                        placeholder="Enter item description"
                        value={form.description}
                        onChange={e => handleFieldChange("description", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mc-form-row">
                  <div className="mc-form-group mc-fg-half">
                    <label className="mc-label">Item Image (Optional)</label>
                    <input ref={imageRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleImageUpload} />

                    {form.imagePreview ? (
                      <div style={{ position:"relative", display:"inline-flex" }}>
                        <img
                          src={form.imagePreview}
                          alt="preview"
                          style={{ width:100, height:100, objectFit:"cover", borderRadius:10, border:"1.5px solid #e4e4e7", display:"block" }}
                        />
                        <button
                          className="mc-prod-img-cancel"
                          onClick={() => handleFieldChange("imagePreview", null)}
                          type="button"
                          title="Remove image"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="mc-upload-zone"
                        onClick={() => imageRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === "Enter" && imageRef.current?.click()}
                      >
                        <Upload size={24} className="mc-upload-icon" />
                        <span className="mc-upload-text">Click to upload</span>
                        <span className="mc-upload-hint">PNG, JPG up to 5MB</span>
                      </div>
                    )}
                  </div>

                  <div className="mc-form-group mc-fg-half">
                    <label className="mc-label">Item Price <span className="mc-req">*</span></label>
                    <div className={`mc-input-icon-wrap ${formErrors.price ? "mc-err" : ""}`}>
                      <span className="mc-input-icon mc-rupee">₹</span>
                      <input
                        className="mc-input-inner"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={form.price}
                        onChange={e => handleFieldChange("price", e.target.value)}
                      />
                    </div>
                    {formErrors.price && <span className="mc-field-err">{formErrors.price}</span>}

                    <label className="mc-label" style={{ marginTop:14 }}>Status</label>
                    <div className="mc-select-wrap">
                      <select
                        className="mc-select"
                        value={form.status}
                        onChange={e => handleFieldChange("status", e.target.value)}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                      <ChevronDown size={15} className="mc-select-icon" />
                    </div>
                  </div>
                </div>

                <div className="mc-form-actions">
                  <button className="mc-btn-reset" onClick={resetForm} type="button" disabled={formSaving}>
                    <RotateCcw size={14} /> Reset
                  </button>
                  <button className="mc-btn-dark mc-save-btn" onClick={handleSaveItem} type="button" disabled={formSaving}>
                    {formSaving
                      ? <><Loader2 size={14} style={{ animation:"spin .7s linear infinite" }} /> {editingItem ? "Updating..." : "Saving..."}</>
                      : <><Send size={14} /> {editingItem ? "Update Item" : "Save Item"}</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mc-items-panel">
            <div className="mc-items-head">
              <h3 className="mc-items-title">
                {selectedCategory ? `Items in ${selectedCategory.categoryName}` : "Select a category"} ({totalItems})
              </h3>
              <div className="mc-items-controls">
                <div className="mc-search-wrap">
                  <Search size={14} className="mc-search-icon" />
                  <input
                    className="mc-search-input"
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                </div>
                <div className="mc-select-wrap mc-status-select">
                  <select className="mc-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                  <ChevronDown size={14} className="mc-select-icon" />
                </div>
                <button className="mc-icon-btn" onClick={() => selectedCatId && fetchProducts(selectedCatId)} title="Refresh" type="button">
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>

            <div className="mc-table-wrap">
              <table className="mc-table">
                <thead>
                  <tr>
                    <th className="mc-th">Item</th>
                    <th className="mc-th">Description</th>
                    <th className="mc-th">Price</th>
                    <th className="mc-th">Status</th>
                    <th className="mc-th mc-th-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prodsLoading ? (
                    <tr>
                      <td colSpan={5} className="mc-empty">
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                          <Loader2 size={16} style={{ animation:"spin .7s linear infinite" }} /> Loading items...
                        </div>
                      </td>
                    </tr>
                  ) : !selectedCatId ? (
                    <tr>
                      <td colSpan={5} className="mc-empty">👈 Select a category from the left to view items.</td>
                    </tr>
                  ) : pagedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="mc-empty">
                        {searchQuery || statusFilter !== "All Status"
                          ? "No items match your search."
                          : "No items in this category yet. Add your first item using the form above."}
                      </td>
                    </tr>
                  ) : (
                    pagedProducts.map(item => (
                      <tr key={item.productId} className="mc-tr">
                        <td className="mc-td">
                          <div className="mc-item-cell">
                            <div className="mc-item-thumb">
                              {item.itemImageUrl
                                ? <img src={item.itemImageUrl} alt={item.itemName} className="mc-thumb-img" />
                                : <span className="mc-thumb-emoji">🍽️</span>}
                            </div>
                            <span className="mc-item-name">{item.itemName}</span>
                          </div>
                        </td>
                        <td className="mc-td mc-td-desc">{item.itemDescription || "—"}</td>
                        <td className="mc-td mc-td-price">₹{Number(item.itemPrice).toFixed(2)}</td>
                        <td className="mc-td">
                          <span className={`mc-status-badge ${item.productStatus === "ACTIVE" ? "mc-status-active" : "mc-status-inactive"}`}>
                            <span className="mc-status-dot" />
                            {item.productStatus === "ACTIVE" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="mc-td mc-td-actions">
                          <button className="mc-action-edit" onClick={() => handleEdit(item)} type="button">
                            <Pencil size={13} /> Edit
                          </button>
                          <button className="mc-action-delete" onClick={() => openDeleteModal({ type:"product", id:item.productId })} type="button">
                            <Trash2 size={13} /> Delete
                          </button>
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
                  Showing {Math.min((safePage - 1) * ITEMS_PER_PAGE + 1, filteredProducts.length)} to{" "}
                  {Math.min(safePage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} items
                </span>
                <div className="mc-pg-controls">
                  <button className="mc-pg-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} type="button">
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                    <button key={pg} className={`mc-pg-btn ${safePage === pg ? "mc-pg-active" : ""}`} onClick={() => setCurrentPage(pg)} type="button">
                      {pg}
                    </button>
                  ))}
                  <button className="mc-pg-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} type="button">
                    <ChevronRight size={15} />
                  </button>
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