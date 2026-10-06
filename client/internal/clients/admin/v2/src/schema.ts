import { computed } from 'vue'
import type { ColumnDef, DomainSchema, EntitySchema, ShellRow } from 'header-content-layout'
import { state } from './server/connection'
import type { AppMeta, Participant, SessionFull, SessionShell } from './server/types'

/*
 * jtree's records as appfr rows. Every row carries `name`, `ref`, `state` and
 * `updated` so the mixed result set on the home screen can read any of them
 * through one set of columns; each entity's own columns then add what only it
 * has.
 */

const SESSION_STATES = ['not started', 'running', 'paused']
const APP_KINDS = ['app', 'queue']
const PLAYER_STATES = ['not started', 'ready', 'playing', 'done', 'finished']

export function sessionState(session: SessionShell): string {
  if (!session.started) return 'not started'
  return session.isRunning ? 'running' : 'paused'
}

/** Session ids are their creation time: `20261004-184404-206`. */
export function sessionDate(id: string): string {
  const m = /^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/.exec(id)
  if (!m) return ''
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]).toISOString()
}

/** An app's path relative to the jtree folder, which is how people know it. */
export function relativePath(path: string): string {
  const root = state.jtreeLocalPath
  if (root && path.startsWith(root)) return path.slice(root.length).replace(/^[\\/]/, '')
  return path
}

/** The folder under `apps/` an app sits in — the grouping people use. */
export function folderOf(path: string): string {
  const parts = relativePath(path).split(/[\\/]/)
  const appsAt = parts.indexOf('apps')
  const start = appsAt === -1 ? 0 : appsAt + 1
  return parts.length - start > 1 ? parts[start] : '(top level)'
}

export function appLabel(appId: string): string {
  const app = state.apps[appId]
  return app?.title || app?.shortId || relativePath(appId)
}

/* ------------------------------------------------------------------ rows */

function sessionRow(session: SessionShell): ShellRow {
  const apps = session.appSequence ?? []
  return {
    id: session.id,
    entityKey: 'sessions',
    entityLabel: 'Sessions',
    fields: {
      name: session.name || session.id,
      ref: apps.length ? apps.map(appLabel).join(' → ') : 'no apps',
      state: sessionState(session),
      updated: sessionDate(session.id),
      participants: session.numParticipants ?? 0,
      apps: apps.length,
      open: state.session?.id === session.id,
    },
  }
}

/** A queue is an app made of other apps. */
export function appKind(app: AppMeta): string {
  return app.isQueue ? 'queue' : 'app'
}

function appRow(app: AppMeta): ShellRow {
  return {
    id: app.id,
    entityKey: 'apps',
    entityLabel: 'Apps',
    fields: {
      name: app.title || app.shortId,
      ref: relativePath(app.appPath),
      state: app.hasError ? 'error' : 'ok',
      updated: '',
      kind: appKind(app),
      folder: folderOf(app.appPath),
      periods: typeof app.numPeriods === 'number' ? app.numPeriods : null,
      // A queue's parts are its apps; an app's, its stages.
      stages: app.isQueue ? (app.apps?.length ?? 0) : (app.stages?.length ?? 0),
      errors: Boolean(app.hasError),
    },
  }
}

export function playerState(participant: Participant, session: SessionFull): string {
  if (!session.started || !participant.player) return 'not started'
  return participant.player.status ?? 'ready'
}

/** An opened session gives a player's group as its room id, `…_group_2`. */
function groupNumber(groupId: number | string | undefined): string {
  if (groupId == null) return ''
  return /_group_([^_]+)$/.exec(String(groupId))?.[1] ?? String(groupId)
}

function participantRow(participant: Participant, session: SessionFull): ShellRow {
  const player = participant.player
  const app = session.apps[participant.appIndex - 1]
  const stageIndex = player?.stageIndex
  const stage = player?.stage?.id ?? player?.stageId
    ?? (stageIndex != null ? app?.stages?.[stageIndex]?.id : undefined)
  return {
    id: participant.id,
    entityKey: 'participants',
    entityLabel: 'Participants',
    fields: {
      name: participant.id,
      ref: stage ? `stage ${stage}` : '',
      state: playerState(participant, session),
      updated: '',
      app: app ? (app.title || app.shortId) : '',
      appIndex: participant.appIndex,
      period: participant.periodIndex >= 0 ? participant.periodIndex + 1 : '',
      group: player?.group?.id ?? groupNumber(player?.groupId),
      stage: stage ?? '',
      clients: participant.numClients,
      points: participant.numPoints,
    },
  }
}

export function rowsFor(entityKey: string): ShellRow[] {
  switch (entityKey) {
    case 'sessions':
      return state.sessions.map(sessionRow)
    case 'apps':
      return Object.values(state.apps).map(appRow)
    case 'participants': {
      const session = state.session
      if (!session) return []
      return Object.values(session.participants).map((p) => participantRow(p, session))
    }
    case 'log':
      return state.log.map((entry) => ({
        id: entry.id,
        entityKey: 'log',
        entityLabel: 'Log',
        fields: { name: entry.text, ref: entry.event, state: '', updated: entry.time, event: entry.event },
      }))
    default:
      return []
  }
}

/* --------------------------------------------------------------- columns */

const ordinal: ColumnDef = { key: 'ordinal', kind: 'ordinal', label: '#', width: '44px' }
// The pill colours appfr's five states; jtree's own words for a state read
// better than the nearest of those five, and are coloured in styles.css.
const stateColumn = (label = 'State'): ColumnDef =>
  ({ key: 'state', role: 'state', kind: 'status', label, width: '112px' })

