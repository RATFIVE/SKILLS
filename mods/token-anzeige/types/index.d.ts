export type Snapshot = {
  contextTokens: number
  window: number
  percent: number
  usd: number | null
  hasUnknownPrice: boolean
}

export type Totals = {
  input: number
  cacheRead: number
  cacheWrite: number
  output: number
  requests: number
}

declare module 'claude-code' {
  interface PluginState {
    'token-anzeige': {
      snapshot: Shaped<Snapshot | null>
      totals: Shaped<Totals>
      history: Shaped<number[]>
      turnStartUsd: number | null
      isHidden: boolean
    }
  }
}
