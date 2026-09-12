import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  
  const categories = ['All', 'electronics', 'clothing', 'home', 'books', 'sports', 'beauty', 'toys', 'food', 'other'];

  const fetchProducts = async (searchQuery = '', catQuery = '') => {
    setLoading(true);
    try {
      let url = '/products?limit=24';
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (catQuery && catQuery !== 'All') url += `&category=${catQuery}`;
      
      const res = await apiClient.get(url);
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(search, category);
  }, [category]); // Re-fetch on category change

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(search, category);
  };

  const handleAddToCart = async (product) => {
    try {
      await apiClient.post('/cart/items', { productId: product._id, quantity: 1 });
      alert('Added to cart!');
    } catch (err) {
      alert(err.message || 'Error adding to cart (Please login first)');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 className="page-title">Explore Products</h1>
      
      {/* Filters & Search */}
      <div className="glass-panel" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ flexGrow: 1, display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flexGrow: 1 }}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
        
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: 'auto', minWidth: '200px' }}
        >
          {categories.map(c => (
            <option key={c} value={c}>{c === 'All' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center" style={{ padding: '4rem 0' }}><div className="spinner"></div></div>
      ) : products.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3>No products found.</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-2 gap-6">
          {products.map(product => (
            <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
