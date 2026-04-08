import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Register = () => {
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phoneNumber: '', serviceType: '', pricePerHour: '', bio: '' });
  const [location, setLocation] = useState(null);
  const [locStatus, setLocStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('Geolocation not supported by your browser');
      return;
    }
    setLocStatus('Fetching location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude });
        setLocStatus(`📍 Location captured (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
      },
      () => setLocStatus('❌ Location access denied. Please enable location access.')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (role === 'provider' && !location) {
      setError('Providers must share their location so customers can find you!');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form, role };
      if (location) { payload.lng = location.lng; payload.lat = location.lat; }

      const { data } = await axios.post('/api/auth/register', payload);
      login(data);
      if (data.role === 'provider') navigate('/provider/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');

    if (role === 'provider' && !location) {
      setError('Please share your location first, then use Google Sign Up.');
      return;
    }

    try {
      const { data } = await axios.post('/api/auth/google', {
        credential: credentialResponse.credential,
        role,
      });
      login(data);
      if (data.role === 'provider') navigate('/provider/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{maxWidth: '500px'}}>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join your neighbourhood marketplace</p>

        <div className="role-selector">
          <button className={role === 'customer' ? 'active' : ''} onClick={() => setRole('customer')}>Customer</button>
          <button className={role === 'provider' ? 'active' : ''} onClick={() => setRole('provider')}>Service Provider</button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{display:'flex', gap:'1rem'}}>
            <div className="form-group" style={{flex:1}}>
              <label>First Name *</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{flex:1}}>
              <label>Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="9876543210" />
          </div>

          {role === 'provider' && (
            <>
              <div className="form-group">
                <label>Service Type *</label>
                <select name="serviceType" value={form.serviceType} onChange={handleChange} required>
                  <option value="">Select a service</option>
                  <option>Plumber</option>
                  <option>Electrician</option>
                  <option>Tutor</option>
                  <option>Delivery Agent</option>
                  <option>House Cleaner</option>
                  <option>Carpenter</option>
                  <option>Painter</option>
                </select>
              </div>
              <div className="form-group">
                <label>Price Per Hour (₹)</label>
                <input type="number" name="pricePerHour" value={form.pricePerHour} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Short Bio</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows="3" placeholder="Tell customers about your services..." />
              </div>
              <div className="form-group">
                <label>Your Service Location *</label>
                <button type="button" className="btn btn-secondary btn-block" onClick={captureLocation}>
                  {location ? '✅ Location Captured — Click to Refresh' : '📍 Share My Location'}
                </button>
                {locStatus && <p className="text-sm mt-1" style={{color: locStatus.includes('📍') ? '#2ecc71' : locStatus.includes('❌') ? '#e74c3c' : 'var(--text-secondary)'}}>{locStatus}</p>}
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="google-divider">or</div>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google registration failed')}
          theme="filled_black"
          size="large"
          width="100%"
          text="signup_with"
        />

        <p className="mt-2 text-sm text-muted" style={{textAlign:'center'}}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
