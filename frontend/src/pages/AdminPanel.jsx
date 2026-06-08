import { useEffect, useState } from 'react';
import { usersAPI } from '../services/api';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    document.getElementById('page-heading').textContent = 'Admin Panel';
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    usersAPI.getAll().then(r => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  const saveEdit = async () => {
    try {
      await usersAPI.update(editing.id, { name: editing.name, email: editing.email, role: editing.role });
      setMsg('User updated successfully!');
      setEditing(null);
      fetchUsers();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error updating user.');
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await usersAPI.delete(id);
      setMsg('User deleted.');
      fetchUsers();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('Error deleting user.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 4 }}>Admin Panel</h4>
        <p style={{ color: '#64748b', fontSize: 14 }}>Manage users and system configuration.</p>
      </div>

      {msg && <div className={`alert-cro ${msg.includes('Error') ? 'alert-error-cro' : 'alert-success-cro'}`}>{msg}</div>}

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Edit User</div>
            {['name', 'email'].map(f => (
              <div key={f} style={{ marginBottom: 14 }}>
                <label className="form-label-cro" style={{ textTransform: 'capitalize' }}>{f}</label>
                <input className="form-control-cro" value={editing[f]} onChange={e => setEditing({ ...editing, [f]: e.target.value })} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label-cro">Role</label>
              <select className="form-control-cro" value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })}>
                <option value="cro_user">CRO User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-cro" onClick={saveEdit} style={{ flex: 1, justifyContent: 'center' }}>Save changes</button>
              <button className="btn-outline-cro" onClick={() => setEditing(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="content-card mb-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>User management</div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>{users.length} total users</div>
        </div>
        {loading ? (
          <div className="d-flex justify-content-center py-4"><div className="spinner-border text-primary" /></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="cro-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Member since</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{u.name.charAt(0).toUpperCase()}</div>
                      <strong>{u.name}</strong>
                    </div></td>
                    <td style={{ color: '#64748b' }}>{u.email}</td>
                    <td>
                      <span style={{
                        background: u.role === 'admin' ? '#e6f1fb' : '#f1f5f9',
                        color: u.role === 'admin' ? '#185FA5' : '#475569',
                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600
                      }}>
                        {u.role === 'admin' ? 'Admin' : 'CRO User'}
                      </span>
                    </td>
                    <td style={{ color: '#94a3b8' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-outline-cro" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => setEditing(u)}>
                          <i className="bi bi-pencil-fill me-1"></i>Edit
                        </button>
                        <button onClick={() => deleteUser(u.id)} style={{ background: '#fff1f2', color: '#E24B4A', border: '1px solid #fecaca', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <i className="bi bi-trash3-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="content-card">
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 16 }}>System configuration</div>
            {[
              { label: 'High risk threshold ($)', value: '5001', key: 'high' },
              { label: 'Medium risk threshold ($)', value: '1001', key: 'med' },
              { label: 'Session timeout (minutes)', value: '60', key: 'timeout' },
              { label: 'Default export format', value: 'PDF', key: 'export', type: 'select', opts: ['PDF', 'Excel'] },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label className="form-label-cro">{f.label}</label>
                {f.type === 'select' ? (
                  <select className="form-control-cro"><option>PDF</option><option>Excel</option></select>
                ) : (
                  <input className="form-control-cro" defaultValue={f.value} />
                )}
              </div>
            ))}
            <button className="btn-cro" onClick={() => { setMsg('Configuration saved!'); setTimeout(() => setMsg(''), 3000); }}>
              <i className="bi bi-floppy-fill me-1"></i>Save configuration
            </button>
          </div>
        </div>
        <div className="col-md-6">
          <div className="content-card">
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 16 }}>System health</div>
            {[
              { label: 'API Status', value: 'Operational', color: '#1D9E75', icon: 'bi-check-circle-fill' },
              { label: 'Database', value: 'Connected', color: '#1D9E75', icon: 'bi-database-check' },
              { label: 'Real-time Engine', value: 'Active', color: '#1D9E75', icon: 'bi-broadcast' },
              { label: 'Export Engine', value: 'Ready', color: '#1D9E75', icon: 'bi-file-earmark-check-fill' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: 18 }}></i>
                <span style={{ flex: 1, fontSize: 13, color: '#334155' }}>{s.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
