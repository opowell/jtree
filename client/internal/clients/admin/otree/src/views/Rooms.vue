<script setup lang="ts">
import { ref } from 'vue'
import { emit, serverUrl, state } from '../server'

const chosen = ref<Record<string, string>>({})

function open(roomId: string) {
  if (chosen.value[roomId]) emit('roomOpenSession', { roomId, sessionId: chosen.value[roomId] })
}
</script>

<template>
  <h1 class="h3 mb-4">Rooms</h1>
  <p v-if="!state.rooms.length" class="text-body-secondary">No rooms: an oTree project's ROOMS, or jtree's rooms folder, have them.</p>
  <div v-for="room in state.rooms" :key="room.id" class="card mb-3">
    <div class="card-body">
      <h2 class="h5 card-title">{{ room.displayName }}</h2>
      <p class="mb-2">Room link: <a :href="`${serverUrl}/room/${encodeURIComponent(room.id)}`" target="_blank" rel="noopener">{{ serverUrl }}/room/{{ room.id }}</a></p>
      <p v-if="room.sessionId" class="mb-2">Session open here: <a :href="`#/session/${encodeURIComponent(room.sessionId)}/monitor`">{{ room.sessionId }}</a></p>
      <details v-if="room.labels.length" class="mb-2">
        <summary>{{ room.labels.length }} participant labels</summary>
        <ul class="small mb-0">
          <li v-for="label in room.labels" :key="label">
            <a :href="`${serverUrl}/room/${encodeURIComponent(room.id)}/${encodeURIComponent(label)}`" target="_blank" rel="noopener">{{ label }}</a>
          </li>
        </ul>
      </details>
      <form class="row g-2" @submit.prevent="open(room.id)">
        <div class="col-auto">
          <select v-model="chosen[room.id]" class="form-select form-select-sm">
            <option value="">Open a session here…</option>
            <option v-for="s in state.sessions" :key="s.id" :value="s.id">{{ s.id }}</option>
          </select>
        </div>
        <div class="col-auto"><button class="btn btn-sm btn-outline-primary" :disabled="!chosen[room.id]">Open</button></div>
      </form>
    </div>
  </div>
</template>
