import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';
import CategoryStrip from '../components/CategoryStrip';
import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiClient.get('/products?limit=24&sort=newest');
        setProducts(res.data);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    try {
      await apiClient.post('/cart/items', { productId: product._id, quantity: 1 });
      alert('Added to cart!');
    } catch (err) {
      alert(err.message || 'Error adding to cart');
    }
  };

  // Helper function to extract specific categories
  const getCategoryProducts = (categoryName, count = 4) => {
    return products.filter(p => p.category === categoryName).slice(0, count);
  };

  const electronics = getCategoryProducts('electronics');
  const clothing = getCategoryProducts('clothing');
  const home = getCategoryProducts('home');
  const toys = getCategoryProducts('toys');

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      <CategoryStrip />

      <div className="container" style={{ marginTop: '1.5rem' }}>
        
        {/* Massive Hero Banner Carousel Placeholder */}
        <div style={{ width: '100%', height: '300px', background: 'url(https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000&auto=format&fit=crop) center/cover no-repeat', borderRadius: '8px', position: 'relative', overflow: 'hidden', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7), transparent)' }}></div>
          <div style={{ position: 'relative', zIndex: 1, padding: '3rem', color: '#fff' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>The Big Festive Sale</h2>
            <p style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Up to 80% Off on Electronics & Fashion</p>
            <Link to="/products" className="btn" style={{ background: '#f59e0b', color: '#000', padding: '0.75rem 2rem', fontSize: '1.1rem' }}>Shop Now</Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center" style={{ padding: '4rem 0' }}><div className="spinner"></div></div>
        ) : (
          <>
            {/* Amazon Style Promotional Dense Blocks */}
            <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '2rem' }}>
              
              <div className="glass-panel" style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#111827' }}>Electronics | Top Brands</h3>
                <div className="promo-grid">
                  {electronics.map(p => (
                    <div key={p._id}>
                      <img src={p.images[0] || 'https://via.placeholder.com/200'} alt={p.title} />
                      <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</span>
                    </div>
                  ))}
                </div>
                <Link to="/products?category=electronics" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--secondary-hover)' }}>See all deals</Link>
              </div>

              <div className="glass-panel" style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#111827' }}>Starting ₹149 | Latest Styles</h3>
                <div className="promo-grid">
                  {clothing.map(p => (
                    <div key={p._id}>
                      <img src={p.images[0] || 'https://via.placeholder.com/200'} alt={p.title} />
                      <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</span>
                    </div>
                  ))}
                </div>
                <Link to="/products?category=clothing" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--secondary-hover)' }}>Shop Fashion</Link>
              </div>

              <div className="glass-panel" style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#111827' }}>Min 50% Off | Appliances</h3>
                <div className="promo-grid">
                  {home.map(p => (
                    <div key={p._id}>
                      <img src={p.images[0] || 'https://via.placeholder.com/200'} alt={p.title} />
                      <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</span>
                    </div>
                  ))}
                </div>
                <Link to="/products?category=home" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--secondary-hover)' }}>Explore Home</Link>
              </div>

              <div className="glass-panel" style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#111827' }}>New Arrivals | Toys & Games</h3>
                <div className="promo-grid">
                  {toys.map(p => (
                    <div key={p._id}>
                      <img src={p.images[0] || 'https://via.placeholder.com/200'} alt={p.title} />
                      <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</span>
                    </div>
                  ))}
                </div>
                <Link to="/products?category=toys" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--secondary-hover)' }}>Shop Toys</Link>
              </div>
            </div>

            {/* Horizontal Scroller Section */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem' }}>Today's Deals</h2>
                <Link to="/products" style={{ color: 'var(--secondary-hover)', fontWeight: 500, fontSize: '0.9rem' }}>See all deals</Link>
              </div>
              <div className="horizontal-scroll">
                {products.map(product => (
                  <div key={product._id} style={{ width: '220px', flexShrink: 0 }}>
                    <ProductCard product={product} onAddToCart={handleAddToCart} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Standard Grid */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>More Items to Explore</h2>
              <div className="grid grid-cols-5 gap-4">
                {products.slice(0, 10).map(product => (
                  <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
