<script setup lang="ts">
import { computed } from 'vue'
import ConfirmButton from '../components/ConfirmButton.vue'
import { state } from '../server/connection'
import { server } from '../server/commands'
import { appLabel, relativePath } from '../schema'
import { closePanel, showPanel } from '../workspace'

const props = defineProps<{ queueId: string, panelId: string }>()

const queue = computed(() => state.queues.find((q) => q.id === props.queueId))

async function start() {
  await server.startSessionFromQueue(props.queueId)
  showPanel('session')
}

function addToSession() {
  void server.addQueue(props.queueId)
  showPanel('session')
}

async function remove() {
  await server.deleteQueue(props.queueId)
  closePanel(props.panelId)
}
</script>

<template>
  <div class="pane">
    <div v-if="!queue" class="pane__empty"><p>This queue is no longer on the server.</p></div>
    <template v-else>
      <header class="pane__head">
        <h2 class="pane__title">{{ queue.displayName }}</h2>
        <span class="muted dc-mono">{{ relativePath(queue.id) }}</span>
      </header>

      <div class="toolbar">
        <button type="button" class="btn btn--primary" :disabled="!state.connected" @click="start">Start session from queue</button>
        <button type="button" class="btn" :disabled="!state.session || state.session.started" @click="addToSession">Add to open session</button>
        <ConfirmButton label="Delete" @confirm="remove" />
      </div>

      <section class="pane__section">
        <h3 class="dc-eyebrow">Apps, in order</h3>
        <ol v-if="queue.apps.length" class="list">
          <li v-for="(entry, index) in queue.apps" :key="index">
            <span class="list__index">{{ index + 1 }}</span>
            <button type="button" class="btn btn--small list__main dc-truncate" style="justify-content: flex-start" @click="showPanel(`app:${entry.appId}`)">
              {{ appLabel(entry.appId) }}
            </button>
            <span v-if="Object.keys(entry.options ?? {}).length" class="muted dc-mono">{{ JSON.stringify(entry.options) }}</span>
          </li>
        </ol>
        <p v-else class="hint">This queue has no apps. Add one from an app's panel.</p>
      </section>
    </template>
  </div>
</template>
