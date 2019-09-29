<template>
    <div class='tabBar bg-secondary'>
      <Tab v-for='(panel, index) in panels' :key='index' :panelInfo='panel' :index='index'/>
    </div>
</template>

<script>

// import jt from '@/webcomps/jtree.js'
// import 'jquery'
// let $ = window.jQuery

import Tab from '@/components/Tab.vue'

export default {
  name: 'TabBar',
  components: {
    Tab
  },
  data() {
    return {
        panels: this.$store.state.panels
    }
  },
}

</script>

<style scoped>
.tabBar {
  display: flex;
  color: rgba(255,255,255,.5);
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
}

</style>