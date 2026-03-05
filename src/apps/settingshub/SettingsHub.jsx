import { useState, useCallback, useRef } from 'react';
import { useTheme } from '@context';
import { ChevronLeftIcon, SearchIcon } from '@icons';
import * as Hub from '@icons/hub/index.jsx';
import styles from './SettingsHub.module.css';

// ═══════════════════════════════════
// Section definitions
// Each tab has icons that open a section with sidebar items
// ═══════════════════════════════════

const TABS = [
  { id: 'system', label: 'System' },
  { id: 'storage', label: 'Storage' },
  { id: 'network', label: 'Network' },
  { id: 'security', label: 'Security' },
];

const GRID = {
  system: [
    { id: 'storage-mgr', label: 'Storage', icon: Hub.HubStorageIcon },
    { id: 'containers', label: 'Containers', icon: Hub.HubContainersIcon },
    { id: 'network-mgr', label: 'Network', icon: Hub.HubNetworkIcon },
    { id: 'users', label: 'Users', icon: Hub.HubUsersIcon },
    { id: 'portal', label: 'Portal', icon: Hub.HubPortalIcon },
    { id: 'appearance', label: 'Appearance', icon: Hub.HubAppearanceIcon },
    { id: 'monitor', label: 'Monitor', icon: Hub.HubMonitorIcon },
    { id: 'updates', label: 'Updates', icon: Hub.HubUpdatesIcon },
    { id: 'power', label: 'Power', icon: Hub.HubPowerIcon },
    { id: 'about', label: 'About', icon: Hub.HubAboutIcon },
  ],
  storage: [
    { id: 'disks', label: 'Disks', icon: Hub.HubDisksIcon },
    { id: 'pools', label: 'Pools & RAID', icon: Hub.HubPoolsIcon },
    { id: 'shares', label: 'Shared Folders', icon: Hub.HubSharedFoldersIcon },
    { id: 'health', label: 'Health', icon: Hub.HubHealthIcon },
  ],
  network: [
    { id: 'interfaces', label: 'Interfaces', icon: Hub.HubInterfacesIcon },
    { id: 'remote-access', label: 'Remote Access', icon: Hub.HubRemoteAccessIcon },
    { id: 'ddns', label: 'DDNS', icon: Hub.HubDdnsIcon },
    { id: 'dns', label: 'DNS', icon: Hub.HubDnsIcon },
    { id: 'reverse-proxy', label: 'Reverse Proxy', icon: Hub.HubReverseProxyIcon },
    { id: 'smb', label: 'SMB / CIFS', icon: Hub.HubSmbIcon },
    { id: 'ssh', label: 'SSH', icon: Hub.HubSshIcon },
    { id: 'ftp', label: 'FTP / SFTP', icon: Hub.HubFtpIcon },
    { id: 'nfs', label: 'NFS', icon: Hub.HubNfsIcon },
    { id: 'webdav', label: 'WebDAV', icon: Hub.HubWebDavIcon },
  ],
  security: [
    { id: 'firewall', label: 'Firewall', icon: Hub.HubFirewallIcon },
    { id: 'certificates', label: 'Certificates', icon: Hub.HubCertificatesIcon },
    { id: '2fa', label: '2FA / Login', icon: Hub.HubLockIcon },
    { id: 'sessions', label: 'Sessions', icon: Hub.HubSessionsIcon },
    { id: 'backup', label: 'Backup', icon: Hub.HubBackupIcon },
    { id: 'logs', label: 'Logs', icon: Hub.HubLogsIcon },
  ],
};

