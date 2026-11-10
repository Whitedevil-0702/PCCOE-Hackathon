# ResQEdge

## Project summary
ResQEdge is an offline-first AI post-disaster damage assessment and response triage prototype. It must work with the network OFF after the first load.

## Ownership rules
- Codex owns `src/lib/*`, `api/*`, and tests.
- opencode owns `src/pages/*`, `src/components/*`, and styles.
- Never edit files outside your owned directories without being asked.

## Product contract
- Routes: `/` landing, `/field` field app, `/dashboard` command dashboard.
- Field app: upload an image or pick one from `/public/samples`; on-device Transformers.js zero-shot CLIP labels are intact, minor, moderate, severe, destroyed. Return damage class, severity 0–100, confidence %, and inference ms. Use a rule-based fallback if the model fails.
- Context inputs (population density, nearby infrastructure, road access) feed triage to produce priority Critical|High|Medium|Low and a short reason. Outputs are decision-support, NOT structural safety judgments.
- Save assessments to Dexie as status `queued` with a UUID.
- Header network simulator modes: Online / Offline / Weak (3s delay, 40% failure). All sync fetches go through `simFetch`.
- Sync engine drains queue by priority (Critical>High>Medium>Low), uses exponential backoff and UUID idempotency, and emits live progress events.
- Demo Mode is a scripted one-click flow with captions.
- Metrics panel shows session-measured values only (average inference ms, queued count, average queue wait, sync success rate, retries). Never display accuracy claims.
- Dashboard shows counts per priority, a table sorted by priority then time, and a Leaflet map with colored markers. It polls `/api/assessments` every 3 seconds.
- Design: background `#222428`, surface `#3a3c40`, text `#F0D5BE`, accent `#8B4A2B`; priority colors Critical red, High orange, Medium amber, Low green (include text labels too). Fonts must be bundled locally, not loaded from a CDN.
- Commit small and often; push after each milestone.

## UI BUILD SPEC (overrides earlier Design and Routes sections)

### Look (matches approved mockup)
Dark navy console. bg #0B1020, panel #121A2B, panel-2 #182238, border #1F2A44,
text #E8ECF4, muted #8A97B2, accent orange #FF7A1A. Font: Inter Variable (bundled, @fontsource-variable/inter).
Priority colors: Critical #EF4444 (row tinted dark red), High #F97316, Medium #EAB308, Low #3B82F6.
Damage-class "intact" uses green #22C55E. Always show a text label with any color. Radius 12-16px, tabular-nums for metrics.

### Routes
`/` Landing (no shell). Inside AppShell (header + sidebar): `/dashboard` (main console), `/field`, `/database`,
`/queue`, `/models`, `/map`, `/central`, `/settings`.
`/dashboard` layout: header pills (Connectivity dropdown, Sync Queue count, Team ME BYTE); sidebar nav + Device Status card;
title row + thin MetricsStrip; row of 3 panels: FieldCapturePanel | SyncQueuePanel | TriagePanel (OfflineMap + recommendations + 3 stats);
bottom row: SyncProgressChart | SeverityTriageChart. `/central` = cloud view polling the API.

### Contract additions (Codex implements in src/lib/types.ts; opencode only consumes)
Assessment gains: seq:number (display id "#RE-<seq>"), locationLabel:string.
New types: AssessStep='idle'|'preprocess'|'inference'|'triage'|'saved'; ModelState='idle'|'loading'|'ready'|'fallback'|'error';
Recommendation{id;title;detail;priority:Priority}; SyncPoint{t:number;synced:number;pending:number};
AssessmentDraft{imageDataUrl;result:InferenceResult;context:ContextInput;lat?;lng?;locationLabel:string}.
Metrics gains bytesSent:number and failedWrites:number.

### Hooks (src/hooks/index.ts) are the ONLY bridge between lib and UI
- useNetworkMode(): { mode:NetworkMode; setMode(m:NetworkMode):void; effectiveOnline:boolean; bytesSent:number }
- useAssessments(): { items:Assessment[]; loading:boolean }   // local Dexie, live, newest first
- useQueue(): { queued:Assessment[]; syncing:Assessment[] }   // queued sorted Critical>High>Medium>Low then createdAt
- useSyncProgress(): { isSyncing:boolean; done:number; total:number; history:SyncPoint[]; events:SyncEvent[] }
- useMetrics(): Metrics
- useModelStatus(): { state:ModelState; progress:number; cachedForOffline:boolean; init():Promise<void> }
- useAssess(): { step:AssessStep; running:boolean; run(file:Blob|string):Promise<InferenceResult>;
                 save(draft:AssessmentDraft):Promise<Assessment> }
- useRecommendations(): Recommendation[]                       // derived from local assessments
- useCentral(): { items:Assessment[]; lastSyncedAt?:number; error?:string; reset():Promise<void> }   // plain fetch, polls 3s
- useDemo(): { running:boolean; caption:string; step:number; total:number; start():void; stop():void }
- useLocalAdmin(): { seedDemo(n?:number):Promise<void>; clearLocal():Promise<void> }
Pure helpers exported from src/lib: computePriority(severity, ctx), makeThumbnail(blob).

### Ownership and merge rules
Codex owns src/lib, src/hooks, api, tests, package.json, vite/vercel config. opencode owns src/pages, src/components,
src/App.tsx, src/main.tsx, src/index.css. Never edit the other's files. opencode requests contract changes in docs/ui-requests.md.
No new dependencies. Hand-rolled SVG charts. Commit after every milestone with clear messages.

### Honesty rules
No hardcoded stats anywhere; every number comes from hooks. No accuracy claims. No fake detection boxes.
Footer note on results: "Decision-support, not a structural safety judgment."
