import type { NetworkMode } from './types'

let mode: NetworkMode = 'online'
const listeners = new Set<(mode: NetworkMode) => void>()

// TODO(codex): implement
export function getNetworkMode(): NetworkMode { return mode }
// TODO(codex): implement
export function setNetworkMode(next: NetworkMode): void {
  mode = next
  listeners.forEach((listener) => listener(mode))
}
// TODO(codex): implement
export function subscribeNetworkMode(cb: (mode: NetworkMode) => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
// TODO(codex): implement
export async function simFetch(url: string | URL | Request, init?: RequestInit): Promise<Response> {
  if (mode === 'offline') throw new TypeError('Network is offline')
  return fetch(url, init)
}
