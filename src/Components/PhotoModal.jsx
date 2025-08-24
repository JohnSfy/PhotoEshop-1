import React from "react";
import { X, ShoppingCart, Heart, Download, Calendar, DollarSign } from "lucide-react";
import "../Styles/PhotoModal.css"; // adjust the path if needed

const PhotoModal = ({ photo, onClose, onAddToCart, isInCart }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const src = photo.watermarkedUrl || photo.url;
  const name = photo.filename || photo.title || "Photo";
  const uploaded =
    photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString() : "";

  return (
    <div className="modal" onClick={handleBackdropClick}>
      <div className="modal__dialog">
        {/* Header */}
        <div className="modal__header">
          <h2 className="text-ellipsis">{name}</h2>
          <button onClick={onClose} className="btn btn--secondary" aria-label="Close">
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Body */}
        <div className="modal__body">
          {/* Image */}
          <div className="modal__image">
            <div style={{ position: "relative" }}>
              <img src={src} alt={name} />
              <div className="badge badge--yellow watermark">Watermarked Preview</div>
            </div>
          </div>

          {/* Aside / Details */}
          <aside className="modal__aside">
            {/* Photo info */}
            <section>
              <h3>Photo Details</h3>
              <div className="infoRow">
                <Calendar style={{ width: 16, height: 16 }} />
                <span>Uploaded: {uploaded}</span>
              </div>
              <div className="infoRow" style={{ alignItems: "center" }}>
                <DollarSign style={{ width: 16, height: 16 }} />
                <span style={{ fontWeight: 700, color: "var(--primary)" }}>
                  ${photo.price}
                </span>
              </div>
            </section>

            {/* What you get */}
            <section>
              <h4>What You'll Get</h4>
              <ul style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
                {[
                  "High-resolution clean version",
                  "No watermarks or logos",
                  "Professional quality",
                  "Instant email delivery",
                ].map((item, i) => (
                  <li key={i} className="infoRow">
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        background: "var(--green)",
                        borderRadius: "50%",
                      }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Actions */}
            <section>
              {isInCart ? (
                <div
                  className="notice"
                  style={{
                    background: "var(--green-50)",
                    borderColor: "#a7f3d0",
                    color: "#047857",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Heart style={{ width: 18, height: 18 }} />
                  <span className="font-medium">Added to Cart</span>
                </div>
              ) : (
                <button onClick={onAddToCart} className="btn btn--primary" style={{ width: "100%" }}>
                  <ShoppingCart style={{ width: 18, height: 18 }} />
                  <span>Add to Cart</span>
                </button>
              )}

              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = src;
                  link.download = name;
                  link.click();
                }}
                className="btn btn--secondary"
                style={{ width: "100%" }}
              >
                <Download style={{ width: 18, height: 18 }} />
                <span>Download Preview</span>
              </button>
            </section>

            {/* Note */}
            <section className="notice" style={{ fontSize: 12 }}>
              <p>
                <strong>Note:</strong> This is a watermarked preview. Purchase to
                receive the clean, high-resolution version via email.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
