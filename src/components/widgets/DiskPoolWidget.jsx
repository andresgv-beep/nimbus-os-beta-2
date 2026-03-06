import { useState, useEffect } from 'react';
import { useAuth } from '@context';
import WidgetCard from './WidgetCard';

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(i > 1 ? 1 : 0) + ' ' + units[i];
}

function CircularProgress({ percent, size = 70, strokeWidth = 5, color }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--bg-hover)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease', filter: `drop-shadow(0 0 4px ${color}50)` }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {percent}%
        </span>
      </div>
    </div>
  );
}

export default function DiskPoolWidget({ size = '1x1', onClick }) {
  const { token } = useAuth();
  const [pools, setPools] = useState(null);

  useEffect(() => {
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    const fetchPools = () => {
      fetch('/api/storage/status', { headers })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.pools) setPools(d.pools); })
        .catch(() => {});
    };
    fetchPools();
    const iv = setInterval(fetchPools, 30000);
    return () => clearInterval(iv);
  }, [token]);

  const icon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="6" rx="1.5" />
      <rect x="2" y="13" width="20" height="6" rx="1.5" />
      <circle cx="6" cy="6" r="1" />
      <circle cx="6" cy="16" r="1" />
    </svg>
  );

  const pool = pools?.[0];
  const percent = pool?.usagePercent || 0;
  const usedColor = percent > 90 ? '#EF5350' : percent > 75 ? '#FFA726' : '#4CAF50';

  return (
    <WidgetCard title="Disk Pool" icon={icon} size={size} onClick={onClick} loading={!pools}>
      {pool ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8 }}>
          <CircularProgress percent={percent} color={usedColor} size={size === '1x1' ? 72 : 90} strokeWidth={size === '1x1' ? 5 : 6} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 'var(--weight-medium)' }}>
              {pool.name}
            </div>
            <div style={{ fontSize: 'calc(var(--text-xs) * 0.85)', color: 'var(--text-muted)', marginTop: 1 }}>
              {formatBytes(pool.used)} / {formatBytes(pool.total)}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          No pool configured
        </div>
      )}
    </WidgetCard>
  );
}
