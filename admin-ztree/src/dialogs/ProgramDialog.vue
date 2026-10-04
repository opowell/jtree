<script setup lang="ts">
import { computed, ref } from 'vue'
import ZDialog from '../components/ZDialog.vue'
import { messageBox } from '../dialogs'
import { findNode, setSource } from '../treatment/docs'
import type { TreatmentDoc } from '../treatment/docs'
import { replaceRange } from '../treatment/parse'
import type { StageInfo, TreeNode } from '../treatment/parse'

/*
 * The Program dialog (manual 8.3.6): which table the program runs on, and
 * the program. In jtree a stage's program is one of its hooks: on the
 * subjects table, `playerStart` runs as a subject enters the stage and
 * `playerEnd` as it leaves; on the groups table, `groupStart` and `groupEnd`.
 * A background program is code run when the treatment is loaded.
 */
const props = defineProps<{
  doc: TreatmentDoc
  node?: TreeNode
  /** For a new program: the stage it goes in, null for the background. */
  stage?: StageInfo | null
  isNew?: boolean
  readOnly?: boolean
}>()
const emit = defineEmits<{ close: [value?: boolean] }>()

const HOOKS: Record<string, Record<string, string>> = {
  subjects: { start: 'playerStart', end: 'playerEnd' },
  groups: { start: 'groupStart', end: 'groupEnd' },
}

const table = ref(props.node?.table ?? (props.stage ? 'subjects' : 'globals'))
const when = ref(props.node?.hook && /End$/.test(props.node.hook) ? 'end' : 'start')
const code = ref(props.node?.body ? dedent(props.doc.source.slice(props.node.body.start, props.node.body.end)) : '')

const hook = computed(() => (props.node ? props.node.hook ?? '' : HOOKS[table.value]?.[when.value] ?? ''))
const parameter = computed(() => (table.value === 'groups' ? 'group' : 'player'))

function dedent(text: string): string {
  const lines = text.replace(/^\n+|\s+$/g, '').split('\n')
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)![0].length))
  return lines.map((l) => l.slice(Number.isFinite(indent) ? indent : 0)).join('\n')
}

function indent(text: string, by = '    '): string {
  return text.split('\n').map((l) => (l.trim() ? by + l : l)).join('\n')
}

async function ok() {
  if (props.readOnly) {
    emit('close', true)
    return
  }
  const doc = props.doc
  if (props.node?.body) {
    const isBlock = doc.source[props.node.body.end] === '}'
    const body = isBlock ? `\n${indent(code.value)}\n` : code.value
    setSource(doc, replaceRange(doc.source, props.node.body, body))
    emit('close', true)
    return
  }
  // A new program.
  if (!props.stage) {
    if (!code.value.trim()) return emit('close')
    const at = doc.treatment.stages[0]?.decl.start ?? doc.treatment.end
    const text = `${code.value.trim()}\n\n`
    setSource(doc, at === doc.treatment.end ? `${doc.source}\n${text}` : `${doc.source.slice(0, at)}${text}${doc.source.slice(at)}`)
    emit('close', true)
    return
  }
  const stage = props.stage
  if (stage.props[hook.value]) {
    await messageBox(`The stage ${stage.id} already has a ${table.value} program run at its ${when.value} (${hook.value}). Edit that one instead.`, { icon: 'info' })
    return
  }
  const fn = `\n${stage.varName}.${hook.value} = function(${parameter.value}) {\n${indent(code.value)}\n};`
  setSource(doc, `${doc.source.slice(0, stage.span.end)}${fn}${doc.source.slice(stage.span.end)}`)
  const added = doc.treatment.tree.children
    .find((n) => n.kind === 'stage' && n.stageVar === stage.varName)
  const program = added ? findNode(added, `${added.id}:${hook.value}`) : null
  if (program) doc.selected = program.id
  emit('close', true)
}
</script>

<template>
  <ZDialog title="Program" :width="560" @ok="ok" @cancel="emit('close')">
    <div class="zt-form">
      <label for="prog-table">Table</label>
      <select id="prog-table" v-model="table" class="zt-field" style="width: 160px" :disabled="!isNew || !stage">
        <option v-if="stage || table === 'subjects'" value="subjects">subjects</option>
        <option v-if="stage || table === 'groups'" value="groups">groups</option>
        <option v-if="!stage" value="globals">globals</option>
      </select>
      <template v-if="stage || node?.hook">
        <label for="prog-when">Run</label>
        <select id="prog-when" v-model="when" class="zt-field" style="width: 220px" :disabled="!isNew">
          <option value="start">when entering the stage</option>
          <option value="end">when leaving the stage</option>
        </select>
      </template>
      <label>Owner variable</label>
      <input class="zt-field" disabled>
      <label>Condition</label>
      <input class="zt-field" disabled>
      <label for="prog-code" class="zt-form__top">Program</label>
      <textarea id="prog-code" v-model="code" class="zt-field" rows="16" spellcheck="false" :readonly="readOnly" />
    </div>
    <p v-if="hook" class="zt-hint">
      jtree: <code>{{ stage?.varName ?? node?.stageVar }}.{{ hook }} = function({{ parameter }}) { … }</code>
      — <code>{{ parameter }}</code> is the {{ table === 'groups' ? 'group' : 'subject' }} the program runs for.
    </p>
    <p v-else class="zt-hint">Background programs run when the treatment is loaded; use <code>app.</code> for treatment-wide values.</p>
  </ZDialog>
</template>
