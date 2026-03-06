import { useState, useEffect } from 'react';
import { useAuth } from '@context';
import WidgetCard from '../WidgetCard';

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
  const usedColor = percent > 90 ? 'var(--accent-red)' : percent > 75 ? 'var(--accent-amber)' : 'var(--accent-green)';

  const formatBytes = (bytes) => {
    if (!bytes || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(i > 1 ? 1 : 0) + ' ' + units[i];
  };

  const isSmall = size === '1x1';

  return (
    <WidgetCard title="Disk Pool" icon={icon} size={size} onClick={onClick} loading={!pools}>
      {pool ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: isSmall ? 4 : 8 }}>
          {/* Circular progress */}
          <div style={{ position: 'relative', width: isSmall ? 56 : 72, height: isSmall ? 56 : 72 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="var(--bg-hover)" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke={usedColor} strokeWidth="3"
                strokeDasharray={`${percent}, 100`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isSmall ? 'var(--text-sm)' : 'var(--text-md)', fontWeight: 'var(--weight-bold)', color: usedColor }}>
              {percent}%
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
            {pool.name} · {formatBytes(pool.used)} / {formatBytes(pool.total)}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          No pool
        </div>
      )}
    </WidgetCard>
  );
}
