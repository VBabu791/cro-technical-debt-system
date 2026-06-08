import { useEffect, useState } from 'react';
import { assessmentAPI } from '../services/api';

const recs = {
  low: {
    title: 'Low Technical Debt — Systems are healthy',
    color: '#1D9E75', bg: '#f0fdf4', border: '#22c55e', icon: 'bi-check-circle-fill',
    summary: 'Your technical systems are well-maintained and present minimal risk to revenue operations. Continue investing in automation and documentation to sustain this level.',
    actions: [
      { icon: 'bi-calendar-check', title: 'Quarterly Tech Debt Reviews', desc: 'Schedule recurring audits to catch emerging issues before they compound.' },
      { icon: 'bi-robot', title: 'Automate CI/CD Pipelines', desc: 'Invest in automated testing and deployment to maintain code quality at scale.' },
      { icon: 'bi-file-earmark-text', title: 'Document System Architecture', desc: 'Create and maintain living documentation to reduce onboarding friction.' },
      { icon: 'bi-graph-up-arrow', title: 'Monitor Performance KPIs', desc: 'Set up dashboards for CRM uptime, API latency, and data pipeline health.' },
    ]
  },
  moderate: {
    title: 'Moderate Technical Debt — Plan improvements',
    color: '#BA7517', bg: '#fffbeb', border: '#f59e0b', icon: 'bi-exclamation-triangle-fill',
    summary: 'Technical debt is causing measurable friction in revenue operations. Targeted improvements over the next two quarters will reduce churn risk and improve conversion rates.',
    actions: [
      { icon: 'bi-diagram-3', title: 'Audit CRM Integrations', desc: 'Identify and fix broken workflows between CRM and sales tools causing data gaps.' },
      { icon: 'bi-database-check', title: 'Data Quality Governance', desc: 'Implement validation rules to ensure clean data flows through reporting pipelines.' },
      { icon: 'bi-speedometer2', title: 'Website Performance Sprint', desc: 'Address Core Web Vitals issues affecting lead conversion landing pages.' },
      { icon: 'bi-map', title: 'Build a 6-Month Modernization Roadmap', desc: 'Prioritize debt by revenue impact and assign dedicated engineering capacity.' },
      { icon: 'bi-people', title: 'Align Engineering & Revenue Teams', desc: 'Hold monthly syncs to ensure technical priorities match CRO objectives.' },
    ]
  },
  high: {
    title: 'High Technical Debt — Immediate action required',
    color: '#E24B4A', bg: '#fff1f2', border: '#ef4444', icon: 'bi-x-octagon-fill',
    summary: 'Technical debt is critically impairing revenue operations. Customer churn, lost leads, and CRM failures are directly tied to system debt. An emergency modernization program is required.',
    actions: [
      { icon: 'bi-lightning-charge-fill', title: 'Engage a Modernization Team Immediately', desc: 'Allocate dedicated engineering resources to address critical system failures.' },
      { icon: 'bi-pause-circle', title: 'Freeze Non-Critical Feature Development', desc: 'Halt new feature work until core technical debt is resolved to acceptable levels.' },
      { icon: 'bi-heart-pulse', title: 'Emergency CRM Health Checks', desc: 'Run immediate audit of CRM data integrity, integration failures, and API errors.' },
      { icon: 'bi-megaphone', title: 'Brief Executive Leadership', desc: 'Present revenue risk exposure to C-suite and secure modernization budget.' },
      { icon: 'bi-trophy', title: '90-Day Debt Reduction Sprint', desc: 'Set measurable goal to raise debt score above 60 within three months.' },
      { icon: 'bi-shield-exclamation', title: 'Customer Retention Emergency Plan', desc: 'Launch proactive outreach to at-risk accounts while systems are being fixed.' },
    ]
  }
};

export default function Recommendations() {
  const [latestScore, setLatestScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.getElementById('page-heading').textContent = 'Recommendations';
    assessmentAPI.getAll()
      .then(r => { if (r.data.length > 0) setLatestScore(Number(r.data[0].final_score)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tier = latestScore === null ? null : latestScore >= 80 ? 'low' : latestScore >= 60 ? 'moderate' : 'high';
  const rec = tier ? recs[tier] : null;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 4 }}>Recommendations Engine</h4>
        <p style={{ color: '#64748b', fontSize: 14 }}>AI-powered action plans based on your latest technical debt score.</p>
      </div>

      {loading && <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" /></div>}

      {!loading && !rec && (
        <div className="content-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <i className="bi bi-clipboard2-x" style={{ fontSize: 48, color: '#94a3b8' }}></i>
          <h5 style={{ fontFamily: 'Space Grotesk', marginTop: 16, marginBottom: 8 }}>No assessment found</h5>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>Complete a technical debt assessment first to receive personalized recommendations.</p>
          <a href="/assessment" className="btn-cro" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            <i className="bi bi-clipboard2-check-fill me-2"></i>Run Assessment
          </a>
        </div>
      )}

      {rec && (
        <>
          <div style={{ background: rec.bg, border: `1.5px solid ${rec.border}`, borderRadius: 14, padding: '20px 24px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <i className={`bi ${rec.icon}`} style={{ fontSize: 28, color: rec.color, flexShrink: 0, marginTop: 2 }}></i>
            <div>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700, color: rec.color, marginBottom: 6 }}>{rec.title}</div>
              <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.7 }}>{rec.summary}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 42, fontWeight: 700, color: rec.color }}>{latestScore.toFixed(1)}</div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Debt Score</div>
            </div>
          </div>

          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Recommended action plan</div>
          <div className="row g-3">
            {rec.actions.map((a, i) => (
              <div className="col-md-6" key={i}>
                <div className="content-card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', height: '100%' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: rec.bg, border: `1.5px solid ${rec.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`bi ${a.icon}`} style={{ color: rec.color, fontSize: 18 }}></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{a.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="content-card mt-4">
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 14 }}>Score interpretation guide</div>
            <div className="row g-3">
              {[
                { range: '80 – 100', label: 'Low Debt', desc: 'Systems are healthy. Maintain and automate.', color: '#1D9E75', bg: '#f0fdf4' },
                { range: '60 – 79', label: 'Moderate Debt', desc: 'Plan improvements. Address priority areas.', color: '#BA7517', bg: '#fffbeb' },
                { range: '0 – 59', label: 'High Debt', desc: 'Immediate action required. Modernize now.', color: '#E24B4A', bg: '#fff1f2' },
              ].map((t, i) => (
                <div className="col-md-4" key={i}>
                  <div style={{ background: t.bg, borderRadius: 10, padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700, color: t.color }}>{t.range}</div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: t.color, marginTop: 4 }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{t.desc}</div>
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
