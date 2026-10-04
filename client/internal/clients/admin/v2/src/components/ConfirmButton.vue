<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

// A destructive action asks twice: the first press arms it, the second within
// a few seconds carries it out. No dialog, so nothing blocks the page.
const props = defineProps<{ label: string, confirm?: string, disabled?: boolean }>()
const emit = defineEmits<{ confirm: [] }>()

const armed = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

function press() {
  if (armed.value) {
    disarm()
    emit('confirm')
    return
  }
  armed.value = true
  timer = setTimeout(disarm, 4000)
}

function disarm() {
  armed.value = false
  if (timer) clearTimeout(timer)
  timer = null
}

onBeforeUnmount(disarm)
</script>

<template>
  <button
    type="button"
    class="btn btn--danger"
    :class="{ 'btn--armed': armed }"
    :disabled="props.disabled"
    @click="press"
    @blur="disarm"
  >
    {{ armed ? (props.confirm ?? `Confirm ${props.label.toLowerCase()}`) : props.label }}
  </button>
</template>
