import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/dashboard', icon: 'bi-grid-fill', label: 'Dashboard', section: 'Overview' },
  { to: '/assessment', icon: 'bi-clipboard2-check-fill', label: 'Assessment', section: 'Modules' },
  { to: '/revenue', icon: 'bi-currency-dollar', label: 'Revenue Impact', section: null },
  { to: '/churn', icon: 'bi-person-dash-fill', label: 'Customer Churn', section: null },
  { to: '/leads', icon: 'bi-funnel-fill', label: 'Lead Conversion', section: null },
  { to: '/recommendations', icon: 'bi-lightbulb-fill', label: 'Recommendations', section: 'Insights' },
  { to: '/reports', icon: 'bi-file-earmark-bar-graph-fill', label: 'Reports', section: null },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const renderNav = () => {
    let lastSection = null;
    return navItems.map((item) => {
      const showSection = item.section && item.section !== lastSection;
      if (showSection) lastSection = item.section;
      return (
        <div key={item.to}>
          {showSection && <div className="nav-section-label">{item.section}</div>}
          <NavLink to={item.to} className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
            <i className={`bi ${item.icon}`}></i>
            {item.label}
          </NavLink>
        </div>
      );
    });
  };

  return (
    <div style={{ display: 'flex' }}>
      <div className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-badge">CRO</div>
          <div className="brand-title">Technical Debt<br />Assessment System</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {renderNav()}
          {user?.role === 'admin' && (
            <>
              <div className="nav-section-label">Administration</div>
              <NavLink to="/admin" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                <i className="bi bi-gear-fill"></i> Admin Panel
              </NavLink>
            </>
          )}
        </div>
        <div style={{ padding: '12px 0', borderTop: '1px solid #e8ecf4' }}>
          <div className="nav-link-item" style={{ cursor: 'pointer' }} onClick={handleLogout}>
            <i className="bi bi-box-arrow-left"></i> Sign out
          </div>
        </div>
      </div>

      <div className="main-layout">
        <div className="topbar">
          <div className="topbar-title" id="page-heading">Dashboard</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div style={{ fontSize: '13px' }}>
              <div style={{ fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>
        </div>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
