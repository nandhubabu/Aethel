import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Eye } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
  const { _id, title, price, images, vendor, averageRating, totalReviews, category } = product;
  const image = images && images.length > 0 ? images[0] : 'https://via.placeholder.com/400?text=No+Image';
  const navigate = useNavigate();

  return (
    <div className="product-card">
      <Link to={`/products/${_id}`} className="product-image-wrapper">
        <img src={image} alt={title} className="product-image" loading="lazy" />
      </Link>
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
            onClick={() => onAddToCart && onAddToCart(product)}
            className="btn btn-primary flex-1"
            style={{ padding: '0.4rem', fontSize: '0.8rem' }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
