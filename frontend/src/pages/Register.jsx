import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'cro_user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="brand-badge" style={{ fontSize: 12, marginBottom: 12 }}>CRO SYSTEM</div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 24, marginBottom: 4 }}>Create account</h2>
          <p style={{ color: '#64748b', fontSize: 14 }}>Join the assessment platform</p>
        </div>
        {error && <div className="alert-cro alert-error-cro">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label-cro">Full name</label>
            <input className="form-control-cro" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" required />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label-cro">Email address</label>
            <input className="form-control-cro" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" required />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label-cro">Role</label>
            <select className="form-control-cro" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="cro_user">CRO User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="form-label-cro">Password</label>
            <input className="form-control-cro" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required minLength={6} />
          </div>
          <button type="submit" className="btn-cro" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-person-plus-fill me-2"></i>}
            Create account
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#185FA5', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
