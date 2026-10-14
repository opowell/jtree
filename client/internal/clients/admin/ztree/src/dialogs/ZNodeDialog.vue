<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import ZDialog from '../components/ZDialog.vue'
import { messageBox } from '../dialogs'
import { BOXES, PLOTS, clone, code, get, isTrue, remove, set, setCode } from '../treatment/znodes'
import type { ZNode } from '../treatment/znodes'

/*
 * The dialog of an element of a z-Tree treatment: the Stage, Program, Box, Item, Button, Checker,
 * Table and General Parameters dialogs of z-Tree's manual (chapter 8.3), with the fields z-Tree
 * has for each, set in its own words (TRUE, ifnoinput, BOTTOMRIGHT). Settings a dialog has no
 * field for are listed under "Other settings", where they can be changed too, so nothing in a
 * treatment is out of reach. OK closes with the changed element; Cancel with nothing.
 */
const props = defineProps<{ node: ZNode, isNew?: boolean, tables?: string[] }>()
const emit = defineEmits<{ close: [value?: ZNode] }>()

const n = reactive(clone(props.node)) as ZNode

type Field =
  | { type: 'name', label: string }
  | { type: 'text' | 'expr' | 'bool', key: string, label: string, rows?: number }
  | { type: 'choice', key: string, label: string, options: Array<[string, string]> }
  | { type: 'code', label: string }
  | { type: 'leave' }
  | { type: 'group', label: string, fields: Field[] }

const BOOL = (key: string, label: string): Field => ({ type: 'bool', key, label })
const EXPR = (key: string, label: string): Field => ({ type: 'expr', key, label })
const TEXT = (key: string, label: string, rows?: number): Field => ({ type: 'text', key, label, rows })

const BOX_FIELDS: Field[] = [
  { type: 'name', label: 'Name' },
  EXPR('width', 'Width [p/%]'), EXPR('height', 'Height [p/%]'),
  { type: 'group', label: 'Distance to the margin [p/%]', fields: [EXPR('left', 'Left'), EXPR('top', 'Top'), EXPR('right', 'Right'), EXPR('bottom', 'Bottom')] },
  { type: 'group', label: 'Adjustment of the remaining box', fields: [BOOL('cutleft', 'Left'), BOOL('cuttop', 'Top'), BOOL('cutright', 'Right'), BOOL('cutbottom', 'Bottom')] },
  BOOL('hasframe', 'With frame'),
  EXPR('displaycondition', 'Display condition'),
]
const BUTTON_PLACE: Field[] = [
  { type: 'choice', key: 'buttonposition', label: 'Button position', options: ['TOPLEFT', 'TOPMIDDLE', 'TOPRIGHT', 'MIDDLELEFT', 'MIDDLEMIDDLE', 'MIDDLERIGHT', 'BOTTOMLEFT', 'BOTTOMMIDDLE', 'BOTTOMRIGHT'].map((v) => [v, v.toLowerCase().replace(/(top|middle|bottom)/, '$1 ')]) },
  { type: 'choice', key: 'buttonsequence', label: 'Arrangement', options: [['HORIZONTAL', 'horizontal'], ['VERTICAL', 'vertical']] },
]
const tableChoice = (key = 'table', label = 'Table'): Field => ({ type: 'choice', key, label, options: (props.tables ?? []).map((t) => [t, t]) })

