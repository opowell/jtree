import { state } from './server/connection'
import type { GroupState, PeriodState, PlayerState, SessionApp, SessionFull } from './server/types'
import { clientNumber, clients, treatmentOf } from './clients'
import { fileName } from './treatment/docs'
import { parseTreatment } from './treatment/parse'

/*
 * z-Tree's tables, filled from the open session.
 *
 * The treatment tables are the treatment's own: `globals` has a row per
 * period, `subjects` a row per subject for the period each is in now, as
 * z-Tree's subjects table is rebuilt every period. jtree keeps group data on
 * the group, so `groups` is shown beside them. The session tables run across
 * treatments.
 */

export type Cell = string | number | boolean | null
export interface TableData {
  columns: string[]
  rows: Cell[][]
}

export const TREATMENT_TABLES = ['globals', 'subjects', 'groups', 'contracts', 'summary']
export const SESSION_TABLES = ['treatments', 'clients', 'sessionglobals', 'participations', 'logfile']

// Fields jtree keeps for its own bookkeeping, which are not the experiment's data.
const PLAYER_INTERNAL = new Set([
  'id', 'status', 'stageIndex', 'stageId', 'roomId', 'groupId', 'participantId', 'idInGroup', 'points',
  'stageTimerStart', 'stageTimerDuration', 'stageTimerTimeLeft', 'stageTimerRunning', 'stageClientDuration',
  'outputHide', 'outputHideAuto', 'periodId', 'appIndex', 'session',
])
const GROUP_INTERNAL = new Set([
  'id', 'period', 'players', 'tables', 'stageTimerStart', 'stageTimerDuration', 'stageTimerTimeLeft',
  'stageIndex', 'stageStartedIndex', 'outputHide', 'outputHideAuto', 'allPlayersCreated', 'stageTimer', 'timer',
])
const PERIOD_INTERNAL = new Set(['id', 'app', 'groups', 'outputHide', 'outputHideAuto', 'tables', 'appIndex'])
const SESSION_INTERNAL = new Set(['participants', 'apps', 'clients', 'users', 'outputHide', 'messageQueue', 'jt', 'fileStream'])

function isScalar(value: unknown): value is Cell {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value)
}

function isTimeStamp(key: string): boolean {
  return /^time(Start|End)_/.test(key)
}

/** The experiment's own variables on an object, in the order first seen. */
function variables(objects: Array<Record<string, unknown>>, internal: Set<string>): string[] {
  const out: string[] = []
  for (const object of objects) {
    for (const [key, value] of Object.entries(object)) {
      if (internal.has(key) || isTimeStamp(key) || out.includes(key) || !isScalar(value)) continue
      out.push(key)
    }
  }
  return out
}

function table(columns: string[], records: Array<Record<string, unknown>>): TableData {
  return {
    columns,
    rows: records.map((record) => columns.map((column) => {
      const value = record[column]
      return isScalar(value) ? value : value === undefined ? null : JSON.stringify(value)
    })),
  }
}

const EMPTY: TableData = { columns: [], rows: [] }

export function buildTable(name: string, treatment: number): TableData {
  const session = state.session
  if (!session) return EMPTY
  if (treatment === 0) return sessionTable(name, session)
  const app = session.apps[treatment - 1]
  if (!app) return EMPTY
  switch (name) {
    case 'globals': return globalsTable(app)
    case 'subjects': return subjectsTable(app, session)
    case 'groups': return groupsTable(app)
    case 'contracts': return contractsTable(app)
    case 'summary': return summaryTable(app)
    default: return EMPTY
  }
}

/* -------------------------------------------------------- treatment tables */

function periodsOf(app: SessionApp): PeriodState[] {
  return (app.periods ?? []).filter((p): p is PeriodState => p != null)
}

/** The players of the app, each with the period and group it belongs to. */
function playersOf(app: SessionApp): Array<{ period: PeriodState, group: GroupState, player: PlayerState }> {
  const out: Array<{ period: PeriodState, group: GroupState, player: PlayerState }> = []
  for (const period of periodsOf(app)) {
    for (const group of period.groups ?? []) {
      if (!group) continue
      for (const player of group.players ?? []) {
        if (player) out.push({ period, group, player })
      }
    }
  }
  return out
}

