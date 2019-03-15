<template>
    <jt-panel :x='x' :y='y' :w='w' :h='h' :title='"Hello2"' :menus='menus'>
        Hello2
    </jt-panel>
</template>
<script>
  import JtPanel from './JtPanel.vue';
  export default {
      name: 'HelloPanel2',
      components: {
          JtPanel,
      },
      props: [
          'x',
          'y',
          'w',
          'h',
      ],
      data() {
          return {
              menus: [
                {
                    text: 'D'
                }, 
                {
                    text: 'E'
                },
              ],
          }
      },
  }
</script>