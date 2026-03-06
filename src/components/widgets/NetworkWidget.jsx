import { useState, useEffect } from 'react';
import { useAuth } from '@context';
import WidgetCard from './WidgetCard';

function formatRate(bytes) {
  if (!bytes || bytes === 0) return '0 B/s';
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

export default function NetworkWidget({ size = '1x1', onClick }) {
  const { token } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    const fetchStats = () => {
      fetch('/api/network', { headers })
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
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );

  const net = Array.isArray(data) ? data[0] : null;
  const iface = net?.name || '—';
  const speed = net?.speed || '—';
  const dl = net?.rxRate || 0;
  const ul = net?.txRate || 0;
  const ip = net?.ip || '—';

  const isSmall = size === '1x1';

  const rowStyle = { display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' };

  return (
    <WidgetCard title="Network" icon={icon} size={size} onClick={onClick} loading={!data}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: isSmall ? 6 : 8, flex: 1, justifyContent: 'center' }}>
        <div style={rowStyle}>
          <span>{iface}</span>
          <span style={{ color: 'var(--accent-green)' }}>{speed}</span>
        </div>
        <div style={rowStyle}>
          <span>↓ Download</span>
          <span style={{ color: 'var(--text-secondary)' }}>{formatRate(dl)}</span>
        </div>
        <div style={rowStyle}>
          <span>↑ Upload</span>
          <span style={{ color: 'var(--text-secondary)' }}>{formatRate(ul)}</span>
        </div>
        {!isSmall && (
          <div style={rowStyle}>
            <span>IP</span>
            <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 'calc(var(--text-xs) * 0.9)' }}>{ip}</span>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}
