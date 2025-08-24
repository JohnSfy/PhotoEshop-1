import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Camera, User, LogOut } from 'lucide-react';
import { useCart } from '../../Context/CartContext';
import "../Styles/Header.css";

const Header = ({ isAdmin, setIsAdmin }) => {
  const { cartCount } = useCart();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminKey');
    setIsAdmin(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-primary-600' : 'text-gray-600';
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header__bar">
          <Link to="/" className="header__brand">
            <Camera className="header__brandIcon" />
            <span className="header__brandText">Event Photos</span>
          </Link>

          <nav className="nav">
            <Link to="/" className={`nav__link ${isActive('/')}`}>Gallery</Link>
            {isAdmin && (
              <Link to="/admin" className={`nav__link ${isActive('/admin')}`}>Admin Panel</Link>
            )}
          </nav>

          <div className="header__right">
            <Link to="/cart" className="header__cart">
              <ShoppingCart className="header__cartIcon" />
              {cartCount > 0 && <span className="header__cartBadge">{cartCount}</span>}
            </Link>

            {isAdmin ? (
              <button onClick={handleLogout} className="header__btn header__btn--danger">
                <LogOut className="header__btnIcon" />
                <span className="hide-sm">Logout</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  const adminKey = prompt('Enter admin key:');
                  if (adminKey === 'your-secret-admin-key') {
                    localStorage.setItem('adminKey', adminKey);
                    setIsAdmin(true);
                  }
                }}
                className="header__btn"
              >
                <User className="header__btnIcon" />
                <span className="hide-sm">Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
