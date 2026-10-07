import { reactive } from 'vue'
import { io } from 'socket.io-client'
import CircularJSON from 'circular-json'
import type { AdminRefresh, AppMeta, LogEntry, Participant, PlayerState, ServerSettings, SessionFull, SessionShell, RoomShell } from './types'

/**
 * Everything the admin UI knows about the server, kept current by the socket.
 *
 * `version` goes up on every change. Views that hand a snapshot of this state
 * to something that does not track Vue reactivity (a data source) read it to
 * know when to ask again.
 */
export const state = reactive({
  connected: false,
  apps: {} as Record<string, AppMeta>,
  sessions: [] as SessionShell[],
  rooms: [] as RoomShell[],
  settings: {} as ServerSettings,
  jtreeLocalPath: '',
  /** The session this admin has open, with its participants and apps. */
  session: null as SessionFull | null,
  log: [] as LogEntry[],
  version: 0,
})

const LOG_LIMIT = 500
let logCounter = 0

export function addLog(event: string, text: string) {
  state.log.unshift({ id: `log-${++logCounter}`, time: new Date().toISOString(), event, text })
  if (state.log.length > LOG_LIMIT) state.log.length = LOG_LIMIT
  state.version++
}

function changed() {
  state.version++
}

/* ------------------------------------------------------------- connection */

const params = new URLSearchParams(location.search)

/**
 * Where jtree is served, route included (e.g. http://host:3000/jtree): this
 * page's address up to /admin.
 */
export const serverUrl = location.origin + location.pathname.replace(/\/admin(\/.*)?$/, '')

/** jtree's route, e.g. '/jtree' ('' when it is served at the root). */
const serverPath = new URL(serverUrl).pathname.replace(/\/$/, '')

// The server tells admins from participants by `type`, and lets an admin socket
// in when this page's login cookie (or, with no admin password set, this
// computer) allows it. `roomId` must be the string 'null' or the connection is
// treated as a room client.
export const socket = io({
  path: serverPath + '/socket.io',
  query: {
    id: params.get('id') ?? '',
    type: 'ADMIN',
    sessionId: '',
    roomId: 'null',
  },
})

/** Sends one of the messages in server/source/core/Msgs.js. */
export function emit(name: string, data?: unknown): Promise<boolean> {
  addLog('sent', `${name}${data === undefined ? '' : ` ${summarize(data)}`}`)
  return new Promise((resolve) => socket.emit(name, data, (ok: boolean) => resolve(ok !== false)))
}

function summarize(data: unknown): string {
  const text = typeof data === 'string' ? data : JSON.stringify(data)
  return text.length > 120 ? `${text.slice(0, 117)}…` : text
}

export function refreshAdmin() {
  socket.emit('refreshAdmin', { sockId: socket.id, userId: params.get('id') ?? '' })
}

/**
 * Asks for the open session again. Several of the server's changes — pausing,
 * a client connecting — are not announced to admins as a session change, so
 * the open session is re-read after anything that might have touched it.
 * Debounced, because a burst of player updates is one change to the reader.
 */
let refetchTimer: ReturnType<typeof setTimeout> | null = null
export function refetchSession(delay = 250) {
  if (!state.session) return
  const id = state.session.id
  if (refetchTimer) clearTimeout(refetchTimer)
  refetchTimer = setTimeout(() => {
    refetchTimer = null
    socket.emit('openSession', id)
    refreshAdmin()
  }, delay)
}

socket.on('connect', () => {
  state.connected = true
  addLog('connect', 'Connected to server')
  refreshAdmin()
  const last = safeStorage('get', 'jtree-admin2-session')
  if (last) socket.emit('openSession', last)
})

// The login has run out (e.g. jtree restarted): log in again. The server
// refuses such a socket for good, so it does not keep retrying.
socket.on('connect_error', (err) => {
  if (err.message === 'jtree: admin login required') {
    const root = new URL(serverUrl)
    location.href = `${root.origin}${root.pathname.replace(/\/$/, '')}/admin/login?next=${encodeURIComponent(location.pathname + location.search)}`
  }
})

socket.on('disconnect', () => {
  state.connected = false
  addLog('disconnect', 'Disconnected from server')
})

/* --------------------------------------------------------- server messages */

socket.on('refreshAdmin', (ag: AdminRefresh) => {
  state.apps = ag.apps ?? {}
  state.sessions = ag.sessions ?? []
  state.rooms = ag.rooms ?? []
  state.settings = ag.settings ?? {}
  state.jtreeLocalPath = ag.jtreeLocalPath ?? ''
  if (state.session && !state.sessions.some((s) => s.id === state.session!.id)) {
    state.session = null
  }
  changed()
})

socket.on('roomOpenSession', (d: { roomId: string, sessionId: string }) => {
  const room = state.rooms.find((r) => r.id === d.roomId)
  if (room) room.sessionId = d.sessionId
  addLog('roomOpenSession', `Session ${d.sessionId} opened in room ${d.roomId}`)
})

socket.on('openSession', (session: SessionFull) => {
  const isNew = state.session?.id !== session.id
  state.session = session
  safeStorage('set', 'jtree-admin2-session', session.id)
  upsertSession(session)
  if (isNew) addLog('openSession', `Opened session ${session.id}`)
  else changed()
})

