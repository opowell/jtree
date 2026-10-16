// The code editor of jtree's admin interfaces: CodeMirror 6 with the languages they edit, and
// codeEditor(), which makes one in an element. build.mjs bundles this file into one ES module in
// client/internal/clients/shared/; the admins load it with their import maps.
import { EditorState, Compartment, Transaction } from '@codemirror/state'
import {
  EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter,
  highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, placeholder,
} from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import {
  indentOnInput, bracketMatching, foldGutter, foldKeymap, syntaxHighlighting, HighlightStyle, indentUnit, syntaxTree, ensureSyntaxTree,
} from '@codemirror/language'
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { python } from '@codemirror/lang-python'
import { css } from '@codemirror/lang-css'
import { tags as t } from '@lezer/highlight'

// syntaxTree and ensureSyntaxTree: for tests and screenshots, which finish the parse before looking.
export { EditorState, EditorView, Compartment, keymap, syntaxTree, ensureSyntaxTree }

const LANGUAGES = {
  javascript: () => javascript(),
  html: () => html(),
  python: () => python(),
  css: () => css(),
  text: () => [],
}

/*
 * Colours. The editor takes its surface, text and lines from the page's CSS variables (--cm-*,
 * set by each admin from its own theme), and its syntax colours pick light or dark with
 * light-dark(), from the color-scheme of the page around it.
 */
const v = (name, fallback) => `var(--cm-${name}, ${fallback})`
const ld = (light, dark) => `light-dark(${light}, ${dark})`

const theme = EditorView.theme({
  '&': {
    color: v('fg', 'inherit'),
    backgroundColor: v('bg', 'Field'),
    border: `1px solid ${v('line', '#bbb')}`,
    borderRadius: v('radius', '3px'),
    fontSize: v('font-size', '12px'),
  },
  '&.cm-focused': { outline: `2px solid ${v('focus', 'Highlight')}`, outlineOffset: '-1px' },
  '.cm-scroller': {
    fontFamily: v('font', 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'),
    lineHeight: '1.45',
    minHeight: 'calc(var(--cm-min-lines, 3) * 1.45em + 8px)',
    maxHeight: 'calc(var(--cm-max-lines, 24) * 1.45em + 8px)',
  },
  '&.cm-fill': { height: '100%' },
  '&.cm-fill .cm-scroller': { maxHeight: 'none' },
  '.cm-content': { padding: '4px 0', caretColor: v('fg', 'currentColor') },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: v('fg', 'currentColor') },
  '.cm-gutters': { backgroundColor: v('gutter-bg', 'transparent'), color: v('muted', '#888'), border: 'none', borderRight: `1px solid ${v('line', '#ddd')}` },
  '.cm-activeLine': { backgroundColor: v('active-line', ld('rgba(0,0,0,.035)', 'rgba(255,255,255,.04)')) },
  '.cm-activeLineGutter': { backgroundColor: v('active-line', ld('rgba(0,0,0,.035)', 'rgba(255,255,255,.04)')), color: v('fg', 'inherit') },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: v('selection', ld('#cfe0ff', '#264f78')),
  },
  '.cm-selectionMatch': { backgroundColor: ld('rgba(255,200,0,.25)', 'rgba(255,200,0,.18)') },
  '&.cm-focused .cm-matchingBracket': { backgroundColor: ld('rgba(0,120,255,.18)', 'rgba(120,180,255,.25)'), outline: 'none' },
  '.cm-placeholder': { color: v('muted', '#888') },
  '.cm-tooltip': { backgroundColor: v('bg', 'Field'), color: v('fg', 'inherit'), border: `1px solid ${v('line', '#bbb')}` },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: v('selection', ld('#cfe0ff', '#264f78')), color: v('fg', 'inherit') },
  '.cm-panels': { backgroundColor: v('gutter-bg', 'Canvas'), color: v('fg', 'inherit') },
  '.cm-panels.cm-panels-bottom': { borderTop: `1px solid ${v('line', '#ddd')}` },
  '.cm-panel input, .cm-panel button': { fontSize: 'inherit' },
  '.cm-foldPlaceholder': { backgroundColor: 'transparent', border: `1px solid ${v('line', '#bbb')}`, color: v('muted', '#888') },
})

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword], color: ld('#7c3aed', '#c4a7ff') },
  { tag: [t.definitionKeyword, t.modifier], color: ld('#7c3aed', '#c4a7ff') },
  { tag: [t.string, t.special(t.string), t.regexp], color: ld('#0a7a3d', '#8fd19e') },
  { tag: [t.number, t.bool, t.null, t.atom], color: ld('#b45309', '#f5b26b') },
  { tag: [t.comment, t.lineComment, t.blockComment], color: ld('#6b7280', '#8b95a5'), fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: ld('#1d4ed8', '#82b1ff') },
  { tag: [t.definition(t.variableName), t.definition(t.propertyName)], color: ld('#0e7490', '#67d4e8') },
  { tag: [t.typeName, t.className, t.namespace], color: ld('#a21caf', '#f0a3ff') },
  { tag: t.propertyName, color: ld('#334155', '#c9d4e2') },
  { tag: [t.tagName, t.angleBracket], color: ld('#be123c', '#ff8fa8') },
  { tag: t.attributeName, color: ld('#b45309', '#f5b26b') },
  { tag: t.attributeValue, color: ld('#0a7a3d', '#8fd19e') },
  { tag: [t.self, t.special(t.variableName)], color: ld('#be123c', '#ff8fa8') },
  { tag: t.invalid, color: ld('#dc2626', '#ff6b6b') },
])

