<script lang="ts">
import { ref } from 'vue'

/** Elements cut or copied, as HTML, for any app editor to paste. */
const clipboard = ref<string | null>(null)
</script>

<script setup lang="ts">
import { computed, nextTick, toRef, watch } from 'vue'
import ConfirmButton from './ConfirmButton.vue'
import ElementInspector from './ElementInspector.vue'
import TreeRow from './TreeRow.vue'
import ValueField from './ValueField.vue'
import { SCREEN_NAMES, buildTree, functionId, indexTree, isScreen, nearest, nodeId, screenId, visibleItems } from '../appTree'
import type { TreeItem, TreeView } from '../appTree'
import { PALETTE, holdsElements, isBlock, outdented } from '../elements'
import { APP_SETTINGS, SETTING_HINTS, STAGE_SETTINGS, emptyValue } from '../server/editor'
import type { AppModel, Edit, Prop, ScreenEdit, Value } from '../server/editor'

/*
 * The app editor's structured mode: the app as a tree, as z-Tree shows a treatment (its stages,
 * their screens and the elements in them, and their functions), with what is chosen in it shown
 * beside it to change. Add puts in a stage, a screen, a function or an element next to what is
 * chosen; elements can be moved, copied, cut, pasted and deleted. Each change is one edit of the
 * source, made by the server (EditorPanel's edit).
 */
const props = defineProps<{ model: AppModel, title: string, busy: boolean, edit: (op: Edit) => Promise<void>, view: TreeView }>()

// What is chosen and what is folded are the panel's, so they stay while another mode is shown.
const selected = toRef(props.view, 'selected')
const collapsed = props.view.collapsed
const treeEl = ref<HTMLElement | null>(null)
const nameInput = ref<HTMLInputElement | null>(null)

const root = computed(() => buildTree(props.model, props.title))
const index = computed(() => indexTree(root.value))
const current = computed(() => index.value.get(selected.value)?.item ?? root.value)
const stage = computed(() => props.model.stages.find((s) => s.name === current.value.stage) ?? null)

// After an edit, what was chosen may have gone: choose what it was in.
watch(index, (ix) => { selected.value = nearest(selected.value, (id) => ix.has(id)) })

function select(id: string, focusTree = true) {
  selected.value = id
  // Its rows above it open, so it is seen.
  for (let p = index.value.get(id)?.parent; p; p = index.value.get(p.id)?.parent ?? null) collapsed[p.id] = false
  void nextTick(() => {
    treeEl.value?.querySelector(`[data-id="${CSS.escape(id)}"]`)?.scrollIntoView({ block: 'nearest' })
    if (focusTree) treeEl.value?.focus({ preventScroll: true })
  })
}
const toggle = (id: string) => { collapsed[id] = !collapsed[id] }

// --- What the chosen item's settings are -------------------------------------------------------

const ownProps = computed(() => (stage.value ? stage.value.props : props.model.app))
const settings = computed(() => ownProps.value.filter((p) => p.kind !== 'function' && !isScreen(p)))
const missingSettings = computed(() => Object.keys(stage.value ? STAGE_SETTINGS : APP_SETTINGS).filter((n) => !isScreenName(n) && !ownProps.value.some((p) => p.name === n)))
const hooks = computed(() => (stage.value ? props.model.stageHooks : props.model.appHooks))
const missingHooks = computed(() => Object.keys(hooks.value).filter((n) => !ownProps.value.some((p) => p.name === n)))
const missingScreens = computed(() => ['activeScreen', 'waitingScreen'].filter((n) => !ownProps.value.some((p) => p.name === n)))
const isScreenName = (n: string) => /Screen$/.test(n)

function setProp(name: string, value: Value, stageName = current.value.stage) {
  return props.edit(stageName == null ? { op: 'setAppProp', name, value } : { op: 'setStageProp', stage: stageName, name, value })
}
function removeProp(name: string, stageName = current.value.stage) {
  return props.edit(stageName == null ? { op: 'removeAppProp', name } : { op: 'removeStageProp', stage: stageName, name })
}

