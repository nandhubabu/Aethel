import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Star, ShoppingCart, Minus, Plus, Heart, Truck, ShieldCheck, RotateCcw, ChevronRight, Zap } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await apiClient.get(`/products/${id}`);
        setProduct(res.data);
        const saved = JSON.parse(localStorage.getItem('aethel_wishlist') || '[]');
        setIsWishlisted(saved.some(item => item._id === res.data._id));
      } catch (err) {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await apiClient.post('/cart/items', { productId: product._id, quantity });
      setAddedToCart(true);
    } catch (err) {
      alert(err.message || 'Please login to add items to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      await apiClient.post('/cart/items', { productId: product._id, quantity });
      navigate('/checkout');
    } catch (err) {
      alert(err.message || 'Please login first');
    }
  };

  const handleToggleWishlist = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('aethel_wishlist') || '[]');
      if (isWishlisted) {
        const filtered = saved.filter(item => item._id !== product._id);
        localStorage.setItem('aethel_wishlist', JSON.stringify(filtered));
        setIsWishlisted(false);
      } else {
        saved.push(product);
        localStorage.setItem('aethel_wishlist', JSON.stringify(saved));
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star key={i} size={18} fill={i <= Math.round(rating || 0) ? '#cca352' : 'none'} color={i <= Math.round(rating || 0) ? '#cca352' : '#d1d5db'} strokeWidth={1.5} />
      );
    }
    return stars;
  };

  if (loading) return (
    <div style={{ minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="spinner"></div>
    </div>
  );
  if (error || !product) return (
    <div className="container" style={{ marginTop: '4rem' }}>
      <div className="alert alert-error">{error}</div>
    </div>
  );

  const images = product.images?.length > 0 ? product.images : ['https://via.placeholder.com/600'];
  const discountPercent = 15;
  const originalPrice = (product.price / (1 - discountPercent / 100)).toFixed(2);

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
          <ChevronRight size={14} />
          <Link to="/products" style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{product.category || 'Products'}</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{product.title?.substring(0, 40)}{product.title?.length > 40 ? '...' : ''}</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>

          {/* Left: Image Gallery */}
          <div>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '3rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '480px', position: 'relative', overflow: 'hidden' }}>
              <button onClick={handleToggleWishlist} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: isWishlisted ? '#fef2f2' : '#fff', border: '1px solid', borderColor: isWishlisted ? '#fecaca' : '#e5e7eb', borderRadius: '50%', padding: '0.75rem', cursor: 'pointer', zIndex: 10, transition: 'all 0.2s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#9ca3af'} />
              </button>
              <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', background: 'linear-gradient(135deg, #cca352, #b58f40)', color: '#fff', padding: '0.35rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.02em' }}>
                {discountPercent}% OFF
              </div>
              <img src={images[selectedImage]} alt={product.title} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', transition: 'opacity 0.3s ease' }} />
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'center' }}>
                {images.map((img, idx) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} style={{ width: '72px', height: '72px', borderRadius: '12px', border: `2px solid ${selectedImage === idx ? 'var(--secondary)' : 'var(--border-color)'}`, background: '#fff', padding: '0.35rem', cursor: 'pointer', transition: 'all 0.2s ease', opacity: selectedImage === idx ? 1 : 0.7 }}>
                    <img src={img} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div>
            <Link to="/products" style={{ display: 'inline-block', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              {product.vendor?.vendorProfile?.storeName || product.vendor?.name || 'Aethel Store'}
            </Link>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '700', color: '#111827', lineHeight: 1.35, marginBottom: '1rem', letterSpacing: '-0.01em' }}>{product.title}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', gap: '0.15rem' }}>{renderStars(product.averageRating)}</div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{product.averageRating > 0 ? product.averageRating.toFixed(1) : '0'} ({product.totalReviews || 0} reviews)</span>
            </div>

            <div style={{ height: '1px', background: 'var(--border-color)', marginBottom: '1.75rem' }}></div>

            {/* Price Block */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '2.25rem', fontWeight: '700', color: '#111827' }}>₹{product.price.toFixed(2)}</span>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{originalPrice}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#059669', background: '#ecfdf5', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>Save ₹{(originalPrice - product.price).toFixed(2)}</span>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Inclusive of all taxes</span>
            </div>

            {/* Feature Highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem', padding: '1.25rem', background: '#faf9f6', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', textAlign: 'center' }}>
                <Truck size={22} color="var(--secondary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#111827' }}>Free Delivery</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Orders above ₹499</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', textAlign: 'center' }}>
                <RotateCcw size={22} color="var(--secondary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#111827' }}>Easy Returns</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>30-day policy</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', textAlign: 'center' }}>
                <ShieldCheck size={22} color="var(--secondary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#111827' }}>Secure Payment</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>100% protected</span>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#111827' }}>About this item</h3>
              <p style={{ whiteSpace: 'pre-line', color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>{product.description}</p>
            </div>

            <div style={{ height: '1px', background: 'var(--border-color)', marginBottom: '1.75rem' }}></div>

            {/* Stock + Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: '600', color: product.stock > 0 ? '#059669' : '#dc2626', background: product.stock > 0 ? '#ecfdf5' : '#fef2f2', padding: '0.35rem 0.85rem', borderRadius: '20px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: product.stock > 0 ? '#059669' : '#dc2626' }}></span>
                {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>Qty:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', background: '#fff' }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '0.5rem 0.85rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#374151' }}><Minus size={16} /></button>
                  <span style={{ width: '2.5rem', textAlign: 'center', fontWeight: '600', fontSize: '1rem', color: '#111827' }}>{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} style={{ padding: '0.5rem 0.85rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#374151' }}><Plus size={16} /></button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button onClick={() => {
                if (addedToCart) {
                  navigate('/cart');
                } else {
                  handleAddToCart();
                }
              }} disabled={product.stock === 0 || addingToCart} style={{ flex: 1, padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', border: '2px solid var(--secondary)', background: addedToCart ? '#ecfdf5' : 'transparent', color: addedToCart ? '#059669' : 'var(--secondary)', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', opacity: product.stock === 0 ? 0.5 : 1, transition: 'all 0.3s ease' }}>
                <ShoppingCart size={20} />
                {addedToCart ? 'Go to Cart' : addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button onClick={handleBuyNow} disabled={product.stock === 0} style={{ flex: 1, padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', border: 'none', background: product.stock === 0 ? '#d1d5db' : 'linear-gradient(135deg, #cca352, #b58f40)', color: '#fff', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', boxShadow: product.stock > 0 ? '0 4px 14px rgba(204, 163, 82, 0.35)' : 'none' }}>
                <Zap size={20} />
                Buy Now
              </button>
            </div>

            {/* Seller Info */}
            <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sold by</span>
                <span style={{ color: 'var(--secondary)', fontWeight: '600', cursor: 'pointer' }}>{product.vendor?.vendorProfile?.storeName || 'Aethel Store'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fulfilled by</span>
                <span style={{ fontWeight: '600', color: '#111827' }}>Aethel</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Category</span>
                <Link to={`/products?category=${product.category}`} style={{ color: 'var(--secondary)', fontWeight: '600', textTransform: 'capitalize' }}>{product.category || 'General'}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

