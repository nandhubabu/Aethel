import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Truck, CreditCard, Eye, EyeOff } from 'lucide-react';

const getPasswordStrength = (password) => {
  if (!password) return { level: '', label: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 'weak', label: 'Weak' };
  if (score === 2) return { level: 'fair', label: 'Fair' };
  if (score === 3) return { level: 'good', label: 'Good' };
  return { level: 'strong', label: 'Strong' };
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    storeName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedTerms) {
      setError('Please agree to the Terms & Conditions to continue.');
      return;
    }
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
    <div className="auth-page">
      {/* Left Brand Panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-logo">Aethel</div>
          <p className="auth-brand-tagline">
            Join thousands of happy shoppers.<br />Your new favorite store awaits.
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
              <span>Sell on Aethel — become a vendor today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <h1 className="auth-form-title">Create account</h1>
          <p className="auth-form-subtitle">Get started with Aethel in just a few steps</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength="8"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
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
              {formData.password && (
                <div className="password-strength">
                  <div className="password-strength-bar">
                    <div className={`password-strength-fill ${passwordStrength.level}`}></div>
                  </div>
                  <span className={`password-strength-label ${passwordStrength.level}`}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Account Type</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="customer">Customer — I want to shop</option>
                <option value="vendor">Vendor — I want to sell products</option>
              </select>
            </div>

            {formData.role === 'vendor' && (
              <div className="form-group">
                <label className="form-label">Store Name</label>
                <input
                  type="text"
                  name="storeName"
                  required
                  placeholder="My Awesome Store"
                  value={formData.storeName}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="auth-checkbox-row">
              <input
                type="checkbox"
                id="terms"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
              />
              <label htmlFor="terms">
                I agree to the <Link to="#">Terms of Service</Link> and <Link to="#">Privacy Policy</Link>
              </label>
            </div>

            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? <span className="spinner"></span> : 'Create Account'}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