const newSetting = ref('')
const customName = ref('')
const canAddSetting = computed(() => newSetting.value !== '' && (newSetting.value !== '*' || /^[A-Za-z_$][\w$]*$/.test(customName.value.trim())))
function addSetting() {
  const name = newSetting.value === '*' ? customName.value.trim() : newSetting.value
  if (!/^[A-Za-z_$][\w$]*$/.test(name)) return
  const kinds = stage.value ? STAGE_SETTINGS : APP_SETTINGS
  void setProp(name, emptyValue(kinds[name] ?? 'number'))
  newSetting.value = customName.value = ''
}

async function renameStage(event: Event) {
  const to = (event.target as HTMLInputElement).value.trim()
  const from = current.value.stage
  if (from == null || !to || to === from) return
  await props.edit({ op: 'renameStage', name: from, to })
  if (props.model.stages.some((s) => s.name === to)) select(`stage:${to}`, false)
}

// --- Screens' elements ------------------------------------------------------------------------

function screenEdit(item: TreeItem, e: ScreenEdit) {
  return props.edit({ op: 'editScreen', stage: item.stage, name: item.prop!.name, edit: e })
}

/**
 * Where Add and Paste put html: in the chosen box or screen, else after the chosen element; a
 * block (a paragraph, a dropdown, ...) chosen next to something in a line of text goes after
 * that line's paragraph instead.
 */
function target(html = ''): { item: TreeItem, where?: 'after' | 'inside', path?: number[], next: number[] } | null {
  let item = current.value
  if (item.kind === 'screen' && item.prop?.kind === 'text') return { item, next: [item.children.length] }
  if (item.kind !== 'node' || item.prop?.kind !== 'text') return null
  if (isBlock(html)) {
    for (let parent = index.value.get(item.id)?.parent; parent?.kind === 'node' && !holdsElements(parent.node!) && !isBlock(written(item)); parent = index.value.get(item.id)?.parent) item = parent
  }
  const path = item.path!
  if (holdsElements(item.node!)) return { item, where: 'inside', path, next: path.concat(item.node!.children?.length ?? 0) }
  return { item, where: 'after', path, next: path.slice(0, -1).concat(path[path.length - 1] + 1) }
}
const canInsert = computed(() => target() != null)

async function insert(html: string) {
  const t = target(html)
  if (!t) return
  await screenEdit(t.item, t.path ? { do: 'insert', path: t.path, where: t.where, html } : { do: 'insert', html })
  select(nodeId(t.item.prop!.name, t.item.stage, t.next))
}

/** The chosen element's HTML, as written (its lines after the first outdented). */
function written(item: TreeItem): string {
  return outdented(String(item.prop!.value ?? ''), item.node!.range.start, item.node!.range.end)
}

// --- Commands on what is chosen ----------------------------------------------------------------

const canDelete = computed(() => ['stage', 'screen', 'function', 'node'].includes(current.value.kind))
const siblings = computed(() => index.value.get(selected.value)?.parent?.children.filter((c) => c.kind === current.value.kind) ?? [])
const canMove = (by: number) => {
  const item = current.value
  if (item.kind !== 'node' && item.kind !== 'stage') return false
  const k = siblings.value.indexOf(item)
  return k + by >= 0 && k + by < siblings.value.length
}

async function remove() {
  const item = current.value
  if (!canDelete.value) return
  // What is chosen next: the one after it, else the one before, else what it was in.
  const parent = index.value.get(item.id)?.parent
  const k = parent ? parent.children.indexOf(item) : -1
  const after = parent?.children[k + 1]
  const before = parent?.children[k - 1]
  if (item.kind === 'node') {
    await screenEdit(item, { do: 'remove', path: item.path! })
    select(after?.kind === 'node' ? item.id : before?.id ?? parent!.id)
    return
  }
  if (item.kind === 'stage') await props.edit({ op: 'deleteStage', name: item.stage! })
  else await removeProp(item.prop!.name)
  select((after ?? before ?? parent)?.id ?? 'app')
}

async function move(by: -1 | 1) {
  const item = current.value
  if (!canMove(by)) return
  if (item.kind === 'stage') {
    const at = props.model.stages.findIndex((s) => s.name === item.stage)
    await props.edit({ op: 'moveStage', name: item.stage!, to: at + by })
    select(item.id)
    return
  }
  const path = item.path!
  await screenEdit(item, { do: 'move', path, by })
  select(nodeId(item.prop!.name, item.stage, path.slice(0, -1).concat(path[path.length - 1] + by)))
}

