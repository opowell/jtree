import { reactive } from 'vue'
import { state, refreshAdmin } from './server/connection'
import { downloadOutputUrl, leafUrl, server } from './server/commands'
import { clients, isActive, monitor, restoreClientOrder, saveClientOrder, shuffleClients, sortClients, windowCommands } from './clients'
import { messageBox, showDialog } from './dialogs'
import { closeDoc, docs, findNode, isDirty, markSaved, newDoc, openDoc, setSource } from './treatment/docs'
import type { TreatmentDoc } from './treatment/docs'
import { newStageCode, parseTreatment, replaceRange, stageVariable } from './treatment/parse'
import type { TreeNode } from './treatment/parse'
import { closeWindow, frontTreatment, frontWindow, openWindow, rememberRecent, tableWindowId, workspace } from './windows'
import OpenDialog from './dialogs/OpenDialog.vue'
import SaveAsDialog from './dialogs/SaveAsDialog.vue'
import BackgroundDialog from './dialogs/BackgroundDialog.vue'
import StageDialog from './dialogs/StageDialog.vue'
import ProgramDialog from './dialogs/ProgramDialog.vue'
import ScreenDialog from './dialogs/ScreenDialog.vue'
import ItemDialog from './dialogs/ItemDialog.vue'
import TableDialog from './dialogs/TableDialog.vue'
import RestoreSessionDialog from './dialogs/RestoreSessionDialog.vue'
import LeafDialog from './dialogs/LeafDialog.vue'
import AddressDialog from './dialogs/AddressDialog.vue'
import AboutDialog from './dialogs/AboutDialog.vue'

/*
 * What the menus, the toolbar and the keyboard do. Each command acts the way
 * the z-Tree manual (chapter 8, "Menu Commands") says its namesake does, on
 * the jtree session this window has open.
 */

/** The status bar's message, as an MFC program's status bar says what just happened. */
export const status = reactive({ text: 'Ready' })
let statusTimer: ReturnType<typeof setTimeout> | null = null
export function say(text: string) {
  status.text = text
  if (statusTimer) clearTimeout(statusTimer)
  statusTimer = setTimeout(() => (status.text = 'Ready'), 6000)
}

/* ------------------------------------------------------------------ File */

export function newTreatment() {
  const doc = newDoc()
  openWindow(`treatment:${doc.key}`)
}

export async function openTreatmentDialog() {
  const appId = await showDialog<string>(OpenDialog)
  if (appId) openTreatment(appId)
}

export function openTreatment(appId: string) {
  const doc = openDoc(appId)
  if (!doc) {
    void messageBox(`The file ${appId} could not be found.`, { icon: 'stop' })
    return
  }
  rememberRecent(appId)
  openWindow(`treatment:${doc.key}`)
}

/** Closes a window, asking first if it holds an unsaved treatment. */
export async function closeWindowAsking(id: string): Promise<boolean> {
  if (id.startsWith('treatment:')) {
    const doc = docs[id.slice('treatment:'.length)]
    if (doc && isDirty(doc) && (doc.appId == null ? doc.source.trim() !== '' : true)) {
      const answer = await messageBox(`Save changes to ${doc.name}?`, {
        icon: 'question',
        buttons: ['Cancel', "Don't save", 'Save'],
      })
      if (answer === undefined || answer === 'Cancel') return false
      if (answer === 'Save' && !(await saveDoc(doc))) return false
    }
    if (doc) closeDoc(doc.key)
  }
  closeWindow(id)
  return true
}

export function closeFront() {
  if (frontWindow.value) void closeWindowAsking(frontWindow.value)
}

export async function saveDoc(doc: TreatmentDoc, saveAs = false): Promise<boolean> {
  if (doc.readOnly && !saveAs) {
    await messageBox(`${doc.name} is a folder app, which this interface cannot write back as one file. Use File → Save As… to save it as a new .jtt file.`, { icon: 'info' })
    return false
  }
  if (doc.appId == null || saveAs) {
    const name = await showDialog<string>(SaveAsDialog, { name: doc.appId ? `${doc.name.replace(/\.(jtt|js)$/i, '')}-copy.jtt` : `${doc.name.replace(/\s+/g, '-').toLowerCase()}.jtt` })
    if (!name) return false
    const existing = findAppByFile(name)
    if (existing) {
      const answer = await messageBox(`${name} already exists.\nDo you want to replace it?`, { icon: 'warning', buttons: ['No', 'Yes'] })
      if (answer !== 'Yes') return false
      return writeDoc(doc, existing, name)
    }
    await server.createApp(name)
    await server.reloadApps()
    const created = findAppByFile(name)
    if (!created) {
      await messageBox(`${name} could not be created.`, { icon: 'stop' })
      return false
    }
    return writeDoc(doc, created, name)
  }
  return writeDoc(doc, doc.appId, doc.name)
}

