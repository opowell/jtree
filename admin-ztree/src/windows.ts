import { computed, reactive, watch } from 'vue'
import {
  fixedView,
  frame,
  frameOf,
  headless,
  isFloat,
  isMinimized,
  minimizeFrame,
  panelNode,
  raiseFrame,
  removePanel,
} from 'header-content-layout'
import type { FloatRect, WindowFloat, WindowNode, WindowPanelDef } from 'header-content-layout'
import { safeStorage } from './server/connection'
import { docs, isDirty } from './treatment/docs'

/*
 * z-Tree is one main window holding child windows: a window per open
 * treatment, the Connection Monitor, and a window per table opened from the
 * Run menu. Here that main window's client area is an appfr float with no bar
 * of its own, and each child window is a frame on it.
 *
 * Window ids:
 *   monitor                     the Connection Monitor
 *   treatment:<key>             a treatment's stage tree (key: app id or untitled:n)
 *   table:<name>:<treatment>    a table; treatment 0 for the session's own tables
 *   leaf:<participant id>       what one subject's z-Leaf shows
 */

const STORAGE_KEY = 'jtree-ztree-workspace'

interface Saved {
  layout: WindowFloat
  toolbar: boolean
  statusBar: boolean
  recent: string[]
  clientOrder: Record<string, string[]>
  savedClientOrder: string[]
}

function emptyDesktop(): WindowFloat {
  return headless(fixedView({ kind: 'float', frames: [] } as WindowFloat))
}

function load(): Partial<Saved> {
  try {
    return JSON.parse(safeStorage('get', STORAGE_KEY) ?? '{}') as Partial<Saved>
  } catch {
    return {}
  }
}

const saved = load()

export const workspace = reactive({
  layout: (saved.layout && isFloat(saved.layout) ? saved.layout : emptyDesktop()) as WindowFloat,
  toolbar: saved.toolbar ?? false,
  statusBar: saved.statusBar ?? true,
  /** Treatment files opened lately, newest first: File → previous files. */
  recent: saved.recent ?? ([] as string[]),
  /** The Connection Monitor's order of clients, per session. */
  clientOrder: saved.clientOrder ?? ({} as Record<string, string[]>),
  /** Run → Save Client Order. */
  savedClientOrder: saved.savedClientOrder ?? ([] as string[]),
  /** Size of the desktop, for placing new windows on it. */
  width: 1000,
  height: 640,
})

watch(
  () => [workspace.layout, workspace.toolbar, workspace.statusBar, workspace.recent, workspace.clientOrder, workspace.savedClientOrder],
  () => {
    const { width: _w, height: _h, ...rest } = workspace
    safeStorage('set', STORAGE_KEY, JSON.stringify(rest))
  },
  { deep: true },
)

/** Every window on the desktop, back to front. */
export const windowIds = computed(() => workspace.layout.frames.flatMap((f) => framePanels(f.node)))

function framePanels(node: WindowNode): string[] {
  if (node.kind === 'group') return node.panels.filter((p): p is string => typeof p === 'string')
  if (node.kind === 'split') return node.children.flatMap(framePanels)
  return node.frames.flatMap((f) => framePanels(f.node))
}

/** The window in front, which is what Start Treatment, Save and Close act on. */
export const frontWindow = computed(() => {
  const frames = workspace.layout.frames.filter((f) => !isMinimized(f))
  const top = frames[frames.length - 1]
  return top ? framePanels(top.node)[0] ?? null : null
})

/** The treatment in the front window, when the front window is one. */
export const frontTreatment = computed(() => {
  const id = frontWindow.value
  return id?.startsWith('treatment:') ? docs[id.slice('treatment:'.length)] ?? null : null
})

/** Where each kind of window opens the first time, as z-Tree places them. */
function defaultRect(id: string): Partial<FloatRect> {
  const w = workspace.width
  const h = workspace.height
  if (id === 'monitor') return { x: Math.round(w * 0.12), y: 12, w: Math.min(860, w - 40), h: 230 }
  if (id.startsWith('treatment:')) {
    const n = windowIds.value.filter((other) => other.startsWith('treatment:')).length
    return { x: 24 + n * 26, y: Math.min(220, h * 0.3) + n * 26, w: 460, h: Math.max(320, h - 260) }
  }
  if (id.startsWith('leaf:')) {
    const n = windowIds.value.filter((other) => other.startsWith('leaf:')).length
    return { x: Math.max(20, w - 440 - n * 26), y: 30 + n * 26, w: 420, h: Math.min(520, h - 60) }
  }
  const n = windowIds.value.filter((other) => other.startsWith('table:')).length
  return { x: Math.round(w * 0.3) + n * 26, y: 120 + n * 26, w: Math.min(720, w - 60), h: 260 }
}

export function openWindow(id: string) {
  const held = frameOf(workspace.layout, id)
  if (held) {
    let layout = workspace.layout as WindowNode
    if (isMinimized(held)) layout = minimizeFrame(layout, id, false)
    workspace.layout = raiseFrame(layout, id) as WindowFloat
    return
  }
  workspace.layout = {
    ...workspace.layout,
    frames: [...workspace.layout.frames, frame(panelNode(id), defaultRect(id))],
  }
}

export function closeWindow(id: string) {
  workspace.layout = (removePanel(workspace.layout, id) ?? emptyDesktop()) as WindowFloat
  if (!isFloat(workspace.layout)) workspace.layout = emptyDesktop()
}

export function setLayout(next: WindowNode | null) {
  workspace.layout = (next && isFloat(next) ? next : emptyDesktop()) as WindowFloat
}

export function rememberRecent(appId: string) {
  workspace.recent = [appId, ...workspace.recent.filter((id) => id !== appId)].slice(0, 6)
}

/* ---------------------------------------------------------------- titles */

export function windowTitle(id: string): string {
  if (id === 'monitor') return 'Connection Monitor'
  if (id.startsWith('treatment:')) {
    const doc = docs[id.slice('treatment:'.length)]
    if (!doc) return 'Treatment'
    return isDirty(doc) && doc.appId ? `${doc.name} *` : doc.name
  }
  if (id.startsWith('table:')) {
    const [, name, treatment] = id.split(':')
    return treatment === '0' ? name : `${name} (treatment ${treatment})`
  }
  if (id.startsWith('leaf:')) return `z-Leaf ${id.slice('leaf:'.length)}`
  return id
}

export const panels = computed<WindowPanelDef[]>(() =>
  windowIds.value.map((id) => ({ id, title: windowTitle(id) })),
)

export function tableWindowId(name: string, treatment: number): string {
  return `table:${name}:${treatment}`
}
