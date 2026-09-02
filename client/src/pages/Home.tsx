import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BatteryCharging,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleDot,
  ClipboardList,
  CloudRain,
  Download,
  Gauge,
  Layers3,
  LocateFixed,
  Menu,
  Minus,
  MoreHorizontal,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Signal,
  SlidersHorizontal,
  Sparkles,
  Truck,
  Users,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type RiskLevel = "critical" | "warning" | "normal";
type AlertType = "Critical" | "Pre-alert";
type AlertStatus = "Open" | "In Progress" | "Resolved";

type Manhole = {
  id: string;
  label: string;
  ward: string;
  fill: number;
  trend: "rising" | "stable" | "falling";
  status: RiskLevel;
  lastAlert: string;
  crew: string;
  top: string;
  left: string;
};

type AlertItem = {
  id: string;
  time: string;
  manhole: string;
  ward: string;
  fill: number;
  crew: string;
  crewStatus: string;
  sla: string;
  type: AlertType;
  status: AlertStatus;
};

const manholes: Manhole[] = [
  { id: "MH-0427", label: "East Canal Road", ward: "Ward 05", fill: 97, trend: "rising", status: "critical", lastAlert: "2 min ago", crew: "Crew Alpha", top: "33%", left: "39%" },
  { id: "MH-0312", label: "Perambur High Rd", ward: "Ward 08", fill: 88, trend: "rising", status: "warning", lastAlert: "18 min ago", crew: "Crew Delta", top: "24%", left: "67%" },
  { id: "MH-0198", label: "Madhavaram Link", ward: "Ward 03", fill: 74, trend: "stable", status: "normal", lastAlert: "1 hr ago", crew: "Unassigned", top: "55%", left: "23%" },
  { id: "MH-0534", label: "Millers Junction", ward: "Ward 11", fill: 96, trend: "rising", status: "critical", lastAlert: "7 min ago", crew: "Crew Bravo", top: "63%", left: "71%" },
  { id: "MH-0271", label: "Purasawalkam", ward: "Ward 06", fill: 82, trend: "stable", status: "warning", lastAlert: "26 min ago", crew: "Crew Charlie", top: "47%", left: "54%" },
  { id: "MH-0449", label: "Otteri Bridge", ward: "Ward 09", fill: 61, trend: "falling", status: "normal", lastAlert: "2 hr ago", crew: "Unassigned", top: "78%", left: "45%" },
  { id: "MH-0622", label: "Koyambedu Market", ward: "Ward 14", fill: 91, trend: "rising", status: "warning", lastAlert: "11 min ago", crew: "Crew Echo", top: "18%", left: "45%" },
  { id: "MH-0710", label: "Aminjikarai", ward: "Ward 07", fill: 78, trend: "stable", status: "normal", lastAlert: "44 min ago", crew: "Unassigned", top: "39%", left: "79%" },
];

const alerts: AlertItem[] = [
  { id: "ALT-2984", time: "09:24:18", manhole: "MH-0427", ward: "Ward 05", fill: 97, crew: "Crew Alpha", crewStatus: "En route", sla: "08:42", type: "Critical", status: "In Progress" },
  { id: "ALT-2983", time: "09:19:44", manhole: "MH-0534", ward: "Ward 11", fill: 96, crew: "Crew Bravo", crewStatus: "Assigned", sla: "03:18", type: "Critical", status: "Open" },
  { id: "ALT-2982", time: "09:15:09", manhole: "MH-0312", ward: "Ward 08", fill: 88, crew: "Crew Delta", crewStatus: "On site", sla: "14:51", type: "Pre-alert", status: "In Progress" },
  { id: "ALT-2981", time: "09:07:32", manhole: "MH-0622", ward: "Ward 14", fill: 91, crew: "Crew Echo", crewStatus: "Assigned", sla: "22:07", type: "Pre-alert", status: "Open" },
  { id: "ALT-2980", time: "08:56:21", manhole: "MH-0271", ward: "Ward 06", fill: 82, crew: "Crew Charlie", crewStatus: "Resolved", sla: "—", type: "Pre-alert", status: "Resolved" },
];

