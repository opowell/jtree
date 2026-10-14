<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { COMMON_FIELDS, attr, fieldsOf, hasTextContent, kindOf, outdented } from '../elements'
import type { Field } from '../elements'
import type { ScreenEdit, ScreenNode } from '../server/editor'

/*
 * An element of a screen, in the app editor's structured mode: its text, the fields of its kind
 * (an input's variable, type, limits, ...), its other attributes, and its HTML as written. Each
 * change is one edit of the screen, sent when a field is left.
 */
const props = defineProps<{ node: ScreenNode, path: number[], screen: string, busy: boolean }>()
const emit = defineEmits<{ edit: [ScreenEdit] }>()

const isElement = computed(() => props.node.type === 'element')
const content = computed(() => (props.node.inner ? props.screen.slice(props.node.inner.start, props.node.inner.end) : ''))
const written = computed(() => outdented(props.screen, props.node.range.start, props.node.range.end))
const fields = computed(() => [...fieldsOf(props.node), ...(isElement.value ? COMMON_FIELDS : [])])

/** The attribute a field shows: its bound form (:max) if that is the one written. */
function attrName(f: Field): string {
  if (attr(props.node, f.attr) !== undefined) return f.attr
  for (const bound of [`:${f.attr}`, `v-bind:${f.attr}`]) if (attr(props.node, bound) !== undefined) return bound
  return f.attr
}
const fieldValue = (f: Field) => attr(props.node, attrName(f))

const covered = computed(() => new Set(fields.value.map(attrName)))
const others = computed(() => (props.node.attrs ?? []).filter((a) => !covered.value.has(a.name)))

const set = (name: string, value: string | null) => emit('edit', { do: 'setAttr', path: props.path, name, value })
const remove = (name: string) => emit('edit', { do: 'setAttr', path: props.path, name, remove: true })

function setField(f: Field, event: Event) {
  const input = event.target as HTMLInputElement
  const name = attrName(f)
  if (f.kind === 'flag') {
    if (input.checked) set(name, null)
    else remove(name)
  } else if (input.value === '' && f.attr !== 'value') remove(name)
  else if (input.value !== (fieldValue(f) ?? '')) set(name, input.value)
}

function setOther(name: string, event: Event) {
  const value = (event.target as HTMLInputElement).value
  set(name, value === '' && attr(props.node, name) === null ? null : value)
}

const newName = ref('')
const newValue = ref('')
function addAttr() {
  const name = newName.value.trim()
  if (!name) return
  set(name, newValue.value === '' ? null : newValue.value)
  newName.value = newValue.value = ''
}

// Text and HTML are sent when their field is left (or on Ctrl+Enter), not on every key.
const text = ref('')
const html = ref('')
watch(() => [props.node, props.screen], () => {
  text.value = props.node.type === 'element' ? content.value : props.node.text ?? ''
  html.value = written.value
}, { immediate: true })

function commitText() {
  if (props.node.type === 'element') {
    if (text.value !== content.value) emit('edit', { do: 'setContent', path: props.path, html: text.value })
  } else if (props.node.type === 'comment') {
    if (text.value !== props.node.text) emit('edit', { do: 'replace', path: props.path, html: `<!--${text.value}-->` })
  } else if (text.value.trim() !== (props.node.text ?? '')) {
    if (text.value.trim()) emit('edit', { do: 'replace', path: props.path, html: text.value.trim() })
    else emit('edit', { do: 'remove', path: props.path })
  }
}
function commitHtml() {
  if (html.value !== written.value && html.value.trim()) emit('edit', { do: 'replace', path: props.path, html: html.value })
}
function key(event: KeyboardEvent, commit: () => void) {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault()
    commit()
  }
}
const textKey = (event: KeyboardEvent) => key(event, commitText)
const htmlKey = (event: KeyboardEvent) => key(event, commitHtml)

const rows = (s: string, min: number) => Math.min(16, Math.max(min, s.split('\n').length + 1))
const choicesFor = (f: Field) => {
  const v = fieldValue(f)
  return v != null && !f.choices!.includes(v) ? [v, ...f.choices!] : f.choices!
}
const fieldId = (f: Field) => `el-${f.attr}`
</script>

