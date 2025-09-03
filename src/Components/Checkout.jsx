import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { useLanguage } from "../../Context/LanguageContext";
import "../Styles/Checkout.css";
import { ArrowLeft, CheckCircle, AlertCircle, Clock } from "lucide-react";

const MY_POS_SID = import.meta.env.VITE_MY_POS_SID || "000000000000010";
const MY_POS_WALLET = import.meta.env.VITE_MY_POS_WALLET || "61938166610";
const MY_POS_KEY_INDEX = Number(import.meta.env.VITE_MY_POS_KEY_INDEX ?? 1);
const MY_POS_SANDBOX = (import.meta.env.VITE_MY_POS_SANDBOX ?? "true") === "true";

// Base URL για absolute redirects (απαραίτητο στο myPOS)
const BASE_URL = (import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin).replace(/\/$/, "");
const RETURN_OK = `${BASE_URL}/checkout?paid=1`;
const RETURN_CANCEL = `${BASE_URL}/checkout?failed=1`;

// URL_Notify μόνο αν είναι https (sandbox requirement)
const RAW_NOTIFY = import.meta.env.VITE_MY_POS_NOTIFY_URL;
const URL_NOTIFY = RAW_NOTIFY && RAW_NOTIFY.startsWith("https://") ? RAW_NOTIFY : undefined;

console.log("myPOS config:", {
  MY_POS_SID,
  MY_POS_WALLET,
  MY_POS_KEY_INDEX,
  MY_POS_SANDBOX,
  BASE_URL,
  URL_NOTIFY,
});

