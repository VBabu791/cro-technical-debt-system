import { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { churnAPI } from '../services/api';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Churn() {
  const [form, setForm] = useState({ total_customers: 850, lost_customers: 72 });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    document.getElementById('page-heading').textContent = 'Customer Churn Analysis';
    churnAPI.getAll().then(r => setHistory(r.data)).catch(() => {});
  }, []);

  const calc = () => {
    const rate = ((form.lost_customers / form.total_customers) * 100).toFixed(2);
    const retention = (100 - rate).toFixed(2);
    setResult({ rate, retention });
  };

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      const res = await churnAPI.create(form);
      setResult({ rate: res.data.churn_rate, retention: res.data.retention_rate });
      setMsg('Churn data saved!');
      churnAPI.getAll().then(r => setHistory(r.data)).catch(() => {});
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error saving.');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 4 }}>Customer Churn Analysis</h4>
        <p style={{ color: '#64748b', fontSize: 14 }}>Measure retention and identify churn trends impacting revenue.</p>
      </div>
      {msg && <div className={`alert-cro ${msg.includes('saved') ? 'alert-success-cro' : 'alert-error-cro'}`}>{msg}</div>}

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="content-card">
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 20 }}>Input data</div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label-cro">Total customers</label>
              <input className="form-control-cro" type="number" min="1" value={form.total_customers}
                onChange={e => setForm({ ...form, total_customers: +e.target.value })} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label-cro">Lost customers (this period)</label>
              <input className="form-control-cro" type="number" min="0" value={form.lost_customers}
                onChange={e => setForm({ ...form, lost_customers: +e.target.value })} />
            </div>
            <div style={{ background: '#f8faff', borderRadius: 8, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: '#64748b' }}>
              <strong style={{ color: '#185FA5' }}>Formula:</strong> Churn Rate = (Lost ÷ Total) × 100
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-cro" onClick={calc}><i className="bi bi-calculator-fill me-1"></i>Calculate</button>
              <button className="btn-outline-cro" onClick={save} disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-cloud-upload-fill me-1"></i>}Save
              </button>
            </div>
          </div>

          {result && (
            <div className="row g-3 mt-1">
              {[
                { label: 'Churn Rate', value: result.rate + '%', color: '#E24B4A' },
                { label: 'Retention Rate', value: result.retention + '%', color: '#1D9E75' },
                { label: 'Lost Customers', value: form.lost_customers, color: '#BA7517' },
              ].map((k, i) => (
                <div className="col-4" key={i}>
                  <div className="kpi-card" style={{ padding: '14px 12px' }}>
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value" style={{ fontSize: 22, color: k.color }}>{k.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-lg-7">
          {result && (
            <div className="content-card mb-3">
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 14 }}>Churn vs Retention breakdown</div>
              <div style={{ height: 220 }}>
                <Doughnut
                  data={{
                    labels: [`Churned (${result.rate}%)`, `Retained (${result.retention}%)`],
                    datasets: [{ data: [+result.rate, +result.retention], backgroundColor: ['#E24B4A', '#1D9E75'], borderWidth: 0 }]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { font: { size: 12 }, padding: 14 } } } }}
                />
              </div>
            </div>
          )}

          {history.length > 1 && (
            <div className="content-card">
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 14 }}>Churn trend over time</div>
              <div className="chart-container">
                <Bar
                  data={{
                    labels: history.slice(0, 8).map((_, i) => `Period ${i + 1}`).reverse(),
                    datasets: [{
                      label: 'Churn %',
                      data: history.slice(0, 8).map(h => h.churn_rate).reverse(),
                      backgroundColor: 'rgba(226,75,74,0.7)', borderRadius: 6, borderWidth: 0
                    }]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#94a3b8', callback: v => v + '%' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="content-card mt-4">
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 14 }}>Churn history</div>
          <table className="cro-table">
            <thead><tr><th>Date</th><th>Total Customers</th><th>Lost</th><th>Churn Rate</th><th>Retention</th></tr></thead>
            <tbody>
              {history.slice(0, 10).map(h => (
                <tr key={h.id}>
                  <td>{new Date(h.created_at).toLocaleDateString()}</td>
                  <td>{h.total_customers.toLocaleString()}</td>
                  <td style={{ color: '#E24B4A', fontWeight: 600 }}>{h.lost_customers}</td>
                  <td><strong>{Number(h.churn_rate).toFixed(1)}%</strong></td>
                  <td style={{ color: '#1D9E75', fontWeight: 600 }}>{(100 - h.churn_rate).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
