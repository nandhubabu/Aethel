import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, CreditCard, Loader } from 'lucide-react';

const Checkout = () => {
  const [orderId, setOrderId] = useState('');
  const [razorpayOrderId, setRazorpayOrderId] = useState('');
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Basic mock address for this example - in a real app this would be a form step before payment
  const mockAddress = {
    fullName: user?.name || 'John Doe',
    addressLine1: '123 Main St',
    city: 'Kochi',
    state: 'Kerala',
    postalCode: '682001',
    country: 'India',
    phone: '9876543210',
  };

  useEffect(() => {
    const initiateCheckout = async () => {
      try {
        const res = await apiClient.post('/orders/checkout', { shippingAddress: mockAddress });
        setOrderId(res.data.orderId);
        setRazorpayOrderId(res.data.razorpayOrderId);
        setRazorpayKeyId(res.data.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID || ''); // Fallback for idempotent branch or old frontend code
        setAmount(res.data.totalAmount);
      } catch (err) {
        setError(err.message || 'Failed to initiate checkout. Is your cart empty?');
      } finally {
        setLoading(false);
      }
    };

    initiateCheckout();
  }, []);

  const handlePayment = () => {
    if (!window.Razorpay) {
      setError('Razorpay SDK not loaded. Please refresh the page.');
      return;
    }

    setPaying(true);

    const options = {
      key: razorpayKeyId,
      amount: Math.round(amount * 100), // In paise
      currency: 'INR',
      name: 'Aethel Marketplace',
      description: 'Order Payment',
      order_id: razorpayOrderId,
      handler: async function (response) {
        // Payment successful on Razorpay's side — verify on our backend
        try {
          await apiClient.post('/orders/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId,
          });
          navigate(`/orders?payment_success=true`);
        } catch (err) {
          setError('Payment was captured but verification failed. Contact support.');
          setPaying(false);
        }
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: mockAddress.phone,
      },
      theme: {
        color: '#6366f1',
        backdrop_color: 'rgba(0, 0, 0, 0.7)',
      },
      modal: {
        ondismiss: function () {
          setPaying(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      setError(`Payment failed: ${response.error.description}`);
      setPaying(false);
    });
    rzp.open();
  };

  if (loading) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ marginTop: '4rem' }}>
        <div className="alert alert-error">{error}</div>
        <button onClick={() => navigate('/cart')} className="btn btn-secondary">Return to Cart</button>
      </div>
    );
  }

  return (
    <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
      <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <CreditCard size={48} color="var(--primary)" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>Complete Your Payment</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Secure payment powered by Razorpay</p>

        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--primary-light)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Order Total</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{amount.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 justify-center" style={{ fontSize: '0.85rem', color: 'var(--success)', marginTop: '0.75rem' }}>
            <ShieldCheck size={16} /> 100% Secure Payment
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={paying}
          className="btn btn-primary"
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
        >
          {paying ? (
            <span className="flex items-center gap-2 justify-center">
              <Loader size={20} className="spin" /> Processing...
            </span>
          ) : (
            `Pay ₹${amount.toFixed(2)}`
          )}
        </button>

        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          UPI • Cards • Net Banking • Wallets
        </p>
      </div>
    </div>
  );
};

export default Checkout;
