import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import apiClient from '../api/client';
import { useNavigate } from 'react-router-dom';

// Initialize Stripe outside of component to avoid recreating it
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const Checkout = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Basic mock address for this example - in a real app this would be a form step before payment
  const mockAddress = {
    fullName: "John Doe",
    addressLine1: "123 Main St",
    city: "San Francisco",
    state: "CA",
    postalCode: "94105",
    country: "US",
    phone: "555-0123"
  };

  useEffect(() => {
    const initiateCheckout = async () => {
      try {
        const res = await apiClient.post('/orders/checkout', { shippingAddress: mockAddress });
        setClientSecret(res.data.clientSecret);
        setOrderId(res.data.orderId);
        setAmount(res.data.totalAmount);
      } catch (err) {
        setError(err.message || 'Failed to initiate checkout. Is your cart empty?');
      } finally {
        setLoading(false);
      }
    };

    initiateCheckout();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
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
    <div className="container" style={{ padding: '4rem 1.5rem' }}>
      {clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
          <CheckoutForm 
            orderId={orderId} 
            amount={amount} 
            onSuccess={(paymentIntentId) => {
              navigate(`/order-success?orderId=${orderId}`);
            }} 
          />
        </Elements>
      )}
    </div>
  );
};

export default Checkout;
