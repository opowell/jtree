<script setup lang="ts">
import ZDialog from '../components/ZDialog.vue'
import ZIcon from '../components/ZIcon.vue'

const props = defineProps<{ text: string, title: string, buttons: string[], icon?: string }>()
const emit = defineEmits<{ close: [value?: string] }>()
</script>

<template>
  <ZDialog :title="props.title" :width="400" buttons="bottom" @ok="emit('close', props.buttons[props.buttons.length - 1])" @cancel="emit('close', undefined)">
    <div class="zt-msg">
      <ZIcon v-if="props.icon" :name="props.icon" />
      <p>{{ props.text }}</p>
    </div>
    <template #buttons>
      <button
        v-for="(label, index) in props.buttons"
        :key="label"
        type="button"
        class="zt-btn"
        :class="{ 'zt-btn--default': index === props.buttons.length - 1 }"
        style="min-width: 110px"
        @click="emit('close', label)"
      >{{ label }}</button>
    </template>
  </ZDialog>
</template>
