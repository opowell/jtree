import { reactive } from 'vue'
import { io } from 'socket.io-client'
import CircularJSON from 'circular-json'
import type {
  AdminRefresh,
  AppMeta,
  LogEntry,
  Participant,
  PlayerState,
  QueueShell,
  ServerSettings,
  SessionFull,
  SessionShell,
} from './types'

/**
 * Everything this interface knows about the server, kept current by the socket.
 *
 * z-Tree always has a session running: the one it started with. Here that is
 * the session this browser last had open, or a new one when there is none.
 */
export const state = reactive({
  connected: false,
  /** False until the server has said what is on it, the first time. */
  loaded: false,
  apps: {} as Record<string, AppMeta>,
  queues: [] as QueueShell[],
  sessions: [] as SessionShell[],
  settings: {} as ServerSettings,
  jtreeLocalPath: '',
  session: null as SessionFull | null,
  log: [] as LogEntry[],
})

const LOG_LIMIT = 1000
let logCounter = 0

export function addLog(event: string, text: string) {
  state.log.push({ id: `log-${++logCounter}`, time: new Date().toISOString(), event, text })
  if (state.log.length > LOG_LIMIT) state.log.splice(0, state.log.length - LOG_LIMIT)
}

/* ------------------------------------------------------------- addresses */

/**
 * The route jtree is served under: '' on its own, '/jtree' inside JAS. Read
 * from this page's own address, which is always `<route>/admin/ztree/`.
 */
export const basePath = __JTREE_DEV__
  ? __JTREE_DEV__.base
  : location.pathname.slice(0, Math.max(0, location.pathname.indexOf('/admin/')))

/** Where participant pages and downloads are served from, route included. */
export const serverRoot = (__JTREE_DEV__ ? __JTREE_DEV__.server : location.origin) + basePath

/** The address participants are given: the server's LAN address when known. */
export function participantRoot(): string {
  const ip = state.settings.server?.ip
  const port = state.settings.server?.port
  if (!ip || !port || __JTREE_DEV__) return serverRoot
  return `${location.protocol}//${ip}:${port}${basePath}`
}

/* ------------------------------------------------------------- connection */

const params = new URLSearchParams(location.search)
export const userId = params.get('id') ?? ''

