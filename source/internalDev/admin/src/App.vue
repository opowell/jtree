<template>
  <div id="app">
    <MainMenu/>
    <!-- <router-view/> -->
    <div class='panel-container'>
      <hello-panel1 :x='100' :y='100' :w='500' :h='300'></hello-panel1>
      <hello-panel2 :x='200' :y='200' :w='500' :h='300'></hello-panel2>
    </div>
  </div>
</template>

<script>
import MainMenu from '@/components/MainMenu.vue'
import HelloPanel1 from '@/components/HelloPanel1.vue'
import HelloPanel2 from '@/components/HelloPanel2.vue'

export default {
  name: 'home',
  components: {
    MainMenu,
    HelloPanel1,
    HelloPanel2,
  },
}
</script>
<style>
/* #app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
} */
#nav {
  /* padding: 30px; */
}

/* #nav a {
  font-weight: bold;
  color: #2c3e50;
} */

/* #nav a.router-link-exact-active {
  color: #42b983;
} */

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
font-size: 9pt;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

</style>
