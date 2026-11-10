import type { ContextInput, Priority } from './types'

// TODO(codex): implement
export function computePriority(_severity: number, _ctx: ContextInput): { priority: Priority; reason: string } {
  return { priority: 'Medium', reason: 'Triage stub: context rules are not implemented.' }
}
