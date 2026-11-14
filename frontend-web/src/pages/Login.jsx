import React, { useState } from 'react';

export default function Login({ onLoginSuccess, navigate }) {
  const [email, setEmail] = useState('kahanshah5676@gmail.com');
  const [password, setPassword] = useState('kahan0934');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'Login failed');
        setLoading(false);
        return;
      }

      onLoginSuccess(data.user);
      navigate('/products');
    } catch (err) {
      setError('Connection error: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto 60px', padding: '0 20px' }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px 36px',
        boxShadow: '0 4px 25px rgba(0,0,0,0.05)',
        border: '1px solid #ECE7DE',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: '800',
          letterSpacing: '1px',
          color: 'var(--brand-maroon)',
          textTransform: 'uppercase',
          marginBottom: '8px'
        }}>
          Welcome to SwadBox
        </div>

        <h1 style={{
          fontSize: '30px',
          fontWeight: '800',
          color: '#1C1917',
          marginBottom: '8px'
        }}>
          Welcome Back
        </h1>

        <p style={{ fontSize: '13px', color: '#666', marginBottom: '28px' }}>
          Sign in to discover your favourite Indian snacks.
        </p>

        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            color: '#B91C1C',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #D8D2C6',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #D8D2C6',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--brand-maroon)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '24px',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: '#888',
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '20px'
        }}>
          <span style={{ height: '1px', flex: 1, backgroundColor: '#EFEAE1' }}></span>
          <span>New to SwadBox?</span>
          <span style={{ height: '1px', flex: 1, backgroundColor: '#EFEAE1' }}></span>
        </div>

        <p style={{ fontSize: '13px', color: '#555', marginBottom: '28px' }}>
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/register')}
            style={{ color: 'var(--brand-maroon)', fontWeight: '700', cursor: 'pointer' }}
          >
            Create an account
          </span>
        </p>

        <div style={{ fontSize: '12px', color: '#888' }}>
          Fresh cravings. Authentic flavours. SwadBox.
        </div>
      </div>
    </div>
  );
}

