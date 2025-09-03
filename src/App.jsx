import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Components/Header';
import PhotoGallery from './Components/PhotoGallery';
import Cart from './Components/Cart';
import Checkout from './Components/Checkout';
import AdminPanel from './Components/AdminPanel';
import { CartProvider } from '../Context/CartContext';
import { PhotoProvider } from '../Context/PhotoContext';
import { LanguageProvider } from '../Context/LanguageContext';
import "./Styles/base.css";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  // Simple admin check (in production, use proper authentication)
  useEffect(() => {
    const adminKey = localStorage.getItem('adminKey');
    console.log("🔑 Admin key check:", adminKey);
    if (adminKey === 'your-secret-admin-key') {
      console.log("✅ Admin access granted");
      setIsAdmin(true);
    } else {
      console.log("❌ Admin access denied");
    }
  }, []);

  console.log("🏗️ App render - isAdmin:", isAdmin);

  return (
    <div className="app">
      <LanguageProvider>
        <PhotoProvider>
          <CartProvider>
            <Header isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<PhotoGallery />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </main>
          </CartProvider>
        </PhotoProvider>
      </LanguageProvider>
    </div>
  );
}

export default App;
