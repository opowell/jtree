<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { downloadUrl, emit, openSession, participantUrl, state } from '../server'

const props = defineProps<{ id: string, tab: string }>()
const TABS = [['links', 'Links'], ['monitor', 'Monitor'], ['data', 'Data'], ['reports', 'Reports'], ['payments', 'Payments'], ['description', 'Description']]

const session = computed(() => (state.session?.id === props.id ? state.session : null))
const participants = computed(() => Object.values(session.value?.participants ?? {}) as any[])
const currency = computed(() => session.value?.currency ?? '')

watch(() => props.id, (id) => { if (id) openSession(id) }, { immediate: true })

// The monitor and payments stay current.
let timer: ReturnType<typeof setInterval> | null = null
watch(() => props.tab, (tab) => {
  if (timer) clearInterval(timer)
  timer = null
  if (tab === 'monitor' || tab === 'payments') {
    emit('otreeMonitor', props.id)
    timer = setInterval(() => emit('otreeMonitor', props.id), 2000)
  }
  if (tab === 'data') loadData()
  if (tab === 'reports') emit('otreeReports', props.id)
}, { immediate: true })
onUnmounted(() => { if (timer) clearInterval(timer) })

const totalPayment = computed(() => state.monitor.reduce((sum, r) => sum + r.payment, 0))

// Data: oTree's wide CSV, as a table.
const data = ref<string[][]>([])
async function loadData() {
  const res = await fetch(downloadUrl(props.id, 'otree-wide'))
  data.value = res.ok ? parseCSV(await res.text()) : []
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [[]]
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++ } else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { rows[rows.length - 1].push(cell); cell = '' }
    else if (ch === '\n') { rows[rows.length - 1].push(cell); cell = ''; rows.push([]) }
    else cell += ch
  }
  if (cell !== '' || rows[rows.length - 1].length) rows[rows.length - 1].push(cell)
  return rows.filter((r) => r.length > 0)
}

const roomFor = ref('')
function openInRoom() {
  if (roomFor.value) emit('roomOpenSession', { roomId: roomFor.value, sessionId: props.id })
}

function seconds(s: number | null): string {
  return s == null ? '' : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
</script>

<template>
  <h1 class="h3 mb-3">Session {{ id }}</h1>
  <ul class="nav nav-tabs mb-4">
    <li v-for="[key, name] in TABS" :key="key" class="nav-item">
      <a class="nav-link" :class="{ active: tab === key }" :href="`#/session/${encodeURIComponent(id)}/${key}`">{{ name }}</a>
    </li>
  </ul>
  <p v-if="!session" class="text-body-secondary">Loading…</p>

  <template v-else-if="tab === 'links'">
    <h2 class="h5">Participant links</h2>
    <table class="table table-sm">
      <thead><tr><th>Participant</th><th>Label</th><th>Link</th></tr></thead>
      <tbody>
        <tr v-for="p in participants" :key="p.id">
          <td>{{ p.id }}</td><td>{{ p.label }}</td>
          <td><a :href="participantUrl(id, p.id)" target="_blank" rel="noopener">{{ participantUrl(id, p.id) }}</a></td>
        </tr>
      </tbody>
    </table>
    <form v-if="state.rooms.length" class="row g-2 mt-3" @submit.prevent="openInRoom">
      <div class="col-auto">
        <select v-model="roomFor" class="form-select form-select-sm">
          <option value="">Open in a room…</option>
          <option v-for="r in state.rooms" :key="r.id" :value="r.id">{{ r.displayName }}{{ r.sessionId === id ? ' (open here)' : '' }}</option>
        </select>
      </div>
      <div class="col-auto"><button class="btn btn-sm btn-outline-primary" :disabled="!roomFor">Open</button></div>
    </form>
  </template>

  <template v-else-if="tab === 'monitor'">
    <button type="button" class="btn btn-sm btn-outline-secondary mb-3" @click="emit('sessionAdvanceSlowest', id)">Advance slowest participants</button>
    <table class="table table-sm table-striped">
      <thead><tr><th>Participant</th><th>Label</th><th>App</th><th>Round</th><th>Page</th><th>Status</th><th>Time on page</th></tr></thead>
      <tbody>
        <tr v-for="r in state.monitor" :key="r.code">
          <td>{{ r.code }}</td><td>{{ r.label }}</td><td>{{ r.app }}</td><td>{{ r.round }}</td>
          <td>{{ r.page }}</td><td>{{ r.status }}</td><td>{{ seconds(r.secondsOnPage) }}</td>
        </tr>
      </tbody>
    </table>
  </template>

  <template v-else-if="tab === 'data'">
    <p>
      <a v-for="f in session.exports ?? []" :key="f.id" class="btn btn-sm btn-outline-primary me-2 mb-2" :href="downloadUrl(id, f.id)">{{ f.name }}</a>
      <button type="button" class="btn btn-sm btn-outline-secondary mb-2" @click="loadData">Refresh</button>
    </p>
    <div class="table-responsive">
      <table v-if="data.length" class="table table-sm table-bordered small">
        <thead><tr><th v-for="(h, i) in data[0]" :key="i">{{ h }}</th></tr></thead>
        <tbody><tr v-for="(row, r) in data.slice(1)" :key="r"><td v-for="(c, i) in row" :key="i">{{ c }}</td></tr></tbody>
      </table>
    </div>
  </template>

  <template v-else-if="tab === 'reports'">
    <button type="button" class="btn btn-sm btn-outline-secondary mb-3" @click="emit('otreeReports', id)">Refresh</button>
    <p v-if="!state.reports.length" class="text-body-secondary">No reports: an app's admin_report.html has one for each round.</p>
    <section v-for="r in state.reports" :key="r.app + r.round" class="mb-4">
      <h2 class="h5">{{ r.app }}, round {{ r.round }}</h2>
      <div v-html="r.html"></div>
    </section>
  </template>

  <template v-else-if="tab === 'payments'">
    <table class="table table-sm">
      <thead><tr><th>Participant</th><th>Label</th><th>Points</th><th>Payment {{ currency }}</th></tr></thead>
      <tbody>
        <tr v-for="r in state.monitor" :key="r.code">
          <td>{{ r.code }}</td><td>{{ r.label }}</td><td>{{ r.payoff }}</td><td>{{ r.payment.toFixed(2) }}</td>
        </tr>
      </tbody>
      <tfoot><tr><th colspan="3">Total</th><th>{{ totalPayment.toFixed(2) }}</th></tr></tfoot>
    </table>
    <p class="text-body-secondary small">Including the participation fee of {{ session.showUpFee }} and {{ session.exchangeRate }} {{ currency }} per point.</p>
  </template>

  <template v-else>
    <table class="table table-sm">
      <tbody>
        <tr v-for="(v, k) in session.otreeConfig ?? {}" :key="k"><th>{{ k }}</th><td>{{ Array.isArray(v) ? v.join(', ') : v }}</td></tr>
      </tbody>
    </table>
  </template>
</template>