/** Each subject's row for the period it is in now. */
function currentPlayers(app: SessionApp) {
  const latest = new Map<string, ReturnType<typeof playersOf>[number]>()
  for (const entry of playersOf(app)) {
    const id = entry.player.participantId ?? entry.player.id
    const held = latest.get(id)
    if (!held || held.period.id <= entry.period.id) latest.set(id, entry)
  }
  return [...latest.values()].sort((a, b) => Number(clientNumber(a.player.participantId ?? a.player.id)) - Number(clientNumber(b.player.participantId ?? b.player.id)))
}

/** The periods someone is in now: the ones whose groups are worth showing. */
function currentPeriods(app: SessionApp): Set<number> {
  return new Set(currentPlayers(app).map((entry) => entry.period.id))
}

// Settings jtree reads from `app.` assignments, which are not the experiment's values.
const APP_SETTINGS = new Set([
  'numPeriods', 'groupSize', 'activeScreen', 'waitingScreen', 'description', 'title', 'htmlFile',
  'stageWaitToStart', 'stageWaitToEnd', 'waitForAll', 'suggestedNumParticipants', 'matchingType', 'options',
])

const constantsCache = new Map<string, string[]>()

/** The treatment's own constants, `app.pieSize = 100;`: z-Tree keeps these in globals. */
function appConstants(app: SessionApp): Record<string, unknown> {
  const source = state.apps[String(app.id)]?.appjs ?? ''
  let names = constantsCache.get(source)
  if (!names) {
    names = Object.keys(parseTreatment(source, '').appProps).filter((name) => !APP_SETTINGS.has(name))
    constantsCache.set(source, names)
  }
  const out: Record<string, unknown> = {}
  for (const name of names) if (isScalar(app[name])) out[name] = app[name]
  return out
}

function globalsTable(app: SessionApp): TableData {
  const periods = periodsOf(app)
  const constants = appConstants(app)
  const custom = variables(periods as Array<Record<string, unknown>>, PERIOD_INTERNAL)
  return table(
    ['Period', 'NumPeriods', ...Object.keys(constants), ...custom.filter((c) => !(c in constants))],
    periods.map((period) => ({ ...constants, ...period, Period: period.id, NumPeriods: app.numPeriods })),
  )
}

function subjectsTable(app: SessionApp, session: SessionFull): TableData {
  const entries = currentPlayers(app)
  const players = entries.map((e) => e.player as Record<string, unknown>)
  const custom = variables(players, PLAYER_INTERNAL)
  return table(
    ['Period', 'Subject', 'Group', 'Profit', 'TotalProfit', ...custom],
    entries.map(({ period, group, player }) => {
      const pId = player.participantId ?? player.id
      return {
        ...player,
        Period: period.id,
        Subject: clientNumber(pId),
        Group: group.id,
        Profit: player.points ?? 0,
        TotalProfit: session.participants[pId]?.numPoints ?? null,
      }
    }),
  )
}

function groupsTable(app: SessionApp): TableData {
  const current = currentPeriods(app)
  const groups = periodsOf(app)
    .filter((period) => current.has(period.id))
    .flatMap((period) => (period.groups ?? []).filter(Boolean).map((group) => ({ period, group })))
  const custom = variables(groups.map((g) => g.group as Record<string, unknown>), GROUP_INTERNAL)
  return table(
    ['Period', 'Group', 'Members', ...custom],
    groups.map(({ period, group }) => ({ ...group, Period: period.id, Group: group.id, Members: group.players?.length ?? 0 })),
  )
}

function contractsTable(app: SessionApp): TableData {
  const current = currentPeriods(app)
  const records: Array<Record<string, unknown>> = []
  for (const period of periodsOf(app)) {
    if (!current.has(period.id)) continue
    for (const group of period.groups ?? []) {
      if (!group) continue
      const names = Array.isArray(group.tables) ? (group.tables as string[]) : []
      for (const name of names) {
        const rows = group[name]
        if (!Array.isArray(rows)) continue
        for (const row of rows as Array<Record<string, unknown>>) {
          records.push({ ...row, Period: period.id, Group: group.id, Table: name })
        }
      }
    }
  }
  const custom = variables(records, new Set(['Period', 'Group', 'Table']))
  return table(['Period', 'Group', 'Table', ...custom], records)
}

