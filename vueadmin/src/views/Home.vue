<template>
  <div>
    <main-menu/>
    <div id='view-home' class='view'>
        Welcome to jtree.
        <div style='padding-top: 1rem; color: #888'>0.7.18</div>
    </div>
  </div>
</template>

<script>
import '@/webcomponents/MainMenu.js'
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'home',
  components: {
    HelloWorld
  }
}
</script>
