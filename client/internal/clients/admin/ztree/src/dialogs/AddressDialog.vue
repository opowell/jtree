<script setup lang="ts">
import { computed } from 'vue'
import ZDialog from '../components/ZDialog.vue'
import { state } from '../server/connection'
import { publicLeafUrl, server } from '../server/commands'

/*
 * Tools → z-Leaf address…: where subjects' machines find this session —
 * jtree's counterpart of the server address z-Leaf reads from server.eec
 * (manual 5.5), and of the client name it is started with (5.6).
 */
const emit = defineEmits<{ close: [value?: boolean] }>()

const session = computed(() => state.session)
const pattern = computed(() => publicLeafUrl('NAME'))
const example = computed(() => publicLeafUrl(Object.keys(session.value?.participants ?? {})[0] ?? 'P1'))

function copy(text: string) {
  void navigator.clipboard?.writeText(text)
}
</script>

<template>
  <ZDialog title="z-Leaf address" :width="560" :cancel-label="null" @ok="emit('close', true)" @cancel="emit('close')">
    <div class="zt-form">
      <label>Address</label>
      <div style="display: flex; gap: 6px">
        <input class="zt-field" :value="pattern" readonly style="flex: 1; font-family: var(--zt-mono)">
        <button type="button" class="zt-btn" style="min-width: 0" @click="copy(pattern)">Copy</button>
      </div>
      <label>Example</label>
      <a :href="example" target="_blank" rel="noopener" style="font-family: var(--zt-mono); overflow-wrap: anywhere">{{ example }}</a>
      <span />
      <label class="zt-check">
        <input type="checkbox" :checked="session?.allowNewParts" :disabled="!session" @change="server.setAllowNewParts(($event.target as HTMLInputElement).checked)">
        Clients with a new name may connect
      </label>
    </div>
    <p class="zt-hint">Open the address on each subject's machine with the client's name in place of NAME. Without the box ticked, only the clients already in the session can connect.</p>
  </ZDialog>
</template>
