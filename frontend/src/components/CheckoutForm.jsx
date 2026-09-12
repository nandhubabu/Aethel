import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import apiClient from '../api/client';
import { useNavigate } from 'react-router-dom';

const CheckoutForm = ({ orderId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setIsProcessing(false);
      return;
    }

    try {
      // Stripe confirmPayment automatically redirects to the return_url if required by the payment method (like 3D secure)
      // Otherwise it returns a result object
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success?orderId=${orderId}`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // Since we used redirect: 'if_required', successful card payments without 3DS will hit this block
        if (onSuccess) {
          onSuccess(result.paymentIntent.id);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred during payment confirmation.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Complete Payment</h2>
      
      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--primary-light)' }}>
        <div className="flex justify-between items-center">
          <span style={{ color: 'var(--text-muted)' }}>Total Amount</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>${amount.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <PaymentElement 
          options={{ 
            layout: 'tabs',
            theme: 'night',
            variables: {
              colorPrimary: '#6366f1',
              colorBackground: '#121216',
              colorText: '#f8fafc',
              colorDanger: '#ef4444',
              fontFamily: 'Inter, system-ui, sans-serif',
              spacingUnit: '4px',
              borderRadius: '8px',
            }
          }} 
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <button 
        type="submit" 
        disabled={isProcessing || !stripe || !elements} 
        className="btn btn-primary" 
        style={{ width: '100%' }}
      >
        {isProcessing ? (
          <span className="flex items-center gap-2 justify-center">
            <span className="spinner"></span> Processing...
          </span>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </button>
    </form>
  );
};

export default CheckoutForm;
