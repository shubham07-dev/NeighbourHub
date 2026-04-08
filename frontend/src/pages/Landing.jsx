import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Search, Star, ArrowRight, ShieldCheck } from 'lucide-react';

const Landing = () => (
  <>
    <section className="landing-hero" style={{ overflow: 'hidden', position: 'relative' }}>
      
      {/* Background Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, 90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(107, 76, 255, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }}
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }}
      />

      <div className="hero-content" style={{ position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="badge badge-service" style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(107, 76, 255, 0.3)', background: 'rgba(107, 76, 255, 0.1)', color: 'var(--accent-light)' }}>
            <ShieldCheck size={14} /> Startup Grade Services
          </span>
          <h1 style={{ background: 'linear-gradient(135deg, #fff 20%, #9d8bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Your Neighbourhood<br />Services, On Demand
          </h1>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          style={{ letterSpacing: '-0.01em' }}
        >
          Connect with trusted local plumbers, electricians, tutors, and delivery agents in seconds. Fast, reliable, and just around the corner.
        </motion.p>
        
        <motion.div 
          className="hero-actions"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
        >
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '1rem', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-glow)' }}>
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.9rem 2.2rem', fontSize: '1rem', borderRadius: 'var(--radius-pill)', backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.03)' }}>
            Sign In
          </Link>
        </motion.div>
      </div>
    </section>

    <section className="features-section" style={{ position: 'relative', zIndex: 10 }}>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        How It Works
      </motion.h2>
      
      <div className="grid grid-3">
        <motion.div 
          className="card feature-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          whileHover={{ y: -8, boxShadow: 'var(--shadow-glow)' }}
          style={{ background: 'linear-gradient(180deg, rgba(30,30,38,0.8) 0%, rgba(20,20,25,0.4) 100%)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)' }}
        >
          <div className="feature-icon" style={{ background: 'rgba(107, 76, 255, 0.1)', width: '64px', height: '64px', margin: '0 auto 1.5rem', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-light)' }}>
            <MapPin size={32} />
          </div>
          <h3>Share Your Location</h3>
          <p>Allow location access and we'll instantly match you with verified professionals in your exact area.</p>
        </motion.div>

        <motion.div 
          className="card feature-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ y: -8, boxShadow: 'var(--shadow-glow)' }}
          style={{ background: 'linear-gradient(180deg, rgba(30,30,38,0.8) 0%, rgba(20,20,25,0.4) 100%)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)' }}
        >
          <div className="feature-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', width: '64px', height: '64px', margin: '0 auto 1.5rem', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-pink)' }}>
            <Search size={32} />
          </div>
          <h3>Browse & Book</h3>
          <p>Filter by service type, compare transparent pricing, and book instantly with our dynamic Swiggy-like interface.</p>
        </motion.div>

        <motion.div 
          className="card feature-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ y: -8, boxShadow: 'var(--shadow-glow)' }}
          style={{ background: 'linear-gradient(180deg, rgba(30,30,38,0.8) 0%, rgba(20,20,25,0.4) 100%)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)' }}
        >
          <div className="feature-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', width: '64px', height: '64px', margin: '0 auto 1.5rem', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)' }}>
            <Star size={32} />
          </div>
          <h3>Rate & Review</h3>
          <p>Leave a review after your job is completed. Your ratings fuel our AI algorithms to recommend the best talent.</p>
        </motion.div>
      </div>
    </section>
  </>
);

export default Landing;
