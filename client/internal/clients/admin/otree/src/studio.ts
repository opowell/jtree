import { serverUrl } from './server'

/*
 * The studio's side of the server's oTree editor (server/source/editors/otree.js, at
 * /api/editor/otree/...): projects and apps read into their parts, edits made in their Python by
 * the server (which changes only the part an edit is about), files written. And Python literals
 * as the studio's fields show them.
 */

export interface Range { start: number, end: number }
export interface Code { name: string, code: string, range: Range, valueRange: Range }
export interface Fn { name: string, params: string[], body: string, decorators: string[], range: Range }
export interface Field { name: string, type: string, args: Array<{ name: string, code: string }>, posargs: string[] }
export interface Cls { name: string, bases: string[], indent: string, docstring: string | null, other: Array<{ code: string }> }
export interface Model extends Cls { fields: Field[] }
export interface PageInfo extends Cls { kind: 'Page' | 'WaitPage', attrs: Code[], methods: Fn[] }

export interface AppModel {
  error: { message: string, line: number, column: number } | null
  doc: string | null
  constants: (Cls & { items: Code[] }) | null
  models: Record<string, Model>
  functions: Fn[]
  pages: PageInfo[]
  pageSequence: { names: string[] } | null
  other: Array<{ code: string }>
}

export interface Template { text: string, title: string | null, content: string | null }

export interface OpenedApp {
  dir: string
  name: string
  format: 'current' | 'old'
  source: string | null
  model: AppModel | null
  templates: Record<string, Template>
}

export interface SessionConfig { style: 'call' | 'literal' | null, entries: Array<{ key: string, code: string }>, code: string }
export interface SettingsModel {
  error: { message: string, line: number } | null
  configs: { items: SessionConfig[] } | null
  settings: Array<Code & { entries: Array<{ key: string, code: string }> | null }>
  other: Array<{ code: string }>
}

export interface ProjectInfo { name: string, dir: string, settingsPath: string, apps: Array<{ name: string, dir: string, format: string }> }

