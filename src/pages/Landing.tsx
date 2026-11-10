import {
  ArrowRight,
  Camera,
  CheckCircle2,
  CloudOff,
  Cpu,
  MapPin,
  Radio,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  WifiOff,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PriorityChip, StatusLabel } from '../components'
import {
  fixtureFieldResult,
  fixtureImage,
  fixtureModelStatus,
  fixtureQueue,
} from '../components/_fixtures'
import { damageHeadline, damageLabel, formatCoord } from '../components/format'

export default function Landing() {
  const queuePreview = fixtureQueue.filter((row) => row.status !== 'synced').slice(0, 2)

  return (
    <div className="landing">
      <nav className="landing-nav" aria-label="Landing navigation">
        <Link to="/" className="brand" aria-label="ResQEdge home">
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
        </Link>
        <div className="landing-nav-links">
          <a href="#capabilities">Capabilities</a>
          <Link to="/field">Field app</Link>
          <Link className="btn btn-primary btn-sm" to="/dashboard">
            Open console
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </nav>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow">
              <span className="live-dot" aria-hidden />
              Offline-first disaster response
            </p>
            <h1 className="landing-title">
              Damage assessment that keeps working when the network <em>doesn&apos;t.</em>
            </h1>
            <p className="landing-lede">
              ResQEdge turns a phone into a local damage triage station. Capture a photo, classify it
              on-device, and queue the assessment for sync when connectivity returns.
            </p>
            <div className="landing-cta">
              <Link className="btn btn-primary btn-lg" to="/dashboard">
                Open command console
                <ArrowRight size={16} aria-hidden />
              </Link>
              <Link className="btn btn-secondary btn-lg" to="/field">
                <Camera size={16} aria-hidden />
                Start field capture
              </Link>
            </div>
            <div className="landing-points">
              <span>
                <Cpu size={14} aria-hidden />
                On-device inference
              </span>
              <span>
                <CloudOff size={14} aria-hidden />
                Queues without a network
              </span>
              <span>
                <ShieldCheck size={14} aria-hidden />
                Decision support only
              </span>
            </div>
          </div>

          <div className="landing-visual" aria-label="Illustrative field console preview">
            <div className="landing-window">
              <div className="window-bar">
                <span className="window-dots" aria-hidden>
                  <span />
                  <span />
                  <span />
                </span>
                <span className="window-title">ResQEdge / field console</span>
                <span className="window-live">
                  <span className="live-dot" aria-hidden />
                  Local
                </span>
              </div>
              <div className="window-body">
                <div className="landing-sample">
                  <div className="landing-sample-image">
                    <img src={fixtureImage} alt="Sample damaged structure" />
                    <span className="landing-scan-line" aria-hidden />
                    <span className="landing-sample-label">Illustrative sample</span>
                  </div>
                  <div className="landing-sample-copy">
                    <span className="assessment-kicker">On-device assessment</span>
                    <strong>{damageHeadline(fixtureFieldResult.damageClass)}</strong>
                    <span className="landing-severity">
                      <b className="tabular">{fixtureFieldResult.severity}</b> / 100 severity
                    </span>
                    <span className="landing-sample-meta">
                      <PriorityChip priority={fixtureFieldResult.priority} size="md" />
                      <span>{fixtureFieldResult.confidence}% confidence</span>
                    </span>
                  </div>
                </div>

                <div className="landing-mini-queue">
                  <div className="landing-mini-head">
                    <span>Local sync queue</span>
                    <span className="mini-badge">{queuePreview.length} pending</span>
                  </div>
                  {queuePreview.map((row) => (
                    <div className="landing-mini-row" key={row.id}>
                      <span className="landing-mini-thumb">
                        <img src={row.imageDataUrl} alt="" />
                      </span>
                      <span className="landing-mini-copy">
                        <strong>{row.locationLabel ?? formatCoord(row.lat, row.lng)}</strong>
                        <span>
                          {damageLabel(row.damageClass)} · {row.severity}/100
                        </span>
                      </span>
                      <PriorityChip priority={row.priority} />
                    </div>
                  ))}
                  <div className="landing-mini-foot">
                    <StatusLabel status="queued" label="Waiting for network" />
                    <span className="landing-mini-chip">
                      <WifiOff size={11} aria-hidden />
                      No request sent
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="landing-float landing-float-model">
              <span className="landing-float-icon" aria-hidden>
                <CheckCircle2 size={16} />
              </span>
              <span>
                <strong>Model cached</strong>
                <small>{fixtureModelStatus.label}</small>
              </span>
            </div>
            <div className="landing-float landing-float-queue">
              <span className="landing-float-icon is-accent" aria-hidden>
                <RefreshCw size={16} />
              </span>
              <span>
                <strong>Priority-first drain</strong>
                <small>Critical → Low when online</small>
              </span>
            </div>
          </div>
        </section>

        <section className="landing-strip" aria-label="Offline capabilities">
          <span>
            <WifiOff size={14} aria-hidden />
            Network off? Keep assessing.
          </span>
          <span className="landing-strip-sep" aria-hidden />
          <span>First load caches the model. After that, capture and triage run locally.</span>
        </section>

        <section className="landing-capabilities" id="capabilities">
          <div className="landing-section-head">
            <p className="landing-eyebrow">Built for the first 72 hours</p>
            <h2>One local loop from photo to priority.</h2>
            <p>
              No dashboards waiting on a server. No silent data loss. Every step is visible, queued,
              and ready to replay when the link comes back.
            </p>
          </div>

          <div className="landing-cards">
            <article className="landing-card">
              <span className="landing-card-icon" aria-hidden>
                <ScanLine size={20} />
              </span>
              <h3>Capture &amp; classify</h3>
              <p>
                Upload or take a photo. Zero-shot CLIP labels visible damage as intact, minor,
                moderate, severe or destroyed.
              </p>
              <span className="landing-card-tag">On-device</span>
            </article>
            <article className="landing-card">
              <span className="landing-card-icon" aria-hidden>
                <MapPin size={20} />
              </span>
              <h3>Triage with context</h3>
              <p>
                Population density, nearby infrastructure and road access turn severity into a
                Critical, High, Medium or Low priority.
              </p>
              <span className="landing-card-tag">Decision support</span>
            </article>
            <article className="landing-card">
              <span className="landing-card-icon" aria-hidden>
                <RefreshCw size={20} />
              </span>
              <h3>Queue &amp; sync</h3>
              <p>
                Assessments persist in a local Dexie queue. Sync drains by priority with exponential
                backoff and UUID idempotency.
              </p>
              <span className="landing-card-tag">Offline-first</span>
            </article>
          </div>
        </section>

        <section className="landing-banner">
          <div>
            <p className="landing-eyebrow">
              <Sparkles size={12} aria-hidden />
              Guided demo
            </p>
            <h2>See the offline loop end to end.</h2>
            <p>Walk through capture, triage, local save and priority sync in one scripted flow.</p>
          </div>
          <Link className="btn btn-primary btn-lg" to="/dashboard?demo=1">
            <Radio size={16} aria-hidden />
            Run guided demo
          </Link>
        </section>
      </main>

      <footer className="landing-footer">
        <span>
          ResQEdge prototype · Decision-support, not a structural safety judgment.
        </span>
        <span className="landing-footer-links">
          <Link to="/field">Field</Link>
          <Link to="/dashboard">Console</Link>
          <Link to="/central">Central</Link>
        </span>
      </footer>
    </div>
  )
}
