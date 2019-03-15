<template>
    <jt-panel :x='x' :y='y' :w='w' :h='h' :title='"Games"' :menus='menus'>
        Games list
    </jt-panel>
</template>
<script>
  import JtPanel from './JtPanel.vue';
  export default {
      name: 'GamesPanel',
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
      },
      data() {
          return {
              menus: [
                {
                    text: 'Start'
                }, 
                {
                    text: 'New'
                },
              ],
          }
      },
  }
</script>