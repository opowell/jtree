import { markRaw, reactive, watch } from 'vue'
import { state } from '../server/connection'
import { parseTreatment } from './parse'
import type { Treatment, TreeNode } from './parse'

/*
 * The treatments open in windows. Each holds its source as last read or
 * edited here; the file on the server changes only on File → Save, as in
 * z-Tree, where a treatment is edited in memory and saved explicitly.
 */

export interface TreatmentDoc {
  /** The window's key: the app's id, or `untitled:<n>` before a first save. */
  key: string
  appId: string | null
  name: string
  source: string
  saved: string
  treatment: Treatment
  /** Branches the user has closed; everything else is open, as z-Tree shows a treatment. */
  collapsed: Record<string, boolean>
  selected: string | null
  /** What the app's options are set to for the next Start Treatment. */
  options: Record<string, unknown>
  /** Apps that are folders cannot be written back as one file. */
  readOnly: boolean
}

export const docs = reactive<Record<string, TreatmentDoc>>({})

let untitled = 0

export function fileName(path: string): string {
  return path.split(/[\\/]/).pop() || path
}

function make(key: string, appId: string | null, name: string, source: string, readOnly: boolean): TreatmentDoc {
  return {
    key,
    appId,
    name,
    source,
    saved: source,
    treatment: markRaw(parseTreatment(source, name)),
    collapsed: {},
    selected: 'bg',
    options: {},
    readOnly,
  }
}

/** The document for an app, opened from what the server last said is in it. */
export function openDoc(appId: string): TreatmentDoc | null {
  if (docs[appId]) return docs[appId]
  const app = state.apps[appId]
  if (!app) return null
  const path = app.appPath || appId
  const readOnly = !/\.(jtt|js)$/i.test(path)
  docs[appId] = make(appId, appId, fileName(path), app.appjs ?? '', readOnly)
  return docs[appId]
}

export function newDoc(): TreatmentDoc {
  untitled += 1
  const key = `untitled:${untitled}`
  docs[key] = make(key, null, `Untitled Treatment ${untitled}`, 'app.numPeriods = 1;\napp.groupSize = 1;\n', false)
  return docs[key]
}

export function closeDoc(key: string) {
  delete docs[key]
}

export function isDirty(doc: TreatmentDoc): boolean {
  return doc.source !== doc.saved || doc.appId == null
}

export function setSource(doc: TreatmentDoc, source: string) {
  doc.source = source
  doc.treatment = markRaw(parseTreatment(source, doc.name))
  if (doc.selected && !findNode(doc.treatment.tree, doc.selected)) doc.selected = 'bg'
}

/** After a save, the document is the file again. */
export function markSaved(doc: TreatmentDoc, appId: string, name: string) {
  if (doc.key !== appId) {
    delete docs[doc.key]
    doc.key = appId
    docs[appId] = doc
  }
  doc.appId = appId
  doc.name = name
  doc.saved = doc.source
  doc.treatment = markRaw(parseTreatment(doc.source, name))
}

export function findNode(node: TreeNode, id: string): TreeNode | null {
  if (node.id === id) return node
  for (const child of node.children) {
    const found = findNode(child, id)
    if (found) return found
  }
  return null
}

export function parentOf(node: TreeNode, id: string): TreeNode | null {
  for (const child of node.children) {
    if (child.id === id) return node
    const found = parentOf(child, id)
    if (found) return found
  }
  return null
}

// A file changed from elsewhere — another admin, an editor — is picked up by
// any window that has nothing unsaved in it.
watch(
  () => state.apps,
  (apps) => {
    for (const doc of Object.values(docs)) {
      if (!doc.appId) continue
      const app = apps[doc.appId]
      if (app && app.appjs != null && doc.source === doc.saved && app.appjs !== doc.saved) {
        doc.saved = app.appjs
        setSource(doc, app.appjs)
      }
    }
  },
)