const tickets = [
  { id: "TKT-1098", manhole: "MH-0427", title: "Overflow risk — East Canal", status: "In Progress", crew: "Crew Alpha", created: "09:24", deadline: "09:33", accent: "cyan" },
  { id: "TKT-1097", manhole: "MH-0534", title: "Critical level — Millers Jct.", status: "Open", crew: "Crew Bravo", created: "09:19", deadline: "09:28", accent: "red" },
  { id: "TKT-1096", manhole: "MH-0312", title: "Rising level — Perambur", status: "In Progress", crew: "Crew Delta", created: "09:15", deadline: "09:30", accent: "amber" },
  { id: "TKT-1095", manhole: "MH-0622", title: "Pre-alert review — Koyambedu", status: "Open", crew: "Crew Echo", created: "09:07", deadline: "09:37", accent: "amber" },
];

const wards = [
  { name: "Ward 05", risk: 92, action: "Pre-position crew", tone: "critical" },
  { name: "Ward 11", risk: 84, action: "Inspect choke point", tone: "critical" },
  { name: "Ward 08", risk: 71, action: "Monitor inflow", tone: "warning" },
  { name: "Ward 14", risk: 58, action: "Review sensor trend", tone: "warning" },
];

const navGroups = [
  { label: "Command centre", items: [{ label: "Overview", icon: Gauge }, { label: "Live map", icon: MapIcon }] },
  { label: "Operations", items: [{ label: "Alert feed", icon: Bell, count: "07" }, { label: "Tickets", icon: ClipboardList, count: "12" }, { label: "Crew dispatch", icon: Truck }] },
  { label: "Intelligence", items: [{ label: "Risk analytics", icon: BarChart3 }, { label: "Sensor health", icon: Activity }] },
];

function MapIcon(props: { size?: number; className?: string }) {
  return <svg width={props.size ?? 24} height={props.size ?? 24} className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15M15 6v15" /></svg>;
}

function statusColor(status: RiskLevel) {
  if (status === "critical") return "#ff5d70";
  if (status === "warning") return "#f7bd4b";
  return "#45d6b0";
}

function TrendIcon({ trend }: { trend: Manhole["trend"] }) {
  if (trend === "rising") return <ArrowUpRight size={13} className="trend-up" />;
  if (trend === "falling") return <ArrowDownRight size={13} className="trend-down" />;
  return <span className="trend-stable">—</span>;
}

function MiniBars({ bars, tone = "cyan" }: { bars: number[]; tone?: "cyan" | "amber" | "red" | "mint" }) {
  return <div className={`mini-bars ${tone}`} aria-hidden="true">{bars.map((height, index) => <i key={`${height}-${index}`} style={{ height: `${height}%` }} />)}</div>;
}

