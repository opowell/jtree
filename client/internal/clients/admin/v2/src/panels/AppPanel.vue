<script setup lang="ts">
import { computed, ref } from 'vue'
import { StatusPill } from 'header-content-layout'
import type { RecordStatus } from 'header-content-layout'
import { state } from '../server/connection'
import { server } from '../server/commands'
import { folderOf, relativePath } from '../schema'
import { showPanel } from '../workspace'

const props = defineProps<{ appId: string }>()

const app = computed(() => state.apps[props.appId])
// Here rather than in the template: vue3-sfc-loader does not compile TypeScript in templates.
const status = computed<RecordStatus>(() => (app.value?.hasError ? 'failed' : 'ok'))
const queueTarget = ref('')

async function newSession() {
  await server.createSessionWithApp(props.appId)
  showPanel('session')
}

function addToSession() {
  void server.addApp(props.appId)
  showPanel('session')
}

function addToQueue() {
  if (!queueTarget.value) return
  void server.queueAddApp(queueTarget.value, props.appId)
  queueTarget.value = ''
}
</script>

<template>
  <div class="pane">
    <div v-if="!app" class="pane__empty"><p>This app is no longer on the server.</p></div>
    <template v-else>
      <header class="pane__head">
        <h2 class="pane__title">{{ app.title || app.shortId }}</h2>
        <StatusPill :status="status" />
      </header>
      <p v-if="app.description" style="margin: 0">{{ app.description }}</p>
      <p v-if="app.hasError" class="hint" style="color: var(--dc-danger)">
        The app failed to load{{ app.errorLine ? ` (line ${app.errorLine})` : '' }}. Fix the file and reload apps.
      </p>

      <div class="toolbar">
        <button type="button" class="btn btn--primary" :disabled="app.hasError || !state.connected" @click="newSession">New session with this app</button>
        <button type="button" class="btn" :disabled="app.hasError || !state.session || state.session.started" @click="addToSession">Add to open session</button>
        <template v-if="state.queues.length">
          <select v-model="queueTarget" class="field" aria-label="Queue to add this app to">
            <option value="">Add to queue…</option>
            <option v-for="queue in state.queues" :key="queue.id" :value="queue.id">{{ queue.displayName }}</option>
          </select>
          <button type="button" class="btn" :disabled="!queueTarget" @click="addToQueue">Add</button>
        </template>
      </div>

      <section class="pane__section">
        <dl class="kv">
          <dt>File</dt><dd class="dc-mono">{{ relativePath(app.appPath) }}</dd>
          <dt>Folder</dt><dd>{{ folderOf(app.appPath) }}</dd>
          <dt>Periods</dt><dd>{{ app.numPeriods ?? '—' }}</dd>
          <dt v-if="app.groupSize">Group size</dt><dd v-if="app.groupSize">{{ app.groupSize }}</dd>
          <dt>Stages</dt><dd>{{ app.stages?.length ? app.stages.join(' → ') : '—' }}</dd>
        </dl>
      </section>

      <section v-if="app.options?.length" class="pane__section">
        <h3 class="dc-eyebrow">Options</h3>
        <dl class="kv">
          <template v-for="option in app.options" :key="option.name">
            <dt class="dc-mono">{{ option.name }}</dt>
            <dd>{{ option.description ?? '' }} <span class="muted">default {{ JSON.stringify(option.defaultVal) }}</span></dd>
          </template>
        </dl>
      </section>

      <details v-if="app.appjs" class="pane__section">
        <summary class="dc-eyebrow" style="cursor: pointer">Source</summary>
        <pre class="code">{{ app.appjs }}</pre>
      </details>
    </template>
  </div>
</template>
