import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import axios from 'axios';
import { Menu, X, Home, MapPin, ChevronDown, Search, Tag, HelpCircle, User, ClipboardList, Settings, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { areaName, detectLocation } = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [jobCount, setJobCount] = useState(0);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => { 
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false); 
      }
    };
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
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const avatar = user?.firstName?.charAt(0)?.toUpperCase() || '?';

  return (
    <nav className="navbar-new">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <Home size={20} /> <span>NeighbourHub</span>
        </Link>
        <button className="navbar-location" onClick={detectLocation} title="Click to refresh location">
          <MapPin size={14} className="loc-icon" />
          <span className="loc-text">{areaName}</span>
          <ChevronDown size={12} className="loc-arrow" />
        </button>
      </div>

      <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`navbar-right ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <Link to={user ? (user.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard') : '/'} className="nav-item" onClick={closeMobileMenu}>
          <Search size={16} className="nav-icon" /> Search
        </Link>
        <span className="nav-item nav-item-static">
          <Tag size={16} className="nav-icon" /> Offers
        </span>
        <span className="nav-item nav-item-static">
          <HelpCircle size={16} className="nav-icon" /> Help
        </span>

        {!user ? (
          <Link to="/login" className="nav-item nav-signin" onClick={closeMobileMenu}>
            <User size={16} className="nav-icon" /> Sign In
          </Link>
        ) : (
          <>
            <Link to={user.role === 'provider' ? '/provider/dashboard' : '/customer/jobs'} className="nav-item nav-jobs" onClick={closeMobileMenu}>
              <ClipboardList size={16} className="nav-icon" /> My Jobs
              {jobCount > 0 && <span className="nav-badge">{jobCount}</span>}
            </Link>

            <div className="nav-avatar-wrap" ref={dropdownRef}>
              <button 
                className="nav-avatar" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ width: mobileMenuOpen ? '100%' : '36px', borderRadius: mobileMenuOpen ? 'var(--radius-sm)' : '50%' }}
              >
                {mobileMenuOpen ? `Account (${avatar})` : avatar}
              </button>
              {dropdownOpen && (
                <div className="avatar-dropdown">
                  <div className="dropdown-header">
                    <strong>{user.firstName} {user.lastName || ''}</strong>
                    <span>{user.email}</span>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to={user.role === 'provider' ? '/provider/profile' : '/customer/profile'} className="dropdown-item" onClick={() => { setDropdownOpen(false); closeMobileMenu(); }}>
                    <User size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Profile
                  </Link>
                  <Link to={user.role === 'provider' ? '/provider/dashboard' : '/customer/jobs'} className="dropdown-item" onClick={() => { setDropdownOpen(false); closeMobileMenu(); }}>
                    <ClipboardList size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> My Jobs
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item" onClick={() => { setDropdownOpen(false); closeMobileMenu(); }}>
                      <Settings size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Admin Dashboard
                    </Link>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    <LogOut size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Logout
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
