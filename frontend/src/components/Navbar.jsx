import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, User, LogOut, Package } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand">
          Aethel
        </Link>
        <div className="nav-links">
          <Link to="/products" className="nav-link">Explore</Link>
          
          {user ? (
            <>
              {user.role === 'vendor' && (
                <Link to="/vendor/dashboard" className="nav-link flex items-center gap-2">
                  <Package size={18} /> Dashboard
                </Link>
              )}
              <Link to="/cart" className="nav-link flex items-center gap-2">
                <ShoppingCart size={18} /> Cart
              </Link>
              <div className="nav-link flex items-center gap-2" style={{ cursor: 'default', color: 'var(--text-main)' }}>
                <User size={18} /> {user.name}
              </div>
              <button onClick={handleLogout} className="nav-link flex items-center gap-2" style={{ background: 'none' }}>
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
