<template>
  <div id="app" :style='appStyle' @click='click'>
    <MainMenu/>
    <div class='panel-container'>
      <jt-window
        v-for='window in windows'
        :window='window'
        :key='window.id'
        :activePanelInd='window.activePanelInd'
        :rowChildren='window.rowChildren'
        >
      </jt-window>
    </div>
    <viewappeditor-modal/>
  </div>
</template>

<script>

import JtWindow from '@/components/JtWindow.vue'
import MainMenu from '@/components/MainMenu.vue'

import '@/webcomps/ViewAppEditModal.js'
import '@/webcomps/ViewAppEditModal.js'
import '@/webcomps/AppSetVariableModal.js'
import '@/webcomps/CreateAppModal.js'
import '@/webcomps/RenameAppModal.js'
import '@/webcomps/ViewQueue.js'
import '@/webcomps/AddAppToQueueModal.js'
import '@/webcomps/ViewQueues.js'
import '@/webcomps/AddAppToSessionModal.js'
import '@/webcomps/AddQueueToSessionModal.js'
import '@/webcomps/SetViewSizeModal.js'
import '@/webcomps/SetAutoplayFreqModal.js'
import '@/webcomps/EditAppOptionsModal.js'
import '@/webcomps/ViewSessions.js'
import '@/webcomps/ViewLogin.js'
import '@/webcomps/Model.js'
import '@/webcomps/circularjson.js'

export default {
  name: 'App',
  components: {
    JtWindow,
    MainMenu,
  },
  data() {
    return {
      elements: this.$store.state.panelDescs,
      windows: this.$store.state.windowDescs,
    }
  },
  beforeMount() {
    this.$store.commit('resetWindowIds');
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
      let s = this.$store.state;
      let out = {};
      for (let i=0; i<s.persistentSettings.length; i++) {
        let setting = s.persistentSettings[i];
        if (setting.isStyle !== false) {
          out['--' + setting.key] = s[setting.key];
        }
      }
      return out;
    },
  },
  mounted() {
    this.$nextTick(function() {
      window.addEventListener('resize', this.setContainerDimensions);
      this.setContainerDimensions();
      // this.$bvModal.show('welcomeModal');
    });
  }
}
</script>


<style>
/* FROM 0.8.0 */
.panel-container {
  background-color: var(--containerBGColor);
  flex: 1 1 auto;
  position: relative;
  display: flex;
  border: var(--container-border);
  overflow-y: auto;
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
  font-size: var(--fontSize);
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
