import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Package, Clock, CheckCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiClient.get('/orders');
        setOrders(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const paymentSuccess = queryParams.get('payment_success');

  if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}><div className="spinner"></div></div>;

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '1400px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
          
          {/* Sidebar */}
          <div>
            <UserSidebar />
          </div>

          {/* Main Content */}
          <div>
            {paymentSuccess && (
              <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #10b981', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle size={20} />
                <span style={{ fontWeight: '500' }}>Payment Successful! Your order has been placed.</span>
              </div>
            )}
            
            <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#111827' }}>Your Orders</h1>
            
            {error && <div className="alert alert-error">{error}</div>}
            
            {orders.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '4rem 2rem', textAlign: 'center' }}>
                <Package size={64} style={{ margin: '0 auto 1.5rem', color: '#d1d5db' }} />
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#111827' }}>No orders placed yet</h2>
                <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '1.1rem' }}>When you place orders, they will appear here with full tracking details.</p>
                <Link to="/products" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>Start Shopping</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {orders.map(order => (
                  <div key={order._id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                    {/* Order Header */}
                    <div style={{ background: '#f9fafb', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '3rem' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Order Placed</div>
                          <div style={{ fontWeight: '500', color: '#111827' }}>{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Total</div>
                          <div style={{ fontWeight: '500', color: '#111827' }}>₹{order.totalAmount.toFixed(2)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Ship To</div>
                          <div style={{ fontWeight: '500', color: '#3b82f6', cursor: 'pointer' }}>{order.shippingAddress?.fullName || 'User'}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Order # {order._id}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', fontWeight: '600', color: order.paymentStatus === 'paid' ? '#059669' : '#d97706' }}>
                          {order.paymentStatus === 'paid' ? <CheckCircle size={16} /> : <Clock size={16} />}
                          <span style={{ textTransform: 'capitalize' }}>{order.paymentStatus}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    <div style={{ padding: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#111827' }}>{order.paymentStatus === 'paid' ? 'Arriving soon' : 'Awaiting Payment'}</h3>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '1.5rem', marginBottom: idx !== order.items.length - 1 ? '1.5rem' : 0 }}>
                          <div style={{ width: '90px', height: '90px', background: '#f3f4f6', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&auto=format&fit=crop"} alt={item.product?.title || item.title || "Product"} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }} />
                          </div>
                          <div style={{ flexGrow: 1 }}>
                            <Link to={`/products/${item.product?._id || ''}`} style={{ fontWeight: '600', fontSize: '1.05rem', marginBottom: '0.25rem', display: 'inline-block' }}>
                              {item.product?.title || item.title || 'Product Name Unavailable'}
                            </Link>
                            <div style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Return eligible through 30 days</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Buy it again</button>
                              <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                             <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', width: '100%' }}>Track package</button>
                             <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', width: '100%' }}>View item details</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Orders;
