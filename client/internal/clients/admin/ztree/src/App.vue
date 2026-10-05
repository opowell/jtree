<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { MenuBar, WindowFrame } from 'header-content-layout'
import type { WindowNode } from 'header-content-layout'
import ZIcon from './components/ZIcon.vue'
import TreatmentWindow from './windows/TreatmentWindow.vue'
import MonitorWindow from './windows/MonitorWindow.vue'
import TableWindow from './windows/TableWindow.vue'
import LeafWindow from './windows/LeafWindow.vue'
import { state } from './server/connection'
import { connectedCount, windowCommands } from './clients'
import { closeDialog, dialogStack } from './dialogs'
import { menus } from './menus'
import * as act from './actions'
import { docs, newDoc, openDoc } from './treatment/docs'
import { closeWindow, frontTreatment, frontWindow, openWindow, panels, setLayout, windowIds, windowTitle, workspace } from './windows'

/*
 * The main window: caption, menu bar, toolbar, the desktop the child windows
 * sit on, and the status bar. The function keys are z-Tree's: F5 starts the
 * treatment in front, F12 stops the clock and Shift+F12 restarts it.
 */

// z-Tree has one look, the light one: appfr's Windows theme, pinned to it
// rather than following the system's dark mode.
const LIGHT = { '--dc-surface': '#ffffff', '--dc-ink': '#000000', '--dc-accent': '#0078d7' }

const title = computed(() => (frontWindow.value ? `zTree - ${windowTitle(frontWindow.value)}` : 'zTree'))
watch(title, (text) => (document.title = text), { immediate: true })

function closeRequested(id: string) {
  void act.closeWindowAsking(id)
}

function onLayout(next: WindowNode | null) {
  setLayout(next)
}

/* ---------------------------------------------------- the desktop's size */

const desktop = ref<HTMLElement | null>(null)
let observer: ResizeObserver | null = null
onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    workspace.width = Math.round(entry.contentRect.width)
    workspace.height = Math.round(entry.contentRect.height)
  })
  if (desktop.value) observer.observe(desktop.value)
})
onBeforeUnmount(() => observer?.disconnect())

/* ------------------------------------------------- windows across reloads */

// The arrangement is kept per browser; the treatments in it are opened again
// from the server once it has said what is on it. z-Tree opens on an empty
// treatment, so one is made when none is open.
let restored = false
watch(() => state.loaded, (loaded) => {
  if (!loaded || restored) return
  restored = true
  for (const id of windowIds.value) {
    if (!id.startsWith('treatment:')) continue
    const key = id.slice('treatment:'.length)
    if (key.startsWith('untitled:') || !openDoc(key)) closeWindow(id)
  }
  if (!windowIds.value.length) openWindow('monitor')
  if (!windowIds.value.some((id) => id.startsWith('treatment:'))) {
    const doc = newDoc()
    openWindow(`treatment:${doc.key}`)
  }
}, { immediate: true })

/* --------------------------------------------------------------- keyboard */

function editing(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement
}

function keydown(event: KeyboardEvent) {
  if (dialogStack.length) return
  const mod = event.ctrlKey || event.metaKey
  if (event.key === 'F5') {
    event.preventDefault()
    if (frontTreatment.value) void act.startTreatment()
  } else if (event.key === 'F12') {
    event.preventDefault()
    if (event.shiftKey) void act.restartClock()
    else void act.stopClock()
  } else if (mod && event.key.toLowerCase() === 'o') {
    event.preventDefault()
    void act.openTreatmentDialog()
  } else if (mod && event.key.toLowerCase() === 's') {
    event.preventDefault()
    act.saveFront(event.shiftKey)
  } else if (mod && !editing(event.target) && !event.defaultPrevented) {
    const commands = frontWindow.value ? windowCommands[frontWindow.value] : undefined
    const key = event.key.toLowerCase()
    if (key === 'c' && commands?.copy) { event.preventDefault(); commands.copy() }
    else if (key === 'x' && commands?.cut && commands.canCut?.()) { event.preventDefault(); commands.cut() }
    else if (key === 'v' && commands?.paste && commands.canPaste?.()) { event.preventDefault(); commands.paste() }
  }
}
onMounted(() => window.addEventListener('keydown', keydown))
onBeforeUnmount(() => window.removeEventListener('keydown', keydown))

// Leaving with unsaved treatments asks first, as quitting z-Tree does.
function beforeUnload(event: BeforeUnloadEvent) {
  if (Object.values(docs).some((d) => d.appId && d.source !== d.saved)) event.preventDefault()
}
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))

/* -------------------------------------------------------------- the bars */

