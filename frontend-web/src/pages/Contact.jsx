import React, { useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      if (res.ok) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (err) {
      alert('Error sending message: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Top Hero Banner */}
      <div style={{
        backgroundColor: 'var(--brand-maroon)',
        color: 'white',
        padding: '60px 24px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '800',
          letterSpacing: '1.5px',
          color: '#F5A623',
          textTransform: 'uppercase',
          marginBottom: '10px'
        }}>
          We're Here to Help
        </div>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '800',
          marginBottom: '16px',
          letterSpacing: '-0.5px'
        }}>
          Let's Talk.
        </h1>
        <p style={{ fontSize: '16px', color: '#FCD34D', maxWidth: '600px', margin: '0 auto' }}>
          Questions, feedback, or a special request? We'd love to hear from you.
        </p>
      </div>

      {/* Main Content: 2 Columns */}
      <div style={{
        maxWidth: '1100px',
        margin: '60px auto',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        gap: '64px',
        alignItems: 'start'
      }}>
        {/* Left Column: Get In Touch */}
        <div>
          <div style={{
            fontSize: '12px',
            fontWeight: '800',
            letterSpacing: '1px',
            color: 'var(--brand-maroon)',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            Get in touch
          </div>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '800',
            color: '#164E2A',
            marginBottom: '14px'
          }}>
            How can we help?
          </h2>
          <p style={{ fontSize: '15px', color: '#555', lineHeight: 1.6, marginBottom: '36px' }}>
            Have a question about an order or want to share some feedback? Get in touch with us. We're happy to hear from you.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Visit Us */}
            <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '4px',
                backgroundColor: '#EAB308',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1C1917',
                flexShrink: 0
              }}>
                <MapPin size={20} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#164E2A', marginBottom: '4px' }}>
                  Visit us
                </div>
                <div style={{ fontSize: '14px', color: '#666', lineHeight: 1.5 }}>
                  Shop 12-14, Shivalik Plaza, Near IIM Ahmedabad, Vastrapur, Ahmedabad, Gujarat 380015, India
                </div>
              </div>
            </div>

            {/* Call Us */}
            <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '4px',
                backgroundColor: '#EAB308',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1C1917',
                flexShrink: 0
              }}>
                <Phone size={20} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#164E2A', marginBottom: '4px' }}>
                  Call us
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  +91 34586 99738
                </div>
              </div>
            </div>

            {/* Email Us */}
            <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '4px',
                backgroundColor: '#EAB308',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1C1917',
                flexShrink: 0
              }}>
                <Mail size={20} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#164E2A', marginBottom: '4px' }}>
                  Email us
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  kahanshah5676@gmail.com
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Send A Message Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '36px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          border: '1px solid #ECE7DE'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '800',
            letterSpacing: '1px',
            color: 'var(--brand-maroon)',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            Send a message
          </div>
          <h3 style={{
            fontSize: '26px',
            fontWeight: '800',
            color: '#164E2A',
            marginBottom: '8px'
          }}>
            We're listening.
          </h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
            Fill out the form and tell us how we can help.
          </p>

          {submitted && (
            <div style={{
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              Thank you! Your message has been sent successfully.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '6px' }}>
                Your name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: '1px solid #D8D2C6',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '6px' }}>
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
                  borderRadius: '6px',
                  border: '1px solid #D8D2C6',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '6px' }}>
                Your message
              </label>
              <textarea
                placeholder="Write your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: '1px solid #D8D2C6',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginBottom: '16px' }}
            >
              {loading ? 'Sending...' : 'Send Message →'}
            </button>

            <div style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>
              Your information will be used to respond to your enquiry.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

