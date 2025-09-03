import React, { useMemo, useState } from "react";
import { Heart, ShoppingCart, Eye, Filter } from "lucide-react";
import { usePhotos } from "../../Context/PhotoContext";
import { useCart } from "../../Context/CartContext";
import { useLanguage } from "../../Context/LanguageContext";
import PhotoModal from "./PhotoModal";
import "../Styles/PhotoGallery.css";

const PhotoGallery = () => {
  const { wmPhotos, categories, loading, error, fetchPhotos } = usePhotos();
  const { addToCart, isInCart } = useCart();
  const { t } = useLanguage();

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [category, setCategory] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");

  // Sample photos for testing
  const samplePhotos = [
    {
      id: 'sample1',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
      filename: 'Mountain Landscape',
      category: 'Nature',
      price: 15.99,
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'sample2', 
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=500&fit=crop',
      filename: 'Forest Path',
      category: 'Nature',
      price: 12.99,
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'sample3',
      url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=700&fit=crop',
      filename: 'Ocean Waves',
      category: 'Nature',
      price: 18.99,
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'sample4',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=550&fit=crop',
      filename: 'Forest Canopy',
      category: 'Nature',
      price: 14.99,
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'sample5',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
      filename: 'Mountain Peak',
      category: 'Landscape',
      price: 16.99,
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'sample6',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=500&fit=crop',
      filename: 'Sunset Beach',
      category: 'Landscape',
      price: 19.99,
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'sample7',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
      filename: 'Mountain Vista',
      category: 'Adventure',
      price: 22.99,
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'sample8',
      url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=700&fit=crop',
      filename: 'Ocean Sunset',
      category: 'Adventure',
      price: 24.99,
      uploadedAt: new Date().toISOString()
    }
  ];

  // Always use real photos from API, never fallback to samples
  const displayPhotos = wmPhotos || [];

  // Debug logging
  console.log("🔍 PhotoGallery Debug:");
  console.log("wmPhotos:", wmPhotos);
  console.log("wmPhotos length:", wmPhotos?.length);
  console.log("loading:", loading);
  console.log("error:", error);
  console.log("displayPhotos length:", displayPhotos?.length);

  // Collections with counters
  const collections = useMemo(() => {
    const map = new Map();
    (displayPhotos || []).forEach((p) => {
      const c = (p.category || "").trim();
      map.set(c, (map.get(c) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [displayPhotos]);

  // Filtered visible photos
  const visible = useMemo(() => {
    if (!Array.isArray(displayPhotos)) return [];
    let out = displayPhotos;

    if (category) out = out.filter((p) => (p.category || "") === category);

    if (timeFilter === "recent") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      out = out.filter((p) => new Date(p.uploadedAt || Date.now()) > weekAgo);
    }
    return out;
  }, [displayPhotos, category, timeFilter]);

  if (loading) return <div className="text-center p-4">{t('loading')}…</div>;

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="mb-3" style={{ color: "#991b1b" }}>{String(error)}</div>
        <button onClick={() => window.location.reload()} className="btn btn--primary">
          {t('tryAgain')}
        </button>
      </div>
    );
  }

  const totalCount = (displayPhotos || []).length;

  // Empty state
  if (!visible || visible.length === 0) {
    return (
      <div className="galleryLayout">
        <div className="gallery">
          <div className="text-center p-4">
            <div className="mb-2 muted">{t('noPhotosAvailable')}</div>
            <p className="muted">{t('checkBackLater')}</p>
          </div>
        </div>
        <CollectionsSidebar
          collections={collections}
          activeCategory={category}
          onSelectCategory={setCategory}
          totalCount={totalCount}
          t={t}
        />
      </div>
    );
  }

  return (
    <div className="gallery">
      {/* Hero Section */}
      <div className="gallery__hero">
        <div className="gallery__hero-content">
          <h1 className="gallery__title">{t('premiumEventPhotos')}</h1>
          <p className="gallery__desc">
            {t('galleryDescription')}
          </p>
          
          {/* Debug Panel */}
          <div style={{ 
            background: 'rgba(0,0,0,0.1)', 
            padding: '10px', 
            borderRadius: '8px', 
            marginTop: '20px',
            fontSize: '14px',
            fontFamily: 'monospace'
          }}>
            <strong>🔍 Debug Info:</strong><br/>
            Photos loaded: {wmPhotos?.length || 0}<br/>
            Loading: {loading ? 'Yes' : 'No'}<br/>
            Error: {error || 'None'}<br/>
            Display photos: {displayPhotos?.length || 0}
          </div>
        </div>
      </div>

      <div className="galleryLayout">
        {/* Main Gallery */}
        <div className="gallery__main">
          {/* Filters */}
          <div className="gallery__top">
            <div className="gallery__filters">
              <div className="gallery__filter-group">
                <Filter size={18} />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="select"
                  aria-label={t('category')}
                >
                  <option value="">{t('allCategories')}</option>
                  {categories?.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={async () => {
                  console.log("🔄 Manual refresh triggered");
                  try {
                    await fetchPhotos();
                    console.log("✅ Photos refreshed successfully");
                  } catch (err) {
                    console.error("❌ Refresh failed:", err);
                  }
                }}
                className="btn btn--secondary"
                style={{ marginLeft: "var(--space-md)" }}
              >
                🔄 Refresh
              </button>

              <div className="gallery__filter-group">
                <Filter size={18} />
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="select"
                  aria-label={t('timeFilter')}
                >
                  <option value="all">{t('allPhotos')}</option>
                  <option value="recent">{t('recent')}</option>
                </select>
              </div>

              <div className="viewSwitch" role="tablist" aria-label={t('viewMode')}>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`viewBtn ${viewMode === "grid" ? "viewBtn--active" : ""}`}
                  aria-pressed={viewMode === "grid"}
                  aria-label={t('gridView')}
                >
                  <div style={{ width: 16, height: 16, display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 2 }}>
                    <div style={{ background: "currentColor", borderRadius: "2px" }}></div>
                    <div style={{ background: "currentColor", borderRadius: "2px" }}></div>
                    <div style={{ background: "currentColor", borderRadius: "2px" }}></div>
                    <div style={{ background: "currentColor", borderRadius: "2px" }}></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`viewBtn ${viewMode === "list" ? "viewBtn--active" : ""}`}
                  aria-pressed={viewMode === "list"}
                  aria-label={t('listView')}
                >
                  <div style={{ width: 16, height: 16, display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{ background: "currentColor", borderRadius: "2px", height: "3px" }}></div>
                    <div style={{ background: "currentColor", borderRadius: "2px", height: "3px" }}></div>
                    <div style={{ background: "currentColor", borderRadius: "2px", height: "3px" }}></div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Photo Grid */}
          {viewMode === "grid" ? (
            <div className="gallery__grid">
              {visible.map((photo) => (
                <PhotoCard
                  key={photo.id || photo.url}
                  photo={photo}
                  viewMode="grid"
                  onView={() => setSelectedPhoto(photo)}
                  onAddToCart={() => addToCart(photo)}
                  isInCart={isInCart(photo.id || photo.url)}
                  t={t}
                />
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
              {visible.map((photo) => (
                <PhotoCard
                  key={photo.id || photo.url}
                  photo={photo}
                  viewMode="list"
                  onView={() => setSelectedPhoto(photo)}
                  onAddToCart={() => addToCart(photo)}
                  isInCart={isInCart(photo.id || photo.url)}
                  t={t}
                />
              ))}
            </div>
          )}

          {/* Modal */}
          {selectedPhoto && (
            <PhotoModal
              photo={selectedPhoto}
              onClose={() => setSelectedPhoto(null)}
              onAddToCart={() => {
                addToCart(selectedPhoto);
                setSelectedPhoto(null);
              }}
              isInCart={isInCart(selectedPhoto.id || selectedPhoto.url)}
            />
          )}
        </div>

        {/* Collections Sidebar */}
        <CollectionsSidebar
          collections={collections}
          activeCategory={category}
          onSelectCategory={setCategory}
          totalCount={totalCount}
          t={t}
        />
      </div>
    </div>
  );
};

const CollectionsSidebar = ({ collections, activeCategory, onSelectCategory, totalCount, t }) => {
  return (
    <aside className="collectionsSidebar" aria-label={t('collectionsSidebar')}>
      <div className="collectionsSidebar__header">
        <h3 className="collectionsSidebar__title">{t('collections')}</h3>
        <span className="collectionsSidebar__badge">{totalCount}</span>
      </div>

      <button
        className={`collectionsSidebar__item ${activeCategory === "" ? "active" : ""}`}
        onClick={() => onSelectCategory("")}
        title={t('allPhotosCollection')}
        aria-current={activeCategory === "" ? "true" : "false"}
      >
        <span className="collectionsSidebar__item-name">{t('allPhotosCollection')}</span>
        <span className="collectionsSidebar__item-count">{totalCount}</span>
      </button>

      <div className="collectionsSidebar__list">
        {collections.map(({ name, count }) => (
          <button
            key={name || "(none)"}
            className={`collectionsSidebar__item ${activeCategory === name ? "active" : ""}`}
            onClick={() => onSelectCategory(name)}
            title={name || t('uncategorized')}
            aria-current={activeCategory === name ? "true" : "false"}
          >
            <span className="collectionsSidebar__item-name">{name || t('uncategorized')}</span>
            <span className="collectionsSidebar__item-count">{count}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

const PhotoCard = ({ photo, viewMode, onView, onAddToCart, isInCart, t }) => {
  const src =
    photo.url ||
    photo.watermarkedUrl ||
    photo.watermarkedPath ||
    photo.path;

  const name = photo.filename || photo.title || photo.category || t('photo');
  const uploaded = photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString() : "";
  const price = typeof photo.price === "number" ? photo.price : (photo.price ?? 0);

  if (viewMode === "list") {
    return (
      <div className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-lg)", padding: "var(--space-lg)" }}>
        <img
          src={src}
          alt={name}
          className="rounded-xl"
          style={{ width: 96, height: 96, objectFit: "cover" }}
          loading="lazy"
        />
        <div style={{ flex: 1 }}>
          <h3 className="photoCard__title">{name}</h3>
          <p className="muted">{uploaded}</p>
          <p style={{ fontWeight: 700, color: "var(--primary)", marginTop: 6 }}>
            {price ? `€${price}` : ""}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
          <button onClick={onView} className="btn btn--secondary" title={t('viewFullSize')}>
            <Eye size={18} />
          </button>
          <button
            onClick={onAddToCart}
            disabled={isInCart}
            className={`btn ${isInCart ? "btn--success" : "btn--primary"}`}
            title={isInCart ? t('alreadyInCart') : t('addToCart')}
          >
            {isInCart ? <Heart size={18} /> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
    );
  }

  // Grid card
  return (
    <div className="photoCard">
      <div className="photoCard__image-container">
        <img src={src} alt={name} className="photoCard__img" loading="lazy" />

        <div className="photoCard__overlay" aria-hidden="true">
          <div className="photoCard__actions">
            <button onClick={onView} className="photoCard__action-btn" title={t('viewFullSize')}>
              <Eye size={18} />
            </button>
            <button
              onClick={onAddToCart}
              disabled={isInCart}
              className={`photoCard__action-btn ${isInCart ? "btn--success" : ""}`}
              title={isInCart ? t('alreadyInCart') : t('addToCart')}
            >
              {isInCart ? <Heart size={18} /> : <ShoppingCart size={18} />}
            </button>
          </div>
        </div>

        {price ? <div className="photoCard__price">€{price}</div> : null}
      </div>

      <div className="photoCard__content">
        <h3 className="photoCard__title">{name}</h3>
        <div className="photoCard__meta">
          <span>{uploaded}</span>
          {photo.category && (
            <span className="photoCard__category">{photo.category}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoGallery;