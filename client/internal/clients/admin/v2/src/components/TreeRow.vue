<script setup lang="ts">
import type { DropPlace, TreeItem } from '../appTree'

defineOptions({ name: 'TreeRow' })

/*
 * One row of the app editor's tree, and its children's rows under it unless it is collapsed.
 * Elements and stages can be dragged (AppTree handles the dragging); drop marks where a drag
 * over this row would put what is dragged.
 */
const props = defineProps<{ item: TreeItem, selected: string, collapsed: Record<string, boolean>, depth: number, drop: DropPlace | null }>()
const emit = defineEmits<{ select: [id: string], toggle: [id: string] }>()
</script>

<template>
  <li role="none">
    <div
      class="tr"
      role="treeitem"
      :data-id="item.id"
      :data-kind="item.kind"
      :aria-selected="selected === item.id"
      :aria-expanded="item.children.length ? !collapsed[item.id] : undefined"
      :aria-level="depth + 1"
      :draggable="item.kind === 'node' || item.kind === 'stage'"
      :data-drop="drop?.id === item.id ? drop.where : undefined"
      :style="{ paddingLeft: `${depth * 14 + 2}px` }"
      @mousedown="emit('select', item.id)"
      @dblclick="item.children.length && emit('toggle', item.id)"
    >
      <button v-if="item.children.length" type="button" class="tr__toggle" tabindex="-1" :aria-label="collapsed[item.id] ? 'Expand' : 'Collapse'" @mousedown.stop @click="emit('toggle', item.id)">{{ collapsed[item.id] ? '▸' : '▾' }}</button>
      <span v-else class="tr__toggle" />
      <span class="tr__chip dc-mono">{{ item.chip }}</span>
      <span class="tr__label dc-truncate">{{ item.label }}</span>
      <span v-if="item.note" class="tr__note dc-truncate">{{ item.note }}</span>
    </div>
    <ul v-if="item.children.length && !collapsed[item.id]" role="group" class="tr__group">
      <TreeRow
        v-for="child in props.item.children"
        :key="child.id"
        :item="child"
        :selected="selected"
        :collapsed="collapsed"
        :depth="depth + 1"
        :drop="drop"
        @select="emit('select', $event)"
        @toggle="emit('toggle', $event)"
      />
    </ul>
  </li>
</template>

<style scoped>
.tr { display: flex; align-items: center; gap: 5px; padding: 1px 6px 1px 2px; border-radius: var(--dc-radius-sm); cursor: default; user-select: none; min-width: 0; font-size: var(--dc-text-meta); line-height: 1.6; }
.tr:hover { background: var(--dc-bg-2); }
.tr[aria-selected='true'] { background: var(--dc-accent-bg); color: var(--dc-accent); }
.tr__toggle { flex: 0 0 14px; width: 14px; padding: 0; border: 0; background: none; color: var(--dc-fg-2); font-size: var(--dc-text-eyebrow); line-height: 1; cursor: pointer; }
.tr__chip { flex: 0 0 auto; padding: 0 4px; border-radius: 3px; background: var(--dc-bg-2); color: var(--dc-fg-2); font-size: var(--dc-text-micro); }
.tr[data-kind='stage'] .tr__label, .tr[data-kind='app'] .tr__label { font-weight: var(--dc-weight-semibold); }
.tr[data-kind='stage'] .tr__chip { background: var(--dc-accent-bg); color: var(--dc-accent); }
.tr__label { min-width: 0; flex: 0 1 auto; }
.tr__note { min-width: 0; flex: 1 1 0; color: var(--dc-fg-2); }
.tr__group { list-style: none; margin: 0; padding: 0; }
.tr[draggable='true'] { cursor: grab; }
/* Where a drop would put what is dragged: a line above or below the row, or the row itself. */
.tr[data-drop] { position: relative; }
.tr[data-drop='before']::before, .tr[data-drop='after']::after { content: ''; position: absolute; left: var(--drop-indent, 0); right: 0; height: 2px; border-radius: 1px; background: var(--dc-accent); pointer-events: none; }
.tr[data-drop='before']::before { top: -1px; }
.tr[data-drop='after']::after { bottom: -1px; }
.tr[data-drop='inside'] { outline: 2px solid var(--dc-accent); outline-offset: -2px; background: var(--dc-accent-bg); }
</style>