const sessionColumns: ColumnDef[] = [
  ordinal,
  { key: 'name', role: 'identity', label: 'Session', sort: 'name', activate: true, mono: true, width: '190px' },
  { key: 'ref', role: 'reference', label: 'Apps', muted: true },
  { key: 'participants', role: 'metric', kind: 'number', label: 'Participants', sort: 'participants', align: 'right', width: '104px', hideBelow: 620 },
  { key: 'apps', role: 'metric', kind: 'number', label: 'Apps', sort: 'apps', align: 'right', width: '64px', hideBelow: 760 },
  { key: 'updated', role: 'updated', kind: 'date', label: 'Created', sort: 'updated', width: '120px', hideBelow: 480 },
  stateColumn(),
]

const appColumns: ColumnDef[] = [
  ordinal,
  { key: 'name', role: 'identity', label: 'App', sort: 'name', activate: true },
  { key: 'ref', role: 'reference', label: 'File', muted: true, mono: true },
  { key: 'kind', label: 'Kind', width: '72px', hideBelow: 480 },
  { key: 'folder', label: 'Folder', width: '130px', hideBelow: 900 },
  // An app that failed to load reports its periods as "unknown".
  { key: 'periods', role: 'metric', kind: 'number', label: 'Periods', sort: 'periods', align: 'right', width: '84px', hideBelow: 620,
    format: (v) => (typeof v === 'number' ? String(v) : '—') },
  { key: 'stages', role: 'metric', kind: 'number', label: 'Stages / apps', sort: 'stages', align: 'right', width: '104px', hideBelow: 760 },
  stateColumn('Status'),
]

const participantColumns: ColumnDef[] = [
  ordinal,
  { key: 'name', role: 'identity', label: 'Participant', sort: 'name', activate: true, mono: true, width: '120px' },
  { key: 'app', label: 'App', hideBelow: 620 },
  { key: 'period', kind: 'number', label: 'Period', align: 'right', width: '76px', format: String },
  { key: 'group', label: 'Group', align: 'right', width: '72px', hideBelow: 480, format: String },
  { key: 'stage', role: 'reference', label: 'Stage', width: '120px' },
  { key: 'clients', role: 'metric', kind: 'number', label: 'Clients', sort: 'clients', align: 'right', width: '84px' },
  { key: 'points', role: 'metric', kind: 'number', label: 'Points', sort: 'points', align: 'right', width: '80px', hideBelow: 620, format: (v) => String(v ?? '') },
  stateColumn(),
]

const logColumns: ColumnDef[] = [
  ordinal,
  { key: 'updated', role: 'updated', kind: 'date', label: 'Time', sort: 'updated', width: '96px',
    format: (v) => (v ? new Date(String(v)).toLocaleTimeString() : '') },
  { key: 'event', role: 'reference', label: 'Event', mono: true, muted: true, width: '150px' },
  { key: 'name', role: 'identity', label: 'Message' },
]

/* ---------------------------------------------------------------- schema */

function distinct(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function entity(def: Omit<EntitySchema, 'count' | 'tabs' | 'samples'>, count: number): EntitySchema {
  return { ...def, count: count.toLocaleString(), tabs: [], samples: [] }
}

/**
 * Rebuilt whenever the server state changes, so the counts on the home
 * screen's cards and the options in each facet are what is actually there.
 */
export const schema = computed<DomainSchema>(() => {
  void state.version
  const apps = Object.values(state.apps)
  const participants = state.session ? Object.keys(state.session.participants).length : 0
  return {
    key: 'jtree',
    label: 'jtree',
    kicker: 'Experiment admin',
    placeholder: 'beauty OR entity:sessions state:running',
    columns: [
      ordinal,
      { key: 'entityLabel', label: 'Kind', width: '110px', when: 'everything' },
      { key: 'name', role: 'identity', label: 'Name', sort: 'name', activate: true },
      { key: 'ref', role: 'reference', label: 'Detail', muted: true, hideBelow: 620 },
      { key: 'updated', role: 'updated', kind: 'date', label: 'When', sort: 'updated', width: '120px', hideBelow: 760 },
      { key: 'state', role: 'state', kind: 'status', label: 'State', width: '112px' },
    ],
    entities: [
      entity({
        key: 'sessions',
        label: 'Sessions',
        columns: sessionColumns,
        create: 'New session',
        facets: [{ kind: 'chips', key: 'state', label: 'State', options: SESSION_STATES }],
      }, state.sessions.length),
      entity({
        key: 'participants',
        label: 'Participants',
        columns: participantColumns,
        facets: [{ kind: 'chips', key: 'state', label: 'State', options: PLAYER_STATES }],
      }, participants),
      entity({
        key: 'apps',
        label: 'Apps',
        columns: appColumns,
        facets: [
          { kind: 'chips', key: 'kind', label: 'Kind', options: APP_KINDS },
          { kind: 'chips', key: 'folder', label: 'Folder', options: distinct(apps.map((a) => folderOf(a.appPath))) },
          { kind: 'toggle', key: 'errors', label: 'Errors', text: 'Only apps that failed to load' },
        ],
      }, apps.length),
      entity({
        key: 'log',
        label: 'Log',
        columns: logColumns,
        facets: [{ kind: 'chips', key: 'event', label: 'Event', options: distinct(state.log.map((l) => l.event)) }],
      }, state.log.length),
    ],
  }
})
