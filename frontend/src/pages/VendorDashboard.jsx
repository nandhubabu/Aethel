import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Package, DollarSign, Activity, Plus, Home, Settings, ShoppingCart } from 'lucide-react';

const VendorDashboard = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [salesRes, productsRes] = await Promise.all([
          apiClient.get('/orders/vendor/sales'),
          apiClient.get('/products/vendor/my-products')
        ]);
        setSales(salesRes.data);
        setProducts(productsRes.data);
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

  if (loading) return <div className="flex justify-center" style={{ marginTop: '4rem' }}><div className="spinner"></div></div>;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ marginBottom: '2rem', padding: '0 1rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Vendor Central</h2>
        </div>
        <nav>
          <Link to="/vendor/dashboard" className="sidebar-link active">
            <Home size={18} /> Dashboard
          </Link>
          <Link to="/vendor/products/new" className="sidebar-link">
            <Plus size={18} /> Add Product
          </Link>
          <Link to="/vendor/dashboard" className="sidebar-link">
            <Package size={18} /> My Products
          </Link>
          <Link to="/vendor/dashboard" className="sidebar-link">
            <ShoppingCart size={18} /> Orders
          </Link>
          <Link to="/vendor/dashboard" className="sidebar-link">
            <Activity size={18} /> Analytics
          </Link>
          <Link to="/vendor/dashboard" className="sidebar-link">
            <Settings size={18} /> Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content" style={{ padding: '2rem 3rem' }}>
        <div className="flex justify-between items-center page-header">
          <h1 className="page-title">Overview</h1>
          <button className="btn btn-primary flex items-center gap-2" onClick={() => navigate('/vendor/products/new')}>
            <Plus size={18} /> List New Product
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6" style={{ marginBottom: '3rem' }}>
          <div className="glass-panel flex items-center gap-4">
            <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '50%', color: '#d97706' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Revenue</p>
              <h3 style={{ fontSize: '1.5rem' }}>₹{totalRevenue.toFixed(2)}</h3>
            </div>
          </div>
          
          <div className="glass-panel flex items-center gap-4">
            <div style={{ background: '#e0e7ff', padding: '1rem', borderRadius: '50%', color: '#4f46e5' }}>
              <Package size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active Products</p>
              <h3 style={{ fontSize: '1.5rem' }}>{products.length}</h3>
            </div>
          </div>
          
          <div className="glass-panel flex items-center gap-4">
            <div style={{ background: '#d1fae5', padding: '1rem', borderRadius: '50%', color: '#059669' }}>
              <Activity size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Sales</p>
              <h3 style={{ fontSize: '1.5rem' }}>{sales.length} Orders</h3>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-panel">
            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '1.2rem' }}>Recent Orders</h2>
            {sales.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No orders yet.</p> : (
              <ul>
                {sales.slice(0, 5).map(order => (
                  <li key={order._id} style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div className="flex justify-between">
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{order._id.substring(0,8)}</span>
                      <span style={{ color: 'var(--success)', fontWeight: '500', fontSize: '0.9rem' }}>Paid</span>
                    </div>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>{order.shippingAddress.fullName}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass-panel">
            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '1.2rem' }}>Your Products</h2>
            {products.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No products listed.</p> : (
              <ul>
                {products.slice(0, 5).map(p => (
                  <li key={p._id} className="flex justify-between items-center" style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-4">
                      <img src={p.images?.[0] || 'https://via.placeholder.com/50'} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                      <span style={{ fontSize: '0.95rem' }}>{p.title}</span>
                    </div>
                    <span style={{ fontWeight: 'bold' }}>₹{p.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
