import React from "react";
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "../../Context/CartContext";
import "../Styles/Cart.css"; // adjust if your path differs

const Cart = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } =
    useCart();

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cartEmpty">
        <ShoppingBag className="icon" />
        <h2 className="cartEmpty__title">Your cart is empty</h2>
        <p className="muted mb-4">Add some photos from the gallery to get started!</p>
        <Link to="/" className="btn btn--primary">
          Browse Photos
        </Link>
      </div>
    );
  }

  return (
    <div className="cart">
      {/* Header */}
      <div className="cartHeader">
        <div className="cartHeader__left">
          <Link to="/" className="cartHeader__back" aria-label="Back to gallery">
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </Link>
          <div>
            <h1 className="cartTitle">Shopping Cart</h1>
            <p className="cartSubtitle">
              {cartItems.length} photo{cartItems.length !== 1 ? "s" : ""} selected
            </p>
          </div>
        </div>

        <button onClick={clearCart} className="cartClear">
          Clear Cart
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
          <div className="card p-4 sticky">
            <h3 className="mb-3" style={{ fontWeight: 700 }}>
              Order Summary
            </h3>

            <div className="summary">
              <div className="line">
                <span>Photos ({cartItems.length})</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>

              <div className="line">
                <span>Processing fee</span>
                <span>Free</span>
              </div>

              <div className="total mt-3">
                <span>Total</span>
                <span style={{ color: "var(--primary)" }}>
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <Link to="/checkout" className="btn btn--primary" style={{ width: "100%", marginTop: 16 }}>
              Proceed to Checkout
            </Link>

            <div className="text-center muted" style={{ fontSize: 12, marginTop: 12 }}>
              <p>Secure payment powered by Stripe</p>
              <p>Clean photos delivered via email after payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  const src = item.watermarkedUrl || item.url;
  const name = item.filename || item.title || "Photo";
  const uploaded =
    item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : "";

  return (
    <div className="card p-4">
      <div className="cartItem__row">
        {/* Photo thumbnail */}
        <img src={src} alt={name} className="cartItem__img" />

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="cartItem__name">{name}</h3>
          <p className="cartItem__meta">Uploaded: {uploaded}</p>
          <p className="cartItem__price">${item.price}</p>
        </div>

        {/* Quantity */}
        <div className="qty">
          <button
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            className="qtyBtn"
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus style={{ width: 16, height: 16 }} />
          </button>

          <span style={{ width: 40, textAlign: "center", fontWeight: 600 }}>
            {item.quantity}
          </span>

          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="qtyBtn"
            aria-label="Increase quantity"
          >
            <Plus style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Remove */}
        <button
          onClick={onRemove}
          className="removeBtn"
          title="Remove from cart"
          aria-label="Remove from cart"
        >
          <Trash2 style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {/* Subtotal */}
      <div className="mt-3" style={{ paddingTop: 12, borderTop: "1px solid var(--border)", textAlign: "right" }}>
        <span className="muted" style={{ fontSize: 14 }}>
          Subtotal:{" "}
          <span style={{ fontWeight: 700, color: "var(--text)" }}>
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </span>
      </div>
    </div>
  );
};

export default Cart;
