'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface SpiceSlide {
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  notes: string[];
  image: string;
  origin: string;
  elevation: string;
}

const SLIDES: SpiceSlide[] = [
  {
    name: 'Green Cardamom',
    slug: 'green-cardamom',
    subtitle: 'Queen of the High Ranges',
    description:
      'Plump, jade-green pods with tiny black seeds glistening with essential oil. Crack one open between your fingers and the room immediately blossoms with crisp eucalyptus and candied citrus.',
    notes: ['Citrus Zest', 'Eucalyptus', 'Sweet Flora', 'Camphorous'],
    image: '/images/spices/cardamom.jpg',
    origin: 'Idukki Mist Hills',
    elevation: '1,200m MSL',
  },
  {
    name: 'Tellicherry Black Pepper',
    slug: 'tellicherry-black-pepper',
    subtitle: 'King of Malabar Spices',
    description:
      'Dense, wrinkled berries with a fierce, clean heat that softens into cedarwood, fresh pine, and citrus earth. Harvested mature on the vine to maximize volatile piperine percentage.',
    notes: ['Pungent Heat', 'Woody Cedar', 'Pine Resin', 'Bright Citrus'],
    image: '/images/spices/pepper.jpg',
    origin: 'Wayanad Rainforest Belt',
    elevation: '850m MSL',
  },
  {
    name: 'Zanzibar Whole Cloves',
    slug: 'zanzibar-whole-cloves',
    subtitle: 'Royal Aromatic Flower Buds',
    description:
      'Whole dried buds picked right as they turn crimson before bloom. Intact crowns packed with potent eugenol oils that produce a deep, numbing warmth in curries, tea, and broths.',
    notes: ['Warm Eugenol', 'Sweet Molasses', 'Smoky Leather', 'Intense Spice'],
    image: '/images/spices/clove.jpg',
    origin: 'Kottayam & Spice Isles',
    elevation: 'Coastal Slopes',
  },
  {
    name: 'Nutmeg Flower (Mace)',
    slug: 'nutmeg-flower-mace',
    subtitle: 'The Crimson Golden Lace',
    description:
      'The delicate filigree lace wrapping the fresh nutmeg seed. Far softer, more floral, and aristocratic than nutmeg, offering an ethereal amber warmth for gravies, desserts, and biryanis.',
    notes: ['Floral Warmth', 'Honey Amber', 'Delicate Sweetness', 'Musk'],
    image: '/images/spices/mace.jpg',
    origin: 'Chalakudy River Basin',
    elevation: '350m MSL',
  },
];

const ROTATION_INTERVAL_MS = 3000; // 3 seconds per product

