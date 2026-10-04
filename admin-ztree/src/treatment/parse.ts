import { parse as acornParse } from 'acorn'
import type { Node as AcornNode } from 'acorn'
import { screenBoxes } from './screen'
import type { ItemInfo } from './screen'

/*
 * A jtree app read as a z-Tree treatment.
 *
 * z-Tree shows a treatment as its stage tree: a Background holding the tables,
 * the programs run at the start of every period and the screens every stage
 * shares, then one branch per stage holding its programs, its active screen
 * and its waiting screen. A jtree app is a script that builds the same things
 * — `app.newStage(...)`, `stage.activeScreen = ...`, `stage.playerStart = ...`
 * — so its top-level statements are sorted into that tree here. Every node
 * remembers the stretch of source it came from, which is what lets a dialog
 * change it and the file be written back.
 */

export interface Range {
  start: number
  end: number
}

export type NodeKind =
  | 'background' | 'table' | 'program' | 'active' | 'waiting'
  | 'box' | 'item' | 'button' | 'line' | 'stage' | 'error'

export interface TreeNode {
  id: string
  kind: NodeKind
  label: string
  /** Trailing grey text: a stage's options, the jtree hook a program is. */
  note?: string
  children: TreeNode[]
  /** The whole statement(s) the node is: what Cut and Copy take. */
  stmt?: Range
  /** The part its dialog edits: a function body, a screen's HTML. */
  body?: Range
  /** The stage this node is in, by the variable the app holds it in. */
  stageVar?: string
  /** For a program, the table its code runs on. */
  table?: string
  /** For a program, the jtree hook (`playerStart`, …). */
  hook?: string
  item?: ItemInfo
}

export interface StageProp {
  stmt: Range
  value: Range
  text: string
}

export interface StageInfo {
  id: string
  varName: string
  /** The `var x = app.newStage('id')` statement. */
  decl: Range
  /** The string literal naming the stage, quotes included. */
  nameRange: Range
  /** Every statement about this stage, first to last. */
  span: Range
  props: Record<string, StageProp>
}

export interface Treatment {
  source: string
  error: { message: string, line: number, column: number } | null
  /** `app.x = value` assignments, by property. */
  appProps: Record<string, StageProp>
  stages: StageInfo[]
  tree: TreeNode
  /** Where a new stage goes when nothing is selected: after the last statement. */
  end: number
}

/** The tables every treatment has, as z-Tree lists them under the Background. */
export const TABLES = [
  'globals', 'subjects', 'groups', 'summary', 'contracts',
  'clients', 'treatments', 'logfile', 'sessionglobals', 'participations',
]

/** What z-Tree's tables are called in jtree, for the table dialog. */
export const TABLE_LIFETIMES: Record<string, string> = {
  globals: 'Period', subjects: 'Period', groups: 'Period', summary: 'Treatment', contracts: 'Period',
  clients: 'Session', treatments: 'Session', logfile: 'Session', sessionglobals: 'Session', participations: 'Session',
}

/** Which table each jtree stage hook runs on, and whether it runs at the start. */
const HOOKS: Record<string, { table: string, start: boolean }> = {
  canPlayerParticipate: { table: 'subjects', start: true },
  canGroupParticipate: { table: 'groups', start: true },
  canGroupStart: { table: 'groups', start: true },
  groupStart: { table: 'groups', start: true },
  playerStart: { table: 'subjects', start: true },
  playerEnd: { table: 'subjects', start: false },
  groupEnd: { table: 'groups', start: false },
  canGroupEnd: { table: 'groups', start: false },
}

/** Defaults a jtree app starts with, shown when an app does not set its own. */
const DEFAULT_WAITING_SCREEN = '<p>WAITING</p>\n<p>The experiment will continue soon.</p>'

type Any = AcornNode & Record<string, any>

