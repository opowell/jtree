<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { StatusPill } from 'header-content-layout'
import type { RecordStatus } from 'header-content-layout'
import ConfirmButton from '../components/ConfirmButton.vue'
import { participantBase, state } from '../server/connection'
import { downloadOutputUrl, participantUrl, server } from '../server/commands'
import { appLabel, sessionState } from '../schema'
import { openSession, showPanel } from '../workspace'

const session = computed(() => state.session)
const status = computed(() => (session.value ? sessionState(session.value) : '') as RecordStatus)
const participantCount = computed(() => (session.value ? Object.keys(session.value.participants).length : 0))

const numParticipants = ref(0)
watch(participantCount, (count) => (numParticipants.value = count), { immediate: true })

const autoplayDelay = ref('')
watch(() => state.settings.autoplayDelay, (delay) => (autoplayDelay.value = String(delay ?? '')), { immediate: true })

const appToAdd = ref('')
const sessionToOpen = ref('')

const apps = computed(() =>
  Object.values(state.apps)
    .filter((app) => !app.hasError)
    .sort((a, b) => appLabel(a.id).localeCompare(appLabel(b.id))),
)

const otherSessions = computed(() =>
  [...state.sessions].reverse().filter((s) => s.id !== session.value?.id),
)

const exampleLink = computed(() => {
  const s = session.value
  if (!s) return ''
  const first = Object.keys(s.participants)[0] ?? 'P1'
  return participantUrl(participantBase(), s.id, first)
})

function addApp() {
  if (!appToAdd.value) return
  void server.addApp(appToAdd.value)
  appToAdd.value = ''
}

function open() {
  if (sessionToOpen.value) openSession(sessionToOpen.value)
  sessionToOpen.value = ''
}

async function remove() {
  if (session.value) await server.deleteSession(session.value.id)
}

// For the checkboxes below: vue3-sfc-loader does not compile TypeScript in templates.
function checked(event: Event): boolean {
  return (event.target as HTMLInputElement).checked
}
</script>

<template>
  <div class="pane">
    <div v-if="!session" class="pane__empty">
      <p>No session is open.</p>
      <div class="toolbar">
        <button type="button" class="btn btn--primary" :disabled="!state.connected" @click="server.createSession()">
          New session
        </button>
        <template v-if="otherSessions.length">
          <span class="muted">or</span>
          <select v-model="sessionToOpen" class="field" aria-label="Session to open" @change="open">
            <option value="">Open a session…</option>
            <option v-for="s in otherSessions" :key="s.id" :value="s.id">{{ s.id }}</option>
          </select>
        </template>
      </div>
      <button type="button" class="btn" @click="showPanel('browse')">Browse apps</button>
    </div>

    <template v-else>
      <header class="pane__head">
        <h2 class="pane__title dc-mono">{{ session.id }}</h2>
        <StatusPill :status="status" />
        <span class="muted">{{ participantCount }} participants · {{ session.apps.length }} apps</span>
      </header>

      <div class="toolbar" role="toolbar" aria-label="Session controls">
        <button type="button" class="btn btn--primary" :disabled="session.started" @click="server.start()">Start</button>
        <button v-if="session.isRunning" type="button" class="btn" @click="server.pause()">Pause</button>
        <button v-else type="button" class="btn" @click="server.resume()">Resume</button>
        <button type="button" class="btn" :disabled="!session.started" @click="server.advanceSlowest()">Advance slowest</button>
        <a class="btn" :href="downloadOutputUrl(session.id)" target="_blank" rel="noopener">Download output</a>
        <ConfirmButton label="Reset" @confirm="server.reset()" />
        <ConfirmButton label="Delete…" confirm="Confirm delete" @confirm="remove" />
      </div>

      <section class="pane__section" aria-labelledby="session-apps">
        <h3 id="session-apps" class="dc-eyebrow">Apps</h3>
        <ol v-if="session.apps.length" class="list">
          <li v-for="(app, index) in session.apps" :key="`${index}-${app.id}`">
            <span class="list__index">{{ index + 1 }}</span>
            <button type="button" class="btn btn--small list__main dc-truncate" style="justify-content: flex-start" @click="showPanel(`app:${app.id}`)">
              {{ app.title || app.shortId }}
            </button>
            <ConfirmButton class="btn--small" label="Remove" :disabled="session.started" @confirm="server.removeApp(index, app.id)" />
          </li>
        </ol>
        <p v-else class="hint">No apps yet. Add apps, or a queue, which adds its apps; participants play them in order.</p>
        <div class="toolbar">
          <select v-model="appToAdd" class="field" aria-label="App to add">
            <option value="">Choose an app…</option>
            <option v-for="app in apps" :key="app.id" :value="app.id">{{ appLabel(app.id) }}{{ app.isQueue ? ' (queue)' : '' }}</option>
          </select>
          <button type="button" class="btn" :disabled="!appToAdd" @click="addApp">Add app</button>
        </div>
      </section>

      <section class="pane__section" aria-labelledby="session-participants">
        <h3 id="session-participants" class="dc-eyebrow">Participants</h3>
        <div class="toolbar">
          <label class="muted" for="num-participants">Number</label>
          <input id="num-participants" v-model.number="numParticipants" class="field" type="number" min="0" step="1">
          <button type="button" class="btn" :disabled="numParticipants === participantCount" @click="server.setNumParticipants(numParticipants)">Set</button>
          <button type="button" class="btn" @click="showPanel('participants')">Show list</button>
        </div>
        <p class="hint">
          Participants join at <a :href="exampleLink" target="_blank" rel="noopener" class="dc-mono">{{ exampleLink }}</a>,
          with their own id in place of the last part.
        </p>
        <div class="toolbar">
          <span class="muted">Autoplay</span>
          <button type="button" class="btn" @click="server.setAutoplayForAll(true)">On for all</button>
          <button type="button" class="btn" @click="server.setAutoplayForAll(false)">Off for all</button>
          <label class="muted" for="autoplay-delay">delay</label>
          <input id="autoplay-delay" v-model="autoplayDelay" class="field dc-mono" style="width: 14em" placeholder="randomInt(4,8)*1000">
          <button type="button" class="btn" @click="server.setAutoplayDelay(autoplayDelay)">Set</button>
        </div>
        <div class="toolbar">
          <button type="button" class="btn" @click="server.reloadClients()">Reload all clients</button>
        </div>
      </section>

      <section class="pane__section" aria-labelledby="session-options">
        <h3 id="session-options" class="dc-eyebrow">Options</h3>
        <label class="check">
          <input type="checkbox" :checked="session.allowNewParts" @change="server.setAllowNewParts(checked($event))">
          <span>Allow new participants to log in<br><span class="hint">Clients can create a participant that does not exist yet. Existing participants can always log in.</span></span>
        </label>
        <label class="check">
          <input type="checkbox" :checked="session.allowAdminClientsToPlay" @change="server.setAllowAdminPlay(checked($event))">
          <span>Admin clients can play<br><span class="hint">Lets participant views opened here act as participants.</span></span>
        </label>
        <label class="check">
          <input type="checkbox" :checked="session.caseSensitiveLabels" @change="server.setCaseSensitiveLabels(checked($event))">
          <span>Case-sensitive participant ids<br><span class="hint">When on, “p1” and “P1” are different participants.</span></span>
        </label>
      </section>
    </template>
  </div>
</template>