const clockText = computed(() => {
  const s = state.session
  if (!s) return ''
  return s.isRunning ? 'Clock running' : 'Clock stopped'
})

function tableParts(id: string): { name: string, treatment: number } {
  const [, name, treatment] = id.split(':')
  return { name, treatment: Number(treatment) }
}
</script>

<template>
  <div class="zt">
    <div class="zt-caption">
      <ZIcon name="tree" class="zt-caption__icon" />
      <span class="zt-caption__text">{{ title }}</span>
    </div>

    <div class="zt-menubar">
      <MenuBar :menus="menus" theme="windows" :tokens="LIGHT" label="zTree" />
    </div>

    <div v-if="workspace.toolbar" class="zt-toolbar" role="toolbar" aria-label="Toolbar">
      <button type="button" title="New Treatment" @click="act.newTreatment()"><ZIcon name="new" /></button>
      <button type="button" title="Open (Ctrl+O)" :disabled="!state.loaded" @click="act.openTreatmentDialog()"><ZIcon name="open" /></button>
      <button type="button" title="Save (Ctrl+S)" :disabled="!frontTreatment" @click="act.saveFront()"><ZIcon name="save" /></button>
      <span class="zt-toolbar__sep" />
      <button type="button" title="Cut (Ctrl+X)" :disabled="!frontWindow || !windowCommands[frontWindow]?.canCut?.()" @click="act.editCut()"><ZIcon name="cut" /></button>
      <button type="button" title="Copy (Ctrl+C)" :disabled="!frontWindow || !windowCommands[frontWindow]?.copy" @click="act.editCopy()"><ZIcon name="copy" /></button>
      <button type="button" title="Paste (Ctrl+V)" :disabled="!frontWindow || !windowCommands[frontWindow]?.canPaste?.()" @click="act.editPaste()"><ZIcon name="paste" /></button>
      <span class="zt-toolbar__sep" />
      <button type="button" title="Print" disabled><ZIcon name="print" /></button>
      <span class="zt-toolbar__sep" />
      <button type="button" title="Start Treatment (F5)" :disabled="!frontTreatment || !state.session" @click="act.startTreatment()"><ZIcon name="start" /></button>
      <button type="button" title="Connection Monitor" @click="act.connectionMonitor()"><ZIcon name="monitor" /></button>
      <span class="zt-toolbar__sep" />
      <button type="button" title="About zTree" @click="act.about()"><ZIcon name="help" /></button>
    </div>

    <div ref="desktop" class="zt-desktop">
      <WindowFrame
        :panels="panels"
        :layout="workspace.layout"
        theme="windows"
        :tokens="LIGHT"
        :menu="false"
        :min-panel-size="140"
        movable
        resizable
        closable
        @update:layout="onLayout"
        @panel-close="closeRequested"
      >
        <template #panel="{ panel }">
          <MonitorWindow v-if="panel.id === 'monitor'" :window-id="panel.id" />
          <TreatmentWindow v-else-if="panel.id.startsWith('treatment:')" :window-id="panel.id" :doc-key="panel.id.slice(10)" />
          <TableWindow v-else-if="panel.id.startsWith('table:')" :window-id="panel.id" v-bind="tableParts(panel.id)" />
          <LeafWindow v-else-if="panel.id.startsWith('leaf:')" :p-id="panel.id.slice(5)" />
        </template>
      </WindowFrame>
      <div v-if="!windowIds.length" class="zt-empty-desktop">
        <p>Run → Connection Monitor to see the clients;<br>File → Open… to open a treatment.</p>
      </div>
    </div>

    <div v-if="workspace.statusBar" class="zt-status" role="status">
      <span class="zt-status__pane zt-status__pane--main">{{ state.connected ? act.status.text : 'Not connected to the jtree server — trying again…' }}</span>
      <span v-if="state.session" class="zt-status__pane" :title="`Session ${state.session.id}`">Session {{ state.session.id }}</span>
      <span v-if="state.session" class="zt-status__pane" :class="{ 'zt-status__pane--off': !state.session.isRunning }">{{ clockText }}</span>
      <span class="zt-status__pane">{{ connectedCount }} client{{ connectedCount === 1 ? '' : 's' }}</span>
      <span class="zt-status__pane" :class="{ 'zt-status__pane--off': !state.connected }">{{ state.connected ? 'Connected' : 'Offline' }}</span>
    </div>

    <component
      :is="entry.component"
      v-for="entry in dialogStack"
      :key="entry.id"
      v-bind="entry.props"
      @close="(value: unknown) => closeDialog(entry, value)"
    />
  </div>
</template>
