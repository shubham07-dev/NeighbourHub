import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const [agents, setAgents] = useState([]);
  const [newAgent, setNewAgent] = useState({ name: '', email: '', password: '' });

  useEffect(() => { fetchDashboard(); fetchAgents(); }, []);

  const fetchDashboard = async () => {
    try {
      const { data: d } = await axios.get('/api/admin/dashboard', { headers: { Authorization: `Bearer ${user.token}` } });
      setData(d);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchAgents = async () => {
    try {
      const { data: a } = await axios.get('/api/admin/support-agents', { headers: { Authorization: `Bearer ${user.token}` } });
      setAgents(a);
    } catch (err) { console.error(err); }
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

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/support-agents', newAgent, { headers: { Authorization: `Bearer ${user.token}` } });
      setNewAgent({ name: '', email: '', password: '' });
      fetchAgents();
    } catch (err) { alert(err.response?.data?.message || 'Failed to create agent'); }
  };

  const deleteAgent = async (id) => {
    if (!confirm('Delete this support agent?')) return;
    await axios.delete(`/api/admin/support-agents/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
    fetchAgents();
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

      <div className="role-selector" style={{marginBottom:'1.5rem',maxWidth:'500px'}}>
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Jobs</button>
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Customers</button>
        <button className={tab === 'providers' ? 'active' : ''} onClick={() => setTab('providers')}>Providers</button>
        <button className={tab === 'support' ? 'active' : ''} onClick={() => setTab('support')}>Support Team</button>
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

      {tab === 'support' && (
        <div className="grid-2" style={{gap:'2rem', alignItems: 'start'}}>
          <div className="card" style={{padding: '1.5rem'}}>
            <h3 style={{marginBottom:'1rem', color:'var(--accent)'}}>Create Support Agent</h3>
            <form onSubmit={handleCreateAgent}>
              <div className="form-group">
                <input type="text" placeholder="Full Name" value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value})} required style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem'}} />
                <input type="email" placeholder="Email" value={newAgent.email} onChange={e => setNewAgent({...newAgent, email: e.target.value})} required style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem'}} />
                <input type="password" placeholder="Password" value={newAgent.password} onChange={e => setNewAgent({...newAgent, password: e.target.value})} required style={{width:'100%', padding:'0.6rem', marginBottom:'0.5rem'}} />
              </div>
              <button type="submit" className="btn btn-primary" style={{width:'100%'}}>Create Agent</button>
            </form>
          </div>
          
          <div className="card table-container" style={{padding: '0'}}>
            <table style={{width:'100%'}}>
              <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {agents.map(a => (
                  <tr key={a._id}>
                    <td>{a.name}</td>
                    <td>{a.email}</td>
                    <td><span className={`badge`} style={{background: a.status === 'online' ? '#2ecc7122' : '#e74c3c22', color: a.status === 'online' ? '#2ecc71' : '#e74c3c'}}>{a.status}</span></td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => deleteAgent(a._id)}>Revoke</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {agents.length === 0 && <div className="empty">No support agents exist yet.</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
