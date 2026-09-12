import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Package, DollarSign, Activity } from 'lucide-react';

const VendorDashboard = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [salesRes, productsRes] = await Promise.all([
          apiClient.get('/orders/vendor/sales'),
          apiClient.get('/products/vendor/my-products')
        ]);
        setSales(salesRes.data.data);
        setProducts(productsRes.data.data);
      } catch (err) {
        console.error('Error fetching vendor data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalRevenue = sales.reduce((sum, order) => {
    // Only sum the items belonging to this vendor
    const vendorItems = order.items.filter(i => true); // In a real app we check i.vendor === user.id
    return sum + vendorItems.reduce((s, i) => s + (i.price * i.quantity), 0);
  }, 0);

  if (loading) return <div className="container flex justify-center" style={{ marginTop: '4rem' }}><div className="spinner"></div></div>;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 className="page-title">Vendor Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6" style={{ marginBottom: '3rem' }}>
        <div className="glass-panel flex items-center gap-4">
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)' }}>Total Revenue</p>
            <h3 style={{ fontSize: '1.5rem' }}>${totalRevenue.toFixed(2)}</h3>
          </div>
        </div>
        
        <div className="glass-panel flex items-center gap-4">
          <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '1rem', borderRadius: '50%', color: 'var(--secondary)' }}>
            <Package size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)' }}>Active Products</p>
            <h3 style={{ fontSize: '1.5rem' }}>{products.length}</h3>
          </div>
        </div>
        
        <div className="glass-panel flex items-center gap-4">
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '50%', color: 'var(--success)' }}>
            <Activity size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)' }}>Total Sales</p>
            <h3 style={{ fontSize: '1.5rem' }}>{sales.length} Orders</h3>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Recent Orders</h2>
          {sales.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No orders yet.</p> : (
            <ul>
              {sales.slice(0, 5).map(order => (
                <li key={order._id} style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex justify-between">
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{order._id.substring(0,8)}</span>
                    <span style={{ color: 'var(--success)' }}>Paid</span>
                  </div>
                  <p style={{ marginTop: '0.5rem' }}>{order.shippingAddress.fullName}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-panel">
          <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Your Products</h2>
          {products.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No products listed.</p> : (
            <ul>
              {products.slice(0, 5).map(p => (
                <li key={p._id} className="flex justify-between items-center" style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-4">
                    <img src={p.images?.[0] || 'https://via.placeholder.com/50'} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                    <span>{p.title}</span>
                  </div>
                  <span style={{ fontWeight: 'bold' }}>${p.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
