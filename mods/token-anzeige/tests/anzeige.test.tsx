import { expect, test } from 'claude-code/testing'

const USAGE = {
  value: {
    startedAt: 0,
    context: { tokens: 124_000, window: 200_000, percent: 62 },
    rateLimits: [
      { kind: 'seven_day', percentUsed: 41.5, resetsAt: '2030-01-04T14:00:00Z' },
      { kind: 'five_hour', percentUsed: 23, resetsAt: '2030-01-01T02:00:00Z' },
    ],
    cost: { usd: 1.84 },
  },
}

const BAND = {
  plugin: 'token-anzeige',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 120,
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
} as const

const PANE = {
  plugin: 'token-anzeige',
  component: 'Pane',
  requestId: 'verbrauch',
  props: {
    title: 'Verbrauch',
    isFocused: false,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 30 },
    view: {},
  },
} as const

test('Zeile und Panel zeichnen auf allen Oberflächen', async ($, on) => {
  on('command.register', () => ({ value: { command: 'verbrauch' } }))
  on('session.usage', () => USAGE)
  on('clock.now', () => ({ value: Date.parse('2030-01-01T00:00:00Z') }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  for (const surface of ['terminal', 'desktop', 'vscode', 'mobile'] as const) {
    const band = await $.ui.mount({ ...BAND, surface })
    expect((await band.find({ type: 'Text', text: /62 %/ }))?.text).toContain('62 %')
    expect((await band.find({ type: 'Text', text: /\$1,84/ }))?.text).toContain('$1,84')
    expect(await band.find({ type: 'Text', text: /^23 %$/ })).toBeDefined()
    expect(await band.find({ type: 'Text', text: /^41,5 %$/ })).toBeDefined()
    await band.unmount()

    const pane = await $.ui.mount({ ...PANE, surface })
    expect(await pane.find({ type: 'Text', text: /KONTEXTFENSTER/ })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: /76\.000 frei/ })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: /NUTZUNGSLIMITS/ })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: /Wochenlimit/ })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: /Aktuelles Limit/ })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: /Reset in 2 Std. 0 Min./ })).toBeDefined()
    await pane.unmount()
  }
})
