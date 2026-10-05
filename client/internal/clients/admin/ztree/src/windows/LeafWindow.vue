<script setup lang="ts">
import { computed, ref } from 'vue'
import { state } from '../server/connection'
import { leafUrl, server } from '../server/commands'
import { clientState } from '../clients'

/*
 * One client's z-Leaf: the page that subject sees, live, inside a window —
 * the way the manual tests a treatment with several z-Leaves on one computer
 * (section 2.6). Opening it connects that client.
 */
const props = defineProps<{ pId: string }>()

const reloads = ref(0)
const url = computed(() => leafUrl(props.pId))
const participant = computed(() => state.session?.participants[props.pId])
const where = computed(() => (participant.value && state.session ? clientState(participant.value, state.session) : ''))
</script>

<template>
  <div class="zt-leaf">
    <div class="zt-leaf__bar">
      <span>{{ where || (participant ? 'Ready' : 'connecting…') }}</span>
      <button type="button" class="zt-btn" title="Autoplay on" @click="server.setAutoplay(pId, true)">Auto</button>
      <button type="button" class="zt-btn" title="Autoplay off" @click="server.setAutoplay(pId, false)">Manual</button>
      <button type="button" class="zt-btn" title="Restart this z-Leaf" @click="reloads++">Restart</button>
      <a class="zt-btn" style="display: inline-grid; place-items: center; text-decoration: none; color: inherit" :href="url" target="_blank" rel="noopener" title="Open in a browser tab">↗</a>
    </div>
    <iframe :key="reloads" :src="url" :title="`z-Leaf ${pId}`" />
  </div>
</template>
