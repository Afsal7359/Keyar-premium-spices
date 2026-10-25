'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, Menu, X, Shield, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, openCart, wishlist } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          padding: isScrolled ? '14px 5vw' : '22px 5vw',
          backgroundColor: isScrolled ? 'rgba(7, 19, 11, 0.92)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(16px)' : 'none',
          borderBottom: isScrolled ? '1px solid var(--line)' : '1px solid transparent',
          transition: 'all 0.35s ease',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Brand Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              background: '#f8f4e9',
              borderRadius: '10px',
              padding: '3px 10px',
              display: 'flex',
              alignItems: 'center',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
              transition: 'transform 0.2s ease',
            }}
          >
            <Image
              src="/images/logo.png"
              alt="Keyaar Premium Spices"
              width={130}
              height={44}
              priority
              style={{
                objectFit: 'contain',
                height: '36px',
                width: 'auto',
              }}
            />
          </div>
        </Link>

        {/* Desktop Links */}
        <div
          style={{
            display: 'none',
            gap: '32px',
            alignItems: 'center',
            fontSize: '0.92rem',
            color: 'var(--ivory)',
          }}
          className="desktop-links"
        >
          <Link
            href="/shop"
            style={{
              color: pathname === '/shop' ? 'var(--gold-light)' : 'var(--ivory)',
              transition: 'color 0.2s',
            }}
          >
            Collection
          </Link>
          <Link href="/#sensory" style={{ transition: 'color 0.2s' }}>
            Sensory Journey
          </Link>
          <Link href="/#process" style={{ transition: 'color 0.2s' }}>
            Our Craft
          </Link>
          <Link href="/track-order" style={{ transition: 'color 0.2s' }}>
            Track Order
          </Link>
          <Link
            href="/admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid var(--line)',
              background: 'rgba(95, 124, 58, 0.2)',
              color: '#d0dfb6',
              fontSize: '0.82rem',
              fontWeight: 500,
            }}
          >
            <Shield size={14} /> Admin
          </Link>
        </div>

        {/* Actions (Wishlist, Cart, Mobile Toggle) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Wishlist Link */}
          <Link
            href="/shop?filter=wishlist"
            className="btn-icon"
            title="Wishlist"
            style={{ position: 'relative' }}
          >
            <Heart size={18} fill={wishlist.length > 0 ? 'var(--gold)' : 'none'} color={wishlist.length > 0 ? 'var(--gold)' : 'var(--ivory)'} />
            {wishlist.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--gold)',
                  color: '#120e03',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="btn-icon"
            title="Shopping Cart"
            style={{ position: 'relative' }}
          >
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--gold)',
                  color: '#120e03',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 10px var(--gold-glow)',
                }}
              >
                {totalItems}
              </span>
            )}
          </button>

          {/* Shop Spices CTA */}
          <Link href="/shop" className="btn btn-primary btn-sm desktop-only">
            <Sparkles size={14} /> Shop Spices
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="btn-icon mobile-only"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 19, 11, 0.98)',
            backdropFilter: 'blur(20px)',
            zIndex: 55,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '28px',
            padding: '24px',
            fontSize: '1.4rem',
            fontFamily: 'var(--font-serif)',
          }}
        >
          <div
            style={{
              background: '#f8f4e9',
              borderRadius: '12px',
              padding: '6px 14px',
              marginBottom: '10px',
              border: '1px solid rgba(212, 175, 55, 0.4)',
            }}
          >
            <Image
              src="/images/logo.png"
              alt="Keyaar Premium Spices"
              width={150}
              height={50}
              style={{ objectFit: 'contain', height: '44px', width: 'auto' }}
            />
          </div>
          <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)}>
            Collection
          </Link>
          <Link href="/#sensory" onClick={() => setIsMobileMenuOpen(false)}>
            Sensory Journey
          </Link>
          <Link href="/#process" onClick={() => setIsMobileMenuOpen(false)}>
            Our Craft
          </Link>
          <Link href="/track-order" onClick={() => setIsMobileMenuOpen(false)}>
            Track Order
          </Link>
          <Link
            href="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              fontSize: '1rem',
              color: 'var(--gold-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Shield size={18} /> Admin Dashboard
          </Link>
          <Link
            href="/shop"
            className="btn btn-primary"
            style={{ marginTop: '16px', fontSize: '1rem' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Explore Spices
          </Link>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 900px) {
          .desktop-links {
            display: flex !important;
          }
          .desktop-only {
            display: inline-flex !important;
          }
          .mobile-only {
            display: none !important;
          }
        }
        @media (max-width: 899px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: inline-flex !important;
          }
        }
      `}</style>
    </>
  );
}
