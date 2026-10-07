<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { state } from './server'
import Sessions from './views/Sessions.vue'
import Session from './views/Session.vue'
import Rooms from './views/Rooms.vue'
import Apps from './views/Apps.vue'

// Views are in the address: #/sessions, #/session/<id>/<tab>, #/rooms, #/apps.
const hash = ref(location.hash)
const onHash = () => { hash.value = location.hash }
onMounted(() => window.addEventListener('hashchange', onHash))
onUnmounted(() => window.removeEventListener('hashchange', onHash))
const route = computed(() => {
  const parts = hash.value.replace(/^#\/?/, '').split('/').map(decodeURIComponent)
  return { view: parts[0] || 'sessions', id: parts[1] ?? '', tab: parts[2] ?? 'links' }
})
</script>

<template>
  <nav class="navbar navbar-expand bg-body-tertiary border-bottom mb-4">
    <div class="container">
      <span class="navbar-brand">jtree <small class="text-body-secondary">for oTree</small></span>
      <div class="navbar-nav">
        <a class="nav-link" :class="{ active: route.view.startsWith('session') }" href="#/sessions">Sessions</a>
        <a class="nav-link" :class="{ active: route.view === 'rooms' }" href="#/rooms">Rooms</a>
        <a class="nav-link" :class="{ active: route.view === 'apps' }" href="#/apps">Apps</a>
      </div>
      <span class="ms-auto small" :class="state.connected ? 'text-success' : 'text-danger'">
        {{ state.connected ? 'connected' : 'not connected' }}
      </span>
    </div>
  </nav>
  <main class="container mb-5">
    <Session v-if="route.view === 'session'" :id="route.id" :tab="route.tab" />
    <Rooms v-else-if="route.view === 'rooms'" />
    <Apps v-else-if="route.view === 'apps'" />
    <Sessions v-else />
  </main>
</template>
