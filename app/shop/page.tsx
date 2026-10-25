'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, Heart, Sparkles, X } from 'lucide-react';
import { Product } from '@/types';
import { getProducts } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showWishlistOnly, setShowWishlistOnly] = useState<boolean>(initialFilter === 'wishlist');

  const { wishlist } = useCart();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const categories = ['All', 'Whole Pods', 'Whole Berries', 'Whole Buds', 'Floral & Lace'];

  // Filtering & Sorting
  const filteredProducts = products.filter((product) => {
    // Search query match
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.origin.toLowerCase().includes(query) ||
      product.aroma_notes.some((n) => n.toLowerCase().includes(query));

    // Category match
    const matchesCategory =
      selectedCategory === 'All' || product.category.toLowerCase() === selectedCategory.toLowerCase();

    // Wishlist filter
    const matchesWishlist = !showWishlistOnly || wishlist.includes(product.id);

    return matchesSearch && matchesCategory && matchesWishlist;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      const priceA = a.sizes_prices[0]?.price || 0;
      const priceB = b.sizes_prices[0]?.price || 0;
      return priceA - priceB;
    }
    if (sortBy === 'price-high') {
      const priceA = a.sizes_prices[a.sizes_prices.length - 1]?.price || 0;
      const priceB = b.sizes_prices[b.sizes_prices.length - 1]?.price || 0;
      return priceB - priceA;
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    return 0; // featured default
  });

  return (
    <div style={{ padding: '40px 5vw 100px', minHeight: '85vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '40px', textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
          <span className="badge badge-gold" style={{ marginBottom: '12px' }}>
            <Sparkles size={12} /> The Complete Reserve
          </span>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', marginBottom: '14px' }}>
            Single-Origin <em>Spices</em>
          </h1>
          <p style={{ color: 'var(--mute)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Hand-harvested at peak oil maturity from verified single estates across the Western Ghats.
            Calibrated and hermetically sealed to preserve raw botanical potency.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div
          style={{
            background: 'rgba(14, 32, 21, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--line)',
            borderRadius: '24px',
            padding: '20px 24px',
            marginBottom: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Top row: Search input & Sort */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Search Box */}
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--mute)',
                }}
              />
              <input
                type="text"
                placeholder="Search by spice name, aroma notes (citrus, cedar), or origin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '44px', height: '48px' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--mute)',
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort & Wishlist Toggle */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowWishlistOnly(!showWishlistOnly)}
                className={`btn btn-sm ${showWishlistOnly ? 'btn-primary' : 'btn-outline'}`}
                style={{ height: '48px', padding: '0 18px' }}
              >
                <Heart size={16} fill={showWishlistOnly ? '#120e03' : 'none'} />
                <span>Wishlist ({wishlist.length})</span>
              </button>

              <div style={{ position: 'relative' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field"
                  style={{
                    height: '48px',
                    padding: '0 36px 0 16px',
                    appearance: 'none',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                  }}
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <SlidersHorizontal
                  size={14}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: 'var(--mute)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bottom row: Category Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--mute)', marginRight: '4px' }}>Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: selectedCategory === cat ? '1px solid var(--gold)' : '1px solid var(--line)',
                  background: selectedCategory === cat ? 'var(--gold)' : 'rgba(7, 19, 11, 0.6)',
                  color: selectedCategory === cat ? '#120e03' : 'var(--ivory)',
                  fontSize: '0.85rem',
                  fontWeight: selectedCategory === cat ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--mute)' }}>
            Loading Reserve Collection...
          </div>
        ) : sortedProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              backgroundColor: 'rgba(14, 32, 21, 0.4)',
              borderRadius: '24px',
              border: '1px solid var(--line)',
            }}
          >
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>No spices match your selection</h3>
            <p style={{ color: 'var(--mute)', marginBottom: '24px' }}>
              Try clearing your search query or selecting a different category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setShowWishlistOnly(false);
              }}
              className="btn btn-primary btn-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '28px',
            }}
          >
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: 'center', padding: '120px 5vw', color: 'var(--mute)' }}>
          Loading Reserve Collection...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}

