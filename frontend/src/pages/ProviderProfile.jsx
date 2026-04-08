import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ProviderProfile = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '', bio: '', serviceType: '', pricePerHour: '', status: '', gender: '' });
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
          status: data.status || 'available', gender: data.gender || ''
        });
        if (data.location?.coordinates) {
          setLocation({ lng: data.location.coordinates[0], lat: data.location.coordinates[1] });
          setLocStatus(`📍 Current: (${data.location.coordinates[1].toFixed(4)}, ${data.location.coordinates[0].toFixed(4)})`);
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
      (pos) => {
        setLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude });
        setLocStatus(`📍 Updated to (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
      },
      () => setLocStatus('❌ Location access denied')
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
          <p>{form.serviceType} — ₹{form.pricePerHour}/hr</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{marginBottom:'1rem'}}>Edit Provider Profile</h3>
        {msg && <div className="error-msg" style={{background: msg.includes('updated') ? 'rgba(46,204,113,0.1)' : undefined, color: msg.includes('updated') ? '#2ecc71' : undefined}}>{msg}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{display:'flex', gap:'1rem'}}>
            <div className="form-group" style={{flex:1}}>
              <label>First Name</label>
              <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
            </div>
            <div className="form-group" style={{flex:1}}>
              <label>Last Name</label>
              <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} />
          </div>
          <div style={{display:'flex', gap:'1rem'}}>
            <div className="form-group" style={{flex:1}}>
              <label>Service Type</label>
              <select value={form.serviceType} onChange={e => setForm({...form, serviceType: e.target.value})}>
                <option>Plumber</option><option>Electrician</option><option>Tutor</option>
                <option>Delivery Agent</option><option>House Cleaner</option><option>Carpenter</option><option>Painter</option>
              </select>
            </div>
            <div className="form-group" style={{flex:1}}>
              <label>Price Per Hour (₹)</label>
              <input type="number" value={form.pricePerHour} onChange={e => setForm({...form, pricePerHour: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="busy">Busy</option>
            </select>
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows="3" />
          </div>
          <div className="form-group">
            <label>Service Location</label>
            <button type="button" className="btn btn-secondary btn-block" onClick={captureLocation}>
              {location ? '✅ Update My Location' : '📍 Share My Location'}
            </button>
            {locStatus && <p className="text-sm mt-1" style={{color: locStatus.includes('📍') ? '#2ecc71' : locStatus.includes('❌') ? '#e74c3c' : 'var(--text-secondary)'}}>{locStatus}</p>}
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
};

export default ProviderProfile;
