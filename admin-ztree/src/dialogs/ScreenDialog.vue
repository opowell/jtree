<script setup lang="ts">
import { ref } from 'vue'
import ZDialog from '../components/ZDialog.vue'
import { setSource } from '../treatment/docs'
import type { TreatmentDoc } from '../treatment/docs'
import { replaceRange, setAppProp, setStageProp } from '../treatment/parse'
import type { TreeNode } from '../treatment/parse'

/*
 * A screen's dialog. z-Tree builds a screen from boxes and items placed in
 * the tree; a jtree screen is HTML, which is what is edited here. The tree
 * then shows it as boxes and items again.
 */
const props = defineProps<{ doc: TreatmentDoc, node: TreeNode, readOnly?: boolean }>()
const emit = defineEmits<{ close: [value?: boolean] }>()

const property = props.node.kind === 'active' ? 'activeScreen' : 'waitingScreen'
const expression = props.node.note && !props.node.body ? props.node.note : null
const html = ref(props.node.body ? trimTemplate(props.doc.source.slice(props.node.body.start, props.node.body.end)) : '')
const editable = !props.readOnly && !expression

function trimTemplate(text: string): string {
  return text.replace(/^\n/, '').replace(/\n[ \t]*$/, '')
}

function ok() {
  if (!editable) {
    emit('close', true)
    return
  }
  const doc = props.doc
  const text = html.value.replace(/`/g, '\\`')
  if (props.node.body) {
    setSource(doc, replaceRange(doc.source, props.node.body, `\n${text}\n`))
  } else if (html.value.trim()) {
    const literal = `\`\n${text}\n\``
    const stage = props.node.stageVar ? doc.treatment.stages.find((s) => s.varName === props.node.stageVar) : null
    if (stage) setSource(doc, setStageProp(doc.source, stage, property, literal))
    else setSource(doc, setAppProp(doc.source, doc.treatment, property, literal))
  }
  emit('close', true)
}
</script>

<template>
  <ZDialog title="Screen" :width="620" @ok="ok" @cancel="emit('close')">
    <div class="zt-form">
      <label>Name</label>
      <input class="zt-field" :value="node.label" readonly>
      <label for="screen-html" class="zt-form__top">HTML</label>
      <textarea v-if="!expression" id="screen-html" v-model="html" class="zt-field" rows="20" spellcheck="false" :readonly="!editable" :placeholder="node.kind === 'waiting' ? 'Empty: the background\'s waiting screen is shown.' : ''" />
      <p v-else class="zt-hint">This screen is built by code: <code>{{ expression }}</code>. Change it in the treatment's file.</p>
    </div>
    <p class="zt-hint">
      Fields are input items: <code>&lt;input name="player.x"&gt;</code>. Shown values are output items: <code v-pre>{{player.x}}</code>.
      A <code>&lt;form&gt;</code> with a button is a standard box.
    </p>
  </ZDialog>
</template>
