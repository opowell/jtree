<script lang="ts">
/** The editor panel last clicked or typed in, which Ctrl+S saves when the focus is on nothing. */
let lastUsed: string | null = null
</script>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import ConfirmButton from '../components/ConfirmButton.vue'
import ValueField from '../components/ValueField.vue'
import { state } from '../server/connection'
import { server } from '../server/commands'
import { APP_SETTINGS, SETTING_HINTS, STAGE_SETTINGS, emptyValue, jtreeEditor } from '../server/editor'
import type { AppModel, Edit, Prop, Value } from '../server/editor'
import { relativePath } from '../schema'
import { renameEditor, showPanel } from '../workspace'

/*
 * jtree's app editor: an app's settings, its stages (each with its settings, screens and
 * functions) and the rest of its code, from its .jtt file. Every change is made in the source by
 * the server, which leaves the rest as it was written; File → Save writes it.
 */
const props = defineProps<{ panelId: string, appPath: string }>()

const source = ref('')
const saved = ref('')
const model = ref<AppModel | null>(null)
const path = ref(props.appPath === 'new' ? '' : props.appPath)
const selected = ref('settings')
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
const app = computed(() => Object.values(state.apps).find((a) => a.appPath === path.value) ?? null)

async function open() {
  loading.value = true
  try {
    const opened = await jtreeEditor.open(props.appPath)
    path.value = opened.appPath
    source.value = saved.value = sourceDraft.value = opened.source
    model.value = opened.model
    if (opened.model.error) selected.value = 'source'
    problem.value = ''
  } catch (err) {
    problem.value = (err as Error).message
  } finally {
    loading.value = false
  }
}
onMounted(() => { if (props.appPath !== 'new') void open() })

watch(source, (s) => { if (selected.value !== 'source') sourceDraft.value = s })

// Edits run one after another, each on the source the one before left.
let queue: Promise<void> = Promise.resolve()
function edit(op: Edit) {
  queue = queue.then(async () => {
    busy.value = true
    try {
      const out = await jtreeEditor.apply(source.value, op)
      source.value = out.source
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
    source.value = sourceDraft.value
    problem.value = ''
  } catch (err) {
    problem.value = (err as Error).message
  } finally {
    busy.value = false
  }
}

async function save() {
  await queue
  if (selected.value === 'source') await applySource()
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
  source.value = sourceDraft.value = saved.value
  void applySourceNow()
}
async function applySourceNow() {
  model.value = (await jtreeEditor.model(source.value)).model
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
 * Ctrl+S saves this app: when the focus is in this panel, or when it was the editor last used and
 * the focus is on nothing (a button that went away after its click leaves it on the page).
 */
const pane = ref<HTMLElement | null>(null)
function keys(event: KeyboardEvent) {
  if (event.key !== 's' || !(event.ctrlKey || event.metaKey)) return
  const active = document.activeElement
  const here = pane.value?.contains(active) || ((!active || active === document.body) && lastUsed === props.panelId)
  if (!here || !path.value) return
  event.preventDefault()
  ;(active as HTMLElement | null)?.blur()
  if (selected.value === 'source') void applySource().then(save)
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
        <h2 class="pane__title">{{ relativePath(path).split(/[\\/]/).pop() }}</h2>
        <span class="muted dc-mono dc-truncate" style="flex: 1 1 0">{{ relativePath(path) }}</span>
        <span v-if="dirty" class="ed__dirty" title="Changed since it was saved">● not saved</span>
        <button type="button" class="btn" :disabled="!dirty || busy" @click="revert">Revert</button>
        <button type="button" class="btn btn--primary" :disabled="!dirty || busy" title="Ctrl+S" @click="save">Save</button>
        <button type="button" class="btn" :disabled="busy || !state.connected || Boolean(model?.error)" @click="startSession">Save and start a session</button>
      </header>
      <p v-if="problem" class="ed__problem" role="alert">{{ problem }}</p>
      <p v-if="loading" class="hint">Opening…</p>

      <div v-if="model" class="ed__body">
        <nav class="ed__nav" aria-label="Parts of the app">
          <div class="dc-eyebrow">App</div>
          <button type="button" class="ed__link" :aria-current="selected === 'settings'" :disabled="Boolean(model.error)" @click="selected = 'settings'">Settings <span class="muted">{{ appSettings.length }}</span></button>
          <button type="button" class="ed__link" :aria-current="selected === 'functions'" :disabled="Boolean(model.error)" @click="selected = 'functions'">Functions <span class="muted">{{ appFunctions.length }}</span></button>
          <div class="dc-eyebrow ed__group">Stages</div>
          <ol class="ed__stages">
            <li v-for="(s, i) in model.stages" :key="s.name">
              <button type="button" class="ed__link" :aria-current="selected === `stage:${s.name}`" @click="selected = `stage:${s.name}`"><span class="list__index">{{ i + 1 }}</span> <span class="dc-truncate">{{ s.name }}</span></button>
            </li>
          </ol>
          <p v-if="model.otherStages" class="hint">Some stages are made by other code; see Other code.</p>
          <form class="ed__add" @submit.prevent="addStage">
            <input v-model="newStage" class="field" placeholder="New stage" aria-label="Name of a new stage" :disabled="Boolean(model.error)">
            <button type="submit" class="btn btn--small" :disabled="!newStage.trim() || busy">Add</button>
          </form>
          <div class="dc-eyebrow ed__group">Code</div>
          <button type="button" class="ed__link" :aria-current="selected === 'other'" @click="selected = 'other'">Other code <span class="muted">{{ model.other.length }}</span></button>
          <button type="button" class="ed__link" :aria-current="selected === 'source'" @click="selected = 'source'">Source</button>
        </nav>

        <section class="ed__main">
          <p v-if="model.error && selected !== 'source'" class="ed__problem">The source does not parse (line {{ model.error.line }}): {{ model.error.message }}. Fix it in Source.</p>

          <!-- App settings -->
          <template v-else-if="selected === 'settings'">
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

          <template v-else-if="selected === 'source'">
            <div class="toolbar">
              <h3 class="ed__title" style="margin-right: auto">Source</h3>
              <button type="button" class="btn" :disabled="sourceDraft === source || busy" title="Ctrl+Enter" @click="applySource">Apply</button>
            </div>
            <p class="hint">The whole file. Apply (Ctrl+Enter) reads it again into the other views.</p>
            <textarea v-model="sourceDraft" class="field dc-mono ed__source" spellcheck="false" aria-label="Source" @keydown="sourceKey" />
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
