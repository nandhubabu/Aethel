import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiClient.get('/products?limit=8&sort=newest');
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

  return (
    <div className="container">
      {/* Hero Section */}
      <section style={{ 
        padding: '6rem 0', 
        textAlign: 'center',
        background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, rgba(10, 10, 12, 0) 70%)'
      }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1.5rem', background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Discover the Extraordinary
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          Aethel is the premium marketplace for curated, high-quality products from independent creators and top brands.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/products" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Shop Collection
          </Link>
          <Link to="/register" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Become a Vendor
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '4rem 0' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem' }}>New Arrivals</h2>
          <Link to="/products" style={{ color: 'var(--primary)', fontWeight: 500 }}>View All &rarr;</Link>
        </div>

        {loading ? (
          <div className="flex justify-center" style={{ padding: '4rem 0' }}><div className="spinner"></div></div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-2 gap-6">
            {products.map(product => (
              <ProductCard 
                key={product._id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
