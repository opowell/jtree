<script setup lang="ts">
import { computed, ref } from 'vue'

/*
 * A z-Tree table: black-ruled cells, a narrow box at the left of each row and
 * over each column that selects the whole of it, and selected cells drawn
 * black. Click selects a cell, shift-click a block, ctrl-click adds one.
 * Selection is the parent's (`v-model:selection`, cell keys `row:col`), since
 * what it means — which subjects leave their stage — is the parent's too.
 */
const props = withDefaults(defineProps<{
  columns: string[]
  rows: string[][]
  selection?: string[]
  /** Column widths in px; columns without one share what is left. */
  widths?: number[]
  /** Cells drawn grey: `row:col`. */
  dim?: Set<string>
  /** Columns whose cells are pressed rather than selected. */
  toggles?: number[]
  label?: string
}>(), { selection: () => [], widths: () => [], toggles: () => [] })

const emit = defineEmits<{
  'update:selection': [keys: string[]]
  toggle: [row: number, col: number]
  open: [row: number, col: number]
  copy: [text: string]
}>()

const anchor = ref<{ r: number, c: number } | null>(null)
const tableEl = ref<HTMLTableElement | null>(null)
const focus = () => tableEl.value?.focus({ preventScroll: true })
const selected = computed(() => new Set(props.selection))
const key = (r: number, c: number) => `${r}:${c}`

function block(a: { r: number, c: number }, b: { r: number, c: number }): string[] {
  const out: string[] = []
  for (let r = Math.min(a.r, b.r); r <= Math.max(a.r, b.r); r++) {
    for (let c = Math.min(a.c, b.c); c <= Math.max(a.c, b.c); c++) out.push(key(r, c))
  }
  return out
}

function press(event: MouseEvent, r: number, c: number) {
  focus()
  if (props.toggles.includes(c)) {
    emit('toggle', r, c)
    return
  }
  const here = { r, c }
  if (event.shiftKey && anchor.value) {
    emit('update:selection', block(anchor.value, here))
    return
  }
  anchor.value = here
  if (event.ctrlKey || event.metaKey) {
    const next = new Set(selected.value)
    if (next.has(key(r, c))) next.delete(key(r, c))
    else next.add(key(r, c))
    emit('update:selection', [...next])
    return
  }
  emit('update:selection', [key(r, c)])
}

function selectColumn(c: number) {
  focus()
  if (!props.rows.length) return
  anchor.value = { r: 0, c }
  emit('update:selection', block({ r: 0, c }, { r: props.rows.length - 1, c }))
}

function selectRow(r: number) {
  focus()
  anchor.value = { r, c: 0 }
  emit('update:selection', block({ r, c: 0 }, { r, c: props.columns.length - 1 }))
}

function selectAll() {
  focus()
  if (!props.rows.length) return
  emit('update:selection', block({ r: 0, c: 0 }, { r: props.rows.length - 1, c: props.columns.length - 1 }))
}

/** The selection as text, a tab between cells: what Edit → Copy puts on the clipboard. */
function selectionText(): string {
  const cells = [...selected.value].map((k) => k.split(':').map(Number))
  if (!cells.length) return ''
  const rows = [...new Set(cells.map(([r]) => r))].sort((a, b) => a - b)
  const cols = [...new Set(cells.map(([, c]) => c))].sort((a, b) => a - b)
  return rows.map((r) => cols.map((c) => (selected.value.has(key(r, c)) ? props.rows[r]?.[c] ?? '' : '')).join('\t')).join('\n')
}

function keydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
    const text = selectionText()
    if (!text) return
    event.preventDefault()
    void navigator.clipboard?.writeText(text)
    emit('copy', text)
  } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
    event.preventDefault()
    selectAll()
  }
}

defineExpose({ selectionText, focus })
</script>

<template>
  <table ref="tableEl" class="zt-grid" tabindex="0" :aria-label="label" @keydown="keydown">
    <colgroup>
      <col style="width: 10px">
      <col v-for="(column, c) in columns" :key="c" :style="widths[c] ? { width: `${widths[c]}px` } : { minWidth: '90px' }">
    </colgroup>
    <thead>
      <tr>
        <th class="zt-grid__corner" title="Select all" @mousedown.prevent="selectAll" />
        <th v-for="(column, c) in columns" :key="c" :title="column" @mousedown.prevent="selectColumn(c)">{{ column }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, r) in rows" :key="r">
        <th class="zt-grid__rowhead" @mousedown.prevent="selectRow(r)" />
        <td
          v-for="(cell, c) in row"
          :key="c"
          :data-selected="selected.has(`${r}:${c}`)"
          :data-dim="dim?.has(`${r}:${c}`) ?? false"
          :data-toggle="toggles.includes(c)"
          :title="cell"
          @mousedown.prevent="press($event, r, c)"
          @dblclick="emit('open', r, c)"
        >{{ cell }}</td>
      </tr>
    </tbody>
  </table>
</template>
