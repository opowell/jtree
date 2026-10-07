import { reactive } from 'vue'
import { io } from 'socket.io-client'

/*
 * What the oTree admin knows about the server, kept current by its socket (the admin socket of
 * server/source/core/SocketServer.js, and the messages of core/Msgs.js).
 */

export interface SessionConfig {
  id: string
  name: string
  displayName: string
  doc: string
  config: Record<string, unknown>
}

export interface MonitorRow {
  code: string
  label: string
  app: string
  round: number | null
  page: string
  status: string
  secondsOnPage: number | null
  payoff: number
  payment: number
}

export interface Conversion {
  appPath: string
  outPath?: string
  level?: string
  report?: { part: string, status: 'converted' | 'todo', note: string, line: number | null }[]
  error?: string
}

export const state = reactive({
  connected: false,
  configs: [] as SessionConfig[],
  sessions: [] as { id: string, numParticipants?: number, appSequence?: string[], started?: boolean }[],
  rooms: [] as { id: string, displayName: string, labels: string[], allowNewPIds: boolean, sessionId?: string }[],
  /** The session open in this admin: what the server sends for it (participants, apps, exports, ...). */
  session: null as any,
  monitor: [] as MonitorRow[],
  /** The open session's admin reports (its oTree apps' admin_report.html), by app and round. */
  reports: [] as { app: string, round: number, html: string }[],
  /** The catalogue's oTree apps (folders with an __init__.py or models.py). */
  apps: [] as { appPath: string, name: string, title: string, description: string }[],
  /** Conversions to jtree apps asked for here, by the oTree app's path: pending (null) or done. */
  conversions: {} as Record<string, Conversion | null>,
})

const params = new URLSearchParams(location.search)

/** Where jtree is served, its route included (e.g. http://host:3000/jtree). */
export const serverUrl = location.origin + location.pathname.replace(/\/admin(\/.*)?$/, '')
const serverPath = new URL(serverUrl).pathname.replace(/\/$/, '')

export const socket = io({
  path: serverPath + '/socket.io',
  query: { id: params.get('id') ?? '', type: 'ADMIN', sessionId: '', roomId: 'null' },
})

/** Sends one of the messages of server/source/core/Msgs.js. */
export function emit(name: string, data?: unknown): void {
  socket.emit(name, data)
}

export function refresh() {
  socket.emit('refreshAdmin', { sockId: socket.id, userId: params.get('id') ?? '' })
}

export function openSession(id: string) {
  emit('openSession', id)
  emit('otreeMonitor', id)
}

socket.on('connect', () => {
  state.connected = true
  refresh()
})
socket.on('disconnect', () => { state.connected = false })
socket.on('connect_error', (err: Error) => {
  if (err.message === 'jtree: admin login required') {
    location.href = `${serverUrl}/admin/login?next=${encodeURIComponent(location.pathname + location.search + location.hash)}`
  }
})

socket.on('refreshAdmin', (ag: any) => {
  state.configs = Object.values(ag.apps ?? {})
    .filter((a: any) => a.isQueue && a.otreeConfig)
    .map((a: any) => ({ id: a.id, name: a.otreeConfig.name, displayName: a.title, doc: a.description ?? '', config: a.otreeConfig }))
  state.apps = Object.values(ag.apps ?? {})
    .filter((a: any) => !a.isQueue && /[\\/](__init__|models)\.py$/.test(a.appPath ?? ''))
    .map((a: any) => ({
      appPath: a.appPath,
      name: a.appPath.split(/[\\/]/).slice(-2, -1)[0],
      title: a.title ?? '',
      description: a.description ?? '',
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
  state.sessions = (ag.sessions ?? []).slice().reverse()
  state.rooms = ag.rooms ?? []
})
socket.on('addSession', () => refresh())
socket.on('deleteSession', () => refresh())
socket.on('roomOpenSession', () => refresh())
socket.on('openSession', (session: any) => { state.session = session })
socket.on('otreeReports', (d: { sessionId: string, reports: { app: string, round: number, html: string }[] }) => {
  if (state.session?.id === d.sessionId) state.reports = d.reports
})
socket.on('otreeConverted', (d: Conversion) => { state.conversions[d.appPath] = d })

/** Converts an oTree app to a jtree app, beside it (see Msgs#otreeConvertApp). */
export function convertApp(appPath: string) {
  state.conversions[appPath] = null
  emit('otreeConvertApp', { appPath })
}

socket.on('otreeMonitor', (d: { sessionId: string, rows: MonitorRow[] }) => {
  if (state.session?.id === d.sessionId) state.monitor = d.rows
})

/** A participant's page in a session. */
export function participantUrl(sessionId: string, code: string): string {
  return `${serverUrl}/session/${encodeURIComponent(sessionId)}/${encodeURIComponent(code)}`
}

/** Where to download a session's data in a format (see server/source/exporters). */
export function downloadUrl(sessionId: string, format: string): string {
  return `${serverUrl}/session-download/${encodeURIComponent(sessionId)}/${encodeURIComponent(format)}`
}
