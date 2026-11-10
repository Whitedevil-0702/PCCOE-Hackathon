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
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json(res, 400, { ok: false, error: 'Expected assessment object' })
    const assessment = body as Record<string, unknown>
    const validLocation = typeof assessment.locationLabel === 'string' && assessment.locationLabel.trim().length > 0
    const validCoordinates = (assessment.lat === undefined || (typeof assessment.lat === 'number' && Number.isFinite(assessment.lat) && assessment.lat >= -90 && assessment.lat <= 90))
      && (assessment.lng === undefined || (typeof assessment.lng === 'number' && Number.isFinite(assessment.lng) && assessment.lng >= -180 && assessment.lng <= 180))
    if (typeof assessment.id !== 'string' || !assessment.id.trim() || !Number.isInteger(assessment.seq) || (assessment.seq as number) < 1 || !validLocation || !validCoordinates) {
      return json(res, 400, { ok: false, error: 'Expected id, positive integer seq, locationLabel, and valid optional coordinates' })
    }
    await saveAssessment(assessment as { id: string; [key: string]: unknown })
    return json(res, 200, { ok: true, id: assessment.id })
  } catch {
    return json(res, 500, { ok: false, error: 'Unable to save assessment' })
  }
}
