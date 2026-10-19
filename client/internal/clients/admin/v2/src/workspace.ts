import { computed, reactive, watch } from 'vue'
import {
  column,
  createHistoryAdapter,
  group,
  hasPanel,
  headless,
  insertPanel,
  normalizeSizes,
  panelIds,
  panelNode,
  removePanel,
  row,
  setActivePanel,
} from 'header-content-layout'
import type { RouteAdapter, ShellRow, ShellTheme, WindowNode, WindowPanelDef } from 'header-content-layout'
import { state } from './server/connection'
import { server } from './server/commands'
import { appLabel } from './schema'

/*
 * Which panels are open and how they are arranged. Panels are named by id:
 * a fixed set of tools, plus one per app opened (`app:<id>`; layouts saved
 * before queues were apps may hold `queue:<id>`), and one per app being edited (`edit:<path>`).
 * The arrangement is appfr's layout tree, and what is open is what it names. It is held in
 * the address bar (`?w=…`, see App.vue), so a reload or a link opens the same panels, and
 * saved per browser for a visit that comes without one.
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

/**
 * The address bar, shared by the layout and the Browse panel's query: two adapters over one
 * address bar would each write from a search the other has since changed.
 */
export const addressBar: RouteAdapter = createHistoryAdapter()

/**
 * A window popped out of this one for a single panel (`?solo`). Its layout is that panel
 * alone, which is not one to remember for the next visit.
 */
export const solo = new URLSearchParams(location.search).has('solo')

// The two splits draw no bar of their own: the menu bar is the page's, and a
// "Row" and a "Column" bar above the panels would say nothing.
export function defaultLayout(): WindowNode {
  return headless(row(
    [
      panelNode('browse'),
      headless(column([group(['session', 'settings'], 'session'), group(['participants', 'clients', 'log'], 'participants')], [0.42, 0.58])),
    ],
    [0.42, 0.58],
  ))
}

interface Saved {
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
  layout: (saved?.layout ?? defaultLayout()) as WindowNode | null,
  theme: (saved?.theme ?? 'auto') as ShellTheme,
  /** Participants whose client page is shown in the views panel. */
  watched: saved?.watched ?? ([] as string[]),
})

/**
 * A split is here to divide a space between the things in it, so once it holds only one thing
 * it is that thing: otherwise each split around it draws a border of its own, a border around a
 * border around the one panel left. One given a name is kept, since the name is said about it,
 * as is one that remembers the desktop it was tiled from (`places`), its only way back. A split
 * drawn without a bar is, besides, here only to hold the panels in it, so once the last of them
 * has gone it goes too, its share going to those beside it: appfr keeps an empty headless space,
 * which here would be a blank box nobody asked for.
 *
 * appfr's `normalizeLayout` would collapse the first kind too, but not the second, and it
 * builds a new tree every time, which the watch below could not stop on. This returns the node
 * itself when nothing in it changed, so the watch stops at once.
 */
function tidySplits(node: WindowNode): WindowNode {
  if (node.kind !== 'split') return node
  const shares = normalizeSizes(node.children.length, node.sizes)
  const children: WindowNode[] = []
  const sizes: number[] = []
  node.children.forEach((child, i) => {
    const next = tidySplits(child)
    if (next.kind === 'split' && next.headless && next.children.length === 0) return
    children.push(next)
    sizes.push(shares[i])
  })
  if (children.length === 1 && !node.title && !node.places) return children[0]
  const changed = children.length !== node.children.length || children.some((child, i) => child !== node.children[i])
  return changed ? { ...node, children, sizes: normalizeSizes(children.length, sizes) } : node
}

// Layouts made before this, in an address or this browser, may hold such splits already.
watch(
  () => workspace.layout,
  (layout) => {
    const next = layout && tidySplits(layout)
    if (next !== layout) workspace.layout = next
  },
  { immediate: true },
)

