import type { ScreenNode } from './server/editor'

/*
 * The elements of a jtree screen as the app editor's structured mode shows them: what each is
 * called in the tree, which fields it has, and the elements it offers to add. A screen is HTML
 * (with Vue's {{ }} for values); an input's name says where its value goes (player.x).
 */

/** Elements that hold only text and text styling are one row: their content is edited as text. */
const PHRASING = new Set(['a', 'abbr', 'b', 'br', 'cite', 'code', 'del', 'em', 'font', 'i', 'ins', 'kbd', 'mark', 'q', 's', 'small', 'span', 'strong', 'sub', 'sup', 'u', 'var', 'wbr'])
const RAW = new Set(['script', 'style', 'textarea', 'title'])

/** Whether node is shown without its children (its content is a field). */
export function isLeaf(node: ScreenNode): boolean {
  if (node.type !== 'element') return true
  if (RAW.has(node.tag!)) return true
  if (['select', 'ul', 'ol', 'table', 'tr', 'thead', 'tbody', 'div', 'form', 'section', 'fieldset'].includes(node.tag!)) return !node.children?.length
  return (node.children ?? []).every((c) => c.type !== 'element' || (PHRASING.has(c.tag!) && isLeaf(c)))
}

/** An attribute's value; undefined if it has none, null if it is there without a value. */
export function attr(node: ScreenNode, name: string): string | null | undefined {
  const a = node.attrs?.find((x) => x.name === name)
  return a ? a.value : undefined
}

/** The text of HTML, tags taken out and space collapsed. */
export function plain(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
}

const INPUTS: Record<string, string> = {
  number: 'Number', text: 'Text field', email: 'Email field', radio: 'Choice', checkbox: 'Check box', range: 'Slider',
  hidden: 'Hidden value', submit: 'Button', password: 'Password', date: 'Date', time: 'Time', color: 'Colour', tel: 'Phone', url: 'Web address',
}
const NAMES: Record<string, string> = {
  p: 'Paragraph', h1: 'Heading', h2: 'Heading', h3: 'Heading', h4: 'Heading', h5: 'Heading', h6: 'Heading', div: 'Box', span: 'Span',
  select: 'Dropdown', option: 'Option', optgroup: 'Option group', textarea: 'Text area', button: 'Button', label: 'Label', br: 'Line break',
  hr: 'Line', img: 'Image', a: 'Link', table: 'Table', thead: 'Table head', tbody: 'Table body', tr: 'Row', td: 'Cell', th: 'Header cell',
  ul: 'List', ol: 'Numbered list', li: 'Item', form: 'Form', script: 'Script', style: 'Style', b: 'Bold', strong: 'Bold', i: 'Italic',
  em: 'Emphasis', u: 'Underline', small: 'Small', center: 'Centred', fieldset: 'Group', legend: 'Group title', iframe: 'Frame', video: 'Video',
  audio: 'Audio', canvas: 'Canvas', svg: 'Picture', template: 'Template',
}

/** What node is: its kind, as a word or two. */
export function kindOf(node: ScreenNode): string {
  if (node.type === 'text') return 'Text'
  if (node.type === 'comment') return 'Comment'
  if (node.tag === 'input') return INPUTS[String(attr(node, 'type') ?? 'text').toLowerCase()] ?? 'Input'
  if (node.tag === 'select' && Number(attr(node, 'size') ?? 0) > 1) return 'List'
  return NAMES[node.tag!] ?? `<${node.tag}>`
}

/**
 * A node as a row of the tree: label (its text, or its kind) and note (its kind beside its text,
 * and where an input's value goes).
 */
