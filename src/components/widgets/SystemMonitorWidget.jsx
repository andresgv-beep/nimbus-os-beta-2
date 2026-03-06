import { useState, useEffect } from 'react';
import { useAuth } from '@context';
import WidgetCard from './WidgetCard';

function ProgressBar({ label, percent, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>{label}</span>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color, fontVariantNumeric: 'tabular-nums' }}>{percent}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-hover)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          borderRadius: 3,
          width: `${percent}%`,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          boxShadow: `0 0 8px ${color}40`,
          transition: 'width 0.6s ease',
        }} />
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
      Promise.all([
        fetch('/api/cpu', { headers }).then(r => r.ok ? r.json() : null),
        fetch('/api/memory', { headers }).then(r => r.ok ? r.json() : null),
        fetch('/api/temps', { headers }).then(r => r.ok ? r.json() : null),
      ]).then(([cpu, memory, temps]) => {
        setData({ cpu, memory, temps });
      }).catch(() => {});
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

  const cpu = data?.cpu?.percent || data?.cpu?.usage || 0;
  const mem = data?.memory ? Math.round((data.memory.used / data.memory.total) * 100) : 0;
  const temp = data?.temps?.cpu || data?.temps?.main || null;

  const cpuColor = cpu > 80 ? '#EF5350' : cpu > 50 ? '#FFA726' : '#4CAF50';
  const memColor = mem > 80 ? '#EF5350' : mem > 60 ? '#FFA726' : '#42A5F5';

  return (
    <WidgetCard title="System Monitor" icon={icon} size={size} onClick={onClick} loading={!data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, justifyContent: 'center' }}>
        <ProgressBar label="CPU" percent={cpu} color={cpuColor} />
        <ProgressBar label="RAM" percent={mem} color={memColor} />
        {temp !== null && (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
            marginTop: 4, padding: '4px 0',
            borderTop: '1px solid var(--border)',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={temp > 70 ? '#EF5350' : 'var(--text-muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />
            </svg>
            <span style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              color: temp > 70 ? '#EF5350' : temp > 55 ? '#FFA726' : 'var(--text-secondary)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {temp}°C
            </span>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}
