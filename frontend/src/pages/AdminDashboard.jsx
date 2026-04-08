import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const { data: d } = await axios.get('/api/admin/dashboard', { headers: { Authorization: `Bearer ${user.token}` } });
      setData(d);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    await axios.delete(`/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
    fetchDashboard();
  };

  const deleteProvider = async (id) => {
    if (!confirm('Delete this provider?')) return;
    await axios.delete(`/api/admin/providers/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
    fetchDashboard();
  };

  if (loading) return <div className="loading">Loading admin panel...</div>;
  if (!data) return <div className="empty">Failed to load dashboard</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage the entire platform from here</p>
      </div>

      <div className="grid grid-4" style={{marginBottom:'2rem'}}>
        <div className="stat-card"><div className="stat-number">{data.metrics.usersCount}</div><div className="stat-label">Customers</div></div>
        <div className="stat-card"><div className="stat-number">{data.metrics.providersCount}</div><div className="stat-label">Providers</div></div>
        <div className="stat-card"><div className="stat-number">{data.metrics.jobsCount}</div><div className="stat-label">Total Jobs</div></div>
        <div className="stat-card"><div className="stat-number">{data.metrics.completedJobs}</div><div className="stat-label">Completed</div></div>
      </div>

      <div className="role-selector" style={{marginBottom:'1.5rem',maxWidth:'400px'}}>
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Jobs</button>
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Customers</button>
        <button className={tab === 'providers' ? 'active' : ''} onClick={() => setTab('providers')}>Providers</button>
      </div>

      {tab === 'overview' && (
        <div className="card table-container">
          <table>
            <thead><tr><th>Customer</th><th>Provider</th><th>Service</th><th>Status</th></tr></thead>
            <tbody>
              {data.jobs.map(job => (
                <tr key={job._id}>
                  <td>{job.user?.firstName} {job.user?.lastName}</td>
                  <td>{job.provider?.firstName} {job.provider?.lastName}</td>
                  <td>{job.provider?.serviceType}</td>
                  <td><span className={`badge badge-${job.status}`}>{job.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.jobs.length === 0 && <div className="empty">No jobs yet</div>}
        </div>
      )}

      {tab === 'users' && (
        <div className="card table-container">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Action</th></tr></thead>
            <tbody>
              {data.users.map(u => (
                <tr key={u._id}>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>{u.phoneNumber || '—'}</td>
                  <td className="text-sm text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'providers' && (
        <div className="card table-container">
          <table>
            <thead><tr><th>Name</th><th>Service</th><th>Rate</th><th>Rating</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {data.providers.map(p => (
                <tr key={p._id}>
                  <td>{p.firstName} {p.lastName}</td>
                  <td><span className="badge badge-service">{p.serviceType}</span></td>
                  <td>₹{p.pricePerHour}/hr</td>
                  <td>{'⭐'.repeat(Math.round(p.avgReviews || 0))} ({p.numberOfReviews})</td>
                  <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => deleteProvider(p._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
