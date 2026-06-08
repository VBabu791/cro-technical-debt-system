import { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';

const eventMeta = {
  assessment: { icon: 'bi-clipboard2-check-fill', color: '#185FA5', bg: '#e6f1fb', label: 'New Assessment' },
  revenue: { icon: 'bi-currency-dollar', color: '#1D9E75', bg: '#f0fdf4', label: 'Revenue Analysis' },
  churn: { icon: 'bi-person-dash-fill', color: '#BA7517', bg: '#fffbeb', label: 'Churn Updated' },
  leads: { icon: 'bi-funnel-fill', color: '#E24B4A', bg: '#fff1f2', label: 'Lead Conversion' },
};

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function LiveFeed() {
  const { user } = useAuth();
  const { connected, onlineCount, latestEvents } = useSocket(user?.id);
  const [tick, setTick] = useState(0);

  // Refresh relative timestamps every 10s
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="content-card" style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>Live activity</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: connected ? '#1D9E75' : '#E24B4A',
              boxShadow: connected ? '0 0 0 3px rgba(29,158,117,0.2)' : 'none',
              animation: connected ? 'pulse 2s infinite' : 'none'
            }} />
            <span style={{ color: connected ? '#1D9E75' : '#E24B4A', fontWeight: 600 }}>
              {connected ? 'Live' : 'Connecting...'}
            </span>
          </div>
          {onlineCount > 0 && (
            <div style={{ fontSize: 11, color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: 10 }}>
              {onlineCount} online
            </div>
          )}
        </div>
      </div>

      {latestEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
          <i className="bi bi-broadcast" style={{ fontSize: 32, display: 'block', marginBottom: 8, opacity: 0.4 }}></i>
          <div style={{ fontSize: 13 }}>Waiting for live events...</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>Events appear here as team members submit assessments.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
          {latestEvents.map((e, i) => {
            const meta = eventMeta[e.type] || eventMeta.assessment;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: 8, background: i === 0 ? meta.bg : 'transparent', transition: 'background 0.4s' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`bi ${meta.icon}`} style={{ color: meta.color, fontSize: 15 }}></i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{meta.label}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.type === 'assessment' && e.data.final_score && `Score: ${Number(e.data.final_score).toFixed(1)}`}
                    {e.type === 'revenue' && e.data.revenue_loss && `Loss: $${Number(e.data.revenue_loss).toLocaleString()}`}
                    {e.type === 'churn' && e.data.churn_rate && `Churn: ${Number(e.data.churn_rate).toFixed(1)}%`}
                    {e.type === 'leads' && e.data.conversion_rate && `Conversion: ${Number(e.data.conversion_rate).toFixed(1)}%`}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{timeAgo(e.ts)}</div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(29,158,117,0.4); }
          50% { box-shadow: 0 0 0 5px rgba(29,158,117,0); }
        }
      `}</style>
    </div>
  );
}
