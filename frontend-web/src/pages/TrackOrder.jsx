import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Bike,
  RefreshCw,
  CreditCard,
  Smartphone,
  ChevronRight,
  Star,
  Copy,
  Check,
  PackageCheck,
  Store
} from 'lucide-react';

export default function TrackOrder({ user, navigate }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [trackData, setTrackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedTxn, setCopiedTxn] = useState(false);
  const [animatingRider, setAnimatingRider] = useState(true);
  const [riderOffset, setRiderOffset] = useState(0.65); // 0.0 (store) to 1.0 (home)
  const [simulating, setSimulating] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState('UPI');
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState('');

  // Read orderId from URL search param if present (?orderId=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('orderId');
    if (idFromUrl) {
      setSelectedOrderId(idFromUrl);
    }
  }, []);

  // Fetch all orders for this user to populate switcher
  useEffect(() => {
    async function loadOrders() {
      try {
        const email = user?.email || 'kahanshah5676@gmail.com';
        const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
          if (data.length > 0 && !selectedOrderId) {
            setSelectedOrderId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [user]);

  // Fetch tracking data for selected order
  const fetchTracking = async (orderId) => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/track`);
      if (res.ok) {
        const data = await res.json();
        setTrackData(data);
        // Set rider offset based on current step
        const step = data.current_step || 1;
        const total = data.total_steps || 5;
        setRiderOffset(Math.min(0.95, Math.max(0.05, (step - 1) / (total - 1))));
      }
    } catch (err) {
      console.error('Error tracking order:', err);
    }
  };

  useEffect(() => {
    if (selectedOrderId) {
      fetchTracking(selectedOrderId);
      const interval = setInterval(() => {
        fetchTracking(selectedOrderId);
      }, 5000); // Poll live updates every 5s
      return () => clearInterval(interval);
    }
  }, [selectedOrderId]);

  // Smooth gentle rider drift animation along road to simulate live movement
  useEffect(() => {
    if (!animatingRider) return;
    const interval = setInterval(() => {
      setRiderOffset((prev) => {
        if (prev >= 0.94) return 0.94;
        return Number((prev + 0.005).toFixed(3));
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [animatingRider]);

  // Advance delivery stage (Interactive Demo control)
  const handleAdvanceStage = async () => {
    if (!selectedOrderId) return;
    setSimulating(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrderId}/advance-delivery`, { method: 'POST' });
      if (res.ok) {
        await fetchTracking(selectedOrderId);
      }
    } catch (err) {
      console.error('Failed to advance stage:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handlePayOnline = async () => {
    if (!selectedOrderId) return;
    setPayLoading(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrderId}/pay-online`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: payMethod === 'UPI' ? 'Google Pay (UPI)' : payMethod === 'PAYTM' ? 'Paytm Wallet & UPI' : payMethod === 'CARD' ? 'Visa / RuPay Card' : 'Net Banking (SBI/HDFC)',
          provider: payMethod
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPaySuccessMsg(`Payment Received! Txn: ${data.transaction_id}`);
        setTimeout(() => {
          setShowPayModal(false);
          setPaySuccessMsg('');
          fetchTracking(selectedOrderId);
        }, 1500);
      } else {
        alert('Payment failed, please try again.');
      }
    } catch (e) {
      alert('Payment processing error');
    } finally {
      setPayLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedTxn(true);
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '60px auto', textAlign: 'center', padding: '0 24px' }}>
        <RefreshCw className="spin" size={36} color="var(--brand-maroon)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#164E2A' }}>Connecting to Live GPS Tracking...</h2>
      </div>
    );
  }

  if (!orders.length && !trackData) {
    return (
      <div style={{ maxWidth: '700px', margin: '60px auto', textAlign: 'center', padding: '0 24px' }}>
        <Bike size={56} color="#EA580C" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#164E2A', marginBottom: '8px' }}>
          No Active Deliveries Found
        </h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Place an order to experience live GPS tracking and watch your snack delivery rider in real-time!
        </p>
        <button className="btn-primary" onClick={() => navigate('/products')}>
          Explore Snacks & Order Now →
        </button>
      </div>
    );
  }

  // Calculate coordinates on SVG path
  // Road goes from Kitchen (x: 70, y: 70) through bends to Home (x: 430, y: 230)
  const riderX = 70 + (430 - 70) * riderOffset + Math.sin(riderOffset * Math.PI * 2) * 25;
  const riderY = 70 + (230 - 70) * riderOffset + Math.cos(riderOffset * Math.PI * 2) * 15;

  return (
    <div style={{ maxWidth: '1050px', margin: '30px auto 60px', padding: '0 20px' }}>
      {/* Top Breadcrumb & Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '1px', color: 'var(--brand-maroon)', textTransform: 'uppercase' }}>
            Live Order Tracking
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#164E2A', margin: '4px 0 0' }}>
            Track Your SwadBox 🛵
          </h1>
        </div>

        {/* Order Selector Dropdown if multiple */}
        {orders.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#666', fontWeight: '600' }}>Select Order:</span>
            <select
              value={selectedOrderId}
              onChange={(e) => {
                setSelectedOrderId(e.target.value);
                window.history.replaceState({}, '', `/track?orderId=${e.target.value}`);
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #D8D2C6',
                backgroundColor: 'white',
                fontSize: '13px',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  Order #{o.id.slice(0, 8)}... (₹{o.total_amount})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {trackData && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.25fr 1fr',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Left Column: Live Map & Delivery Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Payment Pending Alert Banner (COD / Counter) */}
            {trackData.payment_status === 'Pending' && (
              <div style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FCD34D',
                borderRadius: '14px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: '0 2px 10px rgba(245, 158, 11, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={24} color="#D97706" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#92400E' }}>
                      Payment Pending: ₹{Number(trackData.total_amount).toFixed(2)} ({trackData.delivery_mode === 'pickup' ? 'Pay at Counter' : 'Cash on Delivery'})
                    </div>
                    <div style={{ fontSize: '12px', color: '#B45309' }}>
                      You can pay cash upon receipt, or complete payment online instantly via UPI / GPay / Paytm / Card.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowPayModal(true)}
                  style={{
                    backgroundColor: '#164E2A',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(22, 78, 42, 0.25)'
                  }}
                >
                  <CreditCard size={15} /> Pay Online Now →
                </button>
              </div>
            )}

            {/* Store Pickup Pass (When delivery_mode === 'pickup') */}
            {trackData.delivery_mode === 'pickup' && (
              <div style={{
                backgroundColor: '#FEF3C7',
                border: '2px dashed #D97706',
                borderRadius: '16px',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 4px 16px rgba(217, 119, 6, 0.12)'
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#92400E', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    🏪 STORE PICKUP PASS • ZERO DELIVERY FEE
                  </div>
                  <div style={{ fontSize: '19px', fontWeight: '900', color: '#78350F', marginTop: '4px' }}>
                    Show this OTP at SwadBox Kitchen Counter
                  </div>
                  <div style={{ fontSize: '13px', color: '#92400E', marginTop: '2px' }}>
                    Shop 12-14, Shivalik Plaza, Near IIM Ahmedabad, Vastrapur • Prep: ~15 mins
                  </div>
                </div>
                <div style={{
                  backgroundColor: '#78350F',
                  color: '#FDE68A',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(120, 53, 15, 0.25)'
                }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
                    PICKUP OTP
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '4px', fontFamily: 'monospace' }}>
                    {trackData.pickup_otp || '8492'}
                  </div>
                </div>
              </div>
            )}

            {/* ETA Banner */}
            <div style={{
              background: trackData.delivery_mode === 'pickup'
                ? 'linear-gradient(135deg, #78350F 0%, #451A03 100%)'
                : 'linear-gradient(135deg, #164E2A 0%, #0F381E 100%)',
              color: 'white',
              borderRadius: '16px',
              padding: '24px 28px',
              boxShadow: '0 8px 24px rgba(22, 78, 42, 0.18)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    backgroundColor: '#EAB308',
                    color: '#1C1917',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {trackData.delivery_mode === 'pickup' ? '🏪 Store Pickup' : '🛵 Live Delivery'}
                  </span>
                  <span style={{ fontSize: '13px', opacity: 0.9 }}>
                    Status: <strong>{trackData.delivery_status}</strong>
                  </span>
                </div>
                <div style={{ fontSize: '30px', fontWeight: '900', letterSpacing: '-0.5px' }}>
                  {trackData.delivery_mode === 'pickup' ? (
                    trackData.delivery_status === 'Ready at Store Counter'
                      ? 'Ready for Counter Pickup! 🛍️'
                      : (trackData.delivery_status === 'Delivered' || trackData.delivery_status === 'Picked Up & Completed')
                        ? 'Order Collected! Enjoy your snacks! 🎉'
                        : 'Kitchen Preparing • Ready in ~15 mins'
                  ) : (
                    trackData.delivery_status === 'Delivered'
                      ? 'Delivered Successfully! 🎉'
                      : `Arriving in ${trackData.estimated_minutes} mins`
                  )}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.85, marginTop: '4px' }}>
                  {trackData.delivery_mode === 'pickup' ? (
                    (trackData.delivery_status === 'Delivered' || trackData.delivery_status === 'Picked Up & Completed')
                      ? 'Thank you for visiting SwadBox Central Kitchen!'
                      : 'SwadBox Kitchen: Shop 12-14, Shivalik Plaza, Vastrapur, Ahmedabad'
                  ) : (
                    trackData.delivery_status === 'Delivered'
                      ? 'Hope you enjoy your authentic Indian snacks!'
                      : `Rider is ${trackData.distance_km} km away • On-Time Delivery Guaranteed`
                  )}
                </div>
              </div>

              {/* Quick simulation button */}
              <button
                onClick={handleAdvanceStage}
                disabled={simulating || trackData.delivery_status === 'Delivered' || trackData.delivery_status === 'Picked Up & Completed'}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: (trackData.delivery_status === 'Delivered' || trackData.delivery_status === 'Picked Up & Completed') ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                title="Advance to next stage for demonstration"
              >
                <RefreshCw size={14} className={simulating ? 'spin' : ''} />
                {(trackData.delivery_status === 'Delivered' || trackData.delivery_status === 'Picked Up & Completed') ? 'Completed' : 'Simulate Next Stage →'}
              </button>
            </div>

            {/* Interactive SVG Map or Kitchen Counter View */}
            <div style={{
              backgroundColor: '#F3EFE9',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid #ECE7DE',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              position: 'relative'
            }}>
              {/* Map header indicator */}
              <div style={{
                position: 'absolute',
                top: '14px',
                left: '16px',
                zIndex: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#164E2A',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#22C55E',
                  boxShadow: '0 0 8px #22C55E'
                }} />
                {trackData.delivery_mode === 'pickup'
                  ? 'SwadBox Central Kitchen Counter • Vastrapur'
                  : 'Ahmedabad Delivery Hub • Live GPS'}
              </div>

              {/* Speed & Heading Badge */}
              <div style={{
                position: 'absolute',
                top: '14px',
                right: '16px',
                zIndex: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#EA580C',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                {trackData.delivery_mode === 'pickup' ? '⏱️ Prep Time: ~15 mins' : `⚡ ${trackData.rider?.speed || '28 km/h'}`}
              </div>

              {/* SVG Styled Map or Kitchen Display */}
              {trackData.delivery_mode === 'pickup' ? (
                <svg
                  viewBox="0 0 500 300"
                  style={{ width: '100%', height: '320px', display: 'block', backgroundColor: '#FEF3C7' }}
                >
                  <defs>
                    <pattern id="storeGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <rect width="40" height="40" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="500" height="300" fill="url(#storeGrid)" />

                  {/* Kitchen Building Canopy */}
                  <rect x="50" y="30" width="400" height="60" rx="8" fill="#78350F" />
                  <rect x="60" y="75" width="380" height="10" fill="#F59E0B" />
                  <text x="250" y="65" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900" letterSpacing="1px">
                    🏪 SWADBOX CENTRAL KITCHEN & TAKEAWAY
                  </text>

                  {/* Kitchen Preparation Station */}
                  <rect x="60" y="110" width="160" height="120" rx="10" fill="#FFFFFF" stroke="#E5DEC9" strokeWidth="2" />
                  <rect x="75" y="125" width="130" height="26" rx="6" fill="#F3EFE9" />
                  <text x="140" y="142" textAnchor="middle" fill="#78350F" fontSize="11" fontWeight="800">
                    👨‍🍳 Kitchen Prep Station
                  </text>
                  <text x="140" y="175" textAnchor="middle" fontSize="30">🥘</text>
                  <text x="140" y="210" textAnchor="middle" fill="#15803D" fontSize="11" fontWeight="700">
                    Fresh Snacks Frying & Packing
                  </text>

                  {/* Pickup Counter Station */}
                  <rect x="280" y="110" width="160" height="120" rx="10" fill="#FFFFFF" stroke="#164E2A" strokeWidth="2" />
                  <rect x="295" y="125" width="130" height="26" rx="6" fill="#DCFCE7" />
                  <text x="360" y="142" textAnchor="middle" fill="#164E2A" fontSize="11" fontWeight="800">
                    🛍️ Self Pickup Counter
                  </text>
                  <text x="360" y="175" textAnchor="middle" fontSize="30">📦</text>
                  <rect x="310" y="195" width="100" height="22" rx="4" fill="#78350F" />
                  <text x="360" y="210" textAnchor="middle" fill="#FDE68A" fontSize="11" fontWeight="800" fontFamily="monospace">
                    OTP: {trackData.pickup_otp || '8492'}
                  </text>

                  {/* Animated Connecting Dots */}
                  <path d="M 220,170 L 280,170" stroke="#EA580C" strokeWidth="3" strokeDasharray="6,4" />

                  {/* Bottom Counter Sign */}
                  <rect x="100" y="250" width="300" height="34" rx="8" fill="#164E2A" />
                  <text x="250" y="272" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="800">
                    Counter 1 • Show OTP {trackData.pickup_otp || '8492'} to Store Manager
                  </text>
                </svg>
              ) : (
                <svg
                  viewBox="0 0 500 300"
                  style={{ width: '100%', height: '320px', display: 'block', backgroundColor: '#EFE9DE' }}
                >
                  {/* Background Grid & Streets */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <rect width="40" height="40" fill="#EFE9DE" stroke="#E5DEC9" strokeWidth="0.8" />
                    </pattern>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#164E2A" />
                      <stop offset="50%" stopColor="#EA580C" />
                      <stop offset="100%" stopColor="#EAB308" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  <rect width="500" height="300" fill="url(#grid)" />

                  {/* Parks / Green patches */}
                  <rect x="20" y="160" width="110" height="90" rx="8" fill="#D8ECD5" opacity="0.7" />
                  <text x="32" y="185" fill="#2E7D32" fontSize="9" fontWeight="700">Vastrapur Garden</text>

                  <rect x="360" y="30" width="100" height="80" rx="8" fill="#D8ECD5" opacity="0.7" />
                  <text x="375" y="55" fill="#2E7D32" fontSize="9" fontWeight="700">IIM Campus Green</text>

                  {/* Major Roads */}
                  <path d="M 0,90 L 500,90" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
                  <path d="M 0,90 L 500,90" stroke="#DFD7C5" strokeWidth="1" strokeDasharray="4,4" />

                  <path d="M 160,0 L 160,300" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 330,0 L 330,300" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 0,220 L 500,220" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />

                  {/* Road Labels */}
                  <text x="210" y="85" fill="#887E6E" fontSize="8" fontWeight="600">S.G. Highway Link</text>
                  <text x="170" y="140" fill="#887E6E" fontSize="8" fontWeight="600" transform="rotate(90, 170, 140)">Vastrapur Main Rd</text>
                  <text x="340" y="140" fill="#887E6E" fontSize="8" fontWeight="600" transform="rotate(90, 340, 140)">University Rd</text>

                  {/* Delivery Active Route Polyline */}
                  <path
                    d="M 70,70 Q 140,85 180,110 T 280,170 T 360,215 L 430,230"
                    fill="none"
                    stroke="#E2DCD2"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 70,70 Q 140,85 180,110 T 280,170 T 360,215 L 430,230"
                    fill="none"
                    stroke="url(#routeGradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    filter="url(#glow)"
                  />

                  {/* Origin Store Pin (SwadBox Central Kitchen) */}
                  <g transform="translate(70, 70)">
                    <circle r="18" fill="#164E2A" />
                    <circle r="14" fill="#FFFFFF" />
                    <circle r="6" fill="#164E2A" />
                    <rect x="-45" y="-34" width="90" height="18" rx="4" fill="#164E2A" />
                    <text x="0" y="-22" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="800">
                      SwadBox Kitchen
                    </text>
                  </g>

                  {/* Destination Pin (Customer Home) */}
                  <g transform="translate(430, 230)">
                    <circle r="18" fill="#EA580C" />
                    <circle r="14" fill="#FFFFFF" />
                    <circle r="6" fill="#EA580C" />
                    <rect x="-42" y="18" width="84" height="18" rx="4" fill="#EA580C" />
                    <text x="0" y="30" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="800">
                      Your Address 🏠
                    </text>
                  </g>

                  {/* Live Animated Rider (Scooter) */}
                  <g transform={`translate(${riderX}, ${riderY})`}>
                    <circle r="22" fill="#EA580C" opacity="0.25">
                      <animate attributeName="r" values="14;28;14" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0.05;0.4" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle r="14" fill="#EA580C" />
                    <circle r="11" fill="#FFFFFF" />
                    <text x="0" y="4" textAnchor="middle" fontSize="11">🛵</text>

                    {/* Floating rider name pill */}
                    <rect x="-35" y="-28" width="70" height="16" rx="4" fill="#1C1917" opacity="0.9" />
                    <text x="0" y="-17" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="700">
                      Ramesh • 🛵
                    </text>
                  </g>
                </svg>
              )}

              {/* Bottom Map Footnote */}
              <div style={{
                padding: '10px 16px',
                backgroundColor: 'white',
                borderTop: '1px solid #ECE7DE',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: '#666'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Store size={14} color="#164E2A" />
                  <span>
                    {trackData.delivery_mode === 'pickup'
                      ? <strong>Pickup Counter: Shop 12-14, Shivalik Plaza, Vastrapur</strong>
                      : <>Picked up from <strong>Shivalik Plaza, Vastrapur</strong></>}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#EA580C" />
                  <span>
                    {trackData.delivery_mode === 'pickup'
                      ? <strong>Customer Self Collection Counter</strong>
                      : <>Delivering to <strong>{trackData.delivery_address?.slice(0, 24)}...</strong></>}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Partner / Kitchen Manager Profile Card */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '14px',
              padding: '20px 24px',
              border: '1px solid #ECE7DE',
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: trackData.delivery_mode === 'pickup' ? '#DCFCE7' : '#FFEDD5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    border: trackData.delivery_mode === 'pickup' ? '2px solid #164E2A' : '2px solid #EA580C'
                  }}>
                    {trackData.delivery_mode === 'pickup' ? '👨‍🍳' : '👨‍✈️'}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    backgroundColor: '#22C55E',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px'
                  }}>
                    ✓
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#164E2A', margin: 0 }}>
                      {trackData.delivery_mode === 'pickup'
                        ? (trackData.rider?.name || 'Rajesh Patel (Kitchen Manager)')
                        : (trackData.rider?.name || 'Ramesh Patel')}
                    </h3>
                    <span style={{
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      <Star size={11} fill="#F59E0B" color="#F59E0B" /> {trackData.rider?.rating || 4.9}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                    {trackData.delivery_mode === 'pickup'
                      ? 'SwadBox Central Kitchen (Shop 12-14, Shivalik Plaza)'
                      : (trackData.rider?.vehicle || 'GJ-01-ET-4829 (Hero Splendor)')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#15803D', fontWeight: '700', marginTop: '4px' }}>
                    {trackData.delivery_mode === 'pickup'
                      ? '🛡️ Fresh FSSAI Certified Kitchen • Clean Packaging Guaranteed'
                      : '🛡️ Vaccinated • Temperature 98.2°F • Mask Verified'}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={`tel:${trackData.rider?.phone || '+919825144321'}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#164E2A',
                    color: 'white',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={15} />
                  {trackData.delivery_mode === 'pickup' ? 'Call Kitchen' : 'Call Rider'}
                </a>
                <button
                  onClick={() => alert(`Connecting you to ${trackData.delivery_mode === 'pickup' ? 'Kitchen Manager' : 'delivery partner'} via SMS...`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#F3EFE9',
                    color: '#333',
                    border: '1px solid #D8D2C6',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <MessageSquare size={15} />
                  Message
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline Stepper & Order Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Delivery Milestones Stepper (Amazon / Zomato style) */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid #ECE7DE',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#164E2A', marginBottom: '20px' }}>
                Delivery Progress
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {trackData.milestones?.map((m, idx) => {
                  const isDone = m.status === 'completed';
                  const isCurr = m.status === 'current';

                  return (
                    <div key={idx} style={{ display: 'flex', gap: '14px', position: 'relative' }}>
                      {/* Connecting vertical line */}
                      {idx < trackData.milestones.length - 1 && (
                        <div style={{
                          position: 'absolute',
                          left: '15px',
                          top: '30px',
                          bottom: '-16px',
                          width: '2px',
                          backgroundColor: isDone ? '#164E2A' : '#E2DCD2'
                        }} />
                      )}

                      {/* Icon circle */}
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isDone ? '#164E2A' : isCurr ? '#EA580C' : '#F3EFE9',
                        color: isDone || isCurr ? 'white' : '#999',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '800',
                        flexShrink: 0,
                        zIndex: 2,
                        boxShadow: isCurr ? '0 0 12px rgba(234, 88, 12, 0.4)' : 'none'
                      }}>
                        {isDone ? '✓' : isCurr ? '●' : idx + 1}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: isCurr ? '800' : '700',
                            color: isCurr ? '#EA580C' : isDone ? '#164E2A' : '#777'
                          }}>
                            {m.title}
                          </span>
                          <span style={{ fontSize: '11px', color: '#888', fontWeight: '600' }}>
                            {m.time}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0', lineHeight: 1.4 }}>
                          {m.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment & Order Summary Card */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px 28px',
              border: '1px solid #ECE7DE',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '16px',
                borderBottom: '1px solid #F0ECE4',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase' }}>
                    Order ID
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#164E2A' }}>
                    #{trackData.order_id}
                  </div>
                </div>

                <div style={{
                  backgroundColor: trackData.payment_status === 'Paid' ? '#DCFCE7' : '#FEF3C7',
                  color: trackData.payment_status === 'Paid' ? '#15803D' : '#92400E',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {trackData.payment_status === 'Paid' ? '✓ Paid' : 'Pending COD'}
                </div>
              </div>

              {/* Payment Method Details */}
              <div style={{
                backgroundColor: '#FAF7F2',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '16px',
                fontSize: '13px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#666' }}>Payment Method:</span>
                  <span style={{ fontWeight: '700', color: '#1C1917' }}>
                    {trackData.payment_method || 'Google Pay (UPI)'}
                  </span>
                </div>
                {trackData.transaction_id && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Transaction ID:</span>
                    <span
                      onClick={() => copyToClipboard(trackData.transaction_id)}
                      style={{
                        fontWeight: '700',
                        color: 'var(--brand-maroon)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Click to copy Transaction ID"
                    >
                      {trackData.transaction_id}
                      {copiedTxn ? <Check size={12} color="#15803D" /> : <Copy size={12} />}
                    </span>
                  </div>
                )}
                {trackData.payment_status === 'Pending' && (
                  <button
                    onClick={() => setShowPayModal(true)}
                    style={{
                      marginTop: '10px',
                      width: '100%',
                      backgroundColor: '#164E2A',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <CreditCard size={14} /> Pay ₹{Number(trackData.total_amount).toFixed(2)} Online Now
                  </button>
                )}
              </div>

              {/* Items List in this Order */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#164E2A', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Order Items ({trackData.items?.length || 0})
                </div>
                {trackData.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: '#444' }}>
                      {item.name} × {item.quantity} ({item.weight || '500 g'})
                    </span>
                    <span style={{ fontWeight: '700', color: '#1C1917' }}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total & Delivery Address */}
              <div style={{ borderTop: '1px solid #F0ECE4', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#1C1917' }}>Total Amount</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#EA580C' }}>
                  ₹{Number(trackData.total_amount).toFixed(2)}
                </span>
              </div>

              <div style={{ marginTop: '14px', fontSize: '12px', color: '#666', lineHeight: 1.5 }}>
                {trackData.delivery_mode === 'pickup' ? (
                  <>🏪 <strong>Store Pickup Counter:</strong> Shop 12-14, Shivalik Plaza, Vastrapur, Ahmedabad (OTP: <strong style={{ color: '#D97706' }}>{trackData.pickup_otp || '8492'}</strong>)</>
                ) : (
                  <>📍 <strong>Delivery Address:</strong> {trackData.delivery_address}</>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay Online Modal */}
      {showPayModal && trackData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--brand-maroon)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Secure Payment Gateway
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#164E2A', margin: '4px 0 0' }}>
                  Pay ₹{Number(trackData.total_amount).toFixed(2)} Online
                </h3>
              </div>
              <button
                onClick={() => { setShowPayModal(false); setPaySuccessMsg(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '22px',
                  color: '#888',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {paySuccessMsg ? (
              <div style={{
                backgroundColor: '#DCFCE7',
                border: '1px solid #86EFAC',
                color: '#15803D',
                padding: '24px',
                borderRadius: '12px',
                textAlign: 'center',
                margin: '20px 0'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎉</div>
                <div style={{ fontSize: '18px', fontWeight: '800' }}>Payment Completed!</div>
                <div style={{ fontSize: '13px', marginTop: '6px' }}>{paySuccessMsg}</div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
                  Order #{trackData.order_id.slice(0, 8)}... is currently marked as <strong>Payment Pending</strong>. Choose your payment method below to complete payment instantly:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {[
                    { id: 'UPI', label: 'Google Pay (UPI)', icon: '📱', desc: 'Instant UPI transfer from GPay / BHIM' },
                    { id: 'PAYTM', label: 'Paytm Wallet & UPI', icon: '⚡', desc: 'Paytm Wallet, Postpaid, or UPI ID' },
                    { id: 'CARD', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, MasterCard, RuPay (Zero convenience fee)' },
                    { id: 'NETBANKING', label: 'Net Banking', icon: '🏦', desc: 'HDFC, ICICI, SBI, Axis, Kotak Bank' }
                  ].map((m) => (
                    <label
                      key={m.id}
                      onClick={() => setPayMethod(m.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: payMethod === m.id ? '2px solid #164E2A' : '1px solid #ECE7DE',
                        backgroundColor: payMethod === m.id ? '#F7FAF7' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>{m.icon}</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#1C1917' }}>{m.label}</div>
                          <div style={{ fontSize: '11px', color: '#666' }}>{m.desc}</div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="modal-pay"
                        checked={payMethod === m.id}
                        onChange={() => setPayMethod(m.id)}
                        style={{ accentColor: '#164E2A' }}
                      />
                    </label>
                  ))}
                </div>

                <button
                  onClick={handlePayOnline}
                  disabled={payLoading}
                  style={{
                    width: '100%',
                    backgroundColor: '#164E2A',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: '800',
                    cursor: payLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <ShieldCheck size={18} />
                  {payLoading ? 'Authorizing Payment...' : `Complete Payment of ₹${Number(trackData.total_amount).toFixed(2)} →`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
