import React, { useState } from 'react';

export default function Products({ products, user, addToCart, showToast, cacheInfo, invalidateCache, refreshProducts }) {
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [isClearing, setIsClearing] = useState(false);

  const categories = ['All Products', 'khakara', 'namkeen', 'sweets'];

  const filteredProducts = selectedCategory === 'All Products'
    ? products
    : products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleClearCache = async () => {
    setIsClearing(true);
    if (invalidateCache) {
      await invalidateCache();
    }
    setTimeout(() => setIsClearing(false), 500);
  };

  const handleAddToCart = (product) => {
    if (!user) {
      showToast('Please login first to order 🛒');
      return;
    }
    if (product.stock <= 0) {
      alert(`"${product.name}" is currently out of stock.`);
      return;
    }
    addToCart(product);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderBottom: '1px solid #ECE7DE',
        paddingBottom: '24px',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{
            fontSize: '12px',
            letterSpacing: '1.5px',
            fontWeight: '800',
            color: 'var(--brand-maroon)',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            Made For Your Cravings
          </div>
          <h1 style={{
            fontSize: '44px',
            fontWeight: '800',
            color: '#1C1917',
            marginBottom: '12px',
            letterSpacing: '-0.5px'
          }}>
            Find your favourites.
          </h1>
          <p style={{ fontSize: '15px', color: '#666', maxWidth: '600px' }}>
            Explore our collection of Indian sweets and namkeen. Pick your favourites and enjoy every bite.
          </p>
        </div>
        <div style={{ fontSize: '14px', color: '#777', fontWeight: '500' }}>
          {filteredProducts.length} products
        </div>
      </div>

      {/* Redis In-Memory Caching Status Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #ECE7DE',
        borderRadius: '12px',
        padding: '12px 20px',
        marginBottom: '28px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: cacheInfo?.isHit ? '#DCFCE7' : '#FEF3C7',
            color: cacheInfo?.isHit ? '#15803D' : '#92400E',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '700',
            border: `1px solid ${cacheInfo?.isHit ? '#86EFAC' : '#FDE68A'}`
          }}>
            <span>{cacheInfo?.isHit ? '⚡ REDIS CACHE HIT' : '🔄 REDIS CACHE MISS'}</span>
            <span style={{ fontSize: '11px', opacity: 0.85 }}>• {cacheInfo?.timeMs ?? 1}ms</span>
          </div>
          <span style={{ fontSize: '13px', color: '#555', fontWeight: '500' }}>
            {cacheInfo?.isHit 
              ? 'Menu served instantly from Redis in-memory cache (TTL: 5m)' 
              : 'Queried database and stored into Redis cache (TTL: 5m)'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={refreshProducts}
            title="Fetch menu again to see instant Cache HIT"
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              border: '1px solid #D1D5DB',
              backgroundColor: '#F9FAFB',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            Refetch ⟳
          </button>
          <button
            onClick={handleClearCache}
            disabled={isClearing}
            title="Invalidates Redis key 'menu:all' via POST /admin/cache/clear"
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              border: '1px solid #FCA5A5',
              backgroundColor: '#FEF2F2',
              color: '#B91C1C',
              cursor: isClearing ? 'not-allowed' : 'pointer'
            }}
          >
            {isClearing ? 'Evicting...' : 'Test Cache Eviction ⚡'}
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '800',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: '#333',
          marginBottom: '14px'
        }}>
          Browse Categories
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 20px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '600',
                border: '1px solid #E2DCD2',
                backgroundColor: selectedCategory.toLowerCase() === cat.toLowerCase() ? 'var(--brand-maroon)' : '#FFFFFF',
                color: selectedCategory.toLowerCase() === cat.toLowerCase() ? '#FFFFFF' : '#333333',
                textTransform: 'capitalize',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid - displays 15 products cleanly */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '24px'
      }}>
        {filteredProducts.map((p) => {
          const isOutOfStock = p.stock <= 0;
          return (
            <div
              key={p.id}
              style={{
                background: 'white',
                borderRadius: '6px',
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                border: '1px solid #EFEAE1',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Product Image */}
              <div style={{ position: 'relative', height: '200px', backgroundColor: '#F3EFE6' }}>
                <img
                  src={p.image_url}
                  alt={p.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                {isOutOfStock && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: '#1E293B',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Out of stock
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{
                  fontSize: '17px',
                  fontWeight: '700',
                  color: '#1C1917',
                  marginBottom: '14px',
                  textTransform: 'capitalize'
                }}>
                  {p.name}
                </h3>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '18px'
                }}>
                  <span style={{
                    fontSize: '22px',
                    fontWeight: '800',
                    color: 'var(--brand-maroon)'
                  }}>
                    ₹{Math.round(p.price)}
                  </span>
                  <span style={{ fontSize: '13px', color: '#888' }}>
                    {p.weight}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(p)}
                  disabled={isOutOfStock}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: isOutOfStock ? '#A8A29E' : 'var(--brand-maroon)',
                    color: 'white',
                    borderRadius: '4px',
                    fontWeight: '600',
                    fontSize: '14px',
                    marginTop: 'auto',
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
