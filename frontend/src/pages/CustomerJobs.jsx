import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CustomerJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState({ jobId: null, rating: 5, comment: '' });
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

  if (loading) return <div className="loading">Loading your jobs...</div>;

  const activeJobs = jobs.filter(j => ['pending', 'accepted', 'ongoing'].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const rejectedJobs = jobs.filter(j => j.status === 'rejected');

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

      {jobs.length === 0 ? <div className="empty-state"><div className="empty-icon">📋</div><p>No jobs yet. Go find a service provider!</p></div> : (
        <>
          {activeJobs.length > 0 && (
            <>
              <h2 className="section-title" style={{marginBottom:'1rem'}}>🔄 Active Jobs</h2>
              <div className="grid grid-2" style={{marginBottom:'2rem'}}>
                {activeJobs.map(job => (
                  <div key={job._id} className="card">
                    <div className="flex-between mb-2">
                      <h3>{job.provider?.firstName} {job.provider?.lastName}</h3>
                      <span className={`badge badge-${job.status}`}>{job.status}</span>
                    </div>
                    <p className="text-sm text-muted">{job.provider?.serviceType} — ₹{job.provider?.pricePerHour}/hr</p>
                    <p className="text-sm mt-1">{job.description}</p>
                    {job.provider?.phoneNumber && <p className="text-sm text-muted mt-1">📞 {job.provider.phoneNumber}</p>}

                    {/* Show Route button when accepted/ongoing */}
                    {['accepted', 'ongoing'].includes(job.status) && (
                      <button
                        className="btn btn-route mt-1"
                        onClick={() => openRoute(job.provider?.location, job.user?.location)}
                      >
                        🗺️ Show Route on Map
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {completedJobs.length > 0 && (
            <>
              <h2 className="section-title" style={{marginBottom:'1rem'}}>✅ Completed</h2>
              <div className="grid grid-2" style={{marginBottom:'2rem'}}>
                {completedJobs.map(job => (
                  <div key={job._id} className="card">
                    <div className="flex-between mb-2">
                      <h3>{job.provider?.firstName} {job.provider?.lastName}</h3>
                      <span className="badge badge-completed">Completed</span>
                    </div>
                    <p className="text-sm text-muted">{job.provider?.serviceType}</p>
                    <p className="text-sm mt-1">{job.description}</p>
                    <hr className="divider" />
                    {job.reviews?.rating ? (
                      <div className="text-sm"><span className="stars">{'⭐'.repeat(job.reviews.rating)}</span> <span className="text-muted">"{job.reviews.comment}"</span></div>
                    ) : (
                      reviewData.jobId === job._id ? (
                        <div>
                          <div className="form-group">
                            <label>Rating</label>
                            <select value={reviewData.rating} onChange={e => setReviewData({...reviewData, rating: Number(e.target.value)})}>
                              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                            </select>
                          </div>
                          <div className="form-group">
                            <textarea placeholder="Your review..." value={reviewData.comment} onChange={e => setReviewData({...reviewData, comment: e.target.value})} rows="2" />
                          </div>
                          <div className="flex gap-1">
                            <button className="btn btn-success btn-sm" onClick={() => submitReview(job._id)}>Submit Review</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setReviewData({jobId: null, rating: 5, comment: ''})}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => setReviewData({...reviewData, jobId: job._id})}>Leave a Review</button>
                      )
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {rejectedJobs.length > 0 && (
            <>
              <h2 className="section-title" style={{marginBottom:'1rem'}}>❌ Rejected</h2>
              <div className="grid grid-2">
                {rejectedJobs.map(job => (
                  <div key={job._id} className="card" style={{opacity:0.6}}>
                    <div className="flex-between mb-2">
                      <h3>{job.provider?.firstName} {job.provider?.lastName}</h3>
                      <span className="badge badge-rejected">Rejected</span>
                    </div>
                    <p className="text-sm">{job.description}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerJobs;
