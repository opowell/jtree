import type { Treatment, StageInfo } from './parse'
import type { TreeNode } from './tree'

/*
 * A z-Tree treatment in z-Tree's own text format, as the server reads it
 * (server/source/editors/ztree.js): a tree of nodes, each with its settings
 * (`key = value;`), child nodes and programs' code (`do{ … }`), in the order
 * the file has them. Here it is shown as z-Tree's stage tree, and changed as
 * z-Tree changes a treatment: New Stage, New Box, New Item, … put an element
 * where the selection says, Cut, Copy and Paste move them, and the element's
 * dialog sets its settings.
 */

export interface ZValue { string?: string, raw?: string, pre?: string, post?: string }
export interface ZItem { key?: string, value?: ZValue, node?: ZNode, code?: string, text?: string }
export interface ZNode {
  kind: string
  name: string | null
  quoted?: boolean
  items: ZItem[]
  bom?: boolean
  trailing?: string
  eol?: string
}

/** A treatment window's z-Tree treatment (see zdocs.ts). */
export interface ZDoc {
  root: ZNode
  /** Where Save writes: the file, or for a treatment in z-Tree's binary format a .txt beside it. */
  savePath: string | null
  format: 'text' | 'binary'
  notes: string[]
  /** For a binary treatment: whether its .txt is there already. */
  savePathExists?: boolean
  undo: string[]
  redo: string[]
}

/* ------------------------------------------------------------- settings */

/** A setting's value as written: a text's text, or an expression. */
export function get(node: ZNode, key: string): string | undefined {
  const item = node.items.find((i) => i.key === key)
  if (!item?.value) return undefined
  return item.value.string ?? item.value.raw
}

export const isTrue = (node: ZNode, key: string) => /^true$/i.test(get(node, key) ?? '')

/** Sets a setting (a text if asText, else an expression), adding it after the other settings. */
export function set(node: ZNode, key: string, value: string, asText = false) {
  const item = node.items.find((i) => i.key === key)
  const v: ZValue = asText ? { string: value } : { raw: value }
  if (item) {
    // An expression keeps the spacing it was written with.
    if (!asText && item.value?.raw != null) item.value = { ...item.value, raw: value }
    else item.value = v
    return
  }
  let at = 0
  node.items.forEach((i, n) => { if (i.key) at = n + 1 })
  node.items.splice(at, 0, { key, value: v })
}

export function remove(node: ZNode, key: string) {
  node.items = node.items.filter((i) => i.key !== key)
}

export const childNodes = (node: ZNode) => node.items.filter((i) => i.node).map((i) => i.node!)
export const child = (node: ZNode, kind: string, name?: string) =>
  childNodes(node).find((c) => c.kind === kind && (name === undefined || c.name === name))

/** A program's (or a role's) code. */
export const code = (node: ZNode) => node.items.find((i) => i.code != null)?.code ?? ''

export function setCode(node: ZNode, text: string) {
  const item = node.items.find((i) => i.code != null)
  const value = text === '' || text.endsWith('\n') ? text : `${text}\n`
  if (item) item.code = value
  else node.items.push({ code: value })
}

/* ---------------------------------------------------------------- paths */

/** A node's place: the indexes of the items leading to it from the root. */
export type ZPath = number[]

export const pathId = (path: ZPath) => `z:${path.join('.')}`
export const idPath = (id: string): ZPath | null => (/^z:[\d.]*$/.test(id) ? (id === 'z:' ? [] : id.slice(2).split('.').map(Number)) : null)

export function at(root: ZNode, path: ZPath): ZNode | null {
  let node: ZNode | undefined = root
  for (const i of path) {
    node = node?.items[i]?.node
    if (!node) return null
  }
  return node
}

/* ------------------------------------------------------------ the kinds */

export const BOXES: Record<string, string> = {
  standardbox: 'Standard', headerbox: 'Header', helpbox: 'Help', containerbox: 'Container', calulatorbox: 'Calculator button',
  historybox: 'History', gridbox: 'Grid', makecontractbox: 'Contract creation', selectcontractbox: 'Contract list',
  contractgridbox: 'Contract grid', messagebox: 'Message', multimediabox: 'Multimedia', plotbox: 'Plot', chatterbox: 'Chat',
}

