import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Assessment } from '../src/lib/types'

const mocks = vi.hoisted(() => ({
  mode: 'online' as 'online' | 'offline' | 'weak',
  items: [] as Assessment[],
  fetch: vi.fn<(...args: unknown[]) => Promise<Response>>(),
  updates: vi.fn(),
  events: [] as unknown[],
}))
vi.mock('../src/lib/networkSim', () => ({
  getNetworkMode: () => mocks.mode,
  simFetch: mocks.fetch,
  subscribeNetworkMode: () => () => undefined,
}))
vi.mock('../src/lib/db', () => ({
  getQueued: async () => mocks.items.filter((item) => item.status === 'queued'),
  updateAssessment: async (id: string, changes: Partial<Assessment>) => {
    mocks.updates(id, changes)
    const item = mocks.items.find((row) => row.id === id)
    if (item) Object.assign(item, changes)
  },
}))
vi.mock('../src/lib/metrics', () => ({ recordFailedWrite: vi.fn(), recordRetry: vi.fn(), recordSyncSuccess: vi.fn() }))

import { startSync, subscribeSync } from '../src/lib/syncEngine'

const makeAssessment = (id: string, priority: Assessment['priority'], createdAt: number): Assessment => ({
  id, seq: createdAt, locationLabel: id, imageDataUrl: '', damageClass: 'moderate', severity: 50,
  confidence: 50, inferenceMs: 10, context: { populationDensity: 'low', infrastructureNearby: 'none', roadAccess: 'clear' },
  priority, priorityReason: 'test', status: 'queued', attempts: 0, createdAt,
})

describe('sync engine', () => {
  beforeEach(() => {
    vi.useRealTimers()
    mocks.mode = 'online'; mocks.items = []; mocks.updates.mockClear(); mocks.fetch.mockReset(); mocks.events = []
  })
  it('drains in Critical, High, Medium, Low order then oldest first', async () => {
    mocks.items = [makeAssessment('low', 'Low', 1), makeAssessment('medium', 'Medium', 2), makeAssessment('high-new', 'High', 4), makeAssessment('critical', 'Critical', 5), makeAssessment('high-old', 'High', 3)]
    mocks.fetch.mockResolvedValue(new Response('{}', { status: 200 }))
    const unsubscribe = subscribeSync((event) => mocks.events.push(event))
    await startSync()
    unsubscribe()
    const order = mocks.events.filter((event) => (event as { type: string }).type === 'item-start').map((event) => (event as { id: string }).id)
    expect(order).toEqual(['critical', 'high-old', 'high-new', 'medium', 'low'])
  })
  it('keeps work queued offline and drains it in priority order after reconnect', async () => {
    mocks.items = [makeAssessment('low', 'Low', 1), makeAssessment('critical', 'Critical', 2), makeAssessment('high', 'High', 3), makeAssessment('medium', 'Medium', 4)]
    mocks.fetch.mockResolvedValue(new Response('{}', { status: 200 }))
    const unsubscribe = subscribeSync((event) => mocks.events.push(event))
    mocks.mode = 'offline'
    await startSync()
    expect(mocks.fetch).not.toHaveBeenCalled()
    expect(mocks.items.every((item) => item.status === 'queued')).toBe(true)
    mocks.mode = 'online'
    await startSync()
    unsubscribe()
    const order = mocks.events.filter((event) => (event as { type: string }).type === 'item-start').map((event) => (event as { id: string }).id)
    console.log(`offline queued 4 items; online drained in order: ${order.join(' > ')}`)
    expect(order).toEqual(['critical', 'high', 'medium', 'low'])
  })
  it('retries with exponential backoff and reuses UUID idempotency key', async () => {
    vi.useFakeTimers()
    mocks.items = [makeAssessment('retry-me', 'Critical', 1)]
    mocks.fetch.mockResolvedValueOnce(new Response('{}', { status: 503 })).mockResolvedValueOnce(new Response('{}', { status: 503 })).mockResolvedValue(new Response('{}', { status: 200 }))
    const unsubscribe = subscribeSync((event) => mocks.events.push(event))
    const promise = startSync()
    await vi.advanceTimersByTimeAsync(1000)
    await vi.advanceTimersByTimeAsync(2000)
    await promise
    unsubscribe()
    expect(mocks.fetch).toHaveBeenCalledTimes(3)
    const headers = mocks.fetch.mock.calls.map((call) => (call[1] as RequestInit).headers as Record<string, string>)
    expect(headers.map((header) => header['Idempotency-Key'])).toEqual(['retry-me', 'retry-me', 'retry-me'])
    expect(mocks.items[0].status).toBe('synced')
    expect(mocks.items[0].attempts).toBe(2)
    expect(mocks.events).toContainEqual({ type: 'item-retry', id: 'retry-me', attempt: 1, delayMs: 1000 })
    expect(mocks.events).toContainEqual({ type: 'item-retry', id: 'retry-me', attempt: 2, delayMs: 2000 })
  })
})
