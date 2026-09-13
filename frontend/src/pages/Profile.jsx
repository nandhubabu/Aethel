import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { User, Mail, Shield } from 'lucide-react';
import UserSidebar from '../components/UserSidebar';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: user?.name || '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await apiClient.patch('/users/profile', { name: formData.name });
      setMessage({ type: 'success', text: 'Profile updated successfully. Changes will fully reflect on next login.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

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
            <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#111827' }}>Login & Security</h1>
            
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '2rem' }}>
              {message.text && (
                <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleUpdate}>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                  <Mail size={24} color="#6b7280" />
                  <div style={{ flexGrow: 1 }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem', color: '#111827' }}>Email Address</label>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>The email address associated with your account. This cannot be changed.</div>
                    <input type="email" value={user.email} disabled style={{ background: '#f9fafb', color: '#6b7280', maxWidth: '400px' }} />
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                  <User size={24} color="#6b7280" />
                  <div style={{ flexGrow: 1 }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem', color: '#111827' }}>Name</label>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Your full name displayed to other users and on invoices.</div>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                      required 
                      style={{ maxWidth: '400px' }}
                    />
                  </div>
                </div>
                
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <Shield size={24} color="#6b7280" />
                  <div style={{ flexGrow: 1 }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem', color: '#111827' }}>Account Type</label>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Your current permission level on the platform.</div>
                    <input type="text" value={user.role} disabled style={{ background: '#f9fafb', color: '#6b7280', textTransform: 'capitalize', maxWidth: '400px' }} />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                  {loading ? <span className="spinner"></span> : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
