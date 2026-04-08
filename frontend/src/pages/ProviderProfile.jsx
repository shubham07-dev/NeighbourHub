import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MapPin, Check, X } from 'lucide-react';
import { getEnglishAreaName } from '../utils/geocode';

const ProviderProfile = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '', bio: '', serviceType: '', pricePerHour: '', priceType: 'per_hour', status: '', gender: '' });
  const [location, setLocation] = useState(null);
  const [locStatus, setLocStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`/api/providers/${user._id}`);
        setForm({
          firstName: data.firstName || '', lastName: data.lastName || '',
          phoneNumber: data.phoneNumber || '', bio: data.bio || '',
          serviceType: data.serviceType || '', pricePerHour: data.pricePerHour || '',
          priceType: data.priceType || 'per_hour',
          status: data.status || 'available', gender: data.gender || ''
        });
        if (data.location?.coordinates) {
          setLocation({ lng: data.location.coordinates[0], lat: data.location.coordinates[1] });
          const name = await getEnglishAreaName(data.location.coordinates[1], data.location.coordinates[0]);
          setLocStatus(`Current: ${name}`);
        }
      } catch (err) { console.error(err); }
    };
    fetchProfile();
  }, []);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('Geolocation not supported');
      return;
    }
    setLocStatus('Fetching location...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude });
        const name = await getEnglishAreaName(pos.coords.latitude, pos.coords.longitude);
        setLocStatus(`Updated to ${name}`);
      },
      () => setLocStatus('Error: Location access denied')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (location) { payload.lng = location.lng; payload.lat = location.lat; }
      await axios.put('/api/providers/profile', payload, { headers: { Authorization: `Bearer ${user.token}` } });
      login({ ...user, firstName: form.firstName });
      setMsg('Profile updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) { setMsg('Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="container" style={{maxWidth: '650px'}}>
      <div className="profile-header">
        <div className="profile-avatar">{form.firstName?.charAt(0)?.toUpperCase()}</div>
        <div className="profile-info">
          <h2>{form.firstName} {form.lastName}</h2>
          <p>{form.serviceType} — ₹{form.pricePerHour} / {form.priceType === 'per_month' ? 'month' : form.priceType === 'per_day' ? 'day' : 'hr'}</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{marginBottom:'1rem'}}>Edit Provider Profile</h3>
        {msg && <div className="error-msg" style={{background: msg.includes('updated') ? 'rgba(46,204,113,0.1)' : undefined, color: msg.includes('updated') ? '#2ecc71' : undefined}}>{msg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1.2rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>First Name</label>
              <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Last Name</label>
              <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label>Phone Number <span style={{color: '#e74c3c'}}>*</span></label>
            <input required value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} />
          </div>
          <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1.2rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Service Type</label>
              <select value={form.serviceType} onChange={e => setForm({...form, serviceType: e.target.value})}>
                <option>Plumber</option><option>Electrician</option><option>Tutor</option>
                <option>Delivery Agent</option><option>House Cleaner</option><option>Carpenter</option><option>Painter</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="busy">Busy</option>
              </select>
            </div>
          </div>
          <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1.2rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Base Service Cost (₹) <span style={{color: '#e74c3c'}}>*</span></label>
              <input required type="number" min="100" value={form.pricePerHour} onChange={e => setForm({...form, pricePerHour: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Price Type *</label>
              <select value={form.priceType} onChange={e => setForm({...form, priceType: e.target.value})} required>
                <option value="per_hour">Per Hour</option>
                <option value="per_day">Per Day</option>
                <option value="per_month">Per Month</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Bio <span style={{color: '#e74c3c'}}>*</span></label>
            <textarea required placeholder="give your experience ...... and other things fill it according yourself" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows="3" />
          </div>
          <div className="form-group">
            <label>Service Location</label>
            <button type="button" className="btn btn-secondary btn-block" onClick={captureLocation} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'}}>
              {location ? <><Check size={16} /> Update My Location</> : <><MapPin size={16} /> Share My Location</>}
            </button>
            {locStatus && <p className="text-sm mt-1" style={{display: 'flex', alignItems: 'center', gap: '0.3rem', color: locStatus.includes('Current') || locStatus.includes('Updated') ? '#2ecc71' : locStatus.includes('Error') ? '#e74c3c' : 'var(--text-secondary)'}}>
              {locStatus.includes('Current') || locStatus.includes('Updated') ? <MapPin size={14} /> : locStatus.includes('Error') ? <X size={14} /> : null}
              {locStatus}
            </p>}
          </div>
          <button type="submit" className="btn btn-primary btn-block" style={{display: 'flex', justifyContent: 'center'}} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
};

export default ProviderProfile;
