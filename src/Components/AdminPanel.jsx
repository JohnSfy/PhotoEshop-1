import React, { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Image, Package, Users, DollarSign, Trash2, Eye, Plus, Tag, Save } from "lucide-react";
import { usePhotos } from "../../Context/PhotoContext";
import "../Styles/AdminPanel.css";

const AdminPanel = () => {
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
  } = usePhotos();

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

  // -------- MULTIPLE Upload Handler (μόνη επιλογή) --------
  const handleMultiUpload = async (e) => {
    e.preventDefault();
    const files = multiFilesRef.current?.files;
    if (!files || files.length === 0) return setUploadError("Please choose at least one photo");
    if (!multiCategory) return setUploadError("Please select a category");

    const priceNum = parsePrice(multiPrice);
    if (priceNum == null || priceNum < 0) return setUploadError("Please enter a valid price (>= 0)");

    try {
      fakeProgress(setUploadProgress, setIsUploading);

      const cats = Array.from(files).map(() => multiCategory);
      const prices = Array.from(files).map(() => String(priceNum));

      // Χτίζουμε FormData όπως στο test page
      const fd = new FormData();
      Array.from(files).forEach(() => {
        // για κάθε φωτογραφία θα μπουν ΤΡΙΑ entries:
        // 1) photos (το ίδιο αρχείο), 2) prices (η ίδια τιμή), 3) categories (η ίδια κατηγορία)
      });
      Array.from(files).forEach((file) => fd.append("photos", file));
      Array.from(files).forEach(() => fd.append("prices", String(priceNum)));
      Array.from(files).forEach(() => fd.append("categories", multiCategory));

      // προσοχή: μην βάλεις Content-Type χειροκίνητα
      await uploadPhotos({ files, categories: cats, prices }); // το uploadPhotos πρέπει να κάνει fetch με body: fd

      endProgress(setUploadProgress, setUploadSuccess,
        `Uploaded ${files.length} photos to “${multiCategory}” at ${fmtEUR(priceNum)} each!`
      );
      multiFilesRef.current.value = "";
      setMultiCategory("");
      setMultiPrice("");
      fetchPhotos(); // για να δεις άμεσα price/category ενημερωμένα
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
    if (!window.confirm("Delete this photo?")) return;
    await deletePhotos([id]);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected photo(s)?`)) return;
    await deletePhotos(Array.from(selectedIds));
    clearSelection();
  };

  // -------- Orders (mock demo) --------
  const fetchOrders = async () => {
    setOrders([
      {
        id: "1",
        customerEmail: "john@example.com",
        customerName: "John Doe",
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
    { id: "upload", label: "Upload (Multiple Only)", icon: Upload },
    { id: "gallery", label: "Manage Gallery", icon: Image },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "orders", label: "Orders", icon: Package },
    { id: "analytics", label: "Analytics", icon: DollarSign },
  ];

  return (
    <div className="admin">
      <div className="adminHeader">
        <h1 className="adminTitle">Admin Panel</h1>
        <p className="muted">Manage your photo gallery and sales</p>
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
        <div className="card p-4">
          <h2 className="mb-3" style={{ fontWeight: 700, fontSize: 18 }}>Upload Multiple Photos</h2>
          <form onSubmit={handleMultiUpload} className="formStack">
            <div>
              <label className="label">Photos *</label>
              <input ref={multiFilesRef} type="file" multiple accept="image/*" className="input" required />
            </div>
            <div className="row" style={{ gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label className="label">Category *</label>
                <select
                  className="input"
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
                  type="text"              // ήταν number
                  inputMode="decimal"
                  className="input"
                  placeholder="π.χ. 5 ή 5,99"
                  value={multiPrice}
                  onChange={(e) => setMultiPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            {uploadError && <div className="notice notice--red">{uploadError}</div>}
            {uploadSuccess && <div className="notice notice--green">{uploadSuccess}</div>}
            {isUploading && (
              <div>
                <div className="progress"><div className="progress__bar" style={{ width: `${uploadProgress}%` }} /></div>
                <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>Uploading… {uploadProgress}%</p>
              </div>
            )}

            <button type="submit" disabled={isUploading} className="btn btn--primary">
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>
      )}

      {/* GALLERY MANAGEMENT */}
      {activeTab === "gallery" && (
        <div className="stack-6">
          <div className="row between">
            <h2 className="mb-0" style={{ fontWeight: 700, fontSize: 18 }}>Photo Gallery</h2>
            <div className="row" style={{ gap: 12 }}>
              <select
                className="input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
              <button className="btn btn--secondary" onClick={fetchPhotos}>Refresh</button>
              <button className="btn btn--danger" onClick={bulkDelete} disabled={selectedIds.size === 0}>
                <Trash2 style={{ width: 16, height: 16, marginRight: 6, verticalAlign: -3 }} />
                Delete Selected ({selectedIds.size})
              </button>
            </div>
          </div>

          <div className="grid grid--3">
            {visible.map((p) => {
              const src = p.watermarkedUrl || p.url;
              const name = p.filename || p.title || "Photo";
              const edit = edits[p.id] || {};
              return (
                <div key={p.id} className="card overflow-hidden">
                  <div className="ratio ratio--1x1">
                    <div className="mediaBox">
                      <img src={src} alt={name} />
                      <div className="badge badge--primary mediaBox__price">
                        {fmtEUR(edit.price ?? p.price)}
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="mediaBox__check"
                        title="Select for bulk actions"
                      />
                    </div>
                    {/* <input
                      type="checkbox"
                      checked={selectedIds.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      style={{ position: "absolute", top: 8, left: 8, width: 18, height: 18 }}
                      title="Select for bulk actions"
                    /> */}
                  </div>

                  <div className="p-4">
                    <div className="row between">
                      <h3 className="mb-1 text-ellipsis" style={{ fontWeight: 600, maxWidth: "70%" }}>{name}</h3>
                      <button onClick={() => window.open(src, "_blank")} className="linkBtn" type="button">
                        <Eye style={{ width: 16, height: 16, marginRight: 6, verticalAlign: -3 }} />
                        View
                      </button>
                    </div>

                    <p className="muted mb-2" style={{ fontSize: 12 }}>
                      {p.uploadedAt ? new Date(p.uploadedAt).toLocaleDateString() : ""}
                    </p>

                    <div className="row" style={{ gap: 8 }}>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="input"
                        value={edit.price ?? (p.price ?? "")}
                        onChange={(e) => setEditField(p.id, "price", e.target.value)}
                        placeholder="5,99"
                        style={{ flex: 1 }}
                      />
                      <select
                        className="input"
                        value={edit.category ?? p.category ?? ""}
                        onChange={(e) => setEditField(p.id, "category", e.target.value)}
                        style={{ flex: 1 }}
                      >
                        <option value="">(none)</option>
                        {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
                      </select>
                    </div>

                    <div className="row between" style={{ marginTop: 10 }}>
                      <button
                        className="btn btn--danger"
                        onClick={() => deleteOne(p.id)}
                        type="button"
                      >
                        <Trash2 style={{ width: 16, height: 16, marginRight: 6, verticalAlign: -3 }} />
                        Delete
                      </button>
                      <button
                        className="btn btn--primary"
                        onClick={() => savePhotoEdits(p.id)}
                        type="button"
                      >
                        <Save style={{ width: 16, height: 16, marginRight: 6, verticalAlign: -3 }} />
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {visible.length === 0 && (
              <div className="muted" style={{ gridColumn: "1 / -1", textAlign: "center", padding: 24 }}>
                No photos in this category
              </div>
            )}
          </div>
        </div>
      )}

      {/* CATEGORIES */}
      {activeTab === "categories" && (
        <div className="stack-6">
          <div className="card p-4">
            <h2 className="mb-3" style={{ fontWeight: 700, fontSize: 18 }}>Create Category</h2>
            <div className="row" style={{ gap: 12 }}>
              <input
                className="input"
                placeholder="new-category-name"
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
                <Plus style={{ width: 16, height: 16, marginRight: 6, verticalAlign: -3 }} />
                Create
              </button>
            </div>
          </div>

          <div className="card p-4">
            <h2 className="mb-3" style={{ fontWeight: 700, fontSize: 18 }}>Existing Categories</h2>
            {categories.length === 0 && <p className="muted">No categories yet</p>}

            <div className="grid grid--3">
              {categories.map((c) => (
                <div key={c} className="card p-4" style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 600 }}>{c}</div>
                  <button className="btn btn--danger" onClick={() => removeCategory(c)}>
                    <Trash2 style={{ width: 16, height: 16, marginRight: 6, verticalAlign: -3 }} />
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div className="row" style={{ gap: 12, marginTop: 16 }}>
              <input
                className="input"
                placeholder="category-to-delete"
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
                <Trash2 style={{ width: 16, height: 16, marginRight: 6, verticalAlign: -3 }} />
                Delete by name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS */}
      {activeTab === "orders" && (
        <div className="stack-6">
          <div className="row between">
            <h2 className="mb-0" style={{ fontWeight: 700, fontSize: 18 }}>Order History</h2>
            <button className="btn btn--secondary" onClick={fetchOrders}>Refresh Orders</button>
          </div>

          <div className="stack-4">
            {orders.map((o) => (
              <div key={o.id} className="card p-4">
                <div className="row between">
                  <div>
                    <h3 style={{ fontWeight: 600 }}>Order #{o.id}</h3>
                    <p className="muted" style={{ fontSize: 12 }}>
                      {o.customerName} ({o.customerEmail})
                    </p>
                    <p className="muted" style={{ fontSize: 12 }}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 700, color: "var(--primary)" }}>€{o.totalAmount}</p>
                    <p className="muted" style={{ fontSize: 12 }}>
                      {o.photoCount} photo{o.photoCount !== 1 ? "s" : ""}
                    </p>
                    <span className={`pill ${o.status === "completed" ? "pill--green" : "pill--yellow"}`} style={{ marginTop: 6, display: "inline-block" }}>
                      {o.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && <div className="muted" style={{ textAlign: "center", padding: 24 }}>No orders yet</div>}
          </div>
        </div>
      )}

      {/* ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="grid grid--3">
          <StatCard icon={Users} color="var(--primary)" label="Total Photos" value={photos.length} />
          <StatCard icon={Package} color="var(--green)" label="Total Orders" value={orders.length} />
          <StatCard
            icon={DollarSign}
            color="#ca8a04"
            label="Total Revenue"
            value={"€" + orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toFixed(2)}
          />
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, color, label, value }) => (
  <div className="card p-4 centerText">
    <Icon style={{ width: 32, height: 32, margin: "0 auto 8px", color }} />
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
  setError(err?.response?.data?.error || err?.message || "Upload failed");
  setTimeout(() => setError(""), 3000);
}

export default AdminPanel;