<template>
  <div class="el">
    <div class="el__head">
      <h3 class="el__title">{{ kindOf(node) }}</h3>
      <span v-if="isElement" class="muted dc-mono">&lt;{{ node.tag }}&gt;</span>
    </div>

    <!-- Its text: an element's content (when it is only text), a text's, a comment's. -->
    <div v-if="!isElement || hasTextContent(node) || node.tag === 'script' || node.tag === 'style'" class="option">
      <label for="el-text">{{ node.tag === 'script' ? 'Code' : node.tag === 'style' ? 'CSS' : node.type === 'comment' ? 'Comment' : 'Text' }}</label>
      <textarea id="el-text" v-model="text" class="field el__area" :class="{ 'dc-mono': node.tag === 'script' || node.tag === 'style' }" :rows="rows(text, 2)" spellcheck="false" @blur="commitText" @keydown="textKey" />
      <p v-if="isElement && node.tag !== 'script' && node.tag !== 'style'" class="hint">HTML; <code v-pre>{{player.x}}</code> shows a value.</p>
    </div>

    <template v-if="isElement">
      <div v-for="f in fields" :key="f.attr" class="el__field">
        <label :for="fieldId(f)">{{ f.label }}<span v-if="attrName(f) !== f.attr" class="muted dc-mono"> {{ attrName(f) }}</span></label>
        <input v-if="f.kind === 'flag'" :id="fieldId(f)" type="checkbox" :checked="fieldValue(f) !== undefined" :disabled="busy" @change="setField(f, $event)">
        <select v-else-if="f.kind === 'choice'" :id="fieldId(f)" class="field" :value="fieldValue(f) ?? ''" :disabled="busy" @change="setField(f, $event)">
          <option value="">(none)</option>
          <option v-for="c in choicesFor(f)" :key="c" :value="c">{{ c }}</option>
        </select>
        <input v-else :id="fieldId(f)" class="field" :class="{ 'dc-mono': f.attr === 'name' || attrName(f) !== f.attr }" :type="f.kind === 'number' ? 'number' : 'text'" :value="fieldValue(f) ?? ''" @change="setField(f, $event)">
        <p v-if="f.hint" class="hint el__hint">{{ f.hint }}</p>
      </div>

      <h4 class="dc-eyebrow">Other attributes</h4>
      <div v-for="a in others" :key="a.name" class="el__attr">
        <span class="dc-mono el__attr-name">{{ a.name }}</span>
        <input class="field dc-mono" :value="a.value ?? ''" :placeholder="a.value === null ? '(no value)' : ''" :aria-label="`Value of ${a.name}`" @change="setOther(a.name, $event)">
        <button type="button" class="btn btn--small" :title="`Take ${a.name} out`" :disabled="busy" @click="remove(a.name)">×</button>
      </div>
      <form class="el__attr" @submit.prevent="addAttr">
        <input v-model="newName" class="field dc-mono" placeholder="name" aria-label="Name of a new attribute">
        <input v-model="newValue" class="field dc-mono" placeholder="value" aria-label="Value of the new attribute">
        <button type="submit" class="btn btn--small" :disabled="!newName.trim() || busy">Add</button>
      </form>
    </template>

    <details class="el__html">
      <summary class="dc-eyebrow">HTML</summary>
      <textarea v-model="html" class="field dc-mono el__area" :rows="rows(html, 3)" spellcheck="false" aria-label="The element's HTML" @keydown="htmlKey" />
      <div class="toolbar"><button type="button" class="btn btn--small" :disabled="html === written || busy" title="Ctrl+Enter" @click="commitHtml">Apply</button></div>
    </details>
  </div>
</template>

<style scoped>
.el { display: flex; flex-direction: column; gap: 10px; container-type: inline-size; }
.el__head { display: flex; align-items: baseline; gap: 8px; }
.el__title { margin: 0; font-size: var(--dc-text-title); font-weight: var(--dc-weight-semibold); }
.el__field { display: grid; grid-template-columns: 110px minmax(0, 1fr); align-items: center; gap: 2px 10px; }
.el__field label { font-size: var(--dc-text-meta); }
.el__field input[type='checkbox'] { justify-self: start; }
.el__hint { grid-column: 2; margin: 0; }
.el__attr { display: grid; grid-template-columns: 110px minmax(0, 1fr) auto; align-items: center; gap: 6px; }
.el__attr .field { min-width: 0; }
form.el__attr { grid-template-columns: 110px minmax(0, 1fr) auto; }
.el__attr-name { font-size: var(--dc-text-meta); overflow: hidden; text-overflow: ellipsis; }
.el__area { width: 100%; box-sizing: border-box; resize: vertical; font-size: var(--dc-text-code); line-height: 1.45; tab-size: 4; }
/* Narrow: each label above its field. */
@container (max-width: 340px) {
  .el__field { grid-template-columns: minmax(0, 1fr); }
  .el__hint { grid-column: 1; }
  .el__attr, form.el__attr { grid-template-columns: 80px minmax(0, 1fr) auto; }
}
.el__html { display: flex; flex-direction: column; gap: 6px; }
.el__html summary { cursor: pointer; margin-bottom: 6px; }
</style>
