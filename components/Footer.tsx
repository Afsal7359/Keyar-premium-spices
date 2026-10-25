'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, Award, Sparkles, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--line)',
        backgroundColor: '#050f08',
        padding: '80px 5vw 40px',
        color: 'var(--mute)',
        fontSize: '0.92rem',
      }}
    >
      <div
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '48px',
          marginBottom: '60px',
        }}
      >
        {/* Brand column */}
        <div>
          <div
            style={{
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                background: '#f8f4e9',
                borderRadius: '10px',
                padding: '4px 12px',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
              }}
            >
              <Image
                src="/images/logo.png"
                alt="Keyaar Premium Spices"
                width={140}
                height={48}
                style={{ objectFit: 'contain', height: '38px', width: 'auto' }}
              />
            </div>
          </div>
          <p style={{ lineHeight: 1.7, marginBottom: '20px' }}>
            Single-origin whole spices harvested exclusively at peak oil maturity.
            Graded by hand, batch-tested, and hermetically sealed to preserve the intense
            botanical aroma of the Malabar and High Range estates.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-gold">
              <Award size={12} /> 100% Single Origin
            </span>
            <span className="badge badge-moss">
              <Sparkles size={12} /> Grade A+ Bold
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4
            style={{
              color: 'var(--ivory)',
              fontSize: '1.1rem',
              marginBottom: '18px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
            }}
          >
            Collection
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <Link href="/products/green-cardamom" style={{ transition: 'color 0.2s' }}>
                Green Cardamom (8mm+ Bold)
              </Link>
            </li>
            <li>
              <Link href="/products/tellicherry-black-pepper" style={{ transition: 'color 0.2s' }}>
                Tellicherry Black Pepper (TGSEB)
              </Link>
            </li>
            <li>
              <Link href="/products/zanzibar-whole-cloves" style={{ transition: 'color 0.2s' }}>
                Zanzibar Whole Cloves
              </Link>
            </li>
            <li>
              <Link href="/products/nutmeg-flower-mace" style={{ transition: 'color 0.2s' }}>
                Nutmeg Flower (Golden Mace)
              </Link>
            </li>
            <li>
              <Link href="/shop" style={{ color: 'var(--gold-light)' }}>
                View All Spices →
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4
            style={{
              color: 'var(--ivory)',
              fontSize: '1.1rem',
              marginBottom: '18px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
            }}
          >
            Customer Care
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <Link href="/track-order">Track Your Order</Link>
            </li>
            <li>
              <Link href="/checkout">Express Checkout</Link>
            </li>
            <li>
              <Link href="/#process">Our 4-Step Quality Craft</Link>
            </li>
            <li>
              <Link href="/admin">Merchant & Admin Portal</Link>
            </li>
            <li style={{ color: 'var(--ivory-muted)' }}>
              Concierge: concierge@keyaarspices.com
            </li>
          </ul>
        </div>

        {/* Trust & Guarantee */}
        <div>
          <h4
            style={{
              color: 'var(--ivory)',
              fontSize: '1.1rem',
              marginBottom: '18px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
            }}
          >
            Our Guarantee
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Truck size={18} color="var(--gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Complimentary insured shipping on orders above ₹999 across India.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Lock size={18} color="var(--gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>256-bit encrypted secure checkout with UPI, Cards, and Netbanking.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <ShieldCheck size={18} color="var(--gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Aroma lock guarantee — 100% replacement if seal integrity is broken.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="container"
        style={{
          borderTop: '1px solid var(--line)',
          paddingTop: '26px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.85rem',
        }}
      >
        <span>© 2026 Keyaar Premium Spices. All Rights Reserved.</span>
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
          <span>Powered by Next.js & Supabase</span>
          <span style={{ color: 'var(--gold)' }}>•</span>
          <span>Secure Gateway Integration</span>
        </div>
      </div>
    </footer>
  );
}
