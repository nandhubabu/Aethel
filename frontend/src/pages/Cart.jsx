import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await apiClient.get('/cart');
      setCart(res.data);
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const res = await apiClient.patch(`/cart/items/${itemId}`, { quantity: newQuantity });
      setCart(res.data);
    } catch (err) {
      alert(err.message || 'Error updating quantity');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      const res = await apiClient.delete(`/cart/items/${itemId}`);
      setCart(res.data);
    } catch (err) {
      alert(err.message || 'Error removing item');
    }
  };

  if (loading) {
    return <div className="container flex justify-center" style={{ marginTop: '4rem' }}><div className="spinner"></div></div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center" style={{ minHeight: '50vh', textAlign: 'center' }}>
        <ShoppingBag size={64} color="var(--text-muted)" style={{ marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 className="page-title">Shopping Cart</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="glass-panel">
            {cart.items.map((item) => (
              <div key={item._id} className="flex gap-4" style={{ padding: '1.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <img 
                  src={item.product.images?.[0] || 'https://via.placeholder.com/150'} 
                  alt={item.product.title} 
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <div className="flex flex-col justify-between flex-grow">
                  <div className="flex justify-between">
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.product.title}</h3>
                      <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>₹{item.priceAtAdd.toFixed(2)}</p>
                    </div>
                    <button onClick={() => handleRemove(item._id)} style={{ background: 'none', color: 'var(--error)' }}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2" style={{ background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: '6px' }}>
                      <button onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)} className="btn btn-secondary" style={{ padding: '0.25rem' }}><Minus size={16} /></button>
                      <span style={{ width: '2rem', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)} className="btn btn-secondary" style={{ padding: '0.25rem' }}><Plus size={16} /></button>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Subtotal: ₹{(item.priceAtAdd * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="glass-panel sticky top-24">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Order Summary</h3>
            
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
              <span>Items ({cart.itemCount})</span>
              <span>₹{cart.totalPrice.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            
            <div className="flex justify-between items-center" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '1.25rem', fontWeight: 'bold' }}>
              <span>Subtotal</span>
              <span style={{ color: 'var(--primary)' }}>₹{cart.totalPrice.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={() => navigate('/checkout')}
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
