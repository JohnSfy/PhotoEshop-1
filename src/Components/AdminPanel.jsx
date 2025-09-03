import React, { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Image, Package, Users, DollarSign, Trash2, Eye, Plus, Tag, Save } from "lucide-react";
import { usePhotos } from "../../Context/PhotoContext";
import { useLanguage } from "../../Context/LanguageContext";
import "../Styles/AdminPanel.css";

const AdminPanel = () => {
  console.log("🏗️ AdminPanel component rendering...");
  
  try {
    const {
      photos,
      categories,
      fetchPhotos,
      fetchCategories,
      uploadPhotos,
      updatePhoto,
      deletePhotos,
      createCategory,
      removeCategory,
      loading,
      error,
    } = usePhotos();
    const { t } = useLanguage();
    
    console.log("✅ AdminPanel hooks loaded successfully");

  const [activeTab, setActiveTab] = useState("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [orders, setOrders] = useState([]);

  // Upload controls (MULTIPLE ONLY)
  const multiFilesRef = useRef(null);
  const [multiCategory, setMultiCategory] = useState("");
  const [multiPrice, setMultiPrice] = useState(""); // € applied to all files

  // Gallery controls
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Category admin
  const [newCategoryName, setNewCategoryName] = useState("");
  const [deleteCategoryName, setDeleteCategoryName] = useState("");

  // Local editing state per photo (price/category)
  const [edits, setEdits] = useState({}); // { [photoId]: { price, category } }

  useEffect(() => {
    fetchCategories();
    fetchPhotos();
  }, []); // eslint-disable-line

  const visible = useMemo(() => {
    let out = photos || [];
    if (selectedCategory) out = out.filter((p) => (p.category || "") === selectedCategory);
    return out;
  }, [photos, selectedCategory]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  const selectAll = () => {
    const allIds = new Set(visible.map(p => p.id));
    setSelectedIds(allIds);
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const isAllSelected = visible.length > 0 && selectedIds.size === visible.length;
  const isSomeSelected = selectedIds.size > 0;

  // -------- MULTIPLE Upload Handler (μόνη επιλογή) --------
  const handleMultiUpload = async (e) => {
    e.preventDefault();
    const files = multiFilesRef.current?.files;
    if (!files || files.length === 0) return setUploadError(t('pleaseChooseAtLeastOnePhoto'));
    if (!multiCategory) return setUploadError(t('pleaseSelectCategory'));

    const priceNum = parsePrice(multiPrice);
    if (priceNum == null || priceNum < 0) return setUploadError(t('pleaseEnterValidPrice'));

    // Additional validation
    if (!multiCategory || multiCategory.trim() === "") {
      return setUploadError(t('pleaseSelectCategory'));
    }
    if (!multiPrice || multiPrice.trim() === "") {
      return setUploadError(t('pleaseEnterPrice'));
    }

    try {
      fakeProgress(setUploadProgress, setIsUploading);

      const cats = Array.from(files).map(() => multiCategory);
      const prices = Array.from(files).map(() => String(priceNum));

      // Debug logging
      console.log("🔍 Upload Debug Info:");
      console.log("Selected Category:", multiCategory);
      console.log("Selected Price:", priceNum);
      console.log("Raw Price Input:", multiPrice);
      console.log("Categories Array:", cats);
      console.log("Prices Array:", prices);
      console.log("Files Count:", files.length);
      
      // Validation check
      if (!multiCategory || multiCategory.trim() === "") {
        throw new Error("Category is empty!");
      }
      if (!priceNum || priceNum <= 0) {
        throw new Error("Price is invalid!");
      }
      if (cats.length === 0 || prices.length === 0) {
        throw new Error("Categories or prices array is empty!");
      }
      
      console.log("✅ Validation passed - sending to server");

      // Use the uploadPhotos function which handles FormData internally
      await uploadPhotos({ files, categories: cats, prices });

      endProgress(setUploadProgress, setUploadSuccess,
        `Uploaded ${files.length} photos to "${multiCategory}" at ${fmtEUR(priceNum)} each!`
      );
      multiFilesRef.current.value = "";
      // Don't reset category immediately - let user see the selection
      // setMultiCategory("");
      setMultiPrice("");
      fetchPhotos(); // για να δεις άμεσα price/category ενημερωμένα
      fetchCategories(); // Refresh categories list
    } catch (err) {
      failProgress(setIsUploading, setUploadError, err);
    }
  };

  // -------- Photo row editing --------
  const setEditField = (id, field, value) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const savePhotoEdits = async (id) => {
    const draft = edits[id] ?? {};
    const payload = {};

    // τιμή
    if ("price" in draft && String(draft.price).trim() !== "") {
      const priceNum = parsePrice(draft.price);
      if (priceNum == null || priceNum < 0) {
        alert("Δώσε έγκυρη τιμή (π.χ. 5,99)");
        return;
      }
      payload.price = Number(priceNum.toFixed(2)); // προαιρετικό rounding στα 2 δεκαδικά
    }

    // κατηγορία
    if ("category" in draft) {
      payload.category = draft.category ?? "";
    }

    if (Object.keys(payload).length === 0) return;

    try {
      await updatePhoto(id, payload);
      setEdits((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Αποτυχία αποθήκευσης");
    }
  };


  const deleteOne = async (id) => {
    console.log("🗑️ Individual delete triggered for ID:", id);
    
    if (!window.confirm(t('deleteThisPhoto'))) {
      console.log("❌ User cancelled individual deletion");
      return;
    }
    
    try {
      console.log("🚀 Starting individual delete with ID:", id);
      await deletePhotos([id]);
      console.log("✅ Individual delete successful");
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error("❌ Individual delete failed:", error);
      alert(t('deleteFailed') + ": " + (error.message || error));
    }
  };

  const bulkDelete = async () => {
    console.log("🗑️ Bulk delete triggered");
    console.log("Selected IDs:", selectedIds);
    console.log("Selected count:", selectedIds.size);
    
    if (selectedIds.size === 0) {
      console.log("❌ No photos selected");
      return;
    }
    
    const confirmMessage = t('deleteSelectedPhotos').replace('{count}', selectedIds.size);
    if (!window.confirm(confirmMessage)) {
      console.log("❌ User cancelled deletion");
      return;
    }
    
    try {
      console.log("🚀 Starting bulk delete with IDs:", Array.from(selectedIds));
      await deletePhotos(Array.from(selectedIds));
      console.log("✅ Bulk delete successful");
      clearSelection();
      
      // Show success message
      const successMessage = t('bulkDeleteSuccess').replace('{count}', selectedIds.size);
      alert(successMessage);
    } catch (error) {
      console.error("❌ Bulk delete failed:", error);
      alert(t('bulkDeleteFailed') + ": " + (error.message || error));
    }
  };

  // Delete all photos from a specific category
  const deleteAllPhotosFromCategory = async (categoryName) => {
    console.log("🗑️ Delete all photos from category triggered:", categoryName);
    
    // Get all photos from this category
    const photosInCategory = photos.filter(p => (p.category || "").trim() === categoryName.trim());
    console.log("📋 Photos in category:", photosInCategory);
    
    if (photosInCategory.length === 0) {
      alert(t('noPhotosInCategory').replace('{category}', categoryName));
      return;
    }
    
    const confirmMessage = t('deleteAllPhotosFromCategory').replace('{count}', photosInCategory.length).replace('{category}', categoryName);
    if (!window.confirm(confirmMessage)) {
      console.log("❌ User cancelled category deletion");
      return;
    }
    
    try {
      console.log("🚀 Starting delete all photos from category:", categoryName);
      const photoIds = photosInCategory.map(p => p.id);
      console.log("📋 Photo IDs to delete:", photoIds);
      
      await deletePhotos(photoIds);
      console.log("✅ Delete all photos from category successful");
      
      // Show success message
      const successMessage = t('deleteAllPhotosFromCategorySuccess').replace('{count}', photosInCategory.length).replace('{category}', categoryName);
      alert(successMessage);
    } catch (error) {
      console.error("❌ Delete all photos from category failed:", error);
      alert(t('deleteAllPhotosFromCategoryFailed') + ": " + (error.message || error));
    }
  };

  // -------- Orders (mock demo) --------
  const fetchOrders = async () => {
    setOrders([
      {
        id: "1",
        customerEmail: "john@example.com",
        customerName: t('johnDoe'),
        totalAmount: 29.95,
        photoCount: 5,
        status: "completed",
        createdAt: new Date().toISOString(),
        photos: photos.slice(0, 5),
      },
    ]);
  };

  // --- price helpers ---
  const fmtEUR = (v) => {
    const n = Number(v);
    if (Number.isNaN(n)) return "";
    return new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(n);
  };

  const parsePrice = (raw) => {
    if (raw == null) return null;
    const normalized = String(raw).trim().replace(",", ".").replace(/\s+/g, "");
    const n = Number(normalized);
    return Number.isNaN(n) ? null : n;
  };

  const tabs = [
    { id: "upload", label: t('uploadMultipleOnly'), icon: Upload },
    { id: "gallery", label: t('manageGallery'), icon: Image },
    { id: "categories", label: t('categories'), icon: Tag },
    { id: "orders", label: t('orders'), icon: Package },
    { id: "analytics", label: t('analytics'), icon: DollarSign },
  ];

  return (
    <div className="admin">
      <div className="adminHeader">
        <h1 className="adminTitle">Admin Panel</h1>
        <p className="adminSubtitle">Manage your photo gallery and sales</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <nav className="tabs__nav">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`tab ${active ? "tab--active" : ""}`}>
                <Icon style={{ width: 16, height: 16, marginRight: 6, verticalAlign: -2 }} />
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* UPLOAD (Multiple only) */}
      {activeTab === "upload" && (
        <div className="admin__section">
          <h2>Upload Multiple Photos</h2>
          <form onSubmit={handleMultiUpload} className="formStack">
            <div className="form__group">
              <label className="label">Photos *</label>
              <input ref={multiFilesRef} type="file" multiple accept="image/*" className="admin__input" required />
            </div>
            <div className="row">
              <div style={{ flex: 1 }}>
                <label className="label">Category *</label>
                <select
                  className="admin__select"
                  value={multiCategory}
                  onChange={(e) => setMultiCategory(e.target.value)}
                  required
                >
                  <option value="">Select a category…</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">Price per photo (€) *</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="admin__input"
                  placeholder="e.g. 5 or 5.99"
                  value={multiPrice}
                  onChange={(e) => setMultiPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            {uploadError && <div className="notice notice--red">{uploadError}</div>}
            {uploadSuccess && <div className="notice notice--green">{uploadSuccess}</div>}
            
            {/* Debug Status */}
            <div style={{ 
              background: 'rgba(0,0,0,0.1)', 
              padding: '10px', 
              borderRadius: '8px', 
              marginTop: '10px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              <strong>🔍 Upload Debug:</strong><br/>
              Photos in DB: {photos?.length || 0}<br/>
              Categories: {categories?.length || 0}<br/>
              Loading: {loading ? 'Yes' : 'No'}<br/>
              Error: {error || 'None'}
            </div>
            {isUploading && (
              <div>
                <div className="progress"><div className="progress__bar" style={{ width: `${uploadProgress}%` }} /></div>
                <p className="muted" style={{ fontSize: "0.75rem", marginTop: "var(--space-sm)" }}>Uploading… {uploadProgress}%</p>
              </div>
            )}

            <div className="row" style={{ gap: "var(--space-md)" }}>
              <button type="submit" disabled={isUploading} className="btn btn--primary">
                {isUploading ? t('uploading') : t('upload')}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  console.log("🧪 Form Values Test:");
                  console.log("Category:", multiCategory);
                  console.log("Price:", multiPrice);
                  console.log("Parsed Price:", parsePrice(multiPrice));
                  console.log("Category length:", multiCategory?.length);
                  console.log("Price length:", multiPrice?.length);
                  console.log("Category type:", typeof multiCategory);
                  console.log("Price type:", typeof multiPrice);
                  
                  // Show alert with values
                  alert(`Category: "${multiCategory}"\nPrice: "${multiPrice}"\nParsed: ${parsePrice(multiPrice)}`);
                }}
                className="btn btn--secondary"
                disabled={isUploading}
              >
                Test Values
              </button>
              <button 
                type="button" 
                onClick={async () => {
                  console.log("🔄 Manual photo fetch test...");
                  try {
                    await fetchPhotos();
                    console.log("✅ Photo fetch completed");
                  } catch (err) {
                    console.error("❌ Photo fetch failed:", err);
                  }
                }}
                className="btn btn--secondary"
                disabled={isUploading}
              >
                Test Fetch
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setMultiCategory("");
                  setMultiPrice("");
                  if (multiFilesRef.current) multiFilesRef.current.value = "";
                }}
                className="btn btn--secondary"
                disabled={isUploading}
              >
                {t('clearForm')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GALLERY MANAGEMENT */}
      {activeTab === "gallery" && (
        <div className="stack-6">
          <div className="admin__section">
            <div className="row between">
              <h2>Photo Gallery</h2>
              <div className="row">
                <select
                  className="admin__select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label={t('filterByCategory')}
                >
                  <option value="">{t('allCategories')}</option>
                  {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
                <button className="btn btn--secondary" onClick={fetchPhotos}>{t('refresh')}</button>
                {visible.length > 0 && (
                  <button 
                    className="btn btn--outline" 
                    onClick={isAllSelected ? deselectAll : selectAll}
                    title={isAllSelected ? t('deselectAll') : t('selectAll')}
                  >
                    {isAllSelected ? t('deselectAll') : t('selectAll')} ({visible.length})
                  </button>
                )}
                <button className="btn btn--danger" onClick={bulkDelete} disabled={selectedIds.size === 0}>
                  <Trash2 size={16} />
                  {t('deleteSelected')} ({selectedIds.size})
                </button>
              </div>
            </div>

            <div className="admin__grid">
              {visible.map((p) => {
                const src = p.watermarkedUrl || p.url;
                const name = p.filename || p.title || t('photo');
                const edit = edits[p.id] || {};
                return (
                  <div key={p.id} className="admin__card">
                    <div className="ratio ratio--1x1">
                      <div className="mediaBox">
                        <img src={src} alt={name} />
                        <div className="mediaBox__price">
                          {fmtEUR(edit.price ?? p.price)}
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="mediaBox__check"
                          title={t('selectForBulkActions')}
                        />
                      </div>
                    </div>

                    <div style={{ padding: "var(--space-lg)" }}>
                      <div className="row between">
                        <h3 className="text-ellipsis" style={{ fontWeight: 600, maxWidth: "70%" }}>{name}</h3>
                        <button onClick={() => window.open(src, "_blank")} className="linkBtn" type="button">
                          <Eye size={16} />
                          View
                        </button>
                      </div>

                      <p className="muted" style={{ fontSize: "0.75rem", marginBottom: "var(--space-sm)" }}>
                        {p.uploadedAt ? new Date(p.uploadedAt).toLocaleDateString() : ""}
                      </p>

                      <div className="row" style={{ gap: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="admin__input"
                          value={edit.price ?? (p.price ?? "")}
                          onChange={(e) => setEditField(p.id, "price", e.target.value)}
                          placeholder="5.99"
                          style={{ flex: 1 }}
                        />
                        <select
                          className="admin__select"
                          value={edit.category ?? p.category ?? ""}
                          onChange={(e) => setEditField(p.id, "category", e.target.value)}
                          style={{ flex: 1 }}
                        >
                          <option value="">(none)</option>
                          {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
                        </select>
                      </div>

                      <div className="admin__actions">
                        <button
                          className="btn btn--danger"
                          onClick={() => deleteOne(p.id)}
                          type="button"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                        <button
                          className="btn btn--primary"
                          onClick={() => savePhotoEdits(p.id)}
                          type="button"
                        >
                          <Save size={16} />
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {visible.length === 0 && (
                <div className="muted" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "var(--space-2xl)" }}>
                  No photos in this category
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES */}
      {activeTab === "categories" && (
        <div className="stack-6">
          <div className="admin__section">
            <h2>{t('addCategory')}</h2>
            <div className="row">
              <input
                className="admin__input"
                placeholder={t('categoryName')}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <button
                className="btn btn--primary"
                onClick={async () => {
                  if (!newCategoryName.trim()) return;
                  await createCategory(newCategoryName.trim());
                  setNewCategoryName("");
                }}
              >
                <Plus size={16} />
                {t('addNewCategory')}
              </button>
            </div>
          </div>

          <div className="admin__section">
            <h2>{t('categories')}</h2>
            {categories.length === 0 && <p className="muted">{t('noCategoriesYet')}</p>}

            <div className="admin__grid">
              {categories.map((c) => {
                const photosInCategory = photos.filter(p => (p.category || "").trim() === c.trim());
                return (
                  <div key={c} className="admin__card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 600 }}>{c}</div>
                      <div className="muted" style={{ fontSize: "0.875rem" }}>
                        {photosInCategory.length} {photosInCategory.length === 1 ? t('photo') : t('photos')}
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                      {photosInCategory.length > 0 && (
                        <button 
                          className="btn btn--warning" 
                          onClick={() => deleteAllPhotosFromCategory(c)}
                          style={{ flex: 1 }}
                        >
                          <Trash2 size={16} />
                          {t('deleteAllPhotos')}
                        </button>
                      )}
                      <button 
                        className="btn btn--danger" 
                        onClick={() => removeCategory(c)}
                        style={{ flex: 1 }}
                      >
                        <Trash2 size={16} />
                        {t('deleteCategory')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="row" style={{ marginTop: "var(--space-lg)" }}>
              <input
                className="admin__input"
                placeholder={t('categoryName')}
                value={deleteCategoryName}
                onChange={(e) => setDeleteCategoryName(e.target.value)}
              />
              <button
                className="btn btn--danger"
                onClick={async () => {
                  if (!deleteCategoryName.trim()) return;
                  await removeCategory(deleteCategoryName.trim());
                  setDeleteCategoryName("");
                }}
              >
                <Trash2 size={16} />
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS */}
      {activeTab === "orders" && (
        <div className="stack-6">
          <div className="admin__section">
            <div className="row between">
              <h2>{t('orderHistory')}</h2>
              <button className="btn btn--secondary" onClick={fetchOrders}>{t('refreshOrders')}</button>
            </div>

            <div className="stack-4">
              {orders.map((o) => (
                <div key={o.id} className="admin__card">
                  <div className="row between">
                    <div>
                      <h3 style={{ fontWeight: 600 }}>Order #{o.id}</h3>
                      <p className="muted" style={{ fontSize: "0.75rem" }}>
                        {o.customerName} ({o.customerEmail})
                      </p>
                      <p className="muted" style={{ fontSize: "0.75rem" }}>
                        {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontWeight: 700, color: "var(--primary)" }}>€{o.totalAmount}</p>
                      <p className="muted" style={{ fontSize: "0.75rem" }}>
                        {o.photoCount} photo{o.photoCount !== 1 ? "s" : ""}
                      </p>
                      <span className={`pill ${o.status === "completed" ? "pill--green" : "pill--yellow"}`} style={{ marginTop: "var(--space-sm)", display: "inline-block" }}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <div className="muted" style={{ textAlign: "center", padding: "var(--space-2xl)" }}>No orders yet</div>}
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="admin__grid">
          <StatCard icon={Users} color="var(--primary)" label={t('totalPhotos')} value={photos.length} />
          <StatCard icon={Package} color="var(--success)" label={t('totalOrders')} value={orders.length} />
          <StatCard
            icon={DollarSign}
            color="var(--warning)"
            label={t('totalRevenue')}
            value={"€" + orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toFixed(2)}
          />
        </div>
      )}
    </div>
  );
  
  } catch (error) {
    console.error("❌ AdminPanel error:", error);
    return (
      <div className="admin">
        <div className="adminHeader">
          <h1 className="adminTitle">Admin Panel Error</h1>
        </div>
        <div style={{ padding: "20px", color: "red" }}>
          <h2>Error loading Admin Panel</h2>
          <p>Error: {error.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      </div>
    );
  }
};

const StatCard = ({ icon: Icon, color, label, value }) => (
  <div className="admin__card centerText">
    <Icon size={32} style={{ margin: "0 auto var(--space-sm)", color }} />
    <h3 className="stat">{value}</h3>
    <p className="muted">{label}</p>
  </div>
);

// -------- little helpers for the fake progress bar on uploads --------
function fakeProgress(setProgress, setBusy) {
  setBusy(true);
  setProgress(0);
  let p = 0;
  const id = setInterval(() => {
    p = Math.min(90, p + 10);
    setProgress(p);
    if (p >= 90) clearInterval(id);
  }, 150);
}
function endProgress(setProgress, setSuccess, msg) {
  setProgress(100);
  setSuccess(msg);
  setTimeout(() => setSuccess(""), 2000);
}
function failProgress(setBusy, setError, err) {
  setBusy(false);
  setError(err?.response?.data?.error || err?.message || t('uploadFailed'));
  setTimeout(() => setError(""), 3000);
}

export default AdminPanel;
