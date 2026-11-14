import React, { useEffect, useState } from 'react';
import { Bike, Navigation, CreditCard, Smartphone, Check, Copy, Store, Clock, Lock, RefreshCw } from 'lucide-react';

export default function Orders({ user, navigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Online payment modal for unpaid / COD orders
  const [payingOrder, setPayingOrder] = useState(null);
  const [payingMethod, setPayingMethod] = useState('Google Pay');
  const [isProcessingPay, setIsProcessingPay] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const email = user?.email || 'kahanshah5676@gmail.com';
      const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).toLowerCase();
    } catch {
      return dateStr;
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePayOnlineSubmit = async () => {
    if (!payingOrder) return;
    setIsProcessingPay(true);
    try {
      const res = await fetch(`/api/orders/${payingOrder.id}/pay-online`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: 'UPI',
          provider: payingMethod,
          upi_id: 'kahanshah@okhdfcbank'
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Update local orders list
        setOrders((prev) =>
          prev.map((o) =>
            o.id === payingOrder.id
              ? {
                  ...o,
                  payment_status: 'Paid',
                  payment_method: data.payment_method,
                  transaction_id: data.transaction_id
                }
              : o
          )
        );
        setPayingOrder(null);
      } else {
        alert(data.detail || 'Payment failed');
      }
    } catch (err) {
      alert('Error processing payment: ' + err.message);
    } finally {
      setIsProcessingPay(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '850px', margin: '40px auto', padding: '0 24px', textAlign: 'center' }}>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ maxWidth: '850px', margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>No orders yet</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>You haven't placed any orders yet.</p>
        <button className="btn-primary" onClick={() => navigate('/products')}>
          Start Shopping →
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px', margin: '40px auto 80px', padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--brand-maroon)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Account
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#164E2A', margin: '2px 0 0' }}>
            My Orders 📦
          </h1>
        </div>

        <button
          onClick={() => navigate('/track')}
          style={{
            backgroundColor: '#164E2A',
            color: 'white',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Bike size={16} />
          Track Current Delivery 🛵
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {orders.map((order) => {
          const isPickup = order.delivery_mode === 'pickup';
          const isPaid = order.payment_status === 'Paid';

          return (
            <div
              key={order.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '14px',
                padding: '28px 32px',
                border: '1px solid #ECE7DE',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}
            >
              {/* Header: Order ID, Mode Badge & Status */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingBottom: '18px',
                borderBottom: '1px solid #F0ECE4',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', fontWeight: '700', letterSpacing: '0.5px' }}>
                      ORDER ID
                    </span>

                    {/* Mode badge: With Delivery vs Without Delivery */}
                    <span style={{
                      backgroundColor: isPickup ? '#FEF3C7' : '#F0FDF4',
                      color: isPickup ? '#92400E' : '#166534',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {isPickup ? <Store size={12} /> : <Bike size={12} />}
                      {isPickup ? 'Without Delivery (Store Pickup)' : 'With Delivery (Doorstep)'}
                    </span>
                  </div>

                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#164E2A' }}>
                    {order.id}
                  </div>
                  <div style={{ fontSize: '13px', color: '#777' }}>
                    {formatDate(order.created_at)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {/* Track Button */}
                  <button
                    onClick={() => navigate(`/track?orderId=${order.id}`)}
                    style={{
                      backgroundColor: '#EA580C',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)'
                    }}
                  >
                    <Navigation size={14} />
                    {isPickup ? 'View Store Pickup Pass 🏪' : 'Track Live Delivery 🛵'}
                  </button>

                  <div style={{
                    backgroundColor: order.status === 'Delivered' ? '#DCFCE7' : '#FFEDD5',
                    color: order.status === 'Delivered' ? '#15803D' : '#C2410C',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}>
                    {order.delivery_status || order.status || 'Placed'}
                  </div>
                </div>
              </div>

              {/* Store Pickup Pass Callout if Pickup */}
              {isPickup && (
                <div style={{
                  backgroundColor: '#FFFBEB',
                  border: '1px dashed #F59E0B',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  margin: '14px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Store size={18} color="#92400E" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#92400E' }}>
                        Store Pickup: Shop 12-14, Shivalik Plaza, Vastrapur, Ahmedabad
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        Ready for pickup in 15 mins. Show your 4-digit OTP at counter.
                      </div>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#B45309',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '900',
                    letterSpacing: '1px'
                  }}>
                    OTP: {order.pickup_otp || '8492'}
                  </div>
                </div>
              )}

              {/* Payment Info Banner */}
              <div style={{
                padding: '14px 16px',
                backgroundColor: '#FAF7F2',
                borderRadius: '8px',
                margin: '14px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '13px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: '700', color: '#164E2A' }}>Payment:</span>
                  <span style={{ color: '#333' }}>{order.payment_method || 'Google Pay (UPI)'}</span>

                  {/* Payment Done vs Payment Pending Badge */}
                  {isPaid ? (
                    <span style={{
                      backgroundColor: '#DCFCE7',
                      color: '#15803D',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '800'
                    }}>
                      ✓ Payment Done (Paid)
                    </span>
                  ) : (
                    <span style={{
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '800'
                    }}>
                      ⏳ Payment Pending (COD)
                    </span>
                  )}
                </div>

                {/* If Unpaid / COD, provide "Pay Online Now" button */}
                {!isPaid && (
                  <button
                    onClick={() => setPayingOrder(order)}
                    style={{
                      backgroundColor: '#164E2A',
                      color: 'white',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    💳 Pay ₹{order.total_amount.toFixed(2)} Online Now
                  </button>
                )}

                {order.transaction_id && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '12px' }}>
                    <span>Txn:</span>
                    <span
                      onClick={() => copyToClipboard(order.transaction_id, order.id)}
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
                      {order.transaction_id}
                      {copiedId === order.id ? <Check size={12} color="#15803D" /> : <Copy size={12} />}
                    </span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div style={{ padding: '16px 0', borderBottom: '1px solid #F0ECE4' }}>
                {order.items &&
                  order.items.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: idx < order.items.length - 1 ? '14px' : '0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#1C1917' }}>
                          {item.name}
                        </span>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#1C1917' }}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#777', marginTop: '2px' }}>
                        Qty: {item.quantity} • {item.weight || '500 g'}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Delivery Details */}
              <div style={{ padding: '16px 0', borderBottom: '1px solid #F0ECE4', fontSize: '14px', color: '#444' }}>
                <div style={{ fontWeight: '800', color: '#164E2A', marginBottom: '6px' }}>
                  {isPickup ? 'Pickup details' : 'Delivery details'}
                </div>
                <div style={{ lineHeight: 1.6 }}>
                  <div>{order.customer_name}</div>
                  <div>{order.phone}</div>
                  <div>{order.delivery_address}</div>
                  <div>Preferred time: {order.preferred_time}</div>
                </div>
              </div>

              {/* Total */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px'
              }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#1C1917' }}>Order Total</span>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#EA580C' }}>
                  ₹{order.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pay Online Modal for Unpaid Orders */}
      {payingOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '420px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#164E2A', marginBottom: '8px' }}>
              Complete Payment Online 💳
            </h2>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>
              Order #{payingOrder.id.slice(0, 10)}... • Total: <strong>₹{payingOrder.total_amount.toFixed(2)}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {['Google Pay', 'Paytm', 'PhonePe', 'Credit/Debit Card'].map((method) => (
                <div
                  key={method}
                  onClick={() => setPayingMethod(method)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: payingMethod === method ? '2px solid #164E2A' : '1px solid #D8D2C6',
                    backgroundColor: payingMethod === method ? '#F0FDF4' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    fontWeight: '700'
                  }}
                >
                  <input
                    type="radio"
                    name="pay_online_choice"
                    checked={payingMethod === method}
                    onChange={() => setPayingMethod(method)}
                    style={{ accentColor: '#164E2A' }}
                  />
                  <span>{method}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setPayingOrder(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #D8D2C6',
                  backgroundColor: 'white',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePayOnlineSubmit}
                disabled={isProcessingPay}
                className="btn-gradient"
                style={{
                  flex: 1.5,
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {isProcessingPay ? <RefreshCw size={16} className="spin" /> : <Lock size={14} />}
                Pay ₹{payingOrder.total_amount.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
