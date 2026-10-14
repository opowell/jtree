<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { FIELD_ARGS, FIELD_TYPES, KNOWN_FUNCTIONS, PAGE_METHODS, WAIT_PAGE_METHODS, choicesCode, choicesLines, pyList, pyQuote, pyString, studio } from '../studio'
import type { AppEdit, AppModel, Field, Fn, PageInfo, Template } from '../studio'

/*
 * An oTree app, as oTree Studio lays one out: its constants, the Subsession, Group and Player
 * fields, its functions, and its pages in their sequence, each with its template, form fields,
 * timeout and methods. Each change is made in the app's __init__.py by the server, which leaves
 * the rest of the code as it was written; Save writes it, and the pages' templates.
 */
const props = defineProps<{ dir: string }>()

const name = ref('')
const format = ref<'current' | 'old'>('current')
const source = ref('')
const saved = ref('')
const model = ref<AppModel | null>(null)
const templates = reactive<Record<string, Template>>({})
/** Templates changed here (null: the page went, and its template goes). */
const changedTemplates = reactive<Record<string, { title: string, content: string } | { text: string } | null>>({})
const section = ref('constants')
const problem = ref('')
const notice = ref('')
const busy = ref(false)
const codeDraft = ref('')

const dirty = computed(() => source.value !== saved.value || Object.keys(changedTemplates).length > 0)
const sequence = computed(() => model.value?.pageSequence?.names ?? [])
const pages = computed(() => {
  const m = model.value
  if (!m) return []
  const byName = new Map(m.pages.map((p) => [p.name, p]))
  // In the sequence's order, then pages not in it.
  return [...sequence.value.filter((n) => byName.has(n)).map((n) => byName.get(n)!), ...m.pages.filter((p) => !sequence.value.includes(p.name))]
})
const page = computed(() => pages.value.find((p) => `page:${p.name}` === section.value) ?? null)
const modelName = computed(() => (['Subsession', 'Group', 'Player'].includes(section.value) ? section.value : null))

async function open() {
  try {
    const opened = await studio.openApp(props.dir)
    name.value = opened.name
    format.value = opened.format
    source.value = saved.value = codeDraft.value = opened.source ?? ''
    model.value = opened.model
    for (const k of Object.keys(templates)) delete templates[k]
    Object.assign(templates, opened.templates)
    for (const k of Object.keys(changedTemplates)) delete changedTemplates[k]
    if (opened.model?.error) section.value = 'code'
    problem.value = ''
  } catch (err) {
    problem.value = (err as Error).message
  }
}
onMounted(open)