async function duplicate() {
  const item = current.value
  if (item.kind !== 'node') return
  const path = item.path!
  await screenEdit(item, { do: 'insert', path, where: 'after', html: written(item) })
  select(nodeId(item.prop!.name, item.stage, path.slice(0, -1).concat(path[path.length - 1] + 1)))
}

function copy() {
  if (current.value.kind === 'node') clipboard.value = written(current.value)
}
async function cut() {
  if (current.value.kind !== 'node') return
  copy()
  await remove()
}
async function paste() {
  if (clipboard.value) await insert(clipboard.value)
}

/** A new stage after the chosen one (or last), named so it can be renamed. */
async function addStage() {
  const taken = new Set(props.model.stages.map((s) => s.name))
  let name = 'stage'
  for (let i = props.model.stages.length + 1; taken.has(name); i++) name = `stage${i}`
  await props.edit({ op: 'addStage', name, after: stage.value?.name })
  select(`stage:${name}`, false)
  void nextTick(() => { nameInput.value?.focus(); nameInput.value?.select() })
}

/** Add's choices: 'stage', 'screen:<name>', 'fn:<name>', 'el:<group>:<item>'. */
async function add(event: Event) {
  const menu = event.target as HTMLSelectElement
  const choice = menu.value
  menu.value = ''
  const owner = current.value.stage
  if (choice === 'stage') await addStage()
  else if (choice.startsWith('screen:')) {
    const name = choice.slice(7)
    await setProp(name, emptyValue('text'), owner)
    select(screenId(name, owner))
  } else if (choice.startsWith('fn:')) {
    const name = choice.slice(3)
    await setProp(name, emptyValue('function', hooks.value[name]), owner)
    select(functionId(name, owner))
  } else if (choice.startsWith('el:')) {
    const [g, i] = choice.slice(3).split(':').map(Number)
    await insert(PALETTE[g].items[i].html)
  }
}
const ownerName = computed(() => (current.value.stage == null ? 'the app' : `stage ${current.value.stage}`))

/** Keys on the tree: arrows to move through it, Alt+arrows to move elements, and the commands. */
function keys(event: KeyboardEvent) {
  const rows = visibleItems(root.value, collapsed)
  const k = rows.findIndex((r) => r.id === selected.value)
  const item = current.value
  const mod = event.ctrlKey || event.metaKey
  let done = true
  if (event.altKey && event.key === 'ArrowUp') void move(-1)
  else if (event.altKey && event.key === 'ArrowDown') void move(1)
  else if (event.key === 'ArrowDown') select(rows[Math.min(rows.length - 1, k + 1)].id)
  else if (event.key === 'ArrowUp') select(rows[Math.max(0, k - 1)].id)
  else if (event.key === 'Home') select(rows[0].id)
  else if (event.key === 'End') select(rows[rows.length - 1].id)
  else if (event.key === 'ArrowRight') {
    if (item.children.length && collapsed[item.id]) collapsed[item.id] = false
    else if (item.children.length) select(item.children[0].id)
  } else if (event.key === 'ArrowLeft') {
    if (item.children.length && !collapsed[item.id]) collapsed[item.id] = true
    else { const p = index.value.get(item.id)?.parent; if (p) select(p.id) }
  } else if (event.key === 'Delete' || event.key === 'Backspace') void remove()
  else if (mod && event.key === 'c') copy()
  else if (mod && event.key === 'x') void cut()
  else if (mod && event.key === 'v') void paste()
  else if (mod && event.key === 'd') void duplicate()
  else done = false
  if (done) event.preventDefault()
}

// --- A preview of the chosen screen, the chosen element outlined --------------------------------

const preview = ref(true)
const previewDoc = computed(() => {
  const item = current.value
  if ((item.kind !== 'screen' && item.kind !== 'node') || item.prop?.kind !== 'text') return ''
  let html = String(item.prop.value ?? '')
  const node = item.node
  if (node?.type === 'element') {
    const at = node.range.start + 1 + node.tag!.length
    html = `${html.slice(0, at)} data-jt-chosen${html.slice(at)}`
  }
  return `<!doctype html><meta charset="utf-8"><style>body{font:14px system-ui,sans-serif;margin:10px}[data-jt-chosen]{outline:2px solid #2f6fdf;outline-offset:2px}</style>${html}`
})
const screenOf = (item: TreeItem) => String(item.prop?.value ?? '')
const screenTitle = (p: Prop) => SCREEN_NAMES[p.name] ?? p.name
</script>

