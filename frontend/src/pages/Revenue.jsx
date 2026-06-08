import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { revenueAPI } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function Revenue() {
  const [form, setForm] = useState({ downtime_hours: 8, revenue_per_hour: 3500 });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    document.getElementById('page-heading').textContent = 'Revenue Impact Analysis';
    revenueAPI.getAll().then(r => setHistory(r.data)).catch(() => {});
  }, []);

  const calcRevenue = () => {
    const loss = form.downtime_hours * form.revenue_per_hour;
    const risk = loss <= 1000 ? 'Low' : loss <= 5000 ? 'Medium' : 'High';
    setResult({ loss, risk });
    return { loss, risk };
  };

  const saveRevenue = async () => {
    setSaving(true); setMsg('');
    try {
      const res = await revenueAPI.create(form);
      setResult({ loss: res.data.revenue_loss, risk: res.data.risk_level });
      setMsg('Revenue analysis saved!');
      revenueAPI.getAll().then(r => setHistory(r.data)).catch(() => {});
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error saving.');
    } finally { setSaving(false); }
  };

  const riskColor = result?.risk === 'Low' ? '#1D9E75' : result?.risk === 'Medium' ? '#BA7517' : '#E24B4A';

  const chartData = {
    labels: history.slice(0,6).map((_, i) => `Record ${i+1}`).reverse(),
    datasets: [{
      label: 'Revenue Loss ($)',
      data: history.slice(0,6).map(h => h.revenue_loss).reverse(),
      backgroundColor: history.slice(0,6).map(h => h.risk_level === 'Low' ? 'rgba(29,158,117,0.7)' : h.risk_level === 'Medium' ? 'rgba(186,117,23,0.7)' : 'rgba(226,75,74,0.7)').reverse(),
      borderRadius: 6,
    }]
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 4 }}>Revenue Impact Analysis</h4>
        <p style={{ color: '#64748b', fontSize: 14 }}>Calculate revenue loss from system downtime caused by technical debt.</p>
      </div>
      {msg && <div className={`alert-cro ${msg.includes('saved') ? 'alert-success-cro' : 'alert-error-cro'}`}>{msg}</div>}

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="content-card">
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 20 }}>Input parameters</div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label-cro">Downtime hours</label>
              <input className="form-control-cro" type="number" value={form.downtime_hours} min="0" step="0.5"
                onChange={e => setForm({ ...form, downtime_hours: +e.target.value })} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label-cro">Revenue per hour ($)</label>
              <input className="form-control-cro" type="number" value={form.revenue_per_hour} min="0"
                onChange={e => setForm({ ...form, revenue_per_hour: +e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-cro" onClick={calcRevenue}><i className="bi bi-calculator-fill me-1"></i>Calculate</button>
              <button className="btn-outline-cro" onClick={saveRevenue} disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-cloud-upload-fill me-1"></i>}
                Save
              </button>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Risk thresholds</div>
            {[['Low', '$0 – $1,000', '#1D9E75'], ['Medium', '$1,001 – $5,000', '#BA7517'], ['High', '$5,001+', '#E24B4A']].map(([r, range, c]) => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#fff', borderRadius: 8, marginBottom: 6, border: '1px solid #e8ecf4' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, flexShrink: 0 }}></div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{r}</span>
                <span style={{ fontSize: 13, color: '#64748b', marginLeft: 'auto' }}>{range}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-6">
          {result && (
            <div className="content-card mb-3">
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 16 }}>Analysis result</div>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 52, fontWeight: 700, color: riskColor }}>
                  ${result.loss.toLocaleString()}
                </div>
                <div style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>Total revenue loss</div>
                <span className={`badge-${result.risk.toLowerCase()}`} style={{ fontSize: 14, padding: '6px 18px' }}>{result.risk} Risk</span>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                {[
                  ['Downtime hours', form.downtime_hours + ' hrs'],
                  ['Revenue per hour', '$' + form.revenue_per_hour.toLocaleString()],
                  ['Revenue loss', '$' + result.loss.toLocaleString()],
                  ['Formula', `${form.downtime_hours} × $${form.revenue_per_hour.toLocaleString()}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>{k}</span><strong>{v}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="content-card">
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 14 }}>Historical revenue loss</div>
              <div className="chart-container">
                <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#94a3b8', callback: v => '$' + v.toLocaleString() } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="content-card mt-4">
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 14 }}>Revenue loss history</div>
          <table className="cro-table">
            <thead><tr><th>Date</th><th>Downtime (hrs)</th><th>Revenue/hr</th><th>Revenue loss</th><th>Risk level</th></tr></thead>
            <tbody>
              {history.slice(0,10).map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>{r.downtime_hours}</td>
                  <td>${Number(r.revenue_per_hour).toLocaleString()}</td>
                  <td><strong>${Number(r.revenue_loss).toLocaleString()}</strong></td>
                  <td><span className={`badge-${r.risk_level.toLowerCase()}`}>{r.risk_level}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
