import { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import { leadsAPI } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler);

export default function Leads() {
  const [form, setForm] = useState({ total_leads: 420, converted_leads: 97 });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    document.getElementById('page-heading').textContent = 'Lead Conversion';
    leadsAPI.getAll().then(r => setHistory(r.data)).catch(() => {});
  }, []);

  const calc = () => {
    const rate = ((form.converted_leads / form.total_leads) * 100).toFixed(2);
    setResult({ rate, unconverted: form.total_leads - form.converted_leads });
  };

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      const res = await leadsAPI.create(form);
      setResult({ rate: res.data.conversion_rate, unconverted: form.total_leads - form.converted_leads });
      setMsg('Lead conversion data saved!');
      leadsAPI.getAll().then(r => setHistory(r.data)).catch(() => {});
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error saving.');
    } finally { setSaving(false); }
  };

  const benchmark = result ? (+result.rate >= 25 ? 'Above benchmark' : +result.rate >= 15 ? 'At benchmark' : 'Below benchmark') : '';
  const benchColor = result ? (+result.rate >= 25 ? '#1D9E75' : +result.rate >= 15 ? '#BA7517' : '#E24B4A') : '#1a1a2e';

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 4 }}>Lead Conversion Analysis</h4>
        <p style={{ color: '#64748b', fontSize: 14 }}>Track how technical debt affects your sales funnel efficiency.</p>
      </div>
      {msg && <div className={`alert-cro ${msg.includes('saved') ? 'alert-success-cro' : 'alert-error-cro'}`}>{msg}</div>}

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="content-card">
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 20 }}>Input data</div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label-cro">Total leads this period</label>
              <input className="form-control-cro" type="number" min="1" value={form.total_leads}
                onChange={e => setForm({ ...form, total_leads: +e.target.value })} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label-cro">Converted leads</label>
              <input className="form-control-cro" type="number" min="0" value={form.converted_leads}
                onChange={e => setForm({ ...form, converted_leads: +e.target.value })} />
            </div>
            <div style={{ background: '#f8faff', borderRadius: 8, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: '#64748b' }}>
              <strong style={{ color: '#185FA5' }}>Formula:</strong> Conversion Rate = (Converted ÷ Total) × 100
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-cro" onClick={calc}><i className="bi bi-calculator-fill me-1"></i>Calculate</button>
              <button className="btn-outline-cro" onClick={save} disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-cloud-upload-fill me-1"></i>}Save
              </button>
            </div>
          </div>

          {result && (
            <div className="content-card mt-3">
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 56, fontWeight: 700, color: '#185FA5' }}>{result.rate}%</div>
                <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>Conversion rate</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: benchColor }}>{benchmark}</span>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                {[
                  ['Total leads', form.total_leads.toLocaleString()],
                  ['Converted', form.converted_leads.toLocaleString()],
                  ['Not converted', result.unconverted.toLocaleString()],
                  ['Rate', result.rate + '%'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>{k}</span><strong>{v}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-7">
          {result && (
            <div className="content-card mb-3">
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 14 }}>Funnel breakdown</div>
              <div className="chart-container">
                <Bar
                  data={{
                    labels: ['Converted', 'Not Converted'],
                    datasets: [{
                      data: [form.converted_leads, result.unconverted],
                      backgroundColor: ['rgba(24,95,165,0.8)', 'rgba(180,178,169,0.5)'],
                      borderRadius: 8, borderWidth: 0
                    }]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }}
                />
              </div>
            </div>
          )}

          {history.length > 1 && (
            <div className="content-card">
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 14 }}>Conversion trend</div>
              <div className="chart-container">
                <Line
                  data={{
                    labels: history.slice(0, 8).map((_, i) => `Period ${i + 1}`).reverse(),
                    datasets: [{
                      label: 'Conversion %',
                      data: history.slice(0, 8).map(h => h.conversion_rate).reverse(),
                      borderColor: '#185FA5', backgroundColor: 'rgba(24,95,165,0.06)',
                      fill: true, tension: 0.4, pointRadius: 5, borderWidth: 2
                    }]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#94a3b8', callback: v => v + '%' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }}
                />
              </div>
            </div>
          )}

          <div className="content-card mt-3">
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 12 }}>Industry benchmarks</div>
            {[
              { label: 'SaaS / Software', range: '20 – 25%', color: '#185FA5' },
              { label: 'Enterprise B2B', range: '10 – 15%', color: '#1D9E75' },
              { label: 'E-commerce', range: '2 – 4%', color: '#BA7517' },
              { label: 'Professional Services', range: '15 – 20%', color: '#534AB7' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, flexShrink: 0 }} />
                <span style={{ color: '#334155', flex: 1 }}>{b.label}</span>
                <strong style={{ color: b.color }}>{b.range}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="content-card mt-4">
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 14 }}>Conversion history</div>
          <table className="cro-table">
            <thead><tr><th>Date</th><th>Total Leads</th><th>Converted</th><th>Not Converted</th><th>Rate</th></tr></thead>
            <tbody>
              {history.slice(0, 10).map(h => (
                <tr key={h.id}>
                  <td>{new Date(h.created_at).toLocaleDateString()}</td>
                  <td>{h.total_leads.toLocaleString()}</td>
                  <td style={{ color: '#1D9E75', fontWeight: 600 }}>{h.converted_leads}</td>
                  <td style={{ color: '#E24B4A' }}>{h.total_leads - h.converted_leads}</td>
                  <td><strong>{Number(h.conversion_rate).toFixed(1)}%</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
