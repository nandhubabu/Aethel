import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';
import { Sparkles, Tag, Grid } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Parse category from URL
  const queryParams = new URLSearchParams(location.search);
  const urlCategory = queryParams.get('category') || 'All';
  const [activeCategory, setActiveCategory] = useState(urlCategory);

  const categories = ['All', 'electronics', 'clothing', 'home', 'books', 'sports', 'beauty', 'toys', 'food', 'other'];

  const fetchProducts = async (catQuery) => {
    setLoading(true);
    try {
      let url = '/products?limit=50';
      if (catQuery && catQuery !== 'All') url += `&category=${catQuery}`;
      
      const res = await apiClient.get(url);
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  // When URL changes, update category and fetch
  useEffect(() => {
    const currentCat = queryParams.get('category') || 'All';
    setActiveCategory(currentCat);
    fetchProducts(currentCat);
  }, [location.search]);

  const handleCategoryClick = (cat) => {
    if (cat === 'All') {
      navigate('/products');
    } else {
      navigate(`/products?category=${cat}`);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await apiClient.post('/cart/items', { productId: product._id, quantity: 1 });
    } catch (err) {
      alert(err.message || 'Error adding to cart (Please login first)');
    }
  };

  // Logic to separate "Top Offers" (where compareAtPrice is significantly higher than price)
  // For seed data without compareAtPrice, we can simulate offers or just use actual compareAtPrice if it exists.
  const offers = products.filter(p => (p.compareAtPrice && p.compareAtPrice > p.price) || p.price < 2000); // Temporary logic for seed data to show some offers
  const regularProducts = products.filter(p => !offers.includes(p));

  // Capitalize category name for display
  const displayCategory = activeCategory === 'All' ? 'All Products' : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '4rem', paddingTop: '2rem' }}>

      <div className="container" style={{ maxWidth: '1400px' }}>
        
        {/* Category Filter Chips */}
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem', scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '50px',
                border: cat === activeCategory ? 'none' : '1px solid #d1d5db',
                background: cat === activeCategory ? 'var(--primary)' : '#fff',
                color: cat === activeCategory ? '#fff' : '#4b5563',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center" style={{ padding: '4rem 0' }}><div className="spinner"></div></div>
        ) : products.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>No products found in {displayCategory}.</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try selecting a different category.</p>
          </div>
        ) : (
          <>
            {/* Top Offers Section */}
            {offers.length > 0 && (
              <div style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <Tag size={24} color="#e11d48" />
                  <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827' }}>Top Offers</h2>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-2 gap-6">
                  {offers.map(product => (
                    <div key={product._id} style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#e11d48', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '600', zIndex: 10 }}>
                        HOT DEAL
                      </div>
                      <ProductCard product={product} onAddToCart={handleAddToCart} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Products Section */}
            {regularProducts.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#374151', marginBottom: '1.5rem' }}>
                  {offers.length > 0 ? 'More to Explore' : 'All Items'}
                </h2>
                <div className="grid grid-cols-4 sm:grid-cols-2 gap-6">
                  {regularProducts.map(product => (
                    <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