const SCHEMAS: Record<string, { title: string, fields: Field[] }> = {
  background: {
    title: 'General Parameters',
    fields: [
      EXPR('numsubjects', 'Number of subjects'), EXPR('numgroups', 'Number of groups'),
      EXPR('numpracticeperiods', '# practice periods'), EXPR('numactualperiods', '# paying periods'),
      EXPR('exchangerate', 'Exchange rate [Fr./ECU]'), EXPR('startendowment', 'Lump sum payment [ECU]'), EXPR('showupfee', 'Show up fee [Fr.]'),
      BOOL('noAutoscope', 'without Autoscope'), BOOL('firstBoxesOnTop', 'first boxes on top'),
    ],
  },
  stage: {
    title: 'Stage',
    fields: [
      { type: 'name', label: 'Name' },
      { type: 'choice', key: 'startwaitforall', label: 'Start', options: [['TRUE', 'Wait for all'], ['FALSE', 'Start if possible']] },
      TEXT('startConditionStr', 'Start if… (condition)'),
      { type: 'group', label: 'Number of subjects in stage', fields: [BOOL('singleentry', 'At most one per group in stage'), BOOL('singleentrycontinuation', '… and in previous stage(s)')] },
      { type: 'choice', key: 'timeouttype', label: 'Leave stage after timeout', options: [['ifnoinput', 'If no input'], ['always', 'Yes'], ['never', 'No']] },
      EXPR('timeout', 'Timeout [sec]'),
    ],
  },
  table: { title: 'Table', fields: [{ type: 'name', label: 'Name' }, { type: 'choice', key: 'lifetime', label: 'Lifetime', options: [['PERIOD', 'period'], ['TREATMENT', 'treatment'], ['SESSION', 'session']] }] },
  program: { title: 'Program', fields: [tableChoice(), EXPR('ownervariable', 'Owner variable'), EXPR('condition', 'Condition'), { type: 'code', label: 'Program' }] },
  externalprogram: { title: 'External Program', fields: [tableChoice(), TEXT('filename', 'File'), EXPR('condition', 'Condition')] },
  tableloader: { title: 'Table Loader', fields: [EXPR('condition', 'Condition'), TEXT('inputreplacefilename', 'File name')] },
  tabledumper: { title: 'Table Dumper', fields: [EXPR('condition', 'Condition'), TEXT('outputfilename', 'File name'), TEXT('tabledescriptions', 'Tables')] },
  screen: { title: 'Screen', fields: [BOOL('usesbg', 'Background boxes are shown (from the background screen)')] },
  item: {
    title: 'Item',
    fields: [
      TEXT('label', 'Label', 2), EXPR('variable', 'Variable'), TEXT('format', 'Layout', 2),
      BOOL('input', 'Input'), EXPR('min', 'Minimum'), EXPR('max', 'Maximum'),
      BOOL('showdefault', 'Show value (value of variable or default)'), BOOL('emptyallowed', 'Empty allowed'),
      EXPR('default', 'Default'),
    ],
  },
  button: {
    title: 'Button',
    fields: [
      { type: 'name', label: 'Name' },
      { type: 'leave' },
      BOOL('clearinputafterok', 'Clear input after OK'),
      BOOL('norecordmadeorselected', 'No record made or selected'),
      BOOL('specialbuttoncolor', 'Special color'), EXPR('buttoncolor', 'Color'),
    ],
  },
  checker: { title: 'Checker', fields: [EXPR('condition', 'Condition'), TEXT('message', 'Message', 3), TEXT('yesButtonStr', 'Yes button'), TEXT('noButtonStr', 'No button')] },
  headerbox: {
    title: 'Header Box',
    fields: [...BOX_FIELDS, BOOL('showPeriods', 'Period number shown'), BOOL('showNumPeriods', 'Number of periods shown'), TEXT('periodtext', 'Period text'),
      TEXT('periodoftext', '"of" text'), TEXT('practiceperiodprefix', 'Trial period text'), BOOL('showtime', 'Time shown'), TEXT('timestr', 'Time text'), TEXT('pleasedecidetext', 'Text if timeout is over')],
  },
  helpbox: { title: 'Help Box', fields: [...BOX_FIELDS, ...BUTTON_PLACE, TEXT('label', 'Title'), TEXT('help', 'Help text', 5)] },
  selectcontractbox: { title: 'Contract List Box', fields: [...BOX_FIELDS, ...BUTTON_PLACE, tableChoice(), EXPR('condition', 'Condition'), TEXT('sortfields', 'Sorting'), EXPR('ownervariable', 'Owner variable')] },
  makecontractbox: { title: 'Contract Creation Box', fields: [...BOX_FIELDS, ...BUTTON_PLACE, tableChoice()] },
  chatterbox: { title: 'Chat Box', fields: [...BOX_FIELDS, tableChoice(), EXPR('inputvariable', 'Input variable'), EXPR('condition', 'Condition'), TEXT('outputtext', 'Output text', 2)] },
  plotbox: {
    title: 'Plot Box',
    fields: [...BOX_FIELDS, { type: 'group', label: 'World coordinates', fields: [EXPR('xleft', 'Left'), EXPR('xright', 'Right'), EXPR('ybottom', 'Bottom'), EXPR('ytop', 'Top')] }, BOOL('maintainaspectratio', 'Maintain aspect ratio')],
  },
  plotgraph: { title: 'Plot Graph', fields: [{ type: 'name', label: 'Name' }, tableChoice(), EXPR('condition', 'Condition'), BOOL('filltoxaxis', 'Fill to x axis'), BOOL('connecttopreviouspoint', 'Connect points')] },
  plotinput: {
    title: 'Plot Input',
    fields: [{ type: 'name', label: 'Name' }, EXPR('displaycondition', 'Condition'), { type: 'choice', key: 'event', label: 'Event', options: [['LEFTCLICK', 'left click'], ['RIGHTCLICK', 'right click']] },
      { type: 'choice', key: 'action', label: 'Action', options: [['NEW', 'new'], ['SELECT', 'select'], ['DRAG', 'drag']] }, tableChoice(), EXPR('xvariable', 'x variable'), EXPR('yvariable', 'y variable'), BOOL('leavestage', 'Leave stage')],
  },
}

