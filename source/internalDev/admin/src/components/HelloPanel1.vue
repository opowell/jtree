<template>
    <jt-panel :x='x' :y='y' :w='w' :h='h' :title='"Hello1"' :menus='menus'>
        Hello1
    </jt-panel>
</template>
<script>
  import JtPanel from './JtPanel.vue';
  export default {
      name: 'HelloPanel1',
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
                    text: 'A'
                }, 
                {
                    text: 'B'
                },
                {
                    text: 'C'
                }
              ],
          }
      },
  }
</script>