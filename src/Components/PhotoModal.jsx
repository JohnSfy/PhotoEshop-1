import React from "react";
import { X, ShoppingCart, Heart, Download, Calendar, DollarSign } from "lucide-react";
import { useLanguage } from "../../Context/LanguageContext";
import "../Styles/PhotoModal.css"; // adjust the path if needed

const PhotoModal = ({ photo, onClose, onAddToCart, isInCart }) => {
  const { t } = useLanguage();
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const src = photo.watermarkedUrl || photo.url;
  const name = photo.filename || photo.title || t('photo');
  const uploaded =
    photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString() : "";

  return (
    <div className="modal" onClick={handleBackdropClick}>
      <div className="modal__dialog">
        {/* Header */}
        <div className="modal__header">
          <h2>{name}</h2>
          <button onClick={onClose} className="modal__close" aria-label={t('close')}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal__body">
          {/* Image */}
          <div className="modal__image">
            <div style={{ position: "relative" }}>
              <img src={src} alt={name} />
              <div className="watermark">{t('watermarkedPreview')}</div>
            </div>
          </div>

          {/* Aside / Details */}
          <aside className="modal__aside">
            {/* Photo info */}
            <div className="modal__section">
              <h3>{t('photoDetails')}</h3>
              <div className="infoRow">
                <Calendar size={16} />
                <span>{t('uploaded')}: {uploaded}</span>
              </div>
              <div className="infoRow">
                <DollarSign size={16} />
                <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: "1.125rem" }}>
                  €{photo.price}
                </span>
              </div>
            </div>

            {/* What you get */}
            <div className="modal__section">
              <h4>{t('whatYoullGet')}</h4>
              <ul className="modal__features">
                {[
                  t('highResolutionClean'),
                  t('noWatermarks'),
                  t('professionalQuality'),
                  t('instantEmailDelivery'),
                ].map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="modal__section">
              <div className="modal__actions">
                {isInCart ? (
                  <div
                    className="btn btn--success"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "var(--space-sm)",
                      width: "100%",
                    }}
                  >
                    <Heart size={18} />
                    <span>{t('addedToCart')}</span>
                  </div>
                ) : (
                  <button onClick={onAddToCart} className="btn btn--primary" style={{ width: "100%" }}>
                    <ShoppingCart size={18} />
                    <span>{t('addToCart')}</span>
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
                  <Download size={18} />
                  <span>{t('downloadPreview')}</span>
                </button>
              </div>
            </div>

            {/* Note */}
            <div className="modal__note">
              <p>
                <strong>{t('note')}:</strong> {t('watermarkedPreviewNote')}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
