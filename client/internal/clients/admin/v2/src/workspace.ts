import { computed, reactive, watch } from 'vue'
import {
  column,
  group,
  hasPanel,
  headless,
  insertPanel,
  panelNode,
  removePanel,
  row,
  setActivePanel,
} from 'header-content-layout'
import type { ShellRow, ShellTheme, WindowNode, WindowPanelDef } from 'header-content-layout'
import { state } from './server/connection'
import { server } from './server/commands'
import { appLabel } from './schema'

/*
 * Which panels are open and how they are arranged. Panels are named by id:
 * a fixed set of tools, plus one per app or queue opened (`app:<id>`,
 * `queue:<id>`). The arrangement is appfr's layout tree, kept as data and
 * saved per browser.
 */

export const TOOLS: Record<string, string> = {
  browse: 'Browse',
  session: 'Session',
  participants: 'Participants',
  clients: 'Participant views',
  log: 'Log',
  settings: 'Settings',
}

const STORAGE_KEY = 'jtree-admin2-workspace'

// The two splits draw no bar of their own: the menu bar is the page's, and a
// "Row" and a "Column" bar above the panels would say nothing.
function defaultLayout(): WindowNode {
  return headless(row(
    [
      panelNode('browse'),
      headless(column([group(['session', 'settings'], 'session'), group(['participants', 'clients', 'log'], 'participants')], [0.42, 0.58])),
    ],
    [0.42, 0.58],
  ))
}

const DEFAULT_IDS = ['browse', 'session', 'settings', 'participants', 'clients', 'log']

interface Saved {
  ids: string[]
  layout: WindowNode | null
  theme: ShellTheme
  watched: string[]
}

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Saved) : null
  } catch {
    return null
  }
}

const saved = load()

export const workspace = reactive({
  ids: saved?.ids ?? [...DEFAULT_IDS],
  layout: (saved?.layout ?? defaultLayout()) as WindowNode | null,
  theme: (saved?.theme ?? 'auto') as ShellTheme,
  /** Participants whose client page is shown in the views panel. */
  watched: saved?.watched ?? ([] as string[]),
})

watch(
  () => [workspace.ids, workspace.layout, workspace.theme, workspace.watched],
  () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace))
    } catch {
      // Without storage the workspace simply starts fresh next time.
    }
  },
  { deep: true },
)

function titleFor(id: string): string {
  if (id.startsWith('app:')) return appLabel(id.slice(4))
  if (id.startsWith('queue:')) {
    const queue = state.queues.find((q) => q.id === id.slice(6))
    return queue?.displayName ?? 'Queue'
  }
  return TOOLS[id] ?? id
}

function subtitleFor(id: string): string | undefined {
  if (id === 'session' || id === 'participants') return state.session?.id
  if (id.startsWith('app:')) return 'app'
  if (id.startsWith('queue:')) return 'queue'
  return undefined
}

/**
 * Panels whose content must not be torn down when another tab is on top: the
 * participant views are pages in iframes, connected to the server as those
 * participants, and rebuilding them would disconnect and reload every one.
 */
const KEEP_ALIVE = new Set(['clients'])

export const panels = computed<WindowPanelDef[]>(() =>
  workspace.ids.map((id) => ({
    id,
    title: titleFor(id),
    subtitle: subtitleFor(id),
    keepAlive: KEEP_ALIVE.has(id),
  })),
)

/**
 * Where a panel opens when it is not on screen: as a tab beside the first of
 * these that is. Detail panels go with the session's, so the browser stays
 * where it is.
 */
const HOMES: Record<string, string[]> = {
  detail: ['session', 'settings', 'participants', 'browse'],
  session: ['settings', 'participants', 'browse'],
  participants: ['clients', 'log', 'session', 'browse'],
  clients: ['participants', 'log', 'session', 'browse'],
  log: ['participants', 'clients', 'browse'],
  settings: ['session', 'browse'],
  browse: ['session', 'participants'],
}

export function showPanel(id: string) {
  if (workspace.ids.includes(id) && workspace.layout && hasPanel(workspace.layout, id)) {
    workspace.layout = setActivePanel(workspace.layout, id)
    return
  }
  if (!workspace.ids.includes(id)) workspace.ids.push(id)
  const kind = id.includes(':') ? 'detail' : id
  const home = (HOMES[kind] ?? []).find((candidate) => workspace.layout && hasPanel(workspace.layout, candidate))
    ?? workspace.ids.find((candidate) => candidate !== id && workspace.layout && hasPanel(workspace.layout, candidate))
  workspace.layout = workspace.layout && home
    ? insertPanel(workspace.layout, id, home, 'center')
    : panelNode(id)
}

export function closePanel(id: string) {
  workspace.ids = workspace.ids.filter((candidate) => candidate !== id)
  workspace.layout = workspace.layout ? removePanel(workspace.layout, id) : null
}

export function togglePanel(id: string) {
  if (workspace.ids.includes(id)) closePanel(id)
  else showPanel(id)
}

export function resetLayout() {
  workspace.ids = [...DEFAULT_IDS]
  workspace.layout = defaultLayout()
}

/** Shows a participant's own page in the views panel. */
export function watchParticipant(pId: string) {
  if (!workspace.watched.includes(pId)) workspace.watched.push(pId)
  showPanel('clients')
}

export function unwatchParticipant(pId: string) {
  workspace.watched = workspace.watched.filter((id) => id !== pId)
}

export function openSession(id: string) {
  server.openSession(id)
  showPanel('session')
}

/** What opening a row does, whichever list it was opened from. */
export function activate(row: ShellRow) {
  switch (row.entityKey) {
    case 'sessions':
      openSession(row.id)
      break
    case 'apps':
      showPanel(`app:${row.id}`)
      break
    case 'queues':
      showPanel(`queue:${row.id}`)
      break
    case 'participants':
      watchParticipant(row.id)
      break
  }
}
