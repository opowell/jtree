<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { studio } from '../studio'
import type { ProjectInfo } from '../studio'
import StudioApp from './StudioApp.vue'
import StudioProject from './StudioProject.vue'

/*
 * The studio: oTree projects and apps made and changed here, as in oTree Studio, but in the app
 * folders of this jtree, where they also run. #/studio lists them; #/studio/project/<settings.py>
 * is a project; #/studio/app/<folder> is an app.
 */
const props = defineProps<{ kind: string, path: string }>()

const projects = ref<ProjectInfo[]>([])
const loose = ref<ProjectInfo['apps']>([])
const loaded = ref(false)
const problem = ref('')
const newProject = ref('')

async function load() {
  try {
    const listed = await studio.list()
    projects.value = listed.projects
    loose.value = listed.apps
    loaded.value = true
  } catch (err) {
    problem.value = (err as Error).message
  }
}
onMounted(() => { if (!props.kind) void load() })

async function createProject() {
  try {
    const made = await studio.createProject(newProject.value.trim())
    location.hash = `#/studio/project/${encodeURIComponent(made.settingsPath)}`
  } catch (err) {
    problem.value = (err as Error).message
  }
}
</script>

<template>
  <StudioApp v-if="kind === 'app' && path" :key="path" :dir="path" />
  <StudioProject v-else-if="kind === 'project' && path" :key="path" :settings-path="path" />
  <template v-else>
    <h1 class="h3 mb-2">Studio</h1>
    <p class="text-body-secondary mb-4">
      Make and change oTree projects and apps, as in oTree Studio: constants, models' fields, pages and their templates,
      session configs. They are written as oTree writes them, in the apps folder, where jtree runs them; they run in oTree too.
    </p>
    <div v-if="problem" class="alert alert-danger py-2">{{ problem }}</div>
    <p v-if="!loaded && !problem" class="text-body-secondary">Reading the apps folder…</p>

    <div v-for="p in projects" :key="p.dir" class="card mb-3">
      <div class="card-body">
        <div class="d-flex align-items-baseline gap-2 flex-wrap">
          <h2 class="h5 mb-0"><a :href="`#/studio/project/${encodeURIComponent(p.settingsPath)}`">{{ p.name }}</a></h2>
          <span class="small text-body-secondary text-break">{{ p.dir }}</span>
        </div>
        <div class="d-flex flex-wrap gap-2 mt-2">
          <a v-for="a in p.apps" :key="a.dir" class="btn btn-sm btn-outline-secondary font-monospace" :href="`#/studio/app/${encodeURIComponent(a.dir)}`">{{ a.name }}</a>
          <span v-if="!p.apps.length" class="small text-body-secondary">No apps yet.</span>
        </div>
      </div>
    </div>

    <div v-if="loose.length" class="card mb-3">
      <div class="card-body">
        <h2 class="h6">Apps outside a project</h2>
        <div class="d-flex flex-wrap gap-2">
          <a v-for="a in loose" :key="a.dir" class="btn btn-sm btn-outline-secondary font-monospace" :href="`#/studio/app/${encodeURIComponent(a.dir)}`">{{ a.name }}</a>
        </div>
      </div>
    </div>

    <form class="card card-body" style="max-width: 32em" @submit.prevent="createProject">
      <h2 class="h6">New project</h2>
      <p class="small text-body-secondary">A folder in the apps folder with a settings.py; add apps and session configs to it.</p>
      <div class="input-group">
        <input v-model="newProject" class="form-control" placeholder="my_project" aria-label="New project's name" pattern="[A-Za-z_][\w-]*">
        <button class="btn btn-primary" :disabled="!newProject.trim()">Create</button>
      </div>
    </form>
  </template>
</template>