export const PLOTS: Record<string, string> = {
  plotpoint: 'Point', plotinput: 'Plot input', plotgraph: 'Plot graph', plottext: 'Plot text', plotline: 'Line', plotrect: 'Rect', plotpie: 'Pie', plotaxis: 'Axis',
}

const ITEM_BOXES = ['standardbox', 'helpbox', 'calulatorbox', 'historybox', 'gridbox', 'makecontractbox', 'selectcontractbox', 'contractgridbox', 'messagebox', 'chatterbox', 'headerbox']

/** What each kind of node holds, in the order it holds them. */
export const HOLDS: Record<string, string[][]> = {
  treatment: [['background'], ['stage'], ['roles'], ['period']],
  background: [['table'], ['tableloader', 'tabledumper', 'program', 'externalprogram'], ['screen']],
  stage: [['tableloader', 'tabledumper', 'program', 'externalprogram'], ['screen']],
  screen: [Object.keys(BOXES)],
  containerbox: [Object.keys(BOXES)],
  plotbox: [['program'], Object.keys(PLOTS).filter((k) => k !== 'plotinput')],
  plotgraph: [Object.keys(PLOTS).filter((k) => k !== 'plotgraph')],
  button: [['checker'], ['program']],
  ...Object.fromEntries(ITEM_BOXES.map((k) => [k, [['item'], ['program'], ['button']]])),
  ...Object.fromEntries(['plotpoint', 'plotline', 'plotrect', 'plotpie', 'plottext', 'plotaxis'].map((k) => [k, [['plotinput']]])),
  plotinput: [['program']],
}

const holds = (parent: string, kind: string) => (HOLDS[parent] ?? []).some((group) => group.includes(kind))
const rank = (parent: string, kind: string) => (HOLDS[parent] ?? []).findIndex((group) => group.includes(kind))

/**
 * Where a new node of kind goes, given the selection: into the selected node
 * if it holds that kind (after the others of its group), else after the
 * selected node or the nearest one above it whose parent holds it. Null if
 * nowhere above the selection does.
 */
export function placeFor(root: ZNode, selected: ZPath, kind: string): { parent: ZPath, index: number } | null {
  const node = at(root, selected)
  if (node && holds(node.kind, kind)) return { parent: selected, index: groupEnd(node, kind) }
  for (let depth = selected.length; depth > 0; depth--) {
    const parentPath = selected.slice(0, depth - 1)
    const parent = at(root, parentPath)!
    if (!holds(parent.kind, kind)) continue
    const r = rank(parent.kind, kind)
    const from = selected[depth - 1]
    // Selected is in a group after this kind's (a screen, for a new program): at the end of its group.
    if (rank(parent.kind, parent.items[from].node!.kind) > r) return { parent: parentPath, index: groupEnd(parent, kind) }
    // Else just after it, past settings and what comes before this kind.
    let index = from + 1
    while (index < parent.items.length && (!parent.items[index].node || rank(parent.kind, parent.items[index].node!.kind) < r)) index++
    return { parent: parentPath, index }
  }
  return null
}

/** Where the group of kind ends in parent: before the first node of a later group. */
function groupEnd(parent: ZNode, kind: string): number {
  const r = rank(parent.kind, kind)
  const later = parent.items.findIndex((item) => item.node && rank(parent.kind, item.node.kind) > r)
  return later === -1 ? parent.items.length : later
}

/* ------------------------------------------------------- new nodes */

const raw = (key: string, v: string): ZItem => ({ key, value: { raw: v } })
const text = (key: string, v: string): ZItem => ({ key, value: { string: v } })
const node = (kind: string, name: string | null, items: ZItem[], quoted = name != null): ZNode => ({ kind, name, quoted, items })
const T = 'TRUE'
const F = 'FALSE'

function screen(which: string): ZNode {
  return node('screen', which, [raw('usesbg', T), raw('withalertscreen', F), raw('noalertscreen', F)], false)
}

const boxBase = () => [raw('hasframe', T), raw('buttonposition', 'BOTTOMRIGHT'), raw('buttonsequence', 'HORIZONTAL')]

