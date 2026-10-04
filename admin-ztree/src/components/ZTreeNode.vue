<script setup lang="ts">
import type { TreeNode } from '../treatment/parse'
import ZIcon from './ZIcon.vue'

defineOptions({ name: 'ZTreeNode' })

const props = defineProps<{
  node: TreeNode
  selected: string | null
  collapsed: Record<string, boolean>
}>()

const emit = defineEmits<{
  select: [id: string]
  open: [id: string]
  toggle: [id: string]
}>()

function icon(node: TreeNode): string {
  if (node.kind === 'box') return node.label === 'Standard' ? 'standard' : 'box'
  if (node.kind === 'line') return ''
  return node.kind
}
</script>

<template>
  <li :aria-expanded="node.children.length ? !collapsed[node.id] : undefined">
    <button
      v-if="node.children.length"
      type="button"
      class="zt-tree__toggle"
      tabindex="-1"
      :data-closed="Boolean(collapsed[node.id])"
      :aria-label="collapsed[node.id] ? 'Expand' : 'Collapse'"
      @click="emit('toggle', node.id)"
    >{{ collapsed[node.id] ? '+' : '−' }}</button>
    <div class="zt-tree__row">
      <ZIcon v-if="icon(node)" class="zt-tree__icon" :name="icon(node)" />
      <span
        class="zt-tree__label"
        role="treeitem"
        :data-kind="node.kind"
        :data-selected="selected === node.id"
        :aria-selected="selected === node.id"
        :data-node="node.id"
        @mousedown="emit('select', node.id)"
        @dblclick="emit('open', node.id)"
      >{{ node.label }}<span v-if="node.note && node.kind !== 'program'" class="zt-tree__note">&nbsp;{{ node.note }}</span></span>
      <span v-if="node.kind === 'program' && node.note" class="zt-tree__hook">{{ node.note }}</span>
    </div>
    <ul v-if="node.children.length && !collapsed[node.id]" role="group">
      <ZTreeNode
        v-for="child in props.node.children"
        :key="child.id"
        :node="child"
        :selected="selected"
        :collapsed="collapsed"
        @select="emit('select', $event)"
        @open="emit('open', $event)"
        @toggle="emit('toggle', $event)"
      />
    </ul>
  </li>
</template>
