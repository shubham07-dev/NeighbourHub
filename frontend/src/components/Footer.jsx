import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-grid">

          {/* Brand Column */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-logo" onClick={() => window.scrollTo(0, 0)}>
              <Home size={22} color="var(--accent)" />
              <span>NeighbourHub</span>
            </Link>
            <p className="footer-desc">
              Your trusted platform connecting you with verified neighborhood professionals. Fast, reliable, and just around the corner.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Twitter" className="social-btn">
                <Twitter size={18} />
              </a>
              <a href="#" aria-label="Facebook" className="social-btn">
                <Facebook size={18} />
              </a>
              <a href="#" aria-label="Instagram" className="social-btn">
                <Instagram size={18} />
              </a>
              <a 
                href="https://www.linkedin.com/in/ujjwal-srivastava-844034328/" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="LinkedIn" 
                className="social-btn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/" onClick={() => window.scrollTo(0, 0)}>Home</Link></li>
              <li><Link to="/login" onClick={() => window.scrollTo(0, 0)}>Sign In</Link></li>
              <li><Link to="/register" onClick={() => window.scrollTo(0, 0)}>Become a Provider</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><Link to="/help" onClick={() => window.scrollTo(0, 0)}>Help Center</Link></li>
              <li><Link to="/help" onClick={() => window.scrollTo(0, 0)}>Safety Information</Link></li>
              <li><Link to="/help" onClick={() => window.scrollTo(0, 0)}>Submit a Ticket</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>Contact Us</h4>
            <ul className="footer-contact">
              <li><MapPin size={16} className="contact-icon" /> <span>BBD College,<br />Tech City, Lucknow</span></li>
              <li><Phone size={16} className="contact-icon" /> <span>+91 8303201079</span></li>
              <li><Mail size={16} className="contact-icon" /> <span>alphacoders@gmail.com</span></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} NeighbourHub. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/help" onClick={() => window.scrollTo(0, 0)}>Privacy Policy</Link>
            <span className="dot">•</span>
            <Link to="/help" onClick={() => window.scrollTo(0, 0)}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
