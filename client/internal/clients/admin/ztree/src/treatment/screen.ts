import type { ItemInfo, TreeNode } from './tree'

/*
 * A stage's HTML read as z-Tree reads a screen: boxes, holding items and
 * buttons. A form is a standard box, its fields are input items
 * (`Your offer: IN( player.offer )`), text with `{{x}}` or `jt-text` in it is
 * an output item (`The pie is OUT( app.pieSize )`), and a run of plain
 * paragraphs is a text box.
 */

const CONTROLS = 'input:not([type=hidden]):not([type=submit]):not([type=button]), select, textarea'
const BUTTONS = 'button, input[type=submit], input[type=button]'
const BLOCKS = new Set(['P', 'DIV', 'LI', 'LABEL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TD', 'TH', 'TR', 'UL', 'OL', 'TABLE', 'FORM', 'SECTION', 'FIELDSET', 'BLOCKQUOTE', 'PRE'])

export function screenBoxes(html: string, parentId: string): TreeNode[] {
  if (typeof DOMParser === 'undefined') return []
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  const boxes: TreeNode[] = []
  let textBox: TreeNode | null = null
  let counter = 0
  const nextId = () => `${parentId}:b${counter++}`

  for (const child of Array.from(doc.body.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = outText(child.textContent ?? '')
      if (!text) continue
      textBox ??= pushBox(boxes, nextId(), 'Text')
      textBox.children.push(itemNode(`${textBox.id}:i${textBox.children.length}`, text, { label: text }))
      continue
    }
    if (!(child instanceof HTMLElement)) continue
    const kind = boxKind(child)
    if (kind === 'Text') {
      const lines = items(child, `${parentId}:t`)
      if (!lines.length) continue
      textBox ??= pushBox(boxes, nextId(), 'Text')
      for (const line of lines) {
        line.id = `${textBox.id}:i${textBox.children.length}`
        textBox.children.push(line)
      }
      continue
    }
    textBox = null
    const box = pushBox(boxes, nextId(), kind)
    box.children = items(child, box.id)
  }
  return boxes
}

function pushBox(boxes: TreeNode[], id: string, label: string): TreeNode {
  const box: TreeNode = { id, kind: 'box', label, children: [] }
  boxes.push(box)
  return box
}

function boxKind(el: HTMLElement): string {
  const tag = el.tagName
  if (tag === 'FORM' || el.querySelector(CONTROLS) || el.querySelector(BUTTONS) || el.matches(BUTTONS)) return 'Standard'
  if (tag === 'TABLE') return 'Grid'
  if (['IMG', 'VIDEO', 'AUDIO', 'IFRAME'].includes(tag)) return 'Multimedia'
  if (['CANVAS', 'SVG'].includes(tag)) return 'Plot'
  if (tag === 'DIV' && el.children.length > 1 && Array.from(el.children).some((c) => BLOCKS.has(c.tagName))) return 'Container'
  return 'Text'
}

/** The items of a box, in the order they appear. */
function items(root: HTMLElement, parentId: string): TreeNode[] {
  const out: TreeNode[] = []
  const id = () => `${parentId}:i${out.length}`

  const visit = (el: HTMLElement) => {
    if (el.matches(CONTROLS)) {
      out.push(controlItem(el, id()))
      return
    }
    if (el.matches(BUTTONS)) {
      const label = el instanceof HTMLInputElement ? el.value : outText(el.textContent ?? '')
      out.push({ id: id(), kind: 'button', label: label || 'OK', children: [], item: buttonInfo(el, label) })
      return
    }
    const hasInner = el.querySelector(`${CONTROLS}, ${BUTTONS}`) || Array.from(el.children).some((c) => BLOCKS.has(c.tagName))
    if (!hasInner) {
      const text = textOf(el)
      if (text) out.push(itemNode(id(), text, { label: text, variable: outputVariable(el), html: el.outerHTML }))
      return
    }
    // Text sitting directly beside the fields is their label; it is said on
    // the input items, not again on its own.
    const ownsControls = Array.from(el.children).some((c) => c.matches(CONTROLS))
    for (const node of Array.from(el.childNodes)) {
      if (node instanceof HTMLElement) visit(node)
      else if (!ownsControls && node.nodeType === Node.TEXT_NODE) {
        const text = outText(node.textContent ?? '')
        if (text) out.push(itemNode(id(), text, { label: text }))
      }
    }
  }

  visit(root)
  return out
}

