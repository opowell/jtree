<script setup lang="ts">
import { computed } from 'vue'
import { convertApp, state } from '../server'

// Each oTree app runs as it is; converting it writes a jtree app beside it, to work on in jtree.
const conversion = (appPath: string) => state.conversions[appPath]
const todos = (appPath: string) => (conversion(appPath)?.report ?? []).filter((i) => i.status === 'todo')
const busy = computed(() => Object.values(state.conversions).some((c) => c === null))
</script>

<template>
  <h1 class="h3 mb-2">Apps</h1>
  <p class="text-body-secondary mb-4">
    The oTree apps in the apps folder. Each runs in jtree as it is. <strong>Convert</strong> writes a
    jtree app beside it (its Python translated to JavaScript, its templates to jtree screens), with a
    report of what needs work by hand.
  </p>
  <p v-if="!state.apps.length" class="text-body-secondary">No oTree apps: add an oTree project or app folder to the apps folder.</p>
  <div v-for="a in state.apps" :key="a.appPath" class="card mb-3">
    <div class="card-body">
      <div class="d-flex align-items-start gap-3">
        <div class="flex-grow-1">
          <h2 class="h5 mb-1">{{ a.name }}</h2>
          <div class="small text-body-secondary text-break">{{ a.appPath }}</div>
          <p v-if="a.description" class="mt-2 mb-0 small">{{ a.description }}</p>
        </div>
        <button class="btn btn-outline-primary" :disabled="busy" @click="convertApp(a.appPath)">
          <span v-if="state.conversions[a.appPath] === null" class="spinner-border spinner-border-sm me-1"></span>
          Convert to jtree
        </button>
      </div>
      <template v-if="conversion(a.appPath)">
        <div v-if="conversion(a.appPath)?.error" class="alert alert-danger mt-3 mb-0">
          {{ conversion(a.appPath)?.error }}
        </div>
        <div v-else class="alert mt-3 mb-0" :class="todos(a.appPath).length ? 'alert-warning' : 'alert-success'">
          <strong>{{ conversion(a.appPath)?.level }}.</strong>
          The jtree app is in <code class="text-break">{{ conversion(a.appPath)?.outPath }}</code>
          (its CONVERSION.md says what was converted).
          <ul v-if="todos(a.appPath).length" class="mb-0 mt-2">
            <li v-for="(t, i) in todos(a.appPath)" :key="i"><strong>{{ t.part }}</strong>: {{ t.note }}</li>
          </ul>
        </div>
      </template>
    </div>
  </div>
</template>
