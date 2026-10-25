'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, wishlist, toggleWishlist } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes_prices[1]?.size || product.sizes_prices[0]?.size || '100g'
  );
  const [isAdded, setIsAdded] = useState(false);

  const isFavorite = wishlist.includes(product.id);
  const currentOption =
    product.sizes_prices.find((s) => s.size === selectedSize) || product.sizes_prices[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, selectedSize, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <article
      className="card-luxury"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 16px 22px',
        position: 'relative',
        borderRadius: '24px 24px 24px 72px',
        overflow: 'hidden',
      }}
    >
      {/* Top Media Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1',
          borderRadius: '16px 16px 16px 64px',
          overflow: 'hidden',
          marginBottom: '16px',
          backgroundColor: '#0c1d12',
        }}
      >
        <Link href={`/products/${product.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
          <Image
            src={product.images[0] || '/images/spices/cardamom.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{
              objectFit: 'cover',
              transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
            className="product-img-hover"
          />
        </Link>

        {/* Grade Badge */}
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          <span className="badge badge-gold" style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
            {product.grade.split('(')[0].trim()}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="btn-icon"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            background: 'rgba(7, 19, 11, 0.75)',
            backdropFilter: 'blur(8px)',
          }}
          aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={isFavorite ? 'var(--gold)' : 'none'} color={isFavorite ? 'var(--gold)' : 'var(--ivory)'} />
        </button>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '0 4px' }}>
        {/* Rating & Reviews */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', color: 'var(--gold)' }}>
            <Star size={13} fill="var(--gold)" />
          </div>
          <span style={{ fontWeight: 600, color: 'var(--ivory)' }}>{product.rating}</span>
          <span style={{ color: 'var(--mute)' }}>({product.review_count} reviews)</span>
        </div>

        {/* Title */}
        <Link href={`/products/${product.slug}`}>
          <h3
            style={{
              fontSize: '1.35rem',
              fontWeight: 500,
              fontFamily: 'var(--font-serif)',
              color: 'var(--ivory)',
              lineHeight: 1.25,
              marginBottom: '4px',
              transition: 'color 0.2s',
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Short description / Aroma note */}
        <p
          style={{
            fontSize: '0.86rem',
            color: 'var(--mute)',
            lineHeight: 1.5,
            marginBottom: '14px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.short_description || product.description}
        </p>

        {/* Pack Size Selector Chips */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--mute)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Select Calibrated Size:
          </div>
          <div className="size-chips">
            {product.sizes_prices.map((option) => (
              <button
                key={option.size}
                type="button"
                onClick={() => setSelectedSize(option.size)}
                className={`size-chip ${selectedSize === option.size ? 'active' : ''}`}
              >
                {option.size}
              </button>
            ))}
          </div>
        </div>

        {/* Price & Add to Cart footer */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--line)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--mute)', display: 'block' }}>
              Sealed Pack Price
            </span>
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: 600,
                color: 'var(--gold-light)',
                fontFamily: 'var(--font-serif)',
              }}
            >
              ₹{currentOption?.price}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`btn ${isAdded ? 'btn-secondary' : 'btn-primary'}`}
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
          >
            {isAdded ? (
              <>
                <Check size={16} /> Added
              </>
            ) : (
              <>
                <ShoppingBag size={16} /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .card-luxury:hover .product-img-hover {
          transform: scale(1.08);
        }
      `}</style>
    </article>
  );
}
