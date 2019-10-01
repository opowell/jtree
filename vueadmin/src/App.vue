<template>
  <div id="app" :style='appStyle' @click='click'>
    <MainMenu/>
    <!-- <TabBar/> -->
    <!-- <Home/> -->
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