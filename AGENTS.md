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
