<template>
  <div>
    <div onclick='jt.addPanel()'>
        Test
    </div>

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
    <ViewLog/>

    <div style='display: none' id='logMessage' class='popup'>
      <div id='logMessageText' class="alert-box success">
      </div>
    </div>

    <ConfirmModal/>

    <div id='testArea'>
      <ul class="nav nav-tabs">
      </ul>
    </div>

  </div>
</template>

<script>

import ViewApps from '@/components/ViewApps.vue'
import ViewLog from '@/components/ViewLog.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
// import ViewSessionParticipants from '@/components/ViewSessionParticipants.vue'

import '@/webcomps/MainMenu.js'
import '@/webcomps/ViewHome.js'
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
import '@/webcomps/ViewSessionSettings.js'
import '@/webcomps/ViewSessionTabs.js'

import '@/webcomps/Model.js'
import '@/webcomps/circularjson.js'





import '@/webcomps/ViewAppPreview.js'


export default {
  name: 'home',
  components: {
    ViewApps,
    ViewLog,
    ConfirmModal,
  }
}
</script>