/** A new node of kind, with the settings z-Tree 5 gives a new one. */
export function newNode(kind: string, tables: string[] = []): ZNode {
  switch (kind) {
    case 'stage':
      return node('stage', 'stage', [raw('startwaitforall', T), text('startConditionStr', ''), raw('singleentry', F), raw('singleentrycontinuation', F),
        raw('timeouttype', 'ifnoinput'), raw('timeout', '30'), { node: screen('action') }, { node: screen('wait') }])
    case 'table': {
      let name = 'table'
      for (let i = 2; tables.includes(name); i++) name = `table${i}`
      return node('table', name, [raw('lifetime', 'PERIOD'), raw('execute', 'WITHEACH')], false)
    }
    case 'program': return node('program', null, [raw('table', 'subjects'), { code: '' }])
    case 'externalprogram': return node('externalprogram', null, [raw('table', 'globals'), text('filename', ''), raw('condition', T)])
    case 'tableloader': return node('tableloader', null, [raw('condition', T), text('inputreplacefilename', '')])
    case 'tabledumper': return node('tabledumper', null, [raw('condition', T), text('outputfilename', ''), text('tabledescriptions', '')])
    case 'standardbox': return node(kind, 'Standard', boxBase())
    case 'headerbox':
      return node(kind, 'Header', [raw('hasframe', T), raw('height', '10%'), raw('top', '0p'), raw('cuttop', T), raw('showPeriods', T), raw('showNumPeriods', T),
        text('periodtext', 'Period'), text('periodoftext', 'of'), text('practiceperiodprefix', 'Trial '), raw('showtime', T),
        text('timestr', 'Remaining time [sec]:'), text('pleasedecidetext', 'Please reach a decision.')])
    case 'helpbox': return node(kind, 'Help', [...boxBase(), text('label', 'Help'), text('help', '')])
    case 'containerbox': return node(kind, 'Container', [raw('hasframe', F)])
    case 'makecontractbox': return node(kind, 'Contract creation', [...boxBase(), raw('table', 'contracts')])
    case 'selectcontractbox': return node(kind, 'Contract list', [...boxBase(), raw('table', 'contracts'), raw('condition', T), text('sortfields', ''), raw('ownervariable', 'Owner')])
    case 'chatterbox': return node(kind, 'Chat', [...boxBase(), raw('table', 'contracts'), raw('inputvariable', 'Message'), text('outputtext', '<>< Owner|!text: 1="";>: < Message|-1>')])
    case 'plotbox': return node(kind, 'Plot', [raw('hasframe', T), raw('xleft', '0'), raw('xright', '100'), raw('ybottom', '0'), raw('ytop', '100'), raw('maintainaspectratio', F)])
    case 'item': return node('item', null, [text('label', ''), raw('variable', ''), text('format', '1'), raw('input', F)])
    case 'button':
      return node('button', 'OK', [raw('clearinputafterok', F), raw('norecordmadeorselected', F), raw('terminatestage', F), raw('donotterminatestage', F),
        raw('specialbuttoncolor', F), raw('buttoncolor', '0')])
    case 'checker': return node('checker', null, [raw('condition', T), text('message', ''), text('yesButtonStr', ''), text('noButtonStr', 'OK')])
    case 'plotpoint': return node(kind, '', [raw('x', '50'), raw('y', '50'), raw('size', '4'), raw('numedges', '0'), raw('startat', '0'), raw('isstar', F), raw('linecolor', 'rgb(0,0,0)'), raw('linewidth', '1'), raw('fillcolor', 'rgb(0,0,1)')])
    case 'plotline': return node(kind, '', [raw('x1', '0'), raw('y1', '0'), raw('x2', '100'), raw('y2', '100'), raw('linecolor', 'rgb(0,0,0)'), raw('linewidth', '1')])
    case 'plotrect': return node(kind, '', [raw('left', '10'), raw('right', '90'), raw('bottom', '10'), raw('top', '90'), raw('linecolor', 'rgb(0,0,0)'), raw('linewidth', '1'), raw('fillcolor', 'rgb(1,1,1)')])
    case 'plotpie': return node(kind, '', [raw('x', '50'), raw('y', '50'), raw('xradius', '20'), raw('yradius', '20'), raw('anglestart', '0'), raw('anglesize', '90'), raw('linecolor', 'rgb(0,0,0)'), raw('linewidth', '1'), raw('fillcolor', 'rgb(1,0,0)')])
    case 'plottext': return node(kind, '', [text('text', 'text'), raw('x', '50'), raw('y', '50'), raw('horizontalalignment', 'CENTER'), raw('verticalalignment', 'CENTER'), raw('textcolor', 'rgb(0,0,0)')])
    case 'plotaxis': return node(kind, '', [raw('axis', 'X'), raw('position', '0'), raw('from', '0'), raw('to', '100'), raw('tickdistance', '10'), raw('datalabeldistance', '10'), text('datalabelformat', '1'), text('caption', ''), raw('linecolor', 'rgb(0,0,0)'), raw('linewidth', '1')])
    case 'plotgraph': return node(kind, '', [raw('table', 'subjects'), raw('condition', T), raw('filltoxaxis', F), raw('connecttopreviouspoint', F)])
    case 'plotinput': return node(kind, '', [raw('displaycondition', T), raw('event', 'LEFTCLICK'), text('key', ' '), raw('action', 'NEW'), raw('table', 'subjects'), raw('xvariable', 'X'), raw('yvariable', 'Y'), raw('leavestage', F)])
    default:
      if (BOXES[kind]) return node(kind, BOXES[kind], boxBase())
      return node(kind, null, [])
  }
}

