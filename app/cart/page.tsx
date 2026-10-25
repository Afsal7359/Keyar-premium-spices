'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    shippingFee,
    tax,
    grandTotal,
    freeShippingThreshold,
    freeShippingRemaining,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplying(true);
    setCouponMsg(null);
    const res = await applyCoupon(couponCode);
    setIsApplying(false);
    setCouponMsg({ text: res.message, error: !res.success });
    if (res.success) setCouponCode('');
  };

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (items.length === 0) {
    return (
      <div style={{ padding: '80px 5vw 120px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '500px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: 'var(--gold)',
            }}
          >
            <ShoppingBag size={36} />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>Your Basket is Empty</h1>
          <p style={{ color: 'var(--mute)', marginBottom: '32px', lineHeight: 1.6 }}>
            Discover our single-origin, hand-graded spices harvested at peak essential oil maturity.
          </p>
          <Link href="/shop" className="btn btn-primary btn-lg">
            Explore Collection <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 5vw 120px' }}>
      <div className="container">
        {/* Title & Navigation */}
        <div style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '6px' }}>
              Your Spice <em>Basket</em>
            </h1>
            <p style={{ color: 'var(--mute)', fontSize: '0.95rem' }}>
              Review your selected pack sizes before secure checkout.
            </p>
          </div>
          <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--gold-light)', fontSize: '0.92rem' }}>
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>

        {/* Free Shipping Alert Bar */}
        <div
          style={{
            padding: '16px 20px',
            background: 'rgba(14, 32, 21, 0.8)',
            border: '1px solid var(--line)',
            borderRadius: '16px',
            marginBottom: '36px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.88rem' }}>
            {freeShippingRemaining > 0 ? (
              <span>
                Add <b style={{ color: 'var(--gold-light)' }}>₹{freeShippingRemaining}</b> more for Free Insured Shipping
              </span>
            ) : (
              <span style={{ color: '#a5d6a7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={16} /> Free Insured Delivery Unlocked!
              </span>
            )}
            <span style={{ color: 'var(--mute)' }}>₹{subtotal} / ₹{freeShippingThreshold}</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--moss), var(--gold))',
                borderRadius: '4px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Main Grid: Items Table & Order Summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'start',
          }}
        >
          {/* Left: Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {items.map((item) => (
              <div
                key={item.id}
                className="card-luxury"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr auto',
                  gap: '20px',
                  alignItems: 'center',
                  padding: '18px 20px',
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    position: 'relative',
                    width: '90px',
                    height: '90px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backgroundColor: '#0c1d12',
                    border: '1px solid var(--line)',
                  }}
                >
                  <Image src={item.image} alt={item.name} fill sizes="90px" style={{ objectFit: 'cover' }} />
                </div>

                {/* Info */}
                <div>
                  <Link href={`/products/${item.slug}`}>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--ivory)', marginBottom: '4px' }}>
                      {item.name}
                    </h3>
                  </Link>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                    <span className="badge badge-gold" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                      {item.size}
                    </span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--mute)' }}>₹{item.price} each</span>
                  </div>

                  {/* Quantity Controls */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'rgba(7, 19, 11, 0.8)',
                      border: '1px solid var(--line)',
                      borderRadius: '20px',
                      padding: '4px 10px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      style={{ color: 'var(--ivory)', padding: '2px' }}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', minWidth: '20px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{ color: 'var(--ivory)', padding: '2px' }}
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                {/* Subtotal & Delete */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                  <span
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: 'var(--gold-light)',
                      fontFamily: 'var(--font-serif)',
                    }}
                  >
                    ₹{item.price * item.quantity}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ color: 'var(--mute)', transition: 'color 0.2s', padding: '4px' }}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                onClick={clearCart}
                style={{ color: '#ef9a9a', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Clear Entire Basket
              </button>
            </div>
          </div>

          {/* Right: Order Summary Card */}
          <div
            className="card-luxury"
            style={{
              padding: '30px',
              borderRadius: '24px',
              position: 'sticky',
              top: '110px',
            }}
          >
            <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', color: 'var(--ivory)' }}>
              Order Summary
            </h3>

            {/* Coupon Code Section */}
            <div style={{ marginBottom: '24px' }}>
              {appliedCoupon ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(95, 124, 58, 0.25)',
                    border: '1px solid rgba(95, 124, 58, 0.5)',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tag size={16} color="var(--gold-light)" />
                    <span>
                      Coupon <b>{appliedCoupon.code}</b> (-₹{discount})
                    </span>
                  </div>
                  <button onClick={removeCoupon} style={{ color: '#ef9a9a', fontSize: '0.82rem', fontWeight: 500 }}>
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCouponSubmit} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Coupon (KEYAAR10, PREMIUM200)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="input-field"
                    style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                  />
                  <button type="submit" disabled={isApplying} className="btn btn-outline btn-sm">
                    {isApplying ? 'Applying...' : 'Apply'}
                  </button>
                </form>
              )}
              {couponMsg && (
                <p style={{ fontSize: '0.8rem', marginTop: '6px', color: couponMsg.error ? '#ef9a9a' : '#a5d6a7' }}>
                  {couponMsg.text}
                </p>
              )}
            </div>

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem', color: 'var(--mute)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal ({items.length} items)</span>
                <span style={{ color: 'var(--ivory)' }}>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a5d6a7' }}>
                  <span>Promotional Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GST (5%)</span>
                <span style={{ color: 'var(--ivory)' }}>₹{tax}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Insured Courier</span>
                <span style={{ color: shippingFee === 0 ? '#a5d6a7' : 'var(--ivory)' }}>
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--line)',
                  paddingTop: '14px',
                  marginTop: '6px',
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: 'var(--ivory)',
                }}
              >
                <span>Grand Total</span>
                <span style={{ color: 'var(--gold-light)', fontFamily: 'var(--font-serif)' }}>₹{grandTotal}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '1rem' }}>
              Proceed to Checkout <ArrowRight size={18} />
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px', color: 'var(--mute)', fontSize: '0.8rem' }}>
              <ShieldCheck size={16} color="var(--gold)" />
              <span>Razorpay 256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
