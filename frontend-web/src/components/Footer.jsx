import React from 'react';

export default function Footer({ navigate }) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo-card">
            <img src="/swadbox_logo.png" alt="SwadBox Logo" />
          </div>
          <p>Authentic Indian snacks and traditional flavours, delivered to your doorstep.</p>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <ul>
            <li onClick={() => navigate('/')}>Home</li>
            <li onClick={() => navigate('/products')}>Products</li>
            <li onClick={() => navigate('/track')}>Track Order</li>
            <li onClick={() => navigate('/payments')}>Payment Options</li>
            <li onClick={() => navigate('/about')}>About Us</li>
            <li onClick={() => navigate('/contact')}>Contact</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Customer Support</h4>
          <ul>
            <li>+91 34586 99738</li>
            <li>kahanshah5676@gmail.com</li>
            <li>Support hours: 8 AM – 8 PM</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Information</h4>
          <ul>
            <li>Privacy Policy</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div>© 2026 SwadBox. All rights reserved.</div>
        <div>Made with ❤️ in India</div>
      </div>
    </footer>
  );
}

