import { markRaw } from 'vue'
import { state } from '../server/connection'
import { zeditor } from '../server/editor'
import { docs, fileName } from './docs'
import type { TreatmentDoc } from './docs'
import { at, clone, idPath, zTreatment } from './znodes'
import type { ZDoc, ZNode, ZPath } from './znodes'

export type { ZDoc } from './znodes'
import type { ZttTreatment } from './ztt'

/*
 * Treatment windows holding z-Tree treatments (.ztt, .txt), edited as z-Tree edits them: the
 * document's tree (doc.z.root) is the treatment, its source is that tree as JSON (so a window
 * knows when it has changed, as for any treatment), and Save has the server write it in
 * z-Tree's text format. Each change is kept, for Edit → Undo.
 */

/** Whether a file is one this interface edits as z-Tree does. */
export const isZtreeFile = (path: string) => /\.(ztt|ztq|txt)$/i.test(path)

function make(key: string, appId: string | null, name: string, root: ZNode, savePath: string | null, format: 'text' | 'binary', notes: string[]): TreatmentDoc {
  const treatment = zTreatment(root, name)
  const ztt = appId ? (state.apps[appId]?.ztree as ZttTreatment | undefined) : undefined
  return {
    key,
    appId,
    name,
    source: treatment.source,
    saved: treatment.source,
    treatment: markRaw(treatment),
    collapsed: {},
    selected: treatment.tree.children[0]?.id ?? null,
    options: {},
    readOnly: false,
    ztt: ztt ? markRaw(ztt) : undefined,
    z: { root, savePath, format, notes, undo: [], redo: [] },
  }
}

/** The window's document for a z-Tree treatment on the server, read by the server. */
export async function openZDoc(appId: string, path: string): Promise<TreatmentDoc> {
  if (docs[appId]) return docs[appId]
  const opened = await zeditor.open(path)
  docs[appId] = make(appId, appId, fileName(path), opened.root, opened.savePath, opened.format, opened.notes)
  docs[appId].z!.savePathExists = opened.savePathExists
  return docs[appId]
}

let untitled = 0

/** File → New Treatment: z-Tree's new treatment, not saved yet. */
export async function newZDoc(): Promise<TreatmentDoc> {
  untitled += 1
  const key = `untitled:${untitled}`
  const name = `Untitled Treatment ${untitled}`
  const { root } = await zeditor.blank(`untitled${untitled}.ztt`)
  docs[key] = make(key, null, name, root, null, 'text', [])
  return docs[key]
}

/** Makes root the document's treatment (remembering the one before, for Undo). */
export function setZRoot(doc: TreatmentDoc, root: ZNode, record = true) {
  const z = doc.z!
  if (record) {
    z.undo.push(doc.source)
    if (z.undo.length > 200) z.undo.shift()
    z.redo = []
  }
  z.root = root
  doc.treatment = markRaw(zTreatment(root, doc.name))
  doc.source = doc.treatment.source
}

/** Changes the treatment through fn, on a copy (so Undo has the one before). */
export function changeZ(doc: TreatmentDoc, fn: (root: ZNode) => void) {
  const root = clone(doc.z!.root)
  fn(root)
  setZRoot(doc, root)
}

export function undoZ(doc: TreatmentDoc): boolean {
  const z = doc.z!
  const before = z.undo.pop()
  if (before == null) return false
  z.redo.push(doc.source)
  setZRoot(doc, JSON.parse(before) as ZNode, false)
  return true
}

export function redoZ(doc: TreatmentDoc): boolean {
  const z = doc.z!
  const after = z.redo.pop()
  if (after == null) return false
  z.undo.push(doc.source)
  setZRoot(doc, JSON.parse(after) as ZNode, false)
  return true
}

/** After a save: the document is the file at path (the app appId), as written. */
export function markZSaved(doc: TreatmentDoc, appId: string | null, path: string) {
  const z = doc.z!
  z.savePath = path
  z.format = 'text'
  const name = fileName(path)
  if (appId && doc.key !== appId) {
    delete docs[doc.key]
    doc.key = appId
    docs[appId] = doc
  }
  doc.appId = appId
  doc.name = name
  doc.treatment = markRaw(zTreatment(z.root, name))
  doc.source = doc.saved = doc.treatment.source
}

/** The selected node's path (a program's line selects its program). */
export function selectedPath(doc: TreatmentDoc): ZPath | null {
  const id = (doc.selected ?? '').replace(/:(line\d+|more)$/, '')
  const path = idPath(id)
  return path && at(doc.z!.root, path) ? path : null
}
