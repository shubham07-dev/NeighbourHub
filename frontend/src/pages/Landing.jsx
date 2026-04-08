import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Search, Star, ArrowRight, ShieldCheck } from 'lucide-react';

const Landing = () => (
  <>
    <section className="landing-hero">
      <div className="hero-content">
        <h1>Your Neighbourhood<br />Services, On Demand</h1>
        <p>Connect with trusted local plumbers, electricians, tutors, and delivery agents in minutes. Just like ordering food — but for home services.</p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>Get Started Free</Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>Sign In</Link>
        </div>
      </div>
      <div className="hero-floating-house">🏠</div>
    </section>

    <section className="features-section">
      <h2>How It Works</h2>
      <div className="grid grid-3">
        <div className="card feature-card">
          <div className="feature-icon">📍</div>
          <h3>Share Your Location</h3>
          <p>Allow location access and we'll find service providers near you instantly.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Browse & Book</h3>
          <p>Filter by service type, compare ratings and pricing, then book with one click.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">⭐</div>
          <h3>Rate & Review</h3>
          <p>After the job is done, rate your experience to help your neighbours choose better.</p>
        </div>
      </div>
    </section>

    {/* Stats Section */}
    <section className="landing-stats">
      <div className="stat-item">
        <span className="stat-big">500+</span>
        <span className="stat-label-text">Verified Providers</span>
      </div>
      <div className="stat-item">
        <span className="stat-big">10K+</span>
        <span className="stat-label-text">Jobs Completed</span>
      </div>
      <div className="stat-item">
        <span className="stat-big">4.8⭐</span>
        <span className="stat-label-text">Avg. Rating</span>
      </div>
      <div className="stat-item">
        <span className="stat-big">50+</span>
        <span className="stat-label-text">Neighbourhoods</span>
      </div>
    </section>

    {/* CTA Section */}
    <section className="landing-cta">
      <h2>Ready to transform your neighbourhood experience?</h2>
      <p>Join thousands of happy customers and trusted providers today.</p>
      <Link to="/register" className="btn btn-cta-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
        Join NeighbourHub Now 🚀
      </Link>
    </section>
  </>
);

export default Landing;
