import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Vite leaflet icon missing issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  const [bookingLocation, setBookingLocation] = useState(null);
  const [address, setAddress] = useState({ houseNumber: '', city: '', area: '' });

  const MapEvents = () => {
    useMapEvents({
      click(e) { setBookingLocation({ lng: e.latlng.lng, lat: e.latlng.lat }); }
    });
    return bookingLocation ? <Marker position={[bookingLocation.lat, bookingLocation.lng]} /> : null;
  };

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
    if (!bookingLocation) return alert('Please drop a pin on the map to confirm service location.');
    try {
      const payload = {
        provider: providerId,
        description: bookingDesc,
        lng: bookingLocation.lng,
        lat: bookingLocation.lat,
        ...address
      };

      await axios.post('/api/jobs', payload, {
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
                  <div className="booking-inline" style={{display:'flex', flexDirection:'column', gap:'0.8rem'}}>
                    <textarea
                      placeholder="Describe the work you need..."
                      value={bookingDesc}
                      onChange={e => setBookingDesc(e.target.value)}
                      rows="2"
                    />
                    
                    <div style={{fontSize:'0.9rem', fontWeight:'600'}}>Confirm Location</div>
                    <div style={{ height: '200px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                      <MapContainer center={[bookingLocation?.lat || 26.8467, bookingLocation?.lng || 80.9462]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapEvents />
                      </MapContainer>
                    </div>
                    <p style={{fontSize:'0.75rem', color:'#aaa'}}>* Tap on map to drop precise pin</p>

                    <div style={{display:'flex', gap:'0.5rem'}}>
                      <input placeholder="City" value={address.city} onChange={e=>setAddress({...address, city: e.target.value})} />
                      <input placeholder="Area" value={address.area} onChange={e=>setAddress({...address, area: e.target.value})} />
                    </div>
                    <input placeholder="House No. / Flat / Landmark" value={address.houseNumber} onChange={e=>setAddress({...address, houseNumber: e.target.value})} />

                    <div className="booking-actions">
                      <button className="btn btn-success btn-sm" onClick={() => handleBook(p._id)}>✓ Confirm Job</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setBookingProvider(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-primary btn-sm btn-book" onClick={() => {
                    setBookingProvider(p._id);
                    setBookingLocation(location || { lng: 80.9462, lat: 26.8467 });
                    setAddress({ houseNumber: '', city: '', area: areaName || '' });
                  }}>Book Now</button>
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
