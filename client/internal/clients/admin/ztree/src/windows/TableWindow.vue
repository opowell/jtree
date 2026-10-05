<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import ZGrid from '../components/ZGrid.vue'
import { windowCommands } from '../clients'
import { buildTable, formatCell, toTsv } from '../tables'

/*
 * A table's window (manual 5.7): its variables across, its records down,
 * live while the session runs. Cells can be selected and copied, and
 * File → Export Table… writes the whole table, tab-separated.
 */
const props = defineProps<{ windowId: string, name: string, treatment: number }>()

const data = computed(() => buildTable(props.name, props.treatment))
const rows = computed(() => data.value.rows.map((row) => row.map(formatCell)))
const selection = ref<string[]>([])
const grid = ref<InstanceType<typeof ZGrid> | null>(null)

windowCommands[props.windowId] = {
  copy: () => {
    const text = grid.value?.selectionText() || toTsv(data.value)
    void navigator.clipboard?.writeText(text)
  },
  exportText: () => ({
    name: `${props.name}${props.treatment ? `_${props.treatment}` : ''}.xls`,
    text: toTsv(data.value),
  }),
}
onBeforeUnmount(() => delete windowCommands[props.windowId])
</script>

<template>
  <div class="zt-win">
    <ZGrid
      ref="grid"
      v-model:selection="selection"
      :label="name"
      :columns="data.columns.length ? data.columns : ['(no variables)']"
      :rows="rows"
    />
    <p v-if="!rows.length" class="zt-hint" style="padding: 10px 14px">
      {{ treatment ? 'No records yet in this treatment.' : 'No records yet.' }}
    </p>
  </div>
</template>
