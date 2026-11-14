import React from 'react';

export default function Home({ navigate }) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 0' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        gap: '48px',
        alignItems: 'center',
        paddingTop: '20px'
      }}>
        {/* Left Column */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid #E2DCD2',
            padding: '6px 14px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#444',
            marginBottom: '28px',
            background: 'rgba(255,255,255,0.6)'
          }}>
            <span>★</span> Trusted by 500+ customers
          </div>

          <div style={{
            fontSize: '12px',
            letterSpacing: '1.5px',
            fontWeight: '800',
            color: 'var(--brand-maroon)',
            textTransform: 'uppercase',
            marginBottom: '14px'
          }}>
            A Little Spice. A Lot of Happiness.
          </div>

          <h1 style={{
            fontSize: '52px',
            lineHeight: 1.15,
            fontWeight: '800',
            color: '#1C1917',
            marginBottom: '24px',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            Authentic Indian<br />
            <span style={{ color: 'var(--brand-maroon)' }}>Sweets &</span><br />
            Namkeen
          </h1>

          <p style={{
            fontSize: '16px',
            lineHeight: 1.65,
            color: '#5C5850',
            maxWidth: '480px',
            marginBottom: '36px'
          }}>
            Experience the rich taste of tradition. Handcrafted with love using age-old recipes and the finest ingredients, delivered fresh to your doorstep.
          </p>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '48px' }}>
            <button className="btn-primary" onClick={() => navigate('/products')}>
              Explore Menu →
            </button>
            <button className="btn-outline" onClick={() => navigate('/about')}>
              Our Story
            </button>
          </div>

          <div style={{
            display: 'flex',
            gap: '48px',
            borderTop: '1px solid #ECE7DE',
            paddingTop: '28px'
          }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--brand-maroon)' }}>2+</div>
              <div style={{ fontSize: '13px', color: '#777', marginTop: '2px' }}>Years of Trust</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--brand-maroon)' }}>10+</div>
              <div style={{ fontSize: '13px', color: '#777', marginTop: '2px' }}>Varieties</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--brand-maroon)' }}>4.9★</div>
              <div style={{ fontSize: '13px', color: '#777', marginTop: '2px' }}>Customer Rating</div>
            </div>
          </div>
        </div>

        {/* Right Column / Hero Banner */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(0,0,0,0.08)'
          }}>
            <img
              src="/hero_snack.jpg"
              alt="Indian Sweets and Namkeen Assortment"
              style={{
                width: '100%',
                height: '460px',
                objectFit: 'cover',
                display: 'block'
              }}
            />
            {/* Dark overlay at bottom matching video */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
              padding: '30px 24px 20px',
              color: 'white'
            }}>
              <div style={{
                fontSize: '11px',
                letterSpacing: '1px',
                fontWeight: '700',
                color: '#F5A623',
                textTransform: 'uppercase',
                marginBottom: '6px'
              }}>
                Made for your cravings
              </div>
              <div style={{
                fontSize: '22px',
                fontWeight: '800',
                letterSpacing: '-0.3px'
              }}>
                Tradition in every bite.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