function RiskMarker({ manhole, selected, onClick }: { manhole: Manhole; selected: boolean; onClick: () => void }) {
  return <button className={`map-marker ${manhole.status} ${selected ? "selected" : ""}`} style={{ top: manhole.top, left: manhole.left }} onClick={onClick} aria-label={`View ${manhole.id}, ${manhole.fill}% full`}><span className="marker-pulse" /><span className="marker-core"><span>{manhole.fill}</span></span>{selected && <span className="marker-tag">{manhole.id}</span>}</button>;
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [selectedManholeId, setSelectedManholeId] = useState("MH-0427");
  const [selectedAlertId, setSelectedAlertId] = useState("ALT-2984");
  const [alertTab, setAlertTab] = useState<"Critical" | "All">("Critical");
  const [alertType, setAlertType] = useState("All types");
  const [alertStatus, setAlertStatus] = useState("All status");
  const [mapMode, setMapMode] = useState<"Live levels" | "Risk overlay">("Live levels");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState<string[]>([]);
  const [lastSync, setLastSync] = useState("09:26:10");

  const selectedManhole = manholes.find((item) => item.id === selectedManholeId) ?? manholes[0];
  const selectedAlert = alerts.find((item) => item.id === selectedAlertId) ?? alerts[0];
  const filteredAlerts = useMemo(() => alerts.filter((alert) => {
    const matchesTab = alertTab === "All" || alert.type === "Critical";
    const matchesType = alertType === "All types" || alert.type === alertType;
    const matchesStatus = alertStatus === "All status" || alert.status === alertStatus;
    return matchesTab && matchesType && matchesStatus;
  }), [alertTab, alertType, alertStatus]);

  const showToast = (message: string) => toast(message, { duration: 2200 });
  const syncNow = () => { setLastSync("09:26:32"); showToast("Live telemetry synced · 1,248 devices checked"); };
  const acknowledgeAlert = (id: string) => { setAcknowledged((current) => current.includes(id) ? current : [...current, id]); showToast(`${id} acknowledged · escalation timer paused`); };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
      <div className="brand-lockup"><div className="brand-mark"><span /><span /><span /></div><div><div className="brand-name">SSOP<span>.</span></div><div className="brand-subtitle">Smart Sewer Operations</div></div><button className="sidebar-close mobile-only" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu"><X size={18} /></button></div>
      <div className="city-switcher"><div className="city-emblem">CH</div><div className="city-copy"><span className="eyebrow">Operating city</span><strong>Chennai Corporation</strong></div><ChevronDown size={15} className="muted-icon" /></div>
      <nav className="nav-groups">{navGroups.map((group) => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map((item) => { const Icon = item.icon; const active = activeNav === item.label; return <button className={`nav-item ${active ? "active" : ""}`} key={item.label} onClick={() => { setActiveNav(item.label); if (!["Overview", "Live map"].includes(item.label)) showToast(`${item.label} module preview selected`); setMobileMenuOpen(false); }}><Icon size={17} strokeWidth={active ? 2.3 : 1.8} /><span>{item.label}</span>{(item as { count?: string }).count && <b>{(item as { count?: string }).count}</b>}{active && <span className="active-rail" />}</button>; })}</div>)}</nav>
      <div className="sidebar-bottom"><div className="monsoon-card"><div className="monsoon-icon"><CloudRain size={17} /></div><div><strong>Monsoon mode</strong><span>Active · 18 days</span></div><span className="live-dot" /></div><button className="sidebar-action" onClick={() => showToast("Settings module is available in the full platform")}><Settings2 size={17} /><span>Workspace settings</span></button><div className="user-card"><div className="avatar">AR</div><div className="user-copy"><strong>Ananya Rao</strong><span>Commissioner view</span></div><MoreHorizontal size={17} className="muted-icon" /></div></div>
    </aside>

    <div className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu mobile-only" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu"><Menu size={19} /></button><div><div className="breadcrumb"><span>Chennai / North zone</span><ChevronRight size={13} /><strong>{activeNav}</strong></div><h1>{activeNav === "Overview" || activeNav === "Live map" ? "Command centre" : activeNav}</h1></div></div><div className="topbar-actions"><div className="system-status"><span className="live-dot" /> All systems operational</div><div className="topbar-divider" /><button className="icon-button search-button" onClick={() => showToast("Search across manholes, tickets and wards")} aria-label="Search"><Search size={18} /></button><button className="icon-button notification-button" onClick={() => showToast("3 notifications · 1 critical alert needs attention")} aria-label="Notifications"><Bell size={18} /><span>3</span></button><button className="topbar-profile" onClick={() => showToast("Signed in as Ananya Rao")}><div className="avatar small">AR</div><ChevronDown size={14} /></button></div></header>

      <main className="content">
        <section className="intro-row"><div><div className="section-kicker"><span className="kicker-line" /> LIVE OPERATIONS · 02 SEP 2026</div><h2>Good morning, Ananya <span>↗</span></h2><p>Here’s the pulse of Chennai’s drainage network. <strong>7 alerts need attention.</strong></p></div><div className="intro-actions"><div className="synced-time"><span>Last synced</span><strong>{lastSync} IST</strong></div><button className="button secondary" onClick={syncNow}><RefreshCw size={15} /> Sync now</button><button className="button primary" onClick={() => showToast("Report export prepared · PDF and CSV available shortly")}><Download size={15} /> Export report</button></div></section>

        <section className="kpi-grid"><div className="kpi-card critical-card"><div className="kpi-head"><span className="kpi-icon red"><CircleAlert size={17} /></span><span>Critical now</span><button onClick={() => setAlertTab("Critical")}><MoreHorizontal size={17} /></button></div><div className="kpi-value-row"><strong>07</strong><span className="delta negative"><ArrowUpRight size={13} /> +2</span></div><div className="kpi-foot"><span>since 08:00 today</span><MiniBars bars={[36, 48, 35, 52, 42, 70, 63, 87, 77, 95]} tone="red" /></div></div><div className="kpi-card"><div className="kpi-head"><span className="kpi-icon cyan"><Zap size={17} /></span><span>Avg. response</span><button onClick={() => showToast("Response target: under 15 minutes")}><MoreHorizontal size={17} /></button></div><div className="kpi-value-row"><strong>11<span>m</span> 42<span>s</span></strong><span className="delta positive"><ArrowDownRight size={13} /> -18%</span></div><div className="kpi-foot"><span>vs. 7-day average</span><MiniBars bars={[65, 62, 73, 54, 48, 57, 45, 51, 43, 38]} /></div></div><div className="kpi-card"><div className="kpi-head"><span className="kpi-icon mint"><Wifi size={17} /></span><span>Manholes online</span><button onClick={() => setActiveNav("Sensor health")}><MoreHorizontal size={17} /></button></div><div className="kpi-value-row"><strong>1,248<span>/1,261</span></strong><span className="delta positive"><ArrowUpRight size={13} /> 98.9%</span></div><div className="kpi-foot"><span>13 devices need review</span><MiniBars bars={[75, 78, 82, 81, 89, 86, 88, 92, 90, 95]} tone="mint" /></div></div><div className="kpi-card"><div className="kpi-head"><span className="kpi-icon amber"><CloudRain size={17} /></span><span>Flood risk · next 3h</span><button onClick={() => setMapMode("Risk overlay")}><MoreHorizontal size={17} /></button></div><div className="kpi-value-row"><strong>14 <span>wards</span></strong><span className="delta negative"><ArrowUpRight size={13} /> +3 rising</span></div><div className="kpi-foot"><span>rainfall nowcast 18 mm/h</span><MiniBars bars={[40, 43, 55, 48, 58, 71, 66, 78, 83, 90]} tone="amber" /></div></div></section>

        <section className="primary-grid"><div className="panel map-panel"><div className="panel-heading"><div><div className="panel-title-row"><MapIcon size={17} className="panel-icon" /><h3>Network map</h3><span className="live-badge"><span className="live-dot" /> LIVE</span></div><p>1,261 monitored manholes · North zone</p></div><div className="segmented"><button className={mapMode === "Live levels" ? "selected" : ""} onClick={() => setMapMode("Live levels")}>Live levels</button><button className={mapMode === "Risk overlay" ? "selected" : ""} onClick={() => setMapMode("Risk overlay")}>Risk overlay</button></div></div><div className={`map-canvas ${mapMode === "Risk overlay" ? "risk-mode" : ""}`}><div className="map-glow glow-one" /><div className="map-glow glow-two" /><svg className="map-lines" viewBox="0 0 900 460" preserveAspectRatio="none" aria-hidden="true"><path d="M-30 90 C120 70 158 170 280 145 S460 88 585 142 760 130 940 50" /><path d="M-40 285 C100 235 220 280 305 240 S455 198 550 230 760 300 940 228" /><path d="M100 -20 C145 86 118 185 176 262 S245 394 210 490" /><path d="M330 -15 C294 89 360 173 330 240 S304 360 360 490" /><path d="M610 -15 C565 75 650 168 596 250 S570 375 640 490" /><path d="M765 -12 C730 90 790 180 750 288 S790 390 770 480" /><path d="M18 180 C170 186 245 105 400 118 S650 190 888 154" className="minor-road" /><path d="M28 380 C170 324 262 388 430 360 S692 332 908 394" className="minor-road" /></svg><div className="map-label label-one">WARD 05 · HIGH RISK</div><div className="map-label label-two">WARD 11</div><div className="map-label label-three">NORTH ZONE</div><div className="map-label label-four">CANAL CORRIDOR</div><div className="risk-zone zone-a" /><div className="risk-zone zone-b" />{manholes.map((manhole) => <RiskMarker key={manhole.id} manhole={manhole} selected={selectedManhole.id === manhole.id} onClick={() => setSelectedManholeId(manhole.id)} />)}<div className="map-overlay-card"><div className="selected-card-top"><span className={`status-pip ${selectedManhole.status}`} /><span>{selectedManhole.status === "critical" ? "Critical level" : selectedManhole.status === "warning" ? "Pre-alert" : "Normal range"}</span><button onClick={() => setSelectedManholeId("")} aria-label="Close selected manhole card"><X size={14} /></button></div><div className="selected-id"><strong>{selectedManhole.id}</strong><span>{selectedManhole.ward}</span></div><div className="selected-place">{selectedManhole.label}</div><div className="fill-reading"><strong>{selectedManhole.fill}%</strong><span>current fill</span><span className={`trend ${selectedManhole.trend}`}><TrendIcon trend={selectedManhole.trend} /> {selectedManhole.trend}</span></div><div className="fill-bar"><span style={{ width: `${selectedManhole.fill}%`, background: statusColor(selectedManhole.status) }} /></div><div className="selected-meta"><span><span className="clock-meta">◷</span> {selectedManhole.lastAlert}</span><span><Users size={12} /> {selectedManhole.crew}</span></div></div><div className="map-controls"><button onClick={() => showToast("Map zoomed in")} aria-label="Zoom in"><Plus size={16} /></button><button onClick={() => showToast("Map zoomed out")} aria-label="Zoom out"><Minus size={16} /></button><span /><button onClick={() => showToast("Map centred on North zone")} aria-label="Centre map"><LocateFixed size={16} /></button><button onClick={() => setMapMode(mapMode === "Live levels" ? "Risk overlay" : "Live levels")} aria-label="Toggle map layers"><Layers3 size={16} /></button></div><div className="map-legend"><span><i className="legend-dot green" /> &lt;80%</span><span><i className="legend-dot yellow" /> 80–94%</span><span><i className="legend-dot red" /> ≥95%</span></div><div className="map-scale">500 m</div></div></div>

          <div className="panel alert-panel"><div className="panel-heading alert-heading"><div><div className="panel-title-row"><Bell size={17} className="panel-icon" /><h3>Live alert feed</h3><span className="alert-count">07</span></div><p>Prioritised by fill level and SLA risk</p></div><button className="icon-button small" onClick={syncNow} aria-label="Refresh alerts"><RefreshCw size={15} /></button></div><div className="alert-tabs"><button className={alertTab === "Critical" ? "active" : ""} onClick={() => setAlertTab("Critical")}>Critical <span>4</span></button><button className={alertTab === "All" ? "active" : ""} onClick={() => setAlertTab("All")}>All alerts <span>23</span></button></div><div className="filter-row"><label><SlidersHorizontal size={13} /><select value={alertType} onChange={(event) => setAlertType(event.target.value)}><option>All types</option><option>Critical</option><option>Pre-alert</option></select></label><label><select value={alertStatus} onChange={(event) => setAlertStatus(event.target.value)}><option>All status</option><option>Open</option><option>In Progress</option><option>Resolved</option></select><ChevronDown size={13} /></label></div><div className="alert-list">{filteredAlerts.map((alert) => { const isAcknowledged = acknowledged.includes(alert.id); return <button key={alert.id} className={`alert-row ${selectedAlert.id === alert.id ? "selected" : ""} ${alert.fill >= 95 ? "critical" : "warning"}`} onClick={() => { setSelectedAlertId(alert.id); setSelectedManholeId(alert.manhole); }}><span className="alert-severity"><span className="severity-ring" /></span><span className="alert-main"><span className="alert-topline"><strong>{alert.manhole}</strong><em>{alert.time}</em></span><span className="alert-subline">{alert.ward} <i /> {alert.crew} · {alert.crewStatus}</span></span><span className="alert-right"><strong>{alert.fill}%</strong><span className={`sla-time ${alert.fill >= 95 ? "urgent" : ""}`}>{isAcknowledged ? "Paused" : `${alert.sla} SLA`}</span></span><ChevronRight size={15} className="row-chevron" /></button>; })}{filteredAlerts.length === 0 && <div className="empty-state">No alerts match these filters.</div>}</div><div className="alert-detail-footer"><div className="detail-caption"><span>Selected alert</span><strong>{selectedAlert.id} · {selectedAlert.manhole}</strong></div><button className="button tiny secondary" onClick={() => acknowledgeAlert(selectedAlert.id)} disabled={acknowledged.includes(selectedAlert.id)}>{acknowledged.includes(selectedAlert.id) ? <Check size={13} /> : <ShieldCheck size={13} />} {acknowledged.includes(selectedAlert.id) ? "Acknowledged" : "Acknowledge"}</button></div></div></section>

        <section className="secondary-grid"><div className="panel analytics-panel"><div className="panel-heading"><div><div className="panel-title-row"><BarChart3 size={17} className="panel-icon" /><h3>Ward performance</h3></div><p>Fill levels and alert volume across the last 24 hours</p></div><button className="text-button" onClick={() => showToast("Opening full ward analytics")}>View analytics <ArrowUpRight size={14} /></button></div><div className="analytics-content"><div className="chart-block"><div className="chart-header"><div><strong>Average fill level</strong><span>Last 12 hours · all wards</span></div><div className="chart-legend"><span><i className="legend-line cyan" />Fill %</span><span><i className="legend-line red" />Alert threshold</span></div></div><div className="line-chart"><div className="chart-y"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><svg viewBox="0 0 720 190" preserveAspectRatio="none" aria-label="Average fill level line chart"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#4fdcc4" stopOpacity="0.3" /><stop offset="1" stopColor="#4fdcc4" stopOpacity="0" /></linearGradient></defs><path className="grid-line" d="M0 20H720M0 58H720M0 96H720M0 134H720M0 172H720" /><path className="threshold-line" d="M0 38H720" /><path className="area-path" d="M0 132 C44 126 45 118 89 121 S135 109 176 114 221 98 263 106 308 88 352 98 398 74 440 87 485 65 528 77 573 52 615 62 665 46 720 54 L720 172 L0 172Z" /><path className="data-path" d="M0 132 C44 126 45 118 89 121 S135 109 176 114 221 98 263 106 308 88 352 98 398 74 440 87 485 65 528 77 573 52 615 62 665 46 720 54" /><circle cx="615" cy="62" r="4" className="chart-point" /><circle cx="720" cy="54" r="4" className="chart-point" /></svg><div className="chart-x"><span>21:00</span><span>00:00</span><span>03:00</span><span>06:00</span><span>09:00</span></div></div></div><div className="bar-block"><div className="chart-header"><div><strong>Alerts by ward</strong><span>Last 24 hours</span></div><button className="icon-button small" onClick={() => showToast("Alert volume expanded")}><MoreHorizontal size={15} /></button></div><div className="ward-bars">{[{ label: "W05", value: 92, count: 12 }, { label: "W11", value: 78, count: 9 }, { label: "W08", value: 59, count: 7 }, { label: "W14", value: 48, count: 5 }, { label: "W03", value: 32, count: 3 }].map((ward) => <div className="ward-bar-row" key={ward.label}><span>{ward.label}</span><div><i style={{ width: `${ward.value}%` }} /></div><strong>{ward.count}</strong></div>)}</div></div></div></div><div className="panel sla-panel"><div className="panel-heading"><div><div className="panel-title-row"><ShieldCheck size={17} className="panel-icon" /><h3>SLA performance</h3></div><p>Alert response quality · rolling 7 days</p></div><button className="icon-button small" onClick={() => showToast("SLA report opened")}><MoreHorizontal size={15} /></button></div><div className="sla-score"><div className="score-ring"><span>92<span>%</span></span><small>within SLA</small></div><div className="score-copy"><div><span>Response target</span><strong>&lt; 15 min</strong></div><div><span>Average actual</span><strong>11m 42s</strong></div><div><span>Pending breaches</span><strong className="red-text">02</strong></div></div></div><div className="sla-foot"><span><i className="legend-dot green" /> 6 resolved within SLA</span><button className="text-button" onClick={() => showToast("Downloading SLA performance report")}>Details <ChevronRight size={14} /></button></div></div></section>

        <section className="bottom-grid"><div className="panel risk-panel"><div className="panel-heading"><div><div className="panel-title-row"><Sparkles size={17} className="panel-icon purple" /><h3>Predictive flood risk</h3><span className="forecast-badge">NEXT 1–3 HRS</span></div><p>AI risk scoring from levels, rainfall nowcast and history</p></div><button className="text-button" onClick={() => setMapMode("Risk overlay")}>Show on map <Layers3 size={14} /></button></div><div className="risk-content"><div className="risk-wards">{wards.map((ward) => <button className="risk-ward" key={ward.name} onClick={() => showToast(`${ward.name}: ${ward.action}`)}><div className="risk-ward-top"><span><i className={`risk-dot ${ward.tone}`} />{ward.name}</span><strong>{ward.risk}</strong></div><div className="risk-progress"><i className={ward.tone} style={{ width: `${ward.risk}%` }} /></div><div className="risk-action"><span>{ward.action}</span><ChevronRight size={13} /></div></button>)}</div><div className="risk-callout"><div className="callout-icon"><Truck size={17} /></div><div><span>Recommended action</span><strong>Pre-position Crew Alpha in Ward 05</strong><p>Forecast models show 92% risk at 10:15 IST.</p></div><button className="button tiny primary" onClick={() => showToast("Crew Alpha pre-positioning task created")}>Dispatch</button></div></div></div><div className="panel health-panel"><div className="panel-heading"><div><div className="panel-title-row"><Radio size={17} className="panel-icon" /><h3>Sensor health</h3><span className="health-badge">98.9% online</span></div><p>Device fleet status · updated 2 min ago</p></div><button className="text-button" onClick={() => setActiveNav("Sensor health")}>View fleet <ChevronRight size={14} /></button></div><div className="health-stats"><div><span className="health-icon green"><CheckCircle2 size={15} /></span><strong>1,248</strong><small>Healthy</small></div><div><span className="health-icon amber"><BatteryCharging size={15} /></span><strong>08</strong><small>Low battery</small></div><div><span className="health-icon red"><Signal size={15} /></span><strong>05</strong><small>Weak signal</small></div><div><span className="health-icon grey"><CircleDot size={15} /></span><strong>00</strong><small>Offline</small></div></div><div className="health-table"><div><span>Device</span><span>Ward</span><span>Signal</span><span>Status</span></div><div><strong>MH-0427</strong><span>W05</span><span className="signal-bars"><i /><i /><i /></span><em className="ok">OK</em></div><div><strong>MH-0534</strong><span>W11</span><span className="signal-bars"><i /><i /></span><em className="review">Review</em></div></div></div></section>

        <section className="panel ticket-panel"><div className="panel-heading"><div><div className="panel-title-row"><ClipboardList size={17} className="panel-icon" /><h3>Active tickets</h3><span className="alert-count neutral">12</span></div><p>Open work orders generated from critical and pre-alert events</p></div><div className="ticket-actions"><button className="button secondary" onClick={() => showToast("Opening ticket management")}>Manage tickets <ChevronRight size={14} /></button><button className="icon-button small" onClick={() => showToast("Ticket options opened")}><MoreHorizontal size={15} /></button></div></div><div className="ticket-table"><div className="ticket-row ticket-header"><span>Ticket / issue</span><span>Status</span><span>Assigned crew</span><span>Created</span><span>SLA deadline</span><span /></div>{tickets.map((ticket) => <button className="ticket-row" key={ticket.id} onClick={() => showToast(`${ticket.id} selected · opening ticket detail`)}><span className="ticket-name"><i className={`ticket-dot ${ticket.accent}`} /><span><strong>{ticket.id}</strong><em>{ticket.manhole} · {ticket.title}</em></span></span><span><em className={`status-badge ${ticket.status === "Open" ? "open" : "progress"}`}>{ticket.status}</em></span><span className="crew-cell"><span className="crew-avatar">{ticket.crew.replace("Crew ", "").charAt(0)}</span>{ticket.crew}</span><span>{ticket.created} IST</span><span className={ticket.status === "Open" ? "deadline urgent" : "deadline"}>{ticket.deadline} IST</span><ChevronRight size={15} className="row-chevron" /></button>)}</div></section>
      </main>
      <footer className="footer"><span>SSOP control room · North zone</span><span><span className="live-dot" /> Telemetry stream healthy</span><span>v2.0 prototype</span></footer>
    </div>
  </div>;
}
