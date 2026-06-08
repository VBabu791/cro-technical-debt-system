import { useState, useEffect } from 'react';
import { assessmentAPI } from '../services/api';

const fields = [
  { key: 'crm_score', label: 'CRM Performance', weight: 0.25, tip: 'Evaluate your CRM system quality, uptime, and user adoption rate.' },
  { key: 'website_score', label: 'Website Performance', weight: 0.20, tip: 'Page load speed, uptime SLA, Core Web Vitals compliance.' },
  { key: 'customer_score', label: 'Customer Experience', weight: 0.20, tip: 'NPS score, support ticket resolution time, self-service capability.' },
  { key: 'integration_score', label: 'Sales Tool Integration', weight: 0.15, tip: 'API reliability, data sync accuracy, integration coverage.' },
  { key: 'data_score', label: 'Data Quality', weight: 0.10, tip: 'Data completeness, accuracy, deduplication, and governance.' },
  { key: 'reporting_score', label: 'Reporting Accuracy', weight: 0.10, tip: 'BI tool reliability, report timeliness, and data freshness.' },
];

export default function Assessment() {
  const [scores, setScores] = useState({ crm_score: 70, website_score: 75, customer_score: 65, integration_score: 80, data_score: 72, reporting_score: 68 });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    document.getElementById('page-heading').textContent = 'Technical Debt Assessment';
    assessmentAPI.getAll().then(r => setHistory(r.data)).catch(() => {});
  }, []);

  const calcScore = () => {
    const final = fields.reduce((acc, f) => acc + scores[f.key] * f.weight, 0);
    setResult(final);
    return final;
  };

  const saveAssessment = async () => {
    setSaving(true); setMsg('');
    try {
      const res = await assessmentAPI.create(scores);
      setMsg('Assessment saved successfully!');
      setResult(res.data.final_score);
      assessmentAPI.getAll().then(r => setHistory(r.data)).catch(() => {});
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error saving assessment.');
    } finally { setSaving(false); }
  };

  const finalScore = result !== null ? Number(result) : null;
  const scoreColor = finalScore === null ? '#1a1a2e' : finalScore >= 80 ? '#1D9E75' : finalScore >= 60 ? '#BA7517' : '#E24B4A';
  const riskLabel = finalScore === null ? '—' : finalScore >= 80 ? 'Low Technical Debt' : finalScore >= 60 ? 'Moderate Technical Debt' : 'High Technical Debt';

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 4 }}>Technical Debt Assessment</h4>
        <p style={{ color: '#64748b', fontSize: 14 }}>Score each dimension to calculate your overall technical debt score.</p>
      </div>

      {msg && <div className={`alert-cro ${msg.includes('success') ? 'alert-success-cro' : 'alert-error-cro'}`}>{msg}</div>}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="content-card">
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 20 }}>Score each dimension (1–100)</div>
            {fields.map(f => (
              <div key={f.key} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <label className="form-label-cro" style={{ marginBottom: 2 }}>
                      {f.label} <span style={{ color: '#94a3b8', fontWeight: 400 }}>×{f.weight}</span>
                    </label>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{f.tip}</div>
                  </div>
                  <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 22, color: scores[f.key] >= 70 ? '#1D9E75' : scores[f.key] >= 50 ? '#BA7517' : '#E24B4A', minWidth: 40, textAlign: 'right' }}>
                    {scores[f.key]}
                  </div>
                </div>
                <input type="range" min="1" max="100" value={scores[f.key]} style={{ width: '100%' }}
                  onChange={e => setScores({ ...scores, [f.key]: +e.target.value })} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                  <span>1 — Critical</span><span>50 — Moderate</span><span>100 — Excellent</span>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className="btn-cro" onClick={calcScore}><i className="bi bi-calculator-fill me-1"></i>Calculate score</button>
              <button className="btn-outline-cro" onClick={saveAssessment} disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-cloud-upload-fill me-1"></i>}
                Save to database
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="content-card mb-3">
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 12 }}>Score result</div>
            <div className="score-gauge">
              <div className="gauge-value" style={{ color: scoreColor }}>
                {finalScore !== null ? finalScore.toFixed(1) : '—'}
              </div>
              <div className="gauge-label">{riskLabel}</div>
            </div>
            {finalScore !== null && (
              <div style={{ marginTop: 12 }}>
                {fields.map(f => (
                  <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                    <span style={{ color: '#64748b' }}>{f.label}</span>
                    <strong>{(scores[f.key] * f.weight).toFixed(1)}</strong>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14 }}>
                  <strong>Final score</strong>
                  <strong style={{ color: scoreColor }}>{finalScore.toFixed(1)}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="content-card">
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 12 }}>Formula</div>
            {fields.map(f => (
              <div key={f.key} style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                {f.label.split(' ')[0]} × {f.weight}
              </div>
            ))}
            <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: '#185FA5' }}>= Final Debt Score</div>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="content-card mt-4">
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 14 }}>Assessment history</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="cro-table">
              <thead><tr><th>Date</th><th>CRM</th><th>Website</th><th>Customer</th><th>Integration</th><th>Data</th><th>Reporting</th><th>Final</th><th>Risk</th></tr></thead>
              <tbody>
                {history.slice(0,8).map(a => (
                  <tr key={a.id}>
                    <td>{new Date(a.created_at).toLocaleDateString()}</td>
                    <td>{a.crm_score}</td><td>{a.website_score}</td><td>{a.customer_score}</td>
                    <td>{a.integration_score}</td><td>{a.data_score}</td><td>{a.reporting_score}</td>
                    <td><strong>{Number(a.final_score).toFixed(1)}</strong></td>
                    <td><span className={`badge-${a.final_score >= 80 ? 'low' : a.final_score >= 60 ? 'medium' : 'high'}`}>
                      {a.final_score >= 80 ? 'Low' : a.final_score >= 60 ? 'Moderate' : 'High'}
                    </span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
