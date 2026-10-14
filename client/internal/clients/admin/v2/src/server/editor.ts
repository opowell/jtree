import { serverUrl } from './connection'

/*
 * jtree's app editor asks the server (server/source/editors/jtree.js, at /api/editor/jtree/...)
 * to read an app's source into its settings and stages, to make edits in the source, and to
 * write it. The server changes only the part of the source an edit is about.
 */

export interface Range { start: number, end: number }

/** A value as the editor shows it, and as it sends one back to set (without code then). */
export interface Value {
  kind: 'number' | 'boolean' | 'string' | 'text' | 'function' | 'code' | 'null'
  code?: string
  value?: unknown
  params?: string[]
  body?: string
  /** A screen's (kind text) elements, with ranges in value. */
  nodes?: ScreenNode[]
}

/** An element, text or comment of a screen, as the server reads it (server/source/editors/html.js). */
export interface ScreenNode {
  type: 'element' | 'text' | 'comment'
  tag?: string
  attrs?: Array<{ name: string, value: string | null }>
  text?: string
  range: Range
  /** An element's content: between its tags. */
  inner?: Range | null
  children?: ScreenNode[]
}

/** A change to a screen; path is the node's indexes into children, from the top. */
export type ScreenEdit =
  | { do: 'insert', path?: number[], where?: 'before' | 'after' | 'inside', html: string }
  | { do: 'remove', path: number[] }
  | { do: 'move', path: number[], by: -1 | 1 }
  | { do: 'replace', path: number[], html: string }
  | { do: 'setContent', path: number[], html: string }
  | { do: 'setAttr', path: number[], name: string, value?: string | null, remove?: boolean }

export interface Prop extends Value {
  name: string
  range: Range
  valueRange: Range
}

export interface Stage {
  name: string
  varName: string
  props: Prop[]
}

export interface AppModel {
  error: { message: string, line: number, column: number } | null
  app: Prop[]
  stages: Stage[]
  other: Array<{ code: string, range: Range }>
  otherStages: boolean
  stageHooks: Record<string, string[]>
  appHooks: Record<string, string[]>
}

export interface Opened { appPath: string, source: string, model: AppModel }

export type Edit =
  | { op: 'setAppProp', name: string, value: Value }
  | { op: 'removeAppProp', name: string }
  | { op: 'addStage', name: string, after?: string }
  | { op: 'renameStage', name: string, to: string }
  | { op: 'deleteStage', name: string }
  | { op: 'moveStage', name: string, to: number }
  | { op: 'setStageProp', stage: string, name: string, value: Value }
  | { op: 'removeStageProp', stage: string, name: string }
  | { op: 'editScreen', stage?: string, name: string, edit: ScreenEdit }

/** Calls an editor action; rejects with the server's message if it refuses. */
export async function editorCall<T>(dialect: string, action: string, body: unknown): Promise<T> {
  const res = await fetch(`${serverUrl}/api/editor/${dialect}/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({ error: `${res.status} ${res.statusText}` }))
  if (!res.ok) throw new Error(data.error ?? `${res.status} ${res.statusText}`)
  return data as T
}

export const jtreeEditor = {
  open: (appPath: string) => editorCall<Opened>('jtree', 'open', { appPath }),
  model: (source: string) => editorCall<{ model: AppModel }>('jtree', 'model', { source }),
  apply: (source: string, op: Edit) => editorCall<{ source: string, model: AppModel }>('jtree', 'apply', { source, op }),
  save: (appPath: string, source: string) => editorCall<{ appPath: string }>('jtree', 'save', { appPath, source }),
  create: (appPath: string, description: string) => editorCall<Opened>('jtree', 'create', { appPath, description }),
}

/** Settings jtree reads from an app, with the kind of value each takes, for "Add a setting". */
export const APP_SETTINGS: Record<string, Value['kind']> = {
  description: 'string', numPeriods: 'number', groupSize: 'number', numGroups: 'number', suggestedNumPlayers: 'number',
  groupMatchingType: 'string', groupByArrival: 'boolean', stageWaitToStart: 'boolean', stageWaitToEnd: 'boolean',
  stageTimeoutGrace: 'number', exchangeRate: 'number', periodText: 'string', activeScreen: 'text', waitingScreen: 'text',
}

/** Settings jtree reads from a stage. */
export const STAGE_SETTINGS: Record<string, Value['kind']> = {
  duration: 'number', clientDuration: 'number', showTimer: 'boolean', endOnTimeout: 'boolean', waitToStart: 'boolean',
  waitToEnd: 'boolean', waitForAllGroups: 'boolean', timeoutGrace: 'number', repetitions: 'number', useAppActiveScreen: 'boolean',
  useAppWaitingScreen: 'boolean', addOKButtonIfNone: 'boolean', updateObject: 'string',
}

/** What each setting does, as a hint beside it. */
export const SETTING_HINTS: Record<string, string> = {
  numPeriods: 'How many times the stages repeat.',
  groupSize: 'Players per group; leave out for one group of everyone.',
  groupMatchingType: 'STRANGER (new groups each period) or PARTNER_FIXED.',
  duration: 'Seconds the group has for this stage; 0 for no limit.',
  clientDuration: 'Seconds each player has, from when they start it; 0 for no limit.',
  waitToStart: 'The stage starts when the whole group is there.',
  waitToEnd: 'Players wait for their group at the end of the stage.',
  activeScreen: 'What players see while they play this stage (HTML, with {{ }} for values).',
  waitingScreen: 'What players see while they wait.',
}

/** A value of kind, empty, to add. */
export function emptyValue(kind: Value['kind'], params: string[] = []): Value {
  switch (kind) {
    case 'number': return { kind, value: 0 }
    case 'boolean': return { kind, value: true }
    case 'string': return { kind, value: '' }
    case 'text': return { kind, value: '<p></p>' }
    case 'function': return { kind, params, body: '' }
    default: return { kind: 'code', code: 'null' }
  }
}