/* ---------------------------------------------------------- tree view */

const TREE_KIND: Record<string, TreeNode['kind']> = {
  background: 'background', stage: 'stage', table: 'table', program: 'program', externalprogram: 'program',
  tableloader: 'program', tabledumper: 'program', item: 'item', checker: 'item', button: 'button',
}

/** A node as the stage tree labels it. */
function label(n: ZNode): { label: string, note?: string } {
  switch (n.kind) {
    case 'background': return { label: 'Background' }
    case 'table': return { label: n.name ?? 'table', note: get(n, 'lifetime') && get(n, 'lifetime') !== 'PERIOD' ? `(${get(n, 'lifetime')!.toLowerCase()})` : undefined }
    case 'stage': {
      const timeout = (get(n, 'timeout') ?? '').trim() || '-1'
      const type = get(n, 'timeouttype')
      return { label: n.name ?? '', note: `${isTrue(n, 'startwaitforall') ? '=|=' : '-='} (${timeout})${type === 'always' ? 'A' : type === 'never' ? 'N' : ''}` }
    }
    case 'program': {
      const owner = get(n, 'ownervariable')
      const condition = get(n, 'condition')
      return { label: `${get(n, 'table') || 'globals'}.do { … }`, note: condition ? `if ${condition}` : owner ? `owner ${owner}` : undefined }
    }
    case 'externalprogram': return { label: `external program ${get(n, 'filename') ?? ''}` }
    case 'tableloader': return { label: `table loader ${get(n, 'inputreplacefilename') ?? ''}` }
    case 'tabledumper': return { label: `table dumper ${get(n, 'outputfilename') ?? ''}` }
    case 'screen': return { label: n.name === 'wait' ? 'Waitingscreen' : 'Active screen' }
    case 'item': {
      const v = get(n, 'variable') ?? ''
      const l = get(n, 'label') ?? ''
      return v ? { label: `${isTrue(n, 'input') ? 'IN' : 'OUT'}( ${v} )`, note: l || undefined } : { label: `"${l.length > 60 ? `${l.slice(0, 57)}…` : l}"` }
    }
    case 'checker': return { label: `Checker: ${get(n, 'condition') ?? ''}`, note: get(n, 'message') || undefined }
    case 'button': return { label: n.name ?? 'OK' }
    default:
      // As z-Tree names its boxes: a box's name, or its kind ("Contract creation box"); the kind after a name.
      if (BOXES[n.kind]) return { label: n.name || `${BOXES[n.kind]} box`, note: n.name && n.kind !== 'standardbox' && n.name !== BOXES[n.kind] ? `${BOXES[n.kind]} box` : undefined }
      if (PLOTS[n.kind]) return { label: PLOTS[n.kind], note: n.name || undefined }
      return { label: n.kind + (n.name ? ` ${n.name}` : '') }
  }
}

const HIDDEN = new Set(['roles', 'period', 'questionnaire'])

