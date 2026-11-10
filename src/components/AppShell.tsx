import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  ChevronDown,
  Cpu,
  Database,
  LayoutDashboard,
  Radio,
  RefreshCw,
  Settings,
  Signal,
  UploadCloud,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { NetworkMode } from '../lib/types'
interface DeviceStatus { modelReady: boolean; dbRecords: number; lastSyncAt?: number }
import { formatKb, formatRelative } from './format'

interface NetworkMeta {
  label: string
  description: string
  tone: string
  icon: LucideIcon
}

const NETWORK_META: Record<NetworkMode, NetworkMeta> = {
  online: {
    label: 'ONLINE (Live Sync)',
    description: 'Requests go straight to the cloud.',
    tone: 'is-online',
    icon: Wifi,
  },
  weak: {
    label: 'WEAK (Degraded)',
    description: '3s delay and 40% simulated failures.',
    tone: 'is-weak',
    icon: Signal,
  },
  offline: {
    label: 'OFFLINE (Local DB Active)',
    description: 'Everything stays in the on-device queue.',
    tone: 'is-offline',
    icon: WifiOff,
  },
}

const NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/field', label: 'Field Upload', icon: UploadCloud },
  { to: '/queue', label: 'Sync Queue', icon: RefreshCw },
  { to: '/central', label: 'Central', icon: Radio },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export interface AppShellProps {
  networkMode: NetworkMode
  onNetworkModeChange: (mode: NetworkMode) => void
  queueCount: number
  deviceStatus: DeviceStatus
  teamName?: string
  offlineDataKb?: number
  children?: ReactNode
}

export interface ConnectivityPillProps {
  mode: NetworkMode
  onChange: (mode: NetworkMode) => void
}

export function ConnectivityPill({ mode, onChange }: ConnectivityPillProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const meta = NETWORK_META[mode]
  const Icon = meta.icon

  useEffect(() => {
    if (!open) return
    const handlePointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div className={`conn-pill ${meta.tone}`} ref={rootRef}>
      <button
        type="button"
        className="pill-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Network mode: ${meta.label}. Change network mode`}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon size={13} aria-hidden />
        <span>{meta.label}</span>
        <ChevronDown size={13} className={`chevron ${open ? 'is-open' : ''}`} aria-hidden />
      </button>
      {open && (
        <div className="pill-menu" role="listbox" aria-label="Network mode">
          <p className="pill-menu-head">Simulated network</p>
          {(Object.keys(NETWORK_META) as NetworkMode[]).map((option) => {
            const optionMeta = NETWORK_META[option]
            const OptionIcon = optionMeta.icon
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={option === mode}
                className={`pill-option ${option === mode ? 'is-selected' : ''}`}
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
              >
                <span className={`dot ${optionMeta.tone}`} aria-hidden />
                <span className="pill-option-text">
                  <span className="pill-option-label">
                    <OptionIcon size={12} aria-hidden />
                    {optionMeta.label}
                  </span>
                  <span className="pill-option-desc">{optionMeta.description}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function SyncQueuePill({ count }: { count: number }) {
  return (
    <div className={`header-pill sync-pill ${count > 0 ? 'has-items' : 'is-clear'}`}>
      <RefreshCw size={13} className={count > 0 ? 'spin-slow' : ''} aria-hidden />
      <span>SYNC QUEUE:</span>
      <strong className="tabular">{count}</strong>
      <span className="header-pill-muted">Pending</span>
    </div>
  )
}

export function TeamPill({ name = 'ME BYTE' }: { name?: string }) {
  return (
    <div className="header-pill team-pill">
      <Users size={13} aria-hidden />
      <span>TEAM - {name}</span>
    </div>
  )
}

function Header({
  networkMode,
  onNetworkModeChange,
  queueCount,
  teamName,
}: Pick<AppShellProps, 'networkMode' | 'onNetworkModeChange' | 'queueCount' | 'teamName'>) {
  return (
    <header className="app-header">
      <NavLink to="/" className="brand" aria-label="ResQEdge home">
        <span className="brand-mark" aria-hidden>
          R
        </span>
        <span className="brand-text">
          <span className="brand-name">
            <span className="brand-resq">ResQ</span>
            <span className="brand-edge">Edge</span>
          </span>
          <span className="brand-tag">Offline response intelligence</span>
        </span>
      </NavLink>
      <div className="header-pills">
        <ConnectivityPill mode={networkMode} onChange={onNetworkModeChange} />
        <SyncQueuePill count={queueCount} />
        <TeamPill name={teamName} />
      </div>
    </header>
  )
}

export function DeviceStatusCard({ status }: { status: DeviceStatus }) {
  return (
    <div className="device-card">
      <div className="device-head">
        <span className="sidebar-label">DEVICE STATUS</span>
        <Radio size={12} className="device-pulse" aria-hidden />
      </div>
      <div className="device-row">
        <Cpu size={14} aria-hidden />
        <span>Model</span>
        <span className={`device-value ${status.modelReady ? 'is-good' : 'is-warn'}`}>
          {status.modelReady ? 'Offline ready' : 'Not cached'}
        </span>
      </div>
      <div className="device-row">
        <Database size={14} aria-hidden />
        <span>Local DB</span>
        <span className="device-value tabular">{status.dbRecords} rec</span>
      </div>
      <div className="device-row">
        <RefreshCw size={14} aria-hidden />
        <span>Last sync</span>
        <span className="device-value">{status.lastSyncAt ? formatRelative(status.lastSyncAt) : '—'}</span>
      </div>
      <p className="device-foot">Local-first · No cloud required</p>
    </div>
  )
}

export function Sidebar({ status }: { status: DeviceStatus }) {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar-nav">
        <p className="sidebar-label">MISSION CONTROL</p>
        <nav className="nav-list">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
              >
                <Icon size={17} aria-hidden />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>
      <DeviceStatusCard status={status} />
    </aside>
  )
}

export function AppShell({
  networkMode,
  onNetworkModeChange,
  queueCount,
  deviceStatus,
  teamName,
  offlineDataKb = 0,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {networkMode === 'offline' && (
        <div className="offline-stripe" role="status">
          <WifiOff size={12} aria-hidden />
          <span>Offline mode · local DB active</span>
          <span className="offline-sep" aria-hidden />
          <span className="tabular">Data sent: {formatKb(offlineDataKb)}</span>
        </div>
      )}
      <Header
        networkMode={networkMode}
        onNetworkModeChange={onNetworkModeChange}
        queueCount={queueCount}
        teamName={teamName}
      />
      <div className="app-body">
        <Sidebar status={deviceStatus} />
        <main className="app-main" id="main-content">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  )
}
