import { useState, useCallback, useRef } from 'react';
import { useTheme, useAuth } from '@context';
import { ChevronLeftIcon, SearchIcon } from '@icons';
import * as Hub from '@icons/hub/index.jsx';
import styles from './SettingsHub.module.css';

// ─── Settings page imports ───
import {
  PerformanceSection, ThemeSection, AccentSection, GlowSection,
  IconsSection, DockSection, WallpaperSection, TextSizeSection,
  WidgetGeneralSection, WidgetScaleSection, WidgetActiveSection,
  HardwarePage, LanguagePage, NotificationsPage, AboutPage,
} from '../settings/Settings.jsx';

// ─── Network page imports ───
import {
  InterfacesPage, DDNSPage, PortsPage, FirewallPage, Fail2banPage,
  SmbPanel, FtpPanel, SshPanel, NfsPanel, WebDavPanel,
  DnsPanel, CertsPanel, ProxyPanel, RemoteAccessPanel,
} from '../network/Network.jsx';

// ─── Storage imports ───
import {
  StorageProvider,
  StorageOverviewView, StorageDisksView, StoragePoolsView,
  StorageSmartView, StorageCreateView, StorageRestoreView,
} from '../storage/StorageManager.jsx';

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
  'storage-mgr':   { label: 'Storage Manager', grouped: true, items: [
    { label: 'Overview', section: 'Storage' },
    { label: 'Physical Disks' }, { label: 'Pools' }, { label: 'SMART Health' },
    { label: 'Create Pool', section: 'Actions' }, { label: 'Restore Pool' },
  ]},
  'network-mgr':   { label: 'Network', grouped: true, items: [
    { label: 'Interfaces', section: 'Network' },
    { label: 'DNS' },
    { label: 'Remote Access', section: 'External Access' },
    { label: 'Port Exposure' },
    { label: 'DDNS' }, { label: 'Reverse Proxy' }, { label: 'Certificates' },
    { label: 'SMB / CIFS', section: 'Services' },
    { label: 'FTP / SFTP' }, { label: 'SSH' }, { label: 'NFS' }, { label: 'WebDAV' },
    { label: 'Firewall', section: 'Security' }, { label: 'Fail2ban' },
  ]},
  'users':         { label: 'Users', items: ['All Users', 'Create User', 'Permissions'] },
  'portal':        { label: 'Portal', items: ['Web Portal', 'Ports', 'Service Control'] },
  'monitor':       { label: 'System Monitor', items: ['Overview', 'CPU', 'Memory', 'GPU', 'Processes'] },
  'updates':       { label: 'Updates', items: ['Check Updates', 'Update Log'] },
  'power':         { label: 'Power', items: ['Restart Service', 'Reboot System', 'Shutdown'] },
  'disks':         { label: 'Disks', items: ['Physical Disks', 'SMART Health'] },
  'pools':         { label: 'Pools & RAID', grouped: true, items: [
    { label: 'Pools', section: 'Storage' },
    { label: 'Create Pool', section: 'Actions' }, { label: 'Restore Pool' },
  ]},
  'health':        { label: 'Health', items: ['SMART Health'] },
  'interfaces':    { label: 'Interfaces', items: ['Overview'] },
  'remote-access': { label: 'Remote Access', items: ['Configuration'] },
  'ddns':          { label: 'DDNS', items: ['Configuration'] },
  'reverse-proxy': { label: 'Reverse Proxy', items: ['Rules'] },
  'smb':           { label: 'SMB / CIFS', items: ['Configuration'] },
  'ssh':           { label: 'SSH', items: ['Configuration'] },
  'ftp':           { label: 'FTP / SFTP', items: ['Configuration'] },
  'nfs':           { label: 'NFS', items: ['Configuration'] },
  'webdav':        { label: 'WebDAV', items: ['Configuration'] },
  'firewall':      { label: 'Firewall', items: ['Rules'] },
  'certificates':  { label: 'Certificates', items: ['Management'] },
  '2fa':           { label: '2FA / Login', items: ['Two-Factor Auth', 'Login Settings', 'Password Policy'] },
  'sessions':      { label: 'Sessions', items: ['Active Sessions', 'History'] },
  'backup':        { label: 'Backup', items: ['Create Backup', 'Restore', 'Schedule'] },
  'logs':          { label: 'Logs', items: ['System Log', 'Access Log', 'Update Log'] },
  'theme':         { label: 'Appearance', items: ['Theme', 'Accent Color', 'Performance', 'Window Glow'] },
  'wallpaper':     { label: 'Desktop', items: ['Wallpaper', 'Icons', 'Dock', 'Text Size'] },
  'taskbar':       { label: 'Taskbar', items: ['Position', 'Size', 'Auto-hide', 'Pinned Apps'] },
  'widgets':       { label: 'Widgets', items: ['General', 'Scale', 'Active Widgets'] },
  'sysinfo':       { label: 'About', items: ['System Info'] },
  'license':       { label: 'License', items: ['NimbusOS License'] },
};

