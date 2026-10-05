<script setup lang="ts">
import { computed, ref } from 'vue'
import ZDialog from '../components/ZDialog.vue'
import ZIcon from '../components/ZIcon.vue'
import { state } from '../server/connection'

/*
 * Run → Restore Session… (manual 8.5.17). z-Tree picks up a session from its
 * sessioninfo file; the jtree server keeps every session, so this lists them
 * and opens the one chosen, with its clients where they were. A new session
 * is what starting z-Tree afresh gives.
 */
const emit = defineEmits<{ close: [value?: string] }>()

const sessions = computed(() => [...state.sessions].sort((a, b) => b.id.localeCompare(a.id)))
const selected = ref<string | null>(sessions.value.find((s) => s.id !== state.session?.id)?.id ?? null)

function describe(s: (typeof sessions.value)[number]): string {
  const parts = [`${s.numParticipants ?? 0} clients`, `${s.numApps ?? 0} treatments`]
  if (!s.started) parts.push('not started')
  return parts.join(', ')
}
</script>

<template>
  <ZDialog title="Restore Session" :width="520" buttons="bottom" ok-label="Restore" :ok-disabled="!selected" @ok="emit('close', selected ?? undefined)" @cancel="emit('close')">
    <div class="zt-files" role="listbox" aria-label="Sessions" style="height: 300px">
      <div
        v-for="s in sessions"
        :key="s.id"
        class="zt-files__row"
        role="option"
        :aria-selected="selected === s.id"
        :data-selected="selected === s.id"
        @mousedown="selected = s.id"
        @dblclick="emit('close', s.id)"
      >
        <ZIcon name="file" />
        <span>{{ s.id }}_sessioninfo</span>
        <small>{{ s.id === state.session?.id ? 'open now · ' : '' }}{{ describe(s) }}</small>
      </div>
    </div>
    <template #buttons>
      <button type="button" class="zt-btn" style="margin-right: auto" @click="emit('close', '__new__')">New session</button>
      <button type="button" class="zt-btn zt-btn--default" :disabled="!selected" @click="emit('close', selected ?? undefined)">Restore</button>
      <button type="button" class="zt-btn" @click="emit('close')">Cancel</button>
    </template>
  </ZDialog>
</template>
