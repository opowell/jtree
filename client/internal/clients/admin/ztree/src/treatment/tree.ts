// The stage tree's nodes, shared by parse.ts and screen.ts. Types only: kept apart so that
// neither of those imports the other for its types, an import cycle the in-browser compiler
// (vue3-sfc-loader) would wait on forever.

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

export interface ItemInfo {
  label: string
  variable: string
  input: boolean
  layout: string
  min: string
  max: string
  html: string
}
