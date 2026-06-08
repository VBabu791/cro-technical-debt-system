import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="brand-badge" style={{ fontSize: 12, marginBottom: 12 }}>CRO SYSTEM</div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 24, marginBottom: 4 }}>Welcome back</h2>
          <p style={{ color: '#64748b', fontSize: 14 }}>Sign in to your assessment dashboard</p>
        </div>

        {error && <div className="alert-cro alert-error-cro">{error}</div>}
        <div className="alert-cro alert-info-cro" style={{ fontSize: 12 }}>
          <strong>Demo accounts:</strong> admin@cro.com or cro@cro.com &mdash; password: <code>Admin@123</code>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label-cro">Email address</label>
            <input className="form-control-cro" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" required />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="form-label-cro">Password</label>
            <input className="form-control-cro" type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn-cro" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-box-arrow-in-right me-2"></i>}
            Sign in
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#185FA5', fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
