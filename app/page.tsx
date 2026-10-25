import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Award, ShieldCheck, Star, PackageCheck } from 'lucide-react';
import { getProducts } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import SensoryMarquee from '@/components/SensoryMarquee';
import SensoryShowcase from '@/components/SensoryShowcase';

export default async function HomePage() {
  const products = await getProducts();
  const featuredProducts = products.filter((p) => p.is_featured);

  return (
    <>
      {/* HERO SECTION */}
      <section
        style={{
          position: 'relative',
          minHeight: '90vh',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'center',
          gap: '4vw',
          padding: '80px 5vw 60px',
          background: 'radial-gradient(ellipse at 75% 40%, #153820 0%, var(--bg) 65%)',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '580px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '30px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: 'var(--gold-light)',
              fontSize: '0.85rem',
              fontWeight: 500,
              marginBottom: '24px',
            }}
          >
            <Sparkles size={14} /> 2026 Single Origin Reserve
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.8vw, 5.2rem)',
              lineHeight: 1.08,
              letterSpacing: '-0.025em',
              marginBottom: '24px',
            }}
          >
            Whole spices, picked at their <em>golden hour.</em>
          </h1>

          <p
            style={{
              color: 'var(--mute)',
              fontSize: '1.15rem',
              lineHeight: 1.7,
              marginBottom: '36px',
            }}
          >
            Single-origin green cardamom, black pepper, clove and nutmeg flower.
            Graded by hand, sealed fresh, and packed in nitrogen-purged pouches from 50 g to 1 kg.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/shop" className="btn btn-primary btn-lg">
              Explore Collection <ArrowRight size={18} />
            </Link>
            <Link href="#sensory" className="btn btn-outline btn-lg">
              See How They Differ
            </Link>
          </div>

          {/* Trust badges */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              marginTop: '44px',
              paddingTop: '28px',
              borderTop: '1px solid var(--line)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--ivory)' }}>
              <Award size={18} color="var(--gold)" />
              <span>Lab-Tested Volatile Oils</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--ivory)' }}>
              <ShieldCheck size={18} color="var(--gold)" />
              <span>100% Single Origin Kerala</span>
            </div>
          </div>
        </div>

        {/* Visual Celestial Orb */}
        <div
          style={{
            position: 'relative',
            aspectRatio: '1',
            width: 'min(100%, 520px)',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Rotating celestial ring */}
          <div
            style={{
              position: 'absolute',
              inset: '-5%',
              borderRadius: '50%',
              border: '1px dashed var(--gold)',
              opacity: 0.5,
              animation: 'spin 70s linear infinite',
            }}
          />

          {/* Central image disc */}
          <div
            style={{
              position: 'relative',
              width: '86%',
              height: '86%',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '6px solid var(--moss-dark)',
              boxShadow: '0 40px 90px rgba(0, 0, 0, 0.7), 0 0 0 1px var(--line)',
            }}
          >
            <Image
              src="/images/spices/pepper.jpg"
              alt="Keyaar Tellicherry Black Pepper"
              fill
              priority
              sizes="520px"
              style={{ objectFit: 'cover', transform: 'scale(1.1)' }}
            />
          </div>

          {/* Floating Luxury Tag 1 */}
          <div
            style={{
              position: 'absolute',
              left: '-2%',
              bottom: '15%',
              background: 'var(--ivory)',
              color: '#122010',
              borderRadius: '16px',
              padding: '10px 18px',
              fontSize: '0.85rem',
              fontWeight: 600,
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <PackageCheck size={16} color="#375a24" /> Sizes 50 g to 1 kg
          </div>

          {/* Floating Luxury Tag 2 */}
          <div
            style={{
              position: 'absolute',
              right: '0%',
              top: '12%',
              background: 'var(--ivory)',
              color: '#122010',
              borderRadius: '16px',
              padding: '10px 18px',
              fontSize: '0.85rem',
              fontWeight: 600,
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={16} color="#9e7f22" /> Hand-Graded & Sealed Fresh
          </div>
        </div>
      </section>

      {/* SENSORY MARQUEE RIBBON */}
      <SensoryMarquee />

      {/* PINNED SENSORY SHOWCASE */}
      <SensoryShowcase />

      {/* FEATURED COLLECTION */}
      <section id="collection" style={{ padding: '110px 5vw' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '24px',
              marginBottom: '50px',
            }}
          >
            <div>
              <span className="badge badge-gold" style={{ marginBottom: '12px' }}>
                Single-Origin Catalog
              </span>
              <h2 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)' }}>
                The Reserve <em>Collection</em>
              </h2>
            </div>
            <p style={{ color: 'var(--mute)', maxWidth: '44ch', fontSize: '1.02rem', margin: 0 }}>
              Pick a calibrated pack size on each spice, add to your basket, or browse detailed terroir specifications.
            </p>
          </div>

          {/* Product Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '28px',
            }}
          >
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <Link href="/shop" className="btn btn-outline btn-lg">
              Explore All Spices & Rare Blends <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ARTISAN QUALITY CRAFT (4 Steps) */}
      <section
        id="process"
        style={{
          background: 'linear-gradient(180deg, #375323 0%, #203514 100%)',
          color: '#f6f1dd',
          padding: '110px 5vw',
          position: 'relative',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '6vw',
              alignItems: 'center',
            }}
          >
            <div>
              <span
                style={{
                  textTransform: 'uppercase',
                  fontSize: '0.85rem',
                  letterSpacing: '0.08em',
                  color: 'var(--gold-light)',
                  fontFamily: 'var(--font-cond)',
                  display: 'block',
                  marginBottom: '10px',
                }}
              >
                The Grading Standard
              </span>
              <h2 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', lineHeight: 1.15, marginBottom: '24px' }}>
                From the vine to <em>your kitchen.</em>
              </h2>
              <p style={{ fontSize: '1.08rem', opacity: 0.9, lineHeight: 1.7, marginBottom: '36px' }}>
                Commercial spice brokers blend disparate harvests from multiple regions, resulting in stale oils and lost aromatic notes. At Keyaar, every pod is tracked from bush to seal.
              </p>

              {/* Spice Thumbnails */}
              <div style={{ display: 'flex', gap: '18px' }}>
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '4px solid #4a6d32',
                    position: 'relative',
                  }}
                >
                  <Image src="/images/spices/cardamom.jpg" alt="Cardamom" fill sizes="100px" style={{ objectFit: 'cover' }} />
                </div>
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '4px solid #4a6d32',
                    position: 'relative',
                  }}
                >
                  <Image src="/images/spices/clove.jpg" alt="Clove" fill sizes="100px" style={{ objectFit: 'cover' }} />
                </div>
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '4px solid #4a6d32',
                    position: 'relative',
                  }}
                >
                  <Image src="/images/spices/mace.jpg" alt="Mace" fill sizes="100px" style={{ objectFit: 'cover' }} />
                </div>
              </div>
            </div>

            {/* Steps Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '24px 0', borderTop: '1px solid rgba(255, 255, 255, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--gold-light)', fontWeight: 600, fontFamily: 'var(--font-cond)' }}>01</span>
                  <h3 style={{ fontSize: '1.45rem', margin: 0 }}>Picked Ripe</h3>
                </div>
                <p style={{ opacity: 0.85, fontSize: '0.98rem' }}>
                  Pods, berries and buds are harvested exclusively when their essential oils and terpenes are at absolute seasonal saturation.
                </p>
              </div>

              <div style={{ padding: '24px 0', borderTop: '1px solid rgba(255, 255, 255, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--gold-light)', fontWeight: 600, fontFamily: 'var(--font-cond)' }}>02</span>
                  <h3 style={{ fontSize: '1.45rem', margin: 0 }}>Dried Slowly</h3>
                </div>
                <p style={{ opacity: 0.85, fontSize: '0.98rem' }}>
                  Gentle, low-temperature ambient curing locks in vibrant natural chlorophyll and volatile essential oils without scorching delicate notes.
                </p>
              </div>

              <div style={{ padding: '24px 0', borderTop: '1px solid rgba(255, 255, 255, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--gold-light)', fontWeight: 600, fontFamily: 'var(--font-cond)' }}>03</span>
                  <h3 style={{ fontSize: '1.45rem', margin: 0 }}>Graded by Hand</h3>
                </div>
                <p style={{ opacity: 0.85, fontSize: '0.98rem' }}>
                  Every batch passes through cold-stone sorting frames to guarantee uniform pod size (8mm+ caliper), heavy density, and zero hollow buds.
                </p>
              </div>

              <div style={{ padding: '24px 0', borderTop: '1px solid rgba(255, 255, 255, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--gold-light)', fontWeight: 600, fontFamily: 'var(--font-cond)' }}>04</span>
                  <h3 style={{ fontSize: '1.45rem', margin: 0 }}>Sealed Fresh</h3>
                </div>
                <p style={{ opacity: 0.85, fontSize: '0.98rem' }}>
                  Hermetically packed in multi-ply, light-shielded, nitrogen-purged resealable pouches (50g to 1kg) to halt oxidation completely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VERIFIED REVIEWS SECTION */}
      <section id="reviews" style={{ padding: '110px 5vw', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 60px' }}>
            <span className="badge badge-gold" style={{ marginBottom: '12px' }}>
              Verified Patron Testimonials
            </span>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)' }}>
              Loved by chefs & <em>spice connoisseurs</em>
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            <div className="card-luxury" style={{ padding: '30px' }}>
              <div style={{ display: 'flex', color: 'var(--gold)', gap: '4px', marginBottom: '14px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--gold)" />
                ))}
              </div>
              <p style={{ fontStyle: 'italic', color: 'var(--ivory)', fontSize: '1.02rem', lineHeight: 1.7, marginBottom: '20px' }}>
                &quot;The 8mm+ cardamom pods are gigantic and intensely fragrant. Just one pod crushed into our dessert reduction perfumed the entire banquet hall.&quot;
              </p>
              <div>
                <strong style={{ color: 'var(--gold-light)', display: 'block' }}>Chef Raghavendra Rao</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--mute)' }}>Executive Chef, Bengaluru</span>
              </div>
            </div>

            <div className="card-luxury" style={{ padding: '30px' }}>
              <div style={{ display: 'flex', color: 'var(--gold)', gap: '4px', marginBottom: '14px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--gold)" />
                ))}
              </div>
              <p style={{ fontStyle: 'italic', color: 'var(--ivory)', fontSize: '1.02rem', lineHeight: 1.7, marginBottom: '20px' }}>
                &quot;The Tellicherry Extra Bold pepper has layers of cedar, fruit, and citrus that you never get with supermarket black pepper. Freshly ground on prime cuts, it is unmatched.&quot;
              </p>
              <div>
                <strong style={{ color: 'var(--gold-light)', display: 'block' }}>Vikram Mehta</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--mute)' }}>Culinary Reviewer & Home Cook</span>
              </div>
            </div>

            <div className="card-luxury" style={{ padding: '30px' }}>
              <div style={{ display: 'flex', color: 'var(--gold)', gap: '4px', marginBottom: '14px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--gold)" />
                ))}
              </div>
              <p style={{ fontStyle: 'italic', color: 'var(--ivory)', fontSize: '1.02rem', lineHeight: 1.7, marginBottom: '20px' }}>
                &quot;Finding unbroken crimson mace blades of this quality used to require travelling directly to plantation auctions in Kerala. Keyaar delivered it to Mumbai in two days.&quot;
              </p>
              <div>
                <strong style={{ color: 'var(--gold-light)', display: 'block' }}>Dr. Meera Nambiar</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--mute)' }}>Heritage Cooking Archivist</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
