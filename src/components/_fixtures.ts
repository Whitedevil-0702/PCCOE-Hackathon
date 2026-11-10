import type {
  Assessment,
  ContextInput,
  DamageClass,
  InferenceResult,
  Metrics,
  Priority,
} from '../lib/types'

export interface FieldAssessmentResult extends InferenceResult {
  priority: Priority
  priorityReason: string
}

export interface QueueRow extends Assessment {
  seq?: number
  locationLabel?: string
  retryDelayMs?: number
}

export interface MapMarker {
  id: string
  lat: number
  lng: number
  priority: Priority
  label: string
  damageClass?: DamageClass
  severity?: number
}

export interface TriageRecommendation {
  id: string
  priority: Priority
  title: string
  detail: string
}

export interface ChartPoint {
  t: number
  synced: number
  pending: number
}

export interface SeverityCounts {
  Critical: number
  High: number
  Medium: number
  Low: number
}

export type ModelState = 'ready' | 'loading' | 'fallback'

export interface ModelStatus {
  state: ModelState
  progress?: number
  label?: string
}

export type PipelineStep = 'idle' | 'preprocess' | 'inference' | 'triage' | 'saved'

export interface DeviceStatus {
  modelReady: boolean
  storageUsedMb: number
  dbRecords: number
  lastSyncAt?: number
}

export interface TriageStats {
  totalScans: number
  criticalTargets: number
  synced: number
}

const BASE_TIME = Date.UTC(2026, 10, 10, 6, 30, 0)

function sceneImage(caption: string, tint: string, accent: string): string {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">',
    '<defs>',
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#141E36"/><stop offset="1" stop-color="${tint}"/></linearGradient>`,
    '<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#151D30"/><stop offset="1" stop-color="#090E1A"/></linearGradient>',
    '</defs>',
    '<rect width="1280" height="800" fill="url(#sky)"/>',
    `<circle cx="1020" cy="150" r="78" fill="${accent}" opacity=".2"/>`,
    '<path d="M0 545 L150 505 L250 532 L410 472 L520 508 L660 443 L790 502 L930 456 L1080 507 L1210 473 L1280 502 L1280 800 L0 800Z" fill="url(#ground)"/>',
    '<g fill="#0B1220" opacity=".92">',
    '<rect x="118" y="432" width="162" height="220" rx="4"/>',
    '<rect x="322" y="382" width="130" height="270" rx="4"/>',
    '<path d="M500 432 L582 398 L664 446 L652 652 L512 652Z"/>',
    '<rect x="722" y="412" width="152" height="240" rx="4"/>',
    '<path d="M934 472 L1014 432 L1094 482 L1084 652 L944 652Z"/>',
    '</g>',
    '<g stroke="#263450" stroke-width="2" opacity=".75">',
    '<path d="M146 490 H254 M146 540 H254 M146 590 H254"/>',
    '<path d="M348 442 H428 M348 496 H428 M348 550 H428"/>',
    '<path d="M748 470 H850 M748 528 H850 M748 586 H850"/>',
    '</g>',
    '<path d="M618 652 L708 610 L800 660 L772 702 L658 702Z" fill="#1A2640"/>',
    '<g opacity=".85" stroke-linecap="round" fill="none">',
    '<path d="M636 600 q62 -32 126 0" stroke="#FF7A1A" stroke-width="3"/>',
    '<path d="M654 618 q46 -22 92 0" stroke="#FF7A1A" stroke-width="2" opacity=".55"/>',
    '</g>',
    '<rect x="48" y="664" width="520" height="92" rx="12" fill="#0B1220" opacity=".72"/>',
    '<text x="70" y="702" fill="#E8ECF4" font-family="Inter, sans-serif" font-size="26" font-weight="700" letter-spacing="5">FIELD CAPTURE</text>',
    `<text x="70" y="732" fill="#8A97B2" font-family="Inter, sans-serif" font-size="16" letter-spacing="3">${caption}</text>`,
    '<g stroke="#8A97B2" stroke-width="2" opacity=".5"><path d="M40 40 H80 M40 40 V80"/><path d="M1240 40 H1200 M1240 40 V80"/><path d="M40 760 H80 M40 760 V720"/><path d="M1240 760 H1200 M1240 760 V720"/></g>',
    '</svg>',
  ].join('')
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const fixtureImage = sceneImage('SECTOR 7 · RIVERSIDE CLINIC', '#2E1B1B', '#FF7A1A')
export const fixtureImageB = sceneImage('SECTOR 4 · MARKET ROAD', '#1A2338', '#3B82F6')

