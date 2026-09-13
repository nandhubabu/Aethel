import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
  const { _id, title, price, images, vendor, averageRating, totalReviews, category } = product;
  const image = images && images.length > 0 ? images[0] : 'https://via.placeholder.com/400?text=No+Image';
  const navigate = useNavigate();

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem('aethel_wishlist') || '[]');
      if (!saved.find(item => item._id === product._id)) {
        saved.push(product);
        localStorage.setItem('aethel_wishlist', JSON.stringify(saved));
        alert('Added to wishlist!');
      } else {
        alert('Already in wishlist!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [addedToCart, setAddedToCart] = React.useState(false);
  const [addingToCart, setAddingToCart] = React.useState(false);

  const handleAddToCartClick = async () => {
    if (addedToCart) {
      navigate('/cart');
      return;
    }
    if (onAddToCart) {
      setAddingToCart(true);
      try {
        await onAddToCart(product);
        setAddedToCart(true);
      } catch (err) {
        console.error(err);
      } finally {
        setAddingToCart(false);
      }
    }
  };

  return (
    <div className="product-card">
      <div style={{ position: 'relative' }}>
        <Link to={`/products/${_id}`} className="product-image-wrapper" style={{ display: 'block', margin: 0 }}>
          <img src={image} alt={title} className="product-image" loading="lazy" />
        </Link>
        <button 
          onClick={handleAddToWishlist}
          style={{ position: 'absolute', top: '8px', right: '8px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          <Heart size={16} color="#9ca3af" />
        </button>
      </div>
      <div className="product-content">
        <Link to={`/products/${_id}`}>
          <h3 className="product-title" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {title}
          </h3>
        </Link>

        <div className="product-category">
          Category: <span style={{ textTransform: 'capitalize' }}>{category || 'Other'}</span> • {vendor?.vendorProfile?.storeName || vendor?.name || 'Store'}
        </div>
        
        <div className="product-price">
          ₹{price.toFixed(2)}
        </div>

        <div className="flex items-center gap-1" style={{ fontSize: '0.85rem', color: '#f59e0b', marginBottom: '0.75rem', marginTop: '0.25rem' }}>
          <Star size={14} fill="currentColor" />
          <Star size={14} fill="currentColor" />
          <Star size={14} fill="currentColor" />
          <Star size={14} fill="currentColor" />
          <Star size={14} fill={averageRating > 4.5 ? "currentColor" : "none"} />
          <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>({totalReviews || 0})</span>
        </div>
        
        <div className="flex gap-2" style={{ marginTop: 'auto' }}>
          <button 
            onClick={() => navigate(`/products/${_id}`)}
            className="btn btn-secondary flex-1"
            style={{ padding: '0.4rem', fontSize: '0.8rem' }}
          >
            Quick View
          </button>
          <button 
            onClick={handleAddToCartClick}
            disabled={addingToCart}
            className="btn btn-primary flex-1"
            style={{ padding: '0.4rem', fontSize: '0.8rem', background: addedToCart ? '#10b981' : undefined }}
          >
            {addedToCart ? 'Go to Cart' : addingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
