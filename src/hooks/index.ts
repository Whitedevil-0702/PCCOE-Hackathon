import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { liveQuery } from 'dexie'
import { v4 as uuid } from 'uuid'
import {
  computePriority, db, getAll, getMetrics, initModel, isModelCached,
  runDemo, runInference, saveAssessment, seedDemo as seedLocalDemo, setNetworkMode,
  startSync, subscribeMetrics, subscribeNetworkMode, subscribeSync,
} from '../lib'
import { getNetworkMode, simFetch } from '../lib/networkSim'
import type {
  AssessStep, Assessment, AssessmentDraft, Metrics, ModelState,
  NetworkMode, Recommendation, SyncEvent, SyncPoint,
} from '../lib/types'

const priorityRank = { Critical: 0, High: 1, Medium: 2, Low: 3 }
const emptyMetrics: Metrics = { avgInferenceMs: 0, totalAssessed: 0, queuedCount: 0, avgQueueWaitMs: 0, syncSuccessRate: 0, retryCount: 0, bytesSent: 0, failedWrites: 0 }

export function useNetworkMode(): { mode: NetworkMode; setMode(m: NetworkMode): void; effectiveOnline: boolean; bytesSent: number } {
  const mode = useSyncExternalStore((cb) => subscribeNetworkMode(cb), getNetworkMode, getNetworkMode)
  const [bytesSent, setBytesSent] = useState(0)
  useEffect(() => {
    const handler = (event: Event) => setBytesSent((n) => n + ((event as CustomEvent<number>).detail || 0))
    window.addEventListener('resq:bytes-sent', handler)
    return () => window.removeEventListener('resq:bytes-sent', handler)
  }, [])
  return { mode, setMode: setNetworkMode, effectiveOnline: mode !== 'offline', bytesSent }
}

export function useAssessments(): { items: Assessment[]; loading: boolean } {
  const [items, setItems] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    const subscription = liveQuery(() => db.assessments.orderBy('createdAt').reverse().toArray()).subscribe({
      next: (rows) => { if (active) { setItems(rows); setLoading(false) } },
      error: () => { if (active) setLoading(false) },
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [])
  return { items, loading }
}

export function useQueue(): { queued: Assessment[]; syncing: Assessment[] } {
  const { items } = useAssessments()
  const sort = (a: Assessment, b: Assessment) => priorityRank[a.priority] - priorityRank[b.priority] || a.createdAt - b.createdAt
  return { queued: items.filter((x) => x.status === 'queued').sort(sort), syncing: items.filter((x) => x.status === 'syncing').sort(sort) }
}

export function useSyncProgress(): { isSyncing: boolean; done: number; total: number; history: SyncPoint[]; events: SyncEvent[] } {
  const [events, setEvents] = useState<SyncEvent[]>([])
  const [history, setHistory] = useState<SyncPoint[]>([])
  const { queued, syncing } = useQueue()
  useEffect(() => subscribeSync((event) => {
    setEvents((items) => [...items.slice(-99), event])
    if (event.type === 'item-success') setHistory((items) => [...items.slice(-119), { t: Date.now(), synced: 1, pending: Math.max(0, queued.length - 1) }])
  }), [queued.length])
  const done = events.filter((e) => e.type === 'item-success').length
  return { isSyncing: syncing.length > 0, done, total: done + queued.length + syncing.length, history, events }
}

export function useMetrics(): Metrics {
  const [metrics, setMetrics] = useState<Metrics>(emptyMetrics)
  useEffect(() => {
    let active = true
    void getMetrics().then((value) => { if (active) setMetrics(value) })
    const unsubscribe = subscribeMetrics(setMetrics)
    return () => { active = false; unsubscribe() }
  }, [])
  return metrics
}

export function useModelStatus(): { state: ModelState; progress: number; cachedForOffline: boolean; init(): Promise<void> } {
  const [state, setState] = useState<ModelState>('idle')
  const [progress, setProgress] = useState(0)
  const [cachedForOffline, setCached] = useState(false)
  const init = useCallback(async () => {
    setState('loading')
    try {
      await initModel(setProgress)
      setCached(await isModelCached())
      setState('ready')
    } catch { setState('fallback') }
  }, [])
  return { state, progress, cachedForOffline, init }
}

export function useAssess(): { step: AssessStep; running: boolean; run(file: Blob | string): Promise<import('../lib/types').InferenceResult>; save(draft: AssessmentDraft): Promise<Assessment> } {
  const [step, setStep] = useState<AssessStep>('idle')
  const [running, setRunning] = useState(false)
  const run = useCallback(async (file: Blob | string) => {
    setRunning(true); setStep('preprocess')
    try { setStep('inference'); return await runInference(file) }
    finally { setRunning(false); setStep('triage') }
  }, [])
  const save = useCallback(async (draft: AssessmentDraft) => {
    const all = await getAll()
    const { priority, reason } = computePriority(draft.result.severity, draft.context)
    const item: Assessment = {
      id: uuid(), seq: all.reduce((max, x) => Math.max(max, x.seq || 0), 0) + 1,
      locationLabel: draft.locationLabel, imageDataUrl: draft.imageDataUrl, damageClass: draft.result.damageClass,
      severity: draft.result.severity, confidence: draft.result.confidence, inferenceMs: draft.result.inferenceMs,
      context: draft.context, priority, priorityReason: reason, lat: draft.lat, lng: draft.lng,
      status: 'queued', attempts: 0, createdAt: Date.now(),
    }
    try { await saveAssessment(item) } catch (error) { throw error }
    setStep('saved')
    void startSync()
    return item
  }, [])
  return { step, running, run, save }
}

export function useRecommendations(): Recommendation[] {
  const { items } = useAssessments()
  return useMemo(() => items.slice(0, 3).map((item) => ({
    id: item.id, title: `${item.priority} response at ${item.locationLabel}`,
    detail: item.priorityReason, priority: item.priority,
  })), [items])
}

export function useCentral(): { items: Assessment[]; lastSyncedAt?: number; error?: string; reset(): Promise<void> } {
  const [items, setItems] = useState<Assessment[]>([])
  const [lastSyncedAt, setLastSyncedAt] = useState<number>()
  const [error, setError] = useState<string>()
  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/assessments')
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const payload = await response.json() as Assessment[]
      setItems(payload); setLastSyncedAt(Date.now()); setError(undefined)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to load assessments') }
  }, [])
  useEffect(() => { void refresh(); const id = window.setInterval(() => void refresh(), 3000); return () => window.clearInterval(id) }, [refresh])
  const reset = useCallback(async () => { await simFetch('/api/assessments', { method: 'DELETE' }); await refresh() }, [refresh])
  return { items, lastSyncedAt, error, reset }
}

export function useDemo(): { running: boolean; caption: string; step: number; total: number; start(): void; stop(): void } {
  const [running, setRunning] = useState(false)
  const [caption, setCaption] = useState('')
  const [step, setStep] = useState(0)
  const total = 4
  const stop = useCallback(() => setRunning(false), [])
  const start = useCallback(() => {
    if (running) return
    setRunning(true); setStep(0)
    void runDemo({ onCaption: (text) => { setCaption(text); setStep((n) => Math.min(total, n + 1)) } }).finally(() => setRunning(false))
  }, [running])
  return { running, caption, step, total, start, stop }
}

export function useLocalAdmin(): { seedDemo(n?: number): Promise<void>; clearLocal(): Promise<void> } {
  return {
    seedDemo: async (n = 5) => { await seedLocalDemo(n) },
    clearLocal: async () => { await db.assessments.clear() },
  }
}
