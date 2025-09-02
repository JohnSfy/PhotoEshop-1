import React, { useMemo, useState } from "react";
import { Heart, ShoppingCart, Eye, Filter } from "lucide-react";
import { usePhotos } from "../../Context/PhotoContext";
import { useCart } from "../../Context/CartContext";
import PhotoModal from "./PhotoModal";
import "../Styles/PhotoGallery.css";

const PhotoGallery = () => {
  const { wmPhotos, categories, loading, error } = usePhotos();
  const { addToCart, isInCart } = useCart();

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [viewMode, setViewMode] = useState("grid");   // grid | list
  const [category, setCategory] = useState("");       // "" = όλες
  const [timeFilter, setTimeFilter] = useState("all"); // all | recent

  // Συλλογές με counters (από τα wmPhotos)
  const collections = useMemo(() => {
    const map = new Map();
    (wmPhotos || []).forEach((p) => {
      const c = (p.category || "").trim();
      map.set(c, (map.get(c) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [wmPhotos]);

  // Φιλτραρισμένα ορατά
  const visible = useMemo(() => {
    if (!Array.isArray(wmPhotos)) return [];
    let out = wmPhotos;

    if (category) out = out.filter((p) => (p.category || "") === category);

    if (timeFilter === "recent") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      out = out.filter((p) => new Date(p.uploadedAt || Date.now()) > weekAgo);
    }
    return out;
  }, [wmPhotos, category, timeFilter]);

  if (loading) return <div className="text-center p-4">Loading…</div>;

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="mb-3" style={{ color: "#991b1b" }}>{String(error)}</div>
        <button onClick={() => window.location.reload()} className="btn btn--primary">
          Try Again
        </button>
      </div>
    );
  }

  const totalCount = (wmPhotos || []).length;

  // Empty state με sidebar
  if (!visible || visible.length === 0) {
    return (
      <div className="galleryLayout">
        <div className="gallery">
          <div className="text-center p-4">
            <div className="mb-2 muted">No photos available yet</div>
            <p className="muted">Check back later for new event photos!</p>
          </div>
        </div>
        <CollectionsSidebar
          collections={collections}
          activeCategory={category}
          onSelectCategory={setCategory}
          totalCount={totalCount}
        />
      </div>
    );
  }

  return (
    <div className="galleryLayout">
      {/* Αριστερή στήλη: Gallery */}
      <div className="gallery">
        {/* Header & controls */}
        <div className="gallery__top">
          <div>
            <h1 className="gallery__title">Event Photo Gallery</h1>
            <p className="gallery__desc">
              Browse and select your favorite photos. Add them to cart to purchase clean versions.
            </p>
          </div>

          <div className="gallery__filters">
            {/* Category select (συγχρονισμένο με το sidebar) */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Filter style={{ width: 18, height: 18, color: "#6b7280" }} />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="select"
                aria-label="Category"
              >
                <option value="">All categories</option>
                {categories?.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Time filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Filter style={{ width: 18, height: 18, color: "#6b7280" }} />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="select"
                aria-label="Time filter"
              >
                <option value="all">All Photos</option>
                <option value="recent">Recent (7 days)</option>
              </select>
            </div>

            {/* View mode */}
            <div className="viewSwitch" role="tablist" aria-label="View mode">
              <button
                onClick={() => setViewMode("grid")}
                className={`viewBtn ${viewMode === "grid" ? "viewBtn--active" : ""}`}
                aria-pressed={viewMode === "grid"}
                aria-label="Grid view"
              >
                <div style={{ width: 16, height: 16, display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 2 }}>
                  <div className="bg-current rounded"></div>
                  <div className="bg-current rounded"></div>
                  <div className="bg-current rounded"></div>
                  <div className="bg-current rounded"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`viewBtn ${viewMode === "list" ? "viewBtn--active" : ""}`}
                aria-pressed={viewMode === "list"}
                aria-label="List view"
              >
                <div style={{ width: 16, height: 16, display: "flex", flexDirection: "column", gap: 2 }}>
                  <div className="bg-current rounded" style={{ height: 4 }}></div>
                  <div className="bg-current rounded" style={{ height: 4 }}></div>
                  <div className="bg-current rounded" style={{ height: 4 }}></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Περιεχόμενο: Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid--4">
            {visible.map((photo) => (
              <PhotoCard
                key={photo.id || photo.url}
                photo={photo}
                viewMode="grid"
                onView={() => setSelectedPhoto(photo)}
                onAddToCart={() => addToCart(photo)}
                isInCart={isInCart(photo.id || photo.url)}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {visible.map((photo) => (
              <PhotoCard
                key={photo.id || photo.url}
                photo={photo}
                viewMode="list"
                onView={() => setSelectedPhoto(photo)}
                onAddToCart={() => addToCart(photo)}
                isInCart={isInCart(photo.id || photo.url)}
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

      {/* Δεξιά στήλη: Sidebar Συλλογές */}
      <CollectionsSidebar
        collections={collections}
        activeCategory={category}
        onSelectCategory={setCategory}
        totalCount={totalCount}
      />
    </div>
  );
};

const CollectionsSidebar = ({ collections, activeCategory, onSelectCategory, totalCount }) => {
  return (
    <aside className="collectionsSidebar card" aria-label="Collections sidebar">
      <div className="collectionsSidebar__header">
        <h3 style={{ fontWeight: 800 }}>Συλλογές</h3>
        <span className="badge">{totalCount}</span>
      </div>

      <button
        className={`collectionsSidebar__item ${activeCategory === "" ? "active" : ""}`}
        onClick={() => onSelectCategory("")}
        title="Όλες οι φωτογραφίες"
        aria-current={activeCategory === "" ? "true" : "false"}
      >
        <span>Όλες</span>
        <span className="muted">{totalCount}</span>
      </button>

      <div className="collectionsSidebar__list">
        {collections.map(({ name, count }) => (
          <button
            key={name || "(none)"}
            className={`collectionsSidebar__item ${activeCategory === name ? "active" : ""}`}
            onClick={() => onSelectCategory(name)}
            title={name || "Χωρίς κατηγορία"}
            aria-current={activeCategory === name ? "true" : "false"}
          >
            <span>{name || "Χωρίς κατηγορία"}</span>
            <span className="muted">{count}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

const PhotoCard = ({ photo, viewMode, onView, onAddToCart, isInCart }) => {
  const src =
    photo.url ||
    photo.watermarkedUrl ||
    photo.watermarkedPath ||
    photo.path;

  const name = photo.filename || photo.title || photo.category || "Photo";
  const uploaded = photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString() : "";
  const price = typeof photo.price === "number" ? photo.price : (photo.price ?? 0);

  if (viewMode === "list") {
    return (
      <div className="card p-4" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <img
          src={src}
          alt={name}
          className="rounded"
          style={{ width: 96, height: 96, objectFit: "cover" }}
          loading="lazy"
        />
        <div style={{ flex: 1 }}>
          <h3 className="mb-1">{name}</h3>
          <p className="muted">{uploaded}</p>
          <p style={{ fontWeight: 700, color: "var(--primary)", marginTop: 6 }}>
            {price ? `€${price}` : ""}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={onView} className="btn btn--secondary" title="View full size">
            <Eye style={{ width: 18, height: 18 }} />
          </button>
          <button
            onClick={onAddToCart}
            disabled={isInCart}
            className="btn btn--primary"
            title={isInCart ? "Already in cart" : "Add to cart"}
            style={isInCart ? { opacity: 0.7, cursor: "not-allowed", background: "var(--green)" } : undefined}
          >
            {isInCart ? <Heart style={{ width: 18, height: 18 }} /> : <ShoppingCart style={{ width: 18, height: 18 }} />}
          </button>
        </div>
      </div>
    );
  }

  // Grid card
  return (
    <div className="photoCard card">
      <div style={{ position: "relative" }}>
        <img src={src} alt={name} className="photoCard__img" loading="lazy" />

        <div className="photoCard__overlay" aria-hidden="true">
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onView} className="btn btn--secondary" title="View full size">
              <Eye style={{ width: 18, height: 18 }} />
            </button>
            <button
              onClick={onAddToCart}
              disabled={isInCart}
              className="btn btn--primary"
              title={isInCart ? "Already in cart" : "Add to cart"}
              style={isInCart ? { opacity: 0.7, cursor: "not-allowed", background: "var(--green)" } : undefined}
            >
              {isInCart ? <Heart style={{ width: 18, height: 18 }} /> : <ShoppingCart style={{ width: 18, height: 18 }} />}
            </button>
          </div>
        </div>

        {price ? <div className="badge badge--primary photoCard__price">€{price}</div> : null}
      </div>

      <div className="p-4">
        <h3 className="mb-1">{name}</h3>
        <p className="muted">{uploaded}</p>
      </div>
    </div>
  );
};

export default PhotoGallery;
