'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { getOrderById } from '@/lib/db';
import { Order } from '@/types';

export default function TrackOrderPage() {
  const [orderQuery, setOrderQuery] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    setLoading(true);
    setHasSearched(true);
    const cleanId = orderQuery.trim().toUpperCase();
    const result = await getOrderById(cleanId);
    setOrder(result);
    setLoading(false);
  };

  const getStepProgress = (status: Order['order_status']) => {
    switch (status) {
      case 'Processing':
        return 2;
      case 'Shipped':
        return 4;
      case 'Delivered':
        return 5;
      case 'Cancelled':
        return 0;
      default:
        return 1;
    }
  };

  const activeStep = order ? getStepProgress(order.order_status) : 1;

  return (
    <div style={{ padding: '40px 5vw 120px', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="badge badge-gold" style={{ marginBottom: '12px' }}>
            Consignment Tracker
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', marginBottom: '12px' }}>
            Track Your <em>Spice Order</em>
          </h1>
          <p style={{ color: 'var(--mute)', fontSize: '1rem', lineHeight: 1.6 }}>
            Enter your Keyaar Order ID (e.g. KYR-2026-1042) to inspect real-time grading, sealing, and courier dispatch milestones.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
          <input
            type="text"
            required
            placeholder="Enter Order ID (e.g. KYR-2026-1042)"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            className="input-field"
            style={{ height: '52px', fontSize: '1rem' }}
          />
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0 28px' }}>
            {loading ? 'Locating...' : 'Track'}
          </button>
        </form>

        {/* Quick Sample IDs hint */}
        <div style={{ textAlign: 'center', marginBottom: '40px', fontSize: '0.82rem', color: 'var(--mute)' }}>
          Sample Test Orders: <button onClick={() => setOrderQuery('KYR-2026-1042')} style={{ color: 'var(--gold)', textDecoration: 'underline' }}>KYR-2026-1042</button> or <button onClick={() => setOrderQuery('KYR-2026-1089')} style={{ color: 'var(--gold)', textDecoration: 'underline' }}>KYR-2026-1089</button>
        </div>

        {/* Results */}
        {hasSearched && !loading && (
          <>
            {order ? (
              <div className="card-luxury" style={{ padding: '36px', borderRadius: '24px' }}>
                {/* Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '20px', marginBottom: '32px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--mute)', display: 'block' }}>Order Reference</span>
                    <h2 style={{ fontSize: '1.6rem', color: 'var(--gold-light)' }}>#{order.id}</h2>
                  </div>
                  <div>
                    <span className="badge badge-moss" style={{ fontSize: '0.85rem' }}>
                      Status: {order.order_status}
                    </span>
                    {order.tracking_number && (
                      <span style={{ display: 'block', fontSize: '0.82rem', color: 'var(--mute)', marginTop: '4px' }}>
                        Carrier AWB: <b>{order.tracking_number}</b>
                      </span>
                    )}
                  </div>
                </div>

                {/* Milestone Step Progress Tracker */}
                <div style={{ marginBottom: '40px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '16px' }}>
                    {/* Connecting Line */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '16px',
                        left: '20px',
                        right: '20px',
                        height: '3px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        zIndex: 1,
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${((activeStep - 1) / 4) * 100}%`,
                          background: 'var(--gold)',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>

                    {[
                      { step: 1, label: 'Placed' },
                      { step: 2, label: 'Hand-Grading' },
                      { step: 3, label: 'Nitrogen Sealed' },
                      { step: 4, label: 'In Transit' },
                      { step: 5, label: 'Delivered' },
                    ].map((st) => (
                      <div
                        key={st.step}
                        style={{
                          position: 'relative',
                          zIndex: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: activeStep >= st.step ? 'var(--gold)' : '#0d2014',
                            border: activeStep >= st.step ? '2px solid var(--gold-light)' : '2px solid var(--line)',
                            color: activeStep >= st.step ? '#120e03' : 'var(--mute)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                          }}
                        >
                          {activeStep > st.step ? <CheckCircle2 size={16} /> : st.step}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: activeStep >= st.step ? 'var(--ivory)' : 'var(--mute)', textAlign: 'center' }}>
                          {st.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary Breakdown */}
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '14px', color: 'var(--ivory)' }}>
                    Consignment Items ({order.items.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {order.items.map((it, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span>
                          {it.name} <span style={{ color: 'var(--mute)' }}>({it.size} × {it.quantity})</span>
                        </span>
                        <span style={{ color: 'var(--gold-light)', fontWeight: 600 }}>₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: '12px', fontSize: '1.1rem', fontWeight: 600 }}>
                    <span>Total Consignment Value</span>
                    <span style={{ color: 'var(--gold-light)' }}>₹{order.total}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: 'rgba(14, 32, 21, 0.4)',
                  borderRadius: '20px',
                  border: '1px solid var(--line)',
                }}
              >
                <AlertCircle size={32} color="#ef5350" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No order found with ID &quot;{orderQuery}&quot;</h3>
                <p style={{ color: 'var(--mute)', fontSize: '0.9rem' }}>
                  Please check the spelling or format of your Order ID.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
