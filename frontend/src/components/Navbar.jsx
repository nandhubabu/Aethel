import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, User, LogOut, Package, Search, Menu } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header>
      {/* Main Navbar */}
      <nav className="navbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
          {/* Brand */}
          <Link to="/" className="nav-brand" style={{ fontSize: '1.75rem', color: '#fff', display: 'flex', alignItems: 'center' }}>
            Aethel
          </Link>
          
          {/* Search Bar (Center) */}
          <form onSubmit={handleSearch} className="nav-search" style={{ flexGrow: 1, maxWidth: '800px', display: 'flex' }}>
            <select style={{ width: 'auto', padding: '0.6rem', borderRight: '1px solid #ccc', borderRadius: '4px 0 0 4px', background: '#f3f4f6', color: '#374151' }}>
              <option>All</option>
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Home</option>
            </select>
            <input 
              type="text" 
              placeholder="Search Aethel.in" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flexGrow: 1, borderRadius: 0, border: 'none', padding: '0.6rem 1rem' }}
            />
            <button type="submit" style={{ background: 'var(--secondary)', padding: '0.6rem 1.25rem', borderRadius: '0 4px 4px 0', border: 'none', cursor: 'pointer', color: '#111827' }}>
              <Search size={20} />
            </button>
          </form>

          {/* Links (Right) */}
          <div className="nav-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', color: '#fff' }}>
            {user ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <span style={{ color: '#d1d5db' }}>Hello, {user.name}</span>
                  <span style={{ fontWeight: 'bold' }}>Account & Lists</span>
                </div>

                <Link to="/cart" className="flex items-center gap-1" style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  <ShoppingCart size={28} />
                  <span>Cart</span>
                </Link>

                {user.role === 'vendor' && (
                  <Link to="/vendor/dashboard" className="flex items-center gap-1" style={{ color: '#fff', fontWeight: 'bold' }}>
                    <Package size={20} />
                    <span>Dashboard</span>
                  </Link>
                )}

                <button onClick={handleLogout} style={{ background: 'none', color: '#d1d5db', cursor: 'pointer' }}>
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem', color: '#fff' }}>
                  <span style={{ color: '#d1d5db' }}>Hello, sign in</span>
                  <span style={{ fontWeight: 'bold' }}>Account & Lists</span>
                </Link>
                <Link to="/cart" className="flex items-center gap-1" style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  <ShoppingCart size={28} />
                  <span>Cart</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Secondary Navbar */}
      <div style={{ background: '#232f3e', color: '#fff', padding: '0.4rem 0', fontSize: '0.9rem' }}>
        <div className="container" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div className="flex items-center gap-1" style={{ fontWeight: 'bold', cursor: 'pointer' }}>
            <Menu size={20} /> All
          </div>
          <Link to="/products" style={{ color: '#fff' }}>Today's Deals</Link>
          <Link to="/products?category=electronics" style={{ color: '#fff' }}>Electronics</Link>
          <Link to="/products?category=clothing" style={{ color: '#fff' }}>Fashion</Link>
          <Link to="/products?category=home" style={{ color: '#fff' }}>Home & Kitchen</Link>
          <Link to="/products?category=books" style={{ color: '#fff' }}>Books</Link>
          <Link to="/products" style={{ color: '#fff' }}>Customer Service</Link>
          <Link to="/register" style={{ color: '#fff' }}>Sell on Aethel</Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
