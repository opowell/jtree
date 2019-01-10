<template>
    <jt-panel :panelId='panelId' :x='x' :y='y' :w='w' :h='h' :title='"Games"' :menus='menus'>
        <jt-area :area='area'/>
    </jt-panel>
</template>
<script>
  import JtPanel from './JtPanel.vue';
  import JtArea from './JtArea.vue';


  export default {
      name: 'MultiPanel',
      components: {
          JtArea,
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
          area: {
            panels: [
                {
                    id: 'panel1',
                    type: 'panel-one',
                    data: {
                        x: 8,
                    },
                },
                {
                    id: 'panel2',
                    type: 'panel-two',
                    data: {
                        y: 183,
                    },
                },
                {
                    id: 'panel3',
                    type: 'panel-one',
                    data: {
                        x: 18,
                    },
                },
                {
                    id: 'sec1',
                    type: 'panel-one',
                    data: {
                        x: 8324324,
                    },
                },
                {
                    id: 'sec2',
                    type: 'panel-two',
                    data: {
                        y: 18434433,
                    },
                },
            ],
        },
        menus: [
                {
                    text: 'Start',
          hasParent: false,
                }, 
                {
                    text: 'New',
          hasParent: false,
                },
              ],
          }
      },
}
</script>