async function call<T>(action: string, body: unknown): Promise<T> {
  const res = await fetch(`${serverUrl}/api/editor/otree/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({ error: `${res.status} ${res.statusText}` }))
  if (!res.ok) throw new Error(data.error ?? `${res.status} ${res.statusText}`)
  return data as T
}

export type AppEdit = Record<string, unknown> & { op: string }

export const studio = {
  list: () => call<{ projects: ProjectInfo[], apps: ProjectInfo['apps'] }>('list', {}),
  openProject: (settingsPath: string) => call<{ settingsPath: string, source: string, model: SettingsModel }>('openProject', { settingsPath }),
  openApp: (dir: string) => call<OpenedApp>('openApp', { dir }),
  apply: (source: string, op: AppEdit) => call<{ source: string, model: AppModel }>('apply', { source, op }),
  model: (source: string) => call<{ model: AppModel }>('model', { source }),
  applySettings: (source: string, op: AppEdit) => call<{ source: string, model: SettingsModel }>('applySettings', { source, op }),
  settingsModel: (source: string) => call<{ model: SettingsModel }>('settingsModel', { source }),
  saveApp: (dir: string, source: string, templates: Record<string, { title: string, content: string } | { text: string } | null>) =>
    call<{ dir: string }>('saveApp', { dir, source, templates }),
  saveProject: (settingsPath: string, source: string) => call<{ settingsPath: string }>('saveProject', { settingsPath, source }),
  createApp: (projectDir: string, name: string) => call<OpenedApp>('createApp', { projectDir, name }),
  createProject: (name: string) => call<{ settingsPath: string, dir: string }>('createProject', { name }),
}

/* ------------------------------------------------------- Python literals */

/** A Python string literal's text, or null if code is not a plain one. */
export function pyString(code: string | undefined): string | null {
  if (code == null) return null
  const m = /^([rRuU]?)(['"])((?:\\.|(?!\2)[^\\\n])*)\2$/.exec(code.trim())
  if (!m) return null
  if (/r/i.test(m[1])) return m[3]
  return m[3].replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|.)/g, (_, e: string) => {
    if (e[0] === 'u' || e[0] === 'x') return String.fromCharCode(parseInt(e.slice(1), 16))
    return ({ n: '\n', t: '\t', r: '\r', '0': '\0' } as Record<string, string>)[e] ?? e
  })
}

/** Text as a Python string literal (single quotes, as oTree's apps write them). */
export function pyQuote(text: string): string {
  return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`
}

/** A Python list of names or strings, ['a', 'b'] → its items' texts; null if it is not one. */
export function pyList(code: string | undefined): string[] | null {
  if (code == null) return null
  const m = /^\[(.*)\]$/s.exec(code.trim())
  if (!m) return null
  if (m[1].trim() === '') return []
  const items = m[1].split(',').map((s) => s.trim()).filter((s) => s !== '')
  const out = items.map((s) => pyString(s))
  return out.every((s) => s != null) ? (out as string[]) : null
}

/** Choices as oTree takes them, one a line: `value` or `value, label` (a label is text). */
export function choicesCode(lines: string): string {
  const rows = lines.split('\n').map((l) => l.trim()).filter(Boolean)
  const value = (v: string) => (/^-?\d+(\.\d+)?$/.test(v) || /^(True|False)$/.test(v) ? v : pyQuote(v))
  return `[${rows.map((r) => {
    const at = r.indexOf(',')
    return at === -1 ? value(r) : `[${value(r.slice(0, at).trim())}, ${pyQuote(r.slice(at + 1).trim())}]`
  }).join(', ')}]`
}

/** oTree choices code as lines for the field above; null if it is not a plain list. */
export function choicesLines(code: string | undefined): string | null {
  if (code == null) return ''
  const t = code.trim()
  if (!/^\[.*\]$/s.test(t)) return null
  const pairs = [...t.slice(1, -1).matchAll(/\[\s*([^,\]]+?)\s*,\s*((['"])(?:\\.|(?!\3).)*\3)\s*\]|((['"])(?:\\.|(?!\5).)*\5|-?\d+(?:\.\d+)?|True|False)/g)]
  const lines = pairs.map((p) => (p[1] != null ? `${pyString(p[1]) ?? p[1]}, ${pyString(p[2])}` : pyString(p[4]) ?? p[4]))
  return lines.join('\n')
}

/** oTree's field types, as Studio offers them. */
export const FIELD_TYPES = ['IntegerField', 'FloatField', 'CurrencyField', 'BooleanField', 'StringField', 'LongStringField']

/** The arguments Studio's field form has a place for; others are kept, as code. */
export const FIELD_ARGS = ['label', 'min', 'max', 'initial', 'choices', 'blank', 'widget', 'doc']

/** A page's methods, as oTree 5 calls them, with what they are given. */
export const PAGE_METHODS: Record<string, string[]> = {
  is_displayed: ['player: Player'],
  vars_for_template: ['player: Player'],
  js_vars: ['player: Player'],
  get_timeout_seconds: ['player: Player'],
  before_next_page: ['player: Player', 'timeout_happened'],
  error_message: ['player: Player', 'values'],
  app_after_this_page: ['player: Player', 'upcoming_apps'],
  live_method: ['player: Player', 'data'],
}

export const WAIT_PAGE_METHODS: Record<string, string[]> = {
  is_displayed: ['player: Player'],
  after_all_players_arrive: ['group: Group'],
  vars_for_template: ['player: Player'],
}

/** Functions oTree calls by their name, with what they are given. */
export const KNOWN_FUNCTIONS: Record<string, string[]> = {
  creating_session: ['subsession: Subsession'],
  set_payoffs: ['group: Group'],
  vars_for_admin_report: ['subsession: Subsession'],
  custom_export: ['players'],
}
