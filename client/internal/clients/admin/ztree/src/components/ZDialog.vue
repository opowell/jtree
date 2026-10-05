<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue'

/*
 * A dialog the way z-Tree draws them: a title bar with a close box, the
 * fields, and the buttons — down the right for a dialog that edits
 * something, along the bottom for a message. Enter presses the default
 * button, Escape cancels, and the title bar drags it.
 */
const props = withDefaults(defineProps<{
  title: string
  width?: number
  /** `right` for editing dialogs, `bottom` for messages. */
  buttons?: 'right' | 'bottom'
  okLabel?: string
  cancelLabel?: string | null
  okDisabled?: boolean
}>(), { width: 420, buttons: 'right', okLabel: 'OK', cancelLabel: 'Cancel' })

const emit = defineEmits<{ ok: [], cancel: [] }>()

const box = ref<HTMLElement | null>(null)
const pos = reactive({ x: 0, y: 0 })

onMounted(async () => {
  await nextTick()
  const el = box.value
  if (!el) return
  pos.x = Math.max(12, Math.round((window.innerWidth - el.offsetWidth) / 2))
  pos.y = Math.max(12, Math.round((window.innerHeight - el.offsetHeight) / 3))
  const first = el.querySelector<HTMLElement>('[autofocus], input:not([disabled]):not([readonly]), textarea:not([readonly]), select:not([disabled])')
  ;(first ?? el.querySelector<HTMLElement>('.zt-btn--default'))?.focus()
})

function drag(event: PointerEvent) {
  if ((event.target as HTMLElement).closest('button')) return
  const startX = event.clientX - pos.x
  const startY = event.clientY - pos.y
  const move = (e: PointerEvent) => {
    pos.x = Math.min(window.innerWidth - 60, Math.max(-200, e.clientX - startX))
    pos.y = Math.min(window.innerHeight - 30, Math.max(0, e.clientY - startY))
  }
  const up = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
}

function keydown(event: KeyboardEvent) {
  event.stopPropagation()
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('cancel')
  } else if (event.key === 'Enter' && !(event.target instanceof HTMLTextAreaElement) && !(event.target instanceof HTMLButtonElement)) {
    event.preventDefault()
    if (!props.okDisabled) emit('ok')
  }
}
</script>

<template>
  <div class="zt-modal" @keydown="keydown" @mousedown.self.prevent>
    <div
      ref="box"
      class="zt-dialog"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      :style="{ width: `${width}px`, left: `${pos.x}px`, top: `${pos.y}px` }"
    >
      <div class="zt-dialog__title" @pointerdown="drag">
        <span>{{ title }}</span>
        <button type="button" class="zt-dialog__close" aria-label="Close" @click="emit('cancel')">✕</button>
      </div>
      <div class="zt-dialog__main" :class="{ 'zt-dialog__main--stacked': buttons === 'bottom' }">
        <div class="zt-dialog__body"><slot /></div>
        <div class="zt-dialog__buttons" :class="{ 'zt-dialog__buttons--row': buttons === 'bottom' }">
          <slot name="buttons">
            <button type="button" class="zt-btn zt-btn--default" :disabled="okDisabled" @click="emit('ok')">{{ okLabel }}</button>
            <button v-if="cancelLabel" type="button" class="zt-btn" @click="emit('cancel')">{{ cancelLabel }}</button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
