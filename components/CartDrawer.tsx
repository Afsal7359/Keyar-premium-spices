'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
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
  const [couponMessage, setCouponMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsApplying(true);
    setCouponMessage(null);
    const result = await applyCoupon(couponCode);
    setIsApplying(false);

    setCouponMessage({
      text: result.message,
      error: !result.success,
    });

    if (result.success) {
      setCouponCode('');
    }
  };

  if (!isCartOpen) return null;

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Slide-over panel */}
      <aside
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          backgroundColor: '#0a1a0f',
          borderLeft: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.6)',
          zIndex: 95,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color="var(--gold)" />
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--ivory)' }}>
              Your Spice Basket
            </h3>
            <span className="badge badge-gold">{items.length}</span>
          </div>
          <button
            onClick={closeCart}
            className="btn-icon"
            style={{ width: '36px', height: '36px' }}
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free shipping progress bar */}
        <div
          style={{
            padding: '12px 24px',
            background: 'rgba(14, 32, 21, 0.9)',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              color: 'var(--ivory)',
              marginBottom: '6px',
            }}
          >
            {freeShippingRemaining > 0 ? (
              <span>
                Add <b style={{ color: 'var(--gold-light)' }}>₹{freeShippingRemaining}</b> for Free Insured Shipping
              </span>
            ) : (
              <span style={{ color: '#a5d6a7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} /> Congratulations! You unlocked Free Shipping
              </span>
            )}
            <span style={{ color: 'var(--mute)' }}>₹{subtotal} / ₹{freeShippingThreshold}</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--moss), var(--gold))',
                borderRadius: '3px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Items List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'var(--mute)',
                padding: '40px 0',
              }}
            >
              <ShoppingBag size={48} strokeWidth={1} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h4 style={{ color: 'var(--ivory)', marginBottom: '8px' }}>Your basket is empty</h4>
              <p style={{ fontSize: '0.9rem', maxWidth: '280px', marginBottom: '24px' }}>
                Explore our hand-graded reserve collection picked at peak oil maturity.
              </p>
              <Link href="/shop" onClick={closeCart} className="btn btn-primary btn-sm">
                <Sparkles size={14} /> Explore Spices
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 1fr auto',
                  gap: '14px',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(18, 40, 26, 0.4)',
                  border: '1px solid var(--line)',
                  borderRadius: '16px',
                }}
              >
                {/* Image */}
                <div
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid var(--line)',
                    position: 'relative',
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="70px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                {/* Details */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--ivory)' }}>
                    {item.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                    <span className="badge badge-gold" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                      {item.size}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gold-light)' }}>
                      ₹{item.price}
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(7, 19, 11, 0.8)',
                      borderRadius: '20px',
                      padding: '2px 8px',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      style={{ color: 'var(--ivory)', padding: '2px' }}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{ color: 'var(--ivory)', padding: '2px' }}
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Price & Remove */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, color: 'var(--ivory)', marginBottom: '8px' }}>
                    ₹{item.price * item.quantity}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ color: 'var(--mute)', transition: 'color 0.2s' }}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Coupon & Checkout */}
        {items.length > 0 && (
          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--line)',
              backgroundColor: 'rgba(10, 26, 15, 0.95)',
            }}
          >
            {/* Coupon Section */}
            <div style={{ marginBottom: '16px' }}>
              {appliedCoupon ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(95, 124, 58, 0.25)',
                    border: '1px solid rgba(95, 124, 58, 0.5)',
                    padding: '8px 14px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={14} color="var(--gold-light)" />
                    <span>
                      Coupon <b>{appliedCoupon.code}</b> applied! (Save ₹{discount})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    style={{ color: '#ef9a9a', fontSize: '0.8rem', fontWeight: 500 }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. KEYAAR10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="input-field"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  />
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="btn btn-outline btn-sm"
                  >
                    {isApplying ? 'Applying...' : 'Apply'}
                  </button>
                </form>
              )}
              {couponMessage && (
                <p
                  style={{
                    fontSize: '0.78rem',
                    marginTop: '6px',
                    color: couponMessage.error ? '#ef9a9a' : '#a5d6a7',
                  }}
                >
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '0.88rem',
                color: 'var(--mute)',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span style={{ color: 'var(--ivory)' }}>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a5d6a7' }}>
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Estimated GST (5%)</span>
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
                  paddingTop: '8px',
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: 'var(--ivory)',
                }}
              >
                <span>Total</span>
                <span style={{ color: 'var(--gold-light)' }}>₹{grandTotal}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
