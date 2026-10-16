<script lang="ts">
/** The editor panel last clicked or typed in, which Ctrl+S saves when the focus is on nothing. */
let lastUsed: string | null = null

export type Mode = 'structured' | 'forms' | 'source'
const MODE_KEY = 'jtree.appEditor.mode'
const MODES: Record<Mode, string> = { structured: 'Structured', forms: 'Forms', source: 'Source' }

/** The mode last chosen, in this browser. */
function storedMode(): Mode {
  try {
    const m = localStorage.getItem(MODE_KEY)
    if (m === 'forms' || m === 'structured') return m
  } catch { /* no storage: the default */ }
  return 'structured'
}
</script>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import AppTree from '../components/AppTree.vue'
import ConfirmButton from '../components/ConfirmButton.vue'
import ValueField from '../components/ValueField.vue'
import { state } from '../server/connection'
import { server } from '../server/commands'
import { APP_SETTINGS, SETTING_HINTS, STAGE_SETTINGS, describeEdit, emptyValue, jtreeEditor } from '../server/editor'
import type { AppModel, Edit, Prop, Value } from '../server/editor'
import type { TreeView } from '../appTree'
import { relativePath } from '../schema'
import { renameEditor, showPanel } from '../workspace'

/*
 * jtree's app editor: an app's settings, its stages (each with its settings, screens and
 * functions) and the rest of its code, from its .jtt file, in one of three modes: Structured (the
 * app as a tree down to its screens' elements, AppTree), Forms (a page per part) and Source.
 * Every change is made in the source by the server, which leaves the rest as it was written, and
 * is a step of the editor's history, to undo and redo; File → Save writes it.
 */
const props = defineProps<{ panelId: string, appPath: string }>()

const source = ref('')
const saved = ref('')
const model = ref<AppModel | null>(null)
const path = ref(props.appPath === 'new' ? '' : props.appPath)
const selected = ref('settings')
const mode = ref<Mode>(storedMode())
const treeView = reactive<TreeView>({ selected: 'app', collapsed: {} })

/**
 * A change, as the history keeps it: its name, the source before and after it, and what was
 * chosen (in the tree and in Forms) before and after it, so undoing and redoing it choose that
 * again.
 */
interface Step {
  label: string
  before: string
  after: string
  chosenBefore: Chosen
  chosenAfter: Chosen | null
}
interface Chosen { tree: string, form: string }

/** The changes made, oldest first; the first done of them are done, the rest undone (to redo). */
const steps = ref<Step[]>([])
const done = ref(0)
const MAX_STEPS = 200
const toUndo = computed(() => (done.value > 0 ? steps.value[done.value - 1] : null))
const toRedo = computed(() => steps.value[done.value] ?? null)
const problem = ref('')
const busy = ref(false)
const loading = ref(props.appPath !== 'new')
const sourceDraft = ref('')
const newStage = ref('')
const newSetting = ref('')
const customName = ref('')
const created = reactive({ name: 'my-app', description: '' })

const dirty = computed(() => source.value !== saved.value)
const stage = computed(() => model.value?.stages.find((s) => `stage:${s.name}` === selected.value) ?? null)
const appSettings = computed(() => (model.value?.app ?? []).filter((p) => p.kind !== 'function'))
const appFunctions = computed(() => (model.value?.app ?? []).filter((p) => p.kind === 'function'))
const missingAppSettings = computed(() => Object.keys(APP_SETTINGS).filter((n) => !model.value?.app.some((p) => p.name === n)))
const missingAppHooks = computed(() => Object.keys(model.value?.appHooks ?? {}).filter((n) => !model.value?.app.some((p) => p.name === n)))
const stageSettings = computed(() => (stage.value?.props ?? []).filter((p) => p.kind !== 'function' && p.kind !== 'text' && !/Screen$/.test(p.name)))
const stageScreens = computed(() => (stage.value?.props ?? []).filter((p) => p.kind === 'text' || /Screen$/.test(p.name)))
const stageFunctions = computed(() => (stage.value?.props ?? []).filter((p) => p.kind === 'function'))
const missingStageSettings = computed(() => Object.keys(STAGE_SETTINGS).filter((n) => !stage.value?.props.some((p) => p.name === n)))
const missingStageScreens = computed(() => ['activeScreen', 'waitingScreen'].filter((n) => !stage.value?.props.some((p) => p.name === n)))
const missingStageHooks = computed(() => Object.keys(model.value?.stageHooks ?? {}).filter((n) => !stage.value?.props.some((p) => p.name === n)))
const fileName = computed(() => relativePath(path.value).split(/[\\/]/).pop() ?? '')
const app = computed(() => Object.values(state.apps).find((a) => a.appPath === path.value) ?? null)