socket.on('addSession', (session: SessionShell) => {
  upsertSession(session)
  addLog('addSession', `Session ${session.id} created`)
})

socket.on('deleteSession', (id: string) => {
  state.sessions = state.sessions.filter((s) => s.id !== id)
  if (state.session?.id === id) {
    state.session = null
    safeStorage('remove', 'jtree-admin2-session')
  }
  addLog('deleteSession', `Session ${id} deleted`)
})

socket.on('setSessionId', () => refetchSession(0))

socket.on('createApp', () => refreshAdmin())
socket.on('deleteApp', (id: string) => {
  delete state.apps[id]
  changed()
})
// Queues are apps; the server still announces them under their own names.
socket.on('createQueue', () => refreshAdmin())
socket.on('queueAddApp', () => refreshAdmin())

/* Messages about the open session. Each carries the session id it is about. */

function forOpenSession(sessionId: string | undefined): SessionFull | null {
  return state.session && state.session.id === sessionId ? state.session : null
}

socket.on('addParticipant', (participant: Participant & { session: { id: string } }) => {
  const session = forOpenSession(participant.session?.id)
  if (!session) return
  const { session: _ignored, ...rest } = participant
  session.participants[participant.id] = { ...rest, player: rest.player ?? null }
  upsertSession(session)
})

socket.on('sessionDeleteParticipant', (md: { sId: string, pId: string }) => {
  const session = forOpenSession(md.sId)
  if (!session) return
  delete session.participants[md.pId]
  upsertSession(session)
})

socket.on('sessionAddApp', (md: { sId: string }) => {
  if (forOpenSession(md.sId)) refetchSession(0)
  else refreshAdmin()
})

socket.on('sessionDeleteApp', (md: { sId: string, i: number }) => {
  const session = forOpenSession(md.sId)
  if (!session) return
  session.apps.splice(md.i, 1)
  upsertSession(session)
})

for (const [event, field] of [
  ['setAllowNewParts', 'allowNewParts'],
  ['setAllowAdminPlay', 'allowAdminClientsToPlay'],
  ['setCaseSensitiveLabels', 'caseSensitiveLabels'],
] as const) {
  socket.on(event, (md: { sId: string, value: boolean }) => {
    const session = forOpenSession(md.sId)
    if (session) session[field] = md.value
    const shell = state.sessions.find((s) => s.id === md.sId)
    if (shell) shell[field] = md.value
    changed()
  })
}

socket.on('dataUpdate', (changes: Array<{ field: string, value: unknown }>) => {
  if (!state.session) return
  for (const change of changes) {
    if (change.field === 'started') state.session.started = Boolean(change.value)
  }
  refetchSession()
})

socket.on('playerUpdate', (raw: string | object) => {
  let player: PlayerState & { participant?: Partial<Participant>, sessionId?: string }
  try {
    player = typeof raw === 'string' ? CircularJSON.parse(raw) : (raw as typeof player)
  } catch {
    return
  }
  const session = forOpenSession(player.sessionId)
  if (!session) return
  const participant = session.participants[player.participant?.id ?? player.id]
  if (!participant) return
  const { participant: info, ...rest } = player
  if (info) {
    participant.appIndex = info.appIndex ?? participant.appIndex
    participant.periodIndex = info.periodIndex ?? participant.periodIndex
    participant.numClients = info.numClients ?? participant.numClients
    participant.numPoints = info.numPoints ?? participant.numPoints
  }
  participant.player = rest
  changed()
})

for (const event of ['addClient', 'removeClient', 'participantSetPlayer', 'participantSetAppIndex', 'participantSetPeriodIndex']) {
  socket.on(event, () => refetchSession())
}

function upsertSession(session: SessionShell) {
  const index = state.sessions.findIndex((s) => s.id === session.id)
  const shell: SessionShell = {
    id: session.id,
    name: session.name,
    started: session.started,
    isRunning: session.isRunning,
    timeStarted: session.timeStarted,
    allowNewParts: session.allowNewParts,
    allowAdminClientsToPlay: session.allowAdminClientsToPlay,
    caseSensitiveLabels: session.caseSensitiveLabels,
    numParticipants: 'participants' in session
      ? Object.keys((session as SessionFull).participants).length
      : session.numParticipants,
    numApps: 'apps' in session ? (session as SessionFull).apps.length : session.numApps,
    appSequence: 'apps' in session ? (session as SessionFull).apps.map((a) => a.id) : session.appSequence,
  }
  if (index === -1) state.sessions = [...state.sessions, shell]
  else state.sessions[index] = shell
  changed()
}

/* ------------------------------------------------------------------ utils */

function safeStorage(op: 'get' | 'set' | 'remove', key: string, value?: string): string | null {
  try {
    if (op === 'get') return localStorage.getItem(key)
    if (op === 'set') localStorage.setItem(key, value ?? '')
    else localStorage.removeItem(key)
  } catch {
    // Storage can be unavailable (private windows); the UI works without it.
  }
  return null
}

/** The address participants are given: the server's LAN address when known. */
export function participantBase(): string {
  const ip = state.settings.server?.ip
  const port = state.settings.server?.port
  if (!ip || !port) return serverUrl
  return `${location.protocol}//${ip}:${port}${serverPath}`
}
