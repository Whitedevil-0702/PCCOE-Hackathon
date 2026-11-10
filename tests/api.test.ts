import { beforeEach, describe, expect, it } from 'vitest'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import sync from '../api/sync'
import assessments from '../api/assessments'

function responseMock() {
  const state: { status?: number; body?: unknown; headers: Record<string, string> } = { headers: {} }
  const res = {
    setHeader: (name: string, value: string) => { state.headers[name] = value; return res },
    status: (code: number) => { state.status = code; return res },
    json: (body: unknown) => { state.body = body; return res },
  } as unknown as VercelResponse
  return { res, state }
}
const base = { id: 'api-id-1', seq: 3, locationLabel: 'North Ward', lat: 27.7, lng: 85.3, severity: 72 }

describe('assessment API', () => {
  beforeEach(async () => { const { res } = responseMock(); await assessments({ method: 'DELETE' } as VercelRequest, res) })
  it('validates and persists sequence, location, and optional coordinates idempotently by id', async () => {
    for (const body of [
      { ...base, seq: 0 }, { ...base, locationLabel: '' }, { ...base, lat: 95 }, { ...base, lng: Number.NaN },
    ]) {
      const { res, state } = responseMock(); await sync({ method: 'POST', body } as VercelRequest, res); expect(state.status).toBe(400)
    }
    const first = responseMock(); await sync({ method: 'POST', body: base } as VercelRequest, first.res); expect(first.state.status).toBe(200)
    const duplicate = responseMock(); await sync({ method: 'POST', body: base } as VercelRequest, duplicate.res); expect(duplicate.state.status).toBe(200)
    const result = responseMock(); await assessments({ method: 'GET' } as VercelRequest, result.res)
    expect(result.state.body).toEqual([base])
  })
  it('serves GET and clears all records with DELETE', async () => {
    const post = responseMock(); await sync({ method: 'POST', body: base } as VercelRequest, post.res)
    const get = responseMock(); await assessments({ method: 'GET' } as VercelRequest, get.res); expect(get.state.body).toEqual([base])
    const del = responseMock(); await assessments({ method: 'DELETE' } as VercelRequest, del.res); expect(del.state.status).toBe(200)
    const empty = responseMock(); await assessments({ method: 'GET' } as VercelRequest, empty.res); expect(empty.state.body).toEqual([])
  })
})
