import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { ArrowLeft } from 'lucide-react';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    compareAtPrice: '',
    category: 'other',
    stock: '',
    images: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : 0,
        category: formData.category,
        stock: parseInt(formData.stock, 10) || 0,
        images: formData.images ? formData.images.split(',').map(url => url.trim()) : []
      };

      await apiClient.post('/products', payload);
      setSuccess('Product successfully listed!');
      setTimeout(() => {
        navigate('/vendor/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to list product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout" style={{ background: '#ffffff', minHeight: '100vh' }}>
      <main className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem', maxWidth: '800px' }}>
        <button onClick={() => navigate('/vendor/dashboard')} className="btn btn-secondary flex items-center gap-2" style={{ marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        
        <h1 className="page-title" style={{ marginBottom: '2rem' }}>List New Product</h1>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <div className="glass-panel">
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Product Title</label>
                <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="e.g. Sony WH-1000XM5 Wireless Headphones" />
              </div>
              
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Product Description</label>
                <textarea name="description" required value={formData.description} onChange={handleChange} rows="5" placeholder="Detailed product description..."></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleChange} placeholder="0.00" />
              </div>

              <div className="form-group">
                <label className="form-label">MRP / Compare At Price (₹)</label>
                <input type="number" name="compareAtPrice" min="0" step="0.01" value={formData.compareAtPrice} onChange={handleChange} placeholder="Optional" />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category" required value={formData.category} onChange={handleChange}>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing & Apparel</option>
                  <option value="home">Home & Kitchen</option>
                  <option value="books">Books</option>
                  <option value="sports">Sports & Outdoors</option>
                  <option value="beauty">Beauty & Health</option>
                  <option value="toys">Toys & Games</option>
                  <option value="food">Food & Grocery</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input type="number" name="stock" required min="0" step="1" value={formData.stock} onChange={handleChange} placeholder="100" />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Image URLs (comma separated)</label>
                <input type="text" name="images" value={formData.images} onChange={handleChange} placeholder="https://imgur.com/..., https://imgur.com/..." />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>For now, please host images externally (e.g. Imgur) and paste the direct URLs here.</p>
              </div>
            </div>

            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                {loading ? <span className="spinner"></span> : 'Publish Product'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddProduct;
