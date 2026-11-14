import React, { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Lock,
  QrCode,
  ArrowRight,
  RefreshCw,
  Check
} from 'lucide-react';

export default function Checkout({ cart, user, clearCart, refreshProducts, navigate }) {
  const [phone, setPhone] = useState('3458699738');
  const [address, setAddress] = useState('Shop 12-14, Shivalik Plaza, Near IIM Ahmedabad, Vastrapur, Ahmedabad, Gujarat 380015');
  const [deliveryTime, setDeliveryTime] = useState('Evening (4pm – 8pm)');
  const [deliveryMode, setDeliveryMode] = useState('delivery'); // 'delivery' (With Delivery) or 'pickup' (Without Delivery / Self Pickup)

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI', 'CARD', 'NETBANKING', 'WALLET', 'COD'
  const [upiProvider, setUpiProvider] = useState('Google Pay'); // 'Google Pay', 'Paytm', 'PhonePe', 'BHIM'
  const [upiId, setUpiId] = useState('kahanshah@okhdfcbank');
  const [upiMode, setUpiMode] = useState('id'); // 'id' or 'qr'

  // Card details
  const [cardNumber, setCardNumber] = useState('4532 8920 1234 5678');
  const [cardName, setCardName] = useState('Kahan Shah');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('892');

  // Net banking
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Wallet
  const [selectedWallet, setSelectedWallet] = useState('Paytm Wallet');

  // Payment processing modal state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0); // 0: idle, 1: connecting, 2: verifying, 3: success
  const [paymentTxnId, setPaymentTxnId] = useState('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Auto-format card number
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(val);
  };

  // Auto-format expiry
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setCardExpiry(val);
  };

  // Card brand detection
  const getCardBrand = () => {
    const raw = cardNumber.replace(/\s/g, '');
    if (raw.startsWith('4')) return 'Visa';
    if (raw.startsWith('5')) return 'Mastercard';
    if (raw.startsWith('6')) return 'RuPay';
    return 'Credit/Debit Card';
  };

  const handlePlaceOrderWithPayment = async (e) => {
    e.preventDefault();
    if (!cart.length) {
      alert('Your cart is empty!');
      return;
    }
    if (!phone.trim() || !address.trim() || !deliveryTime) {
      alert('Please fill in all delivery details.');
      return;
    }

    // Launch authentic payment processing flow
    setIsProcessingPayment(true);
    setPaymentStep(1); // Connecting to gateway

    try {
      // Step A: Call backend payment processor
      let providerName = '';
      let paymentLabel = '';

      if (paymentMethod === 'UPI') {
        providerName = upiProvider;
        paymentLabel = `${upiProvider} (UPI • ${upiId})`;
      } else if (paymentMethod === 'CARD') {
        providerName = getCardBrand();
        paymentLabel = `${getCardBrand()} Card (•••• ${cardNumber.slice(-4)})`;
      } else if (paymentMethod === 'NETBANKING') {
        providerName = selectedBank;
        paymentLabel = `Net Banking (${selectedBank})`;
      } else if (paymentMethod === 'WALLET') {
        providerName = selectedWallet;
        paymentLabel = `Wallet (${selectedWallet})`;
      } else {
        providerName = deliveryMode === 'pickup' ? 'Pay at Store Counter' : 'Cash on Delivery';
        paymentLabel = deliveryMode === 'pickup' ? 'Pay at Store Counter (Cash / UPI)' : 'Cash on Delivery (Pay to Rider)';
      }

      // Simulated payment gateway handshake
      await new Promise((r) => setTimeout(r, 800));
      setPaymentStep(2); // Authorizing transaction

      const payRes = await fetch('/api/payment/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_amount: total,
          payment_method: paymentMethod === 'COD' ? (deliveryMode === 'pickup' ? 'Pay at Counter' : 'Cash on Delivery') : paymentMethod,
          provider: providerName,
          upi_id: upiId,
          card_number: cardNumber,
          card_name: cardName,
          card_expiry: cardExpiry,
          card_cvv: cardCvv,
          bank_name: selectedBank,
          wallet_name: selectedWallet
        })
      });

      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(payData.detail || 'Payment authorization failed');
      }

      setPaymentTxnId(payData.transaction_id);
      setPaymentStep(3); // Success verified!

      // Step B: Submit order to backend
      const orderPayload = {
        customer_name: user?.full_name || 'Kahan Shah',
        customer_email: user?.email || 'kahanshah5676@gmail.com',
        phone: phone,
        delivery_address: deliveryMode === 'pickup' ? 'Store Pickup: Shop 12-14, Shivalik Plaza, Near IIM Ahmedabad, Vastrapur, Ahmedabad' : address,
        preferred_time: deliveryTime,
        delivery_mode: deliveryMode,
        payment_method: paymentLabel,
        payment_status: paymentMethod === 'COD' ? 'Pending' : payData.payment_status,
        transaction_id: paymentMethod === 'COD' ? '' : payData.transaction_id,
        payment_details: paymentMethod === 'COD' ? (deliveryMode === 'pickup' ? 'Pay at counter via cash or UPI' : 'Pay to rider upon delivery') : payData.masked_detail,
        items: cart.map((item) => ({
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          weight: item.weight || '500 g'
        }))
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const orderData = await res.json();

      if (!res.ok) {
        alert(orderData.detail || 'Failed to place order');
        setIsProcessingPayment(false);
        return;
      }

      // Success! Wait a brief moment to show checkmark then navigate to Live Tracking
      setTimeout(async () => {
        clearCart();
        await refreshProducts();
        setIsProcessingPayment(false);
        // Direct seamless handoff to Live Delivery Tracking!
        navigate(`/track?orderId=${orderData.order_id}`);
      }, 1400);
    } catch (err) {
      console.error(err);
      alert('Error during checkout: ' + err.message);
      setIsProcessingPayment(false);
    }
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '30px auto 60px', padding: '0 20px' }}>
      {/* Top Banner */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '1px', color: 'var(--brand-maroon)', textTransform: 'uppercase' }}>
          Secure Checkout
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#164E2A', margin: '4px 0 0' }}>
          Complete Your Order & Payment 🛡️
        </h1>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.3fr 1fr',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* Left Column: Delivery & Payment Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: Delivery Details */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            border: '1px solid #ECE7DE'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{
                backgroundColor: '#164E2A',
                color: 'white',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800'
              }}>
                1
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#164E2A', margin: 0 }}>
                Order Fulfillment & Contact
              </h2>
            </div>

            {/* Fulfillment Mode: With Delivery vs Without Delivery (Self Pickup) */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#164E2A', marginBottom: '8px' }}>
                Choose Fulfillment Mode:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div
                  onClick={() => {
                    setDeliveryMode('delivery');
                    setAddress('Flat 402, Shivalik Heights, Near IIM New Campus, Vastrapur, Ahmedabad');
                    setDeliveryTime('Evening (4pm – 8pm)');
                  }}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    border: deliveryMode === 'delivery' ? '2px solid #164E2A' : '1px solid #D8D2C6',
                    backgroundColor: deliveryMode === 'delivery' ? '#F0FDF4' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name="deliv_mode_choice"
                    checked={deliveryMode === 'delivery'}
                    onChange={() => setDeliveryMode('delivery')}
                    style={{ accentColor: '#164E2A', width: '16px', height: '16px' }}
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#164E2A' }}>
                      🛵 With Delivery
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      Doorstep delivery by partner
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setDeliveryMode('pickup');
                    setAddress('Store Pickup: Shop 12-14, Shivalik Plaza, Near IIM Ahmedabad, Vastrapur, Ahmedabad');
                    setDeliveryTime('Ready in 15 mins (Counter Pickup)');
                  }}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    border: deliveryMode === 'pickup' ? '2px solid #EA580C' : '1px solid #D8D2C6',
                    backgroundColor: deliveryMode === 'pickup' ? '#FEF3C7' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name="deliv_mode_choice"
                    checked={deliveryMode === 'pickup'}
                    onChange={() => setDeliveryMode('pickup')}
                    style={{ accentColor: '#EA580C', width: '16px', height: '16px' }}
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#92400E' }}>
                      🏪 Without Delivery
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      Self Store Pickup (OTP pass)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#555', marginBottom: '4px' }}>Customer Name</label>
                <input
                  type="text"
                  value={user?.full_name || 'Kahan Shah'}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid #E2DCD2',
                    backgroundColor: '#FFFFFF',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#555', marginBottom: '4px' }}>Email Address</label>
                <input
                  type="email"
                  value={user?.email || 'kahanshah5676@gmail.com'}
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid #E2DCD2',
                    backgroundColor: '#F3EFE9',
                    fontSize: '14px',
                    color: '#666',
                    cursor: 'not-allowed'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#555', marginBottom: '4px' }}>Phone Number (for SMS & OTP Updates)</label>
              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid #E2DCD2',
                  fontSize: '14px'
                }}
              />
            </div>

            {deliveryMode === 'pickup' ? (
              <div style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '8px',
                padding: '14px 16px',
                marginBottom: '14px'
              }}>
                <div style={{ fontWeight: '800', color: '#92400E', fontSize: '14px', marginBottom: '4px' }}>
                  🏪 Store Pickup Address (Without Delivery):
                </div>
                <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.5 }}>
                  Shop 12-14, Shivalik Plaza, Near IIM Ahmedabad, Vastrapur, Ahmedabad, Gujarat 380015
                </div>
                <div style={{ fontSize: '12px', color: '#B45309', fontWeight: '700', marginTop: '6px' }}>
                  ⚡ Your order will be packed in 15 mins. A 4-digit pickup OTP code will be shown on screen!
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#555', marginBottom: '4px' }}>Delivery Address (With Doorstep Delivery)</label>
                <textarea
                  placeholder="Delivery Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid #E2DCD2',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#555', marginBottom: '4px' }}>
                {deliveryMode === 'pickup' ? 'Pickup Timing' : 'Preferred Delivery Time'}
              </label>
              <select
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid #E2DCD2',
                  fontSize: '14px'
                }}
              >
                {deliveryMode === 'pickup' ? (
                  <>
                    <option value="Ready in 15 mins (Counter Pickup)">Ready in 15 mins (Counter Pickup)</option>
                    <option value="Today Evening (5pm – 7pm)">Today Evening (5pm – 7pm)</option>
                    <option value="Tomorrow Morning (9am – 11am)">Tomorrow Morning (9am – 11am)</option>
                  </>
                ) : (
                  <>
                    <option value="Morning (8am – 12pm)">Morning (8am – 12pm)</option>
                    <option value="Afternoon (12pm – 4pm)">Afternoon (12pm – 4pm)</option>
                    <option value="Evening (4pm – 8pm)">Evening (4pm – 8pm)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Section 2: Payment Gateway Selection (Amazon/Flipkart/Zomato style) */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            border: '1px solid #ECE7DE'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  backgroundColor: '#EA580C',
                  color: 'white',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '800'
                }}>
                  2
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#164E2A', margin: 0 }}>
                  Select Payment Method
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#15803D', fontWeight: '700' }}>
                <ShieldCheck size={16} />
                100% Safe & Secure
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Option 1: UPI (Google Pay, Paytm, PhonePe) */}
              <div style={{
                borderRadius: '10px',
                border: paymentMethod === 'UPI' ? '2px solid #164E2A' : '1px solid #E2DCD2',
                backgroundColor: paymentMethod === 'UPI' ? '#F7FAF7' : '#FFFFFF',
                overflow: 'hidden',
                transition: 'all 0.2s'
              }}>
                <div
                  onClick={() => setPaymentMethod('UPI')}
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="radio"
                      name="payment_choice"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                      style={{ accentColor: '#164E2A', width: '18px', height: '18px' }}
                    />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#1C1917', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>UPI (Google Pay, Paytm, PhonePe, BHIM)</span>
                        <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                          Instant • 0 Fee
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        Pay directly from your bank via UPI QR or UPI ID
                      </div>
                    </div>
                  </div>
                  <Smartphone size={22} color={paymentMethod === 'UPI' ? '#164E2A' : '#888'} />
                </div>

                {paymentMethod === 'UPI' && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid #E8E2D6', paddingTop: '14px' }}>
                    {/* App Picker Chips */}
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px' }}>Choose UPI App:</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
                      {[
                        { name: 'Google Pay', icon: '🟢', bg: '#E8F0FE', border: '#4285F4' },
                        { name: 'Paytm', icon: '🔵', bg: '#E1F5FE', border: '#00BAF2' },
                        { name: 'PhonePe', icon: '🟣', bg: '#F3E5F5', border: '#6739B7' },
                        { name: 'BHIM', icon: '🟠', bg: '#FFF3E0', border: '#FB8C00' }
                      ].map((app) => (
                        <div
                          key={app.name}
                          onClick={() => setUpiProvider(app.name)}
                          style={{
                            padding: '8px',
                            textAlign: 'center',
                            borderRadius: '8px',
                            border: upiProvider === app.name ? `2px solid ${app.border}` : '1px solid #E2DCD2',
                            backgroundColor: upiProvider === app.name ? app.bg : 'white',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}
                        >
                          <div style={{ fontSize: '16px' }}>{app.icon}</div>
                          <div>{app.name}</div>
                        </div>
                      ))}
                    </div>

                    {/* Mode selector: UPI ID vs QR Code */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setUpiMode('id')}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: upiMode === 'id' ? '2px solid #164E2A' : '1px solid #D8D2C6',
                          backgroundColor: upiMode === 'id' ? '#164E2A' : 'white',
                          color: upiMode === 'id' ? 'white' : '#444',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Enter UPI ID
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiMode('qr')}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: upiMode === 'qr' ? '2px solid #164E2A' : '1px solid #D8D2C6',
                          backgroundColor: upiMode === 'qr' ? '#164E2A' : 'white',
                          color: upiMode === 'qr' ? 'white' : '#444',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <QrCode size={14} /> Scan UPI QR
                      </button>
                    </div>

                    {upiMode === 'id' ? (
                      <div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="e.g. mobile@paytm or name@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '10px 14px',
                              borderRadius: '6px',
                              border: '1px solid #D8D2C6',
                              fontSize: '13px'
                            }}
                          />
                          <span style={{
                            backgroundColor: '#DCFCE7',
                            color: '#15803D',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '800',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            ✓ Verified
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
                          Accepts @okhdfcbank, @oksbi, @okaxis, @paytm, @ybl, etc.
                        </div>
                      </div>
                    ) : (
                      /* QR Code View */
                      <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E2DCD2' }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '12px',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          border: '2px solid #164E2A'
                        }}>
                          {/* SVG Mock QR Code with SwadBox logo in center */}
                          <svg width="130" height="130" viewBox="0 0 100 100">
                            {/* QR Outer Corners */}
                            <rect x="5" y="5" width="26" height="26" fill="black" />
                            <rect x="9" y="9" width="18" height="18" fill="white" />
                            <rect x="13" y="13" width="10" height="10" fill="black" />

                            <rect x="69" y="5" width="26" height="26" fill="black" />
                            <rect x="73" y="9" width="18" height="18" fill="white" />
                            <rect x="77" y="13" width="10" height="10" fill="black" />

                            <rect x="5" y="69" width="26" height="26" fill="black" />
                            <rect x="9" y="73" width="18" height="18" fill="white" />
                            <rect x="13" y="77" width="10" height="10" fill="black" />

                            {/* Data grid patterns */}
                            <rect x="36" y="8" width="5" height="18" fill="black" />
                            <rect x="44" y="14" width="18" height="5" fill="black" />
                            <rect x="8" y="36" width="18" height="5" fill="black" />
                            <rect x="14" y="44" width="5" height="18" fill="black" />
                            <rect x="36" y="36" width="28" height="28" fill="#EA580C" rx="4" />
                            <text x="50" y="53" textAnchor="middle" fill="white" fontSize="9" fontWeight="800">SWAD</text>

                            <rect x="68" y="38" width="6" height="18" fill="black" />
                            <rect x="78" y="44" width="14" height="6" fill="black" />
                            <rect x="38" y="68" width="16" height="6" fill="black" />
                            <rect x="42" y="78" width="6" height="16" fill="black" />
                            <rect x="68" y="68" width="26" height="26" fill="black" />
                            <rect x="74" y="74" width="14" height="14" fill="white" />
                            <rect x="78" y="78" width="6" height="6" fill="black" />
                          </svg>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#164E2A', marginTop: '6px' }}>
                          Scan & Pay ₹{total.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                          Open Google Pay, Paytm, or PhonePe and scan this QR code
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Option 2: Credit / Debit Card */}
              <div style={{
                borderRadius: '10px',
                border: paymentMethod === 'CARD' ? '2px solid #164E2A' : '1px solid #E2DCD2',
                backgroundColor: paymentMethod === 'CARD' ? '#F7FAF7' : '#FFFFFF',
                overflow: 'hidden',
                transition: 'all 0.2s'
              }}>
                <div
                  onClick={() => setPaymentMethod('CARD')}
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="radio"
                      name="payment_choice"
                      checked={paymentMethod === 'CARD'}
                      onChange={() => setPaymentMethod('CARD')}
                      style={{ accentColor: '#164E2A', width: '18px', height: '18px' }}
                    />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#1C1917' }}>
                        Credit or Debit Card (Visa, Mastercard, RuPay)
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        All major Indian & International debit/credit cards accepted
                      </div>
                    </div>
                  </div>
                  <CreditCard size={22} color={paymentMethod === 'CARD' ? '#164E2A' : '#888'} />
                </div>

                {paymentMethod === 'CARD' && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid #E8E2D6', paddingTop: '14px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#444' }}>Card Number</label>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#164E2A' }}>{getCardBrand()}</span>
                      </div>
                      <input
                        type="text"
                        placeholder="XXXX XXXX XXXX XXXX"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          border: '1px solid #D8D2C6',
                          fontSize: '14px',
                          letterSpacing: '1px',
                          fontWeight: '600'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '4px' }}>Cardholder Name</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Name on card"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #D8D2C6',
                            fontSize: '13px'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '4px' }}>Expires</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #D8D2C6',
                            fontSize: '13px'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '4px' }}>CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #D8D2C6',
                            fontSize: '13px'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 3: Net Banking */}
              <div style={{
                borderRadius: '10px',
                border: paymentMethod === 'NETBANKING' ? '2px solid #164E2A' : '1px solid #E2DCD2',
                backgroundColor: paymentMethod === 'NETBANKING' ? '#F7FAF7' : '#FFFFFF',
                overflow: 'hidden'
              }}>
                <div
                  onClick={() => setPaymentMethod('NETBANKING')}
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="radio"
                      name="payment_choice"
                      checked={paymentMethod === 'NETBANKING'}
                      onChange={() => setPaymentMethod('NETBANKING')}
                      style={{ accentColor: '#164E2A', width: '18px', height: '18px' }}
                    />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#1C1917' }}>
                        Net Banking
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        All Indian banks (HDFC, ICICI, SBI, Axis, Kotak, etc.)
                      </div>
                    </div>
                  </div>
                  <Building size={22} color={paymentMethod === 'NETBANKING' ? '#164E2A' : '#888'} />
                </div>

                {paymentMethod === 'NETBANKING' && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid #E8E2D6', paddingTop: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
                      {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak', 'Bank of Baroda'].map((bank) => (
                        <div
                          key={bank}
                          onClick={() => setSelectedBank(bank)}
                          style={{
                            padding: '8px',
                            textAlign: 'center',
                            borderRadius: '6px',
                            border: selectedBank === bank ? '2px solid #164E2A' : '1px solid #E2DCD2',
                            backgroundColor: selectedBank === bank ? '#EBF5EE' : 'white',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          🏦 {bank}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Option 4: Wallets */}
              <div style={{
                borderRadius: '10px',
                border: paymentMethod === 'WALLET' ? '2px solid #164E2A' : '1px solid #E2DCD2',
                backgroundColor: paymentMethod === 'WALLET' ? '#F7FAF7' : '#FFFFFF',
                overflow: 'hidden'
              }}>
                <div
                  onClick={() => setPaymentMethod('WALLET')}
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="radio"
                      name="payment_choice"
                      checked={paymentMethod === 'WALLET'}
                      onChange={() => setPaymentMethod('WALLET')}
                      style={{ accentColor: '#164E2A', width: '18px', height: '18px' }}
                    />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#1C1917' }}>
                        Wallets (Paytm Wallet, Amazon Pay, Mobikwik)
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        Fast 1-click checkout with existing balance
                      </div>
                    </div>
                  </div>
                  <Wallet size={22} color={paymentMethod === 'WALLET' ? '#164E2A' : '#888'} />
                </div>

                {paymentMethod === 'WALLET' && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid #E8E2D6', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {['Paytm Wallet', 'Amazon Pay', 'PhonePe Wallet'].map((w) => (
                        <div
                          key={w}
                          onClick={() => setSelectedWallet(w)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            textAlign: 'center',
                            borderRadius: '6px',
                            border: selectedWallet === w ? '2px solid #164E2A' : '1px solid #E2DCD2',
                            backgroundColor: selectedWallet === w ? '#EBF5EE' : 'white',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          👛 {w}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Option 5: Cash on Delivery */}
              <div style={{
                borderRadius: '10px',
                border: paymentMethod === 'COD' ? '2px solid #164E2A' : '1px solid #E2DCD2',
                backgroundColor: paymentMethod === 'COD' ? '#F7FAF7' : '#FFFFFF',
                overflow: 'hidden'
              }}>
                <div
                  onClick={() => setPaymentMethod('COD')}
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="radio"
                      name="payment_choice"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      style={{ accentColor: '#164E2A', width: '18px', height: '18px' }}
                    />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#1C1917', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{deliveryMode === 'pickup' ? 'Pay at Store Counter (Cash / UPI)' : 'Cash on Delivery (COD)'}</span>
                        <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                          Payment Pending (Pay on Arrival)
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        {deliveryMode === 'pickup'
                          ? 'Order is placed immediately. Pay at counter via cash or UPI QR when collecting your snacks.'
                          : 'Order is placed immediately. Pay with cash or UPI QR to delivery rider upon arrival.'}
                      </div>
                    </div>
                  </div>
                  <Banknote size={22} color={paymentMethod === 'COD' ? '#164E2A' : '#888'} />
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <div style={{ marginTop: '24px' }}>
              <button
                type="button"
                onClick={handlePlaceOrderWithPayment}
                className="btn-gradient"
                disabled={isProcessingPayment}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isProcessingPayment ? (
                  <>
                    <RefreshCw size={18} className="spin" />
                    {paymentMethod === 'COD' ? 'Confirming Order...' : 'Processing Payment...'}
                  </>
                ) : paymentMethod === 'COD' ? (
                  <>
                    <Banknote size={18} />
                    Place Order (Pay ₹{total.toFixed(2)} on {deliveryMode === 'pickup' ? 'Pickup' : 'Delivery'}) →
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Pay ₹{total.toFixed(2)} & Place Order →
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Breakdown */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          border: '1px solid #ECE7DE',
          position: 'sticky',
          top: '20px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#164E2A', marginBottom: '20px' }}>
            Order Summary ({cart.length} items)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            {cart.map((item) => (
              <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #EEE' }}
                    />
                  )}
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#222' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#777' }}>Qty: {item.quantity} • {item.weight || '500 g'}</div>
                  </div>
                </div>
                <div style={{ fontWeight: '700', color: '#1C1917', fontSize: '14px' }}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div style={{ borderTop: '1px solid #F0ECE4', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
              <span>Item Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
              <span>Delivery Partner Fee</span>
              <span style={{ color: '#15803D', fontWeight: '700' }}>
                <s style={{ color: '#999', marginRight: '4px' }}>₹40</s> FREE
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
              <span>Packaging & Taxes</span>
              <span>₹0.00</span>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #F0ECE4',
            marginTop: '16px',
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#1C1917' }}>Total Amount</span>
            <span style={{ fontSize: '22px', fontWeight: '900', color: '#EA580C' }}>
              ₹{total.toFixed(2)}
            </span>
          </div>

          {/* Trust Guarantees */}
          <div style={{
            marginTop: '20px',
            padding: '14px',
            borderRadius: '8px',
            backgroundColor: '#FAF7F2',
            fontSize: '12px',
            color: '#555',
            lineHeight: 1.5,
            border: '1px solid #EFEAE1'
          }}>
            <div style={{ fontWeight: '700', color: '#164E2A', marginBottom: '4px' }}>
              🛵 Live Tracking Guaranteed
            </div>
            Once your payment is authorized, you'll be redirected instantly to watch your delivery rider on the live GPS map!
          </div>
        </div>
      </div>

      {/* Simulated Authentic Payment Gateway Modal */}
      {isProcessingPayment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '36px',
            width: '90%',
            maxWidth: '440px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            {paymentStep === 1 && (
              <>
                <RefreshCw size={44} className="spin" color="#164E2A" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#164E2A', marginBottom: '8px' }}>
                  Connecting to Bank Gateway...
                </h3>
                <p style={{ fontSize: '13px', color: '#666' }}>
                  Secure 256-bit SSL handshake with {paymentMethod === 'UPI' ? upiProvider : paymentMethod}...
                </p>
              </>
            )}

            {paymentStep === 2 && (
              <>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#FFEDD5',
                  color: '#EA580C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  🛡️
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#164E2A', marginBottom: '8px' }}>
                  Authorizing Payment of ₹{total.toFixed(2)}
                </h3>
                <p style={{ fontSize: '13px', color: '#666' }}>
                  Please do not refresh or close this window while we verify your transaction with {upiProvider || 'bank'}.
                </p>
              </>
            )}

            {paymentStep === 3 && (
              <>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  color: '#15803D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '28px'
                }}>
                  ✓
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#15803D', marginBottom: '6px' }}>
                  Payment Authorized!
                </h3>
                <div style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>
                  Transaction ID: <strong>{paymentTxnId}</strong>
                </div>
                <div style={{
                  backgroundColor: '#F3EFE9',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#164E2A',
                  fontWeight: '700'
                }}>
                  🛵 Launching Live GPS Delivery Tracking...
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
