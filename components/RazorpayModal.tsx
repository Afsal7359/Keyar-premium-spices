'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, X, CreditCard, Smartphone, Building } from 'lucide-react';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
  amount: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export default function RazorpayModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  orderId,
  customerName,
}: RazorpayModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiId, setUpiId] = useState('customer@okhdfcbank');

  if (!isOpen) return null;

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const simulatedPaymentId = `pay_rzp_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
      onSuccess(simulatedPaymentId);
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal Card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#0a1a0f',
          borderRadius: '24px',
          border: '1px solid var(--line-strong)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.2)',
          overflow: 'hidden',
          zIndex: 105,
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0e2416, #143320)',
            padding: '20px 24px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50% 0',
                  background: 'var(--gold)',
                  display: 'inline-block',
                  transform: 'rotate(45deg)',
                }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gold-light)' }}>
                RAZORPAY SECURE GATEWAY
              </span>
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--ivory)', margin: 0 }}>
              Keyaar Premium Spices
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ivory)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Order Info Banner */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 18px',
              background: 'rgba(14, 32, 21, 0.8)',
              border: '1px solid var(--line)',
              borderRadius: '16px',
              marginBottom: '20px',
            }}
          >
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--mute)', display: 'block' }}>
                Order #{orderId}
              </span>
              <span style={{ fontSize: '0.88rem', color: 'var(--ivory)' }}>
                {customerName}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--mute)', display: 'block' }}>
                Total Payable
              </span>
              <span
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: 'var(--gold-light)',
                  fontFamily: 'var(--font-serif)',
                }}
              >
                ₹{amount}
              </span>
            </div>
          </div>

          {/* Test Mode Notice */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              padding: '10px 14px',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '0.82rem',
              color: 'var(--gold-light)',
            }}
          >
            <ShieldCheck size={18} style={{ flexShrink: 0 }} />
            <span>
              Connected to Test Payment API (Mock/Sandbox Mode). No actual money is debited.
            </span>
          </div>

          {/* Payment Method Selector */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '8px' }}>
              Select Payment Method:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 8px',
                  borderRadius: '12px',
                  border: selectedMethod === 'upi' ? '1px solid var(--gold)' : '1px solid var(--line)',
                  background: selectedMethod === 'upi' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(14, 32, 21, 0.5)',
                  color: selectedMethod === 'upi' ? 'var(--gold-light)' : 'var(--ivory)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                <Smartphone size={18} />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 8px',
                  borderRadius: '12px',
                  border: selectedMethod === 'card' ? '1px solid var(--gold)' : '1px solid var(--line)',
                  background: selectedMethod === 'card' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(14, 32, 21, 0.5)',
                  color: selectedMethod === 'card' ? 'var(--gold-light)' : 'var(--ivory)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                <CreditCard size={18} />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('netbanking')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 8px',
                  borderRadius: '12px',
                  border: selectedMethod === 'netbanking' ? '1px solid var(--gold)' : '1px solid var(--line)',
                  background: selectedMethod === 'netbanking' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(14, 32, 21, 0.5)',
                  color: selectedMethod === 'netbanking' ? 'var(--gold-light)' : 'var(--ivory)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                <Building size={18} />
                <span>Netbanking</span>
              </button>
            </div>
          </div>

          {/* Method Details */}
          {selectedMethod === 'upi' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
                Enter Virtual Payment Address (UPI ID)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="input-field"
                style={{ fontSize: '0.9rem', padding: '10px 14px' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--mute)', marginTop: '4px', display: 'block' }}>
                Supports Google Pay, PhonePe, Paytm, BHIM, and Cred
              </span>
            </div>
          )}

          {selectedMethod === 'card' && (
            <div style={{ marginBottom: '24px', fontSize: '0.88rem', color: 'var(--mute)' }}>
              <div style={{ padding: '12px', background: 'rgba(7, 19, 11, 0.7)', borderRadius: '12px', border: '1px solid var(--line)' }}>
                Test Card: <b>4111 •••• •••• 1111</b> (Visa)
                <br />
                <span style={{ fontSize: '0.78rem' }}>Expiry: 12/28 • CVV: 123</span>
              </div>
            </div>
          )}

          {selectedMethod === 'netbanking' && (
            <div style={{ marginBottom: '24px', fontSize: '0.88rem', color: 'var(--mute)' }}>
              <div style={{ padding: '12px', background: 'rgba(7, 19, 11, 0.7)', borderRadius: '12px', border: '1px solid var(--line)' }}>
                Simulating HDFC / ICICI / SBI Instant Netbanking
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              {isProcessing ? (
                <>Verifying with Razorpay...</>
              ) : (
                <>
                  <CheckCircle2 size={18} /> Complete Payment of ₹{amount}
                </>
              )}
            </button>

            <button
              onClick={onClose}
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', padding: '10px', fontSize: '0.88rem' }}
            >
              Cancel Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