async function open() {
  loading.value = true
  try {
    const opened = await jtreeEditor.open(props.appPath)
    path.value = opened.appPath
    source.value = saved.value = sourceDraft.value = opened.source
    model.value = opened.model
    if (opened.model.error) mode.value = 'source'
    problem.value = ''
  } catch (err) {
    problem.value = (err as Error).message
  } finally {
    loading.value = false
  }
}
onMounted(() => { if (props.appPath !== 'new') void open() })

watch(source, (s) => { if (mode.value !== 'source') sourceDraft.value = s })

function setMode(m: Mode) {
  if (m === mode.value) return
  // Leaving Source applies what was typed there.
  if (mode.value === 'source') void applySource()
  mode.value = m
  if (m !== 'source') try { localStorage.setItem(MODE_KEY, m) } catch { /* not remembered */ }
}

const chosen = (): Chosen => ({ tree: treeView.selected, form: selected.value })

/** Source changed (by an edit, Source or Revert): a step of the history, after the ones done. */
function changed(to: string, label: string, before: Chosen = chosen()) {
  if (to === source.value) return
  steps.value.splice(done.value, Infinity, { label, before: source.value, after: to, chosenBefore: before, chosenAfter: null })
  if (steps.value.length > MAX_STEPS) steps.value.splice(0, steps.value.length - MAX_STEPS)
  done.value = steps.value.length
  source.value = to
}

/** Undoes or redoes changes until n of them are done: the source, and what was chosen, as they were then. */
async function goTo(n: number) {
  await queue
  n = Math.max(0, Math.min(steps.value.length, n))
  if (n === done.value) return
  if (mode.value === 'source') sourceDraft.value = source.value
  let pick: Chosen | null = null
  while (done.value > n) {
    const step = steps.value[done.value - 1]
    // What was chosen after it is what is chosen now, if it was the last one done.
    step.chosenAfter ??= chosen()
    done.value--
    pick = step.chosenBefore
  }
  while (done.value < n) {
    const step = steps.value[done.value]
    done.value++
    pick = step.chosenAfter ?? step.chosenBefore
  }
  source.value = sourceDraft.value = done.value ? steps.value[done.value - 1].after : steps.value[0].before
  await applySourceNow()
  if (pick) {
    treeView.selected = pick.tree
    selected.value = pick.form
  }
}
const undo = () => goTo(done.value - 1)
const redo = () => goTo(done.value + 1)

function pickStep(event: Event) {
  void goTo(Number((event.target as HTMLSelectElement).value))
}

// Edits run one after another, each on the source the one before left.
let queue: Promise<void> = Promise.resolve()
function edit(op: Edit, label = describeEdit(op)) {
  // What is chosen when the edit is asked for: chosen again when it is undone.
  const before = chosen()
  queue = queue.then(async () => {
    busy.value = true
    try {
      const out = await jtreeEditor.apply(source.value, op)
      // A step done before this one learns what was chosen after it.
      const last = steps.value[done.value - 1]
      if (last && !last.chosenAfter) last.chosenAfter = before
      changed(out.source, label, before)
      model.value = out.model
      problem.value = ''
    } catch (err) {
      problem.value = (err as Error).message
    } finally {
      busy.value = false
    }
  })
  return queue
}

async function applySource() {
  if (sourceDraft.value === source.value) return
  busy.value = true
  try {
    model.value = (await jtreeEditor.model(sourceDraft.value)).model
    changed(sourceDraft.value, 'Edit source')
    problem.value = ''
  } catch (err) {
    problem.value = (err as Error).message
  } finally {
    busy.value = false
  }
}

async function save() {
  await queue
  if (mode.value === 'source') await applySource()
  busy.value = true
  try {
    await jtreeEditor.save(path.value, source.value)
    saved.value = source.value
    problem.value = ''
  } catch (err) {
    problem.value = (err as Error).message
  } finally {
    busy.value = false
  }
}

