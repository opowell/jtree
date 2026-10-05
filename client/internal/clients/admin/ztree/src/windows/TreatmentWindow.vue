<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import ZTreeNode from '../components/ZTreeNode.vue'
import { windowCommands } from '../clients'
import { canCutTree, canPasteTree, copyTree, cutTree, info, pasteTree } from '../actions'
import { docs } from '../treatment/docs'
import type { TreeNode } from '../treatment/parse'

/*
 * A treatment's window: its stage tree. Click selects, double-click (or
 * Enter) opens the element's dialog, the boxes open and close branches, and
 * the arrow keys walk the tree as in any Windows tree view.
 */
const props = defineProps<{ windowId: string, docKey: string }>()

const doc = computed(() => docs[props.docKey])
const treeEl = ref<HTMLElement | null>(null)

/** The nodes on screen, top to bottom: what the arrow keys step through. */
const visible = computed(() => {
  const out: TreeNode[] = []
  const d = doc.value
  if (!d) return out
  const walk = (node: TreeNode) => {
    out.push(node)
    if (!d.collapsed[node.id]) node.children.forEach(walk)
  }
  d.treatment.tree.children.forEach(walk)
  return out
})

function select(id: string) {
  if (doc.value) doc.value.selected = id
}

function toggle(id: string) {
  if (!doc.value) return
  doc.value.collapsed = { ...doc.value.collapsed, [id]: !doc.value.collapsed[id] }
}

function open(id: string) {
  if (!doc.value) return
  select(id)
  void info(doc.value, id)
}

function keydown(event: KeyboardEvent) {
  const d = doc.value
  if (!d) return
  const list = visible.value
  const index = list.findIndex((n) => n.id === d.selected)
  const current = list[index]
  const mod = event.ctrlKey || event.metaKey
  if (mod && ['c', 'x', 'v'].includes(event.key.toLowerCase())) {
    event.preventDefault()
    event.stopPropagation()
    if (event.key.toLowerCase() === 'c') copyTree(d)
    else if (event.key.toLowerCase() === 'x') cutTree(d)
    else pasteTree(d)
    return
  }
  switch (event.key) {
    case 'ArrowDown':
      if (index < list.length - 1) select(list[index + 1].id)
      break
    case 'ArrowUp':
      if (index > 0) select(list[index - 1].id)
      break
    case 'ArrowRight':
      if (current?.children.length) {
        if (d.collapsed[current.id]) toggle(current.id)
        else select(current.children[0].id)
      }
      break
    case 'ArrowLeft':
      if (current?.children.length && !d.collapsed[current.id]) toggle(current.id)
      else {
        const parent = list.slice(0, index).reverse().find((n) => n.children.some((c) => c.id === current?.id))
        if (parent) select(parent.id)
      }
      break
    case 'Home':
      if (list.length) select(list[0].id)
      break
    case 'End':
      if (list.length) select(list[list.length - 1].id)
      break
    case 'Enter':
      if (current) void info(d, current.id)
      break
    default:
      return
  }
  event.preventDefault()
  event.stopPropagation()
}

// Keep the selection in view as the keyboard moves it.
watch(() => doc.value?.selected, async (id) => {
  await nextTick()
  treeEl.value?.querySelector(`[data-node="${CSS.escape(id ?? '')}"]`)?.scrollIntoView({ block: 'nearest' })
})

windowCommands[props.windowId] = {
  copy: () => doc.value && copyTree(doc.value),
  cut: () => doc.value && cutTree(doc.value),
  paste: () => doc.value && pasteTree(doc.value),
  canCut: () => Boolean(doc.value && canCutTree(doc.value)),
  canPaste: () => Boolean(doc.value && canPasteTree(doc.value)),
  exportText: () => (doc.value ? { name: doc.value.name, text: doc.value.source } : null),
}
onBeforeUnmount(() => delete windowCommands[props.windowId])
</script>

<template>
  <div class="zt-win">
    <div v-if="!doc" class="zt-tree"><p class="zt-hint">This treatment is no longer open.</p></div>
    <div
      v-else
      ref="treeEl"
      class="zt-tree"
      role="tree"
      tabindex="0"
      :aria-label="doc.name"
      @keydown="keydown"
    >
      <ul>
        <ZTreeNode
          v-for="node in doc.treatment.tree.children"
          :key="node.id"
          :node="node"
          :selected="doc.selected"
          :collapsed="doc.collapsed"
          @select="select"
          @open="open"
          @toggle="toggle"
        />
      </ul>
    </div>
  </div>
</template>
