<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { MenuBar, SHELL_THEMES, useLayoutRoute, WindowFrame } from 'header-content-layout'
import type { MenuItemDef, WindowNode, WindowPanelDef } from 'header-content-layout'
import ShellPanel from './panels/ShellPanel.vue'
import SessionPanel from './panels/SessionPanel.vue'
import ClientsPanel from './panels/ClientsPanel.vue'
import AppPanel from './panels/AppPanel.vue'
import EditorPanel from './panels/EditorPanel.vue'
import SettingsPanel from './panels/SettingsPanel.vue'
import { serverUrl, state } from './server/connection'
import { downloadOutputUrl, server } from './server/commands'
import {
  addressBar,
  arrangeWindows,
  closePanel,
  defaultLayout,
  editApp,
  openIds,
  openSession,
  panels,
  resetLayout,
  savedLayout,
  showNewSession,
  showWindow,
  solo,
  togglePanel,
  TOOLS,
  topWindows,
  workspace,
} from './workspace'

const session = computed(() => state.session)

// The open panels and their arrangement are in the address bar (`?w=…`), so a reload, or a
// link, opens them as they were. An address without one opens what this browser had last.
const layoutRoute = useLayoutRoute(toRef(workspace, 'layout'), { adapter: addressBar, home: defaultLayout() })
if (!new URLSearchParams(location.search).has('w') && savedLayout) workspace.layout = savedLayout

function setLayout(next: WindowNode | null) {
  workspace.layout = next
}

const popOut = (panel: WindowPanelDef) => layoutRoute.popOutHref(panel.id)

// The window's outermost space draws no bar of its own; how it is shown (row, column, tabs,
// desktop) is chosen from Window → Arrange, which is the menu that bar would have had.
const frame = ref<InstanceType<typeof WindowFrame> | null>(null)
const arrange = computed<MenuItemDef[]>(() => (frame.value?.rootMenu.length ? frame.value.rootMenu : arrangeWindows()))

const menus = computed<MenuItemDef[]>(() => {
  const s = session.value
  const noSession = !s
  return [
    {
      label: 'File',
      items: [
        { id: 'new-session', label: 'New session', disabled: !state.connected, action: () => { void server.createSession(); showNewSession() } },
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
        { label: 'New app…', action: () => editApp('new') },
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
      label: 'Panels',
      items: Object.entries(TOOLS).map(([id, label]) => ({
        label,
        checked: openIds.value.includes(id),
        action: () => togglePanel(id),
      })),
    },
    {
      label: 'Window',
      items: [
        ...(topWindows.value.length
          ? topWindows.value.map((item) => ({
              label: item.label,
              checked: item.shown,
              action: () => showWindow(item.index),
            }))
          : [{ label: 'No windows open', disabled: true }]),
        { separator: true },
        { label: 'Arrange', disabled: !arrange.value.length, items: arrange.value },
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
      ref="frame"
      class="admin__frame"
      :panels="panels"
      :layout="workspace.layout"
      :theme="workspace.theme"
      movable
      closable
      :pop-out="solo ? undefined : popOut"
      :solo="solo"
      :root-bar="false"
      @update:layout="setLayout"
      @panel-close="closePanel"
      @panel-pop-out="closePanel($event.panel)"
    >
      <template #panel="{ panel }">
        <ShellPanel v-if="panel.id === 'browse'" id="browse" url />
        <SessionPanel v-else-if="panel.id === 'session'" />
        <ShellPanel v-else-if="panel.id === 'participants'" id="participants" entity="participants" view="table" />
        <ClientsPanel v-else-if="panel.id === 'clients'" />
        <ShellPanel v-else-if="panel.id === 'log'" id="log" entity="log" view="table" />
        <SettingsPanel v-else-if="panel.id === 'settings'" />
        <AppPanel v-else-if="panel.id.startsWith('app:')" :app-id="panel.id.slice(4)" :panel-id="panel.id" />
        <EditorPanel v-else-if="panel.id.startsWith('edit:')" :key="panel.id" :app-path="panel.id.slice(5)" :panel-id="panel.id" />
        <!-- Queues are apps now; layouts saved before that still name queue panels. -->
        <AppPanel v-else-if="panel.id.startsWith('queue:')" :app-id="panel.id.slice(6)" :panel-id="panel.id" />
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
