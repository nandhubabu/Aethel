import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import UserSidebar from '../components/UserSidebar';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('aethel_wishlist');
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse wishlist', e);
      }
    }
  }, []);

  const removeFromWishlist = (productId) => {
    const updated = wishlist.filter(item => item._id !== productId);
    setWishlist(updated);
    localStorage.setItem('aethel_wishlist', JSON.stringify(updated));
  };

  const handleAddToCart = async (product) => {
    try {
      await apiClient.post('/cart/items', { productId: product._id, quantity: 1 });
      alert('Added to cart!');
      removeFromWishlist(product._id);
    } catch (err) {
      alert(err.message || 'Error adding to cart');
    }
  };

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '1400px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
          
          {/* Sidebar */}
          <div>
            <UserSidebar />
          </div>

          {/* Main Content */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.8rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Your Wishlist
              </h1>
              <span style={{ color: '#6b7280', fontSize: '1.1rem' }}>{wishlist.length} item{wishlist.length !== 1 ? 's' : ''}</span>
            </div>
            
            {wishlist.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '4rem 2rem', textAlign: 'center' }}>
                <Heart size={64} style={{ margin: '0 auto 1.5rem', color: '#d1d5db' }} />
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#111827' }}>Your wishlist is empty</h2>
                <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '1.1rem' }}>Save items you love here by clicking the heart icon on products.</p>
                <Link to="/products" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>Explore Products</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {wishlist.map(item => (
                  <div key={item._id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    
                    <div style={{ position: 'relative' }}>
                      <Link to={`/products/${item._id}`} style={{ display: 'block', paddingTop: '100%', position: 'relative', background: '#f9fafb' }}>
                        <img src={item.images?.[0] || 'https://via.placeholder.com/200'} alt={item.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#fff', padding: '1rem' }} />
                      </Link>
                      <button 
                        onClick={() => removeFromWishlist(item._id)}
                        style={{ position: 'absolute', top: '8px', right: '8px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                        title="Remove from wishlist"
                      >
                        <Trash2 size={16} color="#dc2626" />
                      </button>
                    </div>
                    
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <Link to={`/products/${item._id}`}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem', color: '#111827', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.8em' }}>
                          {item.title}
                        </h3>
                      </Link>
                      
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>₹{item.price?.toFixed(2)}</span>
                      </div>
                      
                      <div style={{ fontSize: '0.85rem', color: item.stock > 0 ? '#059669' : '#dc2626', marginBottom: '1rem', fontWeight: '500' }}>
                        {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </div>

                      <button 
                        onClick={() => handleAddToCart(item)}
                        disabled={item.stock <= 0}
                        className="btn btn-primary"
                        style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', marginTop: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <ShoppingCart size={16} /> Add to Cart
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Wishlist;
