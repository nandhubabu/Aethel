import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Search, Menu, X, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsMobileMenuOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header>
      {/* Main Navbar */}
      <nav className="navbar">
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          
          {/* Top Row: Brand & Mobile Toggles */}
          <div className="nav-brand-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 auto', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                className="mobile-menu-btn" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{ background: 'transparent', border: 'none', color: '#fff', display: 'none' }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link to="/" className="nav-brand" style={{ fontSize: '1.75rem', color: '#fff', display: 'flex', alignItems: 'center' }}>
                Aethel
              </Link>
            </div>
            
            <div className="mobile-only" style={{ display: 'none', gap: '1rem', alignItems: 'center' }}>
              <Link to="/profile" style={{ color: '#fff' }}><User size={24} /></Link>
              <Link to="/cart" style={{ color: '#fff', position: 'relative' }}>
                <ShoppingCart size={24} />
              </Link>
            </div>
          </div>
          
          {/* Search Bar (Center) */}
          <form onSubmit={handleSearch} className="nav-search" style={{ flexGrow: 1, maxWidth: '800px', display: 'flex' }}>
            <select className="desktop-only" style={{ width: 'auto', padding: '0.6rem', borderRight: '1px solid #ccc', borderRadius: '4px 0 0 4px', background: '#f3f4f6', color: '#374151' }}>
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
              style={{ flexGrow: 1, borderRadius: '4px 0 0 4px', border: 'none', padding: '0.6rem 1rem' }}
              className="search-input"
            />
            <button type="submit" style={{ background: 'var(--secondary)', padding: '0.6rem 1.25rem', borderRadius: '0 4px 4px 0', border: 'none', cursor: 'pointer', color: '#111827' }}>
              <Search size={20} />
            </button>
          </form>

          {/* Links (Right - Desktop Only) */}
          <div className="nav-links desktop-only" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', color: '#fff' }}>
            {user ? (
              <>
                <div className="dropdown" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <span style={{ color: '#d1d5db' }}>Hello, {user.name}</span>
                    <span style={{ fontWeight: 'bold' }}>Account & Lists</span>
                  </div>
                  <div className="dropdown-content">
                    <div style={{ padding: '8px 16px', fontWeight: 'bold', fontSize: '0.95rem' }}>Your Account</div>
                    <Link to="/profile">Your Profile</Link>
                    <Link to="/orders">Your Orders</Link>
                    <Link to="/wishlist">Your Wishlist</Link>
                    {user.role === 'vendor' && (
                      <>
                        <hr />
                        <div style={{ padding: '8px 16px', fontWeight: 'bold', fontSize: '0.95rem' }}>Seller Hub</div>
                        <Link to="/vendor/dashboard">Vendor Dashboard</Link>
                        <Link to="/vendor/products/new">Add Product</Link>
                      </>
                    )}
                    <hr />
                    <button onClick={handleLogout} style={{ color: '#dc2626', fontWeight: '500' }}>
                      Sign Out
                    </button>
                  </div>
                </div>

                <Link to="/orders" className="flex items-center gap-1" style={{ color: '#fff', fontSize: '0.9rem', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ color: '#d1d5db', fontSize: '0.8rem' }}>Returns</span>
                  <span style={{ fontWeight: 'bold' }}>& Orders</span>
                </Link>

                <Link to="/cart" className="flex items-center gap-1" style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  <ShoppingCart size={28} />
                  <span>Cart</span>
                </Link>
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

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-menu" style={{ background: '#232f3e', color: '#fff', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {user ? (
            <>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>
                Hello, {user.name}
              </div>
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#fff' }}>Your Profile</Link>
              <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#fff' }}>Your Orders</Link>
              <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#fff' }}>Your Wishlist</Link>
              {user.role === 'vendor' && (
                <>
                  <Link to="/vendor/dashboard" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#fff', color: 'var(--secondary)' }}>Vendor Dashboard</Link>
                  <Link to="/vendor/products/new" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#fff', color: 'var(--secondary)' }}>Add Product</Link>
                </>
              )}
              <button onClick={handleLogout} style={{ textAlign: 'left', color: '#ef4444', background: 'none', border: 'none', fontSize: '1rem', padding: 0 }}>Sign Out</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--secondary)', fontSize: '1.2rem', fontWeight: 'bold' }}>Sign In</Link>
          )}
        </div>
      )}

      {/* Secondary Navbar */}
      <div className="secondary-navbar" style={{ background: '#232f3e', color: '#fff', padding: '0.4rem 0', fontSize: '0.9rem' }}>
        <div className="container horizontal-scroll" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', maxWidth: '100%', padding: '0 1.5rem', paddingBottom: 0 }}>
          <div className="flex items-center gap-1 desktop-only" style={{ fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <Menu size={20} /> All
          </div>
          <Link to="/products" style={{ color: '#fff', whiteSpace: 'nowrap' }}>Today's Deals</Link>
          <Link to="/products?category=electronics" style={{ color: '#fff', whiteSpace: 'nowrap' }}>Electronics</Link>
          <Link to="/products?category=clothing" style={{ color: '#fff', whiteSpace: 'nowrap' }}>Fashion</Link>
          <Link to="/products?category=home" style={{ color: '#fff', whiteSpace: 'nowrap' }}>Home & Kitchen</Link>
          <Link to="/products?category=books" style={{ color: '#fff', whiteSpace: 'nowrap' }}>Books</Link>
          <Link to="/products" style={{ color: '#fff', whiteSpace: 'nowrap' }}>Customer Service</Link>
          <Link to="/register" style={{ color: '#fff', whiteSpace: 'nowrap' }}>Sell on Aethel</Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
