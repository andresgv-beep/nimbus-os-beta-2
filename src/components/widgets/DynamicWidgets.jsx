import { useWindows } from '@context';
import WidgetGrid from './WidgetGrid';
import ClockWidget from './ClockWidget';
import SystemMonitorWidget from './SystemMonitorWidget';
import DiskPoolWidget from './DiskPoolWidget';
import NetworkWidget from './NetworkWidget';
import UptimeWidget from './UptimeWidget';

// ═══════════════════════════════════
// Widget Registry
// Maps widget IDs to their components
// ═══════════════════════════════════

const WIDGET_REGISTRY = {
  'clock':          { component: ClockWidget,         label: 'Clock',          sizes: ['1x1'] },
  'system-monitor': { component: SystemMonitorWidget, label: 'System Monitor', sizes: ['2x1', '2x2'] },
  'disk-pool':      { component: DiskPoolWidget,      label: 'Disk Pool',      sizes: ['1x1', '2x1'] },
  'network':        { component: NetworkWidget,       label: 'Network',        sizes: ['1x1', '2x1'] },
  'uptime':         { component: UptimeWidget,        label: 'Uptime',         sizes: ['1x1'] },
};

// ═══════════════════════════════════
// Default widget layout (until user configures via NimSettings)
// ═══════════════════════════════════

const DEFAULT_WIDGETS = [
  { id: 'clock',          size: '1x1' },
  { id: 'uptime',         size: '1x1' },
  { id: 'system-monitor', size: '2x1' },
  { id: 'disk-pool',      size: '1x1' },
  { id: 'network',        size: '1x1' },
];

// ═══════════════════════════════════
// DynamicWidgets — renders on the desktop
// ═══════════════════════════════════

export default function DynamicWidgets() {
  const { openWindow } = useWindows();

  // TODO: read enabled widgets from user preferences context
  // For now, use defaults
  const widgets = DEFAULT_WIDGETS;
  const columns = 4;

  const renderWidget = (widget) => {
    const reg = WIDGET_REGISTRY[widget.id];
    if (!reg) return null;

    const Comp = reg.component;

    // Map widget IDs to the app they should open
    const appMap = {
      'system-monitor': 'monitor',
      'disk-pool':      'nimsettings',
      'network':        'nimsettings',
    };

    const handleClick = appMap[widget.id]
      ? () => openWindow(appMap[widget.id], { width: 960, height: 640 })
      : undefined;

    return <Comp size={widget.size} onClick={handleClick} />;
  };

  return (
    <WidgetGrid
      widgets={widgets}
      columns={columns}
      renderWidget={renderWidget}
    />
  );
}

// Export registry for NimSettings widget configurator
export { WIDGET_REGISTRY, DEFAULT_WIDGETS };
