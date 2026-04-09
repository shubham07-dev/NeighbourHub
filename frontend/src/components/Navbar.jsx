import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import axios from 'axios';
import { Menu, X, Home, MapPin, ChevronDown, Search, Tag, HelpCircle, User, ClipboardList, Settings, LogOut, Languages, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { areaName, detectLocation } = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [jobCount, setJobCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
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

  const [currentLang, setCurrentLang] = useState('en');
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const isHindi = document.cookie.includes('googtrans=/en/hi');
    setCurrentLang(isHindi ? 'hi' : 'en');

    // Theme initialization
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsLightMode(true);
      document.documentElement.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    if (isLightMode) {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
      setIsLightMode(false);
    } else {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
      setIsLightMode(true);
    }
  };

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'hi' : 'en';
    if (newLang === 'hi') {
      document.cookie = `googtrans=/en/hi; path=/`;
      document.cookie = `googtrans=/en/hi; domain=${window.location.hostname}; path=/`;
    } else {
      document.cookie = `googtrans=/en/en; path=/`;
      document.cookie = `googtrans=/en/en; domain=${window.location.hostname}; path=/`;
      
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
    }
    window.location.reload();
  };

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
        <Link to="/" className="navbar-logo" onClick={() => { closeMobileMenu(); window.scrollTo(0, 0); }}>
          <img src="/logo.png" alt="NeighbourHub Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} /> <span>NeighbourHub</span>
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
        {user ? (
          <Link to={user.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard'} className="nav-item" onClick={closeMobileMenu}>
            <Search size={16} className="nav-icon" /> Search
          </Link>
        ) : (
          <button className="nav-item" style={{background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center'}} onClick={() => { closeMobileMenu(); setShowLoginPrompt(true); }}>
            <Search size={16} className="nav-icon" /> Search
          </button>
        )}

        <button onClick={toggleTheme} className="nav-item" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center' }}>
          {isLightMode ? <Moon size={16} className="nav-icon" /> : <Sun size={16} className="nav-icon" />}
        </button>

        <Link to="/help" className="nav-item" onClick={closeMobileMenu}>
          <HelpCircle size={16} className="nav-icon" /> Help
        </Link>

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

            {mobileMenuOpen ? (
              <>
                <Link 
                  to={user.role === 'provider' ? '/provider/profile' : '/customer/profile'} 
                  className="nav-avatar" 
                  onClick={closeMobileMenu}
                  style={{ width: '100%', borderRadius: 'var(--radius-sm)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem' }}
                >
                  <User size={16} style={{ marginRight: '0.5rem' }} /> {user.firstName || 'Profile'}
                </Link>
                <button 
                  className="nav-item" 
                  onClick={toggleLanguage} 
                  style={{ width: '100%', justifyContent: 'flex-start', marginTop: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem', color: 'var(--text-primary)' }}
                >
                  <Languages size={16} className="nav-icon" style={{ color: '#aaa' }} /> {currentLang === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English'}
                </button>
                <button 
                  className="nav-item" 
                  onClick={handleLogout} 
                  style={{ width: '100%', justifyContent: 'flex-start', color: '#e74c3c', marginTop: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}
                >
                  <LogOut size={16} className="nav-icon" style={{ color: '#e74c3c' }} /> Logout
                </button>
                <button 
                  className="nav-item" 
                  onClick={toggleTheme} 
                  style={{ width: '100%', justifyContent: 'flex-start', marginTop: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem', color: 'var(--text-primary)' }}
                >
                  {isLightMode ? <Moon size={16} className="nav-icon" style={{ color: '#aaa', marginRight: '0.5rem' }} /> : <Sun size={16} className="nav-icon" style={{ color: '#aaa', marginRight: '0.5rem' }} />} 
                  {isLightMode ? 'Dark Mode' : 'Light Mode'}
                </button>
              </>
            ) : (
              <div className="nav-avatar-wrap" ref={dropdownRef}>
                <button
                  className="nav-avatar"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ overflow: 'hidden', padding: user?.profilePicture ? 0 : undefined }}
                >
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : avatar}
                </button>
                {dropdownOpen && (
                  <div className="avatar-dropdown">
                    <div className="dropdown-header">
                      <strong>{user.firstName} {user.lastName || ''}</strong>
                      <span>{user.email}</span>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to={user.role === 'provider' ? '/provider/profile' : '/customer/profile'} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      👤 Profile
                    </Link>
                    <Link to={user.role === 'provider' ? '/provider/dashboard' : '/customer/jobs'} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      📋 My Jobs
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="dropdown-item" onClick={() => { setDropdownOpen(false); closeMobileMenu(); }}>
                        <Settings size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Admin Dashboard
                      </Link>
                    )}
                    <button className="dropdown-item" onClick={toggleLanguage} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: '14px' }}>
                      <Languages size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle', color: '#aaa' }} /> {currentLang === 'en' ? 'Switch to Hindi' : 'Switch to English'}
                    </button>
                    <button className="dropdown-item" onClick={toggleTheme} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: '14px' }}>
                      {isLightMode ? <Moon size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle', color: '#aaa' }} /> : <Sun size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle', color: '#aaa' }} />}
                      {isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                      <LogOut size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div style={{ background: '#0f0f15', border: '1px solid #2a2a35', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)', width: '90%', maxWidth: '400px', textAlign: 'center',justifyContent:'center', padding: '2rem', animation: 'slideDown 0.3s ease' }}>
            <div style={{ fontSize: '3rem', margin: '0 auto 3.5rem', background: '#1c1c26', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.05)' }}>🔒</div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.4rem', color: 'white', fontWeight: '700' }}>Login Required</h3>
            <p style={{ color: '#a0a0b0', marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.5' }}>You must sign in or create an account to search and connect with service providers in your area.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn" onClick={() => setShowLoginPrompt(false)} style={{ flex: 1, background: '#252530', color: 'white' }}>Cancel</button>
              <Link to="/login" className="btn btn-primary" onClick={() => setShowLoginPrompt(false)} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>Sign In</Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
};

export default Navbar;
