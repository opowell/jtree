// Types for editors and `npm run typecheck` (see README.md); the browser ignores them.


declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'circular-json' {
  const CircularJSON: { parse(text: string): any; stringify(value: unknown): string }
  export default CircularJSON
}

declare module 'codemirror' {
  // shared/codemirror-*/codemirror.js (build-tools/codemirror/entry.js).
  export interface CodeEditorOptions {
    doc?: string
    language?: 'javascript' | 'html' | 'css' | 'python' | 'text'
    readOnly?: boolean
    lineNumbers?: boolean
    fill?: boolean
    wrap?: boolean
    indent?: string
    placeholder?: string
    label?: string
    id?: string
    onChange?(text: string): void
    onBlur?(text: string): void
    onCommit?(text: string): void
  }
  export interface CodeEditor {
    view: any
    get(): string
    set(text: string): void
    setReadOnly(on: boolean): void
    focus(): void
    destroy(): void
  }
  export function codeEditor(parent: HTMLElement, options?: CodeEditorOptions): CodeEditor
  export const EditorView: any
  export const EditorState: any
}
