'use client';

import React from 'react';

const SPICE_ITEMS = [
  'Single Origin Green Cardamom (8mm+)',
  'Tellicherry Garbled Extra Bold Pepper',
  'Zanzibar Headed Flower Cloves',
  'Sun-Dried Crimson Mace Blades',
  'Cold-Stone Graded in Idukki',
  'Hermetically Sealed with Aroma Lock',
];

export default function SensoryMarquee() {
  return (
    <div
      style={{
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
        backgroundColor: '#0a1a0f',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        padding: '20px 0',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          animation: 'marquee 40s linear infinite',
          willChange: 'transform',
        }}
      >
        {/* First repetition */}
        <div style={{ display: 'inline-flex', gap: '48px', paddingRight: '48px', alignItems: 'center' }}>
          {SPICE_ITEMS.map((item, idx) => (
            <span
              key={`a-${idx}`}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.45rem',
                fontStyle: 'italic',
                color: 'var(--gold-light)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '48px',
              }}
            >
              {item}
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'var(--moss)',
                  borderRadius: '50% 0',
                  transform: 'rotate(45deg)',
                  display: 'inline-block',
                }}
              />
            </span>
          ))}
        </div>

        {/* Second repetition for smooth seamless loop */}
        <div style={{ display: 'inline-flex', gap: '48px', paddingRight: '48px', alignItems: 'center' }}>
          {SPICE_ITEMS.map((item, idx) => (
            <span
              key={`b-${idx}`}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.45rem',
                fontStyle: 'italic',
                color: 'var(--gold-light)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '48px',
              }}
            >
              {item}
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'var(--moss)',
                  borderRadius: '50% 0',
                  transform: 'rotate(45deg)',
                  display: 'inline-block',
                }}
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
