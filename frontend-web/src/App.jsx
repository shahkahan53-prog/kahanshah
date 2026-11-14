import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import TrackOrder from './pages/TrackOrder';
import PaymentOptions from './pages/PaymentOptions';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('swadbox_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('swadbox_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [products, setProducts] = useState([]);
  const [cacheInfo, setCacheInfo] = useState({ status: 'HIT', isHit: true, timeMs: 1 });
  const [toastMessage, setToastMessage] = useState(null);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('swadbox_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('swadbox_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('swadbox_user');
    }
  }, [user]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const t0 = performance.now();
      const res = await fetch('/api/products');
      const t1 = performance.now();
      const headerCache = res.headers.get('X-Cache') || 'HIT';
      const timeMs = Math.max(1, Math.round(t1 - t0));
      setCacheInfo({
        status: headerCache,
        isHit: headerCache === 'HIT',
        timeMs
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.warn('Backend not reached yet, using default products list:', e);
      setProducts([
        { id: 1, name: 'mathi khakhar', price: 100.0, weight: '500 g', category: 'khakara', stock: 20, image_url: '/mathi_khakhar.jpg' },
        { id: 2, name: 'Masala khakhara', price: 100.0, weight: '500 g', category: 'khakara', stock: 25, image_url: '/masala_khakhara.jpg' },
        { id: 3, name: 'Plain Khakhara', price: 90.0, weight: '500 g', category: 'khakara', stock: 20, image_url: '/plain_khakhara.jpg' },
        { id: 4, name: 'Jeera Khakhara', price: 100.0, weight: '500 g', category: 'khakara', stock: 20, image_url: '/jeera_khakhara.jpg' },
        { id: 5, name: 'Methi Masala Khakhara', price: 110.0, weight: '500 g', category: 'khakara', stock: 15, image_url: '/methi_masala.jpg' },
        { id: 6, name: 'Bhavnagari Gathiya', price: 120.0, weight: '500 g', category: 'namkeen', stock: 20, image_url: '/bhavnagari_gathiya.jpg' },
        { id: 7, name: 'Ratlami Sev', price: 110.0, weight: '500 g', category: 'namkeen', stock: 30, image_url: '/ratlami_sev.jpg' },
        { id: 8, name: 'Chorafali', price: 130.0, weight: '400 g', category: 'namkeen', stock: 18, image_url: '/chorafali.jpg' },
        { id: 9, name: 'Tikha Meetha Mix', price: 100.0, weight: '500 g', category: 'namkeen', stock: 25, image_url: '/tikha_meetha_mix.jpg' },
        { id: 10, name: 'Crispy Banana Chips', price: 120.0, weight: '400 g', category: 'namkeen', stock: 20, image_url: '/banana_chips.jpg' },
        { id: 11, name: 'Kaju Katli', price: 350.0, weight: '400 g', category: 'sweets', stock: 15, image_url: '/kaju_katli.jpg' },
        { id: 12, name: 'Besan Ladoo', price: 180.0, weight: '500 g', category: 'sweets', stock: 20, image_url: '/besan_ladoo.jpg' },
        { id: 13, name: 'Gulab Jamun', price: 160.0, weight: '500 g', category: 'sweets', stock: 20, image_url: '/gulab_jamun.jpg' },
        { id: 14, name: 'Mohan Thal', price: 220.0, weight: '500 g', category: 'sweets', stock: 15, image_url: '/mohan_thal.jpg' },
        { id: 15, name: 'Dry Fruit Halwa', price: 280.0, weight: '400 g', category: 'sweets', stock: 15, image_url: '/dry_fruit_halwa.jpg' }
      ]);
    }
  };

  const invalidateCache = async () => {
    try {
      await fetch('/admin/cache/clear', { method: 'POST' });
      showToast('Redis Cache Invalidated! Refreshing menu from DB...');
      await fetchProducts();
    } catch (e) {
      console.warn('Failed to clear cache:', e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const navigate = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [
          ...prev,
          {
            product_id: product.id,
            name: product.name,
            price: product.price,
            weight: product.weight,
            image_url: product.image_url,
            quantity: 1
          }
        ];
      }
    });
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.product_id === productId ? { ...i, quantity: newQty } : i))
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Router view selector
  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <Home navigate={navigate} />;
      case '/products':
      case '/shop':
        return (
          <Products
            products={products}
            user={user}
            addToCart={addToCart}
            showToast={showToast}
            cacheInfo={cacheInfo}
            invalidateCache={invalidateCache}
            refreshProducts={fetchProducts}
          />
        );
      case '/cart':
        return (
          <Cart
            cart={cart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            navigate={navigate}
          />
        );
      case '/checkout':
        return (
          <Checkout
            cart={cart}
            user={user}
            clearCart={clearCart}
            refreshProducts={fetchProducts}
            navigate={navigate}
          />
        );
      case '/orders':
        return <Orders user={user} navigate={navigate} />;
      case '/track':
        return <TrackOrder user={user} navigate={navigate} />;
      case '/payments':
        return <PaymentOptions navigate={navigate} />;
      case '/login':
        return <Login onLoginSuccess={(u) => setUser(u)} navigate={navigate} />;
      case '/register':
        return <Register onLoginSuccess={(u) => setUser(u)} navigate={navigate} />;
      case '/about':
        return <About navigate={navigate} />;
      case '/contact':
        return <Contact />;
      default:
        return <Home navigate={navigate} />;
    }
  };

  return (
    <>
      <Navbar
        currentPath={currentPath}
        navigate={navigate}
        user={user}
        onLogout={handleLogout}
        cartCount={cartTotalCount}
      />

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      <main>{renderPage()}</main>

      <Footer navigate={navigate} />
    </>
  );
}

