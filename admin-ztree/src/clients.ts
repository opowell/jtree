import { computed, reactive } from 'vue'
import { state } from './server/connection'
import type { Participant, PlayerState, SessionFull } from './server/types'
import { workspace } from './windows'

/*
 * The Connection Monitor's view of the session: one line per client, in an
 * order the experimenter controls until a client takes part in a treatment,
 * after which its line and number are fixed (z-Tree manual, 8.5.1).
 *
 * A jtree participant is a z-Tree client: its id is the client name, and it
 * is connected while it has a page open.
 */

export interface ClientLine {
  number: number
  id: string
  connected: boolean
  /** Has taken part in a treatment, so its place in the list is fixed. */
  fixed: boolean
  participant: Participant
}

/** Natural order, so that b2 comes before b11. */
export function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

function participated(p: Participant): boolean {
  return p.appIndex > 0
}

export const clients = computed<ClientLine[]>(() => {
  const session = state.session
  if (!session) return []
  const all = Object.values(session.participants)
  const order = workspace.clientOrder[session.id] ?? []
  const rank = new Map(order.map((id, i) => [id, i]))
  const ordered = [...all].sort((a, b) => {
    const ra = rank.get(a.id) ?? Number.MAX_SAFE_INTEGER
    const rb = rank.get(b.id) ?? Number.MAX_SAFE_INTEGER
    if (ra !== rb) return ra - rb
    return 0
  })
  // Clients that have taken part move up, ahead of those that have not.
  const fixed = ordered.filter(participated)
  const free = ordered.filter((p) => !participated(p))
  return [...fixed, ...free].map((participant, index) => ({
    number: index + 1,
    id: participant.id,
    connected: participant.numClients > 0,
    fixed: participated(participant),
    participant,
  }))
})

export const connectedCount = computed(() => clients.value.filter((c) => c.connected).length)

export function clientNumber(pId: string): number | '' {
  return clients.value.find((c) => c.id === pId)?.number ?? ''
}

function setOrder(ids: string[]) {
  const session = state.session
  if (!session) return
  workspace.clientOrder = { ...workspace.clientOrder, [session.id]: ids }
}

/** Reorders the clients that have not yet taken part; those that have stay put. */
function reorderFree(arrange: (free: ClientLine[]) => ClientLine[]) {
  const fixed = clients.value.filter((c) => c.fixed)
  const free = clients.value.filter((c) => !c.fixed)
  setOrder([...fixed, ...arrange(free)].map((c) => c.id))
}

export const canReorder = computed(() => clients.value.some((c) => !c.fixed))

export function sortClients() {
  reorderFree((free) => [...free].sort((a, b) => naturalCompare(a.id, b.id)))
}

export function shuffleClients() {
  reorderFree((free) => {
    const out = [...free]
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  })
}

/** Moves a client that has not yet taken part onto another's line. */
export function moveClient(id: string, before: string) {
  reorderFree((free) => {
    const moving = free.find((c) => c.id === id)
    if (!moving) return free
    const rest = free.filter((c) => c.id !== id)
    const at = rest.findIndex((c) => c.id === before)
    rest.splice(at === -1 ? rest.length : at, 0, moving)
    return rest
  })
}

export function saveClientOrder() {
  workspace.savedClientOrder = clients.value.map((c) => c.id)
}

export function restoreClientOrder() {
  const rank = new Map(workspace.savedClientOrder.map((id, i) => [id, i]))
  reorderFree((free) => [...free].sort((a, b) => (rank.get(a.id) ?? 1e9) - (rank.get(b.id) ?? 1e9)))
}

/* ----------------------------------------------------------------- state */

/**
 * The treatment a client is in, or was last in: jtree moves a participant
 * past the last app when it finishes, where z-Tree keeps showing that one.
 */
export function treatmentOf(participant: Participant, session: SessionFull): number {
  return Math.min(participant.appIndex, session.apps.length)
}

/** The app a participant is in, from the open session. */
export function appOf(participant: Participant, session: SessionFull) {
  return session.apps[participant.appIndex - 1]
}

/** The stage a player is in, by name. */
export function stageName(player: PlayerState, participant: Participant, session: SessionFull): string {
  const app = appOf(participant, session)
  const index = player.stageIndex ?? 0
  return player.stageId ?? app?.stages?.[index]?.id ?? ''
}

/**
 * The state column: `*** stage ***` on a stage's active screen, `- stage -`
 * on its waiting screen, `Ready` between treatments, empty before the first.
 */
export function clientState(participant: Participant, session: SessionFull): string {
  const player = participant.player
  if (!player) {
    if (participant.appIndex === 0) return ''
    return 'Ready'
  }
  const app = appOf(participant, session)
  const stage = stageName(player, participant, session)
  if (player.status === 'playing') return `*** ${stage} ***`
  if (player.status === 'ready') {
    // Not yet let into this stage: still on the previous one's waiting screen.
    const index = player.stageIndex ?? 0
    const previous = index > 0 ? app?.stages?.[index - 1]?.id : undefined
    return `- ${previous ?? stage} -`
  }
  return `- ${stage} -`
}

/** Whether a client is on an active screen, where it has input to give. */
export function isActive(participant: Participant): boolean {
  return participant.player?.status === 'playing'
}

/** Milliseconds left on the client's stage clock, or null when it has none. */
export function timeLeft(player: PlayerState | null, now: number): number | null {
  if (!player || player.stageTimerTimeLeft == null) return null
  if (!player.stageTimerRunning) return player.stageTimerTimeLeft
  const started = player.stageTimerStart ? Date.parse(player.stageTimerStart) : now
  return Math.max(0, player.stageTimerTimeLeft - (now - started))
}

/** A clock ticking once a second, for the time column. */
export const clock = reactive({ now: Date.now() })
setInterval(() => (clock.now = Date.now()), 500)

/**
 * What is chosen in the Connection Monitor: clients ticked in its `selected`
 * column (who the next treatment starts for), and clients whose state cell is
 * highlighted (who Run → Leave Stage moves on).
 */
export const monitor = reactive({
  picked: [] as string[],
  states: [] as string[],
})

/** Commands a window offers to the Edit menu while it is in front. */
export interface WindowCommands {
  copy?: () => void
  cut?: () => void
  paste?: () => void
  canCut?: () => boolean
  canPaste?: () => boolean
  exportText?: () => { name: string, text: string } | null
}
export const windowCommands = reactive<Record<string, WindowCommands>>({})