const Checkout = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { t } = useLanguage();

  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [orderStatus, setOrderStatus] = useState("pending");
  const [orderId, setOrderId] = useState(null);
  const [myposReady, setMyposReady] = useState(false);
  const [iframeVisible, setIframeVisible] = useState(false);

  const containerRef = useRef(null);

  // Αν το καλάθι είναι άδειο → γύρνα πίσω
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) navigate("/cart");
  }, [cartItems, navigate]);

  useEffect(() => {
    if (orderStatus === "completed") {
      alert("✅ Η πληρωμή ολοκληρώθηκε επιτυχώς!");
      navigate("/"); // redirect στο homepage
    }
  }, [orderStatus, navigate]);

  // Διάβασε το result του redirect (?paid=1 | ?failed=1)
  useEffect(() => {
    const q = new URLSearchParams(search);
    if (q.get("paid") === "1") {
      setOrderStatus("completed");
      clearCart();
      setIframeVisible(false);

      // Alert και redirect
      alert("✅ Η πληρωμή ολοκληρώθηκε επιτυχώς!");
      navigate("/", { replace: true }); // redirect στο homepage
    } else if (q.get("failed") === "1") {
      setOrderStatus("failed");
      setIframeVisible(false);

      // Προαιρετικό alert για αποτυχία
      alert("❌ Η πληρωμή απέτυχε. Δοκίμασε ξανά.");
    }
  }, [search, clearCart]);


  // Φόρτωσε δυναμικά το myPOS Embedded SDK
  useEffect(() => {
    if (window.MyPOSEmbedded) {
      setMyposReady(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://developers.mypos.com/repository/mypos-embedded-sdk.js";
    s.async = true;
    s.onload = () => setMyposReady(true);
    s.onerror = () => setPaymentError(t('failedToLoadMyPOS'));
    document.body.appendChild(s);
  }, []);

  useEffect(() => {
    if (orderStatus === "completed") {
      navigate("/"); // redirect αμέσως στο homepage
    }
  }, [orderStatus, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPaymentError("");

    if (!customerName || !customerEmail) {
      setPaymentError(t('pleaseFillRequiredFields'));
      return;
    }
    if (!myposReady) {
      setPaymentError(t('myPOSStillLoading'));
      return;
    }

    setIsProcessing(true);

    try {
      // ΠΑΝΤΑ μοναδικό orderID στο shared sandbox
      const _orderId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      setOrderId(_orderId);

      // Μετατροπή cart σε cartItems του myPOS
      const cartLines = cartItems.map((it) => ({
        article: it.filename || it.title || t('photo'),
        quantity: it.quantity || 1,
        price: Number(it.price),
        currency: "EUR",
      }));

      const paymentParams = {
        sid: MY_POS_SID,
        ipcLanguage: "en",
        walletNumber: MY_POS_WALLET,
        keyIndex: MY_POS_KEY_INDEX,
        amount: Number(cartTotal.toFixed(2)),
        currency: "EUR",
        orderID: _orderId,
        urlOk: RETURN_OK,
        urlCancel: RETURN_CANCEL,
        ...(URL_NOTIFY ? { urlNotify: URL_NOTIFY } : {}),
        cartItems: cartLines,
      };

      const callbackParams = {
        isSandbox: MY_POS_SANDBOX,
        // Προαιρετικά: θα κληθούν ΜΟΝΟ όσο είσαι ακόμα μέσα στη σελίδα.
        onSuccess: () => {
          // Κλείσε το iframe, καθάρισε καλάθι, ενημέρωσε UI και κάνε redirect
          setIframeVisible(false);
          clearCart();
          alert("✅ Η πληρωμή ολοκληρώθηκε επιτυχώς!");
          navigate("/", { replace: true });
          // αν θες, setOrderStatus("completed") για να πυροδοτήσεις και το δικό σου state
          setOrderStatus("completed");
        },
        onError: () => {
          // Αν δεν γίνει redirect, δείξε failed
          setOrderStatus("failed");
          setPaymentError(t('paymentError'));
        },
      };

      setIframeVisible(true);

      const resp = await fetch("http://localhost:3000/mypos/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentParams),
      });
      const { signature } = await resp.json();

      window.MyPOSEmbedded.createPayment("myPOSEmbeddedCheckout",
        { ...paymentParams, signature },
        callbackParams
      );

    } catch (err) {
      setPaymentError(err?.message || t('checkoutFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  // if (orderStatus === "completed") {
  //   return (
  //     <div className="checkout text-center p-6" style={{ maxWidth: 720, margin: "0 auto" }}>
  //       <CheckCircle style={{ width: 64, height: 64, color: "var(--green)" }} />
  //       <h1 className="checkoutTitle mt-3">Payment Successful! 🎉</h1>
  //       <p className="muted mb-4" style={{ fontSize: 16 }}>
  //         Thank you for your purchase! Your clean photos have been sent to your email.
  //       </p>
  //       <button onClick={() => navigate("/")} className="btn btn--primary" style={{ marginTop: 16 }}>
  //         Return to Gallery
  //       </button>
  //     </div>
  //   );
  // }

  if (orderStatus === "failed") {
    return (
      <div className="checkout text-center p-6" style={{ maxWidth: 720, margin: "0 auto" }}>
        <AlertCircle style={{ width: 64, height: 64, color: "#ef4444" }} />
        <h1 className="checkoutTitle mt-3">Payment Failed</h1>
        <p className="muted mb-4" style={{ fontSize: 16 }}>
          Your payment was not completed. Please try again.
        </p>
        <button
          onClick={() => {
            setOrderStatus("pending");
            setOrderId(null);
            setIframeVisible(false);
            navigate("/checkout", { replace: true });
          }}
          className="btn btn--primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="checkout">
      {/* Header */}
      <div className="checkoutHeader">
        <button onClick={() => navigate("/cart")} className="btn btn--secondary" aria-label={t('backToCart')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="checkoutTitle">{t('checkout')}</h1>
          <p className="checkoutSubtitle">{t('paySafelyWithMyPOS')}</p>
        </div>
      </div>

      <div className="grid grid--2">
        {/* Form */}
        <div className="grid-col">
          <div className="checkout__form">
            <h2>{t('customerInformation')}</h2>
            <form onSubmit={handleSubmit} className="summaryList">
              <div className="form__group">
                <label className="form__label">{t('fullName')} *</label>
                <input 
                  className="form__input" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form__group">
                <label className="form__label">{t('emailAddress')} *</label>
                <input 
                  type="email" 
                  className="form__input" 
                  value={customerEmail} 
                  onChange={(e) => setCustomerEmail(e.target.value)} 
                  required 
                />
                <p className="form__help">{t('weWillSendPhotosHere')}</p>
              </div>

              {paymentError && (
                <div className="notice notice--red" style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                  <AlertCircle size={18} />
                  <span>{paymentError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing || !myposReady}
                className="btn btn--primary"
                style={{ width: "100%", padding: "var(--space-md) var(--space-lg)", fontSize: "1rem", opacity: isProcessing ? 0.7 : 1 }}
              >
                {t('proceedToPayment')} - €{cartTotal.toFixed(2)}
              </button>
            </form>
          </div>

          {/* Status */}
          {orderId && iframeVisible && (
            <div className="notice notice--yellow">
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                <Clock size={18} />
                <div style={{ fontSize: "0.875rem" }}>
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>{t('orderCreated')}</p>
                  <p>{t('orderId')}: {orderId}</p>
                  <p>{t('loadingPaymentForm')}…</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order summary + Payment container */}
        <div className="grid-col">
          <div className="checkout__summary">
            <h3>{t('orderSummary')}</h3>
            <div className="summaryList">
              <div className="summaryRow">
                <span>{t('photos')} ({cartItems.length})</span>
                <span>€{cartTotal.toFixed(2)}</span>
              </div>
              <div className="summaryRow">
                <span>{t('fees')}</span>
                <span>{t('free')}</span>
              </div>
              <div className="summaryTotal">
                <span>{t('total')}</span>
                <span style={{ color: "var(--primary)" }}>€{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="checkout__form">
            <h4 style={{ fontWeight: 600, marginBottom: "var(--space-lg)" }}>{t('payment')}</h4>
            <div
              id="myPOSEmbeddedCheckout"
              ref={containerRef}
              className="payment__container"
              style={{
                display: iframeVisible ? "block" : "none",
              }}
            />
            {!iframeVisible && (
              <div className="payment__container">
                <div className="payment__loading">
                  <Clock className="payment__loading-icon" />
                  <p>{t('clickProceedToPayment')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
