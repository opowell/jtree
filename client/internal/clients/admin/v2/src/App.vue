<script setup lang="ts">
import { computed } from 'vue'
import { MenuBar, SHELL_THEMES, WindowFrame } from 'header-content-layout'
import type { MenuItemDef, WindowNode } from 'header-content-layout'
import ShellPanel from './panels/ShellPanel.vue'
import SessionPanel from './panels/SessionPanel.vue'
import ClientsPanel from './panels/ClientsPanel.vue'
import AppPanel from './panels/AppPanel.vue'
import QueuePanel from './panels/QueuePanel.vue'
import SettingsPanel from './panels/SettingsPanel.vue'
import { serverUrl, state } from './server/connection'
import { downloadOutputUrl, server } from './server/commands'
import { closePanel, openSession, panels, resetLayout, showPanel, togglePanel, TOOLS, workspace } from './workspace'

const session = computed(() => state.session)

function setLayout(next: WindowNode | null) {
  workspace.layout = next
}

const menus = computed<MenuItemDef[]>(() => {
  const s = session.value
  const noSession = !s
  return [
    {
      label: 'File',
      items: [
        { id: 'new-session', label: 'New session', disabled: !state.connected, action: () => { void server.createSession(); showPanel('session') } },
        {
          label: 'Open session',
          items: state.sessions.length
            ? [...state.sessions].reverse().map((item) => ({
                label: item.id,
                checked: item.id === s?.id,
                action: () => openSession(item.id),
              }))
            : [{ label: 'No sessions yet', disabled: true }],
        },
        { separator: true },
        { label: 'Reload apps', disabled: !state.connected, action: () => void server.reloadApps() },
        { label: 'Previous admin interface', action: () => window.open(serverUrl + '/admin/multiuser/', '_blank') },
      ],
    },
    {
      label: 'Session',
      items: [
        { label: 'Start', disabled: noSession || s.started, action: () => void server.start() },
        s?.isRunning === false
          ? { label: 'Resume', disabled: noSession, action: () => void server.resume() }
          : { label: 'Pause', disabled: noSession, action: () => void server.pause() },
        { label: 'Advance slowest', disabled: noSession || !s.started, action: () => void server.advanceSlowest() },
        { separator: true },
        { label: 'Autoplay on for all', disabled: noSession, action: () => void server.setAutoplayForAll(true) },
        { label: 'Autoplay off for all', disabled: noSession, action: () => void server.setAutoplayForAll(false) },
        { label: 'Reload all clients', action: () => void server.reloadClients() },
        { separator: true },
        { label: 'Download output', disabled: noSession, action: () => s && window.open(downloadOutputUrl(s.id), '_blank') },
      ],
    },
    {
      label: 'Window',
      items: [
        ...Object.entries(TOOLS).map(([id, label]) => ({
          label,
          checked: workspace.ids.includes(id),
          action: () => togglePanel(id),
        })),
        { separator: true },
        {
          label: 'Theme',
          items: SHELL_THEMES.map((theme) => ({
            label: theme,
            checked: workspace.theme === theme,
            action: () => (workspace.theme = theme),
          })),
        },
        { label: 'Reset layout', action: resetLayout },
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'Documentation', action: () => window.open('https://opowell.github.io/jtree', '_blank') },
      ],
    },
  ]
})
</script>

<template>
  <div class="dc-shell admin" :data-dc-theme="workspace.theme">
    <header class="admin__bar">
      <MenuBar :menus="menus" :theme="workspace.theme" label="jtree" />
      <span class="admin__status" :data-connected="state.connected" role="status">
        {{ state.connected ? (session ? `Session ${session.id}` : 'Connected') : 'Disconnected — retrying…' }}
      </span>
    </header>

    <WindowFrame
      class="admin__frame"
      :panels="panels"
      :layout="workspace.layout"
      :theme="workspace.theme"
      movable
      closable
      @update:layout="setLayout"
      @panel-close="closePanel"
    >
      <template #panel="{ panel }">
        <ShellPanel v-if="panel.id === 'browse'" id="browse" url />
        <SessionPanel v-else-if="panel.id === 'session'" />
        <ShellPanel v-else-if="panel.id === 'participants'" id="participants" entity="participants" view="table" />
        <ClientsPanel v-else-if="panel.id === 'clients'" />
        <ShellPanel v-else-if="panel.id === 'log'" id="log" entity="log" view="table" />
        <SettingsPanel v-else-if="panel.id === 'settings'" />
        <AppPanel v-else-if="panel.id.startsWith('app:')" :app-id="panel.id.slice(4)" />
        <QueuePanel v-else-if="panel.id.startsWith('queue:')" :queue-id="panel.id.slice(6)" :panel-id="panel.id" />
      </template>
    </WindowFrame>
  </div>
</template>

<style scoped>
.admin {
  height: 100vh;
}
.admin__bar {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--dc-line);
  flex: 0 0 auto;
}
.admin__bar > :first-child {
  flex: 1 1 auto;
  min-width: 0;
}
.admin__status {
  flex: 0 1 auto;
  padding: 0 12px;
  font-size: var(--dc-text-meta);
  color: var(--dc-fg-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.admin__status::before {
  content: '●';
  margin-right: 6px;
  color: var(--dc-danger);
}
.admin__status[data-connected='true']::before {
  color: var(--dc-ok);
}
.admin__frame {
  flex: 1 1 auto;
  min-height: 0;
}
</style>
