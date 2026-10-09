import type { Range, TreeNode } from './tree'
import type { StageInfo, StageProp, Treatment } from './parse'

/*
 * A z-Tree treatment (a .ztt file, as the server reads it: server/source/dialects/ztree/ztt.js)
 * as this interface shows treatments: its stage tree, as z-Tree draws it (Background with its
 * tables, programs and screens; each stage with its programs, Active screen and Waiting screen;
 * boxes, items, buttons with their checkers and programs), read only.
 *
 * The dialogs show a program's code, and a stage's options, from a document's source: a
 * treatment from z-Tree has none, so it gets a listing of its programs and stages, which its
 * nodes point into.
 */

/** z-Tree's tables, as it lists them under the Background. */
const ZTREE_TABLES = ['globals', 'subjects', 'summary', 'contracts', 'session', 'logfile']

const BOX_NAMES: Record<string, string> = {
  standard: 'Standard box', header: 'Header box', help: 'Help box', container: 'Container box',
  contractList: 'Contract list box', contractCreation: 'Contract creation box', history: 'History box',
  grid: 'Contract grid box', chat: 'Chat box', calculator: 'Calculator button box', message: 'Message box',
  plot: 'Plot box', multimedia: 'Multimedia box', unknown: 'Box',
}

export interface ZttProgram { table: string, owner: string, condition: string, code: string }
export interface ZttItem { kind: 'item' | 'checker', label: string, variable?: string, input?: boolean, min?: string, max?: string, layout?: string, condition?: string, message?: string }
export interface ZttButton { name: string, checkers: ZttItem[], programs: ZttProgram[] }
export interface ZttBox {
  type: string, name: string, items: ZttItem[], buttons: ZttButton[], boxes: ZttBox[], programs: ZttProgram[]
  condition?: string, width?: string, height?: string, table?: string, tableCondition?: string, sorting?: string
}
export interface ZttStage {
  name: string, programs: ZttProgram[], timeout: string, options: number[], showHeader: boolean, active: ZttBox[], waiting: ZttBox[]
}
export interface ZttTreatment {
  version: number
  stages: ZttStage[]
  background: ZttStage
  periods: Array<{ name: string, program: string }>
  subjects: Array<{ name: string, program?: string }>
  params: Array<{ label: string, group: number, program: string }>
}

/** Whether a stage starts for each subject as they get to it (z-Tree's "start if possible"). */
export const startsIfPossible = (stage: ZttStage) => (stage.options[0] & 1) === 1