export function parseTreatment(source: string, name: string): Treatment {
  const background: TreeNode = {
    id: 'bg',
    kind: 'background',
    label: 'Background',
    children: TABLES.map((table) => ({ id: `table:${table}`, kind: 'table', label: table, table, children: [] })),
  }
  const result: Treatment = { source, error: null, appProps: {}, stages: [], tree: background, end: source.length }

  let program: Any
  try {
    program = acornParse(source, {
      ecmaVersion: 'latest',
      sourceType: 'script',
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
      allowHashBang: true,
    }) as Any
  } catch (err) {
    const e = err as SyntaxError & { loc?: { line: number, column: number } }
    result.error = { message: e.message, line: e.loc?.line ?? 0, column: e.loc?.column ?? 0 }
    background.children.push({ id: 'error', kind: 'error', label: `Syntax error: ${e.message}`, children: [] })
    return { ...result, tree: { id: 'root', kind: 'background', label: name, children: [background] } }
  }

  const stagesByVar = new Map<string, StageInfo>()
  const stageNodes = new Map<string, TreeNode>()
  const stageOrder: TreeNode[] = []
  // Background statements that are neither screens nor stages, gathered into
  // programs while they run on unbroken; a stage in between starts a new one.
  let pending: Any[] = []
  const bgPrograms: TreeNode[] = []
  let bgActive: TreeNode | null = null
  let bgWaiting: TreeNode | null = null

  const flush = () => {
    if (!pending.length) return
    const stmt = { start: pending[0].start, end: pending[pending.length - 1].end }
    bgPrograms.push({
      id: `bgprog:${stmt.start}`,
      kind: 'program',
      label: 'globals.do { … }',
      table: 'globals',
      stmt,
      body: stmt,
      children: codeLines(source.slice(stmt.start, stmt.end), `bgprog:${stmt.start}`),
    })
    pending = []
  }

  result.end = program.body.length ? program.body[program.body.length - 1].end : source.length

  for (const statement of program.body as Any[]) {
    const declared = stageDeclaration(statement)
    if (declared) {
      flush()
      const info: StageInfo = {
        id: declared.id,
        varName: declared.varName,
        decl: { start: statement.start, end: statement.end },
        nameRange: declared.nameRange,
        span: { start: statement.start, end: statement.end },
        props: {},
      }
      result.stages.push(info)
      if (declared.varName) stagesByVar.set(declared.varName, info)
      const node: TreeNode = {
        id: `stage:${info.varName || info.id}:${statement.start}`,
        kind: 'stage',
        label: info.id,
        stageVar: info.varName,
        stmt: info.span,
        children: [],
      }
      stageNodes.set(info.varName, node)
      stageOrder.push(node)
      continue
    }

    const assignment = memberAssignment(statement)
    if (assignment && assignment.object === 'app') {
      const prop: StageProp = {
        stmt: { start: statement.start, end: statement.end },
        value: { start: assignment.value.start, end: assignment.value.end },
        text: source.slice(assignment.value.start, assignment.value.end),
      }
      result.appProps[assignment.property] = prop
      if (assignment.property === 'activeScreen' || assignment.property === 'waitingScreen') {
        flush()
        const isActive = assignment.property === 'activeScreen'
        const node = screenNode(source, isActive ? 'active' : 'waiting', 'bg', assignment.value, prop.stmt)
        if (isActive) bgActive = node
        else bgWaiting = node
      } else {
        pending.push(statement)
      }
      continue
    }

    if (assignment && stagesByVar.has(assignment.object)) {
      const info = stagesByVar.get(assignment.object)!
      const stmt = { start: statement.start, end: statement.end }
      info.props[assignment.property] = {
        stmt,
        value: { start: assignment.value.start, end: assignment.value.end },
        text: source.slice(assignment.value.start, assignment.value.end),
      }
      info.span = { start: info.span.start, end: Math.max(info.span.end, statement.end) }
      continue
    }

    pending.push(statement)
  }
  flush()

  // Each stage's branch, now that every statement about it has been seen.
  for (const info of result.stages) {
    const node = stageNodes.get(info.varName)!
    node.stmt = info.span
    node.note = stageNotation(info)
    node.children = stageChildren(source, info, node.id)
  }

  background.children.push(...bgPrograms)
  background.children.push(bgActive ?? emptyScreen('active', 'bg'))
  background.children.push(bgWaiting ?? defaultWaitingScreen())

  return {
    ...result,
    tree: { id: 'root', kind: 'background', label: name, children: [background, ...stageOrder] },
  }
}