function view(n: ZNode, path: ZPath): TreeNode {
  const id = pathId(path)
  const { label: l, note } = label(n)
  const children: TreeNode[] = []
  n.items.forEach((item, i) => {
    if (item.node && !HIDDEN.has(item.node.kind)) children.push(view(item.node, [...path, i]))
  })
  // A program's lines, as z-Tree lists them under it.
  if (n.kind === 'program') {
    const lines = code(n).split('\n').map((x) => x.trim()).filter((x) => x && x !== '{' && x !== '}')
    lines.slice(0, 24).forEach((line, i) => children.push({ id: `${id}:line${i}`, kind: 'line', label: line.length > 90 ? `${line.slice(0, 87)}…` : line, children: [] }))
    if (lines.length > 24) children.push({ id: `${id}:more`, kind: 'line', label: `… ${lines.length - 24} more lines`, children: [] })
  }
  const kind: TreeNode['kind'] = TREE_KIND[n.kind] ?? (n.kind === 'screen' ? (n.name === 'wait' ? 'waiting' : 'active') : 'box')
  return { id, kind, label: l, note, children, zpath: path.join('.') }
}

/** The treatment as the interface's Treatment: its stage tree (the source is the tree as JSON). */
export function zTreatment(root: ZNode, name: string): Treatment {
  const stages: StageInfo[] = []
  root.items.forEach((item) => {
    if (item.node?.kind === 'stage') {
      stages.push({ id: item.node.name ?? '', varName: '', decl: { start: 0, end: 0 }, nameRange: { start: 0, end: 0 }, span: { start: 0, end: 0 }, props: {} })
    }
  })
  const children: TreeNode[] = []
  root.items.forEach((item, i) => {
    if (item.node && !HIDDEN.has(item.node.kind)) children.push(view(item.node, [i]))
  })
  const source = JSON.stringify(root)
  return { source, error: null, appProps: {}, stages, tree: { id: 'root', kind: 'background', label: name, children }, end: source.length }
}

/** The tables a treatment has (its background's), for the program dialog. */
export function tablesOf(root: ZNode): string[] {
  const bg = child(root, 'background')
  return bg ? childNodes(bg).filter((c) => c.kind === 'table' && c.name).map((c) => c.name!) : []
}

/**
 * The parameter table (roles, and a period with a subject row each) made to fit
 * the background's number of subjects and periods, as z-Tree keeps it.
 */
export function fitParameterTable(root: ZNode) {
  const bg = child(root, 'background')
  if (!bg) return
  const subjects = Math.max(1, Math.round(Number(get(bg, 'numsubjects')) || 1))
  const periods = Math.max(1, Math.round((Number(get(bg, 'numpracticeperiods')) || 0) + (Number(get(bg, 'numactualperiods')) || 1)))
  let roles = child(root, 'roles')
  if (!roles) {
    roles = node('roles', null, [], false)
    const lastStage = root.items.reduce((n, item, i) => (item.node && ['background', 'stage'].includes(item.node.kind) ? i : n), 0)
    root.items.splice(lastStage + 1, 0, { node: roles })
  }
  const roleItems = roles.items.filter((i) => i.node?.kind === 'role')
  for (let s = roleItems.length; s < subjects; s++) roles.items.push({ node: node('role', `S ${s + 1}`, []) })
  if (roleItems.length > subjects) {
    const keep = new Set(roleItems.slice(0, subjects))
    roles.items = roles.items.filter((i) => i.node?.kind !== 'role' || keep.has(i))
  }
  const periodItems = root.items.filter((i) => i.node?.kind === 'period')
  for (let p = periodItems.length; p < periods; p++) {
    const item = { node: node('period', String(p + 1), [text('prompt', '')]) }
    root.items.push(item)
    periodItems.push(item)
  }
  if (periodItems.length > periods) {
    const drop = new Set(periodItems.slice(periods))
    root.items = root.items.filter((i) => !drop.has(i))
  }
  for (const item of periodItems.slice(0, periods)) {
    const period = item.node!
    const rows = period.items.filter((i) => i.node?.kind === 'subject')
    for (let s = rows.length; s < subjects; s++) period.items.push({ node: node('subject', String(s + 1), [text('name', ''), raw('group', '1')], false) })
    if (rows.length > subjects) {
      const drop = new Set(rows.slice(subjects))
      period.items = period.items.filter((i) => !drop.has(i))
    }
  }
}

export const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T