// The server tells admins from participants by `type`, and lets an admin socket
// in when this page's login cookie (or, with no admin password set, this
// computer) allows it. `roomId` must be the string 'null' or the connection is
// treated as a room client.
export const socket = io({
  path: `${basePath}/socket.io`,
  query: {
    id: userId,
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
  return text.length > 160 ? `${text.slice(0, 157)}…` : text
}

export function refreshAdmin() {
  socket.emit('refreshAdmin', { sockId: socket.id, userId })
}

/**
 * Asks for the open session again. Many of the server's changes — a client
 * connecting, a player entering a stage — reach admins only as a nudge, so the
 * session is re-read after anything that might have touched it. Debounced,
 * because a burst of player updates is one change to the reader.
 */
let refetchTimer: ReturnType<typeof setTimeout> | null = null
export function refetchSession(delay = 200) {
  if (!state.session) return
  const id = state.session.id
  if (refetchTimer) clearTimeout(refetchTimer)
  refetchTimer = setTimeout(() => {
    refetchTimer = null
    socket.emit('openSession', id)
  }, delay)
}

const SESSION_KEY = 'jtree-ztree-session'

/** Waiting for the first list of sessions, to know which one to open. */
let choosingSession = true

socket.on('connect', () => {
  state.connected = true
  addLog('connect', 'Connected to server')
  choosingSession = state.session == null
  refreshAdmin()
  if (state.session) socket.emit('openSession', state.session.id)
})

// The login has run out (e.g. jtree restarted): log in again. The server
// refuses such a socket for good, so it does not keep retrying.
socket.on('connect_error', (err) => {
  if (err.message === 'jtree: admin login required') {
    const root = new URL(serverRoot)
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
  state.queues = ag.queues ?? []
  state.sessions = ag.sessions ?? []
  state.settings = ag.settings ?? {}
  state.jtreeLocalPath = ag.jtreeLocalPath ?? ''
  state.loaded = true
  if (state.session && !state.sessions.some((s) => s.id === state.session!.id)) {
    state.session = null
  }
  if (choosingSession) {
    choosingSession = false
    const last = safeStorage('get', SESSION_KEY)
    if (last && state.sessions.some((s) => s.id === last)) socket.emit('openSession', last)
    else void emit('sessionCreate', userId)
  }
})

socket.on('openSession', (session: SessionFull) => {
  const isNew = state.session?.id !== session.id
  state.session = session
  safeStorage('set', SESSION_KEY, session.id)
  upsertSession(session)
  if (isNew) addLog('openSession', `Session ${session.id}`)
})

socket.on('addSession', (session: SessionShell) => {
  upsertSession(session)
  addLog('addSession', `Session ${session.id} created`)
})

socket.on('deleteSession', (id: string) => {
  state.sessions = state.sessions.filter((s) => s.id !== id)
  if (state.session?.id === id) {
    state.session = null
    safeStorage('remove', SESSION_KEY)
  }
  addLog('deleteSession', `Session ${id} deleted`)
})

socket.on('setSessionId', () => refetchSession(0))
socket.on('createApp', () => refreshAdmin())
socket.on('deleteApp', (id: string) => {
  delete state.apps[id]
})

/* Messages about the open session. Each carries the session id it is about. */

function forOpenSession(sessionId: string | undefined): SessionFull | null {
  return state.session && state.session.id === sessionId ? state.session : null
}

socket.on('addParticipant', (participant: Participant & { session: { id: string } }) => {
  if (!forOpenSession(participant.session?.id)) return
  addLog('addParticipant', `Client ${participant.id} connected`)
  refetchSession(0)
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

socket.on('sessionDeleteApp', (md: { sId: string }) => {
  if (forOpenSession(md.sId)) refetchSession(0)
})

for (const [event, field] of [
  ['setAllowNewParts', 'allowNewParts'],
  ['setAllowAdminPlay', 'allowAdminClientsToPlay'],
  ['setCaseSensitiveLabels', 'caseSensitiveLabels'],
] as const) {
  socket.on(event, (md: { sId: string, value: boolean }) => {
    const session = forOpenSession(md.sId)
    if (session) session[field] = md.value
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
  if (!forOpenSession(player.sessionId ?? state.session?.id)) return
  // The update is the player as their own page sees it; the session read
  // after it is the same player as the tables need it.
  refetchSession()
})

for (const event of ['addClient', 'remove-client', 'groupUpdate', 'endStage']) {
  socket.on(event, () => refetchSession())
}

// Some changes — a participant entering the next app, say — are told only to
// that participant's own page. A slow re-read catches whatever was not
// announced.
setInterval(() => {
  if (state.connected && state.session && !document.hidden) refetchSession(0)
}, 3000)

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
    numParticipants: 'participants' in session && session.participants && !Array.isArray(session.participants)
      ? Object.keys((session as SessionFull).participants).length
      : session.numParticipants,
    numApps: 'apps' in session ? (session as SessionFull).apps.length : session.numApps,
    appSequence: 'apps' in session ? (session as SessionFull).apps.map((a) => a.id) : session.appSequence,
  }
  if (index === -1) state.sessions = [...state.sessions, shell]
  else state.sessions[index] = shell
}

/* ------------------------------------------------------------------ utils */

export function safeStorage(op: 'get' | 'set' | 'remove', key: string, value?: string): string | null {
  try {
    if (op === 'get') return localStorage.getItem(key)
    if (op === 'set') localStorage.setItem(key, value ?? '')
    else localStorage.removeItem(key)
  } catch {
    // Storage can be unavailable (private windows); the interface works without it.
  }
  return null
}
