import React, { useState, useRef } from "react";
import { Upload, Image, Package, Users, DollarSign, Trash2, Eye } from "lucide-react";
import { usePhotos } from "../../Context/PhotoContext";
import "../Styles/AdminPanel.css";

const AdminPanel = () => {
  const { photos, uploadPhotos, fetchPhotos } = usePhotos();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const [orders, setOrders] = useState([]);
  const cleanFileInputRef = useRef();

  const handlePhotoUpload = async (event) => {
    event.preventDefault();
    const cleanFiles = cleanFileInputRef.current.files;

    if (!cleanFiles || cleanFiles.length === 0) {
      setUploadError("Please select clean photo files");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadSuccess("");
    setUploadProgress(0);

    try {
      // fake progress
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => {
          if (p >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return p + 10;
        });
      }, 200);

      const formData = new FormData();
      Array.from(cleanFiles).forEach((file) => formData.append("clean", file));

      await uploadPhotos(formData);

      setUploadProgress(100);
      setUploadSuccess(`Successfully uploaded and watermarked ${cleanFiles.length} photos!`);
      cleanFileInputRef.current.value = "";

      setTimeout(() => {
        setUploadSuccess("");
        setUploadProgress(0);
      }, 3000);
    } catch (err) {
      let msg = "Failed to upload photos";
      if (err?.message) msg += `: ${err.message}`;
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const fetchOrders = async () => {
    // mock data for now
    const mockOrders = [
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
    ];
    setOrders(mockOrders);
  };

  const deletePhoto = async (photoId) => {
    if (window.confirm("Are you sure you want to delete this photo?")) {
      try {
        // call API here in real app
        await fetchPhotos();
      } catch (e) {
        console.error("Error deleting photo", e);
      }
    }
  };

  const tabs = [
    { id: "upload", label: "Upload Photos", icon: Upload },
    { id: "gallery", label: "Manage Gallery", icon: Image },
    { id: "orders", label: "Orders", icon: Package },
    { id: "analytics", label: "Analytics", icon: DollarSign },
  ];

  return (
    <div className="admin">
      <div className="adminHeader">
        <h1 className="adminTitle">Admin Panel</h1>
        <p className="muted">Manage your photo gallery and monitor sales</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <nav className="tabs__nav">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`tab ${active ? "tab--active" : ""}`}
              >
                <Icon style={{ width: 16, height: 16, marginRight: 6, verticalAlign: -2 }} />
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Upload */}
      {activeTab === "upload" && (
        <div className="card p-4">
          <h2 className="mb-3" style={{ fontWeight: 700, fontSize: 18 }}>Upload New Photos</h2>

          <form onSubmit={handlePhotoUpload} className="formStack">
            <div>
              <label className="label">Clean Photos *</label>
              <input ref={cleanFileInputRef} type="file" multiple accept="image/*" className="input" required />
              <p className="muted mt-1" style={{ fontSize: 12 }}>
                Select your clean, high-quality photos. Watermarks will be added automatically.
              </p>
            </div>

            {uploadError && <div className="notice notice--red">{uploadError}</div>}
            {uploadSuccess && <div className="notice notice--green">{uploadSuccess}</div>}

            {isUploading && (
              <div>
                <div className="progress">
                  <div className="progress__bar" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                  Uploading… {uploadProgress}%
                </p>
              </div>
            )}

            <button type="submit" disabled={isUploading} className="btn btn--primary">
              {isUploading ? "Uploading..." : "Upload Photos"}
            </button>
          </form>
        </div>
      )}

      {/* Gallery */}
      {activeTab === "gallery" && (
        <div className="stack-6">
          <div className="row between">
            <h2 className="mb-0" style={{ fontWeight: 700, fontSize: 18 }}>Photo Gallery</h2>
            <p className="muted">{photos.length} photos total</p>
          </div>

          <div className="grid grid--3">
            {photos.map((photo) => {
              const src = photo.watermarkedUrl || photo.url;
              const name = photo.filename || photo.title || "Photo";
              return (
                <div key={photo.id} className="card overflow-hidden">
                  <div className="ratio ratio--1x1">
                    <img src={src} alt={name} className="cover" />
                    <div className="badge badge--primary" style={{ position: "absolute", top: 8, right: 8 }}>
                      ${photo.price}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="mb-1 text-ellipsis" style={{ fontWeight: 600 }}>{name}</h3>
                    <p className="muted mb-2" style={{ fontSize: 12 }}>
                      {photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString() : ""}
                    </p>

                    <div className="row between">
                      <button
                        onClick={() => window.open(src, "_blank")}
                        className="linkBtn"
                        type="button"
                      >
                        <Eye style={{ width: 16, height: 16, marginRight: 6, verticalAlign: -3 }} />
                        View
                      </button>

                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="linkBtn linkBtn--danger"
                        type="button"
                      >
                        <Trash2 style={{ width: 16, height: 16, marginRight: 6, verticalAlign: -3 }} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {photos.length === 0 && (
              <div className="muted" style={{ gridColumn: "1 / -1", textAlign: "center", padding: 24 }}>
                No photos yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders */}
      {activeTab === "orders" && (
        <div className="stack-6">
          <div className="row between">
            <h2 className="mb-0" style={{ fontWeight: 700, fontSize: 18 }}>Order History</h2>
            <button onClick={fetchOrders} className="btn btn--secondary">Refresh Orders</button>
          </div>

          <div className="stack-4">
            {orders.map((order) => (
              <div key={order.id} className="card p-4">
                <div className="row between">
                  <div>
                    <h3 style={{ fontWeight: 600 }}>Order #{order.id}</h3>
                    <p className="muted" style={{ fontSize: 12 }}>
                      {order.customerName} ({order.customerEmail})
                    </p>
                    <p className="muted" style={{ fontSize: 12 }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 700, color: "var(--primary)" }}>${order.totalAmount}</p>
                    <p className="muted" style={{ fontSize: 12 }}>
                      {order.photoCount} photo{order.photoCount !== 1 ? "s" : ""}
                    </p>
                    <span
                      className={`pill ${order.status === "completed" ? "pill--green" : "pill--yellow"}`}
                      style={{ marginTop: 6, display: "inline-block" }}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <div className="muted" style={{ textAlign: "center", padding: 24 }}>No orders yet</div>
            )}
          </div>
        </div>
      )}

      {/* Analytics */}
      {activeTab === "analytics" && (
        <div className="grid grid--3">
          <div className="card p-4 centerText">
            <Users style={{ width: 32, height: 32, margin: "0 auto 8px", color: "var(--primary)" }} />
            <h3 className="stat">{photos.length}</h3>
            <p className="muted">Total Photos</p>
          </div>

          <div className="card p-4 centerText">
            <Package style={{ width: 32, height: 32, margin: "0 auto 8px", color: "var(--green)" }} />
            <h3 className="stat">{orders.length}</h3>
            <p className="muted">Total Orders</p>
          </div>

          <div className="card p-4 centerText">
            <DollarSign style={{ width: 32, height: 32, margin: "0 auto 8px", color: "#ca8a04" }} />
            <h3 className="stat">
              ${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
            </h3>
            <p className="muted">Total Revenue</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
