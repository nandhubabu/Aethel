import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Star, ShoppingCart, Minus, Plus } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await apiClient.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await apiClient.post('/cart/items', { productId: product._id, quantity });
      navigate('/cart');
    } catch (err) {
      alert(err.message || 'Error adding to cart (Please login first)');
    }
  };

  if (loading) return <div className="container flex justify-center" style={{ marginTop: '4rem' }}><div className="spinner"></div></div>;
  if (error || !product) return <div className="container" style={{ marginTop: '4rem' }}><div className="alert alert-error">{error}</div></div>;

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <img 
            src={product.images?.[0] || 'https://via.placeholder.com/600'} 
            alt={product.title} 
            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', aspectRatio: '1/1' }}
          />
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
            Vendor: {product.vendor?.vendorProfile?.storeName || product.vendor?.name}
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: 1.2 }}>{product.title}</h1>
          
          <div className="flex items-center gap-4" style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>${product.price.toFixed(2)}</span>
            <div className="flex items-center gap-1" style={{ color: 'var(--warning)' }}>
              <Star size={18} fill="currentColor" />
              <span>{product.averageRating > 0 ? product.averageRating.toFixed(1) : 'No reviews'}</span>
            </div>
          </div>

          <div className="glass-panel" style={{ marginBottom: '2rem' }}>
            <p style={{ whiteSpace: 'pre-line', color: 'var(--text-muted)' }}>{product.description}</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <span style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Quantity</span>
            <div className="flex items-center gap-2" style={{ width: 'fit-content', background: 'var(--bg-surface-elevated)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="btn" style={{ padding: '0.5rem' }}><Minus size={18} /></button>
              <span style={{ width: '3rem', textAlign: 'center', fontWeight: 'bold' }}>{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="btn" style={{ padding: '0.5rem' }}><Plus size={18} /></button>
            </div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{product.stock} items available in stock</p>
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn btn-primary flex items-center justify-center gap-2" 
            style={{ padding: '1rem', fontSize: '1.1rem' }}
          >
            <ShoppingCart size={20} /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