// ═══════════════════════════════════
// Component Registry
// Maps section ID + sidebar item → React component
// Sections/items not listed render the placeholder
// ═══════════════════════════════════

const SECTION_COMPONENTS = {
  // ─── Appearance ───
  'theme': {
    'Theme':        ThemeSection,
    'Accent Color': AccentSection,
    'Performance':  PerformanceSection,
    'Window Glow':  GlowSection,
  },
  'wallpaper': {
    'Wallpaper':  WallpaperSection,
    'Icons':      IconsSection,
    'Dock':       DockSection,
    'Text Size':  TextSizeSection,
  },
  'widgets': {
    'General':        WidgetGeneralSection,
    'Scale':          WidgetScaleSection,
    'Active Widgets': WidgetActiveSection,
  },
  'sysinfo': {
    'System Info': AboutPage,
  },

  // ─── Network (unified sidebar) ───
  'network-mgr': {
    'Interfaces':    InterfacesPage,
    'DNS':           DnsPanel,
    'Remote Access': RemoteAccessPanel,
    'Port Exposure': PortsPage,
    'DDNS':          DDNSPage,
    'Reverse Proxy': ProxyPanel,
    'Certificates':  CertsPanel,
    'SMB / CIFS':    SmbPanel,
    'FTP / SFTP':    FtpPanel,
    'SSH':           SshPanel,
    'NFS':           NfsPanel,
    'WebDAV':        WebDavPanel,
    'Firewall':      FirewallPage,
    'Fail2ban':      Fail2banPage,
  },

  // ─── Network (individual grid items) ───
  'interfaces':    { 'Overview':      InterfacesPage },
  'remote-access': { 'Configuration': RemoteAccessPanel },
  'ddns':          { 'Configuration': DDNSPage },
  'reverse-proxy': { 'Rules':         ProxyPanel },
  'smb':           { 'Configuration': SmbPanel },
  'ssh':           { 'Configuration': SshPanel },
  'ftp':           { 'Configuration': FtpPanel },
  'nfs':           { 'Configuration': NfsPanel },
  'webdav':        { 'Configuration': WebDavPanel },
  'firewall':      { 'Rules':         FirewallPage },
  'certificates':  { 'Management':    CertsPanel },

  // ─── Storage (unified sidebar) ───
  'storage-mgr': {
    'Overview':       StorageOverviewView,
    'Physical Disks': StorageDisksView,
    'Pools':          StoragePoolsView,
    'SMART Health':   StorageSmartView,
    'Create Pool':    StorageCreateView,
    'Restore Pool':   StorageRestoreView,
  },

  // ─── Storage (individual grid items) ───
  'disks':  { 'Physical Disks': StorageDisksView, 'SMART Health': StorageSmartView },
  'pools':  { 'Pools': StoragePoolsView, 'Create Pool': StorageCreateView, 'Restore Pool': StorageRestoreView },
  'health': { 'SMART Health': StorageSmartView },
};

// ═══════════════════════════════════
// Section Renderer — resolves component from registry, wraps providers as needed
// Lives outside SettingsHub so provider doesn't re-mount on sidebar item change
// ═══════════════════════════════════

const PROVIDER_SECTIONS = { 'storage-mgr': StorageProvider, 'disks': StorageProvider, 'pools': StorageProvider, 'health': StorageProvider };

function SectionRendererInner({ section, sidebarItem, sectionDef }) {
  const sectionMap = SECTION_COMPONENTS[section];
  const SectionComp = sectionMap?.[sidebarItem];
  if (SectionComp) return <SectionComp />;
  return (
    <div className={styles.placeholder}>
      {sectionDef.label} › {sidebarItem || '...'}<br />
      <span style={{ fontSize: 11, marginTop: 8, display: 'block', opacity: 0.5 }}>
        Component will be ported here
      </span>
    </div>
  );
}

function SectionRenderer({ section, sidebarItem, sectionDef }) {
  const Provider = PROVIDER_SECTIONS[section];
  if (Provider) {
    return <Provider><SectionRendererInner section={section} sidebarItem={sidebarItem} sectionDef={sectionDef} /></Provider>;
  }
  return <SectionRendererInner section={section} sidebarItem={sidebarItem} sectionDef={sectionDef} />;
}

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
              <SectionRenderer section={section} sidebarItem={sidebarItem} sectionDef={sectionDef} />
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