const schema = computed(() => {
  if (SCHEMAS[n.kind]) return SCHEMAS[n.kind]
  if (BOXES[n.kind]) return { title: `${BOXES[n.kind]} Box`, fields: [...BOX_FIELDS, ...BUTTON_PLACE] }
  if (PLOTS[n.kind]) return { title: PLOTS[n.kind], fields: [{ type: 'name', label: 'Name' } as Field, EXPR('displaycondition', 'Display condition')] }
  return { title: n.kind, fields: n.name != null ? [{ type: 'name', label: 'Name' } as Field] : [] }
})

const flat = (fields: Field[]): Field[] => fields.flatMap((f) => (f.type === 'group' ? flat(f.fields) : [f]))
const keysShown = computed(() => {
  const keys = new Set<string>()
  for (const f of flat(schema.value.fields)) {
    if ('key' in f) keys.add(f.key)
    if (f.type === 'leave') { keys.add('terminatestage'); keys.add('donotterminatestage') }
  }
  return keys
})
const others = computed(() => n.items.filter((i) => i.key && !keysShown.value.has(i.key)))
const hasCode = computed(() => schema.value.fields.some((f) => f.type === 'code'))

const value = (key: string) => get(n, key) ?? ''
const setValue = (key: string, v: string, asText: boolean) => set(n, key, v, asText)
const checked = (key: string) => isTrue(n, key)
const toggle = (key: string, on: boolean) => set(n, key, on ? 'TRUE' : 'FALSE')

/** A choice's options, with the value the treatment has if it is not one of them. */
function options(f: Extract<Field, { type: 'choice' }>): Array<[string, string]> {
  const v = get(n, f.key)
  return v != null && v !== '' && !f.options.some(([o]) => o === v) ? [...f.options, [v, v]] : f.options
}

const leave = computed({
  get: () => (checked('terminatestage') ? 'yes' : checked('donotterminatestage') ? 'no' : 'box'),
  set: (v: string) => { toggle('terminatestage', v === 'yes'); toggle('donotterminatestage', v === 'no') },
})

// Events' values, read here: the in-browser compiler takes no TypeScript in templates.
const target = (e: Event) => e.target as HTMLInputElement
const onText = (key: string, e: Event) => setValue(key, target(e).value, true)
const onExpr = (key: string, e: Event) => setValue(key, target(e).value, false)
const onCheck = (key: string, e: Event) => toggle(key, target(e).checked)
const onOther = (key: string | undefined, isText: boolean, e: Event) => { if (key) setValue(key, target(e).value, isText) }
const removeOther = (key: string | undefined) => { if (key) remove(n, key) }
/** A field of a group, as the template reads it. */
const part = (f: Field) => f as { type: string, key: string, label: string }

const program = ref(code(n))
const newKey = ref('')
const newValue = ref('')
const newIsText = ref(false)
const canAdd = computed(() => /^[A-Za-z_]\w*$/.test(newKey.value.trim()))

function addOther() {
  const key = newKey.value.trim()
  if (!/^[A-Za-z_]\w*$/.test(key)) return
  set(n, key, newValue.value, newIsText.value)
  newKey.value = ''
  newValue.value = ''
}

async function ok() {
  if (schema.value.fields.some((f) => f.type === 'name') && n.kind !== 'item' && !String(n.name ?? '').trim() && ['stage', 'table', 'button'].includes(n.kind)) {
    await messageBox(`A ${n.kind} needs a name.`, { icon: 'warning' })
    return
  }
  if (n.kind === 'table' && !/^[A-Za-z_]\w*$/.test(n.name ?? '')) {
    await messageBox('A table name is a word of letters, digits and _.', { icon: 'warning' })
    return
  }
  if (hasCode.value) setCode(n, program.value)
  // Settings left empty that z-Tree leaves out when empty.
  for (const key of ['width', 'height', 'left', 'right', 'top', 'bottom', 'displaycondition', 'ownervariable', 'default']) {
    const item = n.items.find((i) => i.key === key)
    if (item && (item.value?.raw ?? item.value?.string ?? '').trim() === '' && !props.node.items.some((i) => i.key === key)) remove(n, key)
  }
  emit('close', clone(n))
}

function codeKey(event: KeyboardEvent) {
  if (event.key !== 'Tab' || event.shiftKey) return
  event.preventDefault()
  const area = event.target as HTMLTextAreaElement
  const { selectionStart: s, selectionEnd: e } = area
  program.value = program.value.slice(0, s) + '\t' + program.value.slice(e)
  requestAnimationFrame(() => area.setSelectionRange(s + 1, s + 1))
}
</script>