<template>
  <div class="at">
    <div class="at__side">
      <div class="toolbar at__tools" role="toolbar" aria-label="Tree">
        <select class="field at__add" aria-label="Add" :disabled="busy" @change="add">
          <option value="">Add…</option>
          <optgroup label="App">
            <option value="stage">Stage</option>
          </optgroup>
          <optgroup v-if="missingScreens.length || missingHooks.length" :label="current.stage == null ? 'To the app' : `To stage ${current.stage}`">
            <option v-for="n in missingScreens" :key="n" :value="`screen:${n}`">{{ SCREEN_NAMES[n] }}</option>
            <option v-for="n in missingHooks" :key="n" :value="`fn:${n}`">ƒ {{ n }}({{ hooks[n].join(', ') }})</option>
          </optgroup>
          <optgroup v-for="(g, gi) in PALETTE" :key="g.group" :label="canInsert ? g.group : `${g.group} (choose a screen)`">
            <option v-for="(it, ii) in g.items" :key="it.label" :value="`el:${gi}:${ii}`" :disabled="!canInsert">{{ it.label }}</option>
          </optgroup>
        </select>
        <button type="button" class="btn btn--small" title="Move up (Alt+↑)" aria-label="Move up" :disabled="!canMove(-1) || busy" @click="move(-1)">↑</button>
        <button type="button" class="btn btn--small" title="Move down (Alt+↓)" aria-label="Move down" :disabled="!canMove(1) || busy" @click="move(1)">↓</button>
        <button type="button" class="btn btn--small" title="Duplicate (Ctrl+D)" :disabled="current.kind !== 'node' || busy" @click="duplicate">Duplicate</button>
        <button type="button" class="btn btn--small btn--danger" title="Delete (Del)" :disabled="!canDelete || busy" @click="remove">Delete</button>
      </div>
      <ul ref="treeEl" class="at__tree" role="tree" tabindex="0" aria-label="The app" @keydown="keys">
        <TreeRow :item="root" :selected="selected" :collapsed="collapsed" :depth="0" @select="select" @toggle="toggle" />
      </ul>
      <p class="hint at__keys">↑↓ to go through it, Alt+↑↓ to move, Del to delete, Ctrl+C / X / V / D to copy, cut, paste, duplicate.</p>
    </div>

    <section class="at__main" :aria-label="current.label">
      <!-- The app -->
      <template v-if="current.kind === 'app'">
        <h3 class="at__title">{{ title }}</h3>
        <p class="hint">What the app sets on <code>app</code>. Its stages, screens and functions are in the tree; Add puts in more.</p>
        <ValueField v-for="p in settings" :key="p.name" :name="p.name" :value="p" :hint="SETTING_HINTS[p.name]" removable @set="setProp(p.name, $event)" @remove="removeProp(p.name)" />
      </template>

      <!-- A stage -->
      <template v-else-if="current.kind === 'stage' && stage">
        <div class="toolbar">
          <h3 class="at__title" style="margin-right: auto">Stage {{ model.stages.indexOf(stage) + 1 }}</h3>
          <ConfirmButton :key="stage.name" label="Delete stage" @confirm="remove" />
        </div>
        <div class="option">
          <label for="at-stage-name">Name</label>
          <input id="at-stage-name" ref="nameInput" :key="stage.name" class="field" :value="stage.name" @change="renameStage" @keydown.enter="renameStage">
        </div>
        <h4 class="dc-eyebrow">Settings</h4>
        <ValueField v-for="p in settings" :key="p.name" :name="p.name" :value="p" :hint="SETTING_HINTS[p.name]" removable @set="setProp(p.name, $event)" @remove="removeProp(p.name)" />
      </template>

      <!-- A screen -->
      <template v-else-if="current.kind === 'screen' && current.prop">
        <div class="toolbar">
          <h3 class="at__title" style="margin-right: auto">{{ screenTitle(current.prop) }}</h3>
          <button type="button" class="btn btn--small btn--danger" :disabled="busy" @click="remove">Delete screen</button>
        </div>
        <p class="hint">{{ current.prop.kind === 'text' ? `What players see ${current.prop.name === 'waitingScreen' ? 'while they wait' : 'while they play'} in ${ownerName}: its elements are under it in the tree. Add puts one in at the end.` : 'This screen is made by code, so it is changed as code.' }}</p>
        <details v-if="current.prop.kind === 'text'" class="at__html">
          <summary class="dc-eyebrow">HTML</summary>
          <ValueField :name="current.prop.name" :value="current.prop" @set="setProp(current.prop.name, $event)" />
        </details>
        <ValueField v-else :name="current.prop.name" :value="current.prop" @set="setProp(current.prop.name, $event)" />
      </template>

      <!-- A function -->
      <template v-else-if="current.kind === 'function' && current.prop">
        <h3 class="at__title">{{ current.label }}</h3>
        <p class="hint">Code jtree runs {{ current.stage == null ? 'for the whole app' : `in stage ${current.stage}` }}.</p>
        <ValueField :name="current.prop.name" :value="current.prop" removable @set="setProp(current.prop.name, $event)" @remove="remove" />
      </template>

      <!-- An element -->
      <ElementInspector v-else-if="current.kind === 'node' && current.node" :key="current.id" :node="current.node" :path="current.path ?? []" :screen="screenOf(current)" :busy="busy" @edit="screenEdit(current, $event)" />

      <!-- The rest -->
      <template v-else-if="current.kind === 'other'">
        <h3 class="at__title">Other code</h3>
        <p class="hint">Statements that are neither settings nor stages: helper functions, options, loops that make stages. Change them in Source.</p>
        <pre v-for="(o, i) in model.other" :key="i" class="code">{{ o.code }}</pre>
      </template>

      <!-- Settings to add, to the app or the stage -->
      <div v-if="current.kind === 'app' || current.kind === 'stage'" class="toolbar at__adder">
        <select v-model="newSetting" class="field" aria-label="Setting to add">
          <option value="">Add a setting…</option>
          <option v-for="n in missingSettings" :key="n" :value="n">{{ n }}</option>
          <option value="*">Another value (number)…</option>
        </select>
        <input v-if="newSetting === '*'" v-model="customName" class="field dc-mono" placeholder="name, e.g. endowment" aria-label="Name of the value">
        <button type="button" class="btn" :disabled="!canAddSetting" @click="addSetting">Add</button>
      </div>

      <div v-if="previewDoc" class="at__preview">
        <label class="check"><input v-model="preview" type="checkbox"> Preview</label>
        <iframe v-if="preview" sandbox="" :srcdoc="previewDoc" title="Screen preview" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.at { display: grid; grid-template-columns: minmax(220px, 34%) minmax(0, 1fr); gap: 16px; min-height: 0; flex: 1 1 auto; }
