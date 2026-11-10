import {
  CheckCircle2,
  Cpu,
  Database,
  HardDrive,
  Info,
  Radio,
  ShieldCheck,
  Signal,
  Wifi,
  WifiOff,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { NetworkMode } from '../lib/types'
import { PageHeader, Panel } from '../components'
import { fixtureDeviceStatus, fixtureOfflineDataKb } from '../components/_fixtures'
import { formatKb } from '../components/format'
import { useShellOutlet } from './shellContext'

const NETWORK_OPTIONS: { mode: NetworkMode; label: string; description: string; icon: LucideIcon }[] = [
  {
    mode: 'online',
    label: 'Online',
    description: 'Requests go directly to the cloud with live sync enabled.',
    icon: Wifi,
  },
  {
    mode: 'weak',
    label: 'Weak network',
    description: 'Three-second delays with a 40% simulated request failure rate.',
    icon: Signal,
  },
  {
    mode: 'offline',
    label: 'Offline',
    description: 'No requests leave the device. Everything stays in the local queue.',
    icon: WifiOff,
  },
]

export default function Settings() {
  const { networkMode, setNetworkMode } = useShellOutlet()

  return (
    <div className="page settings-page">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        subtitle="Simulate connectivity conditions and review the local-first runtime configuration."
      />

      <div className="settings-grid">
        <Panel
          title="Network simulation"
          icon={Radio}
          subtitle="Applied immediately to every sync request"
          actions={<span className={`model-state-badge is-${networkMode}`}>{networkMode}</span>}
        >
          <div className="network-options" role="radiogroup" aria-label="Network simulation mode">
            {NETWORK_OPTIONS.map((option) => {
              const Icon = option.icon
              const active = option.mode === networkMode
              return (
                <button
                  key={option.mode}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`network-option ${active ? 'is-active' : ''}`.trim()}
                  onClick={() => setNetworkMode(option.mode)}
                >
                  <span className="network-option-icon" aria-hidden>
                    <Icon size={17} />
                  </span>
                  <span className="network-option-copy">
                    <span className="network-option-top">
                      <strong>{option.label}</strong>
                      {active && (
                        <span className="network-active">
                          <CheckCircle2 size={12} aria-hidden />
                          Active
                        </span>
                      )}
                    </span>
                    <span className="network-option-desc">{option.description}</span>
                  </span>
                </button>
              )
            })}
          </div>
          <p className="panel-note">
            Connectivity is simulated in the app. No real network conditions are changed.
          </p>
        </Panel>

        <Panel
          title="Offline readiness"
          icon={ShieldCheck}
          subtitle="On-device capabilities"
          actions={<span className="mini-badge">Local-first</span>}
        >
          <ul className="settings-status-list">
            <li>
              <Cpu size={15} aria-hidden />
              <span>Model cache</span>
              <strong className={fixtureDeviceStatus.modelReady ? 'is-good' : 'is-warn'}>
                {fixtureDeviceStatus.modelReady ? 'Offline ready' : 'Not cached'}
              </strong>
            </li>
            <li>
              <Database size={15} aria-hidden />
              <span>Local records</span>
              <strong className="tabular">{fixtureDeviceStatus.dbRecords}</strong>
            </li>
            <li>
              <HardDrive size={15} aria-hidden />
              <span>Storage used</span>
              <strong className="tabular">{Math.round(fixtureDeviceStatus.storageUsedMb)} MB</strong>
            </li>
            <li>
              <WifiOff size={15} aria-hidden />
              <span>Data sent while offline</span>
              <strong className="tabular">{formatKb(fixtureOfflineDataKb)}</strong>
            </li>
          </ul>
          <p className="panel-note">
            Assessments remain in the local queue until a sync attempt succeeds.
          </p>
        </Panel>
      </div>

      <Panel title="About this build" icon={Info} subtitle="ResQEdge offline response intelligence">
        <div className="about-grid">
          <div>
            <span className="about-label">Mode</span>
            <span className="about-value">Offline-first prototype</span>
          </div>
          <div>
            <span className="about-label">Inference</span>
            <span className="about-value">On-device Transformers.js</span>
          </div>
          <div>
            <span className="about-label">Storage</span>
            <span className="about-value">Local Dexie database</span>
          </div>
          <div>
            <span className="about-label">Use</span>
            <span className="about-value">Decision support only</span>
          </div>
        </div>
        <p className="settings-disclaimer">
          ResQEdge does not certify structural safety. Always follow local emergency guidance and
          professional inspection before re-entry.
        </p>
      </Panel>
    </div>
  )
}
