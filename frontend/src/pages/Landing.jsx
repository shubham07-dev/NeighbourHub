import { Link } from 'react-router-dom';

const Landing = () => (
  <>
    <section className="landing-hero">
      <div className="hero-content">
        <h1>Your Neighbourhood<br />Services, On Demand</h1>
        <p>Connect with trusted local plumbers, electricians, tutors, and delivery agents in minutes. Just like ordering food — but for home services.</p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary" style={{padding:'0.8rem 2rem',fontSize:'1rem'}}>Get Started Free</Link>
          <Link to="/login" className="btn btn-secondary" style={{padding:'0.8rem 2rem',fontSize:'1rem'}}>Sign In</Link>
        </div>
      </div>
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
  </>
);

export default Landing;