.at__side { display: flex; flex-direction: column; gap: 6px; min-width: 0; min-height: 0; border-right: 1px solid var(--dc-line); padding-right: 10px; }
.at__tools { flex-wrap: wrap; gap: 4px; }
.at__add { flex: 1 1 110px; min-width: 0; }
.at__tree { list-style: none; margin: 0; padding: 2px; overflow: auto; flex: 1 1 auto; min-height: 160px; border-radius: var(--dc-radius-sm); outline: none; }
.at__tree:focus-visible { box-shadow: 0 0 0 2px var(--dc-accent-bg); }
.at__keys { margin: 0; }
.at__main { display: flex; flex-direction: column; gap: 12px; min-width: 0; overflow: auto; }
.at__title { margin: 0; font-size: var(--dc-text-title); font-weight: var(--dc-weight-semibold); }
.at__adder { align-self: flex-start; }
.at__html summary { cursor: pointer; margin-bottom: 6px; }
.at__preview { display: flex; flex-direction: column; gap: 4px; }
.at__preview iframe { width: 100%; min-height: 220px; border: 1px solid var(--dc-line); border-radius: var(--dc-radius-sm); background: #fff; }
@media (max-width: 640px) {
  .at { grid-template-columns: 1fr; }
  .at__side { border-right: 0; border-bottom: 1px solid var(--dc-line); padding: 0 0 10px; }
}
</style>
