import { Link } from 'react-router-dom';

const Landing = () => (
  <>
    {/* Hero Section */}
    <section className="landing-hero">
      <div className="hero-constellation" />
      <div className="hero-content">
        <h1>
          Connecting Your <span className="text-gradient">Community.</span>
          <br />
          Services, <span className="text-gradient">Your Way.</span>
        </h1>
        <p className="hero-subtitle">
          Connect with trusted local plumbers, electricians, tutors, and delivery
          agents in minutes. Just like ordering food — but for home services.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-cta-primary">
            Get Started Free ✨
          </Link>
          <Link to="/login" className="btn btn-cta-secondary">
            🔍 Explore Services
          </Link>
        </div>
      </div>
      <div className="hero-floating-house">🏠</div>
    </section>

    {/* How It Works Section */}
    <section className="how-it-works-section">
      <h2 className="section-heading">Simplicity in Motion: How It Works</h2>
      <p className="section-subheading">
        Three simple steps to get the help you need, right at your doorstep.
      </p>
      <div className="hiw-cards">
        <div className="hiw-card">
          <div className="hiw-card-img">
            <img src="/card_define_range.png" alt="Define Your Range" />
          </div>
          <h3>Define Your Range.</h3>
          <p>Set your specific area. We identify vetted local providers instantly.</p>
        </div>
        <div className="hiw-card">
          <div className="hiw-card-img">
            <img src="/card_explore_reserve.png" alt="Explore & Reserve" />
          </div>
          <h3>Explore &amp; Reserve.</h3>
          <p>Compare profiles, transparent pricing, and ratings. Book with full confidence.</p>
        </div>
        <div className="hiw-card">
          <div className="hiw-card-img">
            <img src="/card_build_trust.png" alt="Build Local Trust" />
          </div>
          <h3>Build Local Trust.</h3>
          <p>Share honest feedback after the job is done. Help build a better community.</p>
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
