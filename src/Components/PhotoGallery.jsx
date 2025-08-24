import React, { useState } from "react";
import { Heart, ShoppingCart, Eye, Filter } from "lucide-react";
import { usePhotos } from "../../Context/PhotoContext";
import { useCart } from "../../Context/CartContext";
import PhotoModal from "./PhotoModal";
import "../Styles/PhotoGallery.css"; // adjust if your path differs

const PhotoGallery = () => {
  const { photos, loading, error, filter, setFilter } = usePhotos();
  const { addToCart, isInCart } = useCart();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  if (loading) {
    return <div className="text-center p-4">Loading…</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="mb-3" style={{ color: "#991b1b" }}>{error}</div>
        <button onClick={() => window.location.reload()} className="btn btn--primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center p-4">
        <div className="mb-2 muted">No photos available yet</div>
        <p className="muted">Check back later for new event photos!</p>
      </div>
    );
  }

  return (
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
          {/* Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Filter style={{ width: 18, height: 18, color: "#6b7280" }} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="select"
            >
              <option value="all">All Photos</option>
              <option value="recent">Recent (7 days)</option>
            </select>
          </div>

          {/* View mode */}
          <div className="viewSwitch">
            <button
              onClick={() => setViewMode("grid")}
              className={`viewBtn ${viewMode === "grid" ? "viewBtn--active" : ""}`}
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

      {/* List or Grid */}
      {viewMode === "grid" ? (
        <div className="grid grid--4">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              viewMode="grid"
              onView={() => setSelectedPhoto(photo)}
              onAddToCart={() => addToCart(photo)}
              isInCart={isInCart(photo.id)}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              viewMode="list"
              onView={() => setSelectedPhoto(photo)}
              onAddToCart={() => addToCart(photo)}
              isInCart={isInCart(photo.id)}
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
          isInCart={isInCart(selectedPhoto.id)}
        />
      )}
    </div>
  );
};

const PhotoCard = ({ photo, viewMode, onView, onAddToCart, isInCart }) => {
  const src = photo.watermarkedUrl || photo.url;
  const name = photo.filename || photo.title || "Photo";
  const uploaded = photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString() : "";

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
          <p style={{ fontWeight: 700, color: "var(--primary)", marginTop: 6 }}>${photo.price}</p>
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

  // grid card
  return (
    <div className="photoCard card">
      <div style={{ position: "relative" }}>
        <img
          src={src}
          alt={name}
          className="photoCard__img"
          loading="lazy"
        />

        <div className="photoCard__overlay">
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

        <div className="badge badge--primary photoCard__price">${photo.price}</div>
      </div>

      <div className="p-4">
        <h3 className="mb-1">{name}</h3>
        <p className="muted">{uploaded}</p>
      </div>
    </div>
  );
};

export default PhotoGallery;
