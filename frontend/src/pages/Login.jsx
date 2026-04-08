import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Login = () => {
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', { email, password, role });
      login(data);
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'provider') navigate('/provider/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    try {
      const { data } = await axios.post('/api/auth/google', {
        credential: credentialResponse.credential,
        role: role === 'admin' ? 'customer' : role,
      });
      login(data);
      if (data.role === 'provider') navigate('/provider/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>

        <div className="role-selector">
          <button className={role === 'customer' ? 'active' : ''} onClick={() => setRole('customer')}>Customer</button>
          <button className={role === 'provider' ? 'active' : ''} onClick={() => setRole('provider')}>Provider</button>
          <button className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')}>Admin</button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {role !== 'admin' && (
          <>
            <div className="google-divider">or</div>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google login failed')}
              theme="filled_black"
              size="large"
              width="100%"
              text="continue_with"
            />
          </>
        )}

        <p className="mt-2 text-sm text-muted" style={{textAlign:'center'}}>
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