function summaryTable(app: SessionApp): TableData {
  const entries = playersOf(app)
  return table(
    ['Period', 'NumSubjects', 'MeanProfit'],
    periodsOf(app).map((period) => {
      const inPeriod = entries.filter((e) => e.period.id === period.id)
      const total = inPeriod.reduce((sum, e) => sum + Number(e.player.points ?? 0), 0)
      return {
        Period: period.id,
        NumSubjects: inPeriod.length,
        MeanProfit: inPeriod.length ? Math.round((total / inPeriod.length) * 1000) / 1000 : null,
      }
    }),
  )
}

/* ---------------------------------------------------------- session tables */

function sessionTable(name: string, session: SessionFull): TableData {
  switch (name) {
    case 'treatments':
      return table(
        ['Treatment', 'Name', 'File', 'NumPeriods', 'GroupSize', 'Started', 'StopAfterPeriod'],
        session.apps.map((app, index) => ({
          Treatment: index + 1,
          Name: app.title || app.shortId,
          File: fileName(String(app.appPath ?? app.id)),
          NumPeriods: app.numPeriods ?? null,
          GroupSize: app.groupSize ?? null,
          Started: Boolean(app.started),
          StopAfterPeriod: Boolean(app.stopAfterPeriod),
        })),
      )
    case 'clients':
      return table(
        ['ClientNumber', 'ClientName', 'Connected', 'Treatment', 'Period', 'TotalProfit'],
        clients.value.map((line) => ({
          ClientNumber: line.number,
          ClientName: line.id,
          Connected: line.participant.numClients,
          Treatment: line.participant.appIndex ? treatmentOf(line.participant, session) : null,
          Period: line.participant.periodIndex >= 0 ? line.participant.periodIndex + 1 : null,
          TotalProfit: line.participant.numPoints,
        })),
      )
    case 'sessionglobals': {
      const record = session as Record<string, unknown>
      const columns = Object.keys(record).filter((key) => !SESSION_INTERNAL.has(key) && isScalar(record[key]))
      return table(columns, [record])
    }
    case 'participations': {
      const records: Array<Record<string, unknown>> = []
      for (const line of clients.value) {
        const byApp = new Map<number, { profit: number, periods: number }>()
        for (const player of line.participant.players ?? []) {
          const appIndex = Number(player.appIndex ?? 0)
          const held = byApp.get(appIndex) ?? { profit: 0, periods: 0 }
          held.profit += Number(player.points ?? 0)
          held.periods += 1
          byApp.set(appIndex, held)
        }
        for (const [appIndex, held] of [...byApp.entries()].sort((a, b) => a[0] - b[0])) {
          records.push({
            Treatment: appIndex,
            Subject: line.number,
            ClientName: line.id,
            Periods: held.periods,
            Profit: held.profit,
          })
        }
      }
      return table(['Treatment', 'Subject', 'ClientName', 'Periods', 'Profit'], records)
    }
    case 'logfile':
      return table(
        ['Time', 'Event', 'Message'],
        state.log.map((entry) => ({
          Time: new Date(entry.time).toLocaleTimeString(),
          Event: entry.event,
          Message: entry.text,
        })),
      )
    default:
      return EMPTY
  }
}

/** A table as text with tabs between cells, as z-Tree copies and exports tables. */
export function toTsv(data: TableData, rows?: number[], columns?: number[]): string {
  const cols = columns ?? data.columns.map((_, i) => i)
  const lines = [cols.map((c) => data.columns[c]).join('\t')]
  for (const r of rows ?? data.rows.map((_, i) => i)) {
    lines.push(cols.map((c) => formatCell(data.rows[r][c])).join('\t'))
  }
  return lines.join('\n')
}

export function formatCell(value: Cell): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? '1' : '0'
  if (typeof value === 'number' && !Number.isInteger(value)) return String(Math.round(value * 1e6) / 1e6)
  return String(value)
}
