import type { VercelRequest, VercelResponse } from '@vercel/node'
import { clearAll, listAssessments } from './_store.js'

function json(res: VercelResponse, status: number, body: unknown) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  return res.status(status).json(body)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return json(res, 204, {})
  try {
    if (req.method === 'GET') return json(res, 200, await listAssessments())
    if (req.method === 'DELETE') { await clearAll(); return json(res, 200, { ok: true }) }
    return json(res, 405, { ok: false, error: 'Method not allowed' })
  } catch {
    return json(res, 500, { ok: false, error: 'Unable to process assessments request' })
  }
}
