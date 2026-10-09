<script setup lang="ts">
import { computed, ref } from 'vue'
import ZDialog from '../components/ZDialog.vue'
import ZIcon from '../components/ZIcon.vue'
import { state } from '../server/connection'

// File → Open…: the treatments on the server, folder by folder, in the
// shape of the Windows file dialog z-Tree opens.

const emit = defineEmits<{ close: [value?: string] }>()

interface Entry { name: string, folder: boolean, appId?: string, title?: string, error?: boolean }

/** An app's path from the jtree folder, with forward slashes. */
function relative(path: string): string {
  const root = state.jtreeLocalPath.replace(/\\/g, '/')
  const p = path.replace(/\\/g, '/')
  return (root && p.startsWith(root) ? p.slice(root.length) : p).replace(/^\/+/, '')
}

const files = computed(() =>
  Object.values(state.apps).map((app) => ({ path: relative(app.appPath || app.id), app })),
)

const startFolder = (() => {
  const first = files.value[0]?.path ?? ''
  return first.includes('/') ? first.split('/')[0] : ''
})()

const folder = ref(startFolder)
const fileName = ref('')
const selected = ref<string | null>(null)

const entries = computed<Entry[]>(() => {
  const prefix = folder.value ? `${folder.value}/` : ''
  const folders = new Set<string>()
  const out: Entry[] = []
  for (const { path, app } of files.value) {
    if (!path.startsWith(prefix)) continue
    const rest = path.slice(prefix.length)
    const slash = rest.indexOf('/')
    if (slash !== -1) folders.add(rest.slice(0, slash))
    else out.push({ name: rest, folder: false, appId: app.id, title: app.title, error: app.hasError })
  }
  return [
    ...[...folders].sort((a, b) => a.localeCompare(b)).map((name) => ({ name, folder: true })),
    ...out.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })),
  ]
})

/** The folders above this one, for the "Look in" list. */
const trail = computed(() => {
  const parts = folder.value ? folder.value.split('/') : []
  return [{ label: '(jtree)', path: '' }, ...parts.map((part, i) => ({ label: part, path: parts.slice(0, i + 1).join('/') }))]
})

function choose(entry: Entry) {
  selected.value = entry.name
  if (!entry.folder) fileName.value = entry.name
}

function enter(entry: Entry) {
  if (entry.folder) {
    folder.value = folder.value ? `${folder.value}/${entry.name}` : entry.name
    selected.value = null
  } else if (entry.appId) {
    emit('close', entry.appId)
  }
}

function up() {
  const parts = folder.value.split('/')
  parts.pop()
  folder.value = parts.join('/')
}

function open() {
  const name = fileName.value.trim()
  if (!name) return
  const entry = entries.value.find((e) => e.name === name)
  if (entry) {
    enter(entry)
    return
  }
  const want = (folder.value ? `${folder.value}/${name}` : name).replace(/^\/+/, '')
  const match = files.value.find((f) => f.path === want || f.path === name)
  if (match) emit('close', match.app.id)
}
</script>

<template>
  <ZDialog title="Open" :width="560" buttons="bottom" ok-label="Open" :ok-disabled="!fileName.trim()" @ok="open" @cancel="emit('close')">
    <div class="zt-form" style="grid-template-columns: max-content 1fr max-content">
      <label for="open-look">Look in:</label>
      <select id="open-look" v-model="folder" class="zt-field">
        <option v-for="step in trail" :key="step.path" :value="step.path">{{ step.label }}</option>
      </select>
      <button type="button" class="zt-btn" style="min-width: 0" title="Up one level" :disabled="!folder" @click="up">↑</button>
    </div>
    <div class="zt-files" role="listbox" aria-label="Files">
      <div
        v-for="entry in entries"
        :key="entry.name"
        class="zt-files__row"
        role="option"
        :aria-selected="selected === entry.name"
        :data-selected="selected === entry.name"
        @mousedown="choose(entry)"
        @dblclick="enter(entry)"
      >
        <ZIcon :name="entry.folder ? 'folder' : entry.error ? 'error' : 'file'" />
        <span>{{ entry.name }}</span>
        <small v-if="entry.title">{{ entry.title }}</small>
      </div>
      <p v-if="!entries.length" class="zt-hint" style="padding: 8px">No treatments here.</p>
    </div>
    <div class="zt-form">
      <label for="open-name">File name:</label>
      <input id="open-name" v-model="fileName" class="zt-field" autocomplete="off">
      <label for="open-type">Files of type:</label>
      <select id="open-type" class="zt-field" disabled>
        <option>Treatments (*.jtt; *.js; *.ztt)</option>
      </select>
    </div>
  </ZDialog>
</template>
