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

  if (loading) return <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}><div className="spinner"></div></div>;
  if (error || !product) return <div className="container" style={{ marginTop: '4rem' }}><div className="alert alert-error">{error}</div></div>;

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Breadcrumbs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '1rem 0', marginBottom: '2rem' }}>
        <div className="container" style={{ maxWidth: '1400px', fontSize: '0.9rem', color: '#6b7280' }}>
          <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/')}>Home</span>
          <span style={{ margin: '0 0.5rem' }}>›</span>
          <span style={{ cursor: 'pointer', color: 'var(--primary)', textTransform: 'capitalize' }} onClick={() => navigate('/products')}>{product.category || 'Products'}</span>
          <span style={{ margin: '0 0.5rem' }}>›</span>
          <span style={{ color: '#111827' }}>{product.title}</span>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1400px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          
          {/* Left Column: Images */}
          <div style={{ position: 'sticky', top: '2rem' }}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', marginBottom: '1rem' }}>
              <img 
                src={product.images?.[0] || 'https://via.placeholder.com/600'} 
                alt={product.title} 
                style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
              />
            </div>
            {/* Thumbnails (Mocked for now since DB only has 1 image usually) */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              {[product.images?.[0] || 'https://via.placeholder.com/600'].map((img, idx) => (
                <div key={idx} style={{ width: '80px', height: '80px', border: '2px solid var(--primary)', borderRadius: '8px', padding: '0.5rem', background: '#fff', cursor: 'pointer' }}>
                  <img src={img} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Middle Column: Details */}
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem', lineHeight: 1.3 }}>
              {product.title}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{product.vendor?.vendorProfile?.storeName || product.vendor?.name || 'Aethel Store'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b' }}>
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill={product.averageRating > 4.5 ? "currentColor" : "none"} />
                <span style={{ color: '#6b7280', fontSize: '0.9rem', marginLeft: '0.5rem' }}>({product.totalReviews || 0} ratings)</span>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem', color: '#b12704', marginTop: '0.4rem' }}>-15%</span>
                <span style={{ fontSize: '2.5rem', fontWeight: '500', color: '#111827' }}>₹{product.price.toFixed(2)}</span>
              </div>
              <div style={{ color: '#565959', fontSize: '0.9rem' }}>M.R.P.: <span style={{ textDecoration: 'line-through' }}>₹{(product.price * 1.15).toFixed(2)}</span></div>
              <div style={{ fontSize: '0.9rem', color: '#111827', marginTop: '0.5rem' }}>Inclusive of all taxes</div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#111827' }}>About this item</h3>
              <p style={{ whiteSpace: 'pre-line', color: '#4b5563', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {product.description}
              </p>
            </div>
          </div>

          {/* Right Column: Checkout Box */}
          <div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', position: 'sticky', top: '2rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                ₹{product.price.toFixed(2)}
              </div>
              
              <div style={{ color: '#007185', fontSize: '0.9rem', marginBottom: '1rem' }}>
                FREE Delivery. <span style={{ fontWeight: '600', color: '#111827' }}>Details</span>
              </div>

              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: product.stock > 0 ? '#059669' : '#dc2626', marginBottom: '1.5rem' }}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#111827', marginBottom: '0.5rem', fontWeight: '500' }}>Quantity:</label>
                <div style={{ display: 'flex', alignItems: 'center', width: 'fit-content', border: '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden' }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', border: 'none', cursor: 'pointer', color: '#374151' }}><Minus size={16} /></button>
                  <span style={{ width: '3rem', textAlign: 'center', fontWeight: '500', fontSize: '1rem', color: '#111827' }}>{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', border: 'none', cursor: 'pointer', color: '#374151' }}><Plus size={16} /></button>
                </div>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1rem', borderRadius: '50px', fontSize: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}
              >
                <ShoppingCart size={18} /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button 
                disabled={product.stock === 0}
                className="btn" 
                style={{ width: '100%', padding: '1rem', borderRadius: '50px', fontSize: '1rem', background: '#ffa41c', color: '#111', border: '1px solid #ff8f00', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}
                onClick={() => {
                  handleAddToCart();
                  setTimeout(() => navigate('/checkout'), 500);
                }}
              >
                Buy Now
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.85rem', color: '#565959' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ships from</span>
                  <span style={{ color: '#111827' }}>Aethel Fulfillment</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Sold by</span>
                  <span style={{ color: '#007185', cursor: 'pointer' }}>{product.vendor?.vendorProfile?.storeName || 'Store'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Returns</span>
                  <span style={{ color: '#007185', cursor: 'pointer' }}>Eligible for Return</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
