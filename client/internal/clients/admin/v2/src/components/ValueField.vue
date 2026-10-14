<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Value } from '../server/editor'

/*
 * One setting of an app or a stage: a field for its kind of value. A number or a check box is
 * set as it changes; text is set when the field is left (or on Ctrl+Enter), so typing does not
 * rewrite the source on every key.
 */
const props = defineProps<{ name: string, value: Value, hint?: string, removable?: boolean }>()
const emit = defineEmits<{ set: [Value], remove: [] }>()

const draft = ref('')
const preview = ref(false)

function initial(v: Value): string {
  if (v.kind === 'function') return v.body ?? ''
  if (v.kind === 'code' || v.kind === 'null') return v.code ?? ''
  if (v.kind === 'text') return dedent(String(v.value ?? ''))
  return String(v.value ?? '')
}
watch(() => props.value, (v) => { draft.value = initial(v) }, { immediate: true })

function dedent(text: string): string {
  const lines = text.replace(/^\n/, '').replace(/\n\s*$/, '').split('\n')
  const indents = lines.filter((l) => l.trim()).map((l) => /^[ \t]*/.exec(l)![0].length)
  const cut = indents.length ? Math.min(...indents) : 0
  return lines.map((l) => l.slice(cut)).join('\n')
}

const multiline = computed(() => ['text', 'function', 'code'].includes(props.value.kind) || (props.value.kind === 'string' && (draft.value.length > 60 || props.name === 'description')))
const rows = computed(() => Math.min(24, Math.max(props.value.kind === 'string' ? 2 : 4, draft.value.split('\n').length + 1)))
const signature = computed(() => `function(${(props.value.params ?? []).join(', ')}) {`)

function commit() {
  const v = props.value
  // A number field's v-model gives a number (Vue casts type="number" inputs): read it as text.
  const text = String(draft.value ?? '')
  if (text === initial(v)) return
  switch (v.kind) {
    case 'number': {
      const n = Number(text)
      if (text.trim() === '' || !Number.isFinite(n)) { draft.value = initial(v); return }
      emit('set', { kind: 'number', value: n })
      break
    }
    case 'string': emit('set', { kind: 'string', value: text }); break
    case 'text': emit('set', { kind: 'text', value: text }); break
    case 'function': emit('set', { kind: 'function', params: v.params ?? [], body: text }); break
    default: emit('set', { kind: 'code', code: text })
  }
}

function toggle(event: Event) {
  emit('set', { kind: 'boolean', value: (event.target as HTMLInputElement).checked })
}

/** Tab indents in code; Ctrl+Enter sets. */
function key(event: KeyboardEvent) {
  const area = event.target as HTMLTextAreaElement
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault()
    commit()
  } else if (event.key === 'Tab' && !event.shiftKey && props.value.kind !== 'string') {
    event.preventDefault()
    const { selectionStart: s, selectionEnd: e } = area
    draft.value = draft.value.slice(0, s) + '    ' + draft.value.slice(e)
    requestAnimationFrame(() => area.setSelectionRange(s + 4, s + 4))
  }
}

const previewDoc = computed(() => `<!doctype html><meta charset="utf-8"><style>body{font:14px system-ui,sans-serif;margin:10px}</style>${draft.value}`)
</script>

<template>
  <div class="vf" :data-kind="value.kind">
    <div class="vf__head">
      <label class="vf__name dc-mono" :for="`vf-${name}`">{{ name }}</label>
      <span class="muted vf__kind">{{ value.kind === 'text' ? 'screen' : value.kind }}</span>
      <button v-if="value.kind === 'text'" type="button" class="btn btn--small" @click="preview = !preview">{{ preview ? 'Hide preview' : 'Preview' }}</button>
      <button v-if="removable" type="button" class="btn btn--small btn--danger" :title="`Take ${name} out`" @click="emit('remove')">Remove</button>
    </div>
    <p v-if="hint" class="hint">{{ hint }}</p>
    <label v-if="value.kind === 'boolean'" class="check">
      <input :id="`vf-${name}`" type="checkbox" :checked="Boolean(value.value)" @change="toggle"> {{ value.value ? 'yes' : 'no' }}
    </label>
    <input v-else-if="value.kind === 'number'" :id="`vf-${name}`" v-model="draft" class="field" type="number" step="any" @change="commit">
    <input v-else-if="!multiline" :id="`vf-${name}`" v-model="draft" class="field" type="text" @change="commit">
    <template v-else>
      <div v-if="value.kind === 'function'" class="vf__sig dc-mono">{{ signature }}</div>
      <textarea :id="`vf-${name}`" v-model="draft" class="field vf__area" :class="{ 'dc-mono': value.kind !== 'string' }" :rows="rows" spellcheck="false" @blur="commit" @keydown="key" />
      <div v-if="value.kind === 'function'" class="vf__sig dc-mono">}</div>
      <iframe v-if="preview && value.kind === 'text'" class="vf__preview" sandbox="" :srcdoc="previewDoc" title="Screen preview" />
    </template>
  </div>
</template>

<style scoped>
.vf { display: flex; flex-direction: column; gap: 4px; }
.vf__head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.vf__name { font-weight: var(--dc-weight-semibold); }
.vf__kind { font-size: var(--dc-text-meta); }
.vf__head .btn:first-of-type { margin-left: auto; }
.vf__area { width: 100%; box-sizing: border-box; resize: vertical; font-size: var(--dc-text-code); line-height: 1.45; tab-size: 4; }
.vf__sig { font-size: var(--dc-text-code); color: var(--dc-fg-2); }
.vf__preview { width: 100%; min-height: 140px; border: 1px solid var(--dc-line); border-radius: var(--dc-radius-sm); background: #fff; }
</style>