// Sidebar items for each section
const SECTION_SIDEBAR = {
  'storage-mgr':   { label: 'Storage Manager', items: ['Overview', 'Disks', 'Pools & RAID', 'Shared Folders', 'Health'] },
  'containers':    { label: 'Containers', items: ['Running', 'All Containers', 'Images', 'Stacks', 'Settings'] },
  'network-mgr':   { label: 'Network', section: true, items: [
    { label: 'Interfaces', section: 'Network' },
    { label: 'Remote Access', section: 'External Access' },
    { label: 'DDNS' }, { label: 'Reverse Proxy' }, { label: 'Certificates' },
    { label: 'SMB / CIFS', section: 'Services' },
    { label: 'FTP / SFTP' }, { label: 'SSH' }, { label: 'NFS' }, { label: 'WebDAV' },
    { label: 'Firewall', section: 'Security' },
  ]},
  'users':         { label: 'Users', items: ['All Users', 'Create User', 'Permissions'] },
  'portal':        { label: 'Portal', items: ['Web Portal', 'Ports', 'Service Control'] },
  'appearance':    { label: 'Appearance', items: ['Theme', 'Wallpaper', 'Taskbar', 'Desktop Icons', 'Widgets', 'Font Scale'] },
  'monitor':       { label: 'System Monitor', items: ['Overview', 'CPU', 'Memory', 'GPU', 'Processes'] },
  'updates':       { label: 'Updates', items: ['Check Updates', 'Update Log'] },
  'power':         { label: 'Power', items: ['Restart Service', 'Reboot System', 'Shutdown'] },
  'about':         { label: 'About', items: ['System Info', 'License'] },
  'disks':         { label: 'Disks', items: ['All Disks', 'SMART Status', 'Wipe'] },
  'pools':         { label: 'Pools & RAID', items: ['Active Pools', 'Create Pool', 'Import'] },
  'shares':        { label: 'Shared Folders', items: ['All Shares', 'Create Share', 'Permissions'] },
  'health':        { label: 'Health', items: ['RAID Status', 'SMART', 'Alerts'] },
  'interfaces':    { label: 'Interfaces', items: ['Ethernet', 'Wi-Fi', 'Settings'] },
  'remote-access': { label: 'Remote Access', items: ['Status', 'DDNS', 'SSL Certificate', 'HTTPS'] },
  'ddns':          { label: 'DDNS', items: ['Configuration', 'Status', 'Test'] },
  'dns':           { label: 'DNS', items: ['Servers', 'Custom Records'] },
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
};

// ═══════════════════════════════════
// Component
// ═══════════════════════════════════

