<template>
    <div>
        <action-bar
            :menus='actions'>
        </action-bar>
            <div style='padding-top: 10px; padding-bottom: 10px; background-color: rgb(37, 37, 37); flex: 1 1 auto; align-self: stretch'>
                Preset settings...
                </div>
    </div>
</template>
<script>

import ActionBar from '@/components/ActionBar.vue'
  export default {
      name: 'PresetSettingsPanel',
      components: {
            'action-bar': ActionBar,
      },
      props: ['dat'],
      data() {
          return {
              actions: [
                {
                    icon: 'far fa-file',
                    hasParent: false,
                    title: 'New...'
                }, 
                {
                    icon: 'fas fa-trash',
                    hasParent: false,
                    title: 'Delete...'
                },
              ],
          }
      },
      methods: {
      }
  }
</script>