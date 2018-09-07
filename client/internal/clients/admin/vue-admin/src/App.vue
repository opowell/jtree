<template>
  <div id="app">
    <HelloWorld :msg="name"/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'app',
  data: function () {
   return {
    name: 'Lucas'
   };
  },
  components: {
    HelloWorld
  }
}
</script>