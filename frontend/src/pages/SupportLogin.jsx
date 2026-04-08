import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SupportLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/support-agent/login', { email, password });
      login(data);
      navigate('/support/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
      <div className="auth-container">
        <div className="auth-form">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '3rem' }}>🎧</span>
            <h2>Support Agent Portal</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Authorized personnel only</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-message" style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c', padding: '0.8rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center', border: '1px solid rgba(231,76,60,0.3)' }}>{error}</div>}
            
            <div className="form-group">
              <label>Agent Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', background: '#3498db' }}>
              Sign In to Agent Panel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupportLogin;