export function describeNode(node: ScreenNode, screen: string): { label: string, note: string } {
  const kind = kindOf(node)
  if (node.type === 'text') return { label: plain(node.text ?? '') || '(text)', note: '' }
  if (node.type === 'comment') return { label: plain(node.text ?? '') || '…', note: 'comment' }
  const name = attr(node, 'name') ?? attr(node, 'v-model') ?? attr(node, ':name')
  if (node.tag === 'script' || node.tag === 'style') return { label: kind, note: `${(node.children?.[0]?.text ?? '').split('\n').length} lines` }
  if (node.tag === 'input') {
    const value = attr(node, 'value')
    return { label: kind, note: [name, value != null && /radio|checkbox|submit|hidden/.test(String(attr(node, 'type'))) ? `= ${value}` : ''].filter(Boolean).join(' ') }
  }
  if (['select', 'textarea'].includes(node.tag!)) return { label: kind, note: name ?? '' }
  if (node.tag === 'img') return { label: kind, note: attr(node, 'src') ?? attr(node, ':src') ?? '' }
  const text = node.inner && (isLeaf(node) || ['p', 'label', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'th'].includes(node.tag!)) ? plain(screen.slice(node.inner.start, node.inner.end)) : ''
  if (node.tag === 'option') return { label: text || kind, note: attr(node, 'value') != null ? `= ${attr(node, 'value')}` : '' }
  if (node.tag === 'button') return { label: text || kind, note: ['button', name ? `${name} = ${attr(node, 'value') ?? ''}` : ''].filter(Boolean).join(' · ') }
  if (text) return { label: text, note: kind.toLowerCase() }
  const id = attr(node, 'id')
  return { label: kind, note: id ? `#${id}` : '' }
}

/** A field an element has: an attribute, shown as text, a number, a check box or a choice. */
export interface Field {
  attr: string
  label: string
  kind: 'text' | 'number' | 'flag' | 'choice'
  choices?: string[]
  hint?: string
}

const NAME_FIELD: Field = { attr: 'name', label: 'Variable', kind: 'text', hint: "Where the answer goes: player.x (or group.x)." }
const REQUIRED: Field = { attr: 'required', label: 'Required', kind: 'flag' }

/** The fields of node, by what it is; its other attributes are listed as they are. */
export function fieldsOf(node: ScreenNode): Field[] {
  if (node.type !== 'element') return []
  const type = String(attr(node, 'type') ?? 'text').toLowerCase()
  switch (node.tag) {
    case 'input': {
      const fields: Field[] = [NAME_FIELD, { attr: 'type', label: 'Type', kind: 'choice', choices: Object.keys(INPUTS) }]
      if (['number', 'range'].includes(type)) fields.push({ attr: 'min', label: 'Minimum', kind: 'text' }, { attr: 'max', label: 'Maximum', kind: 'text' }, { attr: 'step', label: 'Step', kind: 'text' })
      if (['radio', 'checkbox', 'hidden', 'submit'].includes(type)) fields.push({ attr: 'value', label: 'Value', kind: 'text', hint: 'What the variable is set to when this is chosen.' })
      if (['text', 'email', 'number', 'password', 'tel', 'url'].includes(type)) fields.push({ attr: 'placeholder', label: 'Placeholder', kind: 'text' })
      if (!['hidden', 'submit'].includes(type)) fields.push(REQUIRED)
      if (type === 'radio' || type === 'checkbox') fields.push({ attr: 'id', label: 'Id', kind: 'text', hint: "A label's for= names it." })
      return fields
    }
    case 'select': return [NAME_FIELD, REQUIRED, { attr: 'size', label: 'Rows shown', kind: 'number', hint: '1 (or none) for a dropdown; more for a list.' }]
    case 'option': return [{ attr: 'value', label: 'Value', kind: 'text', hint: 'What the variable is set to when this is chosen.' }]
    case 'textarea': return [NAME_FIELD, REQUIRED, { attr: 'rows', label: 'Rows', kind: 'number' }, { attr: 'cols', label: 'Columns', kind: 'number' }, { attr: 'placeholder', label: 'Placeholder', kind: 'text' }]
    case 'button': return [
      { attr: 'name', label: 'Variable', kind: 'text', hint: 'Set to Value when this button is pressed (leave empty for an OK button).' },
      { attr: 'value', label: 'Value', kind: 'text' },
      { attr: 'type', label: 'Type', kind: 'choice', choices: ['submit', 'button'] },
    ]
    case 'label': return [{ attr: 'for', label: 'For', kind: 'text', hint: 'The id of the input it labels (not needed if the input is inside it).' }]
    case 'img': return [{ attr: 'src', label: 'Source', kind: 'text' }, { attr: 'alt', label: 'Description', kind: 'text' }, { attr: 'width', label: 'Width', kind: 'text' }]
    case 'a': return [{ attr: 'href', label: 'Address', kind: 'text' }]
    case 'td': case 'th': return [{ attr: 'colspan', label: 'Columns spanned', kind: 'number' }]
    default: return []
  }
}

