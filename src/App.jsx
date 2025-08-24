import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Components/Header';
import PhotoGallery from './Components/PhotoGallery';
import Cart from './Components/Cart';
import Checkout from './Components/Checkout';
import AdminPanel from './Components/AdminPanel';
import { CartProvider } from '../Context/CartContext';
import { PhotoProvider } from '../Context/PhotoContext';
import "./Styles/base.css";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  // Simple admin check (in production, use proper authentication)
  useEffect(() => {
    const adminKey = localStorage.getItem('adminKey');
    if (adminKey === 'your-secret-admin-key') {
      setIsAdmin(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <PhotoProvider>
        <CartProvider>
          <Header isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<PhotoGallery />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              {isAdmin && <Route path="/admin" element={<AdminPanel />} />}
            </Routes>
          </main>
        </CartProvider>
      </PhotoProvider>
    </div>
  );
}

export default App;
