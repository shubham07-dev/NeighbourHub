import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SupportDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'support') {
      navigate('/support');
      return;
    }
    fetchTickets();
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchTickets = async () => {
    try {
      const { data } = await axios.get('/api/support-agent/tickets', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setTickets(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load tickets');
      setLoading(false);
    }
  };

  const acceptTicket = async (id) => {
    try {
      await axios.put(`/api/support-agent/tickets/${id}/accept`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept ticket');
    }
  };

  const myTickets = tickets.filter(t => t.assignedTo === user._id);
  const openTickets = tickets.filter(t => t.status === 'open');

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'var(--accent)', margin: 0 }}>Agent Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user.name} 🎧</p>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: My Assigned Tickets */}
        <div className="card" style={{ padding: '1.5rem', background: 'rgba(52, 152, 219, 0.05)', border: '1px solid rgba(52, 152, 219, 0.2)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#3498db' }}>My Active Tickets ({myTickets.length})</h2>
          {myTickets.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem', fontSize: '0.9rem' }}>You have no active tickets assigned.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myTickets.map(ticket => (
                <div key={ticket._id} style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{ticket._id.substring(0,8)}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: ticket.status === 'resolved' ? '#2ecc71' : '#f39c12' }}>{ticket.status.toUpperCase()}</span>
                  </div>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>{ticket.subject}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    From: {ticket.creatorName} ({ticket.creatorRole})
                  </div>
                  <Link to={`/support/ticket/${ticket._id}`} className="btn btn-primary" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '0.5rem' }}>
                    Open Chat
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Open Tickets waiting to be claimed */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent)' }}>Open Queue ({openTickets.length})</h2>
          {openTickets.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem', fontSize: '0.9rem' }}>No open tickets in the queue! 🎉</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {openTickets.map(ticket => (
                <div key={ticket._id} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px outset rgba(233, 69, 96, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{ticket._id.substring(0,8)}</span>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(233,69,96,0.1)', color: 'var(--accent)', borderRadius: '12px' }}>{ticket.category}</span>
                  </div>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>{ticket.subject}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    From: {ticket.creatorName} ({ticket.creatorRole})
                  </div>
                  <button onClick={() => acceptTicket(ticket._id)} className="btn btn-primary" style={{ width: '100%', padding: '0.5rem', background: 'var(--accent)', border: 'none', cursor: 'pointer' }}>
                    Accept & Assign to Me
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SupportDashboard;
