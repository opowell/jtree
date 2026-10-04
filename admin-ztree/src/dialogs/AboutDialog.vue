<script setup lang="ts">
import ZDialog from '../components/ZDialog.vue'
import ZIcon from '../components/ZIcon.vue'

const emit = defineEmits<{ close: [value?: boolean] }>()
</script>

<template>
  <ZDialog title="About zTree" :width="430" :cancel-label="null" @ok="emit('close', true)" @cancel="emit('close')">
    <div class="zt-msg">
      <ZIcon name="tree" style="width: 40px; height: 40px" />
      <div style="display: flex; flex-direction: column; gap: 8px">
        <strong>zTree interface for jtree</strong>
        <p>An admin interface for the jtree server laid out after z-Tree, the Zurich Toolbox for Readymade Experiments, by Urs Fischbacher and Stefan Schmid.</p>
        <p>jtree apps are treatments, participants are clients, and their pages are z-Leaves.</p>
        <p><a href="https://www.ztree.uzh.ch/static/doc/manual.pdf" target="_blank" rel="noopener">z-Tree manual (PDF)</a></p>
      </div>
    </div>
  </ZDialog>
</template>
