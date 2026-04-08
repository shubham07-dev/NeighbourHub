import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TicketChat = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return navigate('/login');
    fetchTicket();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchTicket, 3000);
    return () => clearInterval(interval);
  }, [id, user]);

  const fetchTicket = async () => {
    try {
      const { data } = await axios.get(`/api/support/tickets/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setTicket(data);
      setMessages(data.messages);
      setLoading(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading ticket');
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const textToSend = newMessage;
    setNewMessage('');
    
    // Optimistic UI update
    setMessages(prev => [...prev, {
      _id: 'temp',
      sender: user._id,
      senderRole: user.role,
      senderName: user.firstName || user.name,
      text: textToSend,
      createdAt: new Date().toISOString()
    }]);

    try {
      await axios.post(`/api/support/tickets/${id}/messages`, { text: textToSend }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      await fetchTicket();
    } catch (err) {
      console.error('Failed to send message');
      fetchTicket(); // Revert optimistic update on failure
    }
  };

  const handleResolve = async () => {
    if (user.role !== 'support') return;
    if (window.confirm('Are you sure you want to mark this ticket as resolved?')) {
      try {
        await axios.put(`/api/support-agent/tickets/${id}/resolve`, {}, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchTicket();
      } catch (err) { alert('Failed to resolve ticket'); }
    }
  };

  if (loading) return <div className="loading">Loading chat...</div>;
  if (error) return <div className="empty-state" style={{ padding: '4rem 0', color: '#e74c3c' }}>{error}</div>;
  if (!ticket) return <div className="empty-state">Ticket not found</div>;

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Ticket Header */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ticket #{ticket._id.substring(0,8)}</span>
          <h1 style={{ fontSize: '1.4rem', margin: '0.2rem 0' }}>{ticket.subject}</h1>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--accent)' }}>👤 {ticket.creatorName} ({ticket.creatorRole})</span>
            {ticket.assignedAgentName && <span style={{ color: '#3498db' }}>🎧 Assigned to: {ticket.assignedAgentName}</span>}
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <span style={{ 
            display: 'inline-block',
            padding: '0.3rem 0.8rem', 
            borderRadius: '16px', 
            fontSize: '0.8rem', 
            fontWeight: '600',
            background: ticket.status === 'resolved' ? 'rgba(46,204,113,0.1)' : 'rgba(243,156,18,0.1)',
            color: ticket.status === 'resolved' ? '#2ecc71' : '#f39c12',
            marginBottom: '0.5rem'
          }}>
            Status: {ticket.status.toUpperCase()}
          </span>
          {user.role === 'support' && ticket.status !== 'resolved' && (
            <button onClick={handleResolve} className="btn" style={{ display: 'block', background: '#2ecc71', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
              Mark Resolved ✓
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        
        {/* Messages Box */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg, i) => {
            const isMe = msg.sender === user._id;
            const isSupport = msg.senderRole === 'support';
            
            return (
              <div key={msg._id || i} style={{ 
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', padding: '0 0.5rem' }}>
                  {msg.senderName} {isSupport ? '🎧 (Support)' : ''} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                
                <div style={{ 
                  background: isMe ? 'linear-gradient(135deg, var(--accent), var(--accent-light))' : 'var(--bg-card)', 
                  border: isMe ? 'none' : '1px solid var(--border)',
                  color: isMe ? 'white' : 'var(--text-primary)',
                  padding: '0.8rem 1.2rem', 
                  borderRadius: isMe ? '18px 18px 0 18px' : '18px 18px 18px 0',
                  boxShadow: 'var(--shadow-sm)',
                  lineHeight: '1.4'
                }}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        {ticket.status === 'resolved' || ticket.status === 'closed' ? (
          <div style={{ padding: '1rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', color: 'var(--text-muted)' }}>
            This ticket has been marked as {ticket.status}. Chat is disabled.
          </div>
        ) : (
          <form onSubmit={sendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', background: 'var(--bg-card)' }}>
            <input 
              type="text" 
              value={newMessage} 
              onChange={e => setNewMessage(e.target.value)} 
              placeholder="Type your message here..." 
              style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: '24px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'white', outline: 'none' }}
              disabled={ticket.status === 'resolved'}
            />
            <button type="submit" style={{ 
              background: 'var(--accent)', 
              color: 'white', 
              border: 'none', 
              width: '45px', 
              height: '45px', 
              borderRadius: '50%', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)'
            }}>
              ➤
            </button>
          </form>
        )}
      </div>

    </div>
  );
};

export default TicketChat;
