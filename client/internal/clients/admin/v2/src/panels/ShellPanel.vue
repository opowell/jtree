<script setup lang="ts">
import { computed } from 'vue'
import { createHistoryAdapter, createMemoryAdapter, DataShell } from 'header-content-layout'
import type { EntitySchema, RouteAdapter, ShellQueryDefaults, ViewKind } from 'header-content-layout'
import { schema } from '../schema'
import { source } from '../source'
import { activate, workspace } from '../workspace'
import { server } from '../server/commands'

const props = defineProps<{
  /** Panel id, which is also what this panel's query is remembered under. */
  id: string
  /** Opens on this entity's list rather than the home screen. */
  entity?: string
  view?: ViewKind
  /** Puts this panel's query in the address bar. Only one panel can. */
  url?: boolean
}>()

const route = adapterFor(props.id, props.url)

const defaults = computed<ShellQueryDefaults>(() =>
  props.entity
    ? { landing: 'entity', entity: props.entity, view: props.view ?? 'table', dir: 'asc' }
    : { view: props.view ?? 'cards' },
)

function create(entity: EntitySchema) {
  if (entity.key === 'sessions') void server.createSession()
}
</script>

<script lang="ts">
// Only the panel on top of a tab group is rendered, so a query kept inside the
// component would be lost on every tab switch. The adapters live here instead.
const adapters = new Map<string, RouteAdapter>()

function adapterFor(id: string, url: boolean | undefined): RouteAdapter {
  let adapter = adapters.get(id)
  if (!adapter) {
    adapter = url ? createHistoryAdapter() : createMemoryAdapter()
    adapters.set(id, adapter)
  }
  return adapter
}
</script>

<template>
  <DataShell
    :schema="schema"
    :source="source"
    :route="route"
    :defaults="defaults"
    :theme="workspace.theme"
    :limit="100"
    @activate="activate"
    @create="create"
  />
</template>
