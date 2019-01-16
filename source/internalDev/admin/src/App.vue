<template>
  <div id="app" :style='appStyle' @click='click'>
    <MainMenu/>
    <!-- <router-view/> -->
    <div class='panel-container'>
      <multi-panel
        v-for='(window, index) in windows'
        :window='window'
        :key='index'
        :activePanelInd='window.activePanelInd'
        >
      </multi-panel>
    </div>
  </div>
</template>

<script>
import MainMenu from '@/components/MainMenu.vue'
import MultiPanel from '@/components/MultiPanel.vue'

export default {
  name: 'home',
  components: {
    MainMenu,
    MultiPanel,
  },
  beforeMount() {
    this.$store.commit('resetWindowIds');
  },
  data() {
    return {
      elements: this.$store.state.panelDescs,
      windows: this.$store.state.windowDescs,
    }
  },
  methods: {
    click() {
      this.$store.state.isMenuOpen = false;
    },
    setContainerDimensions() {
      let container = document.querySelector('.panel-container');
      this.$store.commit('setContainerDimensions', container);
    }
  },
  computed: {
    appStyle() {
      return {
          "font-size": this.$store.state.fontSize, 
      }
    },
  },
  mounted() {
    this.$nextTick(function() {
      window.addEventListener('resize', this.setContainerDimensions);
      this.setContainerDimensions();
    });
  }
}
</script>
<style>
.panel-container {
  background-color: #b3b3b3;
  flex: 1 1 auto;
  position: relative;
  display: flex;
}

body {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  padding-bottom: 0px;
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
}

#app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.no-text-select {
  cursor: default;
   -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
}

.sl-vue-tree {
    position: relative;
    cursor: default;
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none;
}

.sl-vue-tree-root > .sl-vue-tree-nodes-list {
    overflow: hidden;
    position: relative;
    padding-bottom: 4px;
}

.sl-vue-tree-selected > .sl-vue-tree-node-item {
    background-color: rgba(100, 100, 255, 0.5);
}

.sl-vue-tree-node-list {
    position: relative;
    display: flex;
    flex-direction: row;
}

.sl-vue-tree-node-item {
    position: relative;
    display: flex;
    flex-direction: row;
}
.sl-vue-tree-node-item.sl-vue-tree-cursor-inside {
    outline: 1px solid rgba(100, 100, 255, 0.5);
}

.sl-vue-tree-gap {
    width: 20px;
    min-height: 1px;

}

.sl-vue-tree-sidebar {
    margin-left: auto;
}

.sl-vue-tree-cursor {
    position: absolute;
    border: 1px solid rgba(100, 100, 255, 0.5);
    height: 1px;
    width: 100%;
}

.sl-vue-tree-drag-info {
    position: absolute;
    background-color: rgba(0,0,0,0.5);
    opacity: 0.5;
    margin-left: 20px;
    margin-bottom: 20px;
    padding: 5px 10px;
}

.sl-vue-tree-toggle {
  width: 50px;
}

.tree-anchor {
    color: inherit;
}






.vb > .vb-dragger {
    z-index: 5;
    width: 12px;
    right: 0;
}

.vb > .vb-dragger > .vb-dragger-styler {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transform: rotate3d(0,0,0,0);
    transform: rotate3d(0,0,0,0);
    -webkit-transition:
        background-color 100ms ease-out,
        margin 100ms ease-out,
        height 100ms ease-out;
    transition:
        background-color 100ms ease-out,
        margin 100ms ease-out,
        height 100ms ease-out;
    background-color: rgba(48, 121, 244,.1);
    margin: 5px 5px 5px 0;
    border-radius: 20px;
    height: calc(100% - 10px);
    display: block;
}

.vb.vb-scrolling-phantom > .vb-dragger > .vb-dragger-styler {
    background-color: rgba(48, 121, 244,.3);
}

.vb > .vb-dragger:hover > .vb-dragger-styler {
    background-color: rgba(48, 121, 244,.5);
    margin: 0px;
    height: 100%;
}

.vb.vb-dragging > .vb-dragger > .vb-dragger-styler {
    background-color: rgba(48, 121, 244,.5);
    margin: 0px;
    height: 100%;
}

.vb.vb-dragging-phantom > .vb-dragger > .vb-dragger-styler {
    background-color: rgba(48, 121, 244,.5);
}

</style>
