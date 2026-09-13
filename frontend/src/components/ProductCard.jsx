import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
  const { _id, title, price, images, vendor, averageRating, totalReviews } = product;
  const image = images && images.length > 0 ? images[0] : 'https://via.placeholder.com/400?text=No+Image';

  return (
    <div className="product-card">
      <Link to={`/products/${_id}`} className="product-image-wrapper">
        <img src={image} alt={title} className="product-image" loading="lazy" />
      </Link>
      <div className="product-content">
        <div className="flex justify-between items-center" style={{ marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {vendor?.vendorProfile?.storeName || vendor?.name || 'Unknown Vendor'}
          </span>
          <div className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>
            <Star size={14} fill="currentColor" /> {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
            <span style={{ color: 'var(--text-muted)' }}>({totalReviews})</span>
          </div>
        </div>
        
        <Link to={`/products/${_id}`}>
          <h3 className="product-title" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {title}
          </h3>
        </Link>
        
        <div className="flex justify-between items-center" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <span className="product-price">₹{price.toFixed(2)}</span>
          <button 
            onClick={() => onAddToCart && onAddToCart(product)}
            className="btn btn-secondary"
            style={{ padding: '0.5rem', borderRadius: '50%' }}
            aria-label="Add to cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
