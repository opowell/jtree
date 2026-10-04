<script setup lang="ts">
import ZDialog from '../components/ZDialog.vue'
import type { TreeNode } from '../treatment/parse'

/*
 * The Item dialog (manual 8.3.26), filled from the screen's HTML: the label
 * is the text beside the field, the variable its `name`, the layout what it
 * accepts, minimum and maximum its `min` and `max`. Items are changed by
 * editing their screen.
 */
const props = defineProps<{ node: TreeNode, onEditScreen?: (() => void) | null }>()
const emit = defineEmits<{ close: [value?: boolean] }>()

const item = props.node.item ?? { label: props.node.label, variable: '', input: false, layout: '', min: '', max: '', html: '' }
const title = props.node.kind === 'button' ? 'Button' : props.node.kind === 'box' ? 'Box' : 'Item'

function editScreen() {
  emit('close', true)
  props.onEditScreen?.()
}
</script>

<template>
  <ZDialog :title="title" :width="500" @ok="emit('close', true)" @cancel="emit('close')">
    <div v-if="node.kind === 'box'" class="zt-form">
      <label>Name</label>
      <input class="zt-field" :value="node.label" readonly>
      <label>Items</label>
      <input class="zt-field" :value="node.children.length" readonly style="width: 80px">
    </div>
    <div v-else-if="node.kind === 'button'" class="zt-form">
      <label>Name</label>
      <input class="zt-field" :value="item.label" readonly>
      <label>Variable</label>
      <input class="zt-field" :value="item.variable" readonly>
      <label>Value</label>
      <input class="zt-field" :value="item.layout" readonly>
    </div>
    <div v-else class="zt-form">
      <label class="zt-form__top">Label</label>
      <textarea class="zt-field" rows="4" :value="item.label" readonly style="font-family: inherit; white-space: pre-wrap" />
      <label class="zt-form__top">Variable</label>
      <textarea class="zt-field" rows="2" :value="item.variable" readonly />
      <label class="zt-form__top">Layout</label>
      <textarea class="zt-field" rows="3" :value="item.layout" readonly />
      <span />
      <label class="zt-check"><input type="checkbox" :checked="item.input" disabled> Input</label>
      <label>Minimum</label>
      <input class="zt-field" :value="item.min" readonly>
      <label>Maximum</label>
      <input class="zt-field" :value="item.max" readonly>
      <span />
      <label class="zt-check"><input type="checkbox" disabled> Show value (value of variable or default)</label>
      <span />
      <label class="zt-check"><input type="checkbox" disabled> Empty allowed</label>
      <label>Default</label>
      <input class="zt-field" disabled>
      <label>Event time</label>
      <input class="zt-field" disabled>
    </div>
    <p v-if="item.html" class="zt-hint" style="font-family: var(--zt-mono); font-size: 11px; overflow-wrap: anywhere">{{ item.html }}</p>
    <template #buttons>
      <button type="button" class="zt-btn zt-btn--default" @click="emit('close', true)">OK</button>
      <button type="button" class="zt-btn" @click="emit('close')">Cancel</button>
      <button v-if="onEditScreen" type="button" class="zt-btn" @click="editScreen">Screen…</button>
    </template>
  </ZDialog>
</template>
