import { useState, useEffect } from 'react';
import { useAuth } from '@context';
import WidgetCard from '../WidgetCard';

function MiniBar({ label, percent, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
        <span>{label}</span>
        <span style={{ color }}>{percent}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-hover)' }}>
        <div style={{ height: '100%', borderRadius: 2, width: `${percent}%`, background: color, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

export default function SystemMonitorWidget({ size = '2x1', onClick }) {
  const { token } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    const fetchStats = () => {
      fetch('/api/system/stats', { headers })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setData(d); })
        .catch(() => {});
    };
    fetchStats();
    const iv = setInterval(fetchStats, 5000);
    return () => clearInterval(iv);
  }, [token]);

  const icon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );

  const cpu = data?.cpu?.percent || 0;
  const mem = data?.memory ? Math.round((data.memory.used / data.memory.total) * 100) : 0;
  const temp = data?.cpu?.temperature || data?.gpu?.temperature || null;

  const cpuColor = cpu > 80 ? 'var(--accent-red)' : cpu > 50 ? 'var(--accent-amber)' : 'var(--accent-green)';
  const memColor = mem > 80 ? 'var(--accent-red)' : mem > 60 ? 'var(--accent-amber)' : 'var(--accent-blue)';

  return (
    <WidgetCard title="System Monitor" icon={icon} size={size} onClick={onClick} loading={!data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, justifyContent: 'center' }}>
        <MiniBar label="CPU" percent={cpu} color={cpuColor} />
        <MiniBar label="RAM" percent={mem} color={memColor} />
        {temp !== null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
            <span>Temp</span>
            <span style={{ color: temp > 70 ? 'var(--accent-red)' : 'var(--text-secondary)' }}>{temp}°C</span>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}
