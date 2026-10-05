<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import ZGrid from '../components/ZGrid.vue'
import { state } from '../server/connection'
import { server } from '../server/commands'
import { clientState, clients, clock, connectedCount, monitor, timeLeft, treatmentOf, windowCommands } from '../clients'
import { openWindow } from '../windows'
import { say } from '../actions'
import { toTsv } from '../tables'

/*
 * The Connection Monitor (manual 5.4 and 8.5.1): one line per client, with
 * its number, its name (bracketed while it is not connected), whether it is
 * selected for the next treatment, the treatment it is in, its state, the
 * time left on its screen, and whether its treatment stops after this period.
 *
 * Click a state — or the box above the state column for all of them — to
 * choose who Run → Leave Stage moves on. Double-click a client to see its
 * z-Leaf.
 */
const props = defineProps<{ windowId: string }>()

const STATE_COL = 4
const columns = computed(() => [
  `${connectedCount.value} client${connectedCount.value === 1 ? '' : 's'}`,
  'client name', 'selected', 'treatment', 'state', 'time', 'stop after period',
])

const rows = computed(() => {
  const session = state.session
  if (!session) return []
  return clients.value.map((line) => {
    const p = line.participant
    const app = p.appIndex > 0 ? session.apps[p.appIndex - 1] : undefined
    const left = timeLeft(p.player, clock.now)
    return [
      String(line.number),
      line.connected ? line.id : `(${line.id})`,
      monitor.picked.includes(line.id) ? '[x]' : '[ ]',
      p.appIndex > 0 ? String(treatmentOf(p, session)) : '---',
      clientState(p, session),
      left == null ? '' : String(Math.ceil(left / 1000)),
      p.player && app ? (app.stopAfterPeriod ? '[x]' : '[ ]') : '',
    ]
  })
})

const dim = computed(() => new Set(clients.value.flatMap((line, r) => (line.connected ? [] : [`${r}:1`]))))

// The selection is kept by client, so it stays on the same subjects when
// lines move: `<client id>|<column>`.
const chosen = ref<string[]>([])
const selection = computed(() =>
  chosen.value.flatMap((key) => {
    const [id, col] = key.split('|')
    const r = clients.value.findIndex((c) => c.id === id)
    return r === -1 ? [] : [`${r}:${col}`]
  }),
)

function setSelection(keys: string[]) {
  chosen.value = keys.map((key) => {
    const [r, c] = key.split(':').map(Number)
    return `${clients.value[r]?.id}|${c}`
  })
}

watch(chosen, (keys) => {
  monitor.states = keys.filter((k) => k.endsWith(`|${STATE_COL}`)).map((k) => k.split('|')[0])
}, { immediate: true })

// Clients that leave the session leave the selection too.
watch(() => clients.value.map((c) => c.id).join(), () => {
  const ids = new Set(clients.value.map((c) => c.id))
  monitor.picked = monitor.picked.filter((id) => ids.has(id))
  chosen.value = chosen.value.filter((k) => ids.has(k.split('|')[0]))
})

async function toggle(r: number, c: number) {
  const line = clients.value[r]
  if (!line) return
  if (c === 2) {
    monitor.picked = monitor.picked.includes(line.id)
      ? monitor.picked.filter((id) => id !== line.id)
      : [...monitor.picked, line.id]
    return
  }
  if (c === 6) {
    const p = line.participant
    const app = state.session?.apps[p.appIndex - 1]
    if (!p.player || !app) return
    // Ticking one client's treatment ticks it for all its clients: it is the treatment that stops.
    await server.setStopAfterPeriod(p.appIndex, !app.stopAfterPeriod)
    say(`Treatment ${p.appIndex} ${app.stopAfterPeriod ? 'goes on' : 'stops'} after this period`)
  }
}

function open(r: number) {
  const line = clients.value[r]
  if (line) openWindow(`leaf:${line.id}`)
}

const grid = ref<InstanceType<typeof ZGrid> | null>(null)

windowCommands[props.windowId] = {
  copy: () => {
    const text = grid.value?.selectionText()
    if (text) void navigator.clipboard?.writeText(text)
  },
  exportText: () => ({ name: 'clients.xls', text: toTsv({ columns: columns.value, rows: rows.value }) }),
}
onBeforeUnmount(() => delete windowCommands[props.windowId])
</script>

<template>
  <div class="zt-win">
    <ZGrid
      ref="grid"
      label="Connection Monitor"
      :columns="columns"
      :rows="rows"
      :widths="[96, 150, 90, 90, 190, 70, 130]"
      :toggles="[2, 6]"
      :dim="dim"
      :selection="selection"
      @update:selection="setSelection"
      @toggle="toggle"
      @open="open"
    />
    <p v-if="!rows.length" class="zt-hint" style="padding: 10px 14px">
      No clients yet. Start z-Leaves with Tools → Start z-Leaf…, or give subjects the address in Tools → z-Leaf address….
    </p>
  </div>
</template>