let queue: Promise<unknown> = Promise.resolve()
function edit(op: AppEdit): Promise<unknown> {
  queue = queue.then(async () => {
    busy.value = true
    try {
      const out = await studio.apply(source.value, op)
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
  if (section.value === 'code') await applyCode()
  busy.value = true
  try {
    await studio.saveApp(props.dir, source.value, { ...changedTemplates })
    saved.value = source.value
    for (const [k, t] of Object.entries(changedTemplates)) {
      if (t == null) delete templates[k]
      else templates[k] = 'text' in t ? { text: t.text, title: null, content: null } : { text: '', title: t.title, content: t.content }
      delete changedTemplates[k]
    }
    notice.value = `Saved ${name.value}.`
    setTimeout(() => (notice.value = ''), 4000)
    problem.value = ''
  } catch (err) {
    problem.value = (err as Error).message
  } finally {
    busy.value = false
  }
}

async function applyCode() {
  if (codeDraft.value === source.value) return
  try {
    model.value = (await studio.model(codeDraft.value)).model
    source.value = codeDraft.value
    problem.value = ''
  } catch (err) {
    problem.value = (err as Error).message
  }
}

/* ------------------------------------------------------------ constants */

const newConstant = reactive({ name: '', code: '' })
function setConstant(n: string, e: Event) {
  void edit({ op: 'setConstant', name: n, code: (e.target as HTMLInputElement).value })
}
async function addConstant() {
  await edit({ op: 'setConstant', name: newConstant.name.trim().toUpperCase(), code: newConstant.code.trim() || 'None' })
  newConstant.name = ''
  newConstant.code = ''
}

/* --------------------------------------------------------------- fields */

/** The field being edited, as its form has it. */
interface FieldForm { original: string | null, name: string, type: string, label: string, labelCode: string | null, min: string, max: string, initial: string, choices: string, choicesCode: string | null, blank: boolean, widget: string, doc: string, others: Array<{ name: string, code: string }> }
const fieldForm = ref<FieldForm | null>(null)

function editField(f: Field | null) {
  const arg = (n: string) => f?.args.find((a) => a.name === n)?.code
  const label = arg('label')
  const choices = arg('choices')
  const lines = choicesLines(choices)
  fieldForm.value = {
    original: f?.name ?? null,
    name: f?.name ?? '',
    type: f?.type ?? 'IntegerField',
    label: pyString(label) ?? '',
    labelCode: label != null && pyString(label) == null ? label : null,
    min: arg('min') ?? '',
    max: arg('max') ?? '',
    initial: arg('initial') ?? '',
    choices: lines ?? '',
    choicesCode: lines == null ? choices ?? null : null,
    blank: arg('blank') === 'True',
    widget: (arg('widget') ?? '').replace(/^widgets\./, ''),
    doc: pyString(arg('doc')) ?? '',
    others: (f?.args ?? []).filter((a) => !FIELD_ARGS.includes(a.name)),
  }
}

async function saveField() {
  const f = fieldForm.value
  if (!f || !modelName.value) return
  const args: Array<{ name: string, code: string }> = []
  if (f.labelCode != null) args.push({ name: 'label', code: f.labelCode })
  else if (f.label) args.push({ name: 'label', code: pyQuote(f.label) })
  if (f.min.trim()) args.push({ name: 'min', code: f.min.trim() })
  if (f.max.trim()) args.push({ name: 'max', code: f.max.trim() })
  if (f.initial.trim()) args.push({ name: 'initial', code: f.initial.trim() })
  if (f.choicesCode != null) args.push({ name: 'choices', code: f.choicesCode })
  else if (f.choices.trim()) args.push({ name: 'choices', code: choicesCode(f.choices) })
  if (f.blank) args.push({ name: 'blank', code: 'True' })
  if (f.widget) args.push({ name: 'widget', code: `widgets.${f.widget}` })
  if (f.doc) args.push({ name: 'doc', code: pyQuote(f.doc) })
  args.push(...f.others.filter((o) => o.code.trim()))
  const target = f.original ?? f.name.trim()
  await edit({ op: 'setField', model: modelName.value, name: target, to: f.name.trim(), field: { type: f.type, args } })
  if (!problem.value) fieldForm.value = null
}

function fieldSummary(f: Field): string {
  return f.args.filter((a) => a.name !== 'label').map((a) => `${a.name}=${a.code}`).join(', ')
}

/* ------------------------------------------------------------ functions */

const fnForm = ref<{ original: string | null, name: string, params: string, body: string } | null>(null)
function editFunction(f: Fn | null, preset?: string) {
  fnForm.value = f
    ? { original: f.name, name: f.name, params: f.params.join(', '), body: f.body }
    : { original: null, name: preset ?? '', params: (KNOWN_FUNCTIONS[preset ?? ''] ?? ['player: Player']).join(', '), body: '' }
}
async function saveFunction() {
  const f = fnForm.value
  if (!f) return
  const n = f.name.trim()
  if (f.original && f.original !== n) await edit({ op: 'removeFunction', name: f.original })
  await edit({ op: 'setFunction', name: n, params: f.params.split(',').map((p) => p.trim()).filter(Boolean), body: f.body })
  if (!problem.value) fnForm.value = null
}
const missingFunctions = computed(() => Object.keys(KNOWN_FUNCTIONS).filter((n) => !model.value?.functions.some((f) => f.name === n)))

/* ---------------------------------------------------------------- pages */

const newPage = reactive({ name: '', kind: 'Page' })
async function addPage() {
  const n = newPage.name.trim()
  await edit({ op: 'addPage', name: n, kind: newPage.kind, after: page.value?.name })
  if (!problem.value) {
    if (newPage.kind === 'Page') changedTemplates[n] = { title: n, content: '{{ next_button }}' }
    section.value = `page:${n}`
    newPage.name = ''
  }
}

async function removePage(p: PageInfo) {
  await edit({ op: 'removePage', name: p.name })
  if (!problem.value) {
    if (templates[p.name] || changedTemplates[p.name]) changedTemplates[p.name] = null
    section.value = 'constants'
  }
}

async function renamePage(p: PageInfo, e: Event) {
  const to = (e.target as HTMLInputElement).value.trim()
  if (!to || to === p.name) return
  await edit({ op: 'renamePage', name: p.name, to })
  if (problem.value) return
  // Its template goes with it.
  const t = changedTemplates[p.name] ?? (templates[p.name] ? (templates[p.name].title != null ? { title: templates[p.name].title!, content: templates[p.name].content! } : { text: templates[p.name].text }) : null)
  if (t) {
    changedTemplates[to] = t
    if (templates[p.name]) changedTemplates[p.name] = null
    else delete changedTemplates[p.name]
  }
  section.value = `page:${to}`
}

function move(p: PageInfo, by: number) {
  const names = [...sequence.value]
  const i = names.indexOf(p.name)
  const j = i + by
  if (i < 0 || j < 0 || j >= names.length) return
  ;[names[i], names[j]] = [names[j], names[i]]
  void edit({ op: 'setPageSequence', names })
}

function toggleInSequence(p: PageInfo) {
  const names = sequence.value.includes(p.name) ? sequence.value.filter((n) => n !== p.name) : [...sequence.value, p.name]
  void edit({ op: 'setPageSequence', names })
}

const attr = (p: PageInfo, n: string) => p.attrs.find((a) => a.name === n)?.code
function setAttr(p: PageInfo, n: string, code: string | null) {
  void edit(code == null || code === '' ? { op: 'removePageAttr', page: p.name, name: n } : { op: 'setPageAttr', page: p.name, name: n, code })
}
const formModel = (p: PageInfo) => pyString(attr(p, 'form_model')) ?? ''
const formFields = (p: PageInfo) => pyList(attr(p, 'form_fields')) ?? []
function setFormModel(p: PageInfo, e: Event) {
  const v = (e.target as HTMLSelectElement).value
  setAttr(p, 'form_model', v ? pyQuote(v) : null)
  if (!v) setAttr(p, 'form_fields', null)
}
function toggleFormField(p: PageInfo, f: string, e: Event) {
  const on = (e.target as HTMLInputElement).checked
  const now = formFields(p)
  const next = on ? [...now, f] : now.filter((x) => x !== f)
  setAttr(p, 'form_fields', next.length ? `[${next.map(pyQuote).join(', ')}]` : null)
}
const formModelFields = (p: PageInfo) => model.value?.models[formModel(p) === 'group' ? 'Group' : 'Player']?.fields.map((f) => f.name) ?? []
const onAttr = (p: PageInfo, n: string, e: Event) => setAttr(p, n, (e.target as HTMLInputElement).value.trim())
const onBoolAttr = (p: PageInfo, n: string, e: Event) => setAttr(p, n, (e.target as HTMLInputElement).checked ? 'True' : null)
const onTextAttr = (p: PageInfo, n: string, e: Event) => { const v = (e.target as HTMLInputElement).value; setAttr(p, n, v ? pyQuote(v) : null) }
const PAGE_ATTRS = ['form_model', 'form_fields', 'timeout_seconds', 'after_all_players_arrive', 'wait_for_all_groups', 'group_by_arrival_time', 'title_text', 'body_text', 'template_name']
const otherAttrs = (p: PageInfo) => p.attrs.filter((a) => !PAGE_ATTRS.includes(a.name))

const methodsFor = (p: PageInfo) => (p.kind === 'WaitPage' ? WAIT_PAGE_METHODS : PAGE_METHODS)
const missingMethods = (p: PageInfo) => Object.keys(methodsFor(p)).filter((m) => !p.methods.some((x) => x.name === m))
const methodDrafts = reactive<Record<string, string>>({})
const methodKey = (p: PageInfo, m: Fn) => `${p.name}.${m.name}`
function methodDraft(p: PageInfo, m: Fn): string {
  const k = methodKey(p, m)
  return methodDrafts[k] ?? m.body
}
function onMethodInput(p: PageInfo, m: Fn, e: Event) {
  methodDrafts[methodKey(p, m)] = (e.target as HTMLTextAreaElement).value
}
async function saveMethod(p: PageInfo, m: Fn) {
  const k = methodKey(p, m)
  if (methodDrafts[k] == null || methodDrafts[k] === m.body) return
  await edit({ op: 'setPageMethod', page: p.name, name: m.name, params: m.params, body: methodDrafts[k] })
  delete methodDrafts[k]
}
function addMethod(p: PageInfo, n: string) {
  const body = n === 'vars_for_template' || n === 'js_vars' ? 'return dict()' : n === 'is_displayed' ? 'return True' : 'pass'
  void edit({ op: 'setPageMethod', page: p.name, name: n, params: methodsFor(p)[n], body })
}

/** The page's template as its form shows it. */
function tpl(p: PageInfo): { title: string, content: string } | { text: string } | null {
  const c = changedTemplates[p.name]
  if (c !== undefined) return c
  const t = templates[p.name]
  if (!t) return null
  return t.title != null ? { title: t.title, content: t.content ?? '' } : { text: t.text }
}
const tplTitle = (p: PageInfo) => { const t = tpl(p); return t && 'title' in t ? t.title : '' }
const tplContent = (p: PageInfo) => { const t = tpl(p); return t && 'content' in t ? t.content : '' }
const tplText = (p: PageInfo) => { const t = tpl(p); return t && 'text' in t ? t.text : null }
function setTpl(p: PageInfo, part: 'title' | 'content' | 'text', e: Event) {
  const v = (e.target as HTMLTextAreaElement).value
  if (part === 'text') changedTemplates[p.name] = { text: v }
  else changedTemplates[p.name] = { title: part === 'title' ? v : tplTitle(p), content: part === 'content' ? v : tplContent(p) }
}
function createTemplate(p: PageInfo) {
  changedTemplates[p.name] = { title: p.name, content: '{{ formfields }}\n{{ next_button }}' }
}

function tab(e: KeyboardEvent) {
  if (e.key !== 'Tab' || e.shiftKey) return
  e.preventDefault()
  const area = e.target as HTMLTextAreaElement
  const { selectionStart: s, selectionEnd: t } = area
  area.setRangeText('    ', s, t, 'end')
  area.dispatchEvent(new Event('input'))
}

// Ctrl+S saves, wherever the focus is (the page is the studio's).
function keys(e: KeyboardEvent) {
  if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    ;(document.activeElement as HTMLElement | null)?.blur()
    if (format.value !== 'old') void save()
  }
}
onMounted(() => window.addEventListener('keydown', keys))
onUnmounted(() => window.removeEventListener('keydown', keys))

</script>

<template>
  <div class="studio">
    <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
      <a href="#/studio" class="btn btn-sm btn-link px-0">Studio</a><span class="text-body-secondary">/</span>
      <h1 class="h4 mb-0">{{ name || 'App' }}</h1>
      <span class="small text-body-secondary text-truncate" style="max-width: 40ch">{{ dir }}</span>
      <span class="ms-auto" />
      <span v-if="dirty" class="badge text-bg-warning">not saved</span>
      <span v-if="notice" class="badge text-bg-success">{{ notice }}</span>
      <button class="btn btn-outline-secondary btn-sm" :disabled="!dirty || busy" @click="open">Revert</button>
      <button class="btn btn-primary btn-sm" :disabled="!dirty || busy || format === 'old'" title="Ctrl+S" @click="save">Save</button>
    </div>
    <div v-if="problem" class="alert alert-danger py-2" role="alert">{{ problem }}</div>
    <div v-if="format === 'old'" class="alert alert-info">
      This app is in oTree's older format (models.py and pages.py), which oTree Studio does not edit. It runs in jtree as it is.
    </div>

    <div v-else-if="model" class="row g-4">
      <nav class="col-md-3 col-lg-2 studio__nav" aria-label="Parts of the app">
        <div class="list-group list-group-flush small">
          <button v-for="s in ['constants', 'Subsession', 'Group', 'Player', 'functions']" :key="s" type="button" class="list-group-item list-group-item-action" :class="{ active: section === s }" :disabled="Boolean(model.error)" @click="section = s; fieldForm = null; fnForm = null">
            {{ s === 'constants' ? 'Constants (C)' : s === 'functions' ? 'Functions' : s }}
            <span v-if="model.models[s]" class="badge text-bg-light float-end">{{ model.models[s].fields.length }}</span>
          </button>
          <div class="list-group-item small text-body-secondary fw-semibold mt-2 border-0">Pages</div>
          <button v-for="(p, i) in pages" :key="p.name" type="button" class="list-group-item list-group-item-action" :class="{ active: section === `page:${p.name}`, 'text-body-secondary': !sequence.includes(p.name) }" @click="section = `page:${p.name}`">
            <span class="me-1 opacity-50">{{ sequence.includes(p.name) ? i + 1 : '–' }}</span> {{ p.name }}
            <span v-if="p.kind === 'WaitPage'" class="badge text-bg-secondary float-end">wait</span>
          </button>
          <form class="list-group-item border-0 px-0" @submit.prevent="addPage">
            <input v-model="newPage.name" class="form-control form-control-sm mb-1 font-monospace" placeholder="NewPage" aria-label="New page's name" :disabled="Boolean(model.error)">
            <div class="input-group input-group-sm">
              <select v-model="newPage.kind" class="form-select" aria-label="Kind of page"><option value="Page">Page</option><option value="WaitPage">Wait page</option></select>
              <button class="btn btn-outline-primary" :disabled="!newPage.name.trim() || busy">Add page</button>
            </div>
          </form>
          <button type="button" class="list-group-item list-group-item-action mt-2" :class="{ active: section === 'code' }" @click="section = 'code'">Code (__init__.py)</button>
        </div>
      </nav>

      <section class="col-md-9 col-lg-10">
        <div v-if="model.error && section !== 'code'" class="alert alert-danger">The code does not parse (line {{ model.error.line }}): {{ model.error.message }}. Fix it under Code.</div>

        <!-- Constants -->
        <template v-else-if="section === 'constants'">
          <h2 class="h5">Constants</h2>
          <p class="small text-body-secondary">The app's <code>C</code> class: values that are the same for everyone, written in Python (<code>cu(100)</code>, <code>'text'</code>, <code>None</code>).</p>
          <table class="table table-sm align-middle">
            <tbody>
              <tr v-for="c in model.constants?.items ?? []" :key="c.name">
                <th class="font-monospace fw-normal" style="width: 30%">{{ c.name }}</th>
                <td><input class="form-control form-control-sm font-monospace" :value="c.code" :aria-label="c.name" @change="setConstant(c.name, $event)"></td>
                <td style="width: 1%"><button class="btn btn-sm btn-outline-danger" :aria-label="`Remove ${c.name}`" @click="edit({ op: 'removeConstant', name: c.name })">✕</button></td>
              </tr>
            </tbody>
          </table>
          <form class="row g-2" @submit.prevent="addConstant">
            <div class="col-sm-4"><input v-model="newConstant.name" class="form-control form-control-sm font-monospace" placeholder="NAME" aria-label="New constant's name"></div>
            <div class="col-sm-6"><input v-model="newConstant.code" class="form-control form-control-sm font-monospace" placeholder="value" aria-label="New constant's value"></div>
            <div class="col-sm-2"><button class="btn btn-sm btn-outline-primary w-100" :disabled="!/^[A-Za-z_]\w*$/.test(newConstant.name.trim())">Add</button></div>
          </form>
        </template>

        <!-- Subsession, Group, Player -->
        <template v-else-if="modelName">
          <h2 class="h5">{{ modelName }}</h2>
          <p class="small text-body-secondary">Fields: what oTree records for each {{ modelName.toLowerCase() }}, a column of the data.</p>
          <table v-if="model.models[modelName]?.fields.length" class="table table-sm table-hover align-middle">
            <thead><tr><th>Name</th><th>Type</th><th>Label</th><th>More</th><th /></tr></thead>
            <tbody>
              <tr v-for="f in model.models[modelName].fields" :key="f.name">
                <td class="font-monospace">{{ f.name }}</td>
                <td class="small">{{ f.type }}</td>
                <td class="small">{{ (f.args.find((a) => a.name === 'label') || {}).code }}</td>
                <td class="small font-monospace text-body-secondary text-break">{{ fieldSummary(f) }}</td>
                <td class="text-nowrap" style="width: 1%">
                  <button class="btn btn-sm btn-outline-secondary me-1" @click="editField(f)">Edit</button>
                  <button class="btn btn-sm btn-outline-danger" :aria-label="`Remove ${f.name}`" @click="edit({ op: 'removeField', model: modelName, name: f.name })">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="text-body-secondary small">No fields.</p>
          <button v-if="!fieldForm" class="btn btn-sm btn-outline-primary" @click="editField(null)">Add field</button>

          <form v-if="fieldForm" class="card card-body bg-body-tertiary mt-3" @submit.prevent="saveField">
            <h3 class="h6">{{ fieldForm.original ? `Field ${fieldForm.original}` : 'New field' }}</h3>
            <div class="row g-2">
              <div class="col-sm-6"><label class="form-label small" for="ff-name">Name</label><input id="ff-name" v-model="fieldForm.name" class="form-control form-control-sm font-monospace" required pattern="[A-Za-z_]\w*"></div>
              <div class="col-sm-6"><label class="form-label small" for="ff-type">Type</label><select id="ff-type" v-model="fieldForm.type" class="form-select form-select-sm"><option v-for="t in FIELD_TYPES" :key="t" :value="t">{{ t }}</option><option v-if="!FIELD_TYPES.includes(fieldForm.type)" :value="fieldForm.type">{{ fieldForm.type }}</option></select></div>
              <div class="col-12">
                <label class="form-label small" for="ff-label">Label</label>
                <input v-if="fieldForm.labelCode == null" id="ff-label" v-model="fieldForm.label" class="form-control form-control-sm" placeholder="The question participants see">
                <input v-else id="ff-label" v-model="fieldForm.labelCode" class="form-control form-control-sm font-monospace" title="Python code">
              </div>
              <div class="col-sm-4"><label class="form-label small" for="ff-min">min</label><input id="ff-min" v-model="fieldForm.min" class="form-control form-control-sm font-monospace"></div>
              <div class="col-sm-4"><label class="form-label small" for="ff-max">max</label><input id="ff-max" v-model="fieldForm.max" class="form-control form-control-sm font-monospace"></div>
              <div class="col-sm-4"><label class="form-label small" for="ff-initial">initial</label><input id="ff-initial" v-model="fieldForm.initial" class="form-control form-control-sm font-monospace"></div>
              <div class="col-sm-6">
                <label class="form-label small" for="ff-choices">choices <span class="text-body-secondary">(one a line: <code>value</code> or <code>value, label</code>)</span></label>
                <textarea v-if="fieldForm.choicesCode == null" id="ff-choices" v-model="fieldForm.choices" class="form-control form-control-sm font-monospace" rows="3" />
                <input v-else id="ff-choices" v-model="fieldForm.choicesCode" class="form-control form-control-sm font-monospace" title="Python code">
              </div>
              <div class="col-sm-6">
                <label class="form-label small" for="ff-widget">widget</label>
                <select id="ff-widget" v-model="fieldForm.widget" class="form-select form-select-sm">
                  <option value="">(default)</option>
                  <option v-for="w in ['RadioSelect', 'RadioSelectHorizontal', 'CheckboxInput']" :key="w" :value="w">{{ w }}</option>
                  <option v-if="fieldForm.widget && !['RadioSelect', 'RadioSelectHorizontal', 'CheckboxInput'].includes(fieldForm.widget)" :value="fieldForm.widget">{{ fieldForm.widget }}</option>
                </select>
                <div class="form-check mt-2"><input id="ff-blank" v-model="fieldForm.blank" class="form-check-input" type="checkbox"><label class="form-check-label small" for="ff-blank">blank (may be left empty)</label></div>
              </div>
              <div class="col-12"><label class="form-label small" for="ff-doc">doc</label><input id="ff-doc" v-model="fieldForm.doc" class="form-control form-control-sm"></div>
              <div v-for="o in fieldForm.others" :key="o.name" class="col-sm-6"><label class="form-label small font-monospace">{{ o.name }}</label><input v-model="o.code" class="form-control form-control-sm font-monospace"></div>
            </div>
            <div class="mt-3 d-flex gap-2">
              <button class="btn btn-sm btn-primary" :disabled="busy">OK</button>
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="fieldForm = null">Cancel</button>
            </div>
          </form>
        </template>

        <!-- Functions -->
        <template v-else-if="section === 'functions'">
          <h2 class="h5">Functions</h2>
          <p class="small text-body-secondary">Code the pages call (<code>after_all_players_arrive = set_payoffs</code>), and functions oTree calls by name: <code>creating_session</code>, a field's <code>&lt;name&gt;_max(player)</code>, <code>_choices</code>, <code>_error_message</code>.</p>
          <div v-for="f in model.functions" :key="f.name" class="card mb-2">
            <div class="card-body py-2">
              <div class="d-flex align-items-center gap-2">
                <code class="flex-grow-1">def {{ f.name }}({{ f.params.join(', ') }})</code>
                <button class="btn btn-sm btn-outline-secondary" @click="editFunction(f)">Edit</button>
                <button class="btn btn-sm btn-outline-danger" :aria-label="`Remove ${f.name}`" @click="edit({ op: 'removeFunction', name: f.name })">✕</button>
              </div>
              <pre v-if="fnForm?.original !== f.name" class="small mb-0 mt-2 text-body-secondary studio__pre">{{ f.body }}</pre>
              <form v-else class="mt-2" @submit.prevent="saveFunction">
                <div class="input-group input-group-sm mb-2 font-monospace"><span class="input-group-text">def</span><input v-model="fnForm.name" class="form-control" aria-label="Name"><span class="input-group-text">(</span><input v-model="fnForm.params" class="form-control" aria-label="Parameters"><span class="input-group-text">):</span></div>
                <textarea v-model="fnForm.body" class="form-control form-control-sm font-monospace" rows="8" spellcheck="false" aria-label="Body" @keydown="tab" />
                <div class="mt-2 d-flex gap-2"><button class="btn btn-sm btn-primary">OK</button><button type="button" class="btn btn-sm btn-outline-secondary" @click="fnForm = null">Cancel</button></div>
              </form>
            </div>
          </div>
          <form v-if="fnForm && fnForm.original == null" class="card card-body mb-2" @submit.prevent="saveFunction">
            <div class="input-group input-group-sm mb-2 font-monospace"><span class="input-group-text">def</span><input v-model="fnForm.name" class="form-control" aria-label="Name" required><span class="input-group-text">(</span><input v-model="fnForm.params" class="form-control" aria-label="Parameters"><span class="input-group-text">):</span></div>
            <textarea v-model="fnForm.body" class="form-control form-control-sm font-monospace" rows="8" spellcheck="false" aria-label="Body" @keydown="tab" />
            <div class="mt-2 d-flex gap-2"><button class="btn btn-sm btn-primary">OK</button><button type="button" class="btn btn-sm btn-outline-secondary" @click="fnForm = null">Cancel</button></div>
          </form>
          <div v-if="!fnForm" class="d-flex gap-2 flex-wrap">
            <button class="btn btn-sm btn-outline-primary" @click="editFunction(null)">Add function</button>
            <button v-for="n in missingFunctions" :key="n" class="btn btn-sm btn-outline-secondary font-monospace" @click="editFunction(null, n)">+ {{ n }}</button>
          </div>
        </template>

        <!-- A page -->
        <template v-else-if="page">
          <div class="d-flex align-items-center gap-2 flex-wrap mb-3">
            <input :key="page.name" class="form-control form-control-sm font-monospace" style="max-width: 18em" :value="page.name" aria-label="Page name" @change="renamePage(page, $event)">
            <span class="badge" :class="page.kind === 'WaitPage' ? 'text-bg-secondary' : 'text-bg-primary'">{{ page.kind }}</span>
            <span class="ms-auto" />
            <div class="form-check form-switch mb-0"><input :id="`inseq-${page.name}`" class="form-check-input" type="checkbox" :checked="sequence.includes(page.name)" @change="toggleInSequence(page)"><label class="form-check-label small" :for="`inseq-${page.name}`">in page_sequence</label></div>
            <button class="btn btn-sm btn-outline-secondary" :disabled="sequence.indexOf(page.name) <= 0" @click="move(page, -1)">↑</button>
            <button class="btn btn-sm btn-outline-secondary" :disabled="!sequence.includes(page.name) || sequence.indexOf(page.name) === sequence.length - 1" @click="move(page, 1)">↓</button>
            <button class="btn btn-sm btn-outline-danger" @click="removePage(page)">Delete page</button>
          </div>

          <!-- A page's template, form and timeout -->
          <template v-if="page.kind === 'Page'">
            <div class="card mb-3">
              <div class="card-header small fw-semibold">Template <span class="fw-normal text-body-secondary">{{ page.name }}.html</span></div>
              <div class="card-body">
                <template v-if="tpl(page) == null">
                  <p class="small text-body-secondary">This page has no template of its own{{ attr(page, 'template_name') ? ` (template_name = ${attr(page, 'template_name')})` : '' }}.</p>
                  <button class="btn btn-sm btn-outline-primary" @click="createTemplate(page)">Make one</button>
                </template>
                <template v-else-if="tplText(page) != null">
                  <p class="small text-body-secondary">This template has no title and content blocks; it is edited as it is.</p>
                  <textarea class="form-control form-control-sm font-monospace" rows="12" spellcheck="false" :value="tplText(page) ?? ''" aria-label="Template" @input="setTpl(page, 'text', $event)" />
                </template>
                <template v-else>
                  <label class="form-label small" :for="`tt-${page.name}`">Title</label>
                  <input :id="`tt-${page.name}`" class="form-control form-control-sm mb-2" :value="tplTitle(page)" @input="setTpl(page, 'title', $event)">
                  <label class="form-label small" :for="`tc-${page.name}`">Content <span class="text-body-secondary">(HTML, with <code v-pre>{{ formfields }}</code>, <code v-pre>{{ next_button }}</code>, <code v-pre>{{ player.payoff }}</code>)</span></label>
                  <textarea :id="`tc-${page.name}`" class="form-control form-control-sm font-monospace" rows="10" spellcheck="false" :value="tplContent(page)" @input="setTpl(page, 'content', $event)" @keydown="tab" />
                </template>
              </div>
            </div>

            <div class="card mb-3">
              <div class="card-header small fw-semibold">Form</div>
              <div class="card-body row g-3">
                <div class="col-sm-4">
                  <label class="form-label small" :for="`fm-${page.name}`">form_model</label>
                  <select :id="`fm-${page.name}`" class="form-select form-select-sm" :value="formModel(page)" @change="setFormModel(page, $event)">
                    <option value="">(no form)</option><option value="player">player</option><option value="group">group</option>
                  </select>
                </div>
                <div class="col-sm-8">
                  <span class="form-label small d-block">form_fields</span>
                  <div v-if="formModel(page)" class="d-flex flex-wrap gap-3">
                    <div v-for="f in formModelFields(page)" :key="f" class="form-check">
                      <input :id="`ff-${page.name}-${f}`" class="form-check-input" type="checkbox" :checked="formFields(page).includes(f)" @change="toggleFormField(page, f, $event)">
                      <label class="form-check-label small font-monospace" :for="`ff-${page.name}-${f}`">{{ f }}</label>
                    </div>
                    <span v-if="!formModelFields(page).length" class="small text-body-secondary">The {{ formModel(page) }} has no fields yet.</span>
                  </div>
                  <span v-else class="small text-body-secondary">Choose a form model to ask for fields.</span>
                </div>
                <div class="col-sm-4">
                  <label class="form-label small" :for="`to-${page.name}`">timeout_seconds</label>
                  <input :id="`to-${page.name}`" class="form-control form-control-sm font-monospace" :value="attr(page, 'timeout_seconds') ?? ''" placeholder="none" @change="onAttr(page, 'timeout_seconds', $event)">
                </div>
              </div>
            </div>
          </template>

          <!-- A wait page's settings -->
          <div v-else class="card mb-3">
            <div class="card-header small fw-semibold">Wait page</div>
            <div class="card-body row g-3">
              <div class="col-sm-6">
                <label class="form-label small" :for="`aapa-${page.name}`">after_all_players_arrive</label>
                <select :id="`aapa-${page.name}`" class="form-select form-select-sm font-monospace" :value="attr(page, 'after_all_players_arrive') ?? ''" :disabled="page.methods.some((m) => m.name === 'after_all_players_arrive')" @change="onAttr(page, 'after_all_players_arrive', $event)">
                  <option value="">(nothing)</option>
                  <option v-for="f in model.functions" :key="f.name" :value="f.name">{{ f.name }}</option>
                  <option v-if="attr(page, 'after_all_players_arrive') && !model.functions.some((f) => f.name === attr(page, 'after_all_players_arrive'))" :value="attr(page, 'after_all_players_arrive')">{{ attr(page, 'after_all_players_arrive') }}</option>
                </select>
              </div>
              <div class="col-sm-6 d-flex flex-column justify-content-end gap-1">
                <div class="form-check"><input :id="`wfag-${page.name}`" class="form-check-input" type="checkbox" :checked="attr(page, 'wait_for_all_groups') === 'True'" @change="onBoolAttr(page, 'wait_for_all_groups', $event)"><label class="form-check-label small" :for="`wfag-${page.name}`">wait_for_all_groups</label></div>
                <div class="form-check"><input :id="`gbat-${page.name}`" class="form-check-input" type="checkbox" :checked="attr(page, 'group_by_arrival_time') === 'True'" @change="onBoolAttr(page, 'group_by_arrival_time', $event)"><label class="form-check-label small" :for="`gbat-${page.name}`">group_by_arrival_time</label></div>
              </div>
              <div class="col-sm-6"><label class="form-label small" :for="`tt2-${page.name}`">title_text</label><input :id="`tt2-${page.name}`" class="form-control form-control-sm" :value="pyString(attr(page, 'title_text')) ?? ''" @change="onTextAttr(page, 'title_text', $event)"></div>
              <div class="col-sm-6"><label class="form-label small" :for="`bt-${page.name}`">body_text</label><input :id="`bt-${page.name}`" class="form-control form-control-sm" :value="pyString(attr(page, 'body_text')) ?? ''" @change="onTextAttr(page, 'body_text', $event)"></div>
            </div>
          </div>

          <div v-if="otherAttrs(page).length" class="card mb-3">
            <div class="card-header small fw-semibold">Other settings</div>
            <div class="card-body">
              <div v-for="a in otherAttrs(page)" :key="a.name" class="input-group input-group-sm mb-2 font-monospace">
                <span class="input-group-text">{{ a.name }} =</span>
                <input class="form-control" :value="a.code" @change="onAttr(page, a.name, $event)">
                <button class="btn btn-outline-danger" :aria-label="`Remove ${a.name}`" @click="setAttr(page, a.name, null)">✕</button>
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-header small fw-semibold">Methods</div>
            <div class="card-body">
              <div v-for="m in page.methods" :key="m.name" class="mb-3">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <code class="flex-grow-1">{{ m.decorators.includes('staticmethod') ? '@staticmethod ' : '' }}def {{ m.name }}({{ m.params.join(', ') }}):</code>
                  <button class="btn btn-sm btn-outline-danger" :aria-label="`Remove ${m.name}`" @click="edit({ op: 'removePageMethod', page: page.name, name: m.name })">✕</button>
                </div>
                <textarea class="form-control form-control-sm font-monospace" :rows="Math.min(16, methodDraft(page, m).split('\n').length + 1)" spellcheck="false" :value="methodDraft(page, m)" :aria-label="m.name" @input="onMethodInput(page, m, $event)" @blur="saveMethod(page, m)" @keydown="tab" />
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <button v-for="n in missingMethods(page)" :key="n" class="btn btn-sm btn-outline-secondary font-monospace" @click="addMethod(page, n)">+ {{ n }}</button>
              </div>
            </div>
          </div>
        </template>

        <!-- All of it -->
        <template v-else-if="section === 'code'">
          <div class="d-flex align-items-center mb-2">
            <h2 class="h5 mb-0 me-auto">__init__.py</h2>
            <button class="btn btn-sm btn-outline-primary" :disabled="codeDraft === source" @click="applyCode">Apply</button>
          </div>
          <p class="small text-body-secondary">The app's code. Apply reads it again into the other parts.</p>
          <textarea v-model="codeDraft" class="form-control font-monospace small" rows="30" spellcheck="false" aria-label="__init__.py" @keydown="tab" />
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.studio__nav .list-group-item { padding: 0.35rem 0.6rem; }
.studio__pre { white-space: pre-wrap; max-height: 12em; overflow: auto; }
</style>
