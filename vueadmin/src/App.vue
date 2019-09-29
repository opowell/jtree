<template>
  <div id="app" @click='click'>
    <Home/>
  </div>
</template>

<script>

import Home from '@/views/Home.vue'

export default {
  name: 'App',
  components: {
    Home,
  },
  methods: {
    click() {
      this.$store.state.isMenuOpen = false;
    },
  }
}
</script>