function revert() {
  changed(saved.value, 'Revert to saved')
  sourceDraft.value = saved.value
  void applySourceNow()
}
async function applySourceNow() {
  try {
    model.value = (await jtreeEditor.model(source.value)).model
    problem.value = ''
  } catch (err) {
    problem.value = (err as Error).message
  }
}

async function create() {
  busy.value = true
  try {
    const opened = await jtreeEditor.create(created.name.trim(), created.description.trim())
    path.value = opened.appPath
    source.value = saved.value = sourceDraft.value = opened.source
    model.value = opened.model
    problem.value = ''
    renameEditor(props.panelId, opened.appPath)
  } catch (err) {
    problem.value = (err as Error).message
  } finally {
    busy.value = false
  }
}

async function startSession() {
  if (dirty.value) await save()
  if (app.value) {
    await server.createSessionWithApp(app.value.id)
    showPanel('session')
  }
}

function setApp(p: Prop | string, value: Value) {
  void edit({ op: 'setAppProp', name: typeof p === 'string' ? p : p.name, value })
}

const canAddSetting = computed(() => newSetting.value !== '' && (newSetting.value !== '*' || /^[A-Za-z_$][\w$]*$/.test(customName.value.trim())))

function addAppSetting() {
  const name = newSetting.value === '*' ? customName.value.trim() : newSetting.value
  if (!/^[A-Za-z_$][\w$]*$/.test(name)) return
  setApp(name, emptyValue(APP_SETTINGS[name] ?? 'number'))
  newSetting.value = ''
  customName.value = ''
}

function setStage(name: string, value: Value) {
  if (stage.value) void edit({ op: 'setStageProp', stage: stage.value.name, name, value })
}

function addStageSetting(event: Event) {
  const select = event.target as HTMLSelectElement
  const name = select.value
  select.value = ''
  if (name) setStage(name, emptyValue(STAGE_SETTINGS[name]))
}

async function addStage() {
  const name = newStage.value.trim()
  if (!name) return
  await edit({ op: 'addStage', name, after: stage.value?.name })
  newStage.value = ''
  if (model.value?.stages.some((s) => s.name === name)) selected.value = `stage:${name}`
}

async function renameStage(event: Event) {
  const to = (event.target as HTMLInputElement).value.trim()
  if (!stage.value || !to || to === stage.value.name) return
  await edit({ op: 'renameStage', name: stage.value.name, to })
  if (model.value?.stages.some((s) => s.name === to)) selected.value = `stage:${to}`
}

function moveStage(name: string, by: number) {
  const index = model.value!.stages.findIndex((s) => s.name === name)
  void edit({ op: 'moveStage', name, to: index + by })
}

async function deleteStage(name: string) {
  await edit({ op: 'deleteStage', name })
  selected.value = 'settings'
}

function sourceKey(event: KeyboardEvent) {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault()
    void applySource()
  }
}

/*
 * Ctrl+S saves this app, and Ctrl+Z / Ctrl+Shift+Z (Ctrl+Y) undo and redo its changes (outside
 * text fields, which undo their own typing): when the focus is in this panel, or when it was the
 * editor last used and the focus is on nothing (a button that went away after its click leaves
 * it on the page).
 */
const pane = ref<HTMLElement | null>(null)
function keys(event: KeyboardEvent) {
  if (!(event.ctrlKey || event.metaKey)) return
  const key = event.key.toLowerCase()
  if (key !== 's' && key !== 'z' && key !== 'y') return
  const active = document.activeElement
  const here = pane.value?.contains(active) || ((!active || active === document.body) && lastUsed === props.panelId)
  if (!here || !path.value) return
  if (key !== 's') {
    if (active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)) return
    event.preventDefault()
    void (key === 'z' && !event.shiftKey ? undo() : redo())
    return
  }
  event.preventDefault()
  ;(active as HTMLElement | null)?.blur()
  if (mode.value === 'source') void applySource().then(save)
  else void save()
}
const used = () => { lastUsed = props.panelId }
onMounted(() => window.addEventListener('keydown', keys))
onUnmounted(() => window.removeEventListener('keydown', keys))
</script>