/** The treatment as this interface's Treatment: its tree, and a listing for the dialogs. */
export function zttTreatment(t: ZttTreatment, name: string): Treatment {
  let source = ''
  const append = (text: string): Range => {
    const start = source.length
    source += text
    return { start, end: source.length }
  }
  let n = 0
  const id = (prefix: string) => `${prefix}:${++n}`

  const programNode = (p: ZttProgram, where: string): TreeNode => {
    append(`// ${where}: a program on ${p.table}${p.owner ? `, owner ${p.owner}` : ''}${p.condition ? `, if ${p.condition}` : ''}\n`)
    const body = append(`${p.code.trim()}\n`)
    append('\n')
    const lines = p.code.split('\n').map((l) => l.replace(/\s+$/, '')).filter((l) => l.trim() !== '')
    return {
      id: id('program'),
      kind: 'program',
      label: `${p.table}.do { … }`,
      note: p.condition ? `if ${p.condition}` : p.owner ? `owner ${p.owner}` : undefined,
      table: p.table,
      body,
      stmt: body,
      children: lines.map((line) => ({ id: id('line'), kind: 'line', label: line, children: [] })),
    }
  }

  const itemNode = (item: ZttItem): TreeNode => {
    if (item.kind === 'checker') {
      return { id: id('item'), kind: 'item', label: `Checker: ${item.condition}`, note: item.message, children: [],
        item: { label: item.message ?? '', variable: '', input: false, layout: '', min: '', max: '', html: '' } }
    }
    const v = item.variable ?? ''
    return {
      id: id('item'),
      kind: 'item',
      label: v ? `${item.input ? 'IN' : 'OUT'}( ${v} )` : `"${item.label}"`,
      note: v ? item.label : undefined,
      children: [],
      item: { label: item.label, variable: v, input: Boolean(item.input), layout: item.layout ?? '', min: item.min ?? '', max: item.max ?? '', html: '' },
    }
  }

  const boxNode = (box: ZttBox, where: string): TreeNode => ({
    id: id('box'),
    kind: 'box',
    label: box.name || BOX_NAMES[box.type] || 'Box',
    note: [box.type !== 'standard' ? BOX_NAMES[box.type] : '', box.table && box.table !== 'subjects' ? box.table : '', box.tableCondition ? `if ${box.tableCondition}` : '']
      .filter(Boolean).join(' · ') || undefined,
    children: [
      ...box.items.map(itemNode),
      ...box.programs.map((p) => programNode(p, `${where}, box ${box.name}`)),
      ...box.buttons.map((b): TreeNode => ({
        id: id('button'),
        kind: 'button',
        label: b.name,
        children: [...b.checkers.map(itemNode), ...b.programs.map((p) => programNode(p, `${where}, button ${b.name}`))],
      })),
      ...box.boxes.map((child) => boxNode(child, where)),
    ],
  })

  const screens = (stage: ZttStage, where: string): TreeNode[] => [
    { id: id('active'), kind: 'active', label: 'Active screen', children: stage.active.map((b) => boxNode(b, where)) },
    { id: id('waiting'), kind: 'waiting', label: 'Waiting screen', children: stage.waiting.map((b) => boxNode(b, where)) },
  ]

  const background: TreeNode = {
    id: 'bg',
    kind: 'background',
    label: 'Background',
    children: [
      ...ZTREE_TABLES.map((table): TreeNode => ({ id: `table:${table}`, kind: 'table', label: table, table, children: [] })),
      ...t.background.programs.map((p) => programNode(p, 'Background')),
      ...screens(t.background, 'Background'),
    ],
  }

  const stages: StageInfo[] = []
  const stageNodes = t.stages.map((stage, i): TreeNode => {
    const varName = `stage${i + 1}`
    const decl = append(`// Stage ${i + 1}: `)
    const nameRange = append(JSON.stringify(stage.name))
    append('\n')
    const prop = (key: string, text: string): StageProp => {
      const stmt = append(`${key} = `)
      const value = append(text)
      append(';\n')
      return { stmt: { start: stmt.start, end: value.end + 1 }, value, text }
    }
    const props: Record<string, StageProp> = {
      waitToStart: prop('waitToStart', startsIfPossible(stage) ? 'false' : 'true'),
      duration: prop('duration', stage.timeout.trim() || '0'),
    }
    const node: TreeNode = {
      id: id('stage'),
      kind: 'stage',
      label: stage.name,
      note: `${startsIfPossible(stage) ? '' : '=|= '}(${stage.timeout.trim() || '-1'})`,
      stageVar: varName,
      children: [...stage.programs.map((p) => programNode(p, `Stage ${stage.name}`)), ...screens(stage, `Stage ${stage.name}`)],
    }
    append('\n')
    const span = { start: decl.start, end: source.length }
    node.stmt = span
    stages.push({ id: stage.name, varName, decl, nameRange, span, props })
    return node
  })

  // Parameters: the period, subject and table programs, after the stages.
  if (t.params.some((c) => c.program) || t.periods.some((p) => p.program) || t.subjects.some((s) => s.program)) {
    append('// Parameter table\n')
    t.periods.forEach((p) => { if (p.program) append(`// period ${p.name}\n${p.program}\n`) })
    t.subjects.forEach((s) => { if (s.program) append(`// subject ${s.name}\n${s.program}\n`) })
    t.params.forEach((c, i) => {
      if (c.program) append(`// period ${Math.floor(i / Math.max(1, t.subjects.length)) + 1}, subject ${(i % Math.max(1, t.subjects.length)) + 1}\n${c.program}\n`)
    })
  }

  return {
    source,
    error: null,
    appProps: {},
    stages,
    tree: { id: 'root', kind: 'background', label: name, children: [background, ...stageNodes] },
    end: source.length,
  }
}
