<template>
  <div>
    <main-menu/>
    <view-home/>
    <view-apps/>
    <viewappeditor-modal/>
    <!-- <ViewHome/>
    <ViewApps/> -->
  </div>
</template>

<script>
import '@/webcomps/MainMenu.js'
import '@/webcomps/ViewHome.js'
import '@/webcomps/ViewApps.js'
import '@/webcomps/CreateAppModal.js'
import '@/webcomps/ViewAppEditModal.js'
// import ViewHome from '@/components/ViewHome'
// import ViewApps from '@/components/ViewApps'

export default {
  name: 'home',
  // components: {
  //   ViewHome,
  //   ViewApps,
  // }
}
</script>
