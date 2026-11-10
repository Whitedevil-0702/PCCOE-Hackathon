import type { NetworkMode } from './types'
import { recordBytesSent } from './metrics'

let mode: NetworkMode = 'online'
const listeners = new Set<(mode: NetworkMode) => void>()

export function getNetworkMode(): NetworkMode { return mode }
export function setNetworkMode(next: NetworkMode): void {
  if (mode === next) return
  mode = next
  listeners.forEach((listener) => listener(mode))
}
export function subscribeNetworkMode(cb: (mode: NetworkMode) => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
export async function simFetch(url: string | URL | Request, init?: RequestInit): Promise<Response> {
  if (mode === 'offline') throw new TypeError('Network is offline')
  const selectedMode = mode
  if (selectedMode === 'weak') {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    if (Math.random() < 0.4) throw new TypeError('Simulated weak connection failure')
  }
  const request = url instanceof Request ? url.clone() : undefined
  const body = init?.body ?? request?.body
  let bytes = 0
  if (typeof body === 'string') bytes = new TextEncoder().encode(body).byteLength
  else if (body instanceof Blob) bytes = body.size
  else if (body instanceof ArrayBuffer) bytes = body.byteLength
  else if (ArrayBuffer.isView(body)) bytes = body.byteLength
  else if (body instanceof URLSearchParams) bytes = new TextEncoder().encode(body.toString()).byteLength
  try {
    const response = await fetch(url, init)
    if (bytes) {
      recordBytesSent(bytes)
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('resq:bytes-sent', { detail: bytes }))
    }
    return response
  } catch (error) {
    throw error
  }
}
