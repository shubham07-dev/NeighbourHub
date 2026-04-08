import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { areaName, detectLocation } = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [jobCount, setJobCount] = useState(0);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Poll job count for badge
  useEffect(() => {
    if (!user || user.role === 'admin') return;
    const fetchCount = async () => {
      try {
        const endpoint = user.role === 'provider' ? '/api/jobs/provider' : '/api/jobs/my';
        const { data } = await axios.get(endpoint, { headers: { Authorization: `Bearer ${user.token}` } });
        const active = data.filter(j => ['pending', 'accepted', 'ongoing'].includes(j.status));
        setJobCount(active.length);
      } catch { /* ignore */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const avatar = user?.firstName?.charAt(0)?.toUpperCase() || '?';

  return (
    <nav className="navbar-new">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">🏠 <span>NeighbourHub</span></Link>
        <button className="navbar-location" onClick={detectLocation} title="Click to refresh location">
          <span className="loc-icon">📍</span>
          <span className="loc-text">{areaName}</span>
          <span className="loc-arrow">▾</span>
        </button>
      </div>

      <div className="navbar-right">
        <Link to={user ? (user.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard') : '/'} className="nav-item">
          <span className="nav-icon">🔍</span> Search
        </Link>
        <span className="nav-item nav-item-static">
          <span className="nav-icon">🏷️</span> Offers
        </span>
        <span className="nav-item nav-item-static">
          <span className="nav-icon">🏷️</span> Offers
        </span>
        <Link to="/help" className="nav-item">
          <span className="nav-icon">❓</span> Help
        </Link>

        {!user ? (
          <Link to="/login" className="nav-item nav-signin">
            <span className="nav-icon">👤</span> Sign In
          </Link>
        ) : (
          <>
            <Link to={user.role === 'provider' ? '/provider/dashboard' : '/customer/jobs'} className="nav-item nav-jobs">
              <span className="nav-icon">📋</span> My Jobs
              {jobCount > 0 && <span className="nav-badge">{jobCount}</span>}
            </Link>

            <div className="nav-avatar-wrap" ref={dropdownRef}>
              <button className="nav-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {avatar}
              </button>
              {dropdownOpen && (
                <div className="avatar-dropdown">
                  <div className="dropdown-header">
                    <strong>{user.firstName} {user.lastName || ''}</strong>
                    <span>{user.email}</span>
                  </div>
                  <div className="dropdown-divider" />
                  {user.role !== 'support' && (
                    <>
                      <Link to={user.role === 'provider' ? '/provider/profile' : '/customer/profile'} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        👤 Profile
                      </Link>
                      <Link to={user.role === 'provider' ? '/provider/dashboard' : '/customer/jobs'} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        📋 My Jobs
                      </Link>
                    </>
                  )}
                  {user.role === 'support' && (
                    <Link to="/support/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      🎧 Agent Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      ⚙️ Admin Dashboard
                    </Link>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
