import styles from './WidgetCard.module.css';

// ═══════════════════════════════════
// WidgetCard — Base wrapper for all widgets
// Provides: card chrome, header, click-to-open, menu
// ═══════════════════════════════════

export default function WidgetCard({ title, icon, size = '1x1', onClick, children, loading, error }) {
  const [cols, rows] = size.split('x').map(Number);
  const isSmall = cols === 1 && rows === 1;

  const sizeClass = isSmall ? styles.sizeSmall : '';

  return (
    <div
      className={`${styles.card} ${sizeClass}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' && onClick) onClick(); }}
    >
      {/* Header */}
      <div className={styles.header}>
        {icon && <div className={styles.headerIcon}>{icon}</div>}
        <div className={styles.headerTitle}>{title}</div>
        <div
          className={styles.headerMenu}
          onClick={(e) => { e.stopPropagation(); /* TODO: context menu */ }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
