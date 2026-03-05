import { useState, useCallback, useRef } from 'react';
import { useTheme, useAuth } from '@context';
import { ChevronLeftIcon, SearchIcon } from '@icons';
import * as Hub from '@icons/hub/index.jsx';
import styles from './SettingsHub.module.css';

// ─── Settings page imports ───
import { AppearancePage, DesktopPage, WidgetsPage, HardwarePage, LanguagePage, NotificationsPage, AboutPage } from '../settings/Settings.jsx';

// ═══════════════════════════════════
// Navigation categories
// ═══════════════════════════════════

const NAV_CATEGORIES = [
  { id: 'system', label: 'System', icon: 'grid' },
  { id: 'storage', label: 'Storage', icon: 'drive' },
  { id: 'network', label: 'Network', icon: 'globe' },
  { id: 'security', label: 'Security', icon: 'shield' },
  'sep',
  { id: 'appearance', label: 'Appearance', icon: 'palette' },
  { id: 'about', label: 'About', icon: 'info' },
];

function NavIcon({ type, size = 18 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (type) {
    case 'grid': return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case 'drive': return <svg {...p}><rect x="2" y="3" width="20" height="6" rx="1.5"/><rect x="2" y="13" width="20" height="6" rx="1.5"/><circle cx="6" cy="6" r="1"/><circle cx="6" cy="16" r="1"/></svg>;
    case 'globe': return <svg {...p}><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><line x1="12" y1="7.5" x2="5" y2="15.5"/><line x1="12" y1="7.5" x2="19" y2="15.5"/></svg>;
    case 'shield': return <svg {...p}><path d="M12 2L4 6v5c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6z"/><polyline points="9 12 11 14 15 10"/></svg>;
    case 'palette': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 010 18" fill="rgba(255,255,255,0.06)"/><circle cx="9" cy="8" r="1.5"/><circle cx="15" cy="9" r="1.2"/><circle cx="8" cy="14" r="1"/></svg>;
    case 'info': return <svg {...p}><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="17"/><circle cx="12" cy="8" r="0.8" fill="currentColor" stroke="none"/></svg>;
    default: return null;
  }
}

// ═══════════════════════════════════
// Grid icons per category
// ═══════════════════════════════════

const GRID = {
  system: [
    { id: 'storage-mgr', label: 'Storage', icon: Hub.HubStorageIcon, title: 'System Management' },
    { id: 'network-mgr', label: 'Network', icon: Hub.HubNetworkIcon },
    { id: 'users', label: 'Users', icon: Hub.HubUsersIcon },
    { id: 'portal', label: 'Portal', icon: Hub.HubPortalIcon },
    { id: 'monitor', label: 'Monitor', icon: Hub.HubMonitorIcon },
    { id: 'updates', label: 'Updates', icon: Hub.HubUpdatesIcon },
    { id: 'power', label: 'Power', icon: Hub.HubPowerIcon },
  ],
  storage: [
    { id: 'disks', label: 'Disks', icon: Hub.HubDisksIcon, title: 'Storage' },
    { id: 'pools', label: 'Pools & RAID', icon: Hub.HubPoolsIcon },
    { id: 'shares', label: 'Shared Folders', icon: Hub.HubSharedFoldersIcon },
    { id: 'health', label: 'Health', icon: Hub.HubHealthIcon },
  ],
  network: [
    { id: 'interfaces', label: 'Interfaces', icon: Hub.HubInterfacesIcon, title: 'Network & Services' },
    { id: 'remote-access', label: 'Remote Access', icon: Hub.HubRemoteAccessIcon },
    { id: 'ddns', label: 'DDNS', icon: Hub.HubDdnsIcon },
    { id: 'reverse-proxy', label: 'Reverse Proxy', icon: Hub.HubReverseProxyIcon },
    { id: 'smb', label: 'SMB / CIFS', icon: Hub.HubSmbIcon },
    { id: 'ssh', label: 'SSH', icon: Hub.HubSshIcon },
    { id: 'ftp', label: 'FTP / SFTP', icon: Hub.HubFtpIcon },
    { id: 'nfs', label: 'NFS', icon: Hub.HubNfsIcon },
    { id: 'webdav', label: 'WebDAV', icon: Hub.HubWebDavIcon },
  ],
  security: [
    { id: 'firewall', label: 'Firewall', icon: Hub.HubFirewallIcon, title: 'Security' },
    { id: 'certificates', label: 'Certificates', icon: Hub.HubCertificatesIcon },
    { id: '2fa', label: '2FA / Login', icon: Hub.HubLockIcon },
    { id: 'sessions', label: 'Sessions', icon: Hub.HubSessionsIcon },
    { id: 'backup', label: 'Backup', icon: Hub.HubBackupIcon },
    { id: 'logs', label: 'Logs', icon: Hub.HubLogsIcon },
  ],
  appearance: [
    { id: 'theme', label: 'Theme', icon: Hub.HubAppearanceIcon, title: 'Appearance' },
    { id: 'wallpaper', label: 'Wallpaper', icon: Hub.HubPortalIcon },
    { id: 'taskbar', label: 'Taskbar', icon: Hub.HubMonitorIcon },
    { id: 'widgets', label: 'Widgets', icon: Hub.HubContainersIcon },
  ],
  about: [
    { id: 'sysinfo', label: 'System Info', icon: Hub.HubAboutIcon, title: 'About' },
    { id: 'license', label: 'License', icon: Hub.HubLogsIcon },
  ],
};

// ═══════════════════════════════════
// Section sidebar definitions
// ═══════════════════════════════════

const SECTION_SIDEBAR = {
  'storage-mgr':   { label: 'Storage Manager', items: ['Overview', 'Disks', 'Pools & RAID', 'Shared Folders', 'Health'] },
  'network-mgr':   { label: 'Network', grouped: true, items: [
    { label: 'Interfaces', section: 'Network' },
    { label: 'Remote Access', section: 'External Access' },
    { label: 'DDNS' }, { label: 'Reverse Proxy' }, { label: 'Certificates' },
    { label: 'SMB / CIFS', section: 'Services' },
    { label: 'FTP / SFTP' }, { label: 'SSH' }, { label: 'NFS' }, { label: 'WebDAV' },
    { label: 'Firewall', section: 'Security' },
  ]},
  'users':         { label: 'Users', items: ['All Users', 'Create User', 'Permissions'] },
  'portal':        { label: 'Portal', items: ['Web Portal', 'Ports', 'Service Control'] },
  'monitor':       { label: 'System Monitor', items: ['Overview', 'CPU', 'Memory', 'GPU', 'Processes'] },
  'updates':       { label: 'Updates', items: ['Check Updates', 'Update Log'] },
  'power':         { label: 'Power', items: ['Restart Service', 'Reboot System', 'Shutdown'] },
  'disks':         { label: 'Disks', items: ['All Disks', 'SMART Status', 'Wipe'] },
  'pools':         { label: 'Pools & RAID', items: ['Active Pools', 'Create Pool', 'Import'] },
  'shares':        { label: 'Shared Folders', items: ['All Shares', 'Create Share', 'Permissions'] },
  'health':        { label: 'Health', items: ['RAID Status', 'SMART', 'Alerts'] },
  'interfaces':    { label: 'Interfaces', items: ['Ethernet', 'Wi-Fi', 'Settings'] },
  'remote-access': { label: 'Remote Access', items: ['Status', 'DDNS', 'SSL Certificate', 'HTTPS'] },
  'ddns':          { label: 'DDNS', items: ['Configuration', 'Status', 'Test'] },
  'reverse-proxy': { label: 'Reverse Proxy', items: ['Rules', 'Add Rule', 'SSL'] },
  'smb':           { label: 'SMB / CIFS', items: ['Status', 'Shares', 'Configuration', 'Users'] },
  'ssh':           { label: 'SSH', items: ['Status', 'Configuration', 'Keys'] },
  'ftp':           { label: 'FTP / SFTP', items: ['Status', 'Configuration', 'Users'] },
  'nfs':           { label: 'NFS', items: ['Status', 'Exports', 'Configuration'] },
  'webdav':        { label: 'WebDAV', items: ['Status', 'Shares', 'Configuration'] },
  'firewall':      { label: 'Firewall', items: ['Rules', 'Open Ports', 'Add Rule'] },
  'certificates':  { label: 'Certificates', items: ['Active Certs', 'Request New', 'Renew'] },
  '2fa':           { label: '2FA / Login', items: ['Two-Factor Auth', 'Login Settings', 'Password Policy'] },
  'sessions':      { label: 'Sessions', items: ['Active Sessions', 'History'] },
  'backup':        { label: 'Backup', items: ['Create Backup', 'Restore', 'Schedule'] },
  'logs':          { label: 'Logs', items: ['System Log', 'Access Log', 'Update Log'] },
  'theme':         { label: 'Appearance', items: ['Theme & Colors', 'Performance', 'Window Glow'] },
  'wallpaper':     { label: 'Desktop', items: ['Wallpaper', 'Icons', 'Dock', 'Text Size'] },
  'taskbar':       { label: 'Taskbar', items: ['Position', 'Size', 'Auto-hide', 'Pinned Apps'] },
  'widgets':       { label: 'Widgets', items: ['Visible Widgets', 'Scale'] },
  'sysinfo':       { label: 'About', items: ['System Info', 'Hardware', 'Language'] },
  'license':       { label: 'License', items: ['NimbusOS License'] },
};

// ═══════════════════════════════════
// Component Registry
// Maps section IDs → React components
// Sections not listed here render the placeholder
// ═══════════════════════════════════

const SECTION_COMPONENTS = {
  'theme':     AppearancePage,
  'wallpaper': DesktopPage,
  'widgets':   WidgetsPage,
  'sysinfo':   AboutPage,
};

// Standalone page (no sidebar sub-items, render directly)
const STANDALONE_SECTIONS = new Set(['theme', 'wallpaper', 'widgets', 'sysinfo']);

// ═══════════════════════════════════
// Component
// ═══════════════════════════════════

export default function SettingsHub() {
  const { perfLevel } = useTheme();
  const { user } = useAuth();
  const [category, setCategory] = useState('system');
  const [section, setSection] = useState(null);
  const [sidebarItem, setSidebarItem] = useState(null);
  const [search, setSearch] = useState('');
  const [exiting, setExiting] = useState(false);
  const [glassFlash, setGlassFlash] = useState(false);
  const contentRef = useRef(null);

  const perf = perfLevel || 'full';
  const delay = perf === 'full' ? 220 : perf === 'balanced' ? 100 : 0;

  const sectionDef = section ? SECTION_SIDEBAR[section] : null;
  const username = user?.username || 'admin';
  const role = user?.role || 'admin';

  // Normalize section items
  const sectionItems = sectionDef
    ? (sectionDef.grouped ? sectionDef.items : (sectionDef.items || []).map(label => ({ label })))
    : [];

  // Select nav category
  const selectCategory = useCallback((id) => {
    if (section) { setSection(null); setSidebarItem(null); }
    setCategory(id);
    setSearch('');
  }, [section]);

  // Open section from grid
  const openSection = useCallback((id) => {
    const def = SECTION_SIDEBAR[id];
    const firstItem = def?.grouped ? def.items[0]?.label : (def?.items?.[0] || null);

    if (perf === 'performance') {
      setSection(id);
      setSidebarItem(firstItem);
      return;
    }

    setExiting(true);
    if (perf === 'full') { setGlassFlash(true); setTimeout(() => setGlassFlash(false), 300); }

    setTimeout(() => {
      setExiting(false);
      setSection(id);
      setSidebarItem(firstItem);
      requestAnimationFrame(() => contentRef.current?.classList.add(styles.contentRevealed));
    }, delay);
  }, [perf, delay]);

  // Back to grid
  const goBack = useCallback(() => {
    if (contentRef.current) contentRef.current.classList.remove(styles.contentRevealed);
    setTimeout(() => { setSection(null); setSidebarItem(null); }, perf === 'performance' ? 0 : 60);
  }, [perf]);

  // Select sidebar item
  const selectSidebarItem = useCallback((label) => {
    if (contentRef.current) contentRef.current.classList.remove(styles.contentRevealed);
    setTimeout(() => {
      setSidebarItem(label);
      requestAnimationFrame(() => contentRef.current?.classList.add(styles.contentRevealed));
    }, perf === 'performance' ? 0 : 40);
  }, [perf]);

  // Filter grid
  const gridItems = (GRID[category] || []).filter(
    item => !search || item.label.toLowerCase().includes(search.toLowerCase())
  );
  const gridTitle = gridItems[0]?.title || category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className={styles.layout}>
      {/* ─── Sidebar (transforms between nav and section) ─── */}
      <div className={styles.nav}>
        {!section ? (
          <>
            {/* NAV MODE: profile + search + categories */}
            <div className={styles.profile} onClick={() => selectCategory('system')}>
              <div className={styles.avatar}>{username.charAt(0).toUpperCase()}</div>
              <div className={styles.profileInfo}>
                <div className={styles.profileName}>{username}</div>
                <div className={styles.profileRole}>{role}</div>
              </div>
            </div>

            <div className={styles.navSearch}>
              <SearchIcon size={13} />
              <input
                className={styles.navSearchInput}
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {NAV_CATEGORIES.map((cat, i) => {
              if (cat === 'sep') return <div key={i} className={styles.navSep} />;
              return (
                <div
                  key={cat.id}
                  className={`${styles.navItem} ${category === cat.id ? styles.navItemActive : ''}`}
                  onClick={() => selectCategory(cat.id)}
                >
                  <div className={styles.navIcon}><NavIcon type={cat.icon} size={18} /></div>
                  {cat.label}
                </div>
              );
            })}
          </>
        ) : (
          <>
            {/* SECTION MODE: back + section items */}
            <div className={styles.sectionBack} onClick={goBack}>
              <ChevronLeftIcon size={14} />
              <span className={styles.sectionBackName}>{sectionDef.label}</span>
            </div>

            <div className={styles.sectionItems}>
              {sectionItems.map((item) => {
                const label = typeof item === 'string' ? item : item.label;
                const sectionLabel = typeof item === 'object' ? item.section : null;
                return (
                  <div key={label}>
                    {sectionLabel && <div className={styles.ssLabel}>{sectionLabel}</div>}
                    <div
                      className={`${styles.ssItem} ${sidebarItem === label ? styles.ssItemActive : ''}`}
                      onClick={() => selectSidebarItem(label)}
                    >
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ─── Content ─── */}
      <div className={styles.content}>
        <div className={`${styles.glassOverlay} ${glassFlash ? styles.glassFlash : ''}`} />

        {section ? (
          /* Section content */
          <div className={styles.sectionContent}>
            <div
              className={`${styles.contentInner} ${perf === 'performance' ? styles.contentRevealed : ''}`}
              ref={contentRef}
            >
              {(() => {
                const SectionComp = SECTION_COMPONENTS[section];
                if (SectionComp) {
                  return <SectionComp />;
                }
                return (
                  <div className={styles.placeholder}>
                    {sectionDef.label} › {sidebarItem || '...'}<br />
                    <span style={{ fontSize: 11, marginTop: 8, display: 'block', opacity: 0.5 }}>
                      Component will be ported here
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          /* Grid view */
          <div className={`${styles.gridArea} ${exiting ? styles.gridExiting : ''}`}>
            <div className={styles.gridTitle}>{gridTitle}</div>
            <div className={styles.grid}>
              {gridItems.map(item => {
                const IconComp = item.icon;
                return (
                  <div key={item.id} className={styles.gridItem} onClick={() => openSection(item.id)}>
                    <div className={styles.gridIcon}><IconComp size={40} /></div>
                    <span className={styles.gridLabel}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