<template>
  <div ref="pane" class="pane ed" @pointerdown="used" @focusin="used">
    <!-- A new app: where it goes, then the editor. -->
    <template v-if="!path">
      <header class="pane__head"><h2 class="pane__title">New app</h2></header>
      <p class="hint">A jtree app is one .jtt file in the apps folder: settings, then its stages.</p>
      <div class="option">
        <label for="new-name">File</label>
        <div class="toolbar"><span class="muted dc-mono">{{ state.settings.appFolders?.[0] ?? 'apps' }}/</span><input id="new-name" v-model="created.name" class="field dc-mono" style="flex: 1"><span class="muted dc-mono">.jtt</span></div>
        <label for="new-desc">Description</label>
        <input id="new-desc" v-model="created.description" class="field" placeholder="What participants do">
      </div>
      <div class="toolbar"><button type="button" class="btn btn--primary" :disabled="busy || !created.name.trim()" @click="create">Create</button></div>
      <p v-if="problem" class="ed__problem" role="alert">{{ problem }}</p>
    </template>

    <template v-else>
      <header class="pane__head">
        <h2 class="pane__title">{{ fileName }}</h2>
        <span class="muted dc-mono dc-truncate" style="flex: 1 1 0">{{ relativePath(path) }}</span>
        <span v-if="dirty" class="ed__dirty" title="Changed since it was saved">● not saved</span>
        <button type="button" class="btn" :disabled="!toUndo || busy" :title="toUndo ? `Undo ${toUndo.label} (Ctrl+Z)` : 'Nothing to undo'" @click="undo">Undo</button>
        <button type="button" class="btn" :disabled="!toRedo || busy" :title="toRedo ? `Redo ${toRedo.label} (Ctrl+Shift+Z)` : 'Nothing to redo'" @click="redo">Redo</button>
        <select class="field ed__history" aria-label="History: go back or forward to a change" title="History" :value="done" :disabled="!steps.length || busy" @change="pickStep">
          <option :value="0">Opened</option>
          <option v-for="(st, i) in steps" :key="i" :value="i + 1">{{ i + 1 }}. {{ st.label }}{{ i + 1 > done ? ' (undone)' : '' }}</option>
        </select>
        <button type="button" class="btn" :disabled="!dirty || busy" @click="revert">Revert</button>
        <button type="button" class="btn btn--primary" :disabled="!dirty || busy" title="Ctrl+S" @click="save">Save</button>
        <button type="button" class="btn" :disabled="busy || !state.connected || Boolean(model?.error)" @click="startSession">Save and start a session</button>
      </header>
      <div class="ed__modes" role="tablist" aria-label="Mode">
        <button v-for="(label, m) in MODES" :key="m" type="button" role="tab" class="ed__mode" :aria-selected="mode === m" @click="setMode(m)">{{ label }}</button>
      </div>
      <p v-if="problem" class="ed__problem" role="alert">{{ problem }}</p>
      <p v-if="loading" class="hint">Opening…</p>

      <div v-if="model && mode === 'source'" class="ed__main">
        <div class="toolbar">
          <p class="hint" style="margin: 0 auto 0 0">The whole file. Apply (Ctrl+Enter) reads it again into the other modes.</p>
          <button type="button" class="btn" :disabled="sourceDraft === source || busy" title="Ctrl+Enter" @click="applySource">Apply</button>
        </div>
        <p v-if="model.error" class="ed__problem">The source does not parse (line {{ model.error.line }}): {{ model.error.message }}.</p>
        <textarea v-model="sourceDraft" class="field dc-mono ed__source" spellcheck="false" aria-label="Source" @keydown="sourceKey" />
      </div>

      <p v-else-if="model && model.error" class="ed__problem">The source does not parse (line {{ model.error.line }}): {{ model.error.message }}. Fix it in Source.</p>

      <AppTree v-else-if="model && mode === 'structured'" :model="model" :title="fileName" :busy="busy" :edit="edit" :view="treeView" />

      <div v-else-if="model" class="ed__body">
        <nav class="ed__nav" aria-label="Parts of the app">
          <div class="dc-eyebrow">App</div>
          <button type="button" class="ed__link" :aria-current="selected === 'settings'" @click="selected = 'settings'">Settings <span class="muted">{{ appSettings.length }}</span></button>
          <button type="button" class="ed__link" :aria-current="selected === 'functions'" @click="selected = 'functions'">Functions <span class="muted">{{ appFunctions.length }}</span></button>
          <div class="dc-eyebrow ed__group">Stages</div>
          <ol class="ed__stages">
            <li v-for="(s, i) in model.stages" :key="s.name">
              <button type="button" class="ed__link" :aria-current="selected === `stage:${s.name}`" @click="selected = `stage:${s.name}`"><span class="list__index">{{ i + 1 }}</span> <span class="dc-truncate">{{ s.name }}</span></button>
            </li>
          </ol>
          <p v-if="model.otherStages" class="hint">Some stages are made by other code; see Other code.</p>
          <form class="ed__add" @submit.prevent="addStage">
            <input v-model="newStage" class="field" placeholder="New stage" aria-label="Name of a new stage">
            <button type="submit" class="btn btn--small" :disabled="!newStage.trim() || busy">Add</button>
          </form>
          <div class="dc-eyebrow ed__group">Code</div>
          <button type="button" class="ed__link" :aria-current="selected === 'other'" @click="selected = 'other'">Other code <span class="muted">{{ model.other.length }}</span></button>
        </nav>

        <section class="ed__main">
          <!-- App settings -->
          <template v-if="selected === 'settings'">
            <h3 class="ed__title">Settings</h3>
            <p class="hint">What the app sets on <code>app</code>: <code>app.numPeriods = 10;</code> and the like. Values used in screens and functions go here too.</p>
            <ValueField v-for="p in appSettings" :key="p.name" :name="p.name" :value="p" :hint="SETTING_HINTS[p.name]" removable @set="setApp(p, $event)" @remove="edit({ op: 'removeAppProp', name: p.name })" />
            <div class="toolbar ed__adder">
              <select v-model="newSetting" class="field" aria-label="Setting to add">
                <option value="">Add a setting…</option>
                <option v-for="n in missingAppSettings" :key="n" :value="n">{{ n }}</option>
                <option value="*">Another value (number)…</option>
              </select>
              <input v-if="newSetting === '*'" v-model="customName" class="field dc-mono" placeholder="name, e.g. endowment" aria-label="Name of the value">
              <button type="button" class="btn" :disabled="!canAddSetting" @click="addAppSetting">Add</button>
            </div>
          </template>

          <!-- App functions -->
          <template v-else-if="selected === 'functions'">
            <h3 class="ed__title">Functions</h3>
            <p class="hint">Code jtree runs for the whole app: when a period, group or player starts or ends.</p>
            <ValueField v-for="p in appFunctions" :key="p.name" :name="p.name" :value="p" removable @set="setApp(p, $event)" @remove="edit({ op: 'removeAppProp', name: p.name })" />
            <div class="toolbar">
              <button v-for="h in missingAppHooks" :key="h" type="button" class="btn btn--small dc-mono" @click="setApp(h, emptyValue('function', model.appHooks[h]))">+ {{ h }}({{ model.appHooks[h].join(', ') }})</button>
            </div>
          </template>

          <!-- A stage -->
          <template v-else-if="stage">
            <div class="toolbar">
              <h3 class="ed__title" style="margin-right: auto">Stage {{ model.stages.indexOf(stage) + 1 }}</h3>
              <button type="button" class="btn btn--small" :disabled="model.stages.indexOf(stage) === 0 || busy" @click="moveStage(stage.name, -1)">Move up</button>
              <button type="button" class="btn btn--small" :disabled="model.stages.indexOf(stage) === model.stages.length - 1 || busy" @click="moveStage(stage.name, 1)">Move down</button>
              <ConfirmButton :key="stage.name" label="Delete stage" @confirm="deleteStage(stage.name)" />
            </div>
            <div class="option">
              <label for="stage-name">Name</label>
              <input id="stage-name" :key="stage.name" class="field" :value="stage.name" @change="renameStage">
            </div>

            <h4 class="dc-eyebrow">Screens</h4>
            <ValueField v-for="p in stageScreens" :key="p.name" :name="p.name" :value="p" :hint="SETTING_HINTS[p.name]" removable @set="setStage(p.name, $event)" @remove="edit({ op: 'removeStageProp', stage: stage.name, name: p.name })" />
            <div v-if="missingStageScreens.length" class="toolbar">
              <button v-for="n in missingStageScreens" :key="n" type="button" class="btn btn--small dc-mono" @click="setStage(n, emptyValue('text'))">+ {{ n }}</button>
            </div>

            <h4 class="dc-eyebrow">Settings</h4>
            <ValueField v-for="p in stageSettings" :key="p.name" :name="p.name" :value="p" :hint="SETTING_HINTS[p.name]" removable @set="setStage(p.name, $event)" @remove="edit({ op: 'removeStageProp', stage: stage.name, name: p.name })" />
            <select v-if="missingStageSettings.length" class="field ed__adder" aria-label="Stage setting to add" @change="addStageSetting">
              <option value="">Add a setting…</option>
              <option v-for="n in missingStageSettings" :key="n" :value="n">{{ n }}</option>
            </select>

            <h4 class="dc-eyebrow">Functions</h4>
            <p class="hint">Code jtree runs when a group or player starts or ends this stage, and who plays it.</p>
            <ValueField v-for="p in stageFunctions" :key="p.name" :name="p.name" :value="p" removable @set="setStage(p.name, $event)" @remove="edit({ op: 'removeStageProp', stage: stage.name, name: p.name })" />
            <div class="toolbar">
              <button v-for="h in missingStageHooks" :key="h" type="button" class="btn btn--small dc-mono" @click="setStage(h, emptyValue('function', model.stageHooks[h]))">+ {{ h }}({{ model.stageHooks[h].join(', ') }})</button>
            </div>
          </template>

          <!-- The rest -->
          <template v-else-if="selected === 'other'">
            <h3 class="ed__title">Other code</h3>
            <p class="hint">Statements that are neither settings nor stages: helper functions, options, loops that make stages. Edit them in Source.</p>
            <pre v-for="(o, i) in model.other" :key="i" class="code">{{ o.code }}</pre>
            <p v-if="!model.other.length" class="hint">None.</p>
          </template>

          <p v-else class="hint">Choose a part of the app.</p>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ed { gap: 10px; }