function controlItem(el: HTMLElement, id: string): TreeNode {
  const name = el.getAttribute('name') ?? el.getAttribute('v-model') ?? ''
  const block = el.closest('p, label, li, td, div, form') as HTMLElement | null
  let label = ''
  if (block) {
    const copy = block.cloneNode(true) as HTMLElement
    copy.querySelectorAll(`${CONTROLS}, ${BUTTONS}`).forEach((c) => c.remove())
    label = textOf(copy)
  }
  const info: ItemInfo = {
    label,
    variable: name,
    input: true,
    layout: layoutOf(el),
    min: el.getAttribute('min') ?? el.getAttribute('jt-min') ?? '',
    max: el.getAttribute('max') ?? el.getAttribute('jt-max') ?? '',
    html: el.outerHTML,
  }
  return { id, kind: 'item', label: `${label ? `${label} ` : ''}IN( ${name || '?'} )`, children: [], item: info }
}

function buttonInfo(el: HTMLElement, label: string): ItemInfo {
  return {
    label,
    variable: el.getAttribute('name') ?? '',
    input: false,
    layout: el.getAttribute('value') ?? '',
    min: '',
    max: '',
    html: el.outerHTML,
  }
}

function itemNode(id: string, label: string, info: Partial<ItemInfo>): TreeNode {
  return {
    id,
    kind: 'item',
    label,
    children: [],
    item: { label: info.label ?? label, variable: info.variable ?? '', input: false, layout: '', min: '', max: '', html: info.html ?? '' },
  }
}

/** What an input accepts, in z-Tree's layout terms: `1` for whole numbers, `0.01` for cents, `!text` for text. */
function layoutOf(el: HTMLElement): string {
  if (el.tagName === 'SELECT') {
    return Array.from((el as HTMLSelectElement).options).map((o) => `!radio: ${o.value} = "${o.text}"`).join('; ')
  }
  const type = el.getAttribute('type') ?? 'text'
  if (type === 'number' || type === 'range') return el.getAttribute('step') ?? '1'
  if (type === 'radio' || type === 'checkbox') return `!${type}: ${el.getAttribute('value') ?? ''}`
  return '!text: 1'
}

/** The variable an output item shows, when it shows exactly one. */
function outputVariable(el: HTMLElement): string {
  const shown = new Set<string>()
  el.querySelectorAll('[jt-text]').forEach((node) => shown.add(node.getAttribute('jt-text') ?? ''))
  if (el.getAttribute('jt-text')) shown.add(el.getAttribute('jt-text')!)
  for (const match of (el.textContent ?? '').matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)) shown.add(match[1])
  return shown.size === 1 ? [...shown][0] : ''
}

/** An element's text, with what it shows from variables written as OUT( x ). */
function textOf(el: HTMLElement): string {
  const copy = el.cloneNode(true) as HTMLElement
  copy.querySelectorAll('[jt-text]').forEach((node) => {
    node.textContent = `{{${node.getAttribute('jt-text')}}}`
  })
  if (copy.getAttribute('jt-text')) copy.textContent = `{{${copy.getAttribute('jt-text')}}}`
  return outText(copy.textContent ?? '')
}

function outText(text: string): string {
  return text.replace(/\{\{\s*([^}]+?)\s*\}\}/g, 'OUT( $1 )').replace(/\s+/g, ' ').trim()
}
