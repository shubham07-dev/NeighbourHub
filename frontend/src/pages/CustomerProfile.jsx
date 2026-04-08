import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CustomerProfile = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '', email: '', profilePicture: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/api/users/profile', { headers: { Authorization: `Bearer ${user.token}` } });
        setForm({ firstName: data.firstName || '', lastName: data.lastName || '', phoneNumber: data.phoneNumber || '', email: data.email || '', profilePicture: data.profilePicture || '' });
      } catch (err) { console.error(err); }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, profilePicture: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.put('/api/users/profile', form, { headers: { Authorization: `Bearer ${user.token}` } });
      login({ ...user, firstName: data.firstName });
      setMsg('Profile updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) { setMsg('Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="container" style={{maxWidth:'600px'}}>
      <div className="profile-header" style={{ position: 'relative' }}>
        <div className="profile-avatar" style={{ overflow: 'hidden' }}>
          {form.profilePicture ? (
            <img src={form.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            form.firstName?.charAt(0)?.toUpperCase()
          )}
        </div>
        <div className="profile-info">
          <h2>{form.firstName} {form.lastName}</h2>
          <p>{form.email}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Profile Picture</h3>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <div className="card">
        <h3 style={{marginBottom:'1rem'}}>Edit Profile</h3>
        {msg && <div className={msg.includes('fail') ? 'error-msg' : 'error-msg'} style={{background: msg.includes('success') ? 'rgba(46,204,113,0.1)' : undefined, color: msg.includes('success') ? '#2ecc71' : undefined}}>{msg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1.2rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>First Name</label>
              <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Last Name</label>
              <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input value={form.email} disabled style={{opacity:0.5}} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} placeholder="9876543210" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" style={{display: 'flex', justifyContent: 'center'}} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
};

export default CustomerProfile;