/** The layout this browser had last, for a visit whose address names none. */
export const savedLayout = saved?.layout ?? null

watch(
  () => [workspace.layout, workspace.theme, workspace.watched],
  () => {
    try {
      const keep = solo ? { ...workspace, layout: load()?.layout ?? null } : workspace
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keep))
    } catch {
      // Without storage the workspace simply starts fresh next time.
    }
  },
  { deep: true },
)

function titleFor(id: string): string {
  if (id === 'edit:new') return 'New app'
  if (id.startsWith('edit:')) return `Edit ${id.slice(5).split(/[\\/]/).pop()}`
  if (id.startsWith('app:')) return appLabel(id.slice(4))
  if (id.startsWith('queue:')) return appLabel(id.slice(6))
  return TOOLS[id] ?? id
}

function subtitleFor(id: string): string | undefined {
  if (id === 'session' || id === 'participants') return state.session?.id
  if (id.startsWith('app:')) return state.apps[id.slice(4)]?.isQueue ? 'queue' : 'app'
  if (id.startsWith('queue:')) return 'queue'
  if (id.startsWith('edit:')) return 'editor'
  return undefined
}

/**
 * Panels whose content must not be torn down when another tab is on top: the
 * participant views are pages in iframes, connected to the server as those
 * participants, and rebuilding them would disconnect and reload every one.
 */
const KEEP_ALIVE = new Set(['clients'])

const isPanel = (id: string) => id in TOOLS || /^(app|queue|edit):./.test(id)

/** The panels open, in the order the layout has them; a link may name ones that are not. */
export const openIds = computed(() => (workspace.layout ? panelIds(workspace.layout).filter(isPanel) : []))

export const panels = computed<WindowPanelDef[]>(() =>
  openIds.value.map((id) => ({
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
  edit: ['browse', 'session', 'participants'],
  session: ['settings', 'participants', 'browse'],
  participants: ['clients', 'log', 'session', 'browse'],
  clients: ['participants', 'log', 'session', 'browse'],
  log: ['participants', 'clients', 'browse'],
  settings: ['session', 'browse'],
  browse: ['session', 'participants'],
}

export function showPanel(id: string) {
  if (workspace.layout && hasPanel(workspace.layout, id)) {
    workspace.layout = setActivePanel(workspace.layout, id)
    return
  }
  const kind = id.startsWith('edit:') ? 'edit' : id.includes(':') ? 'detail' : id
  const home = (HOMES[kind] ?? []).find((candidate) => workspace.layout && hasPanel(workspace.layout, candidate))
    ?? openIds.value.find((candidate) => candidate !== id)
  workspace.layout = workspace.layout && home
    ? insertPanel(workspace.layout, id, home, 'center')
    : panelNode(id)
}

/**
 * A new session opens in a panel of its own that fills the window, rather than as a tab
 * among the others: what was open before is closed, and comes back from the Window menu.
 */
export function showNewSession() {
  workspace.layout = panelNode('session')
}

/** Opens jtree's app editor on an app's file ('new' for a new app). */
export function editApp(appPath: string) {
  showPanel(`edit:${appPath}`)
}

/** The editor of a new app, once it has a file, is that file's editor. */
export function renameEditor(id: string, appPath: string) {
  const to = `edit:${appPath}`
  if (id === to) return
  if (openIds.value.includes(to)) {
    closePanel(id)
    showPanel(to)
    return
  }
  workspace.layout = workspace.layout ? JSON.parse(JSON.stringify(workspace.layout).split(JSON.stringify(id)).join(JSON.stringify(to))) : null
}

export function closePanel(id: string) {
  workspace.layout = workspace.layout ? removePanel(workspace.layout, id) : null
}

export function togglePanel(id: string) {
  if (openIds.value.includes(id)) closePanel(id)
  else showPanel(id)
}

export function resetLayout() {
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
    case 'participants':
      watchParticipant(row.id)
      break
  }
}
