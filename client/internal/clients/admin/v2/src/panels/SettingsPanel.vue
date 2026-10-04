<script setup lang="ts">
import { computed } from 'vue'
import { SHELL_THEMES } from 'header-content-layout'
import { participantBase, serverUrl, state } from '../server/connection'
import { server } from '../server/commands'
import { resetLayout, workspace } from '../workspace'

/** The server's settings that are worth reading: the simple values. */
const serverSettings = computed(() =>
  Object.entries(state.settings)
    .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
    .sort(([a], [b]) => a.localeCompare(b)),
)
</script>

<template>
  <div class="pane">
    <section class="pane__section" style="border-top: 0; padding-top: 0">
      <h3 class="dc-eyebrow">This interface</h3>
      <div class="toolbar">
        <label class="muted" for="theme">Theme</label>
        <select id="theme" v-model="workspace.theme" class="field">
          <option v-for="theme in SHELL_THEMES" :key="theme" :value="theme">{{ theme }}</option>
        </select>
        <button type="button" class="btn" @click="resetLayout">Reset layout</button>
      </div>
      <p class="hint">The layout, theme and open panels are saved in this browser.</p>
    </section>

    <section class="pane__section">
      <h3 class="dc-eyebrow">Server</h3>
      <dl class="kv">
        <dt>Status</dt><dd>{{ state.connected ? 'connected' : 'disconnected' }}</dd>
        <dt>Participant address</dt><dd class="dc-mono">{{ participantBase() }}</dd>
        <dt>jtree folder</dt><dd class="dc-mono">{{ state.jtreeLocalPath || '—' }}</dd>
      </dl>
      <div class="toolbar">
        <button type="button" class="btn" :disabled="!state.connected" @click="server.reloadApps()">Reload apps</button>
        <a class="btn" :href="serverUrl + '/admin/multiuser/'" target="_blank" rel="noopener">Previous admin interface</a>
      </div>
    </section>

    <section class="pane__section">
      <h3 class="dc-eyebrow">Server settings</h3>
      <p class="hint">Read-only. Change them in <span class="dc-mono">settings.json</span> in the jtree folder.</p>
      <dl class="kv">
        <template v-for="[key, value] in serverSettings" :key="key">
          <dt class="dc-mono">{{ key }}</dt><dd class="dc-mono">{{ String(value) }}</dd>
        </template>
      </dl>
    </section>
  </div>
</template>