/** z-Tree's shorthand for a stage's options, as the stage tree prints it after the name. */
export function stageNotation(info: StageInfo): string {
  const waitToStart = info.props.waitToStart ? info.props.waitToStart.text.trim() !== 'false' : true
  const duration = Number(info.props.duration?.text ?? 0)
  let out = `${waitToStart ? '=|' : '-'}=`
  if (duration > 0) out += ` (${duration})A`
  return out
}

function stageChildren(source: string, info: StageInfo, parentId: string): TreeNode[] {
  const start: TreeNode[] = []
  const end: TreeNode[] = []
  let active: TreeNode | null = null
  let waiting: TreeNode | null = null

  for (const [property, prop] of Object.entries(info.props)) {
    if (property === 'activeScreen' || property === 'waitingScreen') {
      const kind = property === 'activeScreen' ? 'active' : 'waiting'
      const node = screenNode(source, kind, parentId, prop.value, prop.stmt, info.varName)
      if (kind === 'active') active = node
      else waiting = node
      continue
    }
    const fn = functionBody(source, prop.value)
    if (!fn) continue
    const hook = HOOKS[property] ?? { table: 'globals', start: false }
    const id = `${parentId}:${property}`
    const node: TreeNode = {
      id,
      kind: 'program',
      label: `${hook.table}.do { … }`,
      note: property,
      table: hook.table,
      hook: property,
      stageVar: info.varName,
      stmt: prop.stmt,
      body: fn,
      children: codeLines(source.slice(fn.start, fn.end), id),
    }
    ;(hook.start ? start : end).push(node)
  }

  return [
    ...start,
    active ?? emptyScreen('active', parentId, info.varName),
    ...end,
    waiting ?? emptyScreen('waiting', parentId, info.varName),
  ]
}

function screenNode(source: string, kind: 'active' | 'waiting', parentId: string, value: Range, stmt: Range, stageVar?: string): TreeNode {
  const id = `${parentId}:${kind}`
  const html = literalText(source, value)
  const node: TreeNode = {
    id,
    kind,
    label: kind === 'active' ? 'Active screen' : 'Waitingscreen',
    stageVar,
    stmt,
    children: [],
  }
  if (html == null) {
    node.note = source.slice(value.start, value.end)
    return node
  }
  node.body = { start: value.start + 1, end: value.end - 1 }
  node.children = screenBoxes(html, id)
  return node
}

function emptyScreen(kind: 'active' | 'waiting', parentId: string, stageVar?: string): TreeNode {
  return {
    id: `${parentId}:${kind}`,
    kind,
    label: kind === 'active' ? 'Active screen' : 'Waitingscreen',
    stageVar,
    children: kind === 'active' && parentId === 'bg'
      ? [{ id: 'bg:active:header', kind: 'box', label: 'Header', children: [] }]
      : [],
  }
}

function defaultWaitingScreen(): TreeNode {
  return {
    id: 'bg:waiting',
    kind: 'waiting',
    label: 'Waitingscreen',
    children: screenBoxes(DEFAULT_WAITING_SCREEN, 'bg:waiting'),
  }
}

/* ------------------------------------------------------- statement shapes */

/** `var x = app.newStage('id')`, or the call on its own. */
function stageDeclaration(statement: Any): { id: string, varName: string, nameRange: Range } | null {
  let call: Any | null = null
  let varName = ''
  if (statement.type === 'VariableDeclaration' && statement.declarations.length === 1) {
    const declaration = statement.declarations[0]
    if (declaration.id.type === 'Identifier') varName = declaration.id.name
    call = declaration.init
  } else if (statement.type === 'ExpressionStatement') {
    call = statement.expression
  }
  if (!call || call.type !== 'CallExpression') return null
  const callee = call.callee
  if (callee.type !== 'MemberExpression' || callee.object.type !== 'Identifier' || callee.object.name !== 'app') return null
  if (propertyName(callee) !== 'newStage') return null
  const arg = call.arguments[0]
  if (!arg || arg.type !== 'Literal' || typeof arg.value !== 'string') return null
  return { id: arg.value, varName, nameRange: { start: arg.start, end: arg.end } }
}

