<script setup lang="ts">
import { computed, reactive } from 'vue'
import ZDialog from '../components/ZDialog.vue'
import { state } from '../server/connection'
import { server } from '../server/commands'
import { setSource } from '../treatment/docs'
import type { TreatmentDoc } from '../treatment/docs'
import { setAppProp } from '../treatment/parse'

/*
 * The Background's dialog, "General Parameters" (manual 7.2). The number of
 * subjects is the session's — jtree's participants are made by the session,
 * not the treatment — and periods and group size are written into the
 * treatment as `app.numPeriods` and `app.groupSize`. What jtree has no
 * counterpart for (exchange rate, show-up fee, bankruptcy rules) is shown,
 * as z-Tree shows it, but cannot be set.
 */
const props = defineProps<{ doc: TreatmentDoc, readOnly?: boolean }>()
const emit = defineEmits<{ close: [value?: boolean] }>()

const meta = computed(() => (props.doc.appId ? state.apps[props.doc.appId] : null))
const subjects = computed(() => (state.session ? Object.keys(state.session.participants).length : 0))

function numberProp(name: string, fallback: number | undefined): string {
  const text = props.doc.treatment.appProps[name]?.text
  if (text != null && /^\s*-?\d+(\.\d+)?\s*$/.test(text)) return text.trim()
  return fallback == null ? '' : String(fallback)
}

const form = reactive({
  subjects: String(subjects.value),
  periods: numberProp('numPeriods', typeof meta.value?.numPeriods === 'number' ? meta.value.numPeriods : 1),
  groupSize: numberProp('groupSize', meta.value?.groupSize ?? undefined),
  options: Object.fromEntries((meta.value?.options ?? []).map((o) => [o.name, String(props.doc.options[o.name] ?? o.defaultVal ?? '')])) as Record<string, string>,
})

const groups = computed(() => {
  const n = Number(form.subjects)
  const size = Number(form.groupSize)
  return n > 0 && size > 0 ? String(Math.ceil(n / size)) : form.groupSize ? '' : '1'
})

async function ok() {
  let source = props.doc.source
  if (!props.readOnly) {
    if (form.periods !== numberProp('numPeriods', undefined) && /^\d+$/.test(form.periods)) {
      source = setAppProp(source, props.doc.treatment, 'numPeriods', form.periods)
      setSource(props.doc, source)
    }
    if (form.groupSize !== numberProp('groupSize', undefined) && /^\d+$/.test(form.groupSize)) {
      source = setAppProp(props.doc.source, props.doc.treatment, 'groupSize', form.groupSize)
      setSource(props.doc, source)
    }
  }
  for (const option of meta.value?.options ?? []) {
    const raw = form.options[option.name]
    props.doc.options[option.name] = option.type === 'number' && raw !== '' && !Number.isNaN(Number(raw)) ? Number(raw) : raw
  }
  const n = Number(form.subjects)
  if (state.session && Number.isInteger(n) && n >= 0 && n !== subjects.value) await server.setNumParticipants(n)
  emit('close', true)
}
</script>

<template>
  <ZDialog title="General Parameters" :width="430" @ok="ok" @cancel="emit('close')">
    <div class="zt-form">
      <label for="bg-subjects">Number of subjects</label>
      <input id="bg-subjects" v-model="form.subjects" class="zt-field" type="number" min="0" step="1" style="width: 80px">
      <label for="bg-groups">Number of groups</label>
      <input id="bg-groups" :value="groups" class="zt-field" readonly style="width: 80px">
      <label for="bg-size">Group size</label>
      <input id="bg-size" v-model="form.groupSize" class="zt-field" type="number" min="1" step="1" style="width: 80px" :readonly="readOnly">
      <label for="bg-practice"># practice periods</label>
      <input id="bg-practice" value="0" class="zt-field" disabled style="width: 80px">
      <label for="bg-paying"># paying periods</label>
      <input id="bg-paying" v-model="form.periods" class="zt-field" type="number" min="1" step="1" style="width: 80px" :readonly="readOnly">
      <span class="zt-form__full" style="height: 4px" />
      <label>Exch. rate [Fr./ECU]</label>
      <input class="zt-field" disabled style="width: 80px">
      <label>Lump sum payment [ECU]</label>
      <input class="zt-field" disabled style="width: 80px">
      <label>Show up fee [Fr.]</label>
      <input class="zt-field" disabled style="width: 80px">
      <span />
      <button type="button" class="zt-btn" disabled style="justify-self: start">Bankruptcy rules…</button>
      <label>Start time of the period</label>
      <input class="zt-field" disabled style="width: 120px">
    </div>
    <p class="zt-hint">The number of subjects is the session's: it makes that many clients (P1, P2, …). jtree pays points, so the money fields are not used.</p>
    <fieldset v-if="meta?.options?.length" class="zt-group">
      <legend>Treatment options (used by Start Treatment)</legend>
      <div class="zt-form">
        <template v-for="option in meta.options" :key="option.name">
          <label :for="`bg-opt-${option.name}`" :title="option.description">{{ option.name }}</label>
          <select v-if="option.values?.length" :id="`bg-opt-${option.name}`" v-model="form.options[option.name]" class="zt-field">
            <option v-for="value in option.values" :key="String(value)" :value="String(value)">{{ value }}</option>
          </select>
          <input v-else :id="`bg-opt-${option.name}`" v-model="form.options[option.name]" class="zt-field">
        </template>
      </div>
    </fieldset>
    <fieldset class="zt-group">
      <legend>Compatibility</legend>
      <label class="zt-check"><input type="checkbox" disabled> first boxes on top</label>
    </fieldset>
    <fieldset class="zt-group">
      <legend>Options</legend>
      <label class="zt-check"><input type="checkbox" disabled> without Autoscope</label>
    </fieldset>
  </ZDialog>
</template>
