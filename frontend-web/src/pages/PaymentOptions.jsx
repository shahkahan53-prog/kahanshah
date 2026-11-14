import React from 'react';
import {
  Smartphone,
  CreditCard,
  Building,
  Wallet,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Bike,
  Store,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function PaymentOptions({ navigate }) {
  return (
    <div style={{ maxWidth: '1050px', margin: '40px auto 80px', padding: '0 24px' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--brand-maroon) 0%, #5B131E 100%)',
        color: 'white',
        borderRadius: '16px',
        padding: '50px 36px',
        textAlign: 'center',
        marginBottom: '40px',
        boxShadow: '0 10px 30px rgba(139, 29, 44, 0.15)'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '800',
          letterSpacing: '1.5px',
          color: '#F5A623',
          textTransform: 'uppercase',
          marginBottom: '10px'
        }}>
          Payment Guide & Order Modes
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: '900', margin: '0 0 14px', letterSpacing: '-0.5px' }}>
          Payment Options & Delivery Choices
        </h1>
        <p style={{ fontSize: '16px', maxWidth: '650px', margin: '0 auto', opacity: 0.9, lineHeight: 1.6 }}>
          Everything you need to know about paying securely on SwadBox and choosing between doorstep delivery or self store pickup.
        </p>
      </div>

      {/* Grid: 2 Core Order Features (Payment Status & Delivery Choice) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '48px'
      }}>
        {/* Feature A: Payment Completed vs Payment Pending */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '14px',
          padding: '28px',
          border: '1px solid #ECE7DE',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px' }}>💳</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#164E2A', margin: 0 }}>
              Payment Options
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: '#15803D', fontSize: '15px', marginBottom: '4px' }}>
                <CheckCircle2 size={18} />
                Order Completed with Payment (Paid)
              </div>
              <p style={{ fontSize: '13px', color: '#444', margin: 0, lineHeight: 1.5 }}>
                Pay instantly using <strong>Google Pay, Paytm, PhonePe, Cards, or Net Banking</strong>. You receive an instant transaction ID, digital receipt, and 100% contactless fulfillment.
              </p>
            </div>

            <div style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: '#B45309', fontSize: '15px', marginBottom: '4px' }}>
                <Clock size={18} />
                Order Placed without Payment (COD / Pay Later)
              </div>
              <p style={{ fontSize: '13px', color: '#444', margin: 0, lineHeight: 1.5 }}>
                Order is confirmed immediately with <strong>Cash on Delivery (COD)</strong>. Pay via cash or UPI to the delivery rider or store counter upon arrival. You can also click <strong>"Pay Online Now"</strong> anytime before delivery!
              </p>
            </div>
          </div>
        </div>

        {/* Feature B: With Delivery vs Without Delivery */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '14px',
          padding: '28px',
          border: '1px solid #ECE7DE',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px' }}>🛵</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#164E2A', margin: 0 }}>
              Fulfillment Choices
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: '#164E2A', fontSize: '15px', marginBottom: '4px' }}>
                <Bike size={18} color="#EA580C" />
                With Delivery (Doorstep Delivery)
              </div>
              <p style={{ fontSize: '13px', color: '#444', margin: 0, lineHeight: 1.5 }}>
                Our trusted partner <strong>Ramesh Patel</strong> delivers right to your door with live GPS map tracking, real-time ETA countdown, and temperature-controlled bags.
              </p>
            </div>

            <div style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #FCD34D',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: '#92400E', fontSize: '15px', marginBottom: '4px' }}>
                <Store size={18} color="#92400E" />
                Without Delivery (Store Pickup / Takeaway)
              </div>
              <p style={{ fontSize: '13px', color: '#444', margin: 0, lineHeight: 1.5 }}>
                Save time and pick up directly from our central kitchen: <strong>Shop 12-14, Shivalik Plaza, Near IIM Ahmedabad, Vastrapur</strong>. Packed in 15 mins with a 4-digit Pickup OTP pass!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Payment Methods Detailed Grid */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--brand-maroon)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Accepted Everywhere
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#164E2A', margin: '4px 0 0' }}>
            All Supported Payment Methods
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {/* UPI */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #ECE7DE', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📱</div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#164E2A', marginBottom: '6px' }}>UPI Apps</h3>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5, marginBottom: '12px' }}>
              Google Pay, Paytm, PhonePe, BHIM, and any UPI handle (@okaxis, @okhdfcbank, @ybl).
            </p>
            <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>
              Zero Convenience Fee
            </span>
          </div>

          {/* Cards */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #ECE7DE', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💳</div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#164E2A', marginBottom: '6px' }}>Debit & Credit Cards</h3>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5, marginBottom: '12px' }}>
              Visa, MasterCard, RuPay, Maestro, and American Express with 3D Secure OTP verification.
            </p>
            <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>
              All Banks Supported
            </span>
          </div>

          {/* Net Banking */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #ECE7DE', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🏦</div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#164E2A', marginBottom: '6px' }}>Net Banking</h3>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5, marginBottom: '12px' }}>
              Direct bank transfer via HDFC, ICICI, State Bank of India, Axis Bank, Kotak, and 50+ banks.
            </p>
            <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>
              Instant Confirmation
            </span>
          </div>

          {/* COD */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #ECE7DE', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💵</div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#164E2A', marginBottom: '6px' }}>Cash on Delivery</h3>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5, marginBottom: '12px' }}>
              Pay by cash or scan the rider's dynamic UPI QR code when your snack box reaches your hands.
            </p>
            <span style={{ backgroundColor: '#F3E8FF', color: '#6B21A8', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>
              Pay on Delivery
            </span>
          </div>
        </div>
      </div>

      {/* Security Guarantees Banner */}
      <div style={{
        backgroundColor: '#FAF7F2',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #ECE7DE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#164E2A',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Lock size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#164E2A', margin: 0 }}>
              256-bit SSL Banking Grade Security
            </h3>
            <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0' }}>
              Your card and UPI information is encrypted end-to-end. We never store CVV or bank passwords.
            </p>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate('/products')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          Explore Menu & Order <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
