import type { VercelRequest, VercelResponse } from '@vercel/node'
import { saveAssessment } from './_store.js'

function json(res: VercelResponse, status: number, body: unknown) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  return res.status(status).json(body)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return json(res, 204, {})
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' })
  try {
    const body: unknown = req.body
    if (!body || typeof body !== 'object' || Array.isArray(body) || typeof (body as { id?: unknown }).id !== 'string' || !(body as { id: string }).id.trim()) {
      return json(res, 400, { ok: false, error: 'Expected assessment object with a non-empty id' })
    }
    const assessment = body as { id: string; [key: string]: unknown }
    await saveAssessment(assessment)
    return json(res, 200, { ok: true, id: assessment.id })
  } catch {
    return json(res, 500, { ok: false, error: 'Unable to save assessment' })
  }
}