export const fixtureContext: ContextInput = {
  populationDensity: 'high',
  infrastructureNearby: 'critical',
  roadAccess: 'blocked',
}

export const fixtureFieldResult: FieldAssessmentResult = {
  damageClass: 'destroyed',
  severity: 91,
  confidence: 91,
  inferenceMs: 1840,
  source: 'model',
  priority: 'Critical',
  priorityReason: 'Destroyed structure beside a critical facility; road access is blocked and population density is high.',
}

export const fixtureFieldResultFallback: FieldAssessmentResult = {
  damageClass: 'severe',
  severity: 78,
  confidence: 64,
  inferenceMs: 9,
  source: 'fallback',
  priority: 'High',
  priorityReason: 'Severe visual damage with partial road access; nearby infrastructure raises urgency.',
}

const context = fixtureContext

export const fixtureQueue: QueueRow[] = [
  {
    id: '9f1e6a1c-1b2d-4a3e-8f41-0d7c2b4e9a01',
    seq: 108,
    imageDataUrl: fixtureImage,
    locationLabel: 'Riverside Clinic · Sector 7',
    damageClass: 'destroyed',
    severity: 91,
    confidence: 91,
    inferenceMs: 1840,
    context,
    priority: 'Critical',
    priorityReason: 'Destroyed structure beside a critical facility; road access is blocked.',
    lat: 18.5234,
    lng: 73.8567,
    status: 'queued',
    attempts: 0,
    createdAt: BASE_TIME - 120000,
  },
  {
    id: '2c7b8d44-5e6f-4a10-9b22-7c1f3a8d6e02',
    seq: 107,
    imageDataUrl: fixtureImageB,
    locationLabel: 'Market Road · Sector 4',
    damageClass: 'severe',
    severity: 84,
    confidence: 87,
    inferenceMs: 1620,
    context,
    priority: 'Critical',
    priorityReason: 'Severe damage near a high-density market with limited road access.',
    lat: 18.5298,
    lng: 73.8442,
    status: 'syncing',
    attempts: 0,
    createdAt: BASE_TIME - 180000,
  },
  {
    id: '6a4c2e90-3d8b-4f57-a1c3-9e5b7d2f4a03',
    seq: 106,
    imageDataUrl: fixtureImageB,
    locationLabel: 'Harbor Link · Sector 2',
    damageClass: 'severe',
    severity: 76,
    confidence: 82,
    inferenceMs: 2010,
    context: { ...context, roadAccess: 'partial' },
    priority: 'High',
    priorityReason: 'Severe damage with partial road access and critical infrastructure nearby.',
    lat: 18.5141,
    lng: 73.8619,
    status: 'queued',
    attempts: 2,
    retryDelayMs: 2000,
    createdAt: BASE_TIME - 240000,
  },
  {
    id: '1d9f3b72-8a4c-4e61-b7d0-3f2a6c9e5b04',
    seq: 105,
    imageDataUrl: fixtureImage,
    locationLabel: 'North Ridge · Sector 9',
    damageClass: 'moderate',
    severity: 58,
    confidence: 74,
    inferenceMs: 1575,
    context: { ...context, populationDensity: 'medium', infrastructureNearby: 'some' },
    priority: 'High',
    priorityReason: 'Moderate damage combined with blocked access and some nearby infrastructure.',
    lat: 18.5372,
    lng: 73.8731,
    status: 'failed',
    attempts: 3,
    createdAt: BASE_TIME - 360000,
  },
  {
    id: '8b3e5c17-2f9a-4d84-86e1-5a4c7b2f9d05',
    seq: 104,
    imageDataUrl: fixtureImageB,
    locationLabel: 'Old Depot · Sector 3',
    damageClass: 'moderate',
    severity: 46,
    confidence: 71,
    inferenceMs: 1430,
    context: { ...context, populationDensity: 'low', infrastructureNearby: 'some', roadAccess: 'clear' },
    priority: 'Medium',
    priorityReason: 'Moderate visual damage; clear roads and low population density reduce urgency.',
    lat: 18.5087,
    lng: 73.8405,
    status: 'queued',
    attempts: 0,
    createdAt: BASE_TIME - 480000,
  },
  {
    id: '4e7a9d28-6c1b-4f35-b9a2-8d3e5c1f7b06',
    seq: 103,
    imageDataUrl: fixtureImage,
    locationLabel: 'East Yard · Sector 5',
    damageClass: 'minor',
    severity: 22,
    confidence: 79,
    inferenceMs: 1390,
    context: { ...context, populationDensity: 'low', infrastructureNearby: 'none', roadAccess: 'clear' },
    priority: 'Low',
    priorityReason: 'Minor damage with clear access and no critical infrastructure nearby.',
    lat: 18.5199,
    lng: 73.8308,
    status: 'synced',
    attempts: 0,
    createdAt: BASE_TIME - 600000,
    syncedAt: BASE_TIME - 60000,
  },
]

