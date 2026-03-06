import { useState, useEffect } from 'react';
import WidgetCard from '../WidgetCard';

export default function ClockWidget({ size = '1x1' }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const day = now.toLocaleDateString('es-ES', { weekday: 'long' });
  const date = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

  const icon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );

  return (
    <WidgetCard title="Clock" icon={icon} size={size}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 2 }}>
        <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-1px' }}>
          {hours}:{minutes}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
          {day}, {date}
        </div>
      </div>
    </WidgetCard>
  );
}
