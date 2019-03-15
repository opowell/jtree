<template>
    <jt-panel :panelId='panelId' :x='x' :y='y' :w='w' :h='h' :title='"Settings"' :menus='menus'>
        Settings
    </jt-panel>
</template>
<script>
  import JtPanel from './JtPanel.vue';
  export default {
      name: 'SettingsPanel',
      components: {
          JtPanel,
      },
      props: {
          x: {
              type: Number,
              default: 100,
          },
          y: {
              type: Number,
              default: 100,
          },
          w: {
              type: Number,
              default: 200,
          },
          h: {
              type: Number,
              default: 100,
          },
          panelId: {
              type: Number,
          },
      },
      data() {
          return {
              menus: [
                {
                    text: 'Load'
                }, 
                {
                    text: 'Save'
                },
              ],
          }
      },
  }
</script>