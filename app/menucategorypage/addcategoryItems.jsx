"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Trash2, Pencil, X, Check, Upload, Loader2,
  ChevronDown, ChevronUp, Image, GripVertical, Tag,
  Layers, Package, RefreshCw, Save,
} from "lucide-react";
import api from "../services/axiosInterceptor";
import { uploadSuggestionCategoryImage, uploadSuggestionItemImage } from "../services/imageservice";

function getUser() {
  try { const s = localStorage.getItem("ttl_user"); return s ? JSON.parse(s) : null; }
  catch { return null; }
}

function Toast({ msg, type }) {
  return (
    <div style={{
      position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)",
      background: type==="error" ? "#dc2626" : "#18181b",
      color:"#fff", padding:"11px 24px", borderRadius:30,
      fontSize:13.5, fontWeight:600, zIndex:9999,
      boxShadow:"0 4px 20px rgba(0,0,0,0.18)", whiteSpace:"nowrap",
      animation:"aci-toastIn 0.25s ease",
    }}>
      <style>{`@keyframes aci-toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes aci-spin{to{transform:rotate(360deg)}}`}</style>
      {msg}
    </div>
  );
}

function ImgUpload({ value, onChange, uploading, onUpload, label = "Upload Image" }) {
  const ref = useRef();
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <input ref={ref} type="file" accept="image/*" style={{ display:"none" }}
        onChange={e => { const f = e.target.files[0]; if (f) onUpload(f); e.target.value=""; }}/>
      {value ? (
        <div style={{ position:"relative", flexShrink:0 }}>
          <img src={value} alt="preview" style={{ width:44, height:44, objectFit:"cover", borderRadius:9, border:"1.5px solid #e4e4e7" }}/>
          <button type="button" onClick={()=>onChange(null)}
            style={{ position:"absolute", top:-7, right:-7, width:18, height:18, borderRadius:"50%", background:"#ef4444", border:"2px solid #fff", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", padding:0 }}>
            <X size={10}/>
          </button>
        </div>
      ) : (
        <button type="button" onClick={()=>ref.current?.click()}
          style={{ width:44, height:44, borderRadius:9, border:"1.5px dashed #d4d4d8", background:"#fafaf9", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#a1a1aa", flexShrink:0 }}>
          {uploading ? <Loader2 size={15} style={{ animation:"aci-spin .7s linear infinite" }}/> : <Image size={15}/>}
        </button>
      )}
      <div>
        <button type="button" onClick={()=>ref.current?.click()}
          style={{ fontSize:12, color:"#635bff", background:"none", border:"none", cursor:"pointer", fontWeight:600, padding:0, display:"flex", alignItems:"center", gap:4 }}>
          <Upload size={11}/>{uploading ? "Uploading..." : label}
        </button>
        <div style={{ fontSize:10.5, color:"#a1a1aa", marginTop:1 }}>PNG, JPG up to 5MB</div>
      </div>
    </div>
  );
}

const BUSINESS_TYPES = [
  "Restaurant","Cafe","Bakery","Fast Food","Pizza","Biryani",
  "South Indian","North Indian","Chinese","Continental",
  "Juice Bar","Ice Cream Parlour","Sweet Shop","Dhaba","Food Truck",
];

const AddCategoryItems = () => {
  const user         = getUser();
  const businessType = user?.businessType || "";

  const [selectedBType,  setSelectedBType]  = useState(businessType || BUSINESS_TYPES[0]);
  const [categories,     setCategories]     = useState([]);
  const [items,          setItems]          = useState([]);
  const [loadingCats,    setLoadingCats]    = useState(false);
  const [loadingItems,   setLoadingItems]   = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [deletingId,     setDeletingId]     = useState(null);
  const [activeTab,      setActiveTab]      = useState("categories");
  const [selectedCatForItems, setSelectedCatForItems] = useState("");
  const [toast,          setToast]          = useState(null);
  const [editingCat,     setEditingCat]     = useState(null);
  const [editingItem,    setEditingItem]    = useState(null);
  const [catImgUploading,setCatImgUploading]= useState(false);
  const [itemImgUploading,setItemImgUploading]= useState(false);

  const [catForm, setCatForm] = useState({ categoryName:"", categoryEmoji:"", displayOrder:"", categoryImage:null });
  const [itemForm, setItemForm] = useState({ categoryName:"", itemName:"", displayOrder:"", itemImage:null });

  const showToast = useCallback((msg, type="success") => {
    setToast({msg,type}); setTimeout(()=>setToast(null), 3000);
  }, []);

  const fetchCategories = useCallback(async (btype) => {
    setLoadingCats(true);
    try {
      const res = await api.get(`/api/suggestions/categories/public?businessType=${encodeURIComponent(btype)}`);
      setCategories(res.data?.data || []);
    } catch { showToast("Failed to load categories","error"); }
    finally { setLoadingCats(false); }
  }, [showToast]);

  const fetchItems = useCallback(async (btype, catName) => {
    if (!catName) { setItems([]); return; }
    setLoadingItems(true);
    try {
      const res = await api.get(`/api/suggestions/items/public?businessType=${encodeURIComponent(btype)}&categoryName=${encodeURIComponent(catName)}`);
      setItems(res.data?.data || []);
    } catch { showToast("Failed to load items","error"); }
    finally { setLoadingItems(false); }
  }, [showToast]);

  useEffect(() => { fetchCategories(selectedBType); }, [selectedBType, fetchCategories]);
  // When switching to items tab, load all items for first category if none selected
  useEffect(() => {
    if (activeTab==="items") {
      if (selectedCatForItems) {
        fetchItems(selectedBType, selectedCatForItems);
      } else if (categories.length > 0) {
        const first = categories[0].categoryName;
        setSelectedCatForItems(first);
        setItemForm(p=>({...p, categoryName: first}));
        fetchItems(selectedBType, first);
      }
    }
  }, [activeTab, selectedCatForItems, selectedBType]);

  // Also re-fetch when categories load on items tab
  useEffect(() => {
    if (activeTab==="items" && categories.length > 0 && !selectedCatForItems) {
      const first = categories[0].categoryName;
      setSelectedCatForItems(first);
      setItemForm(p=>({...p, categoryName: first}));
      fetchItems(selectedBType, first);
    }
  }, [categories]);

  const handleCatImgUpload = async (file) => {
    setCatImgUploading(true);
    try {
      const res = await uploadSuggestionCategoryImage(file);
      setCatForm(p=>({...p, categoryImage: res.data?.data?.imageUrl || res.data?.imageUrl || null}));
    } catch { showToast("Failed to upload image","error"); }
    finally { setCatImgUploading(false); }
  };

  const handleItemImgUpload = async (file) => {
    setItemImgUploading(true);
    try {
      const res = await uploadSuggestionItemImage(file);
      setItemForm(p=>({...p, itemImage: res.data?.data?.imageUrl || res.data?.imageUrl || null}));
    } catch { showToast("Failed to upload image","error"); }
    finally { setItemImgUploading(false); }
  };

  const handleSaveCategory = async () => {
    if (!catForm.categoryName.trim()) { showToast("Category name is required","error"); return; }
    setSaving(true);
    try {
      const payload = {
        businessType:      selectedBType,
        categoryName:      catForm.categoryName.trim(),
        categoryEmoji:     catForm.categoryEmoji.trim() || null,
        displayOrder:      catForm.displayOrder ? parseInt(catForm.displayOrder) : null,
        categoryImage:     catForm.categoryImage || null,
        categoryImageType: catForm.categoryImage ? "image" : null,
      };
      if (editingCat) {
        await api.put(`/api/suggestions/categories/${editingCat.id}`, payload);
        showToast("Category updated! ✓");
      } else {
        await api.post("/api/suggestions/categories", payload);
        showToast("Category added! ✓");
      }
      setCatForm({ categoryName:"", categoryEmoji:"", displayOrder:"", categoryImage:null });
      setEditingCat(null);
      fetchCategories(selectedBType);
    } catch(e) { showToast(e.response?.data?.message || "Failed to save","error"); }
    finally { setSaving(false); }
  };

  const handleSaveItem = async () => {
    if (!itemForm.categoryName.trim()) { showToast("Category name is required","error"); return; }
    if (!itemForm.itemName.trim())     { showToast("Item name is required","error"); return; }
    setSaving(true);
    try {
      const payload = {
        businessType:  selectedBType,
        categoryName:  itemForm.categoryName.trim(),
        itemName:      itemForm.itemName.trim(),
        displayOrder:  itemForm.displayOrder ? parseInt(itemForm.displayOrder) : null,
        itemImage:     itemForm.itemImage || null,
        itemImageType: itemForm.itemImage ? "image" : null,
      };
      if (editingItem) {
        await api.put(`/api/suggestions/items/${editingItem.id}`, payload);
        showToast("Item updated! ✓");
      } else {
        await api.post("/api/suggestions/items", payload);
        showToast("Item added! ✓");
      }
      setItemForm({ categoryName: itemForm.categoryName, itemName:"", displayOrder:"", itemImage:null });
      setEditingItem(null);
      if (selectedCatForItems) fetchItems(selectedBType, selectedCatForItems);
    } catch(e) { showToast(e.response?.data?.message || "Failed to save","error"); }
    finally { setSaving(false); }
  };

  const handleDeleteCat = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/api/suggestions/categories/${id}`);
      showToast("Category deleted.");
      fetchCategories(selectedBType);
    } catch(e) { showToast(e.response?.data?.message || "Failed to delete","error"); }
    finally { setDeletingId(null); }
  };

  const handleDeleteItem = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/api/suggestions/items/${id}`);
      showToast("Item deleted.");
      if (selectedCatForItems) fetchItems(selectedBType, selectedCatForItems);
    } catch(e) { showToast(e.response?.data?.message || "Failed to delete","error"); }
    finally { setDeletingId(null); }
  };

  const startEditCat = (cat) => {
    setEditingCat(cat);
    setCatForm({ categoryName:cat.categoryName, categoryEmoji:cat.categoryEmoji||"", displayOrder:cat.displayOrder||"", categoryImage:cat.categoryImage||null });
    window.scrollTo({top:0, behavior:"smooth"});
  };

  const startEditItem = (item) => {
    setEditingItem(item);
    setItemForm({ categoryName:item.categoryName, itemName:item.itemName, displayOrder:item.displayOrder||"", itemImage:item.itemImage||null });
    window.scrollTo({top:0, behavior:"smooth"});
  };

  const ib = "block w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition";
  const lb = "block text-xs font-semibold text-gray-600 mb-1.5";
  const tabActive   = "px-4 py-2 text-sm font-700 rounded-lg bg-gray-900 text-white transition";
  const tabInactive = "px-4 py-2 text-sm font-600 rounded-lg text-gray-500 hover:bg-gray-100 transition cursor-pointer";

  return (
    <div style={{ padding:"24px 0", maxWidth:900, margin:"0 auto" }}>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:20, fontWeight:800, color:"#111", margin:0, letterSpacing:"-0.4px" }}>
          Customize Categories &amp; Items
        </h2>
        <p style={{ fontSize:13, color:"#71717a", margin:"6px 0 0" }}>
          Add default categories and items that appear as suggestions when creating menus
        </p>
      </div>

      {/* Business Type Selector */}
      <div style={{ background:"#fff", border:"1.5px solid #e4e4e7", borderRadius:12, padding:"16px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ flexShrink:0 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:5 }}>Business Type</div>
          <select
            value={selectedBType}
            onChange={e=>{ setSelectedBType(e.target.value); setSelectedCatForItems(""); setItems([]); }}
            style={{ fontSize:13.5, fontWeight:600, color:"#111", background:"#f4f4f5", border:"1.5px solid #e4e4e7", borderRadius:8, padding:"8px 32px 8px 12px", cursor:"pointer", appearance:"none", WebkitAppearance:"none", minWidth:200 }}
          >
            {BUSINESS_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ height:40, width:1, background:"#f0f0f0" }}/>
        <div style={{ display:"flex", gap:6 }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, fontWeight:600, color:"#635bff", background:"#ede9fe", padding:"4px 10px", borderRadius:20 }}>
            <Layers size={11}/>{categories.length} Categories
          </span>
          <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, fontWeight:600, color:"#059669", background:"#d1fae5", padding:"4px 10px", borderRadius:20 }}>
            <Package size={11}/>{items.length} Items
          </span>
        </div>
        <button onClick={()=>fetchCategories(selectedBType)} style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:600, color:"#6b7280", background:"none", border:"1.5px solid #e4e4e7", borderRadius:8, padding:"6px 12px", cursor:"pointer" }}>
          <RefreshCw size={12}/> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:20, background:"#f9f9f9", padding:4, borderRadius:10, width:"fit-content" }}>
        <button className={activeTab==="categories"?tabActive:tabInactive} onClick={()=>setActiveTab("categories")}
          style={{ border:"none", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6,
            background:activeTab==="categories"?"#111":"transparent", color:activeTab==="categories"?"#fff":"#6b7280", padding:"8px 18px", borderRadius:8 }}>
          <Layers size={14}/> Categories ({categories.length})
        </button>
        <button className={activeTab==="items"?tabActive:tabInactive} onClick={()=>setActiveTab("items")}
          style={{ border:"none", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6,
            background:activeTab==="items"?"#111":"transparent", color:activeTab==="items"?"#fff":"#6b7280", padding:"8px 18px", borderRadius:8 }}>
          <Package size={14}/> Items ({items.length})
        </button>
      </div>

      {/* ── CATEGORIES TAB ── */}
      {activeTab==="categories" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, alignItems:"start" }}>
          {/* Add/Edit Form */}
          <div style={{ background:"#fff", border:"1.5px solid #e4e4e7", borderRadius:14, padding:"20px", position:"sticky", top:20 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <h3 style={{ fontSize:14, fontWeight:800, color:"#111", margin:0 }}>
                {editingCat ? "Edit Category" : "Add Category"}
              </h3>
              {editingCat && (
                <button onClick={()=>{setEditingCat(null);setCatForm({categoryName:"",categoryEmoji:"",displayOrder:"",categoryImage:null});}}
                  style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af", display:"flex" }}>
                  <X size={16}/>
                </button>
              )}
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>
                  Category Image
                </label>
                <ImgUpload
                  value={catForm.categoryImage}
                  onChange={v=>setCatForm(p=>({...p,categoryImage:v}))}
                  uploading={catImgUploading}
                  onUpload={handleCatImgUpload}
                  label="Upload category image"
                />
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>
                  Category Name *
                </label>
                <input type="text" placeholder="e.g. Starters, Main Course..."
                  value={catForm.categoryName}
                  onChange={e=>setCatForm(p=>({...p,categoryName:e.target.value}))}
                  style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e4e4e7", fontSize:13.5, outline:"none", boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor="#635bff"} onBlur={e=>e.target.style.borderColor="#e4e4e7"}
                />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>
                    Emoji (Optional)
                  </label>
                  <input type="text" placeholder="🍕"
                    value={catForm.categoryEmoji}
                    onChange={e=>setCatForm(p=>({...p,categoryEmoji:e.target.value}))}
                    style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e4e4e7", fontSize:20, textAlign:"center", outline:"none", boxSizing:"border-box" }}
                    onFocus={e=>e.target.style.borderColor="#635bff"} onBlur={e=>e.target.style.borderColor="#e4e4e7"}
                  />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>
                    Display Order
                  </label>
                  <input type="number" min="1" placeholder="1"
                    value={catForm.displayOrder}
                    onChange={e=>setCatForm(p=>({...p,displayOrder:e.target.value}))}
                    style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e4e4e7", fontSize:13.5, outline:"none", boxSizing:"border-box" }}
                    onFocus={e=>e.target.style.borderColor="#635bff"} onBlur={e=>e.target.style.borderColor="#e4e4e7"}
                  />
                </div>
              </div>

              <button onClick={handleSaveCategory} disabled={saving || catImgUploading}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"10px 0", background: saving?"#d1d5db":"#111", color:"#fff", border:"none", borderRadius:9, fontSize:13.5, fontWeight:700, cursor: saving?"not-allowed":"pointer", width:"100%", transition:"background .18s" }}>
                {saving ? <><Loader2 size={14} style={{ animation:"aci-spin .7s linear infinite" }}/> Saving...</> : <><Save size={14}/>{editingCat?"Update Category":"Add Category"}</>}
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {loadingCats ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:40, gap:10, color:"#71717a" }}>
                <Loader2 size={18} style={{ animation:"aci-spin .7s linear infinite" }}/> Loading...
              </div>
            ) : categories.length===0 ? (
              <div style={{ textAlign:"center", padding:"40px 20px", color:"#9ca3af" }}>
                <Layers size={36} strokeWidth={1.2} style={{ marginBottom:10, display:"block", margin:"0 auto 10px" }}/>
                <div style={{ fontSize:13.5, fontWeight:600, color:"#6b7280" }}>No categories yet</div>
                <div style={{ fontSize:12, marginTop:4 }}>Add your first category using the form</div>
              </div>
            ) : categories.map(cat=>(
              <div key={cat.id} style={{ background:"#fff", border:`1.5px solid ${editingCat?.id===cat.id?"#635bff":"#e4e4e7"}`, borderRadius:12, padding:"12px 14px", display:"flex", alignItems:"center", gap:12, transition:"border-color .18s" }}>
                {cat.categoryImage ? (
                  <img src={cat.categoryImage} alt={cat.categoryName} style={{ width:40, height:40, borderRadius:8, objectFit:"cover", border:"1px solid #f0f0f0", flexShrink:0 }}/>
                ) : (
                  <div style={{ width:40, height:40, borderRadius:8, background:"#f4f4f5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                    {cat.categoryEmoji || "🍽️"}
                  </div>
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13.5, fontWeight:700, color:"#111", display:"flex", alignItems:"center", gap:6 }}>
                    {cat.categoryName}
                    {cat.categoryEmoji && !cat.categoryImage && <span style={{ fontSize:16 }}>{cat.categoryEmoji}</span>}
                  </div>
                  {cat.displayOrder && <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>Order: {cat.displayOrder}</div>}
                </div>
                <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                  <button onClick={()=>startEditCat(cat)}
                    style={{ padding:"6px 8px", background:"#f4f4f5", border:"none", borderRadius:7, cursor:"pointer", color:"#635bff", display:"flex" }}>
                    <Pencil size={13}/>
                  </button>
                  <button onClick={()=>handleDeleteCat(cat.id)} disabled={deletingId===cat.id}
                    style={{ padding:"6px 8px", background:"#fee2e2", border:"none", borderRadius:7, cursor:"pointer", color:"#ef4444", display:"flex" }}>
                    {deletingId===cat.id ? <Loader2 size={13} style={{ animation:"aci-spin .7s linear infinite" }}/> : <Trash2 size={13}/>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ITEMS TAB ── */}
      {activeTab==="items" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, alignItems:"start" }}>
          {/* Add/Edit Form */}
          <div style={{ background:"#fff", border:"1.5px solid #e4e4e7", borderRadius:14, padding:"20px", position:"sticky", top:20 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <h3 style={{ fontSize:14, fontWeight:800, color:"#111", margin:0 }}>
                {editingItem ? "Edit Item" : "Add Item"}
              </h3>
              {editingItem && (
                <button onClick={()=>{setEditingItem(null);setItemForm({categoryName:itemForm.categoryName,itemName:"",displayOrder:"",itemImage:null});}}
                  style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af", display:"flex" }}>
                  <X size={16}/>
                </button>
              )}
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>
                  Category Name *
                </label>
                {/* Category select with search */}
              <div style={{ position:"relative" }}>
                <input
                  type="text"
                  placeholder="🔍 Search or type category name..."
                  value={itemForm.categoryName}
                  onChange={e=>{ setItemForm(p=>({...p,categoryName:e.target.value})); setSelectedCatForItems(e.target.value); }}
                  style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e4e4e7", fontSize:13.5, outline:"none", background:"#fff", boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor="#635bff"}
                  onBlur={e=>e.target.style.borderColor="#e4e4e7"}
                />
                {/* Dropdown list filtered by search */}
                {categories.filter(cat => cat.categoryName.toLowerCase().includes((itemForm.categoryName||"").toLowerCase())).length > 0 && itemForm.categoryName !== "" && !categories.find(c=>c.categoryName===itemForm.categoryName) && (
                  <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:300, background:"#fff", border:"1.5px solid #e4e4e7", borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", maxHeight:180, overflowY:"auto" }}>
                    {categories.filter(cat=>cat.categoryName.toLowerCase().includes((itemForm.categoryName||"").toLowerCase())).map(cat=>(
                      <button key={cat.id} type="button"
                        onMouseDown={()=>{ setItemForm(p=>({...p,categoryName:cat.categoryName})); setSelectedCatForItems(cat.categoryName); fetchItems(selectedBType, cat.categoryName); }}
                        style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 12px", border:"none", background:"transparent", fontSize:13, cursor:"pointer", textAlign:"left", borderBottom:"1px solid #f9f9f9" }}
                        onMouseOver={e=>e.currentTarget.style.background="#f9f9f9"}
                        onMouseOut={e=>e.currentTarget.style.background="transparent"}
                      >
                        {cat.categoryImage ? <img src={cat.categoryImage} alt="" style={{ width:22, height:22, borderRadius:5, objectFit:"cover" }}/> : <span style={{ fontSize:16 }}>{cat.categoryEmoji||"🍽️"}</span>}
                        {cat.categoryName}
                      </button>
                    ))}
                  </div>
                )}
                {/* Show all categories when field is empty */}
                {itemForm.categoryName === "" && categories.length > 0 && (
                  <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:300, background:"#fff", border:"1.5px solid #e4e4e7", borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", maxHeight:180, overflowY:"auto" }}>
                    <div style={{ padding:"6px 12px 4px", fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:"1px solid #f4f4f5" }}>All Categories</div>
                    {categories.map(cat=>(
                      <button key={cat.id} type="button"
                        onMouseDown={()=>{ setItemForm(p=>({...p,categoryName:cat.categoryName})); setSelectedCatForItems(cat.categoryName); fetchItems(selectedBType, cat.categoryName); }}
                        style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 12px", border:"none", background:"transparent", fontSize:13, cursor:"pointer", textAlign:"left", borderBottom:"1px solid #f9f9f9" }}
                        onMouseOver={e=>e.currentTarget.style.background="#f9f9f9"}
                        onMouseOut={e=>e.currentTarget.style.background="transparent"}
                      >
                        {cat.categoryImage ? <img src={cat.categoryImage} alt="" style={{ width:22, height:22, borderRadius:5, objectFit:"cover" }}/> : <span style={{ fontSize:16 }}>{cat.categoryEmoji||"🍽️"}</span>}
                        {cat.categoryName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>
                  Item Image
                </label>
                <ImgUpload
                  value={itemForm.itemImage}
                  onChange={v=>setItemForm(p=>({...p,itemImage:v}))}
                  uploading={itemImgUploading}
                  onUpload={handleItemImgUpload}
                  label="Upload item image"
                />
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>
                  Item Name *
                </label>
                <input type="text" placeholder="e.g. Butter Chicken, Paneer Tikka..."
                  value={itemForm.itemName}
                  onChange={e=>setItemForm(p=>({...p,itemName:e.target.value}))}
                  style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e4e4e7", fontSize:13.5, outline:"none", boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor="#635bff"} onBlur={e=>e.target.style.borderColor="#e4e4e7"}
                />
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>
                  Display Order
                </label>
                <input type="number" min="1" placeholder="1"
                  value={itemForm.displayOrder}
                  onChange={e=>setItemForm(p=>({...p,displayOrder:e.target.value}))}
                  style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #e4e4e7", fontSize:13.5, outline:"none", boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor="#635bff"} onBlur={e=>e.target.style.borderColor="#e4e4e7"}
                />
              </div>

              <button onClick={handleSaveItem} disabled={saving || itemImgUploading}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"10px 0", background: saving?"#d1d5db":"#111", color:"#fff", border:"none", borderRadius:9, fontSize:13.5, fontWeight:700, cursor: saving?"not-allowed":"pointer", width:"100%", transition:"background .18s" }}>
                {saving ? <><Loader2 size={14} style={{ animation:"aci-spin .7s linear infinite" }}/> Saving...</> : <><Save size={14}/>{editingItem?"Update Item":"Add Item"}</>}
              </button>
            </div>
          </div>

          {/* Items List */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {/* Filter by category */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:4 }}>
              {categories.map(c=>(
                <button key={c.id} onClick={()=>{ setSelectedCatForItems(c.categoryName); setItemForm(p=>({...p,categoryName:c.categoryName})); }}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:20, border:`1.5px solid ${selectedCatForItems===c.categoryName?"#635bff":"#e4e4e7"}`, background:selectedCatForItems===c.categoryName?"#ede9fe":"#fff", fontSize:12, fontWeight:600, color:selectedCatForItems===c.categoryName?"#635bff":"#6b7280", cursor:"pointer" }}>
                  {c.categoryEmoji && <span style={{ fontSize:14 }}>{c.categoryEmoji}</span>}
                  {c.categoryName}
                </button>
              ))}
            </div>

            {!selectedCatForItems ? (
              <div style={{ textAlign:"center", padding:"40px 20px", color:"#9ca3af" }}>
                <Tag size={36} strokeWidth={1.2} style={{ marginBottom:10, display:"block", margin:"0 auto 10px" }}/>
                <div style={{ fontSize:13.5, fontWeight:600, color:"#6b7280" }}>Select a category to view items</div>
              </div>
            ) : loadingItems ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:40, gap:10, color:"#71717a" }}>
                <Loader2 size={18} style={{ animation:"aci-spin .7s linear infinite" }}/> Loading items...
              </div>
            ) : items.length===0 ? (
              <div style={{ textAlign:"center", padding:"40px 20px", color:"#9ca3af" }}>
                <Package size={36} strokeWidth={1.2} style={{ marginBottom:10, display:"block", margin:"0 auto 10px" }}/>
                <div style={{ fontSize:13.5, fontWeight:600, color:"#6b7280" }}>No items in "{selectedCatForItems}"</div>
                <div style={{ fontSize:12, marginTop:4 }}>Add items using the form</div>
              </div>
            ) : items.map(item=>(
              <div key={item.id} style={{ background:"#fff", border:`1.5px solid ${editingItem?.id===item.id?"#635bff":"#e4e4e7"}`, borderRadius:12, padding:"12px 14px", display:"flex", alignItems:"center", gap:12, transition:"border-color .18s" }}>
                {item.itemImage ? (
                  <img src={item.itemImage} alt={item.itemName} style={{ width:40, height:40, borderRadius:8, objectFit:"cover", border:"1px solid #f0f0f0", flexShrink:0 }}/>
                ) : (
                  <div style={{ width:40, height:40, borderRadius:8, background:"#f4f4f5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🍽️</div>
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13.5, fontWeight:700, color:"#111" }}>{item.itemName}</div>
                  <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>
                    {item.categoryName}{item.displayOrder ? ` · Order ${item.displayOrder}` : ""}
                  </div>
                </div>
                <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                  <button onClick={()=>startEditItem(item)}
                    style={{ padding:"6px 8px", background:"#f4f4f5", border:"none", borderRadius:7, cursor:"pointer", color:"#635bff", display:"flex" }}>
                    <Pencil size={13}/>
                  </button>
                  <button onClick={()=>handleDeleteItem(item.id)} disabled={deletingId===item.id}
                    style={{ padding:"6px 8px", background:"#fee2e2", border:"none", borderRadius:7, cursor:"pointer", color:"#ef4444", display:"flex" }}>
                    {deletingId===item.id ? <Loader2 size={13} style={{ animation:"aci-spin .7s linear infinite" }}/> : <Trash2 size={13}/>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCategoryItems;