<template>
  <div id="app" :style='appStyle' @click='click'>
    <MainMenu/>
    <!-- <router-view/> -->
    <div class='panel-container'>
      <component
        v-for='el in elements'
        :is='el.type'
        :key='el.panelId'
        :panelId='el.id'
        :x='el.x' :y='el.y' :w='el.w' :h='el.h'
        >
      </component>
    </div>
  </div>
</template>

<script>
import MainMenu from '@/components/MainMenu.vue'
import GamesPanel from '@/components/GamesPanel.vue'
import SessionsPanel from '@/components/SessionsPanel.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'

export default {
  name: 'home',
  components: {
    MainMenu,
    GamesPanel,
    SessionsPanel,
    SettingsPanel,
  },
  beforeMount() {
    this.$store.commit('resetPanelIds');
  },
  data() {
    return {
      elements: this.$store.state.panelDescs,
    }
  },
  methods: {
    click() {
      this.$store.state.isMenuOpen = false;
    },
  },
  computed: {
    appStyle() {
      return {
          "font-size": this.$store.state.fontSize, 
      }
    },
  },
  mounted() {
    let container = document.querySelector('.panel-container');
    this.$store.commit('setContainerDimensions', container);
    this.$store.commit('setNextPanelId', this.elements.length);
    // this.parentElement = this.$el.parentNode.parentNode; // the panel container.
    // this.parentWidth = this.parentElement.clientWidth - 5;
    // this.parentHeight = this.parentElement.clientHeight - 5;
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

</style>
