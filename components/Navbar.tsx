'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, Menu, X, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, openCart, wishlist } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          padding: isScrolled ? '12px 5vw' : '18px 5vw',
          backgroundColor: isScrolled ? 'rgba(7, 19, 11, 0.94)' : 'rgba(7, 19, 11, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: isScrolled ? '1px solid var(--line)' : '1px solid rgba(212, 175, 55, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            width: '100%',
          }}
        >
          {/* Mobile Spacer to balance layout so logo stays centered */}
          <div className="mobile-only" style={{ width: '42px', flexShrink: 0 }} />

          {/* Brand Logo - Centered on mobile via CSS, Left-aligned on desktop */}
          <Link
            href="/"
            className="navbar-brand-logo"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              transition: 'transform 0.2s ease',
            }}
          >
            <Image
              src="/images/logo-gold.png"
              alt="Keyaar Premium Spices"
              width={160}
              height={52}
              priority
              style={{
                objectFit: 'contain',
                height: '42px',
                width: 'auto',
                filter: 'drop-shadow(0 2px 10px rgba(212, 175, 55, 0.35)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.9))',
              }}
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div
            className="desktop-links"
            style={{
              gap: '32px',
              alignItems: 'center',
              fontSize: '0.92rem',
              color: 'var(--ivory)',
            }}
          >
            <Link
              href="/shop"
              style={{
                color: pathname === '/shop' ? 'var(--gold-light)' : 'var(--ivory)',
                fontWeight: pathname === '/shop' ? 600 : 400,
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

          {/* Action Icons: Wishlist & Cart & Toggle Menu Aligned Nearest */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {/* Wishlist Link */}
            <Link
              href="/shop?filter=wishlist"
              className="btn-icon"
              title="Wishlist"
              style={{
                position: 'relative',
                width: '38px',
                height: '38px',
              }}
            >
              <Heart
                size={17}
                fill={wishlist.length > 0 ? 'var(--gold)' : 'none'}
                color={wishlist.length > 0 ? 'var(--gold)' : 'var(--ivory)'}
              />
              {wishlist.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'var(--gold)',
                    color: '#120e03',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    width: '17px',
                    height: '17px',
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

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              className="btn-icon"
              title="Shopping Cart"
              style={{
                position: 'relative',
                width: '38px',
                height: '38px',
              }}
            >
              <ShoppingBag size={17} />
              {totalItems > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'var(--gold)',
                    color: '#120e03',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    width: '17px',
                    height: '17px',
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

            {/* Shop Spices CTA (Desktop only - Hidden on mobile) */}
            <Link href="/shop" className="btn btn-primary btn-sm desktop-only">
              <Sparkles size={14} /> Shop Spices
            </Link>

            {/* Mobile Hamburger Toggle (Right next to Wishlist & Cart) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="btn-icon mobile-only"
              aria-label="Toggle menu"
              style={{
                width: '38px',
                height: '38px',
                background: 'rgba(212, 175, 55, 0.12)',
                borderColor: 'var(--line-strong)',
                color: 'var(--gold-light)',
              }}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu (Slide-out Overlay) */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 19, 11, 0.98)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            zIndex: 80,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px 6vw 36px',
            overflowY: 'auto',
          }}
        >
          {/* Drawer Top Header with Centered Gold Logo & Close Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--line)',
              paddingBottom: '18px',
            }}
          >
            <Image
              src="/images/logo-gold.png"
              alt="Keyaar Premium Spices"
              width={150}
              height={50}
              style={{
                objectFit: 'contain',
                height: '44px',
                width: 'auto',
                filter: 'drop-shadow(0 2px 10px rgba(212, 175, 55, 0.35))',
              }}
            />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-icon"
              aria-label="Close menu"
              style={{
                width: '40px',
                height: '40px',
                border: '1px solid var(--line-strong)',
                background: 'rgba(212, 175, 55, 0.15)',
                color: 'var(--gold-light)',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Navigation Links */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              padding: '28px 0',
              fontFamily: 'var(--font-serif)',
              fontSize: '1.35rem',
            }}
          >
            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: pathname === '/shop' ? 'var(--gold-light)' : 'var(--ivory)',
              }}
            >
              <span>The Collection</span>
              <ArrowRight size={18} color="var(--gold)" />
            </Link>
            <Link
              href="/#sensory"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Sensory Journey</span>
              <ArrowRight size={18} color="var(--gold)" />
            </Link>
            <Link
              href="/#process"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Artisan Craft</span>
              <ArrowRight size={18} color="var(--gold)" />
            </Link>
            <Link
              href="/track-order"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Track Order</span>
              <ArrowRight size={18} color="var(--gold)" />
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1.05rem',
                color: '#c9dba9',
                fontFamily: 'var(--font-sans)',
                paddingTop: '6px',
              }}
            >
              <Shield size={18} /> Admin Management
            </Link>
          </div>

          {/* Prominent Shop Spices Button inside Side Navigation as requested */}
          <div style={{ paddingTop: '10px' }}>
            <Link
              href="/shop"
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontSize: '1.05rem',
                fontWeight: 600,
                boxShadow: '0 6px 24px rgba(212, 175, 55, 0.35)',
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Sparkles size={18} /> Shop Spices Catalog
            </Link>
            <p
              style={{
                textAlign: 'center',
                color: 'var(--mute)',
                fontSize: '0.8rem',
                marginTop: '14px',
                letterSpacing: '0.04em',
              }}
            >
              100% Hand-Graded • Single-Origin • Kerala, India
            </p>
          </div>
        </div>
      )}
    </>
  );
}
