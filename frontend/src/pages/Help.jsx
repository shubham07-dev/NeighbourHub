import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const FAQS = [
  { q: "How do I book a service?", a: "Navigate to your dashboard, search for providers in your area, and click 'Book'. You can add details about the job and request the service." },
  { q: "How do payments work?", a: "Payments are currently handled directly between you and the provider outside the platform after the job is completed." },
  { q: "How do I become a provider?", a: "Sign out, go to the Sign In page, switch to the Provider tab, and register an account." },
  { q: "Can I cancel a job request?", a: "Yes, you can cancel a pending job from your 'My Jobs' page before the provider accepts it." }
];

const Help = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('other');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'support') {
      fetchMyTickets();
    }
  }, [user]);

  const fetchMyTickets = async () => {
    try {
      const { data } = await axios.get('/api/support/tickets/my', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setTickets(data);
    } catch (err) {
      console.error('Failed to fetch tickets');
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await axios.post('/api/support/tickets', { subject, category, message }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSuccess(true);
      setSubject('');
      setMessage('');
      fetchMyTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting ticket');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#3498db';
      case 'assigned': return '#f39c12';
      case 'resolved': return '#2ecc71';
      case 'closed': return '#95a5a6';
      default: return '#fff';
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 className="section-title" style={{ marginBottom: '2rem', textAlign: 'center' }}>Help & Support Center</h1>

      <div className="grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
        {/* Left Col: FAQ */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>{faq.q}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Create Ticket */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>Contact Support</h2>
          
          {user ? (
            <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && <div style={{ color: '#e74c3c', fontSize: '0.9rem', padding: '0.5rem', background: 'rgba(231,76,60,0.1)', borderRadius: '4px' }}>{error}</div>}
              {success && <div style={{ color: '#2ecc71', fontSize: '0.9rem', padding: '0.5rem', background: 'rgba(46,204,113,0.1)', borderRadius: '4px' }}>Ticket created successfully! We will get back to you soon.</div>}
              
              <div className="form-group">
                <label>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} required>
                  <option value="booking">Booking Issue</option>
                  <option value="payment">Payment Issue</option>
                  <option value="account">Account Management</option>
                  <option value="technical">Technical Bug</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required placeholder="Brief title of your issue" />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea rows="4" value={message} onChange={e => setMessage(e.target.value)} required placeholder="Describe your issue in detail..." style={{ padding: '0.8rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'white' }}></textarea>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          ) : (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
              <p style={{ marginBottom: '1rem' }}>You must be signed in to create a support ticket.</p>
              <button className="btn btn-primary" onClick={() => navigate('/login')}>Sign In to Contact Us</button>
            </div>
          )}
        </div>
      </div>

      {/* My Tickets Section */}
      {user && (user.role === 'customer' || user.role === 'provider') && (
        <div className="card" style={{ marginTop: '2rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>My Support Tickets</h2>
          
          {tickets.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <span style={{ fontSize: '2rem' }}>🎟️</span>
              <p>You haven't opened any support tickets yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket._id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{ticket._id.substring(0,6)}</td>
                      <td>{ticket.subject}</td>
                      <td>
                        <span style={{ 
                          padding: '0.2rem 0.6rem', 
                          borderRadius: '12px', 
                          fontSize: '0.75rem', 
                          fontWeight: '600',
                          background: `${getStatusColor(ticket.status)}20`,
                          color: getStatusColor(ticket.status)
                        }}>
                          {ticket.status.toUpperCase()}
                        </span>
                      </td>
                      <td>{new Date(ticket.updatedAt).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/help/ticket/${ticket._id}`} className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>View Chat</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Help;
