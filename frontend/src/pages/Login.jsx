import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Truck, CreditCard, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Brand Panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-logo">Aethel</div>
          <p className="auth-brand-tagline">
            Shop the Future.<br />Premium products, delivered fast.
          </p>
          <div className="auth-brand-features">
            <div className="auth-brand-feature">
              <div className="auth-brand-feature-icon">
                <ShieldCheck size={20} />
              </div>
              <span>Secure checkout with end-to-end encryption</span>
            </div>
            <div className="auth-brand-feature">
              <div className="auth-brand-feature-icon">
                <Truck size={20} />
              </div>
              <span>Free delivery on orders above ₹499</span>
            </div>
            <div className="auth-brand-feature">
              <div className="auth-brand-feature-icon">
                <CreditCard size={20} />
              </div>
              <span>Multiple payment options including UPI & Cards</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <h1 className="auth-form-title">Welcome back</h1>
          <p className="auth-form-subtitle">Sign in to your Aethel account to continue shopping</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-form-footer">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: 'auto', accentColor: 'var(--secondary)' }} />
                <span>Remember me</span>
              </label>
              <Link to="#">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? <span className="spinner"></span> : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <p className="auth-switch">
            New to Aethel? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
