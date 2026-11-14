import React from 'react';

export default function About({ navigate }) {
  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px' }}>
      {/* Top Section: Story & Quote */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '48px',
        alignItems: 'center',
        marginBottom: '80px'
      }}>
        <div>
          <div style={{ width: '48px', height: '4px', backgroundColor: '#F5A623', marginBottom: '24px' }}></div>
          <p style={{
            fontSize: '16px',
            lineHeight: 1.7,
            color: '#444',
            marginBottom: '20px'
          }}>
            SwadBox was founded with one simple goal — to bring Indian sweets and snacks to everyone with the care, taste, and freshness associated with a traditional sweet shop.
          </p>
          <p style={{
            fontSize: '16px',
            lineHeight: 1.7,
            color: '#444',
            marginBottom: '32px'
          }}>
            From festive mithai to everyday namkeen, we want every order to add a little flavour to your day. Whether you are sharing with family or enjoying a snack on your own, there is always a reason to savour the moment.
          </p>
          <span
            onClick={() => navigate('/products')}
            style={{
              color: 'var(--brand-maroon)',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer',
              borderBottom: '2px solid var(--brand-maroon)',
              paddingBottom: '2px'
            }}
          >
            Explore our products →
          </span>
        </div>

        {/* Yellow Quote Card */}
        <div style={{
          backgroundColor: '#EAB308',
          borderRadius: '4px',
          padding: '48px 40px',
          color: '#1C1917',
          position: 'relative'
        }}>
          <div style={{ fontSize: '48px', fontFamily: 'serif', lineHeight: 1, color: '#C2410C', marginBottom: '16px' }}>
            &ldquo;
          </div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '800',
            lineHeight: 1.25,
            marginBottom: '40px',
            color: '#1C1917'
          }}>
            Little treats. Big moments. Lasting memories.
          </h2>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(0,0,0,0.15)',
            paddingTop: '20px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333'
          }}>
            <span>SwadBox</span>
            <span style={{ color: '#555' }}>A little taste of happiness</span>
          </div>
        </div>
      </div>

      {/* Why SwadBox Section */}
      <div style={{ marginBottom: '80px' }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '800',
          letterSpacing: '1px',
          color: 'var(--brand-maroon)',
          textTransform: 'uppercase',
          marginBottom: '10px'
        }}>
          Why SwadBox
        </div>
        <h2 style={{
          fontSize: '36px',
          fontWeight: '800',
          color: '#164E2A',
          marginBottom: '16px'
        }}>
          Good choices make a difference.
        </h2>
        <p style={{ fontSize: '15px', color: '#555', maxWidth: '600px', marginBottom: '40px' }}>
          We want finding and enjoying your favourite snacks to feel simple, convenient, and enjoyable.
        </p>

        {/* 4 Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px'
        }}>
          {[
            {
              num: '01',
              title: 'Quality ingredients',
              desc: 'Carefully selected products for flavour, quality, and enjoyment.'
            },
            {
              num: '02',
              title: 'Careful packaging',
              desc: 'Thoughtful packaging to help keep your favourites protected.'
            },
            {
              num: '03',
              title: 'Easy ordering',
              desc: 'A straightforward way to discover and order your favourite snacks.'
            },
            {
              num: '04',
              title: 'Made for sharing',
              desc: 'Delicious moments to enjoy with family and friends.'
            }
          ].map((item) => (
            <div key={item.num} style={{ borderTop: '2px solid #EAB308', paddingTop: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--brand-maroon)', marginBottom: '14px' }}>
                {item.num}
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1C1917', marginBottom: '10px' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#666' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div style={{ textAlign: 'center', padding: '40px 0 20px' }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '800',
          letterSpacing: '1px',
          color: 'var(--brand-maroon)',
          textTransform: 'uppercase',
          marginBottom: '10px'
        }}>
          Something Delicious Awaits
        </div>
        <h2 style={{
          fontSize: '40px',
          fontWeight: '800',
          color: '#164E2A',
          marginBottom: '14px'
        }}>
          Find a flavour worth sharing.
        </h2>
        <p style={{ fontSize: '15px', color: '#666', marginBottom: '28px' }}>
          Explore our collection and discover your next favourite sweets and snacks.
        </p>
        <button className="btn-primary" onClick={() => navigate('/products')}>
          Browse Products →
        </button>
      </div>
    </div>
  );
}