async function writeDoc(doc: TreatmentDoc, appId: string, name: string): Promise<boolean> {
  const oldKey = doc.key
  const ok = await server.saveApp(appId, doc.source)
  if (!ok) {
    await messageBox(`${name} could not be saved.`, { icon: 'stop' })
    return false
  }
  markSaved(doc, appId, name)
  if (oldKey !== doc.key) {
    // The window is now the saved file's.
    const at = workspace.layout.frames.findIndex((f) => f.node.kind === 'group' && f.node.panels.includes(`treatment:${oldKey}`))
    if (at !== -1) {
      const frames = [...workspace.layout.frames]
      const held = frames[at]
      frames[at] = { ...held, node: { ...held.node, panels: [`treatment:${doc.key}`], active: `treatment:${doc.key}` } as typeof held.node }
      workspace.layout = { ...workspace.layout, frames }
    }
  }
  rememberRecent(appId)
  say(`Saved ${name}`)
  return true
}

/** The app saved under `apps/<name>`. */
function findAppByFile(name: string): string | null {
  const want = name.replace(/\\/g, '/').replace(/^\/+/, '')
  for (const app of Object.values(state.apps)) {
    const path = (app.appPath || app.id).replace(/\\/g, '/')
    if (path.endsWith(`/apps/${want}`) || path === want) return app.id
  }
  return null
}