export const fixtureQueueReordered: QueueRow[] = [...fixtureQueue].sort((a, b) => b.createdAt - a.createdAt)

export const fixtureMarkers: MapMarker[] = [
  {
    id: 'zone-a',
    lat: 18.5234,
    lng: 73.8567,
    priority: 'Critical',
    label: 'Zone A: Severe (Rescue Needed)',
    damageClass: 'destroyed',
    severity: 91,
  },
  {
    id: 'zone-b',
    lat: 18.5298,
    lng: 73.8442,
    priority: 'High',
    label: 'Zone B: High (Medical Supplies)',
    damageClass: 'severe',
    severity: 84,
  },
  {
    id: 'zone-c',
    lat: 18.5141,
    lng: 73.8619,
    priority: 'Critical',
    label: 'Zone C: Critical (Route Blocked)',
    damageClass: 'destroyed',
    severity: 88,
  },
  {
    id: 'zone-d',
    lat: 18.5372,
    lng: 73.8731,
    priority: 'Medium',
    label: 'Zone D: Moderate (Inspect)',
    damageClass: 'moderate',
    severity: 58,
  },
  {
    id: 'zone-e',
    lat: 18.5087,
    lng: 73.8405,
    priority: 'Low',
    label: 'Zone E: Minor (Monitor)',
    damageClass: 'minor',
    severity: 22,
  },
]

export const fixtureRecommendations: TriageRecommendation[] = [
  {
    id: 'rec-1',
    priority: 'Critical',
    title: 'Dispatch rescue to Zone A',
    detail: 'Destroyed structure beside the riverside clinic. Send two search-and-rescue teams with structural support.',
  },
  {
    id: 'rec-2',
    priority: 'High',
    title: 'Open a supply route to Zone B',
    detail: 'Market road is partially blocked. Coordinate debris clearing before the next medical supply drop.',
  },
  {
    id: 'rec-3',
    priority: 'Medium',
    title: 'Schedule inspection in Zone D',
    detail: 'Moderate visual damage only. Queue a daylight structural inspection; no immediate evacuation required.',
  },
]

export const fixtureTriageStats: TriageStats = {
  totalScans: 42,
  criticalTargets: 6,
  synced: 31,
}

export const fixtureSyncSeries: ChartPoint[] = [
  { t: BASE_TIME - 360000, synced: 0, pending: 12 },
  { t: BASE_TIME - 330000, synced: 2, pending: 12 },
  { t: BASE_TIME - 300000, synced: 5, pending: 11 },
  { t: BASE_TIME - 270000, synced: 7, pending: 10 },
  { t: BASE_TIME - 240000, synced: 9, pending: 10 },
  { t: BASE_TIME - 210000, synced: 12, pending: 9 },
  { t: BASE_TIME - 180000, synced: 16, pending: 8 },
  { t: BASE_TIME - 150000, synced: 18, pending: 8 },
  { t: BASE_TIME - 120000, synced: 21, pending: 7 },
  { t: BASE_TIME - 90000, synced: 24, pending: 6 },
  { t: BASE_TIME - 60000, synced: 26, pending: 5 },
  { t: BASE_TIME - 30000, synced: 29, pending: 4 },
  { t: BASE_TIME, synced: 31, pending: 3 },
]

export const fixtureSeverityCounts: SeverityCounts = {
  Critical: 6,
  High: 11,
  Medium: 15,
  Low: 10,
}

export const fixtureTopSeverity = 91
export const fixtureTopLabel = 'Zone A · Destroyed structure'

export const fixtureMetrics: Metrics = {
  avgInferenceMs: 1840,
  totalAssessed: 42,
  queuedCount: 8,
  avgQueueWaitMs: 72000,
  syncSuccessRate: 0.92,
  retryCount: 5,
}

export const fixtureDeviceStatus: DeviceStatus = {
  modelReady: true,
  storageUsedMb: 214,
  dbRecords: 128,
  lastSyncAt: BASE_TIME - 42000,
}

export const fixtureModelStatus: ModelStatus = {
  state: 'ready',
  label: 'Model ready for offline use',
}

export const fixtureDemoCaption =
  'Field teams capture damage photos even with no network. Results are saved to the local queue.'

export const fixtureTeamName = 'ME BYTE'
export const fixtureOfflineDataKb = 142.6
