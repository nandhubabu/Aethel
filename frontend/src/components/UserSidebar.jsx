import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Package, Heart, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Your Orders', path: '/orders', icon: <Package size={20} /> },
    { name: 'Login & Security', path: '/profile', icon: <User size={20} /> },
    { name: 'Your Wishlist', path: '/wishlist', icon: <Heart size={20} /> },
  ];

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', height: 'fit-content' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#111827', fontWeight: 'bold' }}>Your Account</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                padding: '0.75rem 1rem', 
                borderRadius: '6px',
                color: isActive ? 'var(--primary)' : '#4b5563',
                background: isActive ? '#f3f4f6' : 'transparent',
                fontWeight: isActive ? '600' : '500',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.background = '#f9fafb' }}
              onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
        <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
        <button 
          onClick={logout} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            padding: '0.75rem 1rem', 
            borderRadius: '6px',
            color: '#dc2626',
            background: 'transparent',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </nav>
    </div>
  );
};

export default UserSidebar;
