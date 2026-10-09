<script setup lang="ts">
import { computed, ref } from 'vue'
import ZDialog from '../components/ZDialog.vue'
import ZGrid from '../components/ZGrid.vue'
import type { ZttTreatment } from '../treatment/ztt'

/*
 * The parameter table (manual 3.4) of a z-Tree treatment: a row per period, a column per
 * subject; each cell the subject's group in the period, and its program (the period's and the
 * subject's own programs in the first row and column). Read only: the treatment is z-Tree's.
 */
const props = defineProps<{ treatment: ZttTreatment, name: string }>()
const emit = defineEmits<{ close: [value?: boolean] }>()

const subjects = props.treatment.subjects
const n = Math.max(1, subjects.length)
const oneLine = (code?: string) => (code ?? '').replace(/\s*\n\s*/g, ' ').trim()

const columns = computed(() => ['', ...subjects.map((s) => s.name)])
const rows = computed(() => [
  ['(subject)', ...subjects.map((s) => oneLine(s.program))],
  ...props.treatment.periods.map((p, i) => [
    `${p.name}${p.program ? `: ${oneLine(p.program)}` : ''}`,
    ...subjects.map((_, j) => {
      const cell = props.treatment.params[i * n + j]
      return cell ? `${cell.label ? `${cell.label} ` : ''}G${cell.group}${cell.program ? `: ${oneLine(cell.program)}` : ''}` : ''
    }),
  ]),
])
const selection = ref<string[]>([])
</script>

<template>
  <ZDialog :title="`Parameter table - ${name}`" :width="720" @ok="emit('close', true)" @cancel="emit('close')">
    <p class="zt-hint" style="margin: 0 0 8px">
      {{ treatment.periods.length }} period(s), {{ subjects.length }} subject(s). Each cell: the subject's group (G) and program.
    </p>
    <div style="height: 320px">
      <ZGrid v-model:selection="selection" label="Parameter table" :columns="columns" :rows="rows" />
    </div>
  </ZDialog>
</template>