/** `object.property = value;` */
function memberAssignment(statement: Any): { object: string, property: string, value: Any } | null {
  if (statement.type !== 'ExpressionStatement') return null
  const expression = statement.expression
  if (expression.type !== 'AssignmentExpression' || expression.operator !== '=') return null
  const left = expression.left
  if (left.type !== 'MemberExpression' || left.object.type !== 'Identifier') return null
  const property = propertyName(left)
  if (!property) return null
  return { object: left.object.name, property, value: expression.right }
}

function propertyName(member: Any): string | null {
  if (!member.computed && member.property.type === 'Identifier') return member.property.name
  if (member.computed && member.property.type === 'Literal') return String(member.property.value)
  return null
}

/** The inside of a function's braces, or null when the value is not a function. */
function functionBody(source: string, value: Range): Range | null {
  const text = source.slice(value.start, value.end)
  if (!/^\s*(async\s+)?(function\b|\([^)]*\)\s*=>|[\w$]+\s*=>)/.test(text)) return null
  try {
    const expression = acornParse(`(${text})`, { ecmaVersion: 'latest' }) as Any
    const fn = expression.body[0].expression
    if (fn.body.type !== 'BlockStatement') {
      // An arrow with an expression body: the expression is the body.
      return { start: value.start + fn.body.start - 1, end: value.start + fn.body.end - 1 }
    }
    return { start: value.start + fn.body.start, end: value.start + fn.body.end - 2 }
  } catch {
    return null
  }
}

/** The text a string or template literal holds, or null for anything else. */
function literalText(source: string, value: Range): string | null {
  const text = source.slice(value.start, value.end)
  const quote = text[0]
  if ((quote === '`' || quote === '"' || quote === "'") && text[text.length - 1] === quote) {
    return text.slice(1, -1)
  }
  return null
}

/** A program's code, one tree line per line, as z-Tree lists it under the program. */
function codeLines(code: string, parentId: string): TreeNode[] {
  const lines = code.split('\n').map((line) => line.trim()).filter((line) => line && line !== '{' && line !== '}')
  const shown = lines.slice(0, 24).map((line, index) => ({
    id: `${parentId}:line${index}`,
    kind: 'line' as const,
    label: line.length > 90 ? `${line.slice(0, 87)}…` : line,
    children: [],
  }))
  if (lines.length > shown.length) {
    shown.push({ id: `${parentId}:more`, kind: 'line', label: `… ${lines.length - shown.length} more lines`, children: [] })
  }
  return shown
}

/* ----------------------------------------------------------------- edits */

export function replaceRange(source: string, range: Range, text: string): string {
  return source.slice(0, range.start) + text + source.slice(range.end)
}

/** Sets `<stage>.<prop> = <value>;`, adding the statement after the stage's declaration if it is not there. */
export function setStageProp(source: string, stage: StageInfo, prop: string, value: string): string {
  const existing = stage.props[prop]
  if (existing) return replaceRange(source, existing.value, value)
  if (!stage.varName) return source
  const at = stage.decl.end
  return `${source.slice(0, at)}\n${stage.varName}.${prop} = ${value};${source.slice(at)}`
}

/** Sets `app.<prop> = <value>;`, adding the statement at the top if it is not there. */
export function setAppProp(source: string, treatment: Treatment, prop: string, value: string): string {
  const existing = treatment.appProps[prop]
  if (existing) return replaceRange(source, existing.value, value)
  return `app.${prop} = ${value};\n${source}`
}

/** A JavaScript identifier made from a stage name. */
export function stageVariable(name: string, taken: Set<string>): string {
  let base = name.replace(/[^\w$]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : '')).replace(/^\d/, '_$&') || 'stage'
  base = base[0].toLowerCase() + base.slice(1)
  let candidate = base
  for (let i = 2; taken.has(candidate); i++) candidate = `${base}${i}`
  return candidate
}

export function newStageCode(name: string, variable: string): string {
  return `

var ${variable} = app.newStage(${JSON.stringify(name)});
${variable}.activeScreen = \`
<p>${name}</p>
<form>
    <button>OK</button>
</form>
\`;
`
}
