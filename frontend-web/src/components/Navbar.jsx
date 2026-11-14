import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart } from 'lucide-react';

export default function Navbar({ currentPath, navigate, user, onLogout, cartCount }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/products' },
    { label: 'Track Order', path: '/track' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <nav className="navbar">
      <div className="logo-container" onClick={() => navigate('/')}>
        <img src="/swadbox_logo.png" alt="SwadBox" className="logo-img" />
      </div>

      <div className="nav-links">
        {navItems.map((item) => (
          <span
            key={item.path}
            className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </span>
        ))}
      </div>

      <div className="nav-actions">
        <button className="cart-btn" onClick={() => navigate('/cart')}>
          <ShoppingCart size={16} />
          Cart
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>

        {user ? (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div
              className="user-avatar"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {(user.full_name || user.email || 'U')[0].toUpperCase()}
            </div>

            {dropdownOpen && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">Signed in as</div>
                <div className="user-dropdown-email">{user.email}</div>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/orders');
                  }}
                >
                  My Orders
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/track');
                  }}
                >
                  Track Delivery 🛵
                </button>
                <button
                  className="dropdown-item logout"
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="login-btn" onClick={() => navigate('/login')}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

