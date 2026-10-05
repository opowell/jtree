<script setup lang="ts">
import { reactive } from 'vue'
import ZDialog from '../components/ZDialog.vue'
import { messageBox } from '../dialogs'
import { setSource } from '../treatment/docs'
import type { TreatmentDoc } from '../treatment/docs'
import { replaceRange, setStageProp } from '../treatment/parse'
import type { StageInfo } from '../treatment/parse'

/*
 * The Stage dialog (manual 8.3.2). "Wait for all" is jtree's
 * `stage.waitToStart`, and the timeout its `stage.duration`, after which
 * jtree ends the stage whether or not input was made — z-Tree's "Yes".
 */
const props = defineProps<{ doc: TreatmentDoc, stage: StageInfo, readOnly?: boolean, isNew?: boolean }>()
const emit = defineEmits<{ close: [value?: boolean] }>()

const waitText = props.stage.props.waitToStart?.text.trim()
const form = reactive({
  name: props.stage.id,
  start: waitText === 'false' ? 'possible' : 'wait',
  timeout: props.stage.props.duration?.text.trim() ?? '0',
})

/** Stage settings this dialog has no field for, listed so they are not invisible. */
const others = Object.entries(props.stage.props)
  .filter(([key, prop]) => !['waitToStart', 'duration', 'activeScreen', 'waitingScreen'].includes(key) && !/^\s*(async\s+)?(function|\(|[\w$]+\s*=>)/.test(prop.text))
  .map(([key, prop]) => `${key} = ${prop.text.length > 60 ? `${prop.text.slice(0, 57)}…` : prop.text}`)

async function ok() {
  if (props.readOnly) {
    emit('close', true)
    return
  }
  const name = form.name.trim()
  if (!name) {
    await messageBox('A stage needs a name.', { icon: 'warning' })
    return
  }
  const timeout = form.timeout.trim() === '' ? '0' : form.timeout.trim()
  if (!/^\d+(\.\d+)?$/.test(timeout) && !/^[\w$.()+\-*/ ]+$/.test(timeout)) {
    await messageBox('The timeout must be a number of seconds.', { icon: 'warning' })
    return
  }
  const doc = props.doc
  const varName = props.stage.varName
  const fresh = () => doc.treatment.stages.find((s) => s.varName === varName) ?? props.stage

  if (name !== props.stage.id) setSource(doc, replaceRange(doc.source, fresh().nameRange, JSON.stringify(name)))
  const waitToStart = form.start === 'wait'
  const currentWait = fresh().props.waitToStart?.text.trim() !== 'false'
  if (waitToStart !== currentWait) setSource(doc, setStageProp(doc.source, fresh(), 'waitToStart', String(waitToStart)))
  const currentTimeout = fresh().props.duration?.text.trim() ?? '0'
  if (timeout !== currentTimeout && !(timeout === '0' && !fresh().props.duration)) {
    setSource(doc, setStageProp(doc.source, fresh(), 'duration', timeout))
  }
  emit('close', true)
}
</script>

<template>
  <ZDialog title="Stage" :width="440" @ok="ok" @cancel="emit('close')">
    <div class="zt-form">
      <label for="stage-name">Name</label>
      <input id="stage-name" v-model="form.name" class="zt-field" :readonly="readOnly">
    </div>
    <fieldset class="zt-group">
      <legend>Start</legend>
      <label class="zt-check"><input v-model="form.start" type="radio" value="wait" :disabled="readOnly"> Wait for all</label>
      <label class="zt-check"><input v-model="form.start" type="radio" value="possible" :disabled="readOnly"> Start if possible</label>
      <label class="zt-check"><input type="radio" disabled> Start if…</label>
    </fieldset>
    <fieldset class="zt-group">
      <legend>Number of subjects in Stage</legend>
      <label class="zt-check"><input type="checkbox" disabled> At most one per group in stage</label>
      <label class="zt-check" style="margin-left: 20px"><input type="checkbox" disabled> … and in previous stage(s)</label>
    </fieldset>
    <fieldset class="zt-group">
      <legend>Leave stage after timeout</legend>
      <div style="display: flex; gap: 22px">
        <label class="zt-check"><input type="radio" disabled> If no input</label>
        <label class="zt-check"><input type="radio" checked disabled> Yes</label>
        <label class="zt-check"><input type="radio" disabled> No</label>
      </div>
      <div class="zt-form">
        <label for="stage-timeout" class="zt-form__top">Timeout</label>
        <input id="stage-timeout" v-model="form.timeout" class="zt-field" :readonly="readOnly">
      </div>
      <p class="zt-hint">Seconds; 0 for no timeout.</p>
    </fieldset>
    <fieldset v-if="others.length" class="zt-group">
      <legend>Other stage settings (in the treatment's code)</legend>
      <code v-for="line in others" :key="line" style="font-family: var(--zt-mono); font-size: 11px">{{ line }}</code>
    </fieldset>
  </ZDialog>
</template>
