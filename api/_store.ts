import { Redis } from '@upstash/redis'

export interface StoredAssessment {
  id: string
  [key: string]: unknown
}

const hasUpstash = Boolean(
  (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  || (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
)
const redis = hasUpstash ? Redis.fromEnv() : undefined
const assessmentPrefix = 'resqedge:assessment:'
const assessmentIndex = 'resqedge:assessments'
const memory = new Map<string, StoredAssessment>()

// TODO(codex): use durable storage in production; this adapter is ready for Upstash.
export async function saveAssessment(a: StoredAssessment): Promise<void> {
  if (redis) {
    await redis.set(`${assessmentPrefix}${a.id}`, a)
    await redis.zadd(assessmentIndex, { score: Date.now(), member: a.id })
  } else {
    memory.set(a.id, a)
  }
}

// TODO(codex): implement pagination if the dataset grows beyond the prototype.
export async function listAssessments(): Promise<StoredAssessment[]> {
  if (!redis) return Array.from(memory.values())
  const ids = await redis.zrange<string[]>(assessmentIndex, 0, -1)
  const rows = await Promise.all(ids.map((id) => redis.get<StoredAssessment>(`${assessmentPrefix}${id}`)))
  return rows.filter((row): row is StoredAssessment => row !== null)
}

// TODO(codex): implement bounded deletion for large datasets.
export async function clearAll(): Promise<void> {
  if (!redis) { memory.clear(); return }
  const ids = await redis.zrange<string[]>(assessmentIndex, 0, -1)
  if (ids.length) await redis.del(...ids.map((id) => `${assessmentPrefix}${id}`))
  await redis.del(assessmentIndex)
}
