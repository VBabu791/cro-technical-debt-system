import { useEffect, useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';
import { assessmentAPI, revenueAPI, churnAPI, leadsAPI } from '../services/api';
import LiveFeed from '../components/LiveFeed';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export default function Dashboard() {
  const { user } = useAuth();
  const { connected, subscribe } = useSocket(user?.id);
  const [assessments, setAssessments] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [churns, setChurns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    document.getElementById('page-heading').textContent = 'Dashboard';
    Promise.all([
      assessmentAPI.getAll().then(r => setAssessments(r.data)).catch(() => {}),
      revenueAPI.getAll().then(r => setRevenues(r.data)).catch(() => {}),
      churnAPI.getAll().then(r => setChurns(r.data)).catch(() => {}),
      leadsAPI.getAll().then(r => setLeads(r.data)).catch(() => {}),
    ]);
  }, []);

  // Real-time: update KPIs when new data comes in
  useEffect(() => {
    const unsub1 = subscribe('assessment:new', (data) => {
      setAssessments(prev => [data, ...prev]);
      setFlash('New assessment submitted!');
      setTimeout(() => setFlash(null), 4000);
    });
    const unsub2 = subscribe('revenue:new', (data) => {
      setRevenues(prev => [data, ...prev]);
    });
    const unsub3 = subscribe('churn:new', (data) => {
      setChurns(prev => [data, ...prev]);
    });
    const unsub4 = subscribe('leads:new', (data) => {
      setLeads(prev => [data, ...prev]);
    });
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, [subscribe]);

  const latestDebt = assessments[0]?.final_score ?? 72;
  const latestRevLoss = revenues[0]?.revenue_loss ?? 24000;
  const latestCRM = assessments[0]?.crm_score ?? 68;
  const latestChurn = churns[0]?.churn_rate ?? 8.4;
  const latestConv = leads[0]?.conversion_rate ?? 23.1;
  const debtColor = latestDebt >= 80 ? '#1D9E75' : latestDebt >= 60 ? '#BA7517' : '#E24B4A';

  const chartOpts = (yLabel) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#94a3b8', font: { size: 11 }, callback: v => yLabel ? v + yLabel : v } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } }
    }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h4 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 4 }}>Revenue Operations Overview</h4>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Monitor technical debt impact across all revenue channels</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: connected ? '#f0fdf4' : '#f1f5f9', padding: '5px 12px', borderRadius: 20 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: connected ? '#1D9E75' : '#94a3b8' }} />
          <span style={{ color: connected ? '#1D9E75' : '#94a3b8', fontWeight: 600 }}>{connected ? 'Real-time active' : 'Connecting...'}</span>
        </div>
      </div>

      {flash && (
        <div className="alert-cro alert-success-cro" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bi bi-broadcast-pin"></i> <strong>{flash}</strong> Dashboard updated in real-time.
        </div>
      )}

      <div className="row g-3 mb-4">
        {[
          { label: 'Tech Debt Score', value: Number(latestDebt).toFixed(1), sub: latestDebt >= 80 ? 'Low risk' : latestDebt >= 60 ? 'Moderate risk' : 'High risk', color: debtColor },
          { label: 'Revenue at Risk', value: '$' + (latestRevLoss / 1000).toFixed(0) + 'K', sub: latestRevLoss > 5000 ? 'High exposure' : 'Medium exposure', color: '#BA7517' },
          { label: 'CRM Health Score', value: latestCRM, sub: latestCRM >= 80 ? 'Healthy' : 'Needs attention', color: latestCRM >= 80 ? '#1D9E75' : '#BA7517' },
          { label: 'Churn Rate', value: Number(latestChurn).toFixed(1) + '%', sub: 'Monthly average', color: '#E24B4A' },
          { label: 'Lead Conversion', value: Number(latestConv).toFixed(1) + '%', sub: 'Current period', color: '#1D9E75' },
        ].map((k, i) => (
          <div className="col-6 col-md-4 col-xl" key={i}>
            <div className="kpi-card">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
              <div className="kpi-sub" style={{ color: k.color }}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <div className="content-card h-100">
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 16 }}>Revenue trend</div>
            <div className="chart-container">
              <Line data={{ labels: months, datasets: [{ label: 'Revenue ($K)', data: [180, 195, 188, 210, 225, 240], borderColor: '#185FA5', backgroundColor: 'rgba(24,95,165,0.06)', fill: true, tension: 0.4, pointRadius: 5, borderWidth: 2 }] }} options={chartOpts('K')} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="content-card h-100">
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 16 }}>Debt distribution</div>
            <div className="chart-container">
              <Doughnut data={{ labels: ['CRM (25%)', 'Website (20%)', 'Customer (20%)', 'Integration (15%)', 'Data (10%)', 'Reporting (10%)'], datasets: [{ data: [25, 20, 20, 15, 10, 10], backgroundColor: ['#185FA5', '#1D9E75', '#BA7517', '#D4537E', '#534AB7', '#378ADD'], borderWidth: 0 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { font: { size: 10 }, boxWidth: 10, padding: 8 } } } }} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="content-card">
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 16 }}>Monthly churn analysis</div>
            <div className="chart-container">
              <Bar data={{ labels: months, datasets: [{ label: 'Churn %', data: [9.2, 8.8, 9.5, 8.1, 8.4, 7.9], backgroundColor: 'rgba(226,75,74,0.7)', borderRadius: 6, borderWidth: 0 }] }} options={chartOpts('%')} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="content-card">
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 16 }}>Lead conversion trend</div>
            <div className="chart-container">
              <Line data={{ labels: months, datasets: [{ label: 'Conversion %', data: [19.5, 21.0, 20.2, 22.8, 21.5, 23.1], borderColor: '#1D9E75', backgroundColor: 'rgba(29,158,117,0.06)', fill: true, tension: 0.4, pointRadius: 5, borderWidth: 2 }] }} options={{ ...chartOpts('%'), scales: { ...chartOpts('%').scales, y: { ...chartOpts('%').scales.y, min: 15, max: 30 } } }} />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <div className="content-card">
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 14 }}>Recent assessments</div>
            <div style={{ overflowX: 'auto' }}>
              <table className="cro-table">
                <thead><tr><th>Date</th><th>CRM Score</th><th>Website</th><th>Customer</th><th>Final Score</th><th>Risk Level</th></tr></thead>
                <tbody>
                  {assessments.length > 0 ? assessments.slice(0, 5).map((a, i) => (
                    <tr key={a.id || i} style={{ background: i === 0 && flash ? '#f0fdf4' : 'transparent', transition: 'background 1s' }}>
                      <td>{a.created_at ? new Date(a.created_at).toLocaleDateString() : 'Just now'}</td>
                      <td>{a.crm_score}</td><td>{a.website_score}</td><td>{a.customer_score}</td>
                      <td><strong>{Number(a.final_score).toFixed(1)}</strong></td>
                      <td><span className={`badge-${a.final_score >= 80 ? 'low' : a.final_score >= 60 ? 'medium' : 'high'}`}>{a.final_score >= 80 ? 'Low' : a.final_score >= 60 ? 'Moderate' : 'High'}</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>No assessments yet — run your first assessment.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <LiveFeed />
        </div>
      </div>
    </div>
  );
}
