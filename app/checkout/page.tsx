'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Truck,
  ArrowRight,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/db';
import { createPaymentOrder, loadRazorpayScript, verifyPayment } from '@/lib/payment';
import RazorpayModal from '@/components/RazorpayModal';

function generateOrderId(): string {
  return `KYR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, appliedCoupon, shippingFee, tax, grandTotal, clearCart } = useCart();

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: 'Kerala',
    pincode: '',
    country: 'India',
    paymentMethod: 'razorpay' as 'razorpay' | 'cod',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Razorpay test modal state
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProcessOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMessage('Your basket is empty. Please add items before checkout.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const generatedOrderId = generateOrderId();

    if (formData.paymentMethod === 'cod') {
      // Direct Cash on Delivery placement
      try {
        const order = await createOrder({
          id: generatedOrderId,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: {
            street: formData.street,
            apartment: formData.apartment,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            country: formData.country,
          },
          items,
          subtotal,
          discount,
          coupon_code: appliedCoupon?.code,
          shipping_fee: shippingFee,
          tax,
          total: grandTotal,
          payment_method: 'cod',
          payment_status: 'pending',
          order_status: 'Processing',
        });

        clearCart();
        router.push(`/order-success/${order.id}`);
      } catch (err) {
        console.error('Order creation error:', err);
        setErrorMessage('Failed to place order. Please try again.');
        setIsSubmitting(false);
      }
      return;
    }

    // Razorpay Flow
    try {
      // 1. Create order via Payment Backend API
      const rzpOrder = await createPaymentOrder({
        amount: grandTotal,
        receipt: generatedOrderId,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
      });

      setPendingOrderId(generatedOrderId);

      // 2. Try loading official Razorpay Checkout SDK
      const hasSdk = await loadRazorpayScript();
      const RazorpayConstructor = (window as unknown as { Razorpay?: new (opts: unknown) => { open: () => void } }).Razorpay;

      if (hasSdk && RazorpayConstructor && process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes('rzp_test_Keyaar')) {
        // Genuine live/sandbox Razorpay window
        const options = {
          key: rzpOrder.key,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: 'Keyaar Premium Spices',
          description: `Order ${generatedOrderId}`,
          order_id: rzpOrder.orderId,
          handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
            await handlePaymentSuccess(response.razorpay_payment_id, response.razorpay_order_id);
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#d4af37',
          },
        };

        const rzpInstance = new RazorpayConstructor(options);
        rzpInstance.open();
        setIsSubmitting(false);
      } else {
        // Interactive Test Modal (supports test sandbox with mock backend like backend.aura.com/api/payment)
        setIsRazorpayModalOpen(true);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.warn('Razorpay checkout error, launching sandbox test modal:', err);
      setIsRazorpayModalOpen(true);
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentId: string, rzpOrderId?: string) => {
    setIsRazorpayModalOpen(false);
    setIsSubmitting(true);

    try {
      await verifyPayment({
        razorpay_order_id: rzpOrderId || pendingOrderId,
        razorpay_payment_id: paymentId,
      });

      const order = await createOrder({
        id: pendingOrderId || `AUR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: {
          street: formData.street,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        },
        items,
        subtotal,
        discount,
        coupon_code: appliedCoupon?.code,
        shipping_fee: shippingFee,
        tax,
        total: grandTotal,
        payment_method: 'razorpay',
        payment_status: 'paid',
        razorpay_order_id: rzpOrderId || 'order_mock',
        razorpay_payment_id: paymentId,
        order_status: 'Processing',
      });

      clearCart();
      router.push(`/order-success/${order.id}`);
    } catch (err) {
      console.error('Error saving order after payment:', err);
      setErrorMessage('Payment succeeded, but error creating order record. Please contact concierge.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ padding: '100px 5vw', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Your basket is empty</h2>
        <p style={{ color: 'var(--mute)', marginBottom: '24px' }}>Add items from our collection before proceeding to checkout.</p>
        <button onClick={() => router.push('/shop')} className="btn btn-primary">
          Browse Collection
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 5vw 120px' }}>
      <div className="container">
        <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', marginBottom: '8px' }}>
          Secure <em>Checkout</em>
        </h1>
        <p style={{ color: 'var(--mute)', marginBottom: '40px' }}>
          Please provide delivery details for your nitrogen-sealed single-origin spices.
        </p>

        {errorMessage && (
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: 'rgba(239, 83, 80, 0.15)',
              border: '1px solid #ef5350',
              borderRadius: '14px',
              color: '#ffcdd2',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '24px',
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleProcessOrder}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
              alignItems: 'start',
            }}
          >
            {/* Left: Shipping & Payment Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Step 1: Contact Information */}
              <div className="card-luxury" style={{ padding: '28px', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: 'var(--ivory)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--gold)' }}>1.</span> Contact Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Senthil Kumar"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="senthil@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
                      Phone (For Delivery SMS) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Address */}
              <div className="card-luxury" style={{ padding: '28px', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: 'var(--ivory)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--gold)' }}>2.</span> Delivery Address
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
                      Street Address & Building *
                    </label>
                    <input
                      type="text"
                      name="street"
                      required
                      placeholder="House / Flat No., Road, Landmark"
                      value={formData.street}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
                      Apartment, Suite, Unit (Optional)
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      placeholder="Apartment or floor"
                      value={formData.apartment}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="e.g. Kochi"
                      value={formData.city}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      placeholder="e.g. Kerala"
                      value={formData.state}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      placeholder="682001"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      disabled
                      value={formData.country}
                      className="input-field"
                      style={{ opacity: 0.7 }}
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div className="card-luxury" style={{ padding: '28px', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: 'var(--ivory)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--gold)' }}>3.</span> Payment Method
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Razorpay Option */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      border: formData.paymentMethod === 'razorpay' ? '1px solid var(--gold)' : '1px solid var(--line)',
                      background: formData.paymentMethod === 'razorpay' ? 'rgba(212, 175, 55, 0.12)' : 'rgba(7, 19, 11, 0.6)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={formData.paymentMethod === 'razorpay'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'razorpay' })}
                      style={{ accentColor: 'var(--gold)', width: '18px', height: '18px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ivory)', fontWeight: 600 }}>
                        <CreditCard size={18} color="var(--gold)" />
                        <span>Razorpay Online Payment (UPI, Cards, Netbanking)</span>
                      </div>
                      <span style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginTop: '2px' }}>
                        Supports GPay, PhonePe, Paytm, Visa, Mastercard, RuPay & all banks.
                      </span>
                    </div>
                  </label>

                  {/* Cash on Delivery Option */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      border: formData.paymentMethod === 'cod' ? '1px solid var(--gold)' : '1px solid var(--line)',
                      background: formData.paymentMethod === 'cod' ? 'rgba(212, 175, 55, 0.12)' : 'rgba(7, 19, 11, 0.6)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                      style={{ accentColor: 'var(--gold)', width: '18px', height: '18px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ivory)', fontWeight: 600 }}>
                        <Truck size={18} color="var(--gold)" />
                        <span>Cash on Delivery (COD)</span>
                      </div>
                      <span style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginTop: '2px' }}>
                        Pay cash or UPI to courier upon doorstep delivery.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Order Review Sidebar */}
            <div
              className="card-luxury"
              style={{
                padding: '30px',
                borderRadius: '24px',
                position: 'sticky',
                top: '110px',
              }}
            >
              <h3 style={{ fontSize: '1.35rem', marginBottom: '20px', color: 'var(--ivory)' }}>
                Order Summary ({items.length} items)
              </h3>

              {/* Items List Mini */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', maxHeight: '280px', overflowY: 'auto' }}>
                {items.map((it) => (
                  <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                    <div>
                      <strong style={{ color: 'var(--ivory)', display: 'block' }}>{it.name}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>
                        {it.size} × {it.quantity}
                      </span>
                    </div>
                    <span style={{ color: 'var(--gold-light)', fontWeight: 600 }}>₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.92rem', color: 'var(--mute)', borderTop: '1px solid var(--line)', paddingTop: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span style={{ color: 'var(--ivory)' }}>₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a5d6a7' }}>
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GST (5%)</span>
                  <span style={{ color: 'var(--ivory)' }}>₹{tax}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Insured Shipping</span>
                  <span style={{ color: shippingFee === 0 ? '#a5d6a7' : 'var(--ivory)' }}>
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--line)',
                    paddingTop: '12px',
                    marginTop: '4px',
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    color: 'var(--ivory)',
                  }}
                >
                  <span>Total Due</span>
                  <span style={{ color: 'var(--gold-light)', fontFamily: 'var(--font-serif)' }}>₹{grandTotal}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '1.05rem' }}
              >
                {isSubmitting ? (
                  <>Initializing Payment...</>
                ) : formData.paymentMethod === 'razorpay' ? (
                  <>
                    Pay ₹{grandTotal} with Razorpay <ArrowRight size={18} />
                  </>
                ) : (
                  <>
                    Place Cash on Delivery Order <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px', color: 'var(--mute)', fontSize: '0.8rem' }}>
                <Lock size={14} color="var(--gold)" />
                <span>256-Bit Bank-Grade Encryption</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Razorpay Sandbox/Test Modal */}
      <RazorpayModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={grandTotal}
        orderId={pendingOrderId}
        customerName={formData.name}
        customerEmail={formData.email}
        customerPhone={formData.phone}
      />
    </div>
  );
}