/**
 * Makes an editor in `parent`.
 *
 * options: doc, language ('javascript' | 'html' | 'css' | 'python' | 'text'), readOnly,
 * lineNumbers, fill (fill the parent's height instead of growing with the text), wrap (wrap long
 * lines; HTML's are wrapped unless it is false), indent (the text of one indent: four spaces, or
 * '\t'), placeholder, label (its accessible name), id, and the
 * callbacks onChange(text), onBlur(text) and onCommit(text) (Ctrl+Enter or Cmd+Enter).
 *
 * Returns { view, get(), set(text), setReadOnly(on), focus(), destroy() }. set() replaces the
 * text without adding to the editor's undo history, and does nothing when the text is the same.
 */
export function codeEditor(parent, options = {}) {
  const readOnly = new Compartment()
  const o = options
  const extensions = [
    o.lineNumbers === false ? [] : [lineNumbers(), highlightActiveLineGutter(), foldGutter()],
    highlightSpecialChars(),
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    indentUnit.of(o.indent ?? '    '),
    EditorState.tabSize.of(4),
    syntaxHighlighting(highlight),
    bracketMatching(),
    closeBrackets(),
    autocompletion({ activateOnTyping: false }),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
      { key: 'Mod-Enter', run: (view) => { o.onCommit?.(view.state.doc.toString()); return true } },
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      indentWithTab,
    ]),
    (LANGUAGES[o.language] ?? LANGUAGES.text)(),
    (o.wrap ?? o.language === 'html') ? EditorView.lineWrapping : [],
    theme,
    readOnly.of(EditorState.readOnly.of(Boolean(o.readOnly))),
    o.placeholder ? placeholder(o.placeholder) : [],
    EditorView.contentAttributes.of({ ...(o.id ? { id: o.id } : {}), 'aria-label': o.label ?? 'Code', spellcheck: 'false', autocorrect: 'off', autocapitalize: 'off' }),
    EditorView.editorAttributes.of({ class: o.fill ? 'cm-fill' : '' }),
    EditorView.updateListener.of((u) => {
      if (u.docChanged) o.onChange?.(u.state.doc.toString())
      if (u.focusChanged && !u.view.hasFocus) o.onBlur?.(u.state.doc.toString())
    }),
  ]
  const view = new EditorView({ parent, state: EditorState.create({ doc: o.doc ?? '', extensions }) })
  // The first parse gets 20ms, which the parser's first run (its tables loaded, its code not yet
  // optimised) can use up a token in; the rest is parsed in idle time, which Chrome can hold back
  // (navigator.scheduling.isInputPending). Parse it all now, so the text is coloured at once.
  if (ensureSyntaxTree(view.state, view.state.doc.length, 200)) view.dispatch({})
  return {
    view,
    get: () => view.state.doc.toString(),
    set(text) {
      const now = view.state.doc.toString()
      if (text === now) return
      const head = Math.min(view.state.selection.main.head, text.length)
      view.dispatch({
        changes: { from: 0, to: now.length, insert: text },
        selection: { anchor: head },
        annotations: Transaction.addToHistory.of(false),
      })
    },
    setReadOnly: (on) => view.dispatch({ effects: readOnly.reconfigure(EditorState.readOnly.of(Boolean(on))) }),
    focus: () => view.focus(),
    destroy: () => view.destroy(),
  }
}
