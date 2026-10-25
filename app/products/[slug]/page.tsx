'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Check,
  Award,
} from 'lucide-react';
import { Product, Review } from '@/types';
import { getProductBySlug, getProducts, getReviews, addReview } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('100g');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);

  // Review form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const { addItem, wishlist, toggleWishlist } = useCart();

  useEffect(() => {
    async function loadProductData() {
      if (!slug) return;
      setLoading(true);
      const data = await getProductBySlug(slug);
      if (data) {
        setProduct(data);
        setSelectedImage(data.images[0] || '/images/spices/cardamom.jpg');
        setSelectedSize(data.sizes_prices[1]?.size || data.sizes_prices[0]?.size || '100g');

        // Fetch related products
        const allProducts = await getProducts();
        setRelatedProducts(allProducts.filter((p) => p.slug !== slug).slice(0, 3));

        // Fetch reviews
        const revs = await getReviews(slug);
        setReviews(revs);
      }
      setLoading(false);
    }
    loadProductData();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 5vw', color: 'var(--mute)' }}>
        Loading reserve specifications...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 5vw' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Spice Not Found</h2>
        <p style={{ color: 'var(--mute)', marginBottom: '24px' }}>
          The requested spice could not be located in our reserve catalog.
        </p>
        <Link href="/shop" className="btn btn-primary">
          Back to Collection
        </Link>
      </div>
    );
  }

  const currentOption =
    product.sizes_prices.find((s) => s.size === selectedSize) || product.sizes_prices[0];
  const isFavorite = wishlist.includes(product.id);

  const handleAddToCart = () => {
    addItem(product, selectedSize, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  const handleBuyNow = () => {
    addItem(product, selectedSize, quantity);
    router.push('/checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    const newRev = await addReview({
      product_slug: product.slug,
      author_name: reviewName,
      rating: reviewRating,
      comment: reviewComment,
    });

    setReviews([newRev, ...reviews]);
    setReviewName('');
    setReviewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  return (
    <div style={{ padding: '30px 5vw 100px' }}>
      <div className="container">
        {/* Breadcrumbs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            color: 'var(--mute)',
            marginBottom: '32px',
          }}
        >
          <Link href="/" style={{ color: 'var(--mute)' }}>
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" style={{ color: 'var(--mute)' }}>
            Collection
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--gold-light)' }}>{product.name}</span>
        </div>

        {/* Main Product Showcase Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '50px',
            alignItems: 'start',
            marginBottom: '80px',
          }}
        >
          {/* Left Column: Gallery */}
          <div>
            {/* Big Main Image */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1',
                borderRadius: '24px 24px 24px 80px',
                overflow: 'hidden',
                backgroundColor: '#0c1f13',
                border: '1px solid var(--line)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
                marginBottom: '16px',
              }}
            >
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 550px"
                style={{ objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                <span className="badge badge-gold">
                  <Award size={12} /> {product.grade}
                </span>
              </div>
            </div>

            {/* Thumbnail switcher (supports multiple images or variants) */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  style={{
                    position: 'relative',
                    width: '80px',
                    height: '80px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: selectedImage === img ? '2px solid var(--gold)' : '1px solid var(--line)',
                    cursor: 'pointer',
                    background: '#0c1f13',
                  }}
                >
                  <Image src={img} alt={`${product.name} preview`} fill sizes="80px" style={{ objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Specifications & Purchasing */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-moss">{product.origin}</span>
              <span className="badge badge-gold">{product.harvest_year}</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                fontFamily: 'var(--font-serif)',
                lineHeight: 1.15,
                color: 'var(--ivory)',
                marginBottom: '6px',
              }}
            >
              {product.name}
            </h1>

            {product.scientific_name && (
              <span
                style={{
                  fontStyle: 'italic',
                  color: 'var(--gold-light)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.05rem',
                  display: 'block',
                  marginBottom: '14px',
                }}
              >
                {product.scientific_name}
              </span>
            )}

            {/* Rating Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
              <div style={{ display: 'flex', color: 'var(--gold)', gap: '2px' }}>
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    size={16}
                    fill={idx < Math.floor(product.rating) ? 'var(--gold)' : 'none'}
                    color="var(--gold)"
                  />
                ))}
              </div>
              <span style={{ fontWeight: 600, color: 'var(--ivory)' }}>{product.rating}</span>
              <span style={{ color: 'var(--mute)' }}>({reviews.length} verified reviews)</span>
            </div>

            {/* Dynamic Price Display */}
            <div
              style={{
                padding: '16px 20px',
                background: 'rgba(14, 32, 21, 0.8)',
                border: '1px solid var(--line)',
                borderRadius: '16px',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px',
              }}
            >
              <span
                style={{
                  fontSize: '2.2rem',
                  fontWeight: 700,
                  color: 'var(--gold-light)',
                  fontFamily: 'var(--font-serif)',
                }}
              >
                ₹{currentOption?.price}
              </span>
              <span style={{ color: 'var(--mute)', fontSize: '0.92rem' }}>
                Inclusive of all taxes ({selectedSize} net weight)
              </span>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: '1.02rem',
                lineHeight: 1.75,
                color: 'var(--mute)',
                marginBottom: '28px',
              }}
            >
              {product.description}
            </p>

            {/* Aroma Profile Notes */}
            <div style={{ marginBottom: '28px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                Botanical Flavor Notes:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.aroma_notes.map((note) => (
                  <span
                    key={note}
                    style={{
                      border: '1px solid var(--line)',
                      background: 'rgba(212, 175, 55, 0.08)',
                      color: 'var(--gold-light)',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-cond)',
                    }}
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* Pack Size Selector */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ivory)' }}>
                  Pack Size
                </span>
                <span style={{ fontSize: '0.82rem', color: '#a5d6a7' }}>
                  {currentOption?.stock ? `${currentOption.stock} in stock` : 'Freshly Sealed'}
                </span>
              </div>
              <div className="size-chips">
                {product.sizes_prices.map((option) => (
                  <button
                    key={option.size}
                    type="button"
                    onClick={() => setSelectedSize(option.size)}
                    className={`size-chip ${selectedSize === option.size ? 'active' : ''}`}
                    style={{ padding: '8px 18px', fontSize: '0.92rem' }}
                  >
                    {option.size} – ₹{option.price}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(7, 19, 11, 0.8)',
                  border: '1px solid var(--line)',
                  borderRadius: '30px',
                  padding: '6px 14px',
                  height: '50px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ color: 'var(--ivory)', padding: '4px' }}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span style={{ fontWeight: 600, fontSize: '1rem', minWidth: '24px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ color: 'var(--ivory)', padding: '4px' }}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Add to Basket */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`btn ${isAdded ? 'btn-secondary' : 'btn-primary'}`}
                style={{ flex: 1, minWidth: '160px', height: '50px' }}
              >
                {isAdded ? (
                  <>
                    <Check size={18} /> Added to Basket
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} /> Add to Basket
                  </>
                )}
              </button>

              {/* Buy Now */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="btn btn-outline"
                style={{ height: '50px', padding: '0 22px' }}
              >
                Buy Now
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="btn-icon"
                style={{ width: '50px', height: '50px' }}
                aria-label={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart size={20} fill={isFavorite ? 'var(--gold)' : 'none'} color={isFavorite ? 'var(--gold)' : 'var(--ivory)'} />
              </button>
            </div>

            {/* Trust Assurances */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                padding: '16px',
                background: 'rgba(10, 24, 15, 0.5)',
                border: '1px solid var(--line)',
                borderRadius: '16px',
                fontSize: '0.82rem',
                color: 'var(--mute)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={16} color="var(--gold)" />
                <span>Free shipping on ₹999+</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="var(--gold)" />
                <span>Single-origin lab tested</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={16} color="var(--gold)" />
                <span>Aroma seal guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS & COMMUNITY SECTION */}
        <section
          style={{
            borderTop: '1px solid var(--line)',
            paddingTop: '60px',
            marginBottom: '80px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
            }}
          >
            {/* Reviews List */}
            <div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '16px', color: 'var(--ivory)' }}>
                Patron Reviews & Tasting Notes
              </h3>
              <p style={{ color: 'var(--mute)', fontSize: '0.95rem', marginBottom: '24px' }}>
                Authentic feedback from verified chefs and discerning home cooks.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.length === 0 ? (
                  <p style={{ color: 'var(--mute)' }}>No reviews yet. Be the first to review this harvest!</p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      style={{
                        padding: '18px 20px',
                        background: 'rgba(14, 32, 21, 0.6)',
                        border: '1px solid var(--line)',
                        borderRadius: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', color: 'var(--gold)', gap: '2px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < rev.rating ? 'var(--gold)' : 'none'} />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>
                          {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.95rem', color: 'var(--ivory)', lineHeight: 1.6, marginBottom: '10px' }}>
                        &quot;{rev.comment}&quot;
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--gold-light)' }}>
                          {rev.author_name}
                        </strong>
                        <span className="badge badge-moss" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          Verified Purchase
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Submit a Review Form */}
            <div
              style={{
                padding: '28px',
                background: 'rgba(14, 32, 21, 0.8)',
                border: '1px solid var(--line)',
                borderRadius: '24px',
                height: 'fit-content',
              }}
            >
              <h4 style={{ fontSize: '1.3rem', marginBottom: '8px', color: 'var(--ivory)' }}>
                Share Your Experience
              </h4>
              <p style={{ color: 'var(--mute)', fontSize: '0.88rem', marginBottom: '20px' }}>
                How did this spice elevate your dish or tea?
              </p>

              {reviewSubmitted ? (
                <div
                  style={{
                    padding: '16px',
                    background: 'rgba(95, 124, 58, 0.3)',
                    border: '1px solid var(--moss)',
                    borderRadius: '12px',
                    color: '#c9dba9',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                  }}
                >
                  <Check size={20} style={{ margin: '0 auto 6px' }} />
                  Thank you! Your review has been added to this batch.
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
                      Your Name / Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chef Anita or Home Cook"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
                      Rating
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setReviewRating(num)}
                          style={{
                            background: 'none',
                            color: num <= reviewRating ? 'var(--gold)' : 'var(--mute)',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                        >
                          <Star size={22} fill={num <= reviewRating ? 'var(--gold)' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
                      Your Tasting Notes / Review
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe the aroma intensity, size, heat, or culinary application..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="input-field"
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                    Publish Review
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* RELATED SPICES */}
        {relatedProducts.length > 0 && (
          <section style={{ borderTop: '1px solid var(--line)', paddingTop: '60px' }}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '32px', color: 'var(--ivory)' }}>
              Complementary <em>Reserve Spices</em>
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
              }}
            >
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
