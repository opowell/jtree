<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { serverUrl, state } from '../server/connection'
import { participantUrl, server } from '../server/commands'
import { unwatchParticipant, watchParticipant, workspace } from '../workspace'

// Each participant's own page, as they see it, side by side.

const width = ref(320)
const height = ref(420)
/** Bumped to reload one frame without touching the others. */
const reloads = reactive<Record<string, number>>({})

const session = computed(() => state.session)
const shown = computed(() =>
  session.value ? workspace.watched.filter((id) => id in session.value!.participants) : [],
)

function urlFor(pId: string) {
  return participantUrl(serverUrl, session.value!.id, pId)
}

function showAll() {
  for (const id of Object.keys(session.value?.participants ?? {})) watchParticipant(id)
}

function closeAll() {
  workspace.watched = []
}
</script>

<template>
  <div class="pane clients">
    <div v-if="!session" class="pane__empty"><p>Open a session to see its participants.</p></div>
    <template v-else>
      <div class="toolbar">
        <button type="button" class="btn" @click="showAll">Show all</button>
        <button type="button" class="btn" :disabled="!shown.length" @click="closeAll">Close all</button>
        <label class="muted" for="clients-width">Size</label>
        <input id="clients-width" v-model.number="width" type="range" min="200" max="900" step="20" aria-label="View width">
        <input v-model.number="height" type="range" min="200" max="1000" step="20" aria-label="View height">
      </div>
      <p v-if="!shown.length" class="hint">Open a participant from the Participants list, or show them all.</p>
      <div class="clients__grid" :style="{ '--w': `${width}px` }">
        <article v-for="pId in shown" :key="pId" class="clients__view">
          <header class="clients__bar">
            <strong class="dc-mono">{{ pId }}</strong>
            <span class="clients__spacer" />
            <button type="button" class="btn btn--small" title="Autoplay on" @click="server.setAutoplay(pId, true)">A on</button>
            <button type="button" class="btn btn--small" title="Autoplay off" @click="server.setAutoplay(pId, false)">A off</button>
            <button type="button" class="btn btn--small" title="Reload" @click="reloads[pId] = (reloads[pId] ?? 0) + 1">↻</button>
            <a class="btn btn--small" :href="urlFor(pId)" target="_blank" rel="noopener" title="Open in a new tab">↗</a>
            <button type="button" class="btn btn--small" title="Close" @click="unwatchParticipant(pId)">×</button>
          </header>
          <iframe
            :key="`${pId}-${reloads[pId] ?? 0}`"
            :src="urlFor(pId)"
            :title="`Participant ${pId}`"
            :style="{ height: `${height}px` }"
          />
        </article>
      </div>
    </template>
  </div>
</template>

<style scoped>
.clients__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(var(--w), 100%), 1fr));
  gap: 10px;
}
.clients__view {
  border: 1px solid var(--dc-line-2);
  border-radius: var(--dc-radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--dc-bg-1);
}
.clients__bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-bottom: 1px solid var(--dc-line);
}
.clients__spacer { flex: 1; }
iframe {
  border: 0;
  width: 100%;
  background: #fff;
}
</style>
