import { emit, participantRoot, refetchSession, refreshAdmin, serverRoot, socket, state, userId } from './connection'

// One function per server message this interface sends
// (server/source/core/Msgs.js). Session commands act on the open session.

/** Runs a command against the open session, then re-reads it. */
async function onSession(name: string, data: (sId: string) => unknown): Promise<boolean> {
  const sId = state.session?.id
  if (!sId) return false
  const ok = await emit(name, data(sId))
  refetchSession(0)
  return ok
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

  /* Treatments */
  startTreatment: (appId: string, options: Record<string, unknown>, pIds: string[]) =>
    onSession('startTreatment', (sId) => ({ sId, appId, options, pIds })),
  saveApp: async (appId: string, content: string) => {
    const ok = await emit('appSaveFileContents', { aId: appId, content })
    await emit('reloadApps', { userId })
    return ok
  },
  createApp: (appId: string) => emit('createApp', appId),

  /* The clock: z-Tree's stops every countdown in the session at once. */
  stopClock: () => onSession('sessionPause', (sId) => sId),
  restartClock: () => onSession('sessionResume', (sId) => sId),

  leaveStage: (pIds: string[]) => onSession('leaveStage', (sId) => ({ sId, pIds })),
  setStopAfterPeriod: (appIndex: number, value: boolean) =>
    onSession('setStopAfterPeriod', (sId) => ({ sId, appIndex, value })),

  /* Clients */
  setNumParticipants: (number: number) => onSession('setNumParticipants', (sId) => ({ sId, number })),
  deleteParticipant: (pId: string) => onSession('deleteParticipant', (sId) => ({ sId, pId })),
  setAllowNewParts: (value: boolean) => onSession('setAllowNewParts', (sId) => ({ sId, value })),
  setAutoplay: (pId: string, val: boolean) => onSession('setAutoplay', (sId) => ({ sId, pId, val })),
  setAutoplayForAll: (val: boolean) => onSession('setAutoplayForAll', (sId) => ({ sId, val })),
  reloadClients: () => emit('reloadClients'),

  saveOutput: () => onSession('saveOutput', (sId) => sId),
}

/** A participant's own page: what z-Leaf shows that subject. */
export function leafUrl(pId: string, root = serverRoot): string {
  const sId = state.session?.id ?? ''
  return `${root}/session/${encodeURIComponent(sId)}/${encodeURIComponent(pId)}`
}

/** The same page at the address subjects' machines use. */
export function publicLeafUrl(pId: string): string {
  return leafUrl(pId, participantRoot())
}

export function downloadOutputUrl(sessionId: string): string {
  return `${serverRoot}/session-download/${encodeURIComponent(sessionId)}`
}
