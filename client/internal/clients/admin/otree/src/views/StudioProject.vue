<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import CodeEditor from '../components/CodeEditor.vue'
import { pyList, pyQuote, pyString, studio } from '../studio'
import type { ProjectInfo, SessionConfig, SettingsModel } from '../studio'

/*
 * An oTree project, as oTree Studio shows one: its apps, its session configs (which apps a
 * session plays, in order, for how many participants) and its settings. Changes are made in its
 * settings.py by the server, which leaves the rest as it was written; Save writes it.
 */
const props = defineProps<{ settingsPath: string }>()

const source = ref('')
const saved = ref('')
const model = ref<SettingsModel | null>(null)
const project = ref<ProjectInfo | null>(null)
const problem = ref('')
const notice = ref('')
const busy = ref(false)
const newApp = ref('')
const codeDraft = ref('')
const showCode = ref(false)

const dirty = computed(() => source.value !== saved.value)
const apps = computed(() => project.value?.apps ?? [])
const configs = computed(() => model.value?.configs?.items ?? [])

async function open() {
  try {
    const [opened, listed] = await Promise.all([studio.openProject(props.settingsPath), studio.list()])
    source.value = saved.value = codeDraft.value = opened.source
    model.value = opened.model
    project.value = listed.projects.find((p) => p.settingsPath === opened.settingsPath) ?? null
    problem.value = ''
  } catch (err) {
    problem.value = (err as Error).message
  }
}
onMounted(open)

// Ctrl+S saves, wherever the focus is.
function keys(e: KeyboardEvent) {
  if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    ;(document.activeElement as HTMLElement | null)?.blur()
    void save()
  }
}
onMounted(() => window.addEventListener('keydown', keys))
onUnmounted(() => window.removeEventListener('keydown', keys))

