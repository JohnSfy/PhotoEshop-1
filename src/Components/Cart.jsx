import React from "react";
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "../../Context/CartContext";
import { useLanguage } from "../../Context/LanguageContext";
import "../Styles/Cart.css"; // adjust if your path differs

const Cart = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } =
    useCart();
  const { t } = useLanguage();

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart">
        <div className="cartEmpty">
          <ShoppingBag className="icon" />
          <h2 className="cartEmpty__title">{t('cartEmpty')}</h2>
          <p className="muted mb-4">{t('addSomePhotos')}</p>
          <Link to="/" className="btn btn--primary">
            {t('backToGallery')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      {/* Header */}
      <div className="cartHeader">
        <div className="cartHeader__left">
          <Link to="/" className="cartHeader__back" aria-label={t('backToGallery')}>
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </Link>
          <div>
            <h1 className="cartTitle">{t('shoppingCart')}</h1>
            <p className="cartSubtitle">
              {cartItems.length} {cartItems.length === 1 ? t('photo') : t('photos')} {t('selected')}
            </p>
          </div>
        </div>

        <button onClick={clearCart} className="cartClear">
          {t('clearCart')}
        </button>
      </div>

      <div className="cartGrid">
        {/* Cart Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onRemove={() => removeFromCart(item.id)}
              onUpdateQuantity={(q) => updateQuantity(item.id, q)}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="summary">
            <h3 className="mb-3" style={{ fontWeight: 700, fontSize: "1.25rem" }}>
              {t('orderSummary')}
            </h3>

            <div className="summary">
              <div className="line">
                <span>{t('photos')} ({cartItems.length})</span>
                <span>€{cartTotal.toFixed(2)}</span>
              </div>

              <div className="line">
                <span>{t('processingFee')}</span>
                <span>{t('free')}</span>
              </div>

              <div className="total">
                <span>{t('total')}</span>
                <span style={{ color: "var(--primary)" }}>
                  €{cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <Link to="/checkout" className="btn btn--primary" style={{ width: "100%", marginTop: "var(--space-lg)" }}>
              {t('proceedToCheckout')}
            </Link>

            <div className="text-center muted" style={{ fontSize: "0.75rem", marginTop: "var(--space-md)" }}>
              <p>{t('securePayment')}</p>
              <p>{t('cleanPhotosDelivered')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  const { t } = useLanguage();
  const src = item.watermarkedUrl || item.url;
  const name = item.filename || item.title || t('photo');
  const uploaded =
    item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : "";

  return (
    <div className="cartItem">
      <div className="cartItem__row">
        {/* Photo thumbnail */}
        <img src={src} alt={name} className="cartItem__img" />

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="cartItem__name">{name}</h3>
          <p className="cartItem__meta">{t('uploaded')}: {uploaded}</p>
          <p className="cartItem__price">€{item.price}</p>
        </div>

        {/* Quantity */}
        <div className="qty">
          <button
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            className="qtyBtn"
            disabled={item.quantity <= 1}
            aria-label={t('decreaseQuantity')}
          >
            <Minus size={16} />
          </button>

          <span style={{ width: 40, textAlign: "center", fontWeight: 600 }}>
            {item.quantity}
          </span>

          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="qtyBtn"
            aria-label={t('increaseQuantity')}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Remove */}
        <button
          onClick={onRemove}
          className="removeBtn"
          title={t('removeFromCart')}
          aria-label={t('removeFromCart')}
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Subtotal */}
      <div className="mt-3" style={{ paddingTop: "var(--space-md)", borderTop: "1px solid var(--border)", textAlign: "right" }}>
        <span className="muted" style={{ fontSize: "0.875rem" }}>
          {t('subtotal')}:{" "}
          <span style={{ fontWeight: 700, color: "var(--text)" }}>
            €{(item.price * item.quantity).toFixed(2)}
          </span>
        </span>
      </div>
    </div>
  );
};

export default Cart;
