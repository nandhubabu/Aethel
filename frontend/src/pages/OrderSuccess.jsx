import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Optionally fire off analytics or clear local cart state here
  }, []);

  return (
    <div className="container flex flex-col items-center justify-center" style={{ minHeight: '60vh', textAlign: 'center' }}>
      <div className="glass-panel" style={{ padding: '4rem', display: 'flex', flexDirection: 'col', alignItems: 'center', maxWidth: '600px' }}>
        <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1.5rem', display: 'block', margin: '0 auto' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Payment Successful!</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Thank you for your order. Your transaction has been completed and your items are being prepared for shipping.
        </p>
        
        {orderId && (
          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Order Reference:</span>
            <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--primary)' }}>{orderId}</div>
          </div>
        )}

        <Link to="/products" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
