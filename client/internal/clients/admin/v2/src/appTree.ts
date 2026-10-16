import { describeNode, isLeaf } from './elements'
import type { AppModel, Prop, ScreenNode } from './server/editor'

/*
 * An app as the app editor's structured mode shows it: a tree of the app, its stages, their
 * screens with the elements in them, and their functions. Each item's id says where it is
 * ('app', 'stage:decide', 'stage:decide/screen:activeScreen', ... '/2.0' for the first child of
 * the screen's third element), so it is the same item after an edit that does not move it.
 */

export interface TreeItem {
  id: string
  kind: 'app' | 'stage' | 'screen' | 'function' | 'node' | 'other'
  /** A short tag before the label: what it is. */
  chip: string
  label: string
  note: string
  children: TreeItem[]
  /** The stage it is in (none: the app's). */
  stage?: string
  /** A screen's or function's property; an element's screen. */
  prop?: Prop
  path?: number[]
  node?: ScreenNode
}

/** Where a drop on an item puts what is dragged: before or after it, or in it. */
export interface DropPlace {
  id: string
  where: 'before' | 'after' | 'inside'
}

/** Where path points once the node at from is taken out (as the server's html.js reckons it). */
export function pathAfterRemoving(path: number[], from: number[]): number[] {
  const level = from.length - 1
  if (path.length <= level || from.slice(0, level).some((k, i) => k !== path[i]) || path[level] <= from[level]) return path
  return [...path.slice(0, level), path[level] - 1, ...path.slice(level + 1)]
}

/** What is chosen in the tree (an item's id), and which items are folded. */
export interface TreeView {
  selected: string
  collapsed: Record<string, boolean>
}

/** Whether a property is a screen: HTML (text), or named as one. */
export const isScreen = (p: Prop) => p.kind === 'text' || /Screen$/.test(p.name)

export const SCREEN_NAMES: Record<string, string> = { activeScreen: 'Active screen', waitingScreen: 'Waiting screen' }

const ownerId = (stage?: string) => (stage == null ? 'app' : `stage:${stage}`)
export const screenId = (prop: string, stage?: string) => `${ownerId(stage)}/screen:${prop}`
export const nodeId = (prop: string, stage: string | undefined, path: number[]) => `${screenId(prop, stage)}/${path.join('.')}`
export const functionId = (prop: string, stage?: string) => `${ownerId(stage)}/fn:${prop}`

function nodeItems(nodes: ScreenNode[], prop: Prop, stage: string | undefined, parent: number[]): TreeItem[] {
  return nodes.map((node, k) => {
    const path = parent.concat(k)
    const { label, note } = describeNode(node, String(prop.value ?? ''))
    return {
      id: nodeId(prop.name, stage, path), kind: 'node', chip: node.type === 'element' ? node.tag! : node.type === 'text' ? 'abc' : '!--',
      label, note, stage, prop, path, node,
      children: isLeaf(node) ? [] : nodeItems(node.children ?? [], prop, stage, path),
    }
  })
}

function propItems(props: Prop[], stage?: string): TreeItem[] {
  const order = (p: Prop) => (p.name === 'activeScreen' ? 0 : p.name === 'waitingScreen' ? 1 : 2)
  const screens = props.filter(isScreen).sort((a, b) => order(a) - order(b)).map((p): TreeItem => ({
    id: screenId(p.name, stage), kind: 'screen', chip: 'screen', label: SCREEN_NAMES[p.name] ?? p.name,
    note: p.kind === 'text' ? '' : 'made by code', stage, prop: p,
    children: p.kind === 'text' ? nodeItems(p.nodes ?? [], p, stage, []) : [],
  }))
  const functions = props.filter((p) => p.kind === 'function').map((p): TreeItem => ({
    id: functionId(p.name, stage), kind: 'function', chip: 'ƒ', label: `${p.name}(${(p.params ?? []).join(', ')})`, note: '', stage, prop: p, children: [],
  }))
  return [...screens, ...functions]
}

/** The tree of model; title names the app. */
export function buildTree(model: AppModel, title: string): TreeItem {
  const stages = model.stages.map((s, i): TreeItem => ({
    id: `stage:${s.name}`, kind: 'stage', chip: String(i + 1), label: s.name, note: '', stage: s.name, children: propItems(s.props, s.name),
  }))
  const other: TreeItem[] = model.other.length
    ? [{ id: 'other', kind: 'other', chip: '{ }', label: 'Other code', note: `${model.other.length}`, children: [] }]
    : []
  return { id: 'app', kind: 'app', chip: 'app', label: title, note: '', children: [...propItems(model.app), ...stages, ...other] }
}

/** Every item, by id, with its parent's. */
export function indexTree(root: TreeItem): Map<string, { item: TreeItem, parent: TreeItem | null }> {
  const out = new Map<string, { item: TreeItem, parent: TreeItem | null }>()
  const walk = (item: TreeItem, parent: TreeItem | null) => {
    out.set(item.id, { item, parent })
    for (const c of item.children) walk(c, item)
  }
  walk(root, null)
  return out
}

/** The rows shown, in order (children of collapsed items left out). */
export function visibleItems(root: TreeItem, collapsed: Record<string, boolean>): TreeItem[] {
  const out: TreeItem[] = []
  const walk = (item: TreeItem) => {
    out.push(item)
    if (!collapsed[item.id]) item.children.forEach(walk)
  }
  walk(root)
  return out
}

/** The id of the item nearest to id that is in the tree: id itself, else the one it was in. */
export function nearest(id: string, has: (id: string) => boolean): string {
  while (!has(id)) {
    const dot = /^(.*\/\d+(?:\.\d+)*)\.\d+$/.exec(id)
    const cut = id.lastIndexOf('/')
    if (dot) id = dot[1]
    else if (cut > 0) id = id.slice(0, cut)
    else return 'app'
  }
  return id
}