export default function SensoryShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);

  // 3-second auto cycle timer that continuously rotates every 3 seconds (even on hover or touch)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % SLIDES.length);
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [activeIdx]);

  const goToSlide = (idx: number) => {
    setActiveIdx(idx);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % SLIDES.length);
  };

  const activeSlide = SLIDES[activeIdx];

  return (
    <section
      id="sensory"
      style={{
        position: 'relative',
        background: 'radial-gradient(ellipse at 80% 50%, #102a18 0%, var(--bg) 75%)',
        borderBottom: '1px solid var(--line)',
        padding: '90px 5vw 80px',
        overflow: 'hidden',
      }}
    >
      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 36px' }}>
          <span className="badge badge-gold" style={{ marginBottom: '14px' }}>
            <Sparkles size={13} /> The Sensory Dimension
          </span>
          <h2 style={{ fontSize: 'clamp(2.1rem, 4.4vw, 3.2rem)', lineHeight: 1.15, marginBottom: '14px' }}>
            A distinct botanical voice in <em>every single pod.</em>
          </h2>
          <p style={{ color: 'var(--mute)', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
            Volatile essential oil profiles auto-cycling every 3 seconds. Select any spice to jump directly to its terroir specifications.
          </p>
        </div>

        {/* Interactive Spice Selector Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '48px',
          }}
        >
          {SLIDES.map((slide, idx) => {
            const isActive = activeIdx === idx;
            return (
              <button
                key={slide.slug}
                onClick={() => goToSlide(idx)}
                type="button"
                style={{
                  padding: '9px 22px',
                  borderRadius: '30px',
                  border: isActive ? '1px solid var(--gold)' : '1px solid var(--line)',
                  background: isActive ? 'var(--gold)' : 'rgba(14, 32, 21, 0.7)',
                  color: isActive ? '#100c02' : 'var(--ivory)',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: isActive ? '0 0 18px var(--gold-glow)' : 'none',
                }}
              >
                {slide.name}
              </button>
            );
          })}
        </div>

        {/* Main Stage: Responsive Layout (On mobile: visual image appears first, then content) */}
        <div className="sensory-layout">
          {/* Left / Below: Text Content Column */}
          <div className="sensory-content-col" style={{ position: 'relative' }}>
            {/* Origin & Elevation Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-cond)',
                color: 'var(--gold-light)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontSize: '0.86rem',
                marginBottom: '10px',
                background: 'rgba(212, 175, 55, 0.08)',
                padding: '4px 12px',
                borderRadius: '16px',
                border: '1px solid rgba(212, 175, 55, 0.2)',
              }}
            >
              <MapPin size={14} color="var(--gold)" />
              <span>{activeSlide.origin}</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span>{activeSlide.elevation}</span>
            </div>

            {/* Spice Name */}
            <h3
              style={{
                fontSize: 'clamp(2rem, 3.8vw, 2.8rem)',
                marginBottom: '8px',
                fontFamily: 'var(--font-serif)',
                color: 'var(--ivory)',
                lineHeight: 1.15,
              }}
            >
              {activeSlide.name}
            </h3>

            {/* Subtitle */}
            <p
              style={{
                color: 'var(--gold)',
                fontStyle: 'italic',
                marginBottom: '18px',
                fontSize: '1.05rem',
              }}
            >
              &quot;{activeSlide.subtitle}&quot;
            </p>

            {/* Description */}
            <p
              style={{
                color: 'var(--mute)',
                fontSize: '1.02rem',
                lineHeight: 1.7,
                maxWidth: '48ch',
                marginBottom: '26px',
              }}
            >
              {activeSlide.description}
            </p>

            {/* Aroma Tasting Notes */}
            <div
              className="sensory-notes-wrap"
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '32px',
              }}
            >
              {activeSlide.notes.map((note) => (
                <span
                  key={note}
                  style={{
                    fontFamily: 'var(--font-cond)',
                    border: '1px solid var(--line-strong)',
                    borderRadius: '20px',
                    padding: '5px 14px',
                    fontSize: '0.82rem',
                    color: 'var(--gold-light)',
                    background: 'rgba(212, 175, 55, 0.08)',
                  }}
                >
                  {note}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div
              className="sensory-ctas-wrap"
              style={{
                display: 'flex',
                gap: '14px',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <Link href={`/products/${activeSlide.slug}`} className="btn btn-primary">
                View Details & Sizes <ArrowRight size={16} />
              </Link>
              <Link href="/shop" className="btn btn-outline">
                Browse Collection
              </Link>
            </div>

            {/* Slide Navigation Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                paddingTop: '14px',
                borderTop: '1px solid rgba(212, 175, 55, 0.1)',
                justifyContent: 'flex-start',
              }}
              className="sensory-ctas-wrap"
            >
              <button
                onClick={handlePrev}
                className="btn-icon"
                title="Previous Spice"
                style={{ width: '38px', height: '38px' }}
              >
                <ChevronLeft size={18} />
              </button>
              <span
                style={{
                  fontFamily: 'var(--font-cond)',
                  fontSize: '0.9rem',
                  letterSpacing: '0.1em',
                  color: 'var(--gold-light)',
                }}
              >
                0{activeIdx + 1} / 0{SLIDES.length}
              </span>
              <button
                onClick={handleNext}
                className="btn-icon"
                title="Next Spice"
                style={{ width: '38px', height: '38px' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Right / Top: Orbital Visual Disc Column */}
          <div
            className="sensory-visual-col"
            style={{
              position: 'relative',
              width: 'min(100%, 420px)',
              aspectRatio: '1',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Rotating Celestial Dashed Ring */}
            <div
              style={{
                position: 'absolute',
                inset: '-6%',
                borderRadius: '50%',
                border: '1px dashed var(--gold)',
                opacity: 0.5,
                animation: 'spin 18s linear infinite',
              }}
            >
              {/* Glowing Beacon Pearl attached to the rotating ring */}
              <div
                style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '50%',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--gold-light)',
                  boxShadow: '0 0 20px 5px var(--gold)',
                  transform: 'translateX(-50%)',
                }}
              />
            </div>

            {/* Central Circular Masked Image with Smooth Cross-Fade */}
            <div
              style={{
                position: 'relative',
                width: '88%',
                height: '88%',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '5px solid var(--moss-dark)',
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7), 0 0 0 1px var(--line)',
                background: '#09150e',
              }}
            >
              {SLIDES.map((slide, idx) => {
                const isActive = activeIdx === idx;
                return (
                  <div
                    key={slide.slug}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'scale(1.05)' : 'scale(1.18)',
                      transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      pointerEvents: isActive ? 'auto' : 'none',
                    }}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.name}
                      fill
                      sizes="(max-width: 768px) 260px, 420px"
                      priority={idx === 0}
                      style={{
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Terroir Authenticity Seal */}
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                background: 'rgba(14, 32, 21, 0.92)',
                border: '1px solid var(--line-strong)',
                borderRadius: '24px',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                color: 'var(--gold-light)',
                fontFamily: 'var(--font-cond)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5)',
              }}
            >
              <Sparkles size={12} color="var(--gold)" />
              <span>100% Single Origin</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
