import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Snapshot, Totals } from '../types'

const PANE = 'verbrauch'
const EMPTY: Totals = { input: 0, cacheRead: 0, cacheWrite: 0, output: 0, requests: 0 }

const snapshot = atom({ plugin: 'token-anzeige', key: 'snapshot' } as const, null, { shape: 'snapshot-1' })
const totals = atom({ plugin: 'token-anzeige', key: 'totals' } as const, EMPTY, { shape: 'totals-1' })
const history = atom({ plugin: 'token-anzeige', key: 'history' } as const, [], { shape: 'history-1' })
const turnStartUsd = atom({ plugin: 'token-anzeige', key: 'turnStartUsd' } as const, null)
const isHidden = atom({ plugin: 'token-anzeige', key: 'isHidden' } as const, false)

// Farben
const ACCENT = '#a78bfa'
const MONEY = '#fbbf24'
const TRACK = '#3f3f46'
const KIND = { cacheRead: '#60a5fa', cacheWrite: '#c084fc', input: '#34d399', output: '#f472b6' }

// Zahlen
const de = new Intl.NumberFormat('de-DE')
const num = (n: number) => de.format(Math.round(n))
const short = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1).replace('.', ',')} Mio.`
    : n >= 1000
      ? `${Math.round(n / 1000)}k`
      : String(Math.round(n))
const usd = (n: number) => `$${n.toFixed(2).replace('.', ',')}`

// Grün → Gelb → Rot, abhängig von der Stelle im Balken
function heat(t: number) {
  const stops = [
    [0x4a, 0xde, 0x80],
    [0xfa, 0xcc, 0x15],
    [0xf8, 0x71, 0x71],
  ] as const
  const x = Math.min(1, Math.max(0, t)) * 2
  const i = Math.min(1, Math.floor(x))
  const f = x - i
  const a = stops[i]!
  const b = stops[i + 1]!
  const c = a.map((v, k) => Math.round(v + (b[k]! - v) * f))
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('')
}

// Balken als Läufe gleicher Farbe (wenige Text-Elemente)
type Run = { text: string; color: string }
function gradientBar(percent: number, width: number): Run[] {
  const filled = Math.round((Math.min(100, Math.max(0, percent)) / 100) * width)
  const steps = 6
  const runs: Run[] = []
  for (let i = 0; i < width; i++) {
    const isOn = i < filled
    const color = isOn ? heat(Math.floor((i / Math.max(1, width - 1)) * steps) / steps) : TRACK
    const ch = isOn ? '━' : '─'
    const last = runs[runs.length - 1]
    if (last && last.color === color) last.text += ch
    else runs.push({ text: ch, color })
  }
  return runs
}

const SPARK = '▁▂▃▄▅▆▇█'
function sparkline(values: number[], width: number) {
  return values
    .slice(-width)
    .map(v => SPARK[Math.min(7, Math.floor((Math.min(100, v) / 100) * 8))])
    .join('')
}

async function readUsage($: EngineInterface): Promise<Snapshot> {
  const u = await $.session.usage()
  const tokens = u.context.tokens ?? 0
  return {
    contextTokens: tokens,
    window: u.context.window,
    percent: u.context.percent ?? (u.context.window ? Math.round((tokens / u.context.window) * 100) : 0),
    usd: u.cost ? u.cost.usd : null,
    hasUnknownPrice: u.cost?.hasUnknownPrice === true,
  }
}

async function refresh($: EngineInterface) {
  const s = await readUsage($)
  await update($, snapshot, () => s)
  return s
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'verbrauch',
      description: 'Panel mit Kontextfenster, Tokens und Kosten öffnen (/verbrauch aus | an blendet die Zeile aus/ein)',
    })
    const s = await refresh($)
    await update($, turnStartUsd, v => v ?? s.usd)
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    try {
      const s = await refresh($)
      await update($, turnStartUsd, () => s.usd)
    } catch {
      // Die Anzeige darf das Abschicken nie aufhalten.
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('turn.step', async function* ($, e, next) {
    const result = yield* next(e)
    const u = result.usage
    if (u) {
      await update($, totals, t => ({
        input: t.input + u.input_tokens,
        cacheRead: t.cacheRead + u.cache_read_input_tokens,
        cacheWrite: t.cacheWrite + u.cache_creation_input_tokens,
        output: t.output + u.output_tokens,
        requests: t.requests + 1,
      }))
    }
    const s = await refresh($)
    if (!e.agentId) await update($, history, list => [...list, s.percent].slice(-120))
    return result
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    await refresh($)
    return result
  })

  on('command.run', { command: 'verbrauch' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'aus') {
      await update($, isHidden, () => true)
      return { text: 'Verbrauchszeile ausgeblendet. „/verbrauch an“ blendet sie wieder ein.' }
    }
    if (arg === 'an') {
      await update($, isHidden, () => false)
      return { text: 'Verbrauchszeile eingeblendet.' }
    }
    await refresh($)
    await $.ui.open({ id: PANE, title: 'Verbrauch' })
    return { text: 'Verbrauchs-Panel geöffnet.' }
  })

  // ── Zeile über dem Prompt ──────────────────────────────────────────
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await read($, isHidden))) return next(e)
    const s = await read($, snapshot)
    if (!s) return next(e)
    const t = await read($, totals)
    const start = await read($, turnStartUsd)
    const { Box, Text } = $.ui.resolve(e)

    const cols = e.props.bodyColumns
    const showTokens = cols >= 84
    const showBar = cols >= 52
    const delta = s.usd !== null && start !== null ? s.usd - start : 0
    const sep = <Text color={TRACK}> │ </Text>

    return (
      <Box>
        <Text color={ACCENT}>◆ </Text>
        <Text dimColor>Kontext </Text>
        {showBar &&
          gradientBar(s.percent, 14).map(r => <Text color={r.color}>{r.text}</Text>)}
        <Text color={heat(s.percent / 100)} bold>
          {' '}
          {s.percent} %
        </Text>
        <Text dimColor>
          {' '}
          {short(s.contextTokens)}/{short(s.window)}
        </Text>
        {showTokens && sep}
        {showTokens && <Text color={KIND.cacheRead}>⇡ </Text>}
        {showTokens && <Text>{short(t.input + t.cacheRead + t.cacheWrite)}</Text>}
        {showTokens && <Text color={KIND.output}> ⇣ </Text>}
        {showTokens && <Text>{short(t.output)}</Text>}
        {s.usd !== null && sep}
        {s.usd !== null && (
          <Text color={MONEY} bold>
            ≈ {usd(s.usd)}
          </Text>
        )}
        {s.usd !== null && delta >= 0.005 && <Text dimColor> +{usd(delta)}</Text>}
      </Box>
    )
  })

  // ── Panel ──────────────────────────────────────────────────────────
  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const s = await read($, snapshot)
    const t = await read($, totals)
    const hist = await read($, history)
    const start = await read($, turnStartUsd)
    const width = Math.max(20, Math.min(60, e.props.bodyColumns - 4))

    if (!s) return <Text dimColor>Noch keine Daten – nach der nächsten Anfrage geht es los.</Text>

    const heading = (label: string, right?: string) => (
      <Box justifyContent="space-between" width={width}>
        <Text color={ACCENT} bold>
          {label}
        </Text>
        {right ? <Text dimColor>{right}</Text> : <Text> </Text>}
      </Box>
    )

    const rows = [
      { label: 'Cache gelesen', value: t.cacheRead, color: KIND.cacheRead },
      { label: 'Cache geschrieben', value: t.cacheWrite, color: KIND.cacheWrite },
      { label: 'Eingabe', value: t.input, color: KIND.input },
      { label: 'Ausgabe', value: t.output, color: KIND.output },
    ]
    const sum = rows.reduce((n, r) => n + r.value, 0)
    const max = Math.max(1, ...rows.map(r => r.value))
    const labelW = 18
    const numW = 11
    const barW = Math.max(4, width - labelW - numW - 2)
    const delta = s.usd !== null && start !== null ? s.usd - start : null

    return (
      <Box flexDirection="column" paddingX={1}>
        {heading('KONTEXTFENSTER')}
        <Box>
          {gradientBar(s.percent, width - 6).map(r => (
            <Text color={r.color}>{r.text}</Text>
          ))}
          <Text color={heat(s.percent / 100)} bold>
            {' '}
            {String(s.percent).padStart(3)} %
          </Text>
        </Box>
        <Text>
          <Text bold>{num(s.contextTokens)}</Text>
          <Text dimColor> von {num(s.window)} Tokens · </Text>
          <Text color={heat(0)}>{num(Math.max(0, s.window - s.contextTokens))} frei</Text>
        </Text>
        {hist.length > 1 && (
          <Text>
            <Text dimColor>Verlauf </Text>
            <Text color={ACCENT}>{sparkline(hist, width - 8)}</Text>
          </Text>
        )}
        <Text> </Text>

        {heading('TOKENS DIESER SITZUNG', `${t.requests} Anfragen`)}
        {rows.map(r => {
          const len = r.value > 0 ? Math.max(1, Math.round((r.value / max) * barW)) : 0
          return (
            <Box>
              <Box width={labelW}>
                <Text dimColor>{r.label}</Text>
              </Box>
              <Text color={r.color}>{'█'.repeat(len)}</Text>
              <Text color={TRACK}>{'·'.repeat(barW - len)}</Text>
              <Box width={numW + 2} justifyContent="flex-end">
                <Text>{num(r.value)}</Text>
              </Box>
            </Box>
          )
        })}
        <Box width={width} justifyContent="space-between">
          <Text bold>Gesamt</Text>
          <Text bold>{num(sum)}</Text>
        </Box>
        <Text> </Text>

        {heading('KOSTEN', 'Schätzung')}
        {s.usd === null ? (
          <Text dimColor>Keine Kostenangabe verfügbar.</Text>
        ) : (
          <Box>
            <Text color={MONEY} bold>
              {usd(s.usd)}
            </Text>
            {delta !== null && <Text dimColor>   letzter Turn +{usd(Math.max(0, delta))}</Text>}
          </Box>
        )}
        <Text dimColor>
          {s.hasUnknownPrice ? 'Enthält ein Modell ohne bekannten Preis. ' : ''}Listenpreise, keine Rechnung.
        </Text>
      </Box>
    )
  })
}
