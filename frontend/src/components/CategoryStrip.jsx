import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Monitor, Shirt, Home, Coffee, Book, Dribbble, Gift, MoreHorizontal } from 'lucide-react';

const categories = [
  { name: 'Mobiles', icon: <Smartphone size={18} />, query: 'electronics' },
  { name: 'Electronics', icon: <Monitor size={18} />, query: 'electronics' },
  { name: 'Fashion', icon: <Shirt size={18} />, query: 'clothing' },
  { name: 'Home & Furniture', icon: <Home size={18} />, query: 'home' },
  { name: 'Appliances', icon: <Coffee size={18} />, query: 'home' },
  { name: 'Books', icon: <Book size={18} />, query: 'books' },
  { name: 'Sports', icon: <Dribbble size={18} />, query: 'sports' },
  { name: 'Beauty & Toys', icon: <Gift size={18} />, query: 'toys' },
  { name: 'More', icon: <MoreHorizontal size={18} />, query: '' },
];

const CategoryStrip = () => {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0.25rem 0' }}>
      <div className="container">
        <div className="horizontal-scroll" style={{ justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
          {categories.map((cat, idx) => (
            <Link 
              key={idx} 
              to={`/products${cat.query ? `?category=${cat.query}` : ''}`} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#374151', minWidth: '70px', textDecoration: 'none' }}
            >
              <div style={{ padding: '0.4rem', background: '#f3f4f6', borderRadius: '50%', color: 'var(--primary)' }}>
                {cat.icon}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '500', whiteSpace: 'nowrap' }}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryStrip;
