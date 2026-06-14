"use client";
import { useState, useRef } from "react";
import {
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Search,
  Filter,
  Pencil,
  Trash2,
  Upload,
  Send,
  RotateCcw,
  Coffee,
  ArrowRight,
  X,
  Check,
} from "lucide-react";
import "../menucategorypage/designmenucategorypage.css";

const INITIAL_CATEGORIES = [
  { id: 1, name: "Espresso Based", image: "☕", items: [
    { id: 101, name: "Cappuccino", description: "Perfect balance of espresso, steamed milk & foam.", price: 149, status: "Active", image: null },
    { id: 102, name: "Classic Latte", description: "Smooth espresso with steamed milk and a light layer of foam.", price: 139, status: "Active", image: null },
    { id: 103, name: "Caramel Macchiato", description: "Vanilla flavored milk with espresso and caramel drizzle.", price: 159, status: "Inactive", image: null },
  ]},
];

const ITEMS_PER_PAGE = 3;

const MenuCategory = () => {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [selectedCatId, setSelectedCatId] = useState(1);
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ category: "", newCategory: "", name: "", description: "", price: "0.00", status: "Active", image: null, imagePreview: null });
  const [formErrors, setFormErrors] = useState({});
  const [nextId, setNextId] = useState(200);
  const imageRef = useRef();

  const selectedCategory = categories.find(c => c.id === selectedCatId);

  const filteredItems = (selectedCategory?.items || []).filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "All Status" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedItems = filteredItems.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE);

  const resetForm = () => {
    setForm({ category: "", newCategory: "", name: "", description: "", price: "0.00", status: "Active", image: null, imagePreview: null });
    setFormErrors({});
    setEditingItem(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.category && !form.newCategory) errors.category = "Select or enter a category.";
    if (!form.name.trim()) errors.name = "Item name is required.";
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0) errors.price = "Enter a valid price.";
    return errors;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, image: file, imagePreview: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSaveItem = () => {
    const errors = validateForm();
    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    let targetCatId = selectedCatId;

    if (form.newCategory.trim()) {
      const exists = categories.find(c => c.name.toLowerCase() === form.newCategory.trim().toLowerCase());
      if (exists) {
        targetCatId = exists.id;
      } else {
        const newCat = { id: nextId + 1000, name: form.newCategory.trim(), image: "🍽️", items: [] };
        setCategories(prev => [...prev, newCat]);
        targetCatId = newCat.id;
        setNextId(n => n + 1001);
      }
    } else if (form.category) {
      const cat = categories.find(c => c.name === form.category);
      if (cat) targetCatId = cat.id;
    }

    if (editingItem) {
      setCategories(prev => prev.map(cat => ({
        ...cat,
        items: cat.items.map(item => item.id === editingItem.id
          ? { ...item, name: form.name, description: form.description, price: parseFloat(form.price), status: form.status, imagePreview: form.imagePreview }
          : item
        )
      })));
    } else {
      const newItem = { id: nextId, name: form.name, description: form.description, price: parseFloat(form.price), status: form.status, imagePreview: form.imagePreview };
      setCategories(prev => prev.map(cat =>
        cat.id === targetCatId ? { ...cat, items: [...cat.items, newItem] } : cat
      ));
      setNextId(n => n + 1);
      setSelectedCatId(targetCatId);
    }

    resetForm();
    setCurrentPage(1);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({ category: selectedCategory?.name || "", newCategory: "", name: item.name, description: item.description, price: String(item.price), status: item.status, image: null, imagePreview: item.imagePreview || null });
    setFormErrors({});
    setFormCollapsed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (itemId) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.filter(i => i.id !== itemId)
    })));
    setCurrentPage(1);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const exists = categories.find(c => c.name.toLowerCase() === newCatName.trim().toLowerCase());
    if (!exists) {
      const newCat = { id: nextId + 2000, name: newCatName.trim(), image: "🍽️", items: [] };
      setCategories(prev => [...prev, newCat]);
      setSelectedCatId(newCat.id);
      setNextId(n => n + 2001);
    }
    setNewCatName("");
    setShowAddCatModal(false);
  };

  const handleSelectCategory = (catId) => {
    setSelectedCatId(catId);
    setCurrentPage(1);
    setSearchQuery("");
    setStatusFilter("All Status");
  };

  const totalItems = selectedCategory?.items?.length || 0;

  return (
    <div className="mc-root">
      {showAddCatModal && (
        <div className="mc-modal-overlay" onClick={() => setShowAddCatModal(false)}>
          <div className="mc-modal" onClick={e => e.stopPropagation()}>
            <div className="mc-modal-head">
              <span className="mc-modal-title">Add New Category</span>
              <button className="mc-modal-close" onClick={() => setShowAddCatModal(false)} type="button"><X size={18} /></button>
            </div>
            <div className="mc-modal-body">
              <label className="mc-label">Category Name <span className="mc-req">*</span></label>
              <input
                className="mc-input"
                type="text"
                placeholder="e.g. Cold Brews"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddCategory()}
                autoFocus
              />
            </div>
            <div className="mc-modal-foot">
              <button className="mc-btn-ghost" onClick={() => setShowAddCatModal(false)} type="button">Cancel</button>
              <button className="mc-btn-dark" onClick={handleAddCategory} type="button"><Check size={15} /> Save Category</button>
            </div>
          </div>
        </div>
      )}

      <div className="mc-page-header">
        <div className="mc-breadcrumb">
          <span className="mc-bc-link">Dashboard</span>
          <ChevronRight size={14} className="mc-bc-sep" />
          <span className="mc-bc-current">Menu &amp; Category</span>
        </div>
        <div className="mc-page-title-row">
          <div>
            <h1 className="mc-page-title">Menu &amp; Category</h1>
            <p className="mc-page-sub">Manage your coffee menu categories and items</p>
          </div>
          <button className="mc-btn-dark mc-add-btn" onClick={() => setShowAddCatModal(true)} type="button">
            <Coffee size={16} /> Add Category / Item
          </button>
        </div>
      </div>

      <div className="mc-layout">
        <aside className="mc-sidebar">
          <div className="mc-sidebar-head">
            <span className="mc-sidebar-title">Categories</span>
            <button className="mc-btn-outline-sm" onClick={() => setShowAddCatModal(true)} type="button">
              <Plus size={14} /> Add Category
            </button>
          </div>

          <div className="mc-cat-list">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`mc-cat-item ${selectedCatId === cat.id ? "mc-cat-active" : ""}`}
                onClick={() => handleSelectCategory(cat.id)}
                type="button"
              >
                <div className="mc-cat-img">{cat.image}</div>
                <div className="mc-cat-info">
                  <div className="mc-cat-name">{cat.name}</div>
                  <div className="mc-cat-count">{cat.items.length} Items</div>
                </div>
                <ChevronRight size={16} className="mc-cat-arrow" />
              </button>
            ))}
            <button className="mc-cat-item mc-cat-addons" onClick={() => setShowAddCatModal(true)} type="button">
              <div className="mc-cat-img mc-cat-img-plus"><Plus size={18} /></div>
              <div className="mc-cat-info">
                <div className="mc-cat-name">Add-ons</div>
                <div className="mc-cat-count">New category</div>
              </div>
              <ChevronRight size={16} className="mc-cat-arrow" />
            </button>
          </div>

          <button className="mc-view-all-btn" type="button">
            View All Categories <ArrowRight size={15} />
          </button>
        </aside>

        <div className="mc-main">
          <div className="mc-form-panel">
            <div className="mc-form-head">
              <h2 className="mc-form-title">{editingItem ? `Edit: ${editingItem.name}` : "Add New Item"}</h2>
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
                        value={form.category}
                        onChange={e => { setForm(f => ({ ...f, category: e.target.value, newCategory: "" })); setFormErrors(er => ({ ...er, category: "" })); }}
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
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
                      placeholder="Add New Category"
                      value={form.newCategory}
                      onChange={e => { setForm(f => ({ ...f, newCategory: e.target.value, category: "" })); setFormErrors(er => ({ ...er, category: "" })); }}
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
                        onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormErrors(er => ({ ...er, name: "" })); }}
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
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="mc-form-row">
                  <div className="mc-form-group mc-fg-half">
                    <label className="mc-label">Item Image <span className="mc-req">*</span></label>
                    <div
                      className="mc-upload-zone"
                      onClick={() => imageRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === "Enter" && imageRef.current?.click()}
                    >
                      <input ref={imageRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                      {form.imagePreview ? (
                        <img src={form.imagePreview} alt="preview" className="mc-upload-preview" />
                      ) : (
                        <>
                          <Upload size={24} className="mc-upload-icon" />
                          <span className="mc-upload-text">Click to upload</span>
                          <span className="mc-upload-hint">PNG, JPG up to 5MB</span>
                        </>
                      )}
                    </div>
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
                        onChange={e => { setForm(f => ({ ...f, price: e.target.value })); setFormErrors(er => ({ ...er, price: "" })); }}
                      />
                    </div>
                    {formErrors.price && <span className="mc-field-err">{formErrors.price}</span>}

                    <label className="mc-label" style={{ marginTop: "14px" }}>Status</label>
                    <div className="mc-select-wrap">
                      <select className="mc-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <ChevronDown size={15} className="mc-select-icon" />
                    </div>
                  </div>
                </div>

                <div className="mc-form-actions">
                  <button className="mc-btn-reset" onClick={resetForm} type="button">
                    <RotateCcw size={14} /> Reset
                  </button>
                  <button className="mc-btn-dark mc-save-btn" onClick={handleSaveItem} type="button">
                    <Send size={14} /> {editingItem ? "Update Item" : "Save Item"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mc-items-panel">
            <div className="mc-items-head">
              <h3 className="mc-items-title">
                Items in {selectedCategory?.name || "—"} ({totalItems})
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
                <button className="mc-icon-btn" type="button" aria-label="Filter"><Filter size={16} /></button>
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
                  {pagedItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="mc-empty">
                        {searchQuery || statusFilter !== "All Status" ? "No items match your search." : "No items yet. Add your first item above!"}
                      </td>
                    </tr>
                  ) : (
                    pagedItems.map(item => (
                      <tr key={item.id} className="mc-tr">
                        <td className="mc-td">
                          <div className="mc-item-cell">
                            <div className="mc-item-thumb">
                              {item.imagePreview
                                ? <img src={item.imagePreview} alt={item.name} className="mc-thumb-img" />
                                : <span className="mc-thumb-emoji">☕</span>
                              }
                            </div>
                            <span className="mc-item-name">{item.name}</span>
                          </div>
                        </td>
                        <td className="mc-td mc-td-desc">{item.description || "—"}</td>
                        <td className="mc-td mc-td-price">₹{Number(item.price).toFixed(2)}</td>
                        <td className="mc-td">
                          <span className={`mc-status-badge ${item.status === "Active" ? "mc-status-active" : "mc-status-inactive"}`}>
                            <span className="mc-status-dot" />
                            {item.status}
                          </span>
                        </td>
                        <td className="mc-td mc-td-actions">
                          <button className="mc-action-edit" onClick={() => handleEdit(item)} type="button">
                            <Pencil size={13} /> Edit
                          </button>
                          <button className="mc-action-delete" onClick={() => handleDelete(item.id)} type="button">
                            <Trash2 size={13} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredItems.length > 0 && (
              <div className="mc-pagination">
                <span className="mc-pg-info">
                  Showing {Math.min((safeCurrentPage - 1) * ITEMS_PER_PAGE + 1, filteredItems.length)} to {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} items
                </span>
                <div className="mc-pg-controls">
                  <button
                    className="mc-pg-btn"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={safeCurrentPage === 1}
                    type="button"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                    <button
                      key={pg}
                      className={`mc-pg-btn ${safeCurrentPage === pg ? "mc-pg-active" : ""}`}
                      onClick={() => setCurrentPage(pg)}
                      type="button"
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    className="mc-pg-btn"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage === totalPages}
                    type="button"
                    aria-label="Next page"
                  >
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
}
export default MenuCategory;