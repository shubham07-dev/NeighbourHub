import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ClipboardList, RefreshCw, Map, CheckCircle, Star, XCircle, Phone, Check, Video } from 'lucide-react';

const CustomerJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState({ jobId: null, rating: 5, comment: '' });
  const [negotiatePrice, setNegotiatePrice] = useState({});
  const [filterView, setFilterView] = useState('all');
  const [activeVideoCall, setActiveVideoCall] = useState(null);
  const intervalRef = useRef(null);

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get('/api/jobs/my', { headers: { Authorization: `Bearer ${user.token}` } });
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

  const handleNegotiate = async (jobId) => {
    if (!negotiatePrice[jobId]) return alert('Please enter a valid price');
    if (Number(negotiatePrice[jobId]) < 100) return alert('Price cannot be lower than ₹100');
    try {
      await axios.put(`/api/jobs/${jobId}/negotiate`, { price: Number(negotiatePrice[jobId]) }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchJobs();
      setNegotiatePrice({ ...negotiatePrice, [jobId]: '' });
    } catch (err) { alert(err.response?.data?.message || 'Negotiation failed'); }
  };

  const handleAcceptPrice = async (jobId) => {
    try {
      await axios.put(`/api/jobs/${jobId}/accept-price`, {}, {  
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchJobs();
    } catch (err) { alert(err.response?.data?.message || 'Accept price failed'); }
  };

  const submitReview = async (jobId) => {
    try {
      await axios.put(`/api/jobs/${jobId}/review`, { rating: reviewData.rating, comment: reviewData.comment }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setReviewData({ jobId: null, rating: 5, comment: '' });
      fetchJobs();
    } catch (err) { alert(err.response?.data?.message || 'Review failed'); }
  };

  const openRoute = (providerLoc, userLoc) => {
    // Graceful fallback if native location is missing
    const pLoc = providerLoc?.coordinates || [80.9462, 26.8467];
    const uLoc = userLoc?.coordinates || [81.0000, 26.9000];

    const [pLng, pLat] = pLoc;
    const [uLng, uLat] = uLoc;
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${pLat},${pLng}&destination=${uLat},${uLng}&travelmode=driving`, '_blank');
  };

  if (loading) return <div className="loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}><RefreshCw className="animate-spin" style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} /> Loading your jobs...</div>;

  const activeJobs = jobs.filter(j => ['pending', 'accepted', 'ongoing'].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const rejectedJobs = jobs.filter(j => j.status === 'rejected');

  const totalSpent = completedJobs.reduce((sum, job) => sum + (job.agreedPrice || job.provider?.pricePerHour || 0), 0);

  const renderJobCard = (job) => (
    <div key={job._id} className="card" style={{ opacity: job.status === 'rejected' ? 0.6 : 1 }}>
      <div className="flex-between mb-2">
        <h3>{job.provider?.firstName} {job.provider?.lastName}</h3>
        <span className={`badge badge-${job.status}`}>{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span>
      </div>
      
      {job.status === 'completed' && <p className="text-sm text-muted mt-1" style={{ marginBottom: '0.4rem', fontWeight: 500 }}>Spent: ₹{job.agreedPrice || job.provider?.pricePerHour}</p>}
      
      <p className="text-sm">{job.description}</p>

      {job.negotiation?.isNegotiating && job.status === 'pending' && (
        <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
          {job.negotiation.proposedBy === 'provider' ? (
            <>
              <div style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                <span style={{ color: '#3498db' }}>Provider Counter-Offer:</span> <strong>₹{job.negotiation.price}</strong>
                <span className="text-muted text-sm" style={{ marginLeft: '0.5rem' }}>(Round {job.negotiation.roundCount}/4)</span>
              </div>
              <div className="flex gap-1" style={{ flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <button className="btn btn-success btn-sm" onClick={() => handleAcceptPrice(job._id)} style={{ flex: 1 }}><Check size={16} /> Accept Price</button>
              </div>
              {job.negotiation.roundCount < 4 && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" placeholder="Counter Offer (₹)" value={negotiatePrice[job._id] || ''} onChange={e => setNegotiatePrice({ ...negotiatePrice, [job._id]: e.target.value })} style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'white' }} />
                  <button className="btn btn-primary btn-sm" onClick={() => handleNegotiate(job._id)}>Counter</button>
                </div>
              )}
            </>
          ) : (
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>You offered ₹{job.negotiation.price}. Waiting for provider to accept or counter...</p>
          )}
        </div>
      )}

      {job.provider?.phoneNumber && (
        <p className="text-sm text-muted mt-1" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Phone size={14} /> 
          {['accepted', 'ongoing', 'completed'].includes(job.status) ? job.provider.phoneNumber : <span style={{fontStyle: 'italic'}}>Hidden until accepted</span>}
        </p>
      )}

      {['accepted', 'ongoing'].includes(job.status) && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            className="btn btn-route mt-1"
            onClick={() => openRoute(job.provider?.location, job.user?.location)}
            style={{ flex: 1, justifyContent: 'center', marginTop: 0 }}
          >
            <Map size={16} /> Map
          </button>
          <button
            className="btn btn-success mt-1"
            onClick={() => setActiveVideoCall(job._id)}
            style={{ flex: 1, justifyContent: 'center', marginTop: 0, background: '#2ecc71', color: '#fff' }}
          >
            <Video size={16} /> Video Call
          </button>
        </div>
      )}

      {job.status === 'completed' && (
        <>
          <hr className="divider" />
          {job.reviews?.rating ? (
            <div className="text-sm"><span className="stars" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--accent-yellow)' }}>{[...Array(job.reviews.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</span> <span className="text-muted" style={{ display: 'block', marginTop: '0.3rem' }}>"{job.reviews.comment}"</span></div>
          ) : (
            reviewData.jobId === job._id ? (
              <div style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label>Rating</label>
                  <select value={reviewData.rating} onChange={e => setReviewData({ ...reviewData, rating: Number(e.target.value) })}>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <textarea placeholder="Your review..." value={reviewData.comment} onChange={e => setReviewData({ ...reviewData, comment: e.target.value })} rows="2" />
                </div>
                <div className="flex gap-1" style={{ flexDirection: 'column' }}>
                  <button className="btn btn-success btn-sm" onClick={() => submitReview(job._id)}>Submit Review</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setReviewData({ jobId: null, rating: 5, comment: '' })}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setReviewData({ ...reviewData, jobId: job._id })} style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>Leave a Review</button>
            )
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="container">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1>My Jobs</h1>
            <p>Track the status of your booked services</p>
          </div>
          <div className="live-indicator">
            <span className="live-dot" /> Live Updates
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div 
          className="stat-card" 
          style={{ background: filterView === 'spent' ? '#3498db' : 'var(--bg-secondary)', color: filterView === 'spent' ? '#fff' : 'inherit', cursor: 'pointer' }}
          onClick={() => setFilterView('spent')}
        >
          <div className="stat-number" style={{ color: filterView === 'spent' ? '#fff' : '#3498db' }}>₹{totalSpent}</div>
          <div className="stat-label" style={{ color: filterView === 'spent' ? '#fff' : 'var(--text-muted)' }}>Total Spent</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer', border: filterView === 'all' ? '1px solid var(--accent-primary)' : '1px solid transparent' }} onClick={() => setFilterView('all')}><div className="stat-number">{jobs.length}</div><div className="stat-label">Total Jobs</div></div>
        <div className="stat-card" style={{ cursor: 'pointer', border: filterView === 'active' ? '1px solid var(--accent-primary)' : '1px solid transparent' }} onClick={() => setFilterView('active')}><div className="stat-number">{activeJobs.length}</div><div className="stat-label">Active</div></div>
        <div className="stat-card" style={{ cursor: 'pointer', border: filterView === 'completed' ? '1px solid var(--accent-primary)' : '1px solid transparent' }} onClick={() => setFilterView('completed')}><div className="stat-number">{completedJobs.length}</div><div className="stat-label">Completed</div></div>
        <div className="stat-card" style={{ cursor: 'pointer', border: filterView === 'rejected' ? '1px solid var(--accent-primary)' : '1px solid transparent' }} onClick={() => setFilterView('rejected')}><div className="stat-number">{rejectedJobs.length}</div><div className="stat-label">Rejected</div></div>
      </div>

      {filterView === 'spent' && (
        completedJobs.length > 0 ? (
          <>
            <h2 className="section-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Spending Breakdown</h2>
            <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
              {completedJobs.map(job => (
                <div key={job._id} className="card">
                  <div className="flex-between mb-2">
                    <h3>{job.provider?.firstName} {job.provider?.lastName}</h3>
                    <span className="text-muted text-sm">{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3498db', marginBottom: '0.5rem' }}>
                    - ₹{job.agreedPrice || job.provider?.pricePerHour}
                  </div>
                  <p className="text-sm">{job.description}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>0 Spendings yet</div>
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

      {filterView === 'active' && (
        activeJobs.length > 0 ? (
          <>
            <h2 className="section-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><RefreshCw size={20} /> Active Jobs</h2>
            <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
              {activeJobs.map(job => renderJobCard(job))}
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>0 Active Jobs</div>
        )
      )}

      {filterView === 'completed' && (
        completedJobs.length > 0 ? (
          <>
            <h2 className="section-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={20} color="var(--accent-green)" /> Completed</h2>
            <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
              {completedJobs.map(job => renderJobCard(job))}
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>0 Completed Jobs</div>
        )
      )}

      {filterView === 'rejected' && (
        rejectedJobs.length > 0 ? (
          <>
            <h2 className="section-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><XCircle size={20} color="#e74c3c" /> Rejected</h2>
            <div className="grid grid-2">
              {rejectedJobs.map(job => renderJobCard(job))}
            </div>
          </>
        ) : (
           <div className="empty-state" style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>0 Rejected Jobs</div>
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

export default CustomerJobs;
