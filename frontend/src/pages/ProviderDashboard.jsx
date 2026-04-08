import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1>Provider Dashboard</h1>
            <p>Welcome back, {user.firstName}! Manage your incoming jobs here.</p>
          </div>
          <div className="live-indicator">
            <span className="live-dot" /> Live Updates
          </div>
        </div>
      </div>

      <div className="grid grid-4" style={{marginBottom:'2rem'}}>
        <div className="stat-card"><div className="stat-number">{jobs.length}</div><div className="stat-label">Total Jobs</div></div>
        <div className="stat-card"><div className="stat-number">{pending.length}</div><div className="stat-label">Pending</div></div>
        <div className="stat-card"><div className="stat-number">{active.length}</div><div className="stat-label">Active</div></div>
        <div className="stat-card"><div className="stat-number">{completed.length}</div><div className="stat-label">Completed</div></div>
      </div>

      {pending.length > 0 && (
        <>
          <h2 className="section-title" style={{marginBottom:'1rem'}}>📩 Pending Requests</h2>
          <div className="grid grid-2" style={{marginBottom:'2rem'}}>
            {pending.map(job => (
              <div key={job._id} className="card">
                <div className="flex-between mb-2">
                  <h3>{job.user?.firstName} {job.user?.lastName}</h3>
                  <span className="badge badge-pending">Pending</span>
                </div>
                <p className="text-sm">{job.description}</p>
                {job.user?.phoneNumber && <p className="text-sm text-muted mt-1">📞 {job.user.phoneNumber}</p>}
                <div className="flex gap-1 mt-2">
                  <button className="btn btn-success btn-sm" onClick={() => updateStatus(job._id, 'accepted')}>✓ Accept</button>
                  <button className="btn btn-danger btn-sm" onClick={() => updateStatus(job._id, 'rejected')}>✕ Reject</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {active.length > 0 && (
        <>
          <h2 className="section-title" style={{marginBottom:'1rem'}}>🔧 Active Jobs</h2>
          <div className="grid grid-2" style={{marginBottom:'2rem'}}>
            {active.map(job => (
              <div key={job._id} className="card">
                <div className="flex-between mb-2">
                  <h3>{job.user?.firstName} {job.user?.lastName}</h3>
                  <span className={`badge badge-${job.status}`}>{job.status}</span>
                </div>
                <p className="text-sm">{job.description}</p>
                {job.user?.phoneNumber && <p className="text-sm text-muted mt-1">📞 {job.user.phoneNumber}</p>}

                <div className="flex gap-1 mt-2">
                  {job.status === 'accepted' && <button className="btn btn-primary btn-sm" onClick={() => updateStatus(job._id, 'ongoing')}>▶ Start Work</button>}
                  {job.status === 'ongoing' && <button className="btn btn-success btn-sm" onClick={() => updateStatus(job._id, 'completed')}>✓ Mark Complete</button>}
                  <button
                    className="btn btn-route btn-sm"
                    onClick={() => openRoute(job.provider?.location || user.location, job.user?.location)}
                  >
                    🗺️ Navigate to Customer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {completed.length > 0 && (
        <>
          <h2 className="section-title" style={{marginBottom:'1rem'}}>✅ Completed Jobs</h2>
          <div className="grid grid-2">
            {completed.map(job => (
              <div key={job._id} className="card">
                <div className="flex-between mb-2">
                  <h3>{job.user?.firstName} {job.user?.lastName}</h3>
                  <span className="badge badge-completed">Completed</span>
                </div>
                <p className="text-sm">{job.description}</p>
                {job.reviews?.rating && (
                  <p className="text-sm mt-1">{'⭐'.repeat(job.reviews.rating)} — "{job.reviews.comment}"</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProviderDashboard;
