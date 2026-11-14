import React from 'react';

export default function Cart({ cart, updateQuantity, removeFromCart, navigate }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px', color: '#1C1917' }}>Your Cart</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>Your cart is currently empty.</p>
        <button className="btn-primary" onClick={() => navigate('/products')}>
          Explore Products →
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 24px' }}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: '800',
        color: '#1C1917',
        marginBottom: '32px'
      }}>
        Your Cart
      </h1>

      {/* Cart Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {cart.map((item) => (
          <div
            key={item.product_id}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              border: '1px solid #ECE7DE'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <img
                src={item.image_url}
                alt={item.name}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '10px',
                  objectFit: 'cover'
                }}
              />
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1C1917', marginBottom: '10px' }}>
                  {item.name}
                </h3>
                {/* Quantity Controls */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: '1px solid #E5E0D6',
                  borderRadius: '9999px',
                  padding: '4px 12px'
                }}>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    style={{
                      background: 'none',
                      fontSize: '16px',
                      color: '#666',
                      fontWeight: '700',
                      lineHeight: 1
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: '700', minWidth: '16px', textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    style={{
                      background: 'none',
                      fontSize: '16px',
                      color: '#666',
                      fontWeight: '700',
                      lineHeight: 1
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '19px',
                fontWeight: '800',
                color: 'var(--brand-maroon)',
                marginBottom: '6px'
              }}>
                ₹{Math.round(item.price * item.quantity)}
              </div>
              <button
                onClick={() => removeFromCart(item.product_id)}
                style={{
                  background: 'none',
                  color: '#EF4444',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Total & Checkout Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px 28px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        border: '1px solid #ECE7DE'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#1C1917' }}>Total</span>
          <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--brand-maroon)' }}>
            ₹{Math.round(total)}
          </span>
        </div>

        <button
          className="btn-gradient"
          onClick={() => navigate('/checkout')}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}