/** Fields every element has, after its own. */
export const COMMON_FIELDS: Field[] = [
  { attr: 'v-if', label: 'Shown if', kind: 'text', hint: 'An expression, e.g. player.idInGroup === 1.' },
  { attr: 'class', label: 'Class', kind: 'text' },
  { attr: 'style', label: 'Style', kind: 'text', hint: 'CSS, e.g. color: red; font-weight: bold' },
]

/** Whether the content of node is a text field in the inspector (its tree row has no children). */
export function hasTextContent(node: ScreenNode): boolean {
  return node.type === 'element' && Boolean(node.inner) && isLeaf(node) && !['script', 'style'].includes(node.tag!)
}

/** Elements to add to a screen, by group, as the HTML put in. */
export const PALETTE: Array<{ group: string, items: Array<{ label: string, html: string }> }> = [
  {
    group: 'Text',
    items: [
      { label: 'Paragraph', html: '<p>Text</p>' },
      { label: 'Heading', html: '<h3>Heading</h3>' },
      { label: 'Value shown', html: '<p>Your payoff: {{player.points}}</p>' },
    ],
  },
  {
    group: 'Inputs',
    items: [
      { label: 'Number', html: "<p>Your choice: <input name='player.choice' type='number' required min='0' max='100' step='1'></p>" },
      { label: 'Text field', html: "<p>Your answer: <input name='player.answer' type='text' required></p>" },
      { label: 'Text area', html: "<textarea name='player.comments' rows='4' cols='40'></textarea>" },
      { label: 'Dropdown', html: "<select name='player.option' required>\n    <option value='A'>A</option>\n    <option value='B'>B</option>\n</select>" },
      { label: 'Choice (radio buttons)', html: "<p>\n    <label><input name='player.option' type='radio' value='A' required> A</label>\n    <label><input name='player.option' type='radio' value='B' required> B</label>\n</p>" },
      { label: 'Check box', html: "<p><label><input name='player.agree' type='checkbox' value='yes'> I agree</label></p>" },
      { label: 'Slider', html: "<p>0 <input name='player.slider' type='range' min='0' max='100' step='1'> 100</p>" },
      { label: 'Choice buttons', html: "<p>\n    <button name='player.option' value='A' type='submit'>A</button>\n    <button name='player.option' value='B' type='submit'>B</button>\n</p>" },
      { label: 'OK button', html: '<button>OK</button>' },
    ],
  },
  {
    group: 'Layout',
    items: [
      { label: 'Box', html: '<div>\n</div>' },
      { label: 'Line break', html: '<br>' },
      { label: 'Line', html: '<hr>' },
      { label: 'List', html: '<ul>\n    <li>One</li>\n    <li>Two</li>\n</ul>' },
      { label: 'Table', html: '<table>\n    <tr><th>Player</th><th>Points</th></tr>\n    <tr v-for="p in group.players"><td>{{p.id}}</td><td>{{p.points}}</td></tr>\n</table>' },
      { label: 'Image', html: "<img src='' alt=''>" },
    ],
  },
  {
    group: 'Code',
    items: [
      { label: 'Script', html: '<script>\n</script>' },
      { label: 'Comment', html: '<!-- note -->' },
    ],
  },
]

/** Whether html starts with an element that is a block of its own (not one to put in a line of text). */
export function isBlock(html: string): boolean {
  return /^\s*<(p|h[1-6]|div|ul|ol|table|hr|select|textarea|form|section|fieldset|script|style)\b/i.test(html)
}

/** What can be put inside node with Add (a box, a list, ...), rather than after it. */
export function holdsElements(node: ScreenNode): boolean {
  return node.type === 'element' && Boolean(node.inner) && ['div', 'form', 'section', 'fieldset', 'ul', 'ol', 'table', 'tbody', 'td', 'th', 'li', 'center'].includes(node.tag!)
}

/** HTML as written at pos in text, with the indentation of its line taken off the lines after its first. */
export function outdented(text: string, start: number, end: number): string {
  const lineStart = text.lastIndexOf('\n', start - 1) + 1
  const indent = /^[ \t]*/.exec(text.slice(lineStart))![0]
  return text.slice(start, end).split('\n').map((l, k) => (k && l.startsWith(indent) ? l.slice(indent.length) : l)).join('\n')
}