export function saveFront(saveAs = false) {
  const doc = frontTreatment.value
  if (doc) void saveDoc(doc, saveAs)
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportTreatment() {
  const doc = frontTreatment.value
  if (doc) download(/\.(jtt|js)$/i.test(doc.name) ? doc.name : `${doc.name}.jtt`, doc.source)
}

export function exportTable() {
  const id = frontWindow.value
  const exported = id ? windowCommands[id]?.exportText?.() : null
  if (exported) download(exported.name, exported.text)
}

export async function quit() {
  const running = state.session?.started && Object.values(state.session.participants).some((p) => p.player)
  const answer = await messageBox(
    running ? 'A treatment is still running. Quit anyway?\n(The session goes on running on the server.)' : 'Quit zTree?',
    { icon: 'question', buttons: ['Cancel', 'Quit'] },
  )
  if (answer === 'Quit') window.close()
}

/* ------------------------------------------------------------------ Edit */

let clipboard = ''

function selectedNode(doc: TreatmentDoc): TreeNode | null {
  return doc.selected ? findNode(doc.treatment.tree, doc.selected) : null
}

/** The source a node stands for, when it is one that can be cut and pasted. */
function nodeRange(doc: TreatmentDoc, node: TreeNode | null) {
  if (!node?.stmt) return null
  if (!['stage', 'program', 'active', 'waiting'].includes(node.kind)) return null
  return node.stmt
}

export function canCutTree(doc: TreatmentDoc): boolean {
  return !doc.readOnly && nodeRange(doc, selectedNode(doc)) != null
}

export function copyTree(doc: TreatmentDoc) {
  const range = nodeRange(doc, selectedNode(doc))
  if (!range) return
  clipboard = doc.source.slice(range.start, range.end)
  void navigator.clipboard?.writeText(clipboard)
  say('Copied')
}

export function cutTree(doc: TreatmentDoc) {
  const range = nodeRange(doc, selectedNode(doc))
  if (!range || doc.readOnly) return
  clipboard = doc.source.slice(range.start, range.end)
  void navigator.clipboard?.writeText(clipboard)
  // Take the line break before it too, so no blank line is left behind.
  let start = range.start
  while (start > 0 && /[ \t]/.test(doc.source[start - 1])) start--
  if (start > 0 && doc.source[start - 1] === '\n') start--
  setSource(doc, replaceRange(doc.source, { start, end: range.end }, ''))
  say('Cut')
}

export function canPasteTree(doc: TreatmentDoc): boolean {
  return !doc.readOnly && clipboard !== ''
}

export function pasteTree(doc: TreatmentDoc) {
  if (!clipboard || doc.readOnly) return
  const at = insertionPoint(doc)
  setSource(doc, `${doc.source.slice(0, at)}\n${clipboard}${doc.source.slice(at)}`)
  say('Pasted')
}

/** Where something new goes: after the stage the selection is in, else at the end. */
function insertionPoint(doc: TreatmentDoc): number {
  const node = selectedNode(doc)
  const stage = node?.stageVar ? doc.treatment.stages.find((s) => s.varName === node.stageVar) : null
  if (stage) return stage.span.end
  if (node?.kind === 'stage') {
    const byNode = doc.treatment.stages.find((s) => s.span.start === node.stmt?.start)
    if (byNode) return byNode.span.end
  }
  return doc.treatment.end
}

export function editCopy() {
  const id = frontWindow.value
  if (id) windowCommands[id]?.copy?.()
}
export function editCut() {
  const id = frontWindow.value
  if (id) windowCommands[id]?.cut?.()
}
export function editPaste() {
  const id = frontWindow.value
  if (id) windowCommands[id]?.paste?.()
}

/* ------------------------------------------------------------- Treatment */

/** Treatment → Info…: the dialog of the element selected in the stage tree. */
export async function info(doc: TreatmentDoc, nodeId?: string) {
  const node = findNode(doc.treatment.tree, nodeId ?? doc.selected ?? 'bg')
  if (!node) return
  const ro = doc.readOnly
  switch (node.kind) {
    case 'background': {
      if (node.id === 'root') return
      await showDialog(BackgroundDialog, { doc, readOnly: ro })
      return
    }
    case 'stage': {
      const stage = doc.treatment.stages.find((s) => s.span.start === node.stmt?.start)
      if (stage) await showDialog(StageDialog, { doc, stage, readOnly: ro })
      return
    }
    case 'program':
      await showDialog(ProgramDialog, { doc, node, readOnly: ro })
      return
    case 'active':
    case 'waiting':
      await showDialog(ScreenDialog, { doc, node, readOnly: ro })
      return
    case 'item':
    case 'button':
    case 'box': {
      // An item's dialog shows what its screen says; the screen is where it is changed.
      const screen = screenOf(doc.treatment.tree, node.id)
      await showDialog(ItemDialog, { node, onEditScreen: screen ? () => showDialog(ScreenDialog, { doc, node: screen, readOnly: ro }) : null })
      return
    }
    case 'table':
      await showDialog(TableDialog, { name: node.table })
      return
    case 'line': {
      const parent = programOf(doc.treatment.tree, node.id)
      if (parent) await showDialog(ProgramDialog, { doc, node: parent, readOnly: ro })
      return
    }
    case 'error':
      await check(doc)
  }
}

function screenOf(root: TreeNode, id: string): TreeNode | null {
  for (const child of root.children) {
    if ((child.kind === 'active' || child.kind === 'waiting') && findNode(child, id)) return child
    const inner = screenOf(child, id)
    if (inner) return inner
  }
  return null
}

function programOf(root: TreeNode, id: string): TreeNode | null {
  for (const child of root.children) {
    if (child.kind === 'program' && child.children.some((line) => line.id === id)) return child
    const inner = programOf(child, id)
    if (inner) return inner
  }
  return null
}

export function frontInfo() {
  const doc = frontTreatment.value
  if (doc) void info(doc)
}

export async function newStage() {
  const doc = frontTreatment.value
  if (!doc || doc.readOnly) return
  const taken = new Set(doc.treatment.stages.map((s) => s.varName))
  const names = new Set(doc.treatment.stages.map((s) => s.id))
  let name = 'stage'
  for (let i = 2; names.has(name); i++) name = `stage${i}`
  const at = insertionPoint(doc)
  const variable = stageVariable(name, taken)
  const source = `${doc.source.slice(0, at)}${newStageCode(name, variable)}${doc.source.slice(at)}`
  // The new stage's dialog opens on it at once, as z-Tree's does.
  const preview = parseTreatment(source, doc.name)
  const stage = preview.stages.find((s) => s.varName === variable)
  if (!stage) return
  const before = doc.source
  setSource(doc, source)
  const node = doc.treatment.tree.children.find((n) => n.kind === 'stage' && n.stageVar === variable)
  if (node) doc.selected = node.id
  const result = await showDialog(StageDialog, { doc, stage: doc.treatment.stages.find((s) => s.varName === variable), isNew: true })
  if (result === undefined) setSource(doc, before)
}

export async function newProgram() {
  const doc = frontTreatment.value
  if (!doc || doc.readOnly) return
  const node = selectedNode(doc)
  const stage = node?.stageVar
    ? doc.treatment.stages.find((s) => s.varName === node.stageVar)
    : node?.kind === 'stage' ? doc.treatment.stages.find((s) => s.span.start === node.stmt?.start) : null
  await showDialog(ProgramDialog, { doc, stage: stage ?? null, isNew: true })
}

export function expandAll() {
  const doc = frontTreatment.value
  if (doc) doc.collapsed = {}
}

/** Treatment → Check: z-Tree reports the first error, or that there is none. */
export async function check(doc = frontTreatment.value) {
  if (!doc) return
  const error = doc.treatment.error
  if (error) {
    await messageBox(`Syntax error in line ${error.line}, column ${error.column + 1}:\n${error.message}`, { icon: 'stop', title: 'Check' })
    return
  }
  const app = doc.appId ? state.apps[doc.appId] : null
  if (app?.hasError && doc.source === doc.saved) {
    await messageBox(`The treatment could not be run${app.errorLine ? ` (line ${app.errorLine})` : ''}. The jtree server reported an error when loading it.`, { icon: 'stop', title: 'Check' })
    return
  }
  const stages = doc.treatment.stages.length
  await messageBox(stages ? `No syntax errors found. ${stages} stage${stages === 1 ? '' : 's'}.` : 'No syntax errors found, but the treatment has no stages.', { icon: 'info', title: 'Check' })
}

/* ------------------------------------------------------------------- Run */

export function connectionMonitor() {
  openWindow('monitor')
}

export { shuffleClients, sortClients, saveClientOrder, restoreClientOrder }

/**
 * Run → Start Treatment: starts the treatment in the front window for the
 * selected clients, or for all of them. Every one of them must be Ready or
 * not yet have taken part (manual 8.5.4).
 */
export async function startTreatment() {
  const doc = frontTreatment.value
  const session = state.session
  if (!doc || !session) return
  if (doc.treatment.error) {
    await messageBox(`The treatment has a syntax error in line ${doc.treatment.error.line}. It cannot be started.`, { icon: 'stop' })
    return
  }
  if (!doc.treatment.stages.length) {
    await messageBox('The treatment has no stages.', { icon: 'stop' })
    return
  }
  const chosen = monitor.picked.length ? clients.value.filter((c) => monitor.picked.includes(c.id)) : clients.value
  if (!chosen.length) {
    await messageBox('No clients are connected. Start z-Leaves (Tools → Start z-Leaf…) or have subjects open their page, then start the treatment.', { icon: 'warning' })
    return
  }
  const busy = chosen.filter((c) => c.participant.player != null)
  if (busy.length) {
    await messageBox(
      `The treatment cannot be started: ${busy.length === 1 ? 'client' : 'clients'} ${busy.map((c) => c.id).join(', ')} ${busy.length === 1 ? 'is' : 'are'} still in a treatment.`,
      { icon: 'stop' },
    )
    return
  }
  if (doc.appId == null || isDirty(doc)) {
    const answer = await messageBox(`${doc.name} has changes that are not saved. The treatment is started from its file, so it must be saved first.`, { icon: 'question', buttons: ['Cancel', 'Save and start'] })
    if (answer !== 'Save and start' || !(await saveDoc(doc))) return
  }
  if (!state.apps[doc.appId!] || state.apps[doc.appId!].hasError) {
    await messageBox('The jtree server could not load this treatment. Use Treatment → Check.', { icon: 'stop' })
    return
  }
  const number = session.apps.length + 1
  const ok = await server.startTreatment(doc.appId!, { ...doc.options }, monitor.picked.length ? chosen.map((c) => c.id) : [])
  say(ok ? `Treatment ${number} started: ${doc.name}` : 'The treatment could not be started')
  if (!ok) await messageBox('The server could not start the treatment. Is it running the version of jtree with z-Tree support (startTreatment)?', { icon: 'stop' })
}

export function openTable(name: string, treatment: number) {
  openWindow(tableWindowId(name, treatment))
}

/** The treatment `Run → subjects Table` means: the last one started. */
export function lastTreatment(): number {
  return state.session?.apps.length ?? 0
}

export async function stopClock() {
  await server.stopClock()
  say('Clock stopped')
}

export async function restartClock() {
  await server.restartClock()
  say('Clock restarted')
}

/** Run → Leave Stage: the subjects whose state is selected leave their stage. */
export async function leaveStage() {
  const session = state.session
  if (!session) return
  const chosen = monitor.states.map((id) => session.participants[id]).filter((p) => p?.player)
  if (!chosen.length) {
    await messageBox('Select the state of the subjects that should leave the stage in the Connection Monitor (click a cell in the state column, or the box above it for all).', { icon: 'info' })
    return
  }
  const expectsInput = chosen.some((p) => isActive(p) && stageHasInput(p.appIndex, p.player?.stageId ?? ''))
  if (expectsInput) {
    const answer = await messageBox(
      'WARNING: In this stage, the subject has to make input. You do not get this input if you leave the stage.',
      { title: 'Dialog', buttons: ['Cancel, not leave', 'OK, leave'] },
    )
    if (answer !== 'OK, leave') return
  }
  await server.leaveStage(chosen.map((p) => p.id))
  say(`${chosen.length} subject${chosen.length === 1 ? '' : 's'} left the stage`)
}

/** Whether a stage's active screen asks for input, judged from the app's source. */
function stageHasInput(appIndex: number, stageId: string): boolean {
  const app = state.session?.apps[appIndex - 1]
  const source = app ? state.apps[String(app.id)]?.appjs : null
  if (!source) return true
  const treatment = parseTreatment(source, '')
  const stageNode = treatment.tree.children.find((n) => n.kind === 'stage' && n.label === stageId)
  if (!stageNode) return true
  const active = stageNode.children.find((n) => n.kind === 'active')
  const hasInput = (node: TreeNode): boolean => Boolean(node.item?.input) || node.children.some(hasInput)
  return active ? hasInput(active) : false
}

/** The treatments someone is in now. */
export function runningTreatments(): number[] {
  const session = state.session
  if (!session) return []
  return [...new Set(Object.values(session.participants).filter((p) => p.player).map((p) => p.appIndex))]
}

export function stopAfterThisPeriodChecked(): boolean {
  const running = runningTreatments()
  return running.length > 0 && running.every((i) => state.session?.apps[i - 1]?.stopAfterPeriod)
}

export async function stopAfterThisPeriod() {
  const value = !stopAfterThisPeriodChecked()
  for (const index of runningTreatments()) await server.setStopAfterPeriod(index, value)
  say(value ? 'Treatments stop after this period' : 'Treatments go on after this period')
}

export function saveAllTables() {
  const session = state.session
  if (session) window.open(downloadOutputUrl(session.id), '_blank')
}

export async function restoreSession() {
  const id = await showDialog<string>(RestoreSessionDialog)
  if (id === '__new__') {
    await server.createSession()
    say('New session started')
  } else if (id) {
    monitor.picked = []
    monitor.states = []
    server.openSession(id)
    say(`Session ${id} restored`)
  }
}

/* ----------------------------------------------------------------- Tools */

export async function startLeaves() {
  const result = await showDialog<{ names: string[], tabs: boolean }>(LeafDialog)
  if (!result?.names.length) return
  const session = state.session
  if (!session) return
  const unknown = result.names.some((name) => !session.participants[name])
  if (unknown && !session.allowNewParts) await server.setAllowNewParts(true)
  for (const name of result.names) {
    if (result.tabs) window.open(leafUrl(name), '_blank')
    else openWindow(`leaf:${name}`)
  }
}

export function leafAddress() {
  void showDialog(AddressDialog)
}

export function reloadLeaves() {
  void server.reloadClients()
  say('All z-Leaves reloaded')
}

export async function reloadTreatments() {
  await server.reloadApps()
  refreshAdmin()
  say('Treatment files read again')
}

/* -------------------------------------------------------------------- ? */

export function about() {
  void showDialog(AboutDialog)
}
