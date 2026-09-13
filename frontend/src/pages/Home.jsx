import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';
import CategoryStrip from '../components/CategoryStrip';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const banners = [
  {
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000&auto=format&fit=crop',
    title: 'The Big Festive Sale',
    subtitle: 'Up to 80% Off on Electronics & Fashion',
    link: '/products?category=electronics',
    buttonText: 'Shop Now'
  },
  {
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2000&auto=format&fit=crop',
    title: 'Upgrade Your Workspace',
    subtitle: 'Premium Furniture & Ergonomic Chairs',
    link: '/products?category=home',
    buttonText: 'Explore Home'
  },
  {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2000&auto=format&fit=crop',
    title: 'Level Up Your Game',
    subtitle: 'Top tier Sports Gear & Footwear',
    link: '/products?category=sports',
    buttonText: 'View Collection'
  }
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

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

  // Auto-rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide(prev => (prev === banners.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide(prev => (prev === 0 ? banners.length - 1 : prev - 1));
  const goToSlide = (index) => setCurrentSlide(index);

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
        
        {/* Interactive Hero Carousel */}
        <div style={{ 
          width: '100%', height: '350px', 
          backgroundImage: `url("${banners[currentSlide].image}")`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          borderRadius: '12px', position: 'relative', overflow: 'hidden', 
          marginBottom: '2rem', display: 'flex', alignItems: 'center',
          transition: 'background-image 0.5s ease-in-out'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.2))' }}></div>
          
          {/* Navigation Arrows */}
          <button onClick={prevSlide} style={{ position: 'absolute', left: '1rem', zIndex: 2, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', padding: '0.5rem', color: '#fff', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
            <ChevronLeft size={32} />
          </button>
          <button onClick={nextSlide} style={{ position: 'absolute', right: '1rem', zIndex: 2, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', padding: '0.5rem', color: '#fff', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
            <ChevronRight size={32} />
          </button>

          <div style={{ position: 'relative', zIndex: 1, padding: '4rem', color: '#fff', maxWidth: '600px' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff', lineHeight: 1.1 }}>{banners[currentSlide].title}</h2>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>{banners[currentSlide].subtitle}</p>
            <Link to={banners[currentSlide].link} className="btn" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', padding: '0.75rem 2.5rem', fontSize: '1.1rem', borderRadius: '50px', border: 'none', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)' }}>
              {banners[currentSlide].buttonText}
            </Link>
          </div>

          {/* Dots */}
          <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 2 }}>
            {banners.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => goToSlide(idx)}
                style={{ 
                  width: idx === currentSlide ? '24px' : '8px', 
                  height: '8px', 
                  borderRadius: '4px', 
                  background: idx === currentSlide ? '#f59e0b' : 'rgba(255,255,255,0.5)', 
                  border: 'none', 
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }} 
              />
            ))}
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
