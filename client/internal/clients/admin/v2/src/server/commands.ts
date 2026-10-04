import { emit, refetchSession, refreshAdmin, serverUrl, socket, state } from './connection'

// One function per server message this UI sends (server/source/core/Msgs.js).
// Session commands act on the open session unless given another id.

const userId = new URLSearchParams(location.search).get('id') ?? ''

function openId(): string | null {
  return state.session?.id ?? null
}

/** Runs a command against the open session, then re-reads it. */
async function onSession(name: string, data: (sId: string) => unknown) {
  const sId = openId()
  if (!sId) return
  await emit(name, data(sId))
  refetchSession()
}

export const server = {
  refresh: refreshAdmin,
  reloadApps: () => emit('reloadApps', { userId }),

  /* Sessions */
  createSession: () => emit('sessionCreate', userId),
  openSession: (id: string) => {
    socket.emit('openSession', id)
  },
  deleteSession: (id: string) => emit('deleteSession', id),
  createSessionWithApp: (appId: string, options: Record<string, unknown> = {}) =>
    emit('createSessionAndAddApp', { appId, options, userId }),
  startSessionFromQueue: (qId: string) => emit('startSessionFromQueue', { qId, userId }),

  start: () => onSession('sessionStart', (sId) => sId),
  pause: () => onSession('sessionPause', (sId) => sId),
  resume: () => onSession('sessionResume', (sId) => sId),
  advanceSlowest: () => onSession('sessionAdvanceSlowest', (sId) => sId),
  reset: () => onSession('resetSession', (sId) => ({ sId })),
  saveOutput: () => onSession('saveOutput', (sId) => sId),

  setNumParticipants: (number: number) => onSession('setNumParticipants', (sId) => ({ sId, number })),
  deleteParticipant: (pId: string) => onSession('deleteParticipant', (sId) => ({ sId, pId })),
  setAllowNewParts: (value: boolean) => onSession('setAllowNewParts', (sId) => ({ sId, value })),
  setCaseSensitiveLabels: (value: boolean) => onSession('setCaseSensitiveLabels', (sId) => ({ sId, value })),
  // The server reads `sessionId` for this one message and `sId` for the rest.
  setAllowAdminPlay: (val: boolean) => onSession('setAllowAdminPlay', (sId) => ({ sessionId: sId, val })),

  addApp: (appId: string, options: Record<string, unknown> = {}) =>
    onSession('sessionAddApp', (sId) => ({ sId, appId, options })),
  removeApp: (index: number, appId: string) =>
    onSession('sessionDeleteApp', (sId) => ({ sId, i: index, aId: appId })),
  addQueue: (qId: string) => onSession('sessionAddQueue', (sId) => ({ sId, qId })),

  setAutoplay: (pId: string, val: boolean) => onSession('setAutoplay', (sId) => ({ sId, pId, val })),
  setAutoplayForAll: (val: boolean) => onSession('setAutoplayForAll', (sId) => ({ sId, val })),
  setAutoplayDelay: (val: string) => onSession('setAutoplayDelay', (sId) => ({ sId, val })),

  reloadClients: () => emit('reloadClients'),

  /* Queues */
  createQueue: (id: string) => emit('createQueue', id),
  deleteQueue: (id: string) => emit('deleteQueue', id),
  queueAddApp: (queueId: string, appId: string) => emit('queueAddApp', { queueId, appId, options: {} }),
}

export function participantUrl(base: string, sessionId: string, pId: string): string {
  return `${base}/session/${encodeURIComponent(sessionId)}/${encodeURIComponent(pId)}`
}

export function downloadOutputUrl(sessionId: string): string {
  return `${serverUrl}/session-download/${encodeURIComponent(sessionId)}`
}
