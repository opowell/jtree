<script setup lang="ts">
import ZDialog from '../components/ZDialog.vue'
import { state } from '../server/connection'
import { TABLE_LIFETIMES } from '../treatment/parse'
import { SESSION_TABLES } from '../tables'
import { openWindow, tableWindowId } from '../windows'

// The Table dialog (manual 8.3.3): a table's name and how long it lives.
const props = defineProps<{ name: string }>()
const emit = defineEmits<{ close: [value?: boolean] }>()

const lifetime = TABLE_LIFETIMES[props.name] ?? 'Period'
const isSession = SESSION_TABLES.includes(props.name)
const treatment = isSession ? 0 : state.session?.apps.length ?? 0

function show() {
  openWindow(tableWindowId(props.name, treatment))
  emit('close', true)
}
</script>

<template>
  <ZDialog title="Table" :width="380" @ok="emit('close', true)" @cancel="emit('close')">
    <div class="zt-form">
      <label>Name</label>
      <input class="zt-field" :value="name" readonly>
    </div>
    <fieldset class="zt-group">
      <legend>Lifetime</legend>
      <label v-for="option in ['Period', 'Treatment', 'Session']" :key="option" class="zt-check">
        <input type="radio" :checked="lifetime === option" disabled> {{ option }}
      </label>
    </fieldset>
    <template #buttons>
      <button type="button" class="zt-btn zt-btn--default" @click="emit('close', true)">OK</button>
      <button type="button" class="zt-btn" @click="emit('close')">Cancel</button>
      <button type="button" class="zt-btn" :disabled="!isSession && !treatment" @click="show">Show table</button>
    </template>
  </ZDialog>
</template>
