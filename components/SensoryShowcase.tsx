'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

interface SpiceSlide {
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  notes: string[];
  image: string;
  origin: string;
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
    origin: 'Idukki Mist Hills (1,200m MSL)',
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
  },
];

export default function SensoryShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const progBarRef = useRef<HTMLDivElement>(null);
  const activeIdxRef = useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!containerRef.current) {
            ticking = false;
            return;
          }

          const rect = containerRef.current.getBoundingClientRect();
          const totalScrollable = rect.height - window.innerHeight;

          if (totalScrollable > 0) {
            // Normalized progress from 0 to 1
            const progress = Math.max(0, Math.min(1, -rect.top / totalScrollable));

            // Ultra-smooth 60fps/120fps direct transform updates
            if (ringRef.current) {
              ringRef.current.style.transform = `rotate(${progress * 360}deg)`;
            }
            if (progBarRef.current) {
              progBarRef.current.style.width = `${progress * 100}%`;
            }

            // Map progress to active index (0, 1, 2, 3)
            const newIndex = Math.min(SLIDES.length - 1, Math.max(0, Math.floor(progress * SLIDES.length)));
            if (newIndex !== activeIdxRef.current) {
              activeIdxRef.current = newIndex;
              setActiveIdx(newIndex);
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth click scroll to specific slide in the pinned container
  const scrollToSlide = (idx: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentScrollY = window.scrollY;
    const containerTop = currentScrollY + rect.top;
    const totalScrollable = containerRef.current.clientHeight - window.innerHeight;

    // Scroll to the midpoint of the slide's active sector
    const targetScroll = containerTop + ((idx + 0.5) / SLIDES.length) * totalScrollable;
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  };

  return (
    <section
      ref={containerRef}
      id="sensory"
      style={{
        height: '380vh',
        position: 'relative',
        background: 'var(--bg)',
      }}
    >
      {/* Sticky Stage */}
      <div
        className="sensory-stage"
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          minHeight: '680px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 5vw 40px',
          background: 'radial-gradient(ellipse at 80% 50%, #102a18 0%, var(--bg) 70%)',
          overflow: 'hidden',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div className="container" style={{ width: '100%' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 32px' }}>
            <span className="badge badge-gold" style={{ marginBottom: '12px' }}>
              <Sparkles size={12} /> The Sensory Dimension
            </span>
            <h2 style={{ fontSize: 'clamp(2.1rem, 4.4vw, 3.2rem)', lineHeight: 1.15, marginBottom: '12px' }}>
              A distinct botanical voice in <em>every single pod.</em>
            </h2>
            <p style={{ color: 'var(--mute)', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
              Scroll down to journey through our single-origin terroirs and observe their volatile essential oil profiles.
            </p>
          </div>

          {/* Interactive Nav Tabs */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '40px',
            }}
          >
            {SLIDES.map((slide, idx) => {
              const isActive = activeIdx === idx;
              return (
                <button
                  key={slide.slug}
                  onClick={() => scrollToSlide(idx)}
                  type="button"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '30px',
                    border: isActive ? '1px solid var(--gold)' : '1px solid var(--line)',
                    background: isActive ? 'var(--gold)' : 'rgba(14, 32, 21, 0.65)',
                    color: isActive ? '#100c02' : 'var(--ivory)',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? '0 0 16px var(--gold-glow)' : 'none',
                  }}
                >
                  {slide.name}
                </button>
              );
            })}
          </div>

          {/* Main Grid Stage */}
          <div
            className="sensory-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '50px',
              alignItems: 'center',
            }}
          >
            {/* Left Content Column (Stacked Animated Slides) */}
            <div style={{ position: 'relative', minHeight: '340px' }}>
              {SLIDES.map((slide, idx) => {
                const isActive = activeIdx === idx;
                return (
                  <div
                    key={slide.slug}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'translateY(0)' : 'translateY(28px)',
                      transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      pointerEvents: isActive ? 'auto' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-cond)',
                        color: 'var(--gold-light)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        fontSize: '0.85rem',
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      {slide.origin}
                    </span>
                    <h3
                      style={{
                        fontSize: 'clamp(2rem, 3.8vw, 2.7rem)',
                        marginBottom: '8px',
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--ivory)',
                        lineHeight: 1.15,
                      }}
                    >
                      {slide.name}
                    </h3>
                    <p style={{ color: 'var(--gold)', fontStyle: 'italic', marginBottom: '16px', fontSize: '1.02rem' }}>
                      &quot;{slide.subtitle}&quot;
                    </p>
                    <p
                      style={{
                        color: 'var(--mute)',
                        fontSize: '1.02rem',
                        lineHeight: 1.7,
                        maxWidth: '46ch',
                        marginBottom: '24px',
                      }}
                    >
                      {slide.description}
                    </p>

                    {/* Aroma Tasting Notes */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
                      {slide.notes.map((note) => (
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

                    {/* CTA Links */}
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                      <Link href={`/products/${slide.slug}`} className="btn btn-primary">
                        View Details & Sizes <ArrowRight size={16} />
                      </Link>
                      <Link href="/shop" className="btn btn-outline">
                        Browse Collection
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Orbital Visual Disc */}
            <div
              style={{
                position: 'relative',
                width: 'min(100%, 460px)',
                aspectRatio: '1',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Rotating Celestial Dashed Ring driven by scroll */}
              <div
                ref={ringRef}
                style={{
                  position: 'absolute',
                  inset: '-6%',
                  borderRadius: '50%',
                  border: '1px dashed var(--gold)',
                  opacity: 0.5,
                  willChange: 'transform',
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
                    boxShadow: '0 0 24px 6px var(--gold)',
                    transform: 'translateX(-50%)',
                  }}
                />
              </div>

              {/* Central Circular Masked Images */}
              <div
                style={{
                  position: 'relative',
                  width: '88%',
                  height: '88%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '6px solid var(--moss-dark)',
                  boxShadow: '0 40px 90px rgba(0, 0, 0, 0.7), 0 0 0 1px var(--line)',
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
                        transform: isActive ? 'scale(1.05)' : 'scale(1.22)',
                        transition: 'opacity 0.8s ease, transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      }}
                    >
                      <Image
                        src={slide.image}
                        alt={slide.name}
                        fill
                        sizes="460px"
                        priority={idx === 0}
                        style={{
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Pinned Progress Bar */}
        <div
          style={{
            position: 'absolute',
            left: '5vw',
            right: '5vw',
            bottom: '24px',
            height: '3px',
            background: 'rgba(236, 212, 138, 0.15)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            ref={progBarRef}
            style={{
              height: '100%',
              width: '0%',
              background: 'linear-gradient(90deg, var(--gold), var(--gold-light))',
              boxShadow: '0 0 10px var(--gold)',
              willChange: 'width',
            }}
          />
        </div>
      </div>
    </section>
  );
}
