import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Inbox, Phone, Check, X, Wrench, Play, Map, CheckCircle, Star, Video } from 'lucide-react';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [negotiatePrice, setNegotiatePrice] = useState({});
  const [filterView, setFilterView] = useState('all');
  const [activeVideoCall, setActiveVideoCall] = useState(null);
  const intervalRef = useRef(null);

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get('/api/jobs/provider', { headers: { Authorization: `Bearer ${user.token}` } });
      setJobs(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Initial fetch + 10s polling
  useEffect(() => {
    fetchJobs();
    intervalRef.current = setInterval(fetchJobs, 10000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const updateStatus = async (jobId, status) => {
    try {
      await axios.put(`/api/jobs/${jobId}/status`, { status }, { headers: { Authorization: `Bearer ${user.token}` } });
      fetchJobs();
    } catch (err) { alert('Update failed'); }
  };

  const handleNegotiate = async (jobId) => {
    if (!negotiatePrice[jobId]) return alert('Please enter a valid price');
    if (Number(negotiatePrice[jobId]) < 100) return alert('Price cannot be lower than ₹100');
    try {
      await axios.put(`/api/jobs/${jobId}/negotiate`, { price: Number(negotiatePrice[jobId]) }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchJobs();
      setNegotiatePrice({...negotiatePrice, [jobId]: ''});
    } catch (err) { alert(err.response?.data?.message || 'Negotiation failed'); }
  };

  const openRoute = (providerLoc, userLoc) => {
    // Graceful fallback if native location is missing (useful for older demo accounts)
    const pLoc = providerLoc?.coordinates || [80.9462, 26.8467]; // default origin
    const uLoc = userLoc?.coordinates || [81.0000, 26.9000];     // default destination

    const [pLng, pLat] = pLoc;
    const [uLng, uLat] = uLoc;
    // Provider → Customer direction
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${pLat},${pLng}&destination=${uLat},${uLng}&travelmode=driving`, '_blank');
  };

  const pending = jobs.filter(j => j.status === 'pending');
  const active = jobs.filter(j => ['accepted', 'ongoing'].includes(j.status));
  const completed = jobs.filter(j => j.status === 'completed');

  const totalEarnings = completed.reduce((sum, job) => sum + (job.agreedPrice || user.pricePerHour || 0), 0);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const renderJobCard = (job) => (
    <div key={job._id} className="card" style={{ opacity: job.status === 'rejected' ? 0.6 : 1 }}>
      <div className="flex-between mb-2">
        <h3>{job.user?.firstName} {job.user?.lastName}</h3>
        <span className={`badge badge-${job.status}`}>{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span>
      </div>
      
      {job.status === 'completed' && <p className="text-sm text-muted mt-1" style={{ marginBottom: '0.4rem', fontWeight: 500 }}>Earned: ₹{job.agreedPrice || user.pricePerHour}</p>}
      
      <p className="text-sm">{job.description}</p>
      
      {['pending', 'accepted', 'ongoing'].includes(job.status) && job.user?.phoneNumber && 
        <p className="text-sm text-muted mt-1" style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><Phone size={14} /> {job.user.phoneNumber}</p>
      }

      {job.status === 'pending' && (
        job.negotiation?.isNegotiating ? (
          <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
            {job.negotiation.proposedBy === 'customer' ? (
              <>
                <div style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--accent-yellow)' }}>Wait!</span> Customer proposed: <strong>₹{job.negotiation.price}</strong> 
                  <span className="text-muted text-sm" style={{marginLeft: '0.5rem'}}>(Round {job.negotiation.roundCount}/4)</span>
                </div>
                <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                  <button className="btn btn-success btn-sm" onClick={() => updateStatus(job._id, 'accepted')} style={{flex: 1}}><Check size={16} /> Accept Job & Price</button>
                  <button className="btn btn-danger btn-sm" onClick={() => updateStatus(job._id, 'rejected')} style={{flex: 1}}><X size={16} /> Reject Job</button>
                </div>
                {job.negotiation.roundCount < 4 && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input type="number" placeholder="Counter Offer (₹)" value={negotiatePrice[job._id] || ''} onChange={e => setNegotiatePrice({...negotiatePrice, [job._id]: e.target.value})} style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'white' }} />
                    <button className="btn btn-primary btn-sm" onClick={() => handleNegotiate(job._id)}>Counter</button>
                  </div>
                )}
              </>
            ) : (
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>You offered ₹{job.negotiation.price}. Waiting for customer to accept...</p>
            )}
          </div>
        ) : (
          <div className="flex gap-1 mt-2" style={{flexWrap: 'wrap'}}>
            <button className="btn btn-success btn-sm" onClick={() => updateStatus(job._id, 'accepted')} style={{flex: 1, justifyContent: 'center'}}><Check size={16} /> Accept</button>
            <button className="btn btn-danger btn-sm" onClick={() => updateStatus(job._id, 'rejected')} style={{flex: 1, justifyContent: 'center'}}><X size={16} /> Reject</button>
          </div>
        )        
      )}

      {['accepted', 'ongoing'].includes(job.status) && (
        <div className="flex gap-1 mt-2" style={{flexWrap: 'wrap'}}>
          {job.status === 'accepted' && <button className="btn btn-primary btn-sm" onClick={() => updateStatus(job._id, 'ongoing')} style={{flex: 1, justifyContent: 'center'}}><Play size={16} /> Start Work</button>}
          {job.status === 'ongoing' && <button className="btn btn-success btn-sm" onClick={() => updateStatus(job._id, 'completed')} style={{flex: 1, justifyContent: 'center'}}><Check size={16} /> Mark Complete</button>}
        </div>
      )}
      {['accepted', 'ongoing'].includes(job.status) && (
        <div className="flex gap-1 mt-1" style={{flexWrap: 'wrap'}}>
          <button
            className="btn btn-route btn-sm"
            onClick={() => openRoute(job.provider?.location || user.location, job.user?.location)}
            style={{flex: 1, justifyContent: 'center'}}
          >
            <Map size={16} /> Navigate
          </button>
          <button
            className="btn btn-success btn-sm"
            onClick={() => setActiveVideoCall(job._id)}
            style={{flex: 1, justifyContent: 'center', background: '#2ecc71', color: '#fff'}}
          >
            <Video size={16} /> Video Call
          </button>
        </div>
      )}

      {job.status === 'completed' && job.reviews?.rating && (
        <p className="text-sm mt-1" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <span style={{color: 'var(--accent-yellow)', display: 'flex'}}>
            {[...Array(job.reviews.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
          </span>
          <span className="text-muted">"{job.reviews.comment}"</span>
        </p>      
      )}
    </div>
  );

  return (
    <div className="container">
      <div className="page-header">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Provider Dashboard</h1>
            <p>Welcome back, {user.firstName}! Manage your incoming jobs here.</p>
          </div>
          <div className="live-indicator">
            <span className="live-dot" /> Live Updates
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div 
          className="stat-card" 
          style={{ background: filterView === 'earnings' ? 'var(--accent-green)' : 'var(--bg-secondary)', color: filterView === 'earnings' ? '#fff' : 'inherit', cursor: 'pointer' }}
          onClick={() => setFilterView('earnings')}
        >
          <div className="stat-number" style={{ color: filterView === 'earnings' ? '#fff' : 'var(--accent-green)' }}>₹{totalEarnings}</div>
          <div className="stat-label" style={{ color: filterView === 'earnings' ? '#fff' : 'var(--text-muted)' }}>Total Earnings</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer', border: filterView === 'all' ? '1px solid var(--accent-primary)' : '1px solid transparent' }} onClick={() => setFilterView('all')}><div className="stat-number">{jobs.length}</div><div className="stat-label">Total Jobs</div></div>
        <div className="stat-card" style={{ cursor: 'pointer', border: filterView === 'pending' ? '1px solid var(--accent-primary)' : '1px solid transparent' }} onClick={() => setFilterView('pending')}><div className="stat-number">{pending.length}</div><div className="stat-label">Pending</div></div>
        <div className="stat-card" style={{ cursor: 'pointer', border: filterView === 'active' ? '1px solid var(--accent-primary)' : '1px solid transparent' }} onClick={() => setFilterView('active')}><div className="stat-number">{active.length}</div><div className="stat-label">Active</div></div>
        <div className="stat-card" style={{ cursor: 'pointer', border: filterView === 'completed' ? '1px solid var(--accent-primary)' : '1px solid transparent' }} onClick={() => setFilterView('completed')}><div className="stat-number">{completed.length}</div><div className="stat-label">Completed</div></div>
      </div>

      {filterView === 'earnings' && (
        completed.length > 0 ? (
          <>
            <h2 className="section-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Earnings Breakdown</h2>
            <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
              {completed.map(job => (
                <div key={job._id} className="card">
                  <div className="flex-between mb-2">
                    <h3>{job.user?.firstName} {job.user?.lastName}</h3>
                    <span className="text-muted text-sm">{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-green)', marginBottom: '0.5rem' }}>
                    + ₹{job.agreedPrice || user.pricePerHour}
                  </div>
                  <p className="text-sm">{job.description}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>0 Earnings yet</div>
        )
      )}

      {filterView === 'all' && (
        jobs.length > 0 ? (
          <>
            <h2 className="section-title" style={{marginBottom:'1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>Total Jobs</h2>
            <div className="grid grid-2" style={{marginBottom:'2rem'}}>
              {jobs.map(job => renderJobCard(job))}
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>0 Total Jobs</div>
        )
      )}

      {filterView === 'pending' && (
        pending.length > 0 ? (
          <>
            <h2 className="section-title" style={{marginBottom:'1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Inbox size={20} /> Pending Requests</h2>
            <div className="grid grid-2" style={{marginBottom:'2rem'}}>
              {pending.map(job => renderJobCard(job))}
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>0 Pending Jobs</div>
        )
      )}

      {filterView === 'active' && (
        active.length > 0 ? (
          <>
            <h2 className="section-title" style={{marginBottom:'1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Wrench size={20} /> Active Jobs</h2>
            <div className="grid grid-2" style={{marginBottom:'2rem'}}>
              {active.map(job => renderJobCard(job))}
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>0 Active Jobs</div>
        )
      )}

      {filterView === 'completed' && (
        completed.length > 0 ? (
          <>
            <h2 className="section-title" style={{marginBottom:'1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><CheckCircle size={20} color="var(--accent-green)" /> Completed Jobs</h2>
            <div className="grid grid-2" style={{marginBottom:'2rem'}}>
              {completed.map(job => renderJobCard(job))}
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>0 Completed Jobs</div>
        )
      )}


      {/* Video Call Modal */}
      {activeVideoCall && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: '#000', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Video /> Live Video Call</h3>
            <button onClick={() => setActiveVideoCall(null)} className="btn btn-primary btn-sm" style={{ background: '#e74c3c', border: 'none', color: '#fff' }}>End Call</button>
          </div>
          <iframe 
            src={`https://meet.jit.si/NeighbourHub_Job_${activeVideoCall}`} 
            style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
            allow="camera; microphone; fullscreen; display-capture"
            title="Video Call"
          />
        </div>
      )}

    </div>
  );
};

export default ProviderDashboard;
