<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { emit, state } from '../server'

// Config keys oTree sets itself; the others can be changed when creating a session.
const FIXED = ['name', 'display_name', 'app_sequence', 'num_demo_participants', 'doc']

const configId = ref('')
const numParticipants = ref<number | null>(null)
const values = ref<Record<string, string>>({})
const creating = ref(false)

const config = computed(() => state.configs.find((c) => c.id === configId.value) ?? null)
const editable = computed(() => (config.value ? Object.keys(config.value.config).filter((k) => !FIXED.includes(k)) : []))

watch(config, (c) => {
  numParticipants.value = c ? Number(c.config.num_demo_participants ?? 1) : null
  values.value = Object.fromEntries(editable.value.map((k) => [k, String(c!.config[k] ?? '')]))
})

/** A config value as typed, as the type it had. */
function typed(key: string): unknown {
  const before = config.value!.config[key]
  const text = values.value[key]
  if (typeof before === 'number') return Number(text)
  if (typeof before === 'boolean') return text === 'true'
  return text
}

function create() {
  if (!config.value) return
  const changed: Record<string, unknown> = {}
  for (const k of editable.value) {
    const v = typed(k)
    if (v !== config.value.config[k]) changed[k] = v
  }
  creating.value = true
  emit('otreeCreateSession', { configId: config.value.id, numParticipants: numParticipants.value, config: changed })
}

// The session just created is opened for this admin: go to it.
watch(() => state.session?.id, (id) => {
  if (creating.value && id) {
    creating.value = false
    location.hash = `#/session/${encodeURIComponent(id)}/links`
  }
})
</script>

<template>
  <h1 class="h3 mb-4">Sessions</h1>
  <div class="card mb-4">
    <div class="card-body">
      <h2 class="h5 card-title">Create a session</h2>
      <p v-if="!state.configs.length" class="text-body-secondary">
        No session configs: add an oTree project (a folder with its settings.py) to the apps folder.
      </p>
      <form v-else @submit.prevent="create">
        <div class="row g-3 align-items-end">
          <div class="col-md-6">
            <label class="form-label" for="config">Session config</label>
            <select id="config" v-model="configId" class="form-select" required>
              <option value="" disabled>Choose…</option>
              <option v-for="c in state.configs" :key="c.id" :value="c.id">{{ c.displayName }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label" for="participants">Participants</label>
            <input id="participants" v-model.number="numParticipants" type="number" min="1" class="form-control" required>
          </div>
          <div class="col-md-3">
            <button class="btn btn-primary w-100" :disabled="!config || creating">Create</button>
          </div>
        </div>
        <p v-if="config?.doc" class="mt-3 text-body-secondary">{{ config.doc }}</p>
        <div v-if="editable.length" class="row g-3 mt-1">
          <div v-for="k in editable" :key="k" class="col-md-4">
            <label class="form-label" :for="'config-' + k">{{ k }}</label>
            <input :id="'config-' + k" v-model="values[k]" class="form-control">
          </div>
        </div>
      </form>
    </div>
  </div>

  <table v-if="state.sessions.length" class="table table-hover align-middle">
    <thead><tr><th>Session</th><th>Apps</th><th>Participants</th><th></th></tr></thead>
    <tbody>
      <tr v-for="s in state.sessions" :key="s.id">
        <td><a :href="`#/session/${encodeURIComponent(s.id)}/links`">{{ s.id }}</a></td>
        <td>{{ (s.appSequence ?? []).map((a) => a.split(/[\\/]/).slice(-2, -1)[0] || a).join(', ') }}</td>
        <td>{{ s.numParticipants }}</td>
        <td><span v-if="s.started" class="badge text-bg-success">started</span></td>
      </tr>
    </tbody>
  </table>
</template>
