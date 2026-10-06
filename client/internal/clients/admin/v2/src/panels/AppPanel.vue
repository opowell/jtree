<script setup lang="ts">
import { computed, ref } from 'vue'
import { StatusPill } from 'header-content-layout'
import type { RecordStatus } from 'header-content-layout'
import ConfirmButton from '../components/ConfirmButton.vue'
import { state } from '../server/connection'
import { server } from '../server/commands'
import { appLabel, folderOf, relativePath } from '../schema'
import { closePanel, showPanel } from '../workspace'

const props = defineProps<{ appId: string, panelId: string }>()

const app = computed(() => state.apps[props.appId])
// Here rather than in the template: vue3-sfc-loader does not compile TypeScript in templates.
const status = computed<RecordStatus>(() => (app.value?.hasError ? 'failed' : 'ok'))
const kind = computed(() => (app.value?.isQueue ? 'queue' : 'app'))
const queueTarget = ref('')

// A queue can hold any app, other queues included, but not itself.
const queues = computed(() =>
  Object.values(state.apps).filter((a) => a.isQueue && a.id !== props.appId),
)

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

async function removeQueue() {
  await server.deleteQueue(props.appId)
  closePanel(props.panelId)
}
</script>

<template>
  <div class="pane">
    <div v-if="!app" class="pane__empty"><p>This app is no longer on the server.</p></div>
    <template v-else>
      <header class="pane__head">
        <h2 class="pane__title">{{ app.title || app.shortId }}</h2>
        <span v-if="app.isQueue" class="muted">queue</span>
        <StatusPill :status="status" />
      </header>
      <p v-if="app.description" style="margin: 0">{{ app.description }}</p>
      <p v-if="app.hasError" class="hint" style="color: var(--dc-danger)">
        The {{ kind }} failed to load{{ app.errorLine ? ` (line ${app.errorLine})` : '' }}{{ app.errorMessage ? `: ${app.errorMessage}` : '' }}. Fix the file and reload apps.
      </p>

      <div class="toolbar">
        <button type="button" class="btn btn--primary" :disabled="app.hasError || !state.connected" @click="newSession">New session with this {{ kind }}</button>
        <button type="button" class="btn" :disabled="app.hasError || !state.session || state.session.started" @click="addToSession">Add to open session</button>
        <template v-if="queues.length">
          <select v-model="queueTarget" class="field" aria-label="Queue to add this to">
            <option value="">Add to queue…</option>
            <option v-for="queue in queues" :key="queue.id" :value="queue.id">{{ appLabel(queue.id) }}</option>
          </select>
          <button type="button" class="btn" :disabled="!queueTarget" @click="addToQueue">Add</button>
        </template>
        <ConfirmButton v-if="app.isQueue" label="Delete" @confirm="removeQueue" />
      </div>

      <section class="pane__section">
        <dl class="kv">
          <dt>File</dt><dd class="dc-mono">{{ relativePath(app.appPath) }}</dd>
          <dt>Folder</dt><dd>{{ folderOf(app.appPath) }}</dd>
          <template v-if="!app.isQueue">
            <dt>Periods</dt><dd>{{ app.numPeriods ?? '—' }}</dd>
            <dt v-if="app.groupSize">Group size</dt><dd v-if="app.groupSize">{{ app.groupSize }}</dd>
            <dt>Stages</dt><dd>{{ app.stages?.length ? app.stages.join(' → ') : '—' }}</dd>
          </template>
        </dl>
      </section>

      <section v-if="app.isQueue" class="pane__section">
        <h3 class="dc-eyebrow">Apps, in order</h3>
        <p class="hint">Adding this queue to a session adds these apps in its place.</p>
        <ol v-if="app.apps?.length" class="list">
          <li v-for="(entry, index) in app.apps" :key="index">
            <span class="list__index">{{ index + 1 }}</span>
            <button type="button" class="btn btn--small list__main dc-truncate" style="justify-content: flex-start" @click="showPanel(`app:${entry.appId}`)">
              {{ appLabel(entry.appId) }}
            </button>
            <span v-if="state.apps[entry.appId]?.isQueue" class="muted">queue</span>
            <span v-if="Object.keys(entry.options ?? {}).length" class="muted dc-mono">{{ JSON.stringify(entry.options) }}</span>
          </li>
        </ol>
        <p v-else class="hint">This queue has no apps. Add one from an app's panel.</p>
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
