import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import axios from 'axios';
import { Wrench, Zap, BookOpen, Truck, Sparkles, Hammer, Paintbrush, Home, MapPin, Search, Phone, Star, StarHalf } from 'lucide-react';

const SERVICE_CATEGORIES = [
  { name: 'Plumber', icon: <Wrench size={24} /> },
  { name: 'Electrician', icon: <Zap size={24} /> },
  { name: 'Tutor', icon: <BookOpen size={24} /> },
  { name: 'Delivery Agent', icon: <Truck size={24} /> },
  { name: 'House Cleaner', icon: <Sparkles size={24} /> },
  { name: 'Carpenter', icon: <Hammer size={24} /> },
  { name: 'Painter', icon: <Paintbrush size={24} /> },
];

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { location, areaName } = useLocation();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookingDesc, setBookingDesc] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [bookingProvider, setBookingProvider] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('offline');
  const [searched, setSearched] = useState(false);
  const [providerReviews, setProviderReviews] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Auto-fetch providers when location is available
  useEffect(() => {
    if (location) fetchProviders('All');
  }, [location]);

  const fetchProviders = async (serviceType) => {
    if (!location) return;
    setLoading(true);
    setActiveCategory(serviceType);
    try {
      const url = `/api/providers/nearby?lng=${location.lng}&lat=${location.lat}&distance=15&serviceType=${encodeURIComponent(serviceType)}`;
      const { data } = await axios.get(url);
      setProviders(data);
      setSearched(true);
    } catch (err) {
      console.error(err);
      // Fallback: fetch all providers if geo fails
      try {
        const { data } = await axios.get('/api/providers');
        const filtered = serviceType === 'All' ? data : data.filter(p => p.serviceType === serviceType);
        setProviders(filtered);
        setSearched(true);
      } catch { /* ignore */ }
    }
    finally { setLoading(false); }
  };

  const handleBook = async (providerId, basePrice) => {
    if (!bookingDesc.trim()) return alert('Please describe the work you need.');
    if (proposedPrice && Number(proposedPrice) < 100) return alert('Proposed price cannot be lower than ₹100');
    
    const finalAmount = proposedPrice ? Number(proposedPrice) : basePrice;

    try {
      if (location && location.lng && location.lat) {
        try {
          await axios.put('/api/users/profile', { lng: location.lng, lat: location.lat }, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
        } catch (locErr) {
          console.warn('Failed to save user location to profile:', locErr);
        }
      }

      if (paymentMethod === 'online') {
        const confirmPay = window.confirm(`[DEMO MODE] Secure Checkout Gateway\n\nAmount to pay: ₹${finalAmount}\n\nClick OK to simulate a successful payment.`);
        if (!confirmPay) return;

        // Give a tiny simulated network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Now create the actual Job natively
        await axios.post('/api/jobs', { 
          provider: providerId, 
          description: bookingDesc,
          proposedPrice: proposedPrice ? Number(proposedPrice) : undefined,
          paymentMethod: 'online',
          paymentStatus: 'paid',
          razorpayOrderId: 'order_demo_' + Date.now(),
          razorpayPaymentId: 'pay_demo_' + Date.now()
        }, { headers: { Authorization: `Bearer ${user.token}` }});
        
        alert(`Payment of ₹${finalAmount} Successful! Job request sent.`);
        setBookingProvider(null);
        setBookingDesc('');
        setProposedPrice('');
        setPaymentMethod('offline');
        navigate('/customer/jobs');
        return; // wait for response
      }

      // Offline flow
      await axios.post('/api/jobs', { 
        provider: providerId, 
        description: bookingDesc,
        proposedPrice: proposedPrice ? Number(proposedPrice) : undefined,
        paymentMethod: 'offline'
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Job request sent! Check your Jobs page.');
      setBookingProvider(null);
      setBookingDesc('');
      setProposedPrice('');
      setPaymentMethod('offline');
      navigate('/customer/jobs');
    } catch (err) { alert(err.response?.data?.message || 'Booking failed'); }
  };

  const renderStars = (rating) => {
    const r = Math.round(rating || 0);
    if (r === 0) return <span style={{display: 'inline-flex', alignItems: 'center', gap: '4px'}}><Star size={14} color="var(--text-muted)"/> No ratings</span>;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--accent-yellow)' }}>
        {[...Array(r)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
      </span>
    );
  };

  const fetchReviews = async (provider) => {
    try {
      const { data } = await axios.get(`/api/providers/${provider._id}/reviews`);
      setProviderReviews({ provider, reviews: data });
      setReviewModalOpen(true);
    } catch (err) {
      alert('Could not fetch reviews');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Service Categories */}
      <section className="categories-section">
        <h2 className="section-title">What service do you need?</h2>
        <div className="categories-scroll">
          <button
            className={`category-item ${activeCategory === 'All' ? 'active' : ''}`}
            onClick={() => fetchProviders('All')}
          >
            <div className="category-icon" style={{ display: 'flex', alignItems: 'center' }}>
              <Home size={24} />
            </div>
            <span>All Services</span>
          </button>
          {SERVICE_CATEGORIES.map(cat => (
            <button
              key={cat.name}
              className={`category-item ${activeCategory === cat.name ? 'active' : ''}`}
              onClick={() => fetchProviders(cat.name)}
            >
              <div className="category-icon" style={{ display: 'flex', alignItems: 'center' }}>
                {cat.icon}
              </div>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Providers Grid */}
      <section className="providers-section">
        <div className="section-header">
          <h2 className="section-title">
            {activeCategory === 'All' ? 'Top Providers' : `${activeCategory}s`} near {areaName || 'you'}
          </h2>
          {providers.length > 0 && <span className="result-count">{providers.length} found</span>}
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1,2,3,4].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : !searched ? (
          <div className="empty-state">
            <div className="empty-icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '1rem' }}><MapPin size={48} /></div>
            <p>Allow location access to discover service providers near you</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '1rem' }}><Search size={48} /></div>
            <p>No {activeCategory !== 'All' ? activeCategory + 's' : 'providers'} found nearby. Try a different category!</p>
          </div>
        ) : (
          <div className="provider-grid">
            {providers.map(p => (
              <div key={p._id} className="provider-card-new">
                <div className="provider-card-top">
                  <div className="provider-avatar-sm" style={{ overflow: 'hidden' }}>
                    {p.profilePicture ? (
                      <img src={p.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      p.firstName?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="provider-card-info">
                    <h3>{p.firstName} {p.lastName}</h3>
                    <div className="provider-card-meta">
                      <span className="badge badge-service">{p.serviceType}</span>
                      {p.gender && <span className="badge" style={{background: 'var(--bg-secondary)', color: 'var(--text-secondary)'}}>{p.gender}</span>}
                      <span className="provider-rating" style={{cursor: 'pointer'}} onClick={() => fetchReviews(p)}>
                        {renderStars(p.avgReviews)} <span style={{marginLeft: '0.2rem', textDecoration: 'underline'}}>({p.numberOfReviews || 0} reviews)</span>
                      </span>
                    </div>
                  </div>
                  <div className="provider-price"><small>Cost: </small>₹{p.pricePerHour} / {p.priceType === 'per_month' ? 'month' : p.priceType === 'per_day' ? 'day' : 'hr'}</div>
                </div>
                {p.bio && <p className="provider-bio">{p.bio}</p>}
                <div className="provider-card-footer">
                  <span className="provider-phone" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                    <Phone size={14} /> Hidden until booked
                  </span>
                  <span className="badge badge-available">{p.status}</span>
                </div>

                {bookingProvider === p._id ? (
                  <div className="booking-inline">
                    <textarea
                      placeholder="Describe the work you need..."
                      value={bookingDesc}
                      onChange={e => setBookingDesc(e.target.value)}
                      rows="2"
                    />
                    <input
                      type="number"
                      placeholder={`Propose Price (Optional, Base: ₹${p.pricePerHour} / ${p.priceType === 'per_month' ? 'month' : p.priceType === 'per_day' ? 'day' : 'hr'})`}
                      value={proposedPrice}
                      onChange={e => setProposedPrice(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', marginBottom: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', marginTop: '0.5rem' }}>
                      <button 
                        type="button"
                        onClick={() => setPaymentMethod('offline')}
                        style={{ 
                          flex: 1, 
                          padding: '0.8rem', 
                          border: paymentMethod === 'offline' ? '2px solid var(--accent)' : '1px solid var(--border)', 
                          background: paymentMethod === 'offline' ? 'rgba(107, 76, 255, 0.1)' : 'var(--bg-secondary)', 
                          color: 'var(--text-primary)', 
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ fontSize: '1.4rem' }}>💵</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Cash After</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => setPaymentMethod('online')}
                        style={{ 
                          flex: 1, 
                          padding: '0.8rem', 
                          border: paymentMethod === 'online' ? '2px solid var(--accent)' : '1px solid var(--border)', 
                          background: paymentMethod === 'online' ? 'rgba(107, 76, 255, 0.1)' : 'var(--bg-secondary)', 
                          color: 'var(--text-primary)', 
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" 
                          alt="Razorpay" 
                          style={{ height: '20px', objectFit: 'contain', filter: 'drop-shadow(0px 0px 2px rgba(255,255,255,0.7))', background: 'white', padding: '2px 6px', borderRadius: '4px' }} 
                        />
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Pay Online</span>
                      </button>
                    </div>
                    <div className="booking-actions">
                      <button className="btn btn-success btn-sm" onClick={() => handleBook(p._id, p.pricePerHour)}>{paymentMethod === 'online' ? 'Pay & Confirm' : 'Confirm Cash Booking'}</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setBookingProvider(null); setProposedPrice(''); setPaymentMethod('offline'); }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-primary btn-sm btn-book" onClick={() => setBookingProvider(p._id)}>Book Now</button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Review Modal */}
      {reviewModalOpen && providerReviews && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '90%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Reviews for {providerReviews.provider.firstName}</h2>
              <button onClick={() => setReviewModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {providerReviews.reviews.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No reviews yet for this provider.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {providerReviews.reviews.map(r => (
                    <div key={r._id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold' }}>{r.reviewerName}</span>
                        {renderStars(r.rating)}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>"{r.comment}"</p>
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>
                        {new Date(r.date).toLocaleDateString()}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