<template>
  <ZDialog :title="schema.title" :width="hasCode ? 620 : 480" @ok="ok" @cancel="emit('close')">
    <div class="zt-form">
      <template v-for="(f, i) in schema.fields" :key="i">
        <template v-if="f.type === 'name'">
          <label :for="`zn-name`">{{ f.label }}</label>
          <input id="zn-name" v-model="n.name" class="zt-field">
        </template>
        <template v-else-if="f.type === 'text'">
          <label :for="`zn-${f.key}`" :class="{ 'zt-form__top': f.rows }">{{ f.label }}</label>
          <textarea v-if="f.rows" :id="`zn-${f.key}`" class="zt-field" :rows="f.rows" :value="value(f.key)" @input="onText(f.key, $event)" />
          <input v-else :id="`zn-${f.key}`" class="zt-field" :value="value(f.key)" @input="onText(f.key, $event)">
        </template>
        <template v-else-if="f.type === 'expr'">
          <label :for="`zn-${f.key}`">{{ f.label }}</label>
          <input :id="`zn-${f.key}`" class="zt-field zt-mono" :value="value(f.key)" spellcheck="false" @input="onExpr(f.key, $event)">
        </template>
        <template v-else-if="f.type === 'bool'">
          <span />
          <label class="zt-check"><input type="checkbox" :checked="checked(f.key)" @change="onCheck(f.key, $event)"> {{ f.label }}</label>
        </template>
        <template v-else-if="f.type === 'choice'">
          <label :for="`zn-${f.key}`">{{ f.label }}</label>
          <select :id="`zn-${f.key}`" class="zt-field" :value="value(f.key)" @change="onExpr(f.key, $event)">
            <option v-for="[v, l] in options(f)" :key="v" :value="v">{{ l }}</option>
          </select>
        </template>
        <template v-else-if="f.type === 'leave'">
          <span class="zt-form__top">Leave stage</span>
          <div class="zt-form__radios">
            <label class="zt-check"><input v-model="leave" type="radio" value="box"> as the box has it</label>
            <label class="zt-check"><input v-model="leave" type="radio" value="yes"> yes</label>
            <label class="zt-check"><input v-model="leave" type="radio" value="no"> no</label>
          </div>
        </template>
        <fieldset v-else-if="f.type === 'group'" class="zt-group zt-form__full">
          <legend>{{ f.label }}</legend>
          <div class="zt-form__row">
            <template v-for="g in f.fields.map(part)" :key="g.key">
              <label v-if="g.type === 'bool'" class="zt-check"><input type="checkbox" :checked="checked(g.key)" @change="onCheck(g.key, $event)"> {{ g.label }}</label>
              <label v-else class="zt-form__pair">{{ g.label }} <input class="zt-field zt-mono" :value="value(g.key)" @input="g.type === 'text' ? onText(g.key, $event) : onExpr(g.key, $event)"></label>
            </template>
          </div>
        </fieldset>
        <template v-else-if="f.type === 'code'">
          <label for="zn-code" class="zt-form__top">{{ f.label }}</label>
          <textarea id="zn-code" v-model="program" class="zt-field zt-mono" rows="14" spellcheck="false" @keydown="codeKey" />
        </template>
      </template>
    </div>

    <fieldset v-if="others.length || !isNew" class="zt-group">
      <legend>Other settings</legend>
      <table class="zt-others">
        <tbody>
          <tr v-for="item in others" :key="item.key">
            <td class="zt-mono">{{ item.key }}</td>
            <td>
              <input
                class="zt-field"
                :class="{ 'zt-mono': item.value?.string == null }"
                :value="item.value?.string ?? item.value?.raw"
                :title="item.value?.string != null ? 'A text' : 'An expression'"
                @input="onOther(item.key, item.value?.string != null, $event)"
              >
            </td>
            <td><button type="button" class="zt-btn zt-btn--small" :aria-label="`Remove ${item.key}`" @click="removeOther(item.key)">✕</button></td>
          </tr>
          <tr>
            <td><input v-model="newKey" class="zt-field zt-mono" placeholder="setting" aria-label="New setting's name"></td>
            <td><input v-model="newValue" class="zt-field" placeholder="value" aria-label="New setting's value"></td>
            <td><label class="zt-check" title="A text (in quotes) rather than an expression"><input v-model="newIsText" type="checkbox"> text</label></td>
          </tr>
        </tbody>
      </table>
      <button type="button" class="zt-btn" style="align-self: flex-start" :disabled="!canAdd" @click="addOther">Add setting</button>
    </fieldset>
  </ZDialog>
</template>
