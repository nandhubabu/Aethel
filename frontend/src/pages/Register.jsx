import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    storeName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex justify-center items-center" style={{ minHeight: '80vh', padding: '4rem 0' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h1>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" required minLength="8" value={formData.password} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="customer">Customer</option>
              <option value="vendor">Vendor (Sell Products)</option>
            </select>
          </div>

          {formData.role === 'vendor' && (
            <div className="form-group">
              <label className="form-label">Store Name</label>
              <input type="text" name="storeName" required value={formData.storeName} onChange={handleChange} />
            </div>
          )}
          
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? <span className="spinner"></span> : 'Sign Up'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
