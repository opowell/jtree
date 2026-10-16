<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { codeEditor } from 'codemirror'

/*
 * A code field: CodeMirror (shared/codemirror-*, built by build-tools/codemirror) with v-model.
 * It grows with its text from minLines to maxLines, or fills its box with `fill`. Ctrl+Enter
 * emits commit, and leaving it emits blur, each with the text.
 */
const props = withDefaults(defineProps<{
  modelValue: string
  language?: 'javascript' | 'html' | 'css' | 'python' | 'text'
  label?: string
  minLines?: number
  maxLines?: number
  fill?: boolean
  readOnly?: boolean
  lineNumbers?: boolean
  indent?: string
  placeholder?: string
  id?: string
}>(), { language: 'javascript', minLines: 3, maxLines: 24, lineNumbers: true })
const emit = defineEmits<{ 'update:modelValue': [string], commit: [string], blur: [string] }>()

const host = ref<HTMLElement | null>(null)
let editor: ReturnType<typeof codeEditor> | null = null

onMounted(() => {
  editor = codeEditor(host.value!, {
    doc: props.modelValue,
    language: props.language,
    label: props.label,
    fill: props.fill,
    readOnly: props.readOnly,
    lineNumbers: props.lineNumbers,
    indent: props.indent,
    placeholder: props.placeholder,
    id: props.id,
    onChange: (text: string) => emit('update:modelValue', text),
    onCommit: (text: string) => emit('commit', text),
    onBlur: (text: string) => emit('blur', text),
  })
})
onUnmounted(() => editor?.destroy())
watch(() => props.modelValue, (text) => editor?.set(text))
watch(() => props.readOnly, (on) => editor?.setReadOnly(on))

defineExpose({ focus: () => editor?.focus() })
</script>

<template>
  <div ref="host" class="code-field" :class="{ 'code-field--fill': fill }" :style="{ '--cm-min-lines': minLines, '--cm-max-lines': maxLines }" />
</template>

<style scoped>
.code-field {
  --cm-bg: var(--dc-bg-0);
  --cm-fg: var(--dc-fg-0);
  --cm-muted: var(--dc-fg-3);
  --cm-line: var(--dc-line);
  --cm-gutter-bg: var(--dc-bg-1);
  --cm-focus: var(--dc-accent);
  --cm-radius: var(--dc-radius-sm);
  --cm-font: var(--dc-mono);
  --cm-font-size: var(--dc-text-code);
  min-width: 0;
}
.code-field--fill { flex: 1 1 0; min-height: 420px; position: relative; }
.code-field--fill :deep(.cm-editor) { position: absolute; inset: 0; }
</style>
