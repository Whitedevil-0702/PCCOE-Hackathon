import { useOutletContext } from 'react-router-dom'
import type { NetworkMode } from '../lib/types'

export interface ShellOutletContext {
  networkMode: NetworkMode
  setNetworkMode: (mode: NetworkMode) => void
}

export function useShellOutlet(): ShellOutletContext {
  return useOutletContext<ShellOutletContext>()
}
