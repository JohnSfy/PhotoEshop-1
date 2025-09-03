import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Camera, User, LogOut, Sun, Moon, Menu, X, Globe, Settings } from 'lucide-react';
import { useCart } from '../../Context/CartContext';
import { useLanguage } from '../../Context/LanguageContext';
import "../Styles/Header.css";

const Header = ({ isAdmin, setIsAdmin }) => {
  const { cartCount } = useCart();
  const { t, toggleLanguage, language } = useLanguage();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminKey');
    setIsAdmin(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-primary-600' : 'text-gray-600';
  };

  return (
    <header className="header">
      <div className="header__bar">
        <Link to="/" className="header__brand">
          <Camera className="header__brandIcon" />
          <span className="header__brandText">PhotoEshop</span>
        </Link>

        <nav className="nav">
          <Link to="/" className={`nav__link ${isActive('/')}`}>{t('gallery')}</Link>
          {isAdmin && (
            <Link to="/admin" className={`nav__link ${isActive('/admin')}`}>{t('adminPanel')}</Link>
          )}
        </nav>

        <div className="header__right">
          <button onClick={toggleLanguage} className="language-toggle" title={t('switchLanguage')}>
            <Globe size={20} />
            <span className="language-code">{language.toUpperCase()}</span>
          </button>

          <button onClick={toggleTheme} className="theme-toggle" title={t('toggleTheme')}>
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link to="/cart" className="header__cart">
            <ShoppingCart className="header__cartIcon" />
            {cartCount > 0 && <span className="header__cartBadge">{cartCount}</span>}
          </Link>

          {isAdmin ? (
            <button onClick={handleLogout} className="header__btn header__btn--danger">
              <LogOut className="header__btnIcon" />
              <span className="hide-sm">{t('logout')}</span>
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
              <span className="hide-sm">{t('adminPanel')}</span>
            </button>
          )}

          <button 
            className="header__mobile-menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu" ref={mobileMenuRef}>
          <nav className="mobile-nav">
            <Link to="/" className="mobile-nav__link" onClick={() => setIsMobileMenuOpen(false)}>
              <Camera size={20} />
              {t('gallery')}
            </Link>
            {isAdmin && (
              <Link to="/admin" className="mobile-nav__link" onClick={() => setIsMobileMenuOpen(false)}>
                <Settings size={20} />
                {t('adminPanel')}
              </Link>
            )}
            
            <div className="mobile-nav__divider"></div>
            
            <Link to="/cart" className="mobile-nav__link" onClick={() => setIsMobileMenuOpen(false)}>
              <ShoppingCart size={20} />
              {t('cart')}
              {cartCount > 0 && <span className="mobile-nav__badge">{cartCount}</span>}
            </Link>
            
            <div className="mobile-nav__divider"></div>
            
            <button 
              className="mobile-nav__link mobile-nav__button" 
              onClick={() => {
                toggleLanguage();
                setIsMobileMenuOpen(false);
              }}
            >
              <Globe size={20} />
              {t('switchLanguage')} ({language.toUpperCase()})
            </button>
            
            <button 
              className="mobile-nav__link mobile-nav__button" 
              onClick={() => {
                toggleTheme();
                setIsMobileMenuOpen(false);
              }}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
              {t('toggleTheme')}
            </button>
            
            {isAdmin ? (
              <button 
                className="mobile-nav__link mobile-nav__button mobile-nav__button--danger" 
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogOut size={20} />
                {t('logout')}
              </button>
            ) : (
              <button
                className="mobile-nav__link mobile-nav__button"
                onClick={() => {
                  const adminKey = prompt('Enter admin key:');
                  if (adminKey === 'your-secret-admin-key') {
                    localStorage.setItem('adminKey', adminKey);
                    setIsAdmin(true);
                  }
                  setIsMobileMenuOpen(false);
                }}
              >
                <User size={20} />
                {t('adminPanel')}
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