.ed__dirty { color: var(--dc-warn); font-size: var(--dc-text-meta); }
.ed__history { width: 9em; }
.ed__modes { display: flex; gap: 2px; border-bottom: 1px solid var(--dc-line); }
.ed__mode { padding: 4px 12px; border: 0; border-bottom: 2px solid transparent; margin-bottom: -1px; background: none; color: var(--dc-fg-1); font: inherit; font-size: var(--dc-text-meta); cursor: pointer; }
.ed__mode:hover { color: var(--dc-fg-0); }
.ed__mode[aria-selected='true'] { border-bottom-color: var(--dc-accent); color: var(--dc-accent); font-weight: var(--dc-weight-semibold); }
.ed__problem { margin: 0; padding: 6px 10px; border-radius: var(--dc-radius-sm); background: var(--dc-danger-bg); color: var(--dc-danger); font-size: var(--dc-text-meta); }
.ed__body { display: grid; grid-template-columns: minmax(150px, 200px) minmax(0, 1fr); gap: 16px; min-height: 0; flex: 1 1 auto; }
.ed__nav { display: flex; flex-direction: column; gap: 2px; border-right: 1px solid var(--dc-line); padding-right: 10px; min-width: 0; }
.ed__group { margin-top: 10px; }
.ed__link { display: flex; align-items: center; gap: 6px; width: 100%; text-align: left; padding: 3px 6px; border: 0; border-radius: var(--dc-radius-sm); background: none; color: var(--dc-fg-0); font: inherit; font-size: var(--dc-text-meta); cursor: pointer; min-width: 0; }
.ed__link .muted { margin-left: auto; }
.ed__link:hover:not(:disabled) { background: var(--dc-bg-2); }
.ed__link[aria-current='true'] { background: var(--dc-accent-bg); color: var(--dc-accent); font-weight: var(--dc-weight-semibold); }
.ed__link:disabled { opacity: 0.45; cursor: default; }
.ed__stages { list-style: none; margin: 0; padding: 0; }
.ed__add { display: flex; gap: 4px; margin-top: 4px; }
.ed__add .field { flex: 1 1 auto; width: 0; }
.ed__main { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.ed__title { margin: 0; font-size: var(--dc-text-title); font-weight: var(--dc-weight-semibold); }
.ed__adder { align-self: flex-start; }
.ed__source { width: 100%; box-sizing: border-box; min-height: 420px; flex: 1 1 auto; font-size: var(--dc-text-code); line-height: 1.45; tab-size: 4; resize: vertical; }
@media (max-width: 640px) {
  .ed__body { grid-template-columns: 1fr; }
  .ed__nav { border-right: 0; border-bottom: 1px solid var(--dc-line); padding: 0 0 10px; }
}
</style>
