<script setup lang="ts">
import { computed, ref } from 'vue'
import ZDialog from '../components/ZDialog.vue'

// File → Save As…: a name in the server's apps folder. A z-Tree treatment (kind 'ztree') is
// saved in z-Tree's text format (.txt); a jtree app as a .jtt.

const props = defineProps<{ name: string, kind?: 'ztree' | 'jtree' }>()
const ztree = props.kind === 'ztree'
const emit = defineEmits<{ close: [value?: string] }>()

const name = ref(props.name)
const cleaned = computed(() => {
  let value = name.value.trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/^apps\//, '')
  if (value && !(ztree ? /\.(txt|ztt)$/i : /\.(jtt|js)$/i).test(value)) value += ztree ? '.txt' : '.jtt'
  return value
})
const valid = computed(() => cleaned.value !== '' && !cleaned.value.split('/').includes('..'))
</script>

<template>
  <ZDialog title="Save As" :width="460" buttons="bottom" ok-label="Save" :ok-disabled="!valid" @ok="emit('close', cleaned)" @cancel="emit('close')">
    <div class="zt-form">
      <label>Save in:</label>
      <span class="zt-field" style="display: flex; align-items: center; background: var(--zt-face)">apps</span>
      <label for="save-name">File name:</label>
      <input id="save-name" v-model="name" class="zt-field" autocomplete="off">
      <label for="save-type">Save as type:</label>
      <select id="save-type" class="zt-field" disabled><option>{{ ztree ? 'Treatment, z-Tree text format (*.txt)' : 'Treatment (*.jtt)' }}</option></select>
    </div>
    <p class="zt-hint">The file is written on the jtree server, in its <code>apps</code> folder{{ cleaned ? `, as apps/${cleaned}` : '' }}.</p>
  </ZDialog>
</template>
