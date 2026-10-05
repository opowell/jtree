<script setup lang="ts">
import { computed, ref } from 'vue'
import ZDialog from '../components/ZDialog.vue'
import { state } from '../server/connection'

/*
 * Tools → Start z-Leaf…: what the manual's batch file does to test a
 * treatment on one computer (section 2.6),
 *
 *   start zleaf.exe /name first
 *   start zleaf.exe /name second
 *
 * one client per name, each in a window of its own here.
 */
const emit = defineEmits<{ close: [value?: { names: string[], tabs: boolean }] }>()

const existing = state.session ? Object.values(state.session.participants) : []
const offline = existing.filter((p) => p.numClients === 0).map((p) => p.id)
const names = ref((offline.length ? offline : ['first', 'second']).join('\n'))
const tabs = ref(false)

const list = computed(() => [...new Set(names.value.split(/[\n,]+/).map((n) => n.trim()).filter(Boolean))])
</script>

<template>
  <ZDialog title="Start z-Leaf" :width="420" :ok-disabled="!list.length" @ok="emit('close', { names: list, tabs })" @cancel="emit('close')">
    <div class="zt-form">
      <label for="leaf-names" class="zt-form__top">Names</label>
      <textarea id="leaf-names" v-model="names" class="zt-field" rows="8" spellcheck="false" style="font-family: inherit" />
      <span />
      <label class="zt-check"><input v-model="tabs" type="checkbox"> Open in browser tabs instead of windows</label>
    </div>
    <p class="zt-hint">One client per line, as <code>zleaf.exe /name …</code>. A name that is not yet a client of this session becomes one.</p>
  </ZDialog>
</template>