let queue: Promise<unknown> = Promise.resolve()
function edit(op: Record<string, unknown> & { op: string }) {
  queue = queue.then(async () => {
    busy.value = true
    try {
      const out = await studio.applySettings(source.value, op)
      source.value = codeDraft.value = out.source
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

async function save() {
  await queue
  busy.value = true
  try {
    await studio.saveProject(props.settingsPath, source.value)
    saved.value = source.value
    notice.value = 'Saved settings.py.'
    setTimeout(() => (notice.value = ''), 4000)
  } catch (err) {
    problem.value = (err as Error).message
  } finally {
    busy.value = false
  }
}

async function applyCode() {
  try {
    model.value = (await studio.settingsModel(codeDraft.value)).model
    source.value = codeDraft.value
    problem.value = ''
  } catch (err) {
    problem.value = (err as Error).message
  }
}

/* --------------------------------------------------- session configs */

const entry = (c: SessionConfig, key: string) => c.entries.find((e) => e.key === key)?.code
function setEntry(index: number, key: string, code: string | null) {
  const c = configs.value[index]
  const entries = c.entries.filter((e) => e.key !== key || code != null)
  const at = entries.findIndex((e) => e.key === key)
  if (code != null) {
    if (at === -1) entries.push({ key, code })
    else entries[at] = { key, code }
  }
  void edit({ op: 'setConfig', index, entries })
}
const onText = (i: number, key: string, e: Event) => setEntry(i, key, pyQuote((e.target as HTMLInputElement).value))
const onCode = (i: number, key: string, e: Event) => { const v = (e.target as HTMLInputElement).value.trim(); setEntry(i, key, v === '' ? null : v) }
const sequenceOf = (c: SessionConfig) => pyList(entry(c, 'app_sequence')) ?? []
function setSequence(i: number, names: string[]) {
  setEntry(i, 'app_sequence', `[${names.map(pyQuote).join(', ')}]`)
}
function addToSequence(i: number, e: Event) {
  const select = e.target as HTMLSelectElement
  if (select.value) setSequence(i, [...sequenceOf(configs.value[i]), select.value])
  select.value = ''
}
function moveInSequence(i: number, at: number, by: number) {
  const names = [...sequenceOf(configs.value[i])]
  const j = at + by
  if (j < 0 || j >= names.length) return
  ;[names[at], names[j]] = [names[j], names[at]]
  setSequence(i, names)
}
const FIXED = ['name', 'display_name', 'app_sequence', 'num_demo_participants', 'doc']
const extraEntries = (c: SessionConfig) => c.entries.filter((e) => !FIXED.includes(e.key))
const newKey = reactive<Record<number, { key: string, code: string }>>({})
/** The new setting being typed for config i. */
const nk = (i: number) => (newKey[i] ??= { key: '', code: '' })
function addEntry(i: number) {
  const k = newKey[i]
  if (!k || !/^[A-Za-z_]\w*$/.test(k.key.trim())) return
  setEntry(i, k.key.trim(), k.code.trim() || 'None')
  newKey[i] = { key: '', code: '' }
}

function addConfig() {
  let n = 1
  while (configs.value.some((c) => pyString(entry(c, 'name')) === `session_${n}`)) n++
  void edit({ op: 'addConfig', entries: [
    { key: 'name', code: pyQuote(`session_${n}`) },
    { key: 'display_name', code: pyQuote(`Session ${n}`) },
    { key: 'app_sequence', code: `[${apps.value[0] ? pyQuote(apps.value[0].name) : ''}]` },
    { key: 'num_demo_participants', code: '2' },
  ] })
}

/* ------------------------------------------------------------ settings */

const SETTINGS: Array<{ name: string, label: string, kind: 'text' | 'code' | 'bool' }> = [
  { name: 'REAL_WORLD_CURRENCY_CODE', label: 'Currency', kind: 'text' },
  { name: 'USE_POINTS', label: 'Use points', kind: 'bool' },
  { name: 'LANGUAGE_CODE', label: 'Language', kind: 'text' },
  { name: 'PARTICIPANT_FIELDS', label: 'Participant fields', kind: 'code' },
  { name: 'SESSION_FIELDS', label: 'Session fields', kind: 'code' },
  { name: 'SESSION_CONFIG_DEFAULTS', label: 'Session config defaults', kind: 'code' },
]
const setting = (name: string) => model.value?.settings.find((s) => s.name === name)?.code
function onSetting(name: string, kind: string, e: Event | string) {
  const input = typeof e === 'string' ? { value: e, checked: false } : e.target as HTMLInputElement
  if (typeof e === 'string' && e === (setting(name) ?? '')) return
  const code = kind === 'bool' ? (input.checked ? 'True' : 'False') : kind === 'text' ? pyQuote(input.value) : input.value.trim()
  void edit(code === '' ? { op: 'removeSetting', name } : { op: 'setSetting', name, code })
}

/* ---------------------------------------------------------------- apps */

async function createApp() {
  if (!project.value) return
  try {
    const app = await studio.createApp(project.value.dir, newApp.value.trim())
    location.hash = `#/studio/app/${encodeURIComponent(app.dir)}`
  } catch (err) {
    problem.value = (err as Error).message
  }
}
</script>

<template>
  <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
    <a href="#/studio" class="btn btn-sm btn-link px-0">Studio</a><span class="text-body-secondary">/</span>
    <h1 class="h4 mb-0">{{ project?.name ?? 'Project' }}</h1>
    <span class="small text-body-secondary text-truncate" style="max-width: 40ch">{{ settingsPath }}</span>
    <span class="ms-auto" />
    <span v-if="dirty" class="badge text-bg-warning">not saved</span>
    <span v-if="notice" class="badge text-bg-success">{{ notice }}</span>
    <button class="btn btn-outline-secondary btn-sm" :disabled="!dirty || busy" @click="open">Revert</button>
    <button class="btn btn-primary btn-sm" :disabled="!dirty || busy" title="Ctrl+S" @click="save">Save</button>
  </div>
  <div v-if="problem" class="alert alert-danger py-2" role="alert">{{ problem }}</div>

  <div class="row g-4">
    <div class="col-lg-4">
      <div class="card mb-4">
        <div class="card-header fw-semibold">Apps</div>
        <ul class="list-group list-group-flush">
          <li v-for="a in apps" :key="a.dir" class="list-group-item d-flex align-items-center">
            <a :href="`#/studio/app/${encodeURIComponent(a.dir)}`" class="font-monospace">{{ a.name }}</a>
            <span v-if="a.format === 'old'" class="badge text-bg-light ms-auto">older format</span>
          </li>
          <li v-if="!apps.length" class="list-group-item text-body-secondary small">No apps yet.</li>
        </ul>
        <form class="card-body" @submit.prevent="createApp">
          <div class="input-group input-group-sm">
            <input v-model="newApp" class="form-control font-monospace" placeholder="my_app" aria-label="New app's name" pattern="[a-z_][a-z0-9_]*" title="Lower case letters, digits and _">
            <button class="btn btn-outline-primary" :disabled="!newApp.trim()">New app</button>
          </div>
        </form>
      </div>

      <div v-if="model && !model.error" class="card">
        <div class="card-header fw-semibold">Settings</div>
        <div class="card-body">
          <div v-for="s in SETTINGS" :key="s.name" class="mb-2">
            <div v-if="s.kind === 'bool'" class="form-check">
              <input :id="`set-${s.name}`" class="form-check-input" type="checkbox" :checked="setting(s.name) === 'True'" @change="onSetting(s.name, s.kind, $event)">
              <label class="form-check-label small" :for="`set-${s.name}`">{{ s.label }}</label>
            </div>
            <template v-else>
              <label class="form-label small mb-0" :for="`set-${s.name}`">{{ s.label }} <span class="font-monospace text-body-secondary">{{ s.name }}</span></label>
              <CodeEditor v-if="s.kind === 'code' && (setting(s.name) ?? '').includes('\n')" :id="`set-${s.name}`" :model-value="setting(s.name) ?? ''" language="python" :label="s.name" :min-lines="(setting(s.name) ?? '').split('\n').length" @blur="(v) => onSetting(s.name, s.kind, v)" @commit="(v) => onSetting(s.name, s.kind, v)" />
              <input v-else :id="`set-${s.name}`" class="form-control form-control-sm" :class="{ 'font-monospace': s.kind === 'code' }" :value="s.kind === 'text' ? pyString(setting(s.name)) ?? setting(s.name) ?? '' : setting(s.name) ?? ''" @change="onSetting(s.name, s.kind, $event)">
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="col-lg-8">
      <div v-if="model?.error" class="alert alert-danger">settings.py does not parse (line {{ model.error.line }}): {{ model.error.message }}.</div>
      <template v-else-if="model">
        <div class="d-flex align-items-center mb-2">
          <h2 class="h5 mb-0 me-auto">Session configs</h2>
          <button class="btn btn-sm btn-outline-primary" :disabled="busy" @click="addConfig">Add session config</button>
        </div>
        <p v-if="!configs.length" class="text-body-secondary small">No session configs: add one to play the apps in a session.</p>
        <div v-for="(c, i) in configs" :key="i" class="card mb-3">
          <div v-if="!c.style" class="card-body small">
            <p class="text-body-secondary">This config is not written as a dict, so it is shown as it is:</p>
            <pre class="mb-0">{{ c.code }}</pre>
          </div>
          <div v-else class="card-body">
            <div class="row g-2">
              <div class="col-sm-4"><label class="form-label small mb-0" :for="`cn-${i}`">name</label><input :id="`cn-${i}`" class="form-control form-control-sm font-monospace" :value="pyString(entry(c, 'name')) ?? entry(c, 'name') ?? ''" @change="onText(i, 'name', $event)"></div>
              <div class="col-sm-5"><label class="form-label small mb-0" :for="`cd-${i}`">display_name</label><input :id="`cd-${i}`" class="form-control form-control-sm" :value="pyString(entry(c, 'display_name')) ?? entry(c, 'display_name') ?? ''" @change="onText(i, 'display_name', $event)"></div>
              <div class="col-sm-3"><label class="form-label small mb-0" :for="`cp-${i}`">num_demo_participants</label><input :id="`cp-${i}`" class="form-control form-control-sm" type="number" min="1" :value="entry(c, 'num_demo_participants') ?? ''" @change="onCode(i, 'num_demo_participants', $event)"></div>
              <div class="col-12">
                <span class="form-label small d-block mb-1">app_sequence</span>
                <div class="d-flex flex-wrap gap-2 align-items-center">
                  <span v-for="(a, k) in sequenceOf(c)" :key="k" class="badge text-bg-light border d-inline-flex align-items-center gap-1 font-monospace">
                    <button class="btn btn-link btn-sm p-0 text-decoration-none" :disabled="k === 0" :aria-label="`Move ${a} earlier`" @click="moveInSequence(i, k, -1)">‹</button>
                    {{ a }}
                    <button class="btn btn-link btn-sm p-0 text-decoration-none" :disabled="k === sequenceOf(c).length - 1" :aria-label="`Move ${a} later`" @click="moveInSequence(i, k, 1)">›</button>
                    <button class="btn btn-link btn-sm p-0 text-danger text-decoration-none" :aria-label="`Take ${a} out`" @click="setSequence(i, sequenceOf(c).filter((_, j) => j !== k))">✕</button>
                  </span>
                  <select class="form-select form-select-sm w-auto" aria-label="App to add" @change="addToSequence(i, $event)">
                    <option value="">+ app…</option>
                    <option v-for="a in apps" :key="a.name" :value="a.name">{{ a.name }}</option>
                  </select>
                  <span v-if="entry(c, 'app_sequence') && !pyList(entry(c, 'app_sequence'))" class="small text-body-secondary font-monospace">{{ entry(c, 'app_sequence') }}</span>
                </div>
              </div>
              <div class="col-12"><label class="form-label small mb-0" :for="`cdoc-${i}`">doc</label><input :id="`cdoc-${i}`" class="form-control form-control-sm" :value="pyString(entry(c, 'doc')) ?? entry(c, 'doc') ?? ''" @change="onText(i, 'doc', $event)"></div>
              <div v-for="e in extraEntries(c)" :key="e.key" class="col-sm-6">
                <div class="input-group input-group-sm font-monospace">
                  <span class="input-group-text">{{ e.key }}</span>
                  <input class="form-control" :value="e.code" @change="onCode(i, e.key, $event)">
                  <button class="btn btn-outline-danger" :aria-label="`Remove ${e.key}`" @click="setEntry(i, e.key, null)">✕</button>
                </div>
              </div>
              <div class="col-12">
                <form class="input-group input-group-sm font-monospace" style="max-width: 32em" @submit.prevent="addEntry(i)">
                  <input v-model="nk(i).key" class="form-control" placeholder="setting" aria-label="New setting">
                  <input v-model="nk(i).code" class="form-control" placeholder="value (Python)" aria-label="Its value">
                  <button class="btn btn-outline-secondary">Add</button>
                </form>
              </div>
            </div>
            <div class="text-end mt-2"><button class="btn btn-sm btn-outline-danger" @click="edit({ op: 'removeConfig', index: i })">Delete config</button></div>
          </div>
        </div>
      </template>

      <button class="btn btn-sm btn-link px-0" @click="showCode = !showCode">{{ showCode ? 'Hide' : 'Show' }} settings.py</button>
      <div v-if="showCode" class="mt-2">
        <CodeEditor v-model="codeDraft" language="python" label="settings.py" :min-lines="20" :max-lines="50" @commit="applyCode" />
        <button class="btn btn-sm btn-outline-primary mt-2" :disabled="codeDraft === source" @click="applyCode">Apply</button>
      </div>
    </div>
  </div>
</template>
