import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import axios from 'axios';

const SERVICE_CATEGORIES = [
  { name: 'Plumber', icon: '🔧' },
  { name: 'Electrician', icon: '⚡' },
  { name: 'Tutor', icon: '📚' },
  { name: 'Delivery Agent', icon: '🚚' },
  { name: 'House Cleaner', icon: '🧹' },
  { name: 'Carpenter', icon: '🪚' },
  { name: 'Painter', icon: '🎨' },
];

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { location, areaName } = useLocation();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookingDesc, setBookingDesc] = useState('');
  const [bookingProvider, setBookingProvider] = useState(null);
  const [searched, setSearched] = useState(false);

  // Auto-fetch providers when location is available
  useEffect(() => {
    if (location) fetchProviders('All');
  }, [location]);

  const fetchProviders = async (serviceType) => {
    if (!location) return;
    setLoading(true);
    setActiveCategory(serviceType);
    try {
      const url = `/api/providers/nearby?lng=${location.lng}&lat=${location.lat}&distance=15&serviceType=${serviceType}`;
      const { data } = await axios.get(url);
      setProviders(data);
      setSearched(true);
    } catch (err) {
      console.error(err);
      // Fallback: fetch all providers if geo fails
      try {
        const { data } = await axios.get('/api/providers');
        setProviders(serviceType === 'All' ? data : data.filter(p => p.serviceType === serviceType));
        setSearched(true);
      } catch { /* ignore */ }
    }
    finally { setLoading(false); }
  };

  const handleBook = async (providerId) => {
    if (!bookingDesc.trim()) return alert('Please describe the work you need.');
    try {
      // First, save the customer's current location to their profile so the provider can navigate to them
      if (location && location.lng && location.lat) {
        try {
          await axios.put('/api/users/profile', { lng: location.lng, lat: location.lat }, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
        } catch (locErr) {
          console.warn('Failed to save user location to profile:', locErr);
        }
      }

      await axios.post('/api/jobs', { provider: providerId, description: bookingDesc }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Job request sent! Check your Jobs page.');
      setBookingProvider(null);
      setBookingDesc('');
      navigate('/customer/jobs');
    } catch (err) { alert(err.response?.data?.message || 'Booking failed'); }
  };

  const renderStars = (rating) => {
    const r = Math.round(rating || 0);
    return r > 0 ? '⭐'.repeat(r) : '☆ No ratings';
  };

  return (
    <div className="dashboard-container">
      {/* Service Categories — Swiggy style */}
      <section className="categories-section">
        <h2 className="section-title">What service do you need?</h2>
        <div className="categories-scroll">
          <button
            className={`category-item ${activeCategory === 'All' ? 'active' : ''}`}
            onClick={() => fetchProviders('All')}
          >
            <div className="category-icon">🏠</div>
            <span>All Services</span>
          </button>
          {SERVICE_CATEGORIES.map(cat => (
            <button
              key={cat.name}
              className={`category-item ${activeCategory === cat.name ? 'active' : ''}`}
              onClick={() => fetchProviders(cat.name)}
            >
              <div className="category-icon">{cat.icon}</div>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Providers Grid */}
      <section className="providers-section">
        <div className="section-header">
          <h2 className="section-title">
            {activeCategory === 'All' ? 'Top Service Providers' : `${activeCategory}s`} near {areaName || 'you'}
          </h2>
          {providers.length > 0 && <span className="result-count">{providers.length} found</span>}
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1,2,3,4].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : !searched ? (
          <div className="empty-state">
            <div className="empty-icon">📍</div>
            <p>Allow location access to discover service providers near you</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>No {activeCategory !== 'All' ? activeCategory + 's' : 'providers'} found nearby. Try a different category!</p>
          </div>
        ) : (
          <div className="provider-grid">
            {providers.map(p => (
              <div key={p._id} className="provider-card-new">
                <div className="provider-card-top">
                  <div className="provider-avatar-sm">{p.firstName?.charAt(0)}</div>
                  <div className="provider-card-info">
                    <h3>{p.firstName} {p.lastName}</h3>
                    <div className="provider-card-meta">
                      <span className="badge badge-service">{p.serviceType}</span>
                      <span className="provider-rating">{renderStars(p.avgReviews)} ({p.numberOfReviews || 0})</span>
                    </div>
                  </div>
                  <div className="provider-price">₹{p.pricePerHour}<small>/hr</small></div>
                </div>
                {p.bio && <p className="provider-bio">{p.bio}</p>}
                <div className="provider-card-footer">
                  <span className="provider-phone">📞 {p.phoneNumber || 'N/A'}</span>
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
                    <div className="booking-actions">
                      <button className="btn btn-success btn-sm" onClick={() => handleBook(p._id)}>✓ Confirm</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setBookingProvider(null)}>Cancel</button>
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
    </div>
  );
};

export default CustomerDashboard;
