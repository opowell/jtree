<template>
  <div>
    <main-menu/>
    <view-home/>
    <ViewApps/>

    <view-app/>
        <viewappeditor-modal/>
        <appsetvariable-modal/>
        <createapp-modal/>
        <renameapp-modal/>
        <editappoptions-modal/>
    <view-queue/>
        <addapptoqueue-modal/>
    <view-queues/>
    <view-session/>
        <addapptosession-modal/>
        <addqueuetosession-modal/>
        <setviewsize-modal/>
        <setautoplayfreq-modal/>
    <view-sessions/>
    <view-login/>


  </div>
</template>

<script>
import '@/webcomps/MainMenu.js'
import '@/webcomps/ViewHome.js'
import ViewApps from '@/components/ViewApps.vue'
import '@/webcomps/ViewApp.js'
import '@/webcomps/ViewAppEditModal.js'
import '@/webcomps/AppSetVariableModal.js'
import '@/webcomps/CreateAppModal.js'
import '@/webcomps/RenameAppModal.js'
import '@/webcomps/ViewQueue.js'
import '@/webcomps/AddAppToQueueModal.js'
import '@/webcomps/ViewQueues.js'
import '@/webcomps/ViewSession.js'
import '@/webcomps/AddAppToSessionModal.js'
import '@/webcomps/AddQueueToSessionModal.js'
import '@/webcomps/SetViewSizeModal.js'
import '@/webcomps/SetAutoplayFreqModal.js'
import '@/webcomps/EditAppOptionsModal.js'
import '@/webcomps/ViewSessions.js'
import '@/webcomps/ViewLogin.js'

import '@/webcomps/ViewSessionActivity.js'
import '@/webcomps/ViewSessionApps.js'
import '@/webcomps/ViewSessionControls.js'
import '@/webcomps/ViewSessionParticipants.js'
import '@/webcomps/ViewSessionResults.js'
import '@/webcomps/ViewSessionSettings.js'
import '@/webcomps/ViewSessionTabs.js'

import '@/webcomps/Model.js'
import '@/webcomps/circularjson.js'





import '@/webcomps/ViewAppPreview.js'


export default {
  name: 'home',
  components: {
    ViewApps,
  }
}
</script>
