import { useEffect, useState } from 'react';
import { assessmentAPI, revenueAPI, churnAPI, leadsAPI } from '../services/api';
import { exportPDF, exportExcel } from '../utils/export';

const reports = [
  { key: 'debt', icon: 'bi-clipboard2-data-fill', label: 'Technical Debt Report', desc: 'Full score breakdown with weighted dimensions', color: '#185FA5', bg: '#e6f1fb' },
  { key: 'revenue', icon: 'bi-currency-dollar', label: 'Revenue Impact Report', desc: 'Downtime cost analysis and risk classification', color: '#1D9E75', bg: '#f0fdf4' },
  { key: 'churn', icon: 'bi-person-dash-fill', label: 'Customer Churn Report', desc: 'Retention metrics and churn trend analysis', color: '#BA7517', bg: '#fffbeb' },
  { key: 'leads', icon: 'bi-funnel-fill', label: 'Lead Conversion Report', desc: 'Funnel efficiency and conversion benchmarks', color: '#E24B4A', bg: '#fff1f2' },
];

export default function Reports() {
  const [data, setData] = useState({ debt: [], revenue: [], churn: [], leads: [] });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    document.getElementById('page-heading').textContent = 'Reports';
    Promise.all([
      assessmentAPI.getAll().then(r => r.data).catch(() => []),
      revenueAPI.getAll().then(r => r.data).catch(() => []),
      churnAPI.getAll().then(r => r.data).catch(() => []),
      leadsAPI.getAll().then(r => r.data).catch(() => []),
    ]).then(([debt, revenue, churn, leads]) => {
      setData({ debt, revenue, churn, leads });
    }).finally(() => setLoading(false));
  }, []);

  const handleExport = (key, format) => {
    setGenerating(key + format);
    setTimeout(() => {
      try {
        if (key === 'debt') {
          const headers = ['Date', 'CRM', 'Website', 'Customer', 'Integration', 'Data', 'Reporting', 'Final Score', 'Risk'];
          const rows = data.debt.map(d => [
            new Date(d.created_at).toLocaleDateString(), d.crm_score, d.website_score,
            d.customer_score, d.integration_score, d.data_score, d.reporting_score,
            Number(d.final_score).toFixed(1),
            d.final_score >= 80 ? 'Low' : d.final_score >= 60 ? 'Moderate' : 'High'
          ]);
          if (format === 'pdf') exportPDF('Technical Debt Report', headers, rows);
          else exportExcel('Technical Debt Report', headers, rows);
        } else if (key === 'revenue') {
          const headers = ['Date', 'Downtime (hrs)', 'Revenue/hr ($)', 'Revenue Loss ($)', 'Risk Level'];
          const rows = data.revenue.map(r => [
            new Date(r.created_at).toLocaleDateString(), r.downtime_hours,
            Number(r.revenue_per_hour).toLocaleString(), Number(r.revenue_loss).toLocaleString(), r.risk_level
          ]);
          if (format === 'pdf') exportPDF('Revenue Impact Report', headers, rows);
          else exportExcel('Revenue Impact Report', headers, rows);
        } else if (key === 'churn') {
          const headers = ['Date', 'Total Customers', 'Lost', 'Churn Rate (%)', 'Retention (%)'];
          const rows = data.churn.map(c => [
            new Date(c.created_at).toLocaleDateString(), c.total_customers, c.lost_customers,
            Number(c.churn_rate).toFixed(1), (100 - c.churn_rate).toFixed(1)
          ]);
          if (format === 'pdf') exportPDF('Customer Churn Report', headers, rows);
          else exportExcel('Customer Churn Report', headers, rows);
        } else if (key === 'leads') {
          const headers = ['Date', 'Total Leads', 'Converted', 'Not Converted', 'Conversion Rate (%)'];
          const rows = data.leads.map(l => [
            new Date(l.created_at).toLocaleDateString(), l.total_leads, l.converted_leads,
            l.total_leads - l.converted_leads, Number(l.conversion_rate).toFixed(1)
          ]);
          if (format === 'pdf') exportPDF('Lead Conversion Report', headers, rows);
          else exportExcel('Lead Conversion Report', headers, rows);
        }
        setMsg(`${format.toUpperCase()} report downloaded successfully!`);
        setTimeout(() => setMsg(''), 3000);
      } catch (e) {
        setMsg('Error generating report. Please try again.');
      } finally { setGenerating(''); }
    }, 300);
  };

  const counts = {
    debt: data.debt.length, revenue: data.revenue.length,
    churn: data.churn.length, leads: data.leads.length
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 4 }}>Reports & Exports</h4>
        <p style={{ color: '#64748b', fontSize: 14 }}>Generate PDF or Excel reports from all assessment data.</p>
      </div>

      {msg && <div className="alert-cro alert-success-cro">{msg}</div>}

      {loading ? (
        <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            {reports.map(r => (
              <div className="col-md-6" key={r.key}>
                <div className="content-card">
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                      <i className={`bi ${r.icon}`} style={{ color: r.color }}></i>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, fontFamily: 'Space Grotesk' }}>{r.label}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{r.desc}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 700, color: r.color }}>{counts[r.key]}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>records</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="btn-cro"
                      style={{ flex: 1, justifyContent: 'center', background: r.color }}
                      onClick={() => handleExport(r.key, 'pdf')}
                      disabled={!!generating || counts[r.key] === 0}
                    >
                      {generating === r.key + 'pdf' ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-file-earmark-pdf-fill me-1"></i>}
                      PDF
                    </button>
                    <button
                      className="btn-outline-cro"
                      style={{ flex: 1, justifyContent: 'center', borderColor: r.color, color: r.color }}
                      onClick={() => handleExport(r.key, 'excel')}
                      disabled={!!generating || counts[r.key] === 0}
                    >
                      {generating === r.key + 'excel' ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-file-earmark-excel-fill me-1"></i>}
                      Excel
                    </button>
                  </div>
                  {counts[r.key] === 0 && (
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8, textAlign: 'center' }}>No data yet — run the module first.</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="content-card">
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 14 }}>Data summary</div>
            <div className="row g-3">
              {[
                { label: 'Assessments', count: counts.debt, icon: 'bi-clipboard2-check', color: '#185FA5' },
                { label: 'Revenue records', count: counts.revenue, icon: 'bi-currency-dollar', color: '#1D9E75' },
                { label: 'Churn records', count: counts.churn, icon: 'bi-person-dash', color: '#BA7517' },
                { label: 'Lead records', count: counts.leads, icon: 'bi-funnel', color: '#E24B4A' },
              ].map((s, i) => (
                <div className="col-6 col-md-3" key={i}>
                  <div style={{ background: '#f8faff', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                    <i className={`bi ${s.icon}`} style={{ fontSize: 24, color: s.color }}></i>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, color: s.color, marginTop: 6 }}>{s.count}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