export default function SettingsHub() {
  const { perfLevel } = useTheme();
  const [tab, setTab] = useState('system');
  const [section, setSection] = useState(null); // null = home (grid)
  const [sidebarItem, setSidebarItem] = useState(null);
  const [search, setSearch] = useState('');
  const [exiting, setExiting] = useState(false);
  const [glassFlash, setGlassFlash] = useState(false);
  const [sidebarRevealed, setSidebarRevealed] = useState(false);
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);

  const perf = perfLevel || 'full';

  // Get delay for animations based on perf mode
  const delay = perf === 'full' ? 220 : perf === 'balanced' ? 100 : 0;

  const openSection = useCallback((id) => {
    if (perf === 'performance') {
      setSection(id);
      const def = SECTION_SIDEBAR[id];
      const first = def?.section ? def.items[0]?.label : (def?.items?.[0] || null);
      setSidebarItem(first);
      setSidebarRevealed(true);
      return;
    }

    // Animate exit
    setExiting(true);
    setSidebarRevealed(false);
    if (perf === 'full') { setGlassFlash(true); setTimeout(() => setGlassFlash(false), 300); }

    setTimeout(() => {
      setExiting(false);
      setSection(id);
      const def = SECTION_SIDEBAR[id];
      const first = def?.section ? def.items[0]?.label : (def?.items?.[0] || null);
      setSidebarItem(first);

      // Stagger sidebar reveal
      requestAnimationFrame(() => {
        if (sidebarRef.current) {
          const items = sidebarRef.current.querySelectorAll('[data-sidebar-item]');
          items.forEach((el, i) => {
            const d = perf === 'full' ? i * 40 : i * 15;
            setTimeout(() => el.classList.add(styles.revealed), d);
          });
          // After all are revealed, set state so re-renders keep them visible
          setTimeout(() => setSidebarRevealed(true), (items.length * (perf === 'full' ? 40 : 15)) + 50);
        }
        if (contentRef.current) {
          requestAnimationFrame(() => contentRef.current?.classList.add(styles.revealed));
        }
      });
    }, delay);
  }, [perf, delay]);

  const goBack = useCallback(() => {
    if (contentRef.current) contentRef.current.classList.remove(styles.revealed);
    setSidebarRevealed(false);
    
    setTimeout(() => {
      setSection(null);
      setSidebarItem(null);
    }, perf === 'performance' ? 0 : 80);
  }, [perf]);

  const selectSidebarItem = useCallback((label) => {
    if (contentRef.current) contentRef.current.classList.remove(styles.revealed);
    
    setTimeout(() => {
      setSidebarItem(label);
      requestAnimationFrame(() => contentRef.current?.classList.add(styles.revealed));
    }, perf === 'performance' ? 0 : 40);
  }, [perf]);

  // Filter grid items by search
  const gridItems = (GRID[tab] || []).filter(
    item => !search || item.label.toLowerCase().includes(search.toLowerCase())
  );

  const sectionDef = section ? SECTION_SIDEBAR[section] : null;

  // ─── SECTION VIEW ───
  if (section && sectionDef) {
    const items = sectionDef.section
      ? sectionDef.items
      : (sectionDef.items || []).map(label => ({ label }));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Back bar */}
        <div className={styles.backBar} onClick={goBack}>
          <ChevronLeftIcon size={16} />
          <span className={styles.backCrumb}>Settings</span>
          <span style={{ opacity: 0.3 }}>›</span>
          <span className={styles.backSection}>{sectionDef.label}</span>
        </div>

        {/* Sidebar + Content */}
        <div className={styles.sectionLayout}>
          <div className={styles.sidebar} ref={sidebarRef}>
            {items.map((item, i) => {
              const label = typeof item === 'string' ? item : item.label;
              const sectionLabel = typeof item === 'object' ? item.section : null;
              return (
                <div key={label}>
                  {sectionLabel && <div className={styles.sidebarSection}>{sectionLabel}</div>}
                  <div
                    data-sidebar-item
                    className={`${styles.sidebarItem} ${sidebarItem === label ? styles.sidebarItemActive : ''} ${(perf === 'performance' || sidebarRevealed) ? styles.revealed : ''}`}
                    onClick={() => selectSidebarItem(label)}
                  >
                    {label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.sectionContent}>
            <div
              className={`${styles.contentInner} ${perf === 'performance' ? styles.revealed : ''}`}
              ref={contentRef}
            >
              {/* TODO: Render actual components here based on section + sidebarItem */}
              <div className={styles.placeholder}>
                {sectionDef.label} › {sidebarItem || '...'}<br />
                <span style={{ fontSize: 11, marginTop: 8, display: 'block', opacity: 0.5 }}>
                  Component will be ported here
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── HOME VIEW (Grid) ───
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Glass overlay for transitions */}
      <div className={`${styles.glassOverlay} ${glassFlash ? styles.glassFlash : ''}`} />

      {/* Tabs + Search */}
      <div className={styles.tabsBar}>
        {TABS.map(t => (
          <div
            key={t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => { setTab(t.id); setSearch(''); }}
          >
            {t.label}
          </div>
        ))}
        <div className={styles.searchBarInline}>
          <SearchIcon size={13} />
          <input
            className={styles.searchInput}
            placeholder="Search settings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className={styles.gridWrap}>
          <div className={`${styles.grid} ${exiting ? styles.gridExiting : ''}`}>
            {gridItems.map(item => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  className={styles.gridItem}
                  onClick={() => openSection(item.id)}
                >
                  <div className={styles.gridIcon}>
                    <IconComp size={44} />
                  </div>
                  <span className={styles.gridLabel}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
