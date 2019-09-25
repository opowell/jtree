<template>
  <div>
    <main-menu/>
    <view-home/>
    <view-apps/>
  </div>
</template>

<script>
import '@/webcomponents/MainMenu.js'
import '@/webcomponents/ViewHome.js'
import '@/webcomponents/ViewApps.js'

export default {
  name: 'home',
}
</script>
