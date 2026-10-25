'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Printer, Truck, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '@/types';
import { getOrderById } from '@/lib/db';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire celebratory gold/emerald confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#f3df9c', '#5f7c3a', '#ffffff'],
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }

    async function loadOrder() {
      if (!orderId) return;
      const data = await getOrderById(orderId);
      setOrder(data);
      setLoading(false);
    }
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 5vw', color: 'var(--mute)' }}>
        Generating your harvest invoice...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 5vw' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Order Not Found</h2>
        <p style={{ color: 'var(--mute)', marginBottom: '24px' }}>
          We could not find records for order #{orderId}.
        </p>
        <Link href="/shop" className="btn btn-primary">
          Return to Collection
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 5vw 120px' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        {/* Success Card Header */}
        <div
          className="card-luxury"
          style={{
            padding: '40px 32px',
            textAlign: 'center',
            marginBottom: '32px',
            borderRadius: '24px',
            position: 'relative',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'inline-flex',
                background: '#f8f4e9',
                borderRadius: '12px',
                padding: '6px 16px',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
              }}
            >
              <Image
                src="/images/logo.png"
                alt="Keyaar Premium Spices"
                width={150}
                height={50}
                style={{ objectFit: 'contain', height: '42px', width: 'auto' }}
              />
            </div>
          </div>

          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              border: '2px solid var(--gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'var(--gold-light)',
            }}
          >
            <CheckCircle2 size={40} />
          </div>

          <span className="badge badge-moss" style={{ marginBottom: '12px' }}>
            Payment Verified & Confirmed
          </span>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '12px', color: 'var(--ivory)' }}>
            Thank you, {order.customer_name.split(' ')[0]}!
          </h1>
          <p style={{ color: 'var(--mute)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '52ch', margin: '0 auto 24px' }}>
            Your reserve order has been confirmed. Our plantation masters are hand-grading and sealing your fresh spices in our nitrogen-purged facility.
          </p>

          <div
            style={{
              display: 'inline-flex',
              gap: '20px',
              padding: '12px 24px',
              backgroundColor: 'rgba(7, 19, 11, 0.8)',
              borderRadius: '16px',
              border: '1px solid var(--line)',
              fontSize: '0.92rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div>
              <span style={{ color: 'var(--mute)', display: 'block', fontSize: '0.78rem' }}>Order Number</span>
              <strong style={{ color: 'var(--gold-light)' }}>#{order.id}</strong>
            </div>
            <div style={{ width: '1px', background: 'var(--line)' }} />
            <div>
              <span style={{ color: 'var(--mute)', display: 'block', fontSize: '0.78rem' }}>Payment Status</span>
              <strong style={{ color: order.payment_status === 'paid' ? '#a5d6a7' : 'var(--gold-light)' }}>
                {order.payment_method === 'razorpay' ? 'Paid via Razorpay' : 'COD (Pay on Delivery)'}
              </strong>
            </div>
            <div style={{ width: '1px', background: 'var(--line)' }} />
            <div>
              <span style={{ color: 'var(--mute)', display: 'block', fontSize: '0.78rem' }}>Total Amount</span>
              <strong style={{ color: 'var(--ivory)' }}>₹{order.total}</strong>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="card-luxury" style={{ padding: '32px', borderRadius: '24px', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: 'var(--ivory)', borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
            Purchased Harvest Items
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--ivory)', fontSize: '1rem', display: 'block' }}>{item.name}</strong>
                  <span style={{ fontSize: '0.82rem', color: 'var(--mute)' }}>
                    Pack Size: {item.size} × {item.quantity} units
                  </span>
                </div>
                <span style={{ color: 'var(--gold-light)', fontWeight: 600, fontSize: '1.05rem' }}>
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--line)', paddingTop: '16px', fontSize: '0.9rem', color: 'var(--mute)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span style={{ color: 'var(--ivory)' }}>₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a5d6a7' }}>
                <span>Coupon Discount ({order.coupon_code})</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>GST (5%)</span>
              <span style={{ color: 'var(--ivory)' }}>₹{order.tax}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Insured Shipping</span>
              <span style={{ color: order.shipping_fee === 0 ? '#a5d6a7' : 'var(--ivory)' }}>
                {order.shipping_fee === 0 ? 'FREE' : `₹${order.shipping_fee}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: '12px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--ivory)' }}>
              <span>Total Paid</span>
              <span style={{ color: 'var(--gold-light)', fontFamily: 'var(--font-serif)' }}>₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Shipping Destination */}
        <div className="card-luxury" style={{ padding: '28px', borderRadius: '24px', marginBottom: '36px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '14px', color: 'var(--ivory)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="var(--gold)" /> Delivery Destination
          </h3>
          <p style={{ color: 'var(--ivory)', lineHeight: 1.6 }}>
            <b>{order.customer_name}</b> ({order.customer_phone})<br />
            {order.shipping_address.street}
            {order.shipping_address.apartment && `, ${order.shipping_address.apartment}`}<br />
            {order.shipping_address.city}, {order.shipping_address.state} – {order.shipping_address.pincode}<br />
            {order.shipping_address.country}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.print()}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Printer size={16} /> Print Receipt
          </button>
          <Link href="/track-order" className="btn btn-primary">
            <Truck size={16} /> Track Shipment Status
          </Link>
          <Link href="/shop" className="btn btